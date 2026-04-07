/**
 * @deprecated Use useFileUpload(bucketId) instead.
 * Kept for backward compatibility — delegates to useFileUpload with the
 * experience_media bucket.
 */
import { useFileUpload } from "@/hooks/useFileUpload";
import env from "@/config/env";

export function useImageUpload() {
  const { upload, deleteFile, getPreviewUrl, uploading, error } =
    useFileUpload(env.bucketExperienceMedia);

  return { upload, deleteFile, getPreviewUrl, uploading, error };
}
