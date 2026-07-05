import { useState, useCallback } from "react";
import {
  archiveDocument,
  restoreDocument,
  hardDeleteDocument,
  archivePersonal,
  restorePersonal,
} from "@/lib/archive";
import { useLanguage } from "@/hooks/useLanguage";
import { getErrorMessage } from "@/lib/errors";

/**
 * useArchive — unified hook for archive, restore, and hard-delete operations.
 *
 * @param {string} collectionId - Appwrite collection ID
 * @param {Function} [onSuccess] - Callback after successful operation (e.g. refetch list)
 */
export function useArchive(collectionId, onSuccess) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (fn) => {
      setLoading(true);
      setError(null);
      try {
        await fn();
        onSuccess?.();
      } catch (err) {
        setError(getErrorMessage(err, t, "common.errorSaveFailed"));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, t],
  );

  /** Soft-archive a document (admin). Cascade applies to experiences → editions/slots. */
  const archive = useCallback(
    ({ documentId, reason = "", cascade = true } = {}) =>
      run(() => archiveDocument({ collectionId, documentId, reason, cascade })),
    [collectionId, run],
  );

  /** Restore a soft-archived document (admin). */
  const restore = useCallback(
    ({ documentId, cascade = true } = {}) =>
      run(() => restoreDocument({ collectionId, documentId, cascade })),
    [collectionId, run],
  );

  /**
   * Permanently delete an archived document.
   * ROOT ONLY. Document must already be archived.
   */
  const hardDelete = useCallback(
    ({ documentId, confirmationId, reason = "" } = {}) =>
      run(() =>
        hardDeleteDocument({
          collectionId,
          documentId,
          confirmationId,
          reason,
        }),
      ),
    [collectionId, run],
  );

  /** Client-side personal archive (hides from portal view only). */
  const archiveOwn = useCallback(
    ({ documentId } = {}) =>
      run(() => archivePersonal({ collectionId, documentId })),
    [collectionId, run],
  );

  /** Client-side personal restore. */
  const restoreOwn = useCallback(
    ({ documentId } = {}) =>
      run(() => restorePersonal({ collectionId, documentId })),
    [collectionId, run],
  );

  return {
    archive,
    restore,
    hardDelete,
    archiveOwn,
    restoreOwn,
    loading,
    error,
  };
}
