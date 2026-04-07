import { useState, useEffect, useCallback } from "react";
import { storage, Query } from "@/lib/appwrite";

const PAGE_SIZE = 24;

/**
 * useBucketFiles — lists files in an Appwrite Storage bucket.
 *
 * @param {string} bucketId
 * @param {{ search?: string }} options
 * @returns {{ files, loading, error, hasMore, loadMore, refresh }}
 */
export function useBucketFiles(bucketId, { search = "" } = {}) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cursor, setCursor] = useState(null); // last file $id for cursor pagination
  const [hasMore, setHasMore] = useState(false);
  const [generation, setGeneration] = useState(0); // bump to force refresh

  const refresh = useCallback(() => {
    setFiles([]);
    setCursor(null);
    setHasMore(false);
    setGeneration((g) => g + 1);
  }, []);

  // Initial load / reset when bucketId, search, or generation changes
  useEffect(() => {
    if (!bucketId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const queries = [Query.limit(PAGE_SIZE), Query.orderDesc("$createdAt")];
    if (search.trim()) queries.push(Query.search("name", search.trim()));

    storage
      .listFiles(bucketId, queries)
      .then((res) => {
        if (cancelled) return;
        setFiles(res.files);
        setHasMore(res.files.length === PAGE_SIZE);
        setCursor(res.files.length > 0 ? res.files[res.files.length - 1].$id : null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message ?? "Error al cargar archivos");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucketId, search, generation]);

  const loadMore = useCallback(async () => {
    if (!cursor || !hasMore || loading) return;
    setLoading(true);
    try {
      const queries = [
        Query.limit(PAGE_SIZE),
        Query.orderDesc("$createdAt"),
        Query.cursorAfter(cursor),
      ];
      if (search.trim()) queries.push(Query.search("name", search.trim()));
      const res = await storage.listFiles(bucketId, queries);
      setFiles((prev) => [...prev, ...res.files]);
      setHasMore(res.files.length === PAGE_SIZE);
      setCursor(res.files.length > 0 ? res.files[res.files.length - 1].$id : cursor);
    } catch (err) {
      setError(err?.message ?? "Error al cargar más archivos");
    } finally {
      setLoading(false);
    }
  }, [bucketId, cursor, hasMore, loading, search]);

  return { files, loading, error, hasMore, loadMore, refresh };
}
