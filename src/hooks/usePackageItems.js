import { useState, useEffect, useCallback } from "react";
import { databases, Query, ID } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL = env.collectionPackageItems;

export function usePackageItems(packageId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!packageId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.equal("packageId", packageId),
        Query.orderAsc("sortOrder"),
        Query.limit(100),
      ];
      const res = await databases.listDocuments(DB, COL, queries);
      setData(res.documents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export async function createPackageItem(payload) {
  return databases.createDocument(DB, COL, ID.unique(), payload);
}

export async function updatePackageItem(id, payload) {
  return databases.updateDocument(DB, COL, id, payload);
}

export async function deletePackageItem(id) {
  return databases.deleteDocument(DB, COL, id);
}
