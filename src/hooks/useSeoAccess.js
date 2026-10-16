import { useState, useEffect, useCallback } from "react";
import { databases, Query, ID } from "@/lib/appwrite";
import env from "@/config/env";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";

const DB = env.appwriteDatabaseId;
const COL = env.collectionSettings;
const KEY = "home_seo_admin_enabled";

/**
 * Root-controlled flag (settings.home_seo_admin_enabled) that decides whether
 * non-root admins can see/edit the Home SEO tab. Missing doc => disabled.
 * Root always has access.
 */
export function useSeoAccess() {
  const { labels } = useAuth();
  const isRoot = labels.includes(ROLES.ROOT);
  const [enabled, setEnabled] = useState(false);
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await databases.listDocuments(DB, COL, [
        Query.equal("key", KEY),
        Query.limit(1),
      ]);
      const found = res.documents[0] || null;
      setDoc(found);
      setEnabled(found?.value === "true");
    } catch {
      setDoc(null);
      setEnabled(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const save = useCallback(
    async (next) => {
      const value = next ? "true" : "false";
      if (doc) {
        await databases.updateDocument(DB, COL, doc.$id, { value });
      } else {
        await databases.createDocument(DB, COL, ID.unique(), {
          key: KEY,
          value,
          category: "seo",
          description: "Allow non-root admins to edit the Home SEO tab",
        });
      }
      await fetch();
    },
    [doc, fetch],
  );

  return { enabled, canEditSeo: isRoot || enabled, loading, save };
}
