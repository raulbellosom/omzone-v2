import { useState, useEffect, useCallback } from "react";
import { databases, Query } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL = env.collectionSlots;

/**
 * Lists available slots for a given experienceId:
 * status = "published", startDatetime in the future, bookedCount < capacity.
 */
export function useValidSlots({ experienceId = "" } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!experienceId) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.equal("experienceId", experienceId),
        Query.equal("status", "published"),
        Query.greaterThan("startDatetime", new Date().toISOString()),
        Query.orderAsc("startDatetime"),
        Query.limit(50),
      ];

      const res = await databases.listDocuments(DB, COL, queries);

      // Client-side filter: only slots with remaining capacity
      const available = res.documents.filter(
        (s) => s.bookedCount < s.capacity,
      );
      setData(available);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [experienceId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
