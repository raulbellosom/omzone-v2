import { useState, useEffect, useCallback } from "react";
import { databases, Query } from "@/lib/appwrite";
import { useAuth } from "@/hooks/useAuth";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL_TICKETS = env.collectionTickets;

/**
 * Lists tickets for the authenticated user with optional status filter.
 */
export function useUserTickets({
  status = "",
  includePersonalArchived = false,
} = {}) {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!user?.$id) return;

    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.equal("userId", user.$id),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
        // Exclude admin-archived always
        Query.isNull("archivedAt"),
      ];
      // Personal archive filter
      if (!includePersonalArchived) {
        queries.push(Query.isNull("userArchivedAt"));
      } else {
        queries.push(Query.isNotNull("userArchivedAt"));
      }
      if (status) {
        queries.push(Query.equal("status", status));
      }

      const res = await databases.listDocuments(DB, COL_TICKETS, queries);
      setData(res.documents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.$id, status, includePersonalArchived]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
