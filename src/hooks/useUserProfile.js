import { useState, useEffect, useCallback } from "react";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import env from "@/config/env";
import { useAuth } from "@/hooks/useAuth";

const DB = env.appwriteDatabaseId;
const COL = env.collectionUserProfiles;

/**
 * Reads and updates the authenticated user's profile from user_profiles.
 * The profile document uses $id = userId (set by assign-user-label function).
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
      // 404 = profile doesn't exist yet — not an error for display
      if (err.code === 404) {
        setProfile(null);
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
