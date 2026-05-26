/**
 * OMZONE — Shared Audit Logger (template / reference)
 *
 * This file is the canonical reference for the audit logger pattern used
 * across all Appwrite Functions. Since each Function is a self-contained
 * deployment unit, copy the relevant helpers (logActivity / logSystemError)
 * into each function's src/ directory rather than importing from here.
 *
 * CRITICAL: Root users NEVER leave any audit trace (ghost-user rule).
 *
 * Pattern to copy into each function's src/main.js:
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   // ── Audit helpers ──────────────────────────────────────────────────
 *
 *   function _roleSnapshot(labels) {
 *     if (labels.includes("admin"))    return "admin";
 *     if (labels.includes("operator")) return "operator";
 *     return "client";
 *   }
 *
 *   async function logActivity(db, action, entityType, entityId, actorId,
 *                              labels, details = {}, opts = {}) {
 *     try {
 *       if (labels.includes("root")) return; // ghost-user rule
 *       const detailsStr = JSON.stringify(details).slice(0, 4000);
 *       await db.createDocument(DB, "admin_activity_logs", ID.unique(), {
 *         userId:            actorId,
 *         action,
 *         entityType,
 *         entityId,
 *         details:           detailsStr,
 *         severity:          opts.severity  || "info",
 *         result:            opts.result    || "ok",
 *         source:            opts.source    || "function",
 *         actorRoleSnapshot: _roleSnapshot(labels),
 *         ...(opts.ipAddress  ? { ipAddress:  opts.ipAddress  } : {}),
 *         ...(opts.userAgent  ? { userAgent:  opts.userAgent  } : {}),
 *         ...(opts.route      ? { route:      opts.route      } : {}),
 *         ...(opts.requestId  ? { requestId:  opts.requestId  } : {}),
 *         ...(opts.errorMessage ? { errorMessage: opts.errorMessage.slice(0, 2000) } : {}),
 *       });
 *     } catch { /* non-critical */ }
 *   }
 *
 *   async function logSystemError(db, err, actorId, opts = {}) {
 *     try {
 *       const errObj = err instanceof Error ? err : new Error(String(err));
 *       await db.createDocument(DB, "system_event_logs", ID.unique(), {
 *         level:        "error",
 *         source:       opts.source    || "function",
 *         userId:       actorId        || null,
 *         route:        opts.route     || null,
 *         errorName:    errObj.name    || "Error",
 *         errorMessage: (errObj.message || "").slice(0, 2000),
 *         errorStack:   (errObj.stack  || "").slice(0, 8000),
 *         context:      opts.context   ? JSON.stringify(opts.context).slice(0, 4000) : null,
 *         ...(opts.ipAddress  ? { ipAddress:  opts.ipAddress  } : {}),
 *         ...(opts.userAgent  ? { userAgent:  opts.userAgent  } : {}),
 *         ...(opts.requestId  ? { requestId:  opts.requestId  } : {}),
 *       });
 *     } catch { /* non-critical */ }
 *   }
 * ─────────────────────────────────────────────────────────────────────────
 */
