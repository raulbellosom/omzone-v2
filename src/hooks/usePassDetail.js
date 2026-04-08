import { useState, useEffect } from "react";
import { databases, storage, Query } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const BUCKET = env.bucketExperienceMedia;

export function getPassPreviewUrl(fileId, { width = 1200, height = 800 } = {}) {
  if (!fileId) return null;
  return storage.getFilePreview(BUCKET, fileId, width, height);
}

/**
 * Fetch a single active pass by slug + resolve eligible experience names.
 */
export function usePassDetail(slug) {
  const [state, setState] = useState({
    pass: null,
    experiences: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        const passRes = await databases.listDocuments(
          DB,
          env.collectionPasses,
          [
            Query.equal("slug", slug),
            Query.equal("status", "active"),
            Query.limit(1),
          ],
        );

        if (passRes.total === 0) {
          if (!cancelled)
            setState((s) => ({ ...s, loading: false, error: "not_found" }));
          return;
        }

        const pass = passRes.documents[0];

        // Parse validExperienceIds JSON → resolve experience names
        let experiences = [];
        if (pass.validExperienceIds) {
          try {
            const ids = JSON.parse(pass.validExperienceIds);
            if (Array.isArray(ids) && ids.length > 0) {
              const expRes = await databases.listDocuments(
                DB,
                env.collectionExperiences,
                [Query.equal("$id", ids), Query.limit(50)],
              );
              experiences = expRes.documents;
            }
          } catch {
            // invalid JSON — skip
          }
        }

        if (!cancelled) {
          setState({ pass, experiences, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false, error: err.message }));
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}
