import { useState, useEffect, useCallback } from "react";
import { databases, Query, ID } from "@/lib/appwrite";
import env from "@/config/env";
import { useLanguage } from "@/hooks/useLanguage";
import { getErrorMessage } from "@/lib/errors";

const DB = env.appwriteDatabaseId;
const COL = env.collectionSettings;

const KEY_BEFORE = "checkin_window_before_minutes";
const KEY_AFTER = "checkin_window_after_minutes";

export const DEFAULT_BEFORE_MINUTES = 60;
export const DEFAULT_AFTER_MINUTES = 30;

/**
 * Reads/writes the admin-configurable check-in tolerance window
 * (checkin_window_before_minutes / checkin_window_after_minutes) from the
 * shared `settings` collection. Creates the documents on first save if they
 * don't exist yet (they're seeded by scripts/seed-settings.mjs, but the hook
 * doesn't assume that ran).
 */
export function useCheckInSettings() {
  const { t } = useLanguage();
  const [beforeMinutes, setBeforeMinutes] = useState(DEFAULT_BEFORE_MINUTES);
  const [afterMinutes, setAfterMinutes] = useState(DEFAULT_AFTER_MINUTES);
  const [docs, setDocs] = useState({ before: null, after: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await databases.listDocuments(DB, COL, [
        Query.equal("key", [KEY_BEFORE, KEY_AFTER]),
        Query.limit(2),
      ]);
      const before = res.documents.find((d) => d.key === KEY_BEFORE) || null;
      const after = res.documents.find((d) => d.key === KEY_AFTER) || null;
      setDocs({ before, after });
      setBeforeMinutes(
        before ? Number.parseInt(before.value, 10) : DEFAULT_BEFORE_MINUTES,
      );
      setAfterMinutes(
        after ? Number.parseInt(after.value, 10) : DEFAULT_AFTER_MINUTES,
      );
    } catch (err) {
      setError(getErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const save = useCallback(
    async (values) => {
      const nextBefore = String(values.beforeMinutes);
      const nextAfter = String(values.afterMinutes);

      if (docs.before) {
        await databases.updateDocument(DB, COL, docs.before.$id, {
          value: nextBefore,
        });
      } else {
        await databases.createDocument(DB, COL, ID.unique(), {
          key: KEY_BEFORE,
          value: nextBefore,
          category: "general",
          description:
            "Minutes before a class starts that check-in is still allowed",
        });
      }

      if (docs.after) {
        await databases.updateDocument(DB, COL, docs.after.$id, {
          value: nextAfter,
        });
      } else {
        await databases.createDocument(DB, COL, ID.unique(), {
          key: KEY_AFTER,
          value: nextAfter,
          category: "general",
          description:
            "Minutes after a class starts that check-in is still allowed",
        });
      }

      await fetch();
    },
    [docs, fetch],
  );

  return { beforeMinutes, afterMinutes, loading, error, save };
}
