import { useState, useEffect, useCallback } from "react";
import { databases, storage, Query } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL = env.collectionPasses;
const BUCKET = env.bucketExperienceMedia;

export function getPassPreviewUrl(fileId, { width = 800, height = 600 } = {}) {
  if (!fileId) return null;
  return storage.getFilePreview(BUCKET, fileId, width, height);
}

export function usePublicPasses() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await databases.listDocuments(DB, COL, [
        Query.equal("status", "active"),
        Query.orderAsc("sortOrder"),
        Query.limit(50),
      ]);
      setPasses(res.documents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { passes, loading, error, refetch: fetch };
}
