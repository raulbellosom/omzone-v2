import { useState, useEffect, useCallback } from "react";
import { databases, Query } from "@/lib/appwrite";
import env from "@/config/env";

import { useLanguage } from "@/hooks/useLanguage";
import { getErrorMessage } from "@/lib/errors";

const DB = env.appwriteDatabaseId;
const COL = env.collectionNotificationTemplates;

export function useNotificationTemplates({ includeArchived = false } = {}) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { t } = useLanguage();
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queries = [Query.orderAsc("key"), Query.limit(100)];
      if (!includeArchived) queries.push(Query.isNull("archivedAt"));
      const res = await databases.listDocuments(DB, COL, queries);
      setTemplates(res.documents);
    } catch (err) {
      setError(getErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [includeArchived]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateTemplate = useCallback(
    async (documentId, data) => {
      await databases.updateDocument(DB, COL, documentId, data);
      await fetch();
    },
    [fetch],
  );

  return { templates, loading, error, refetch: fetch, updateTemplate };
}
