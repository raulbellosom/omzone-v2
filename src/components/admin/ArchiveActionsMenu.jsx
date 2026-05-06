import { useState } from "react";
import { Archive, RotateCcw, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * ArchiveActionsMenu — "···" dropdown for archive/restore/hard-delete operations.
 *
 * Props:
 *   document        — Appwrite document (needs $id, archivedAt)
 *   collectionId    — collection string ID
 *   onArchive       — async fn({ documentId, reason?, cascade? })
 *   onRestore       — async fn({ documentId, cascade? })
 *   onHardDelete    — async fn({ documentId, confirmationId, reason }) (root only)
 *   canArchive      — bool (admin/operator permission)
 *   canHardDelete   — bool (root only)
 *   loading         — bool from useArchive
 *   className       — optional extra classes on the trigger button
 */
export default function ArchiveActionsMenu({
  document,
  onArchive,
  onRestore,
  onHardDelete,
  canArchive = false,
  canHardDelete = false,
  loading = false,
  className,
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // 'archive' | 'restore' | 'hardDelete'

  const isArchived = Boolean(document?.archivedAt);

  function close() {
    setOpen(false);
  }

  async function handleConfirm() {
    if (!confirm) return;
    try {
      if (confirm === "archive") {
        await onArchive({ documentId: document.$id, cascade: true });
      } else if (confirm === "restore") {
        await onRestore({ documentId: document.$id, cascade: true });
      }
    } finally {
      setConfirm(null);
      close();
    }
  }

  const hasActions = canArchive || canHardDelete;
  if (!hasActions) return null;

  return (
    <>
      {/* Confirm overlay for archive/restore */}
      {confirm && confirm !== "hardDelete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirm(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-base font-semibold text-charcoal">
              {confirm === "archive"
                ? t("admin.archive.archiveTitle")
                : t("admin.archive.restoreTitle")}
            </h3>
            <p className="text-sm text-charcoal-subtle">
              {confirm === "archive"
                ? t("admin.archive.archiveDesc")
                : t("admin.archive.restoreDesc")}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirm(null)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={loading}
                onClick={handleConfirm}
              >
                {loading
                  ? t("admin.common.saving")
                  : confirm === "archive"
                    ? t("admin.archive.archive")
                    : t("admin.archive.restore")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hard delete modal trigger — delegates to ConfirmHardDeleteModal in parent */}
      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={className}
          onClick={() => setOpen((p) => !p)}
          disabled={loading}
          title={t("admin.archive.moreActions")}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>

        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={close} />
            <div className="absolute right-0 top-full mt-1 z-40 min-w-44 rounded-xl border border-sand-dark bg-white shadow-lg py-1 overflow-hidden">
              {canArchive && !isArchived && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-charcoal hover:bg-warm-gray transition-colors"
                  onClick={() => {
                    close();
                    setConfirm("archive");
                  }}
                >
                  <Archive className="h-4 w-4 text-charcoal-subtle shrink-0" />
                  {t("admin.archive.archive")}
                </button>
              )}

              {canArchive && isArchived && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-charcoal hover:bg-warm-gray transition-colors"
                  onClick={() => {
                    close();
                    setConfirm("restore");
                  }}
                >
                  <RotateCcw className="h-4 w-4 text-sage shrink-0" />
                  {t("admin.archive.restore")}
                </button>
              )}

              {canHardDelete && isArchived && (
                <>
                  <div className="border-t border-sand-dark mx-2 my-1" />
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => {
                      close();
                      onHardDelete?.({ document });
                    }}
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                    {t("admin.archive.hardDelete")}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
