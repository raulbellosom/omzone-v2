import { useState, useEffect, useCallback } from "react";
import { databases, Query, ID } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL = env.collectionAddons;

function slugify(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export { slugify };

export function useAddons({
  search = "",
  addonType = "",
  status = "",
  limit = 50,
  offset = 0,
} = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderAsc("sortOrder"),
      ];
      if (addonType) queries.push(Query.equal("addonType", addonType));
      if (status) queries.push(Query.equal("status", status));
      if (search) queries.push(Query.search("name", search));

      const res = await databases.listDocuments(DB, COL, queries);
      setData(res.documents);
      setTotal(res.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, addonType, status, limit, offset]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, total, loading, error, refetch: fetch };
}

export function useAddon(id) {
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

export async function createAddon(payload) {
  return databases.createDocument(DB, COL, ID.unique(), payload);
}

export async function updateAddon(id, payload) {
  return databases.updateDocument(DB, COL, id, payload);
}

export async function checkAddonSlugAvailable(slug, excludeId = null) {
  const queries = [Query.equal("slug", slug)];
  const res = await databases.listDocuments(DB, COL, queries);
  if (res.total === 0) return true;
  if (excludeId && res.documents[0]?.$id === excludeId) return true;
  return false;
}
