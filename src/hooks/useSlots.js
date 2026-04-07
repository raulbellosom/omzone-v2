import { useState, useEffect, useCallback } from "react";
import { databases, Query, ID } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL = env.collectionSlots;

export function useSlots(
  experienceId,
  { status = "", dateFrom = "", dateTo = "" } = {},
) {
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
        Query.orderAsc("startDatetime"),
        Query.limit(200),
      ];
      if (status) queries.push(Query.equal("status", status));
      if (dateFrom)
        queries.push(Query.greaterThanEqual("startDatetime", dateFrom));
      if (dateTo) queries.push(Query.lessThanEqual("startDatetime", dateTo));

      const res = await databases.listDocuments(DB, COL, queries);
      setData(res.documents);
      setTotal(res.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [experienceId, status, dateFrom, dateTo]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, total, loading, error, refetch: fetch };
}

export function useAllSlots({
  status = "",
  dateFrom = "",
  dateTo = "",
  experienceId = "",
} = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queries = [Query.orderAsc("startDatetime"), Query.limit(200)];
      if (experienceId) queries.push(Query.equal("experienceId", experienceId));
      if (status) queries.push(Query.equal("status", status));
      if (dateFrom)
        queries.push(Query.greaterThanEqual("startDatetime", dateFrom));
      if (dateTo) queries.push(Query.lessThanEqual("startDatetime", dateTo));

      const res = await databases.listDocuments(DB, COL, queries);
      setData(res.documents);
      setTotal(res.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [experienceId, status, dateFrom, dateTo]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, total, loading, error, refetch: fetch };
}

export function useSlot(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    databases
      .getDocument(DB, COL, id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}

export async function createSlot(payload) {
  return databases.createDocument(DB, COL, ID.unique(), {
    ...payload,
    bookedCount: 0,
  });
}

export async function updateSlot(id, payload) {
  return databases.updateDocument(DB, COL, id, payload);
}

export async function cancelSlot(id) {
  return databases.updateDocument(DB, COL, id, { status: "cancelled" });
}
