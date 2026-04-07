import { useState, useEffect, useCallback } from "react";
import { databases, Query, ID } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL = env.collectionPricingTiers;

export function usePricingTiers(experienceId) {
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

export async function createPricingTier(payload) {
  return databases.createDocument(DB, COL, ID.unique(), payload);
}

export async function updatePricingTier(id, payload) {
  return databases.updateDocument(DB, COL, id, payload);
}

export async function swapTierOrder(tierA, tierB) {
  const orderA = tierA.sortOrder ?? 0;
  const orderB = tierB.sortOrder ?? 0;
  await Promise.all([
    databases.updateDocument(DB, COL, tierA.$id, { sortOrder: orderB }),
    databases.updateDocument(DB, COL, tierB.$id, { sortOrder: orderA }),
  ]);
}

export async function reorderTiers(tiers) {
  await Promise.all(
    tiers.map((t, i) =>
      databases.updateDocument(DB, COL, t.$id, { sortOrder: i }),
    ),
  );
}
