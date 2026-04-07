import { useState, useEffect, useCallback } from "react";
import { databases, Query } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL = env.collectionNotificationTemplates;

export function useNotificationTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await databases.listDocuments(DB, COL, [
        Query.orderAsc("key"),
        Query.limit(100),
      ]);
      setTemplates(res.documents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateTemplate = useCallback(async (documentId, data) => {
    await databases.updateDocument(DB, COL, documentId, data);
    await fetch();
  }, [fetch]);

  return { templates, loading, error, refetch: fetch, updateTemplate };
}
