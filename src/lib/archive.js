import { functions, ID } from "@/lib/appwrite";

/**
 * src/lib/archive.js
 *
 * Client-side wrappers around the Appwrite archive Functions.
 * All sensitive archive/restore/delete operations are delegated to
 * Appwrite Functions to ensure server-side permission validation.
 *
 * Functions used:
 *   - archive-document    (admin/operator depending on collection)
 *   - restore-document    (admin/operator)
 *   - hard-delete-document (root only)
 *   - archive-personal    (authenticated client, own documents only)
 */

const FUNCTION_IDS = {
  archive: import.meta.env.VITE_APPWRITE_FUNCTION_ARCHIVE_DOCUMENT,
  restore: import.meta.env.VITE_APPWRITE_FUNCTION_RESTORE_DOCUMENT,
  hardDelete: import.meta.env.VITE_APPWRITE_FUNCTION_HARD_DELETE_DOCUMENT,
  archivePersonal: import.meta.env.VITE_APPWRITE_FUNCTION_ARCHIVE_PERSONAL,
};

/**
 * Execute an Appwrite Function and return the parsed JSON response.
 * Throws if the execution fails or the function returns a non-OK status.
 */
async function executeFunction(functionId, payload) {
  const execution = await functions.createExecution(
    functionId,
    JSON.stringify(payload),
    false, // synchronous
  );

  if (execution.status === "failed") {
    throw new Error(execution.errors || `Function ${functionId} failed`);
  }

  try {
    const body = JSON.parse(execution.responseBody);
    if (!body.ok) {
      throw new Error(body.error || "Function returned an error");
    }
    return body;
  } catch {
    throw new Error(`Unexpected response from ${functionId}`);
  }
}

// ---------------------------------------------------------------------------
// Admin archive operations
// ---------------------------------------------------------------------------

/**
 * Soft-archives a document (sets archivedAt, archivedBy, archiveReason).
 * For experiences, optionally cascades to child editions and future slots.
 *
 * Requires: admin or operator label (operator only for allowed collections).
 *
 * @param {object} opts
 * @param {string} opts.collectionId
 * @param {string} opts.documentId
 * @param {string} [opts.reason]
 * @param {boolean} [opts.cascade=true]
 */
export async function archiveDocument({
  collectionId,
  documentId,
  reason = "",
  cascade = true,
}) {
  return executeFunction(FUNCTION_IDS.archive, {
    collectionId,
    documentId,
    reason,
    cascade,
  });
}

/**
 * Restores a soft-archived document (clears archivedAt/By/Reason).
 * Optionally reverses cascade for experiences.
 *
 * Requires: admin or operator label.
 *
 * @param {object} opts
 * @param {string} opts.collectionId
 * @param {string} opts.documentId
 * @param {boolean} [opts.cascade=true]
 */
export async function restoreDocument({
  collectionId,
  documentId,
  cascade = true,
}) {
  return executeFunction(FUNCTION_IDS.restore, {
    collectionId,
    documentId,
    cascade,
  });
}

/**
 * Permanently deletes an archived document.
 * ONLY available to users with the "root" label.
 * Document MUST be archived (archivedAt != null) before calling this.
 * For transactional collections, a mandatory reason is required.
 *
 * @param {object} opts
 * @param {string} opts.collectionId
 * @param {string} opts.documentId
 * @param {string} opts.confirmationId - Must match documentId (anti-accident safeguard)
 * @param {string} [opts.reason]       - Required for transactional collections
 */
export async function hardDeleteDocument({
  collectionId,
  documentId,
  confirmationId,
  reason = "",
}) {
  if (confirmationId !== documentId) {
    throw new Error("Confirmation ID does not match document ID");
  }
  return executeFunction(FUNCTION_IDS.hardDelete, {
    collectionId,
    documentId,
    confirmationId,
    reason,
  });
}

// ---------------------------------------------------------------------------
// Client (portal) personal archive operations
// ---------------------------------------------------------------------------

/**
 * Archives a document from the client's personal view (sets userArchivedAt).
 * Does NOT affect admin visibility. Only available for orders, tickets, user_passes.
 * The Function validates that the document belongs to the calling user.
 *
 * @param {object} opts
 * @param {string} opts.collectionId - Must be in PERSONAL_ARCHIVE_COLLECTIONS
 * @param {string} opts.documentId
 */
export async function archivePersonal({ collectionId, documentId }) {
  return executeFunction(FUNCTION_IDS.archivePersonal, {
    collectionId,
    documentId,
    action: "archive",
  });
}

/**
 * Restores a document from the client's personal archive (clears userArchivedAt).
 *
 * @param {object} opts
 * @param {string} opts.collectionId
 * @param {string} opts.documentId
 */
export async function restorePersonal({ collectionId, documentId }) {
  return executeFunction(FUNCTION_IDS.archivePersonal, {
    collectionId,
    documentId,
    action: "restore",
  });
}
