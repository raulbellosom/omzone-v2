import { useState, useCallback } from "react";
import { databases, Query } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL = env.collectionUserProfiles;

/**
 * useCustomerSearch — search user_profiles by email for the assisted sale wizard.
 *
 * @returns {{ results, loading, error, search, reset }}
 */
export function useCustomerSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query) => {
    const q = (query || "").trim();
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Route search based on input type
      let searchQuery;
      if (q.includes("@")) {
        searchQuery = Query.search("email", q);
      } else {
        searchQuery = Query.search("displayName", q);
      }
      const res = await databases.listDocuments(DB, COL, [
        searchQuery,
        Query.limit(10),
      ]);
      setResults(res.documents);
    } catch (err) {
      setError(err?.message ?? "Error al buscar clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, loading, error, search, reset };
}
