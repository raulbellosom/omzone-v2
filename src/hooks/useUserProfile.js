import { useState, useEffect, useCallback } from "react";
import { databases, functions } from "@/lib/appwrite";
import { Permission, Role } from "appwrite";
import env from "@/config/env";
import { useAuth } from "@/hooks/useAuth";

const DB = env.appwriteDatabaseId;
const COL = env.collectionUserProfiles;

/**
 * Reads and updates the authenticated user's profile from user_profiles.
 * The profile document uses $id = userId (set by assign-user-label function).
 * If the document doesn't exist, it auto-creates it with sensible defaults.
 */
export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!user?.$id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const doc = await databases.getDocument(DB, COL, user.$id);
      setProfile(doc);
    } catch (err) {
      if (err.code === 404) {
        // Profile doesn't exist yet — ask the server to create it
        try {
          await functions.createExecution(
            "assign-user-label",
            JSON.stringify({ action: "ensure-profile" }),
            false,
            "/",
            "POST",
          );
          // Retry fetch after server-side creation
          const doc = await databases.getDocument(DB, COL, user.$id);
          setProfile(doc);
        } catch (ensureErr) {
          // Fallback: try client-side create (works for admin/root labels)
          try {
            const nameParts = (user.name || "").trim().split(/\s+/);
            const firstName = nameParts[0] || "";
            const lastName =
              nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
            const displayName =
              user.name || (user.email ? user.email.split("@")[0] : "");

            const doc = await databases.createDocument(
              DB,
              COL,
              user.$id,
              { displayName, firstName, lastName, language: "es" },
              [
                Permission.read(Role.user(user.$id)),
                Permission.update(Role.user(user.$id)),
                Permission.read(Role.label("admin")),
                Permission.update(Role.label("admin")),
              ],
            );
            setProfile(doc);
          } catch (createErr) {
            if (createErr.code === 401 || createErr.code === 403) {
              setProfile(null);
            } else {
              setError(createErr.message);
            }
          }
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.$id, user?.name, user?.email]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateProfile = async (data) => {
    if (!user?.$id) throw new Error("No user");
    const doc = await databases.updateDocument(DB, COL, user.$id, data);
    setProfile(doc);
    return doc;
  };

  return {
    profile,
    loading,
    error,
    refetch: fetch,
    updateProfile,
  };
}
