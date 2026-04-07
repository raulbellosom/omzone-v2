import { storage } from "@/lib/appwrite";
import env from "@/config/env";

const BUCKET = env.bucketPublicResources;

/**
 * Returns a preview URL for a file in the public-resources bucket.
 * Useful for stock images, backgrounds, placeholders, etc.
 */
export function getPublicImageUrl(fileId, { width, height, quality = 80 } = {}) {
  if (!fileId) return null;
  return storage.getFilePreview(BUCKET, fileId, width, height, undefined, quality);
}

/**
 * Returns a direct view URL (no transforms) for a file in the public-resources bucket.
 */
export function getPublicFileUrl(fileId) {
  if (!fileId) return null;
  return storage.getFileView(BUCKET, fileId);
}
