import { useState } from "react";
import { Archive, RotateCcw, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/common/Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/common/dropdown-menu";
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
  const [confirm, setConfirm] = useState(null); // 'archive' | 'restore' | 'hardDelete'

  const isArchived = Boolean(document?.archivedAt);

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={className}
            disabled={loading}
            title={t("admin.archive.moreActions")}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canArchive && !isArchived && (
            <DropdownMenuItem
              onSelect={() => setConfirm("archive")}
            >
              <Archive className="h-4 w-4 text-charcoal-subtle shrink-0" />
              {t("admin.archive.archive")}
            </DropdownMenuItem>
          )}
          {canArchive && isArchived && (
            <DropdownMenuItem
              onSelect={() => setConfirm("restore")}
            >
              <RotateCcw className="h-4 w-4 text-sage shrink-0" />
              {t("admin.archive.restore")}
            </DropdownMenuItem>
          )}
          {canHardDelete && isArchived && (
            <DropdownMenuItem
              onSelect={() => onHardDelete?.({ document })}
              className="text-red-600 hover:bg-red-50 focus:bg-red-50"
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              {t("admin.archive.hardDelete")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
