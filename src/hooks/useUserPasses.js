import { useState, useEffect, useCallback } from "react";
import { databases, Query } from "@/lib/appwrite";
import env from "@/config/env";

import { useLanguage } from "@/hooks/useLanguage";
import { getErrorMessage } from "@/lib/errors";

const DB = env.appwriteDatabaseId;
const COL = env.collectionUserPasses;

export function useUserPasses({
  userId = "",
  passId = "",
  status = "",
  includeArchived = false,
  includePersonalArchived = false,
  limit = 50,
  offset = 0,
} = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { t } = useLanguage();
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc("$createdAt"),
      ];
      if (!includeArchived) queries.push(Query.isNull("archivedAt"));
      if (!includePersonalArchived) {
        queries.push(Query.isNull("userArchivedAt"));
      }
      if (userId) queries.push(Query.equal("userId", userId));
      if (passId) queries.push(Query.equal("passId", passId));
      if (status) queries.push(Query.equal("status", status));

      const res = await databases.listDocuments(DB, COL, queries);
      setData(res.documents);
      setTotal(res.total);
    } catch (err) {
      setError(getErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [
    userId,
    passId,
    status,
    includeArchived,
    includePersonalArchived,
    limit,
    offset,
  ]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, total, loading, error, refetch: fetch };
}

export function useUserPass(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { t } = useLanguage();
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    databases
      .getDocument(DB, COL, id)
      .then(setData)
      .catch((err) => setError(getErrorMessage(err, t)))
      .finally(() => setLoading(false));
  }, [id]);

  return {
    data,
    loading,
    error,
    refetch: () => {
      if (!id) return;
      setLoading(true);
      databases
        .getDocument(DB, COL, id)
        .then(setData)
        .catch((err) => setError(getErrorMessage(err, t)))
        .finally(() => setLoading(false));
    },
  };
}

export async function updateUserPass(id, payload) {
  return databases.updateDocument(DB, COL, id, payload);
}
