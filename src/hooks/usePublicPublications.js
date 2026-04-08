import { useState, useEffect, useCallback } from "react";
import { databases, storage, Query } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL = env.collectionPublications;
const BUCKET = env.bucketPublicationMedia;

export function getPublicationThumbnailUrl(
  fileId,
  { width = 800, height = 600 } = {},
) {
  if (!fileId) return null;
  return storage.getFilePreview(BUCKET, fileId, width, height);
}

export function usePublicPublications() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await databases.listDocuments(DB, COL, [
        Query.equal("status", "published"),
        Query.orderDesc("publishedAt"),
        Query.limit(50),
      ]);
      setPublications(res.documents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { publications, loading, error, refetch: fetch };
}
