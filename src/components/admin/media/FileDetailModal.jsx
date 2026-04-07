import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/common/dialog";
import Button from "@/components/common/Button";
import { useFileUpload } from "@/hooks/useFileUpload";
import env from "@/config/env";
import { Copy, Trash2, ExternalLink, FileText, Check } from "lucide-react";

function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isImageMime(mimeType) {
  return mimeType?.startsWith("image/");
}

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: ignore
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : label}
    </Button>
  );
}

export default function FileDetailModal({
  file,
  open,
  onClose,
  bucketId,
  canDelete,
  onDelete,
  t,
}) {
  const { getPreviewUrl, getFileViewUrl } = useFileUpload(bucketId);
  const [deleting, setDeleting] = useState(false);

  if (!file) return null;

  const isDoc = bucketId === env.bucketDocuments;
  const showImage = !isDoc && isImageMime(file.mimeType);
  const previewUrl = showImage ? getPreviewUrl(file.$id, { width: 800, height: 600, quality: 85 }) : null;
  const viewUrl = getFileViewUrl(file.$id);

  const handleDelete = async () => {
    if (!window.confirm(t("admin.mediaManager.deleteConfirm"))) return;
    setDeleting(true);
    try {
      await onDelete(file.$id);
      onClose();
    } catch {
      // error handled upstream
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{file.name}</DialogTitle>
        </DialogHeader>

        {/* Preview */}
        <div className="rounded-lg overflow-hidden bg-warm-gray/30 mb-4">
          {showImage && previewUrl ? (
            <img
              src={previewUrl}
              alt={file.name}
              className="w-full max-h-[400px] object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-charcoal-muted">
              <FileText className="h-16 w-16 mb-2" />
              <span className="text-sm uppercase tracking-wide">
                {file.mimeType?.split("/")[1] || "file"}
              </span>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-charcoal-muted">{t("admin.mediaManager.fileName")}</span>
            <span className="text-charcoal font-medium truncate ml-4 max-w-[60%] text-right">{file.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-muted">{t("admin.mediaManager.fileType")}</span>
            <span className="text-charcoal font-medium">{file.mimeType || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-muted">{t("admin.mediaManager.fileSize")}</span>
            <span className="text-charcoal font-medium">{formatSize(file.sizeOriginal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-muted">{t("admin.mediaManager.fileDate")}</span>
            <span className="text-charcoal font-medium">{formatDate(file.$createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-muted">ID</span>
            <span className="text-charcoal font-mono text-xs">{file.$id}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-sand-dark/40">
          <CopyButton text={file.$id} label={t("admin.mediaManager.copyId")} />
          {viewUrl && (
            <CopyButton text={viewUrl.toString()} label={t("admin.mediaManager.copyUrl")} />
          )}
          {viewUrl && (
            <a
              href={viewUrl.toString()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-sand-dark px-3 py-1.5 text-sm text-charcoal hover:bg-warm-gray transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("admin.mediaManager.openOriginal")}
            </a>
          )}
          {canDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? t("admin.common.loading") : t("admin.mediaManager.delete")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
