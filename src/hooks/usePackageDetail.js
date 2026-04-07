import { useState, useEffect } from "react";
import { databases, storage, Query } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const BUCKET = env.bucketPackageImages;

export function getPackagePreviewUrl(fileId, { width = 1200, height = 800 } = {}) {
  if (!fileId) return null;
  return storage.getFilePreview(BUCKET, fileId, width, height);
}

/**
 * Fetch a package by slug + its items and resolve included experience names.
 * Returns: { pkg, items, experiences, galleryImageIds, loading, error }
 */
export function usePackageDetail(slug) {
  const [state, setState] = useState({
    pkg: null,
    items: [],
    experiences: [],
    galleryImageIds: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        // 1. Fetch package by slug (published only)
        const pkgRes = await databases.listDocuments(DB, env.collectionPackages, [
          Query.equal("slug", slug),
          Query.equal("status", "published"),
          Query.limit(1),
        ]);

        if (pkgRes.total === 0) {
          if (!cancelled) setState((s) => ({ ...s, loading: false, error: "not_found" }));
          return;
        }

        const pkg = pkgRes.documents[0];

        // 2. Fetch package items
        const itemsRes = await databases.listDocuments(DB, env.collectionPackageItems, [
          Query.equal("packageId", pkg.$id),
          Query.orderAsc("sortOrder"),
          Query.limit(50),
        ]);
        const items = itemsRes.documents;

        // 3. Resolve experience names for items that reference experiences
        const experienceIds = items
          .filter((it) => it.referenceType === "experience" && it.referenceId)
          .map((it) => it.referenceId);

        let experiences = [];
        if (experienceIds.length > 0) {
          try {
            const expRes = await databases.listDocuments(DB, env.collectionExperiences, [
              Query.equal("$id", experienceIds),
              Query.limit(50),
            ]);
            experiences = expRes.documents;
          } catch {
            // non-fatal
          }
        }

        // 4. Parse gallery image IDs
        let galleryImageIds = [];
        if (pkg.galleryImageIds) {
          try {
            const parsed = JSON.parse(pkg.galleryImageIds);
            if (Array.isArray(parsed)) galleryImageIds = parsed.filter(Boolean);
          } catch {
            // invalid JSON — skip gallery
          }
        }

        if (!cancelled) {
          setState({ pkg, items, experiences, galleryImageIds, loading: false, error: null });
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
