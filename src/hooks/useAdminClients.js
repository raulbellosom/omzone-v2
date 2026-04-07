import { useState, useEffect, useCallback } from "react";
import { databases, Query } from "@/lib/appwrite";
import env from "@/config/env";
import { useAuth } from "@/hooks/useAuth";
import { excludeGhostUsers } from "@/constants/roles";

const DB = env.appwriteDatabaseId;
const COL_PROFILES = env.collectionUserProfiles;
const COL_ORDERS = env.collectionOrders;
const COL_TICKETS = env.collectionTickets;
const COL_USER_PASSES = env.collectionUserPasses;

// ─── List Hook ───────────────────────────────────────────────────────────────

export function useAdminClients({
  search = "",
  limit = 25,
  offset = 0,
} = {}) {
  const { labels: viewerLabels } = useAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc("$createdAt"),
      ];

      if (search) {
        queries.push(Query.contains("displayName", search));
      }

      const res = await databases.listDocuments(DB, COL_PROFILES, queries);
      const filtered = excludeGhostUsers(
        res.documents,
        viewerLabels,
        (item) => [item.role].filter(Boolean),
      );
      setData(filtered);
      setTotal(filtered.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, limit, offset, viewerLabels]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, total, loading, error, refetch: fetch };
}

// ─── Detail Hook ─────────────────────────────────────────────────────────────

export function useClientDetail(userId) {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [profileDoc, ordersRes, ticketsRes, passesRes] = await Promise.all([
        databases.getDocument(DB, COL_PROFILES, userId),
        databases.listDocuments(DB, COL_ORDERS, [
          Query.equal("userId", userId),
          Query.orderDesc("$createdAt"),
          Query.limit(50),
        ]),
        databases.listDocuments(DB, COL_TICKETS, [
          Query.equal("userId", userId),
          Query.orderDesc("$createdAt"),
          Query.limit(50),
        ]),
        databases.listDocuments(DB, COL_USER_PASSES, [
          Query.equal("userId", userId),
          Query.orderDesc("$createdAt"),
          Query.limit(50),
        ]),
      ]);

      setProfile(profileDoc);
      setOrders(ordersRes.documents);
      setTickets(ticketsRes.documents);
      setPasses(passesRes.documents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { profile, orders, tickets, passes, loading, error, refetch: fetch };
}
