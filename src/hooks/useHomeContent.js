import { useContext, useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import env from "@/config/env";
import { HomeContentContext } from "@/contexts/HomeContentContext";
import { DEFAULT_HOME_CONTENT, HOME_CONTENT_ID, validateHomeContent } from "@/lib/homeContent";

export const HOME_BUCKETS = env.imageBuckets.map((bucket) => bucket.id);

export async function readHomeContent() {
  const document = await databases.getDocument(env.appwriteDatabaseId, env.collectionHomeContent, HOME_CONTENT_ID);
  const result = validateHomeContent(document, HOME_BUCKETS);
  if (!result.valid) throw new Error("Invalid home content");
  return { ...result.data, $updatedAt: document.$updatedAt };
}

export async function saveHomeContent(value) {
  const result = validateHomeContent(value, HOME_BUCKETS);
  if (!result.valid) throw new Error("Invalid home content");
  return databases.updateDocument(env.appwriteDatabaseId, env.collectionHomeContent, HOME_CONTENT_ID, result.data);
}

export function useHomeContent() {
  const initial = useContext(HomeContentContext);
  const [data, setData] = useState(initial?.content || DEFAULT_HOME_CONTENT);
  useEffect(() => {
    let active = true;
    // Also revalidate when Home is reached through SPA navigation. The initial
    // hydration still uses exactly the document sent by the server.
    readHomeContent().then((value) => { if (active) setData(value); }).catch(() => {});
    return () => { active = false; };
  }, []);
  return { data, config: initial.config };
}
