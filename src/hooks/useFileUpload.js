import { useState, useCallback } from "react";
import { storage, ID } from "@/lib/appwrite";
import env from "@/config/env";

// ─── Per-bucket constraints ───────────────────────────────────────────────────

const BUCKET_CONFIG = {
  [env.bucketExperienceMedia]: {
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
    label: "JPG, PNG, WebP, GIF · máx. 10 MB",
  },
  [env.bucketPublicationMedia]: {
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
    label: "JPG, PNG, WebP, GIF · máx. 10 MB",
  },
  [env.bucketAddonImages]: {
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
    label: "JPG, PNG, WebP, GIF · máx. 10 MB",
  },
  [env.bucketPackageImages]: {
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
    label: "JPG, PNG, WebP, GIF · máx. 10 MB",
  },
  [env.bucketUserAvatars]: {
    maxSize: 2 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    label: "JPG, PNG, WebP · máx. 2 MB",
  },
  [env.bucketDocuments]: {
    maxSize: 20 * 1024 * 1024,
    allowedTypes: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
    label: "PDF, JPG, PNG · máx. 20 MB",
  },
};

const DEFAULT_CONFIG = {
  maxSize: 10 * 1024 * 1024,
  allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
  label: "JPG, PNG, WebP · máx. 10 MB",
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useFileUpload — generic file upload hook for Appwrite Storage.
 *
 * @param {string} bucketId  Appwrite bucket ID (defaults to experience_media)
 * @returns {{ upload, deleteFile, getPreviewUrl, getFileViewUrl, uploading, progress, error, clearError }}
 */
export function useFileUpload(bucketId = env.bucketExperienceMedia) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const config = BUCKET_CONFIG[bucketId] ?? DEFAULT_CONFIG;

  const clearError = useCallback(() => setError(null), []);

  /**
   * Validate file client-side before upload.
   * Returns an error string or null if valid.
   */
  function validate(file) {
    if (!config.allowedTypes.includes(file.type)) {
      const exts = config.label.split("·")[0].trim();
      return `Tipo de archivo no permitido. Se aceptan: ${exts}`;
    }
    if (file.size > config.maxSize) {
      const mb = (config.maxSize / (1024 * 1024)).toFixed(0);
      return `El archivo supera el tamaño máximo de ${mb} MB`;
    }
    return null;
  }

  /**
   * Upload a file to the configured bucket.
   * Uses Appwrite's onProgress callback for chunked upload progress.
   *
   * @param {File} file
   * @returns {Promise<{ fileId: string, previewUrl: string | null }>}
   */
  async function upload(file) {
    setError(null);
    setProgress(0);

    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      throw new Error(validationError);
    }

    setUploading(true);
    try {
      const result = await storage.createFile(
        bucketId,
        ID.unique(),
        file,
        undefined, // permissions — inherited from bucket
        (progressEvent) => {
          setProgress(Math.round(progressEvent.progress));
        }
      );
      setProgress(100);
      const previewUrl = getPreviewUrl(result.$id);
      return { fileId: result.$id, previewUrl };
    } catch (err) {
      const msg = err?.message ?? "Error al subir el archivo";
      setError(msg);
      throw err;
    } finally {
      setUploading(false);
    }
  }

  /**
   * Delete a file from the configured bucket.
   */
  async function deleteFile(fileId) {
    if (!fileId) return;
    try {
      await storage.deleteFile(bucketId, fileId);
    } catch {
      // silent — file may already be gone
    }
  }

  /**
   * Get a preview/thumbnail URL for an image file.
   * Returns null for non-image buckets (documents).
   */
  function getPreviewUrl(fileId, { width = 800, height = 600, quality = 80 } = {}) {
    if (!fileId) return null;
    if (bucketId === env.bucketDocuments) return null;
    try {
      return storage.getFilePreview(bucketId, fileId, width, height, undefined, quality);
    } catch {
      return null;
    }
  }

  /**
   * Get a direct view URL (for documents / non-image files).
   */
  function getFileViewUrl(fileId) {
    if (!fileId) return null;
    try {
      return storage.getFileView(bucketId, fileId);
    } catch {
      return null;
    }
  }

  return {
    upload,
    deleteFile,
    getPreviewUrl,
    getFileViewUrl,
    validate,
    uploading,
    progress,
    error,
    clearError,
    bucketLabel: config.label,
  };
}
