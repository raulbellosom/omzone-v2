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

function monthRange() {
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

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState({
    ordersMonth: 0,
    revenueMonth: 0,
    activeTickets: 0,
    upcomingSlots: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      setLoading(true);
      const { start } = monthRange();
      const now = new Date().toISOString();

      try {
        const [ordersRes, ticketsRes, slotsRes, requestsRes] =
          await Promise.all([
            // Orders this month (paid/confirmed) — up to 100 to aggregate
            databases.listDocuments(DB, COL_ORDERS, [
              Query.greaterThanEqual("$createdAt", start),
              Query.lessThanEqual("$createdAt", now),
              Query.limit(100),
            ]),
            // Active tickets
            databases.listDocuments(DB, COL_TICKETS, [
              Query.equal("status", "valid"),
              Query.limit(1),
            ]),
            // Upcoming slots (7 days)
            databases.listDocuments(DB, COL_SLOTS, [
              Query.greaterThanEqual("startDatetime", now),
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
        const revenue = paidOrders.reduce(
          (sum, o) => sum + (o.totalAmount || 0),
          0,
        );

        setMetrics({
          ordersMonth: paidOrders.length,
          revenueMonth: revenue,
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
  }, []);

  return { metrics, loading };
}

// ─── Recent orders hook ───────────────────────────────────────────────────────

export function useRecentOrders(limit = 10) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    databases
      .listDocuments(DB, COL_ORDERS, [
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ])
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
  }, [limit]);

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
