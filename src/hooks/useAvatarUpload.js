import { useState } from "react";
import { storage, ID } from "@/lib/appwrite";
import env from "@/config/env";

const BUCKET = env.bucketUserAvatars;
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function useAvatarUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function upload(file) {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      const msg = "Solo se permiten imágenes JPG, PNG o WebP";
      setError(msg);
      throw new Error(msg);
    }
    if (file.size > MAX_SIZE) {
      const msg = "La imagen no puede superar 2 MB";
      setError(msg);
      throw new Error(msg);
    }

    setUploading(true);
    try {
      const result = await storage.createFile(BUCKET, ID.unique(), file);
      return result.$id;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }

  function getPreviewUrl(fileId, { width = 200, height = 200 } = {}) {
    if (!fileId || !BUCKET) return null;
    return storage.getFilePreview(BUCKET, fileId, width, height);
  }

  return { upload, getPreviewUrl, uploading, error };
}
