import { useState, useEffect, useCallback } from "react";
import { databases, Query, ID } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL = env.collectionAddonAssignments;

export function useAddonAssignments(experienceId) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!experienceId) return;
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.equal("experienceId", experienceId),
        Query.orderAsc("sortOrder"),
        Query.limit(100),
      ];
      const res = await databases.listDocuments(DB, COL, queries);
      setData(res.documents);
      setTotal(res.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [experienceId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, total, loading, error, refetch: fetch };
}

export async function createAddonAssignment(payload) {
  return databases.createDocument(DB, COL, ID.unique(), payload);
}

export async function updateAddonAssignment(id, payload) {
  return databases.updateDocument(DB, COL, id, payload);
}

export async function deleteAddonAssignment(id) {
  return databases.deleteDocument(DB, COL, id);
}
