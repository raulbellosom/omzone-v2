import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * ConfirmHardDeleteModal — requires typing the document ID to confirm permanent deletion.
 * Only shown to root users. The parent must gate rendering with canHardDelete.
 *
 * Props:
 *   open          — bool
 *   document      — Appwrite document (needs $id)
 *   onConfirm     — async fn({ documentId, confirmationId, reason })
 *   onCancel      — fn()
 *   loading       — bool
 *   collectionId  — string (for display context)
 */
export default function ConfirmHardDeleteModal({
  open,
  document,
  onConfirm,
  onCancel,
  loading = false,
  collectionId,
}) {
  const { t } = useLanguage();
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");

  if (!open || !document) return null;

  const documentId = document.$id;
  const isValid = typed.trim() === documentId;

  function handleClose() {
    setTyped("");
    setReason("");
    onCancel?.();
  }

  async function handleConfirm() {
    if (!isValid) return;
    try {
      await onConfirm({
        documentId,
        confirmationId: typed.trim(),
        reason: reason.trim(),
      });
      setTyped("");
      setReason("");
    } catch {
      // error surfaced by parent via useArchive hook
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-charcoal">
              {t("admin.archive.hardDeleteTitle")}
            </h3>
            <p className="text-sm text-charcoal-subtle mt-0.5">
              {t("admin.archive.hardDeleteDesc")}
            </p>
          </div>
        </div>

        {/* Document ID display */}
        <div className="rounded-xl border border-sand-dark bg-warm-gray/50 px-3 py-2">
          <p className="text-xs text-charcoal-subtle mb-0.5 font-medium uppercase tracking-wide">
            {collectionId}
          </p>
          <p className="font-mono text-xs text-charcoal break-all">
            {documentId}
          </p>
        </div>

        {/* Reason */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-charcoal">
            {t("admin.archive.hardDeleteReason")}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder={t("admin.archive.hardDeleteReasonPlaceholder")}
            className="w-full rounded-xl border border-sand-dark bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 resize-none"
          />
        </div>

        {/* Confirmation input */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-charcoal">
            {t("admin.archive.hardDeleteConfirmLabel")}
          </label>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder={t("admin.archive.hardDeleteConfirmPlaceholder")}
            className="w-full rounded-xl border border-sand-dark bg-white px-3 py-2 text-sm font-mono text-charcoal focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200"
          />
          {typed && !isValid && (
            <p className="text-xs text-red-600">
              {t("admin.archive.hardDeleteMismatch")}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!isValid || loading}
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {loading
              ? t("admin.common.saving")
              : t("admin.archive.hardDeleteConfirm")}
          </Button>
        </div>
      </div>
    </div>
  );
}
