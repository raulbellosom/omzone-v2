import { useQuery, useQueryClient } from "@tanstack/react-query";
import { databases, functions } from "@/lib/appwrite";
import env from "@/config/env";
import { useAuth } from "@/hooks/useAuth";

const DB = env.appwriteDatabaseId;
const COL = env.collectionUserProfiles;

export const USER_PROFILE_KEY = (userId) => ["user-profile", userId];

async function fetchProfile(userId) {
  try {
    return await databases.getDocument(DB, COL, userId);
  } catch (err) {
    if (err.code === 404) {
      // Profile doesn't exist yet — ask the server to create it, then retry
      await functions.createExecution(
        "assign-user-label",
        JSON.stringify({ action: "ensure-profile" }),
        false,
        "/",
        "POST",
      );
      return await databases.getDocument(DB, COL, userId);
    }
    throw err;
  }
}

/**
 * Reads and updates the authenticated user's profile from user_profiles.
 * Uses React Query so ALL consumers share the same cached data and any
 * update automatically re-hydrates every component that calls this hook.
 */
export function useUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: profile = null,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: USER_PROFILE_KEY(user?.$id),
    queryFn: () => fetchProfile(user.$id),
    enabled: !!user?.$id,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const updateProfile = async (data) => {
    if (!user?.$id) throw new Error("No user");
    const doc = await databases.updateDocument(DB, COL, user.$id, data);
    // Immediately push the fresh doc into the cache so all consumers
    // update synchronously — no waiting for a re-fetch.
    queryClient.setQueryData(USER_PROFILE_KEY(user.$id), doc);
    return doc;
  };

  return {
    profile,
    loading,
    error: queryError?.message ?? null,
    refetch,
    updateProfile,
  };
}
