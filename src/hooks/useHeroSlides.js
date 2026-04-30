import { useState, useEffect, useCallback } from "react";
import { databases, Query, ID } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL = env.collectionHeroSlides;

/**
 * Public hook — returns visible slides within their schedule window,
 * ordered by sortOrder ASC. Used by the home hero section.
 */
export function useHeroSlides() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await databases.listDocuments(DB, COL, [
        Query.equal("isVisible", true),
        Query.orderAsc("sortOrder"),
        Query.limit(50),
      ]);
      const now = Date.now();
      const filtered = res.documents.filter((s) => {
        if (s.startsAt && new Date(s.startsAt).getTime() > now) return false;
        if (s.endsAt && new Date(s.endsAt).getTime() < now) return false;
        return true;
      });
      setData(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Admin hook — returns all slides (no filters), ordered by sortOrder ASC.
 */
export function useAdminHeroSlides() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await databases.listDocuments(DB, COL, [
        Query.orderAsc("sortOrder"),
        Query.limit(100),
      ]);
      setData(res.documents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export async function createHeroSlide(payload) {
  return databases.createDocument(DB, COL, ID.unique(), payload);
}

export async function updateHeroSlide(id, payload) {
  return databases.updateDocument(DB, COL, id, payload);
}

export async function deleteHeroSlide(id) {
  return databases.deleteDocument(DB, COL, id);
}

export async function reorderHeroSlides(slides) {
  const promises = slides.map((s, i) =>
    databases.updateDocument(DB, COL, s.$id, { sortOrder: i }),
  );
  await Promise.all(promises);
}
