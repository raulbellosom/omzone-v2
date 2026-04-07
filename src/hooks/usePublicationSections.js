import { useState, useEffect, useCallback } from "react";
import { databases, Query, ID } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL = env.collectionSections;

export function usePublicationSections(publicationId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!publicationId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await databases.listDocuments(DB, COL, [
        Query.equal("publicationId", publicationId),
        Query.orderAsc("sortOrder"),
        Query.limit(100),
      ]);
      setData(res.documents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [publicationId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export async function createSection(payload) {
  return databases.createDocument(DB, COL, ID.unique(), payload);
}

export async function updateSection(id, payload) {
  return databases.updateDocument(DB, COL, id, payload);
}

export async function deleteSection(id) {
  return databases.deleteDocument(DB, COL, id);
}

export async function reorderSections(sections) {
  const promises = sections.map((s, i) =>
    databases.updateDocument(DB, COL, s.$id, { sortOrder: i })
  );
  await Promise.all(promises);
}
