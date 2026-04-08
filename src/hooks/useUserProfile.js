import { useState, useEffect, useCallback } from "react";
import { databases, functions } from "@/lib/appwrite";
import env from "@/config/env";
import { useAuth } from "@/hooks/useAuth";

const DB = env.appwriteDatabaseId;
const COL = env.collectionUserProfiles;

/**
 * Reads and updates the authenticated user's profile from user_profiles.
 * The profile document uses $id = userId (set by assign-user-label function).
 * If the document doesn't exist, it calls the server function to create it.
 */
export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!user?.$id) {
      setProfile(null);
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
          try {
            const doc = await databases.getDocument(DB, COL, user.$id);
            setProfile(doc);
          } catch {
            setProfile(null);
          }
        } catch {
          setProfile(null);
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.$id]);

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
