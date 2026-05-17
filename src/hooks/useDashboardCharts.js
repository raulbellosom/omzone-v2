import { useState, useEffect, useMemo } from "react";
import { databases, Query } from "@/lib/appwrite";
import env from "@/config/env";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  format,
  differenceInDays,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  parseISO,
} from "date-fns";

const DB = env.appwriteDatabaseId;
const COL_ORDERS = env.collectionOrders;

// ─── Public helpers ────────────────────────────────────────────────────────────

/** Returns the best default granularity for a given date range */
export function getAutoGranularity(start, end) {
  const days = differenceInDays(new Date(end), new Date(start));
  if (days <= 14) return "day";
  if (days <= 90) return "week";
  return "month";
}

/** Returns the granularity options that make sense for the given date range */
export function getAvailableGranularities(start, end) {
  const days = differenceInDays(new Date(end), new Date(start));
  if (days <= 7) return ["day", "week"];
  if (days <= 90) return ["day", "week", "month"];
  return ["week", "month"];
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

// Build a zero-filled time series map from start→end
function buildBuckets(start, end, granularity) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (granularity === "month") {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    return Object.fromEntries(
      months.map((m) => [
        format(m, "yyyy-MM-01"),
        { date: format(m, "yyyy-MM-01") },
      ]),
    );
  }

  if (granularity === "week") {
    const weeks = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 },
    );
    return Object.fromEntries(
      weeks.map((w) => [
        format(w, "yyyy-MM-dd"),
        { date: format(w, "yyyy-MM-dd") },
      ]),
    );
  }

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return Object.fromEntries(
    days.map((d) => [
      format(d, "yyyy-MM-dd"),
      { date: format(d, "yyyy-MM-dd") },
    ]),
  );
}

function getBucketKey(dateStr, granularity) {
  const d = parseISO(dateStr);
  if (granularity === "month") {
    return format(startOfMonth(d), "yyyy-MM-01");
  }
  if (granularity === "week") {
    return format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
  }
  return format(startOfDay(d), "yyyy-MM-dd");
}

// Fetch all orders in range (paginated up to 5000)
async function fetchOrdersInRange(start, end) {
  const all = [];
  const pageSize = 1000;
  let offset = 0;

  while (true) {
    const res = await databases.listDocuments(DB, COL_ORDERS, [
      Query.greaterThanEqual("$createdAt", start),
      Query.lessThanEqual("$createdAt", end),
      Query.orderAsc("$createdAt"),
      Query.limit(pageSize),
      Query.offset(offset),
    ]);
    all.push(...res.documents);
    if (all.length >= res.total || res.documents.length < pageSize) break;
    offset += pageSize;
    if (offset >= 5000) break; // safety cap
  }

  return all;
}

export function useDashboardCharts(dateRange, granularity) {
  // rawOrders: null = not yet fetched for this range, [] = fetched but empty
  const [rawOrders, setRawOrders] = useState(null);
  const [loading, setLoading] = useState(true);

  const start = dateRange?.start;
  const end = dateRange?.end;
  const resolvedGranularity =
    granularity ?? (start && end ? getAutoGranularity(start, end) : "day");

  // ── Effect 1: fetch orders only when date range changes ───────────────────
  useEffect(() => {
    if (!start || !end) return;
    let cancelled = false;
    setLoading(true);
    setRawOrders(null);
    fetchOrdersInRange(start, end)
      .then((orders) => {
        if (!cancelled) {
          setRawOrders(orders);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRawOrders([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [start, end]);

  // ── Aggregation: runs instantly whenever rawOrders or granularity changes ─
  // Uses useMemo so granularity switches never trigger a loading state.
  const data = useMemo(() => {
    const empty = {
      revenueByDay: [],
      orderCountByDay: [],
      ordersByStatus: [],
      currencies: [],
    };
    if (!rawOrders || !start || !end) return empty;

    const orders = rawOrders;
    const gran = resolvedGranularity;

    // Detect currencies from paid/confirmed orders
    const currencySet = new Set(
      orders
        .filter((o) => o.status === "paid" || o.status === "confirmed")
        .map((o) => (o.currency || "MXN").toUpperCase()),
    );
    const currencies = [...currencySet].sort();

    // Build zero-filled buckets for the selected granularity
    const buckets = buildBuckets(start, end, gran);
    Object.values(buckets).forEach((b) => {
      currencies.forEach((c) => {
        b[c] = 0;
      });
      b.count = 0;
    });

    // Fill buckets from orders
    orders.forEach((o) => {
      const bucketKey = getBucketKey(o.$createdAt, gran);
      const bucket = buckets[bucketKey];
      if (!bucket) return;
      bucket.count += 1;
      if (o.status === "paid" || o.status === "confirmed") {
        const cur = (o.currency || "MXN").toUpperCase();
        if (currencies.includes(cur)) {
          bucket[cur] = (bucket[cur] || 0) + (o.totalAmount || 0);
        }
      }
    });

    const timeSeries = Object.values(buckets);

    // Orders by status aggregate
    const statusMap = orders.reduce((acc, o) => {
      const s = o.status || "unknown";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const ordersByStatus = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));

    return {
      revenueByDay: timeSeries,
      orderCountByDay: timeSeries,
      ordersByStatus,
      currencies,
    };
  }, [rawOrders, resolvedGranularity, start, end]);

  return { data, loading };
}
