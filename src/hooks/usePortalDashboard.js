import { useState, useEffect, useCallback } from "react";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import env from "@/config/env";
import { useAuth } from "@/hooks/useAuth";

const DB = env.appwriteDatabaseId;
const COL_TICKETS = env.collectionTickets;
const COL_USER_PASSES = env.collectionUserPasses;
const COL_ORDERS = env.collectionOrders;

/**
 * Aggregates dashboard data for the authenticated client:
 * - Active tickets count + upcoming 3 tickets (future slot dates)
 * - Active passes count (with remaining credits)
 * - Recent orders count
 */
export function usePortalDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    activeTickets: 0,
    upcomingTickets: [],
    activePasses: 0,
    recentOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!user?.$id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled([
        // Active tickets — status = valid (not used/cancelled)
        databases.listDocuments(DB, COL_TICKETS, [
          Query.equal("userId", user.$id),
          Query.equal("status", "valid"),
          Query.limit(100),
        ]),
        // Active user passes — status = active with credits > 0
        databases.listDocuments(DB, COL_USER_PASSES, [
          Query.equal("userId", user.$id),
          Query.equal("status", "active"),
          Query.limit(50),
        ]),
        // Recent orders count
        databases.listDocuments(DB, COL_ORDERS, [
          Query.equal("userId", user.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(1),
        ]),
      ]);

      const tickets =
        results[0].status === "fulfilled" ? results[0].value : null;
      const passes =
        results[1].status === "fulfilled" ? results[1].value : null;
      const orders =
        results[2].status === "fulfilled" ? results[2].value : null;

      // Parse upcoming from ticket snapshots — find those with future dates
      const now = new Date().toISOString();
      let upcomingTickets = [];
      if (tickets?.documents) {
        upcomingTickets = tickets.documents
          .map((t) => {
            let snapshot = {};
            try {
              snapshot =
                typeof t.ticketSnapshot === "string"
                  ? JSON.parse(t.ticketSnapshot)
                  : t.ticketSnapshot || {};
            } catch {
              /* ignore */
            }
            return { ...t, _snapshot: snapshot };
          })
          .filter((t) => {
            // Keep tickets for future slots
            const slotDate =
              t._snapshot.slotStartDatetime || t._snapshot.editionDate;
            return slotDate && slotDate > now;
          })
          .sort((a, b) => {
            const aDate =
              a._snapshot.slotStartDatetime || a._snapshot.editionDate || "";
            const bDate =
              b._snapshot.slotStartDatetime || b._snapshot.editionDate || "";
            return aDate.localeCompare(bDate);
          })
          .slice(0, 3);
      }

      setData({
        activeTickets: tickets?.total ?? 0,
        upcomingTickets,
        activePasses: passes?.total ?? 0,
        recentOrders: orders?.total ?? 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.$id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
