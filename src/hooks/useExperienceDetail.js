import { useState, useEffect } from "react";
import { databases, storage, Query } from "@/lib/appwrite";
import env from "@/config/env";

const DB  = env.appwriteDatabaseId;
const BUCKET = env.bucketExperienceMedia;

export function getPreviewUrl(fileId, { width = 1200, height = 800 } = {}) {
  if (!fileId) return null;
  return storage.getFilePreview(BUCKET, fileId, width, height);
}

/**
 * Fetch an experience by slug + all related public data in parallel.
 * Returns: { experience, pricingTiers, slots, addons, publication, sections, loading, error }
 */
export function useExperienceDetail(slug) {
  const [state, setState] = useState({
    experience: null,
    pricingTiers: [],
    slots: [],
    addons: [],
    publication: null,
    sections: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        // 1. Fetch experience by slug (published only)
        const expRes = await databases.listDocuments(DB, env.collectionExperiences, [
          Query.equal("slug", slug),
          Query.equal("status", "published"),
          Query.limit(1),
        ]);

        if (expRes.total === 0) {
          if (!cancelled) setState((s) => ({ ...s, loading: false, error: "not_found" }));
          return;
        }

        const experience = expRes.documents[0];
        const expId = experience.$id;
        const now = new Date().toISOString();

        // 2. Parallel fetches
        const [tiersRes, slotsRes, assignmentsRes, pubRes] = await Promise.allSettled([
          databases.listDocuments(DB, env.collectionPricingTiers, [
            Query.equal("experienceId", expId),
            Query.equal("isActive", true),
            Query.orderAsc("sortOrder"),
            Query.limit(50),
          ]),
          databases.listDocuments(DB, env.collectionSlots, [
            Query.equal("experienceId", expId),
            Query.equal("status", "available"),
            Query.greaterThan("startDatetime", now),
            Query.orderAsc("startDatetime"),
            Query.limit(20),
          ]),
          databases.listDocuments(DB, env.collectionAddonAssignments, [
            Query.equal("experienceId", expId),
            Query.orderAsc("sortOrder"),
            Query.limit(50),
          ]),
          databases.listDocuments(DB, env.collectionPublications, [
            Query.equal("experienceId", expId),
            Query.equal("status", "published"),
            Query.limit(1),
          ]),
        ]);

        const pricingTiers = tiersRes.status === "fulfilled" ? tiersRes.value.documents : [];
        const slots = slotsRes.status === "fulfilled" ? slotsRes.value.documents : [];
        const assignments = assignmentsRes.status === "fulfilled" ? assignmentsRes.value.documents : [];
        const publication = pubRes.status === "fulfilled" && pubRes.value.total > 0
          ? pubRes.value.documents[0]
          : null;

        // 3. Fetch addons by IDs from assignments
        let addons = [];
        if (assignments.length > 0) {
          const addonIds = assignments.map((a) => a.addonId).filter(Boolean);
          if (addonIds.length > 0) {
            try {
              const addonsRes = await databases.listDocuments(DB, env.collectionAddons, [
                Query.equal("$id", addonIds),
                Query.equal("status", "active"),
                Query.limit(50),
              ]);
              addons = addonsRes.documents;
            } catch {
              // non-fatal
            }
          }
        }

        // 4. Fetch publication sections
        let sections = [];
        if (publication) {
          try {
            const sectionsRes = await databases.listDocuments(DB, env.collectionSections, [
              Query.equal("publicationId", publication.$id),
              Query.equal("isVisible", true),
              Query.orderAsc("sortOrder"),
              Query.limit(50),
            ]);
            sections = sectionsRes.documents;
          } catch {
            // non-fatal — render without sections
          }
        }

        if (!cancelled) {
          setState({ experience, pricingTiers, slots, addons, publication, sections, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: err.message }));
      }
    }

    load();
    return () => { cancelled = true; };
  }, [slug]);

  return state;
}
