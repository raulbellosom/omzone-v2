import { useState, useEffect, useCallback } from "react";
import { databases, Query, ID } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL = env.collectionPassConsumptions;

export function usePassConsumptions({
  userPassId = "",
  limit = 50,
  offset = 0,
} = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!userPassId) {
      setData([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.equal("userPassId", userPassId),
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc("consumedAt"),
      ];
      const res = await databases.listDocuments(DB, COL, queries);
      setData(res.documents);
      setTotal(res.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userPassId, limit, offset]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, total, loading, error, refetch: fetch };
}

export async function createConsumption(payload) {
  return databases.createDocument(DB, COL, ID.unique(), payload);
}
