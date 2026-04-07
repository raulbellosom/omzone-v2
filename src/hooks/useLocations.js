import { useState, useEffect, useCallback } from "react";
import { databases, Query, ID } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL = env.collectionLocations;

/** Admin list — all locations, optional activeOnly filter */
export function useLocations({ activeOnly = false, limit = 100, offset = 0 } = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queries = [Query.limit(limit), Query.offset(offset), Query.orderAsc("name")];
      if (activeOnly) queries.push(Query.equal("isActive", true));
      const res = await databases.listDocuments(DB, COL, queries);
      setData(res.documents);
      setTotal(res.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeOnly, limit, offset]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, total, loading, error, refetch: fetch };
}

export function useLocation(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    databases.getDocument(DB, COL, id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}

export async function createLocation(payload) {
  return databases.createDocument(DB, COL, ID.unique(), payload);
}

export async function updateLocation(id, payload) {
  return databases.updateDocument(DB, COL, id, payload);
}
