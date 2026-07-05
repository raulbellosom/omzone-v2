import { useState, useEffect, useCallback } from "react";
import { functions } from "@/lib/appwrite";
import env from "@/config/env";

const ROOT_LABEL = "root";

function stripRoot(users) {
  return (users || []).filter((u) => !(u.labels || []).includes(ROOT_LABEL));
}

async function callAssignLabelFunction(payload) {
  const execution = await functions.createExecution(
    env.functionAssignLabel,
    JSON.stringify(payload),
    false,
    "/",
    "POST",
  );

  let parsed;
  try {
    parsed = JSON.parse(execution.responseBody || "{}");
  } catch {
    throw new Error("Respuesta inválida del servidor");
  }

  if (!parsed.ok) {
    throw new Error(parsed.error?.message || "Error desconocido");
  }

  return parsed.data;
}

/**
 * Root-only hook for listing Appwrite Auth users (never root) and
 * assigning/removing admin, operator, and client labels on them.
 */
export function useAdminUsers({ search = "" } = {}) {
  const [data, setData] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callAssignLabelFunction({
        action: "list-users",
        search,
      });
      setData(stripRoot(result.users));
      setCursor(result.nextCursor ?? null);
      setHasMore(!!result.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const result = await callAssignLabelFunction({
        action: "list-users",
        search,
        cursor,
      });
      setData((prev) => [...prev, ...stripRoot(result.users)]);
      setCursor(result.nextCursor ?? null);
      setHasMore(!!result.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [search, cursor, hasMore, loadingMore]);

  const assignLabel = useCallback(
    async (userId, label) => {
      await callAssignLabelFunction({ targetUserId: userId, label });
      await fetchFirstPage();
    },
    [fetchFirstPage],
  );

  const removeLabel = useCallback(
    async (userId, label) => {
      await callAssignLabelFunction({
        targetUserId: userId,
        label,
        remove: true,
      });
      await fetchFirstPage();
    },
    [fetchFirstPage],
  );

  return {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    assignLabel,
    removeLabel,
    refetch: fetchFirstPage,
  };
}
