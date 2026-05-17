import { useState, useEffect } from "react";
import { databases, Query } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL_ORDERS = env.collectionOrders;
const COL_TICKETS = env.collectionTickets;
const COL_SLOTS = env.collectionSlots;
const COL_BOOKING_REQUESTS = env.collectionBookingRequests;
const COL_EXPERIENCES = env.collectionExperiences;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function monthRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  return { start: start.toISOString(), end: now.toISOString() };
}

function weekAheadISO() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString();
}

// ─── Metric cards hook ────────────────────────────────────────────────────────

export function useDashboardMetrics(dateRange) {
  const defaultRange = monthRange();
  const rangeStart = dateRange?.start ?? defaultRange.start;
  const rangeEnd = dateRange?.end ?? defaultRange.end;

  const [metrics, setMetrics] = useState({
    ordersCount: 0,
    revenuesByCurrency: {},
    activeTickets: 0,
    upcomingSlots: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      setLoading(true);

      try {
        const [ordersRes, ticketsRes, slotsRes, requestsRes] =
          await Promise.all([
            // Orders in selected range — up to 500 to aggregate
            databases.listDocuments(DB, COL_ORDERS, [
              Query.greaterThanEqual("$createdAt", rangeStart),
              Query.lessThanEqual("$createdAt", rangeEnd),
              Query.limit(500),
            ]),
            // Active tickets
            databases.listDocuments(DB, COL_TICKETS, [
              Query.equal("status", "valid"),
              Query.limit(1),
            ]),
            // Upcoming slots (7 days ahead from now — independent of dateRange)
            databases.listDocuments(DB, COL_SLOTS, [
              Query.greaterThanEqual("startDatetime", new Date().toISOString()),
              Query.lessThanEqual("startDatetime", weekAheadISO()),
              Query.equal("status", "published"),
              Query.limit(1),
            ]),
            // Pending booking requests
            databases.listDocuments(DB, COL_BOOKING_REQUESTS, [
              Query.equal("status", "pending"),
              Query.limit(1),
            ]),
          ]);

        if (cancelled) return;

        // Filter for paid/confirmed
        const paidOrders = ordersRes.documents.filter(
          (o) => o.status === "paid" || o.status === "confirmed",
        );

        // Group revenue by currency
        const revenuesByCurrency = paidOrders.reduce((acc, o) => {
          const cur = (o.currency || "MXN").toUpperCase();
          acc[cur] = (acc[cur] || 0) + (o.totalAmount || 0);
          return acc;
        }, {});

        setMetrics({
          ordersCount: paidOrders.length,
          revenuesByCurrency,
          activeTickets: ticketsRes.total,
          upcomingSlots: slotsRes.total,
          pendingRequests: requestsRes.total,
        });
      } catch {
        // leave defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => {
      cancelled = true;
    };
  }, [rangeStart, rangeEnd]);

  return { metrics, loading };
}

// ─── Recent orders hook ───────────────────────────────────────────────────────

export function useRecentOrders(limit = 10, dateRange) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const queries = [Query.orderDesc("$createdAt"), Query.limit(limit)];
    if (dateRange?.start) {
      queries.push(Query.greaterThanEqual("$createdAt", dateRange.start));
    }
    if (dateRange?.end) {
      queries.push(Query.lessThanEqual("$createdAt", dateRange.end));
    }
    databases
      .listDocuments(DB, COL_ORDERS, queries)
      .then((res) => {
        if (!cancelled) setOrders(res.documents);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [limit, dateRange?.start, dateRange?.end]);

  return { orders, loading };
}

// ─── Upcoming slots hook ──────────────────────────────────────────────────────

export function useUpcomingSlots(limit = 5) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      try {
        const now = new Date().toISOString();
        const res = await databases.listDocuments(DB, COL_SLOTS, [
          Query.greaterThanEqual("startDatetime", now),
          Query.lessThanEqual("startDatetime", weekAheadISO()),
          Query.equal("status", "published"),
          Query.orderAsc("startDatetime"),
          Query.limit(limit),
        ]);

        if (cancelled) return;

        // Enrich with experience names
        const expIds = [...new Set(res.documents.map((s) => s.experienceId))];
        const expMap = {};
        await Promise.all(
          expIds.map(async (id) => {
            try {
              const exp = await databases.getDocument(DB, COL_EXPERIENCES, id);
              expMap[id] = exp.publicName;
            } catch {
              expMap[id] = "—";
            }
          }),
        );

        setSlots(
          res.documents.map((s) => ({
            ...s,
            experienceName: expMap[s.experienceId] || "—",
          })),
        );
      } catch {
        // leave empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { slots, loading };
}
