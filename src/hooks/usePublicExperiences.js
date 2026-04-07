import { useState, useEffect, useCallback } from "react";
import { databases, Query } from "@/lib/appwrite";
import { storage } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL_EXP = env.collectionExperiences;
const COL_TIERS = env.collectionPricingTiers;
const COL_TAGS = env.collectionTags;
const COL_EXP_TAGS = env.collectionExperienceTags;
const BUCKET = env.bucketExperienceMedia;

export function getHeroPreviewUrl(fileId, { width = 800, height = 600 } = {}) {
  if (!fileId) return null;
  return storage.getFilePreview(BUCKET, fileId, width, height);
}

export function usePublicExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [tags, setTags] = useState([]);
  const [experienceTagMap, setExperienceTagMap] = useState({});
  const [priceMap, setPriceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expRes, tagsRes, expTagsRes, tiersRes] = await Promise.all([
        databases.listDocuments(DB, COL_EXP, [
          Query.equal("status", "published"),
          Query.orderDesc("$createdAt"),
          Query.limit(25),
        ]),
        databases.listDocuments(DB, COL_TAGS, [
          Query.orderAsc("sortOrder"),
          Query.limit(100),
        ]),
        databases.listDocuments(DB, COL_EXP_TAGS, [
          Query.limit(500),
        ]),
        databases.listDocuments(DB, COL_TIERS, [
          Query.equal("isActive", true),
          Query.limit(500),
        ]),
      ]);

      setExperiences(expRes.documents);
      setTags(tagsRes.documents);

      // Build experience → tagIds map
      const etMap = {};
      for (const rel of expTagsRes.documents) {
        if (!etMap[rel.experienceId]) etMap[rel.experienceId] = [];
        etMap[rel.experienceId].push(rel.tagId);
      }
      setExperienceTagMap(etMap);

      // Build experience → { minPrice, currency } map
      const pm = {};
      for (const tier of tiersRes.documents) {
        const eid = tier.experienceId;
        if (!pm[eid] || tier.basePrice < pm[eid].minPrice) {
          pm[eid] = { minPrice: tier.basePrice, currency: tier.currency || "MXN" };
        }
      }
      setPriceMap(pm);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { experiences, tags, experienceTagMap, priceMap, loading, error, refetch: fetch };
}
