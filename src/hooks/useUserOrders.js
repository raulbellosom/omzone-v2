import { useState, useEffect, useCallback } from "react";
import { databases, Query } from "@/lib/appwrite";
import { useAuth } from "@/hooks/useAuth";
import env from "@/config/env";

import { useLanguage } from "@/hooks/useLanguage";
import { getErrorMessage } from "@/lib/errors";

const DB = env.appwriteDatabaseId;
const COL = env.collectionOrders;

/**
 * Lists orders for the authenticated user with optional status filter.
 * Supports load-more pagination.
 */
export function useUserOrders({
  status = "",
  includePersonalArchived = false,
  limit = 25,
} = {}) {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const { t } = useLanguage();
  const fetch = useCallback(
    async (offset = 0, append = false) => {
      if (!user?.$id) return;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const queries = [
          Query.equal("userId", user.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(limit),
          Query.offset(offset),
          // Exclude admin-archived always
          Query.isNull("archivedAt"),
        ];
        // Personal archive filter
        if (!includePersonalArchived) {
          queries.push(Query.isNull("userArchivedAt"));
        } else {
          queries.push(Query.isNotNull("userArchivedAt"));
        }
        if (status) queries.push(Query.equal("status", status));

        const res = await databases.listDocuments(DB, COL, queries);

        if (append) {
          setData((prev) => [...prev, ...res.documents]);
        } else {
          setData(res.documents);
        }
        setTotal(res.total);
      } catch (err) {
        setError(getErrorMessage(err, t));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user?.$id, status, includePersonalArchived, limit],
  );

  useEffect(() => {
    fetch(0, false);
  }, [fetch]);

  const loadMore = useCallback(() => {
    fetch(data.length, true);
  }, [fetch, data.length]);

  const hasMore = data.length < total;

  return {
    data,
    total,
    loading,
    loadingMore,
    error,
    refetch: () => fetch(0, false),
    loadMore,
    hasMore,
  };
}
