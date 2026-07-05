import { useState, useEffect, useCallback } from "react";
import { databases, Query, ID } from "@/lib/appwrite";
import env from "@/config/env";

import { useLanguage } from "@/hooks/useLanguage";
import { getErrorMessage } from "@/lib/errors";

const DB = env.appwriteDatabaseId;
const COL = env.collectionEditions;

export function useEditions(
  experienceId,
  { includeArchived = false, onlyArchived = false } = {},
) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { t } = useLanguage();
  const fetch = useCallback(async () => {
    if (!experienceId) return;
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.equal("experienceId", experienceId),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ];
      if (onlyArchived) {
        queries.push(Query.isNotNull("archivedAt"));
      } else if (!includeArchived) {
        queries.push(Query.isNull("archivedAt"));
      }
      const res = await databases.listDocuments(DB, COL, queries);
      setData(res.documents);
      setTotal(res.total);
    } catch (err) {
      setError(getErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [experienceId, includeArchived, onlyArchived]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, total, loading, error, refetch: fetch };
}

export function useEdition(id) {
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

  return { data, loading, error };
}

export async function createEdition(payload) {
  return databases.createDocument(DB, COL, ID.unique(), payload);
}

export async function updateEdition(id, payload) {
  return databases.updateDocument(DB, COL, id, payload);
}

/**
 * Public-facing hook: returns editions visible to clients on the
 * experience detail page. Filters to `status="open"` and
 * non-archived. Sorted by `startDate` ascending (nulls last).
 */
export function usePublicEditions(experienceId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { t } = useLanguage();
  useEffect(() => {
    if (!experienceId) {
      setData([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    databases
      .listDocuments(DB, COL, [
        Query.equal("experienceId", experienceId),
        Query.equal("status", "open"),
        Query.isNull("archivedAt"),
        Query.orderAsc("startDate"),
        Query.limit(50),
      ])
      .then((res) => {
        if (!cancelled) setData(res.documents);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, t));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [experienceId]);

  return { data, loading, error };
}
