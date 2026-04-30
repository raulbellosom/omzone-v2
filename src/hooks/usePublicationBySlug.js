import { useState, useEffect } from "react";
import { databases, storage, Query } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const PUB_BUCKET = env.bucketPublicationMedia;

/**
 * Get a preview URL for a publication media file.
 * Always outputs WebP for smaller file sizes.
 */
export function getPublicationPreviewUrl(
  fileId,
  { width = 1200, height = 800 } = {},
) {
  if (!fileId) return null;
  try {
    // params: bucketId, fileId, width, height, gravity, quality,
    //         borderWidth, borderColor, borderRadius, opacity, rotation, background, output
    return storage.getFilePreview(
      PUB_BUCKET,
      fileId,
      width,
      height,
      undefined,
      80,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "webp",
    );
  } catch {
    return null;
  }
}

/**
 * Fetch a published publication by slug + visible sections + linked experience.
 */
export function usePublicationBySlug(slug) {
  const [state, setState] = useState({
    publication: null,
    sections: [],
    experience: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        // 1. Fetch publication by slug — published only
        const pubRes = await databases.listDocuments(
          DB,
          env.collectionPublications,
          [
            Query.equal("slug", slug),
            Query.equal("status", "published"),
            Query.limit(1),
          ],
        );

        if (pubRes.total === 0) {
          if (!cancelled)
            setState((s) => ({ ...s, loading: false, error: "not_found" }));
          return;
        }

        const publication = pubRes.documents[0];

        // 2. Parallel: sections + linked experience
        const fetches = [
          databases.listDocuments(DB, env.collectionSections, [
            Query.equal("publicationId", publication.$id),
            Query.equal("isVisible", true),
            Query.orderAsc("sortOrder"),
            Query.limit(100),
          ]),
        ];

        if (publication.experienceId) {
          fetches.push(
            databases.getDocument(
              DB,
              env.collectionExperiences,
              publication.experienceId,
            ),
          );
        }

        const results = await Promise.allSettled(fetches);
        const sections =
          results[0].status === "fulfilled" ? results[0].value.documents : [];
        const experience =
          results[1]?.status === "fulfilled" ? results[1].value : null;

        if (!cancelled) {
          setState({
            publication,
            sections,
            experience,
            loading: false,
            error: null,
          });
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
