import { useState, useEffect, useCallback } from "react";
import { databases, Query, ID } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL = env.collectionSlotResources;

export function useSlotResources(slotId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!slotId) return;
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.equal("slotId", slotId),
        Query.limit(50),
      ];
      const res = await databases.listDocuments(DB, COL, queries);
      setData(res.documents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [slotId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export async function createSlotResource(payload) {
  return databases.createDocument(DB, COL, ID.unique(), payload);
}

export async function deleteSlotResource(id) {
  return databases.deleteDocument(DB, COL, id);
}
