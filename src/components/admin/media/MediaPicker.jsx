import { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, Upload, Check, Loader2 } from "lucide-react";
import { useBucketFiles } from "@/hooks/useBucketFiles";
import { useFileUpload } from "@/hooks/useFileUpload";
import ImagePreview from "@/components/common/ImagePreview";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import env from "@/config/env";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

// ─── Tab bar ─────────────────────────────────────────────────────────────────

function TabBar({ tab, setTab, isAdmin }) {
  const { t } = useLanguage();
  return (
    <div className="flex border-b border-sand-dark/40">
      <button
        type="button"
        onClick={() => setTab("browse")}
        className={cn(
          "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
          tab === "browse"
            ? "border-sage text-sage"
            : "border-transparent text-charcoal-muted hover:text-charcoal",
        )}
      >
        {t("admin.media.browse")}
      </button>
      {isAdmin && (
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            tab === "upload"
              ? "border-sage text-sage"
              : "border-transparent text-charcoal-muted hover:text-charcoal",
          )}
        >
          {t("admin.media.uploadNew")}
        </button>
      )}
    </div>
  );
}

// ─── Browse tab ───────────────────────────────────────────────────────────────

function BrowseTab({
  bucketId,
  multiple,
  selected,
  onToggle,
  onLoadMore,
  files,
  loading,
  error,
  hasMore,
  search,
  setSearch,
}) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-subtle pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.media.searchPlaceholder")}
          className={cn(
            "h-9 w-full rounded-lg border border-sand-dark bg-white pl-9 pr-3 text-sm text-charcoal",
            "placeholder:text-charcoal-subtle focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20",
          )}
        />
      </div>

      {/* File grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {error && (
          <p className="text-sm text-red-600 py-4 text-center">{error}</p>
        )}

        {!error && files.length === 0 && !loading && (
          <p className="text-sm text-charcoal-muted py-8 text-center">
            {search
              ? t("admin.media.noResults")
              : t("admin.media.noBucketFiles")}
          </p>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {files.map((file) => {
            const isSelected = selected.includes(file.$id);
            return (
              <button
                key={file.$id}
                type="button"
                onClick={() => onToggle(file.$id)}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 transition-all focus:outline-none",
                  isSelected
                    ? "border-sage ring-2 ring-sage/30"
                    : "border-transparent hover:border-sage/40",
                )}
              >
                <ImagePreview
                  fileId={file.$id}
                  bucketId={bucketId}
                  width={200}
                  height={200}
                  className="w-full h-full"
                  fit="cover"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-sage/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-sage flex items-center justify-center shadow">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                )}
                <p className="absolute bottom-0 inset-x-0 bg-black/50 px-1 py-0.5 text-[10px] text-white truncate">
                  {file.name}
                </p>
              </button>
            );
          })}

          {loading &&
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-warm-gray animate-pulse"
              />
            ))}
        </div>

        {/* Load more */}
        {hasMore && !loading && (
          <div className="pt-3 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLoadMore}
            >
              {t("admin.media.loadMore")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Upload tab ───────────────────────────────────────────────────────────────

function UploadTab({ bucketId, onUploaded }) {
  const { t } = useLanguage();
  const {
    upload,
    validate,
    uploading,
    progress,
    error,
    clearError,
    bucketLabel,
  } = useFileUpload(bucketId);
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState(null);

  async function handleFile(file) {
    if (!file) return;
    setLocalError(null);
    clearError();
    const err = validate(file);
    if (err) {
      setLocalError(err);
      return;
    }
    try {
      const { fileId } = await upload(file);
      onUploaded(fileId);
    } catch {
      // shown via error state
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayError = error || localError;

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 py-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
        disabled={uploading}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        disabled={uploading}
        className={cn(
          "flex flex-col items-center justify-center w-full max-w-xs aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer",
          isDragOver
            ? "border-sage bg-sage/10"
            : "border-sand-dark/60 bg-warm-gray/40 hover:border-sage hover:bg-sage/5",
          uploading && "opacity-60 cursor-not-allowed",
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3 px-8 w-full">
            <Loader2 className="h-8 w-8 text-sage animate-spin" />
            <div className="w-full h-1.5 bg-warm-gray rounded-full overflow-hidden">
              <div
                className="h-full bg-sage transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-charcoal-muted">{progress}%</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-charcoal-muted pointer-events-none">
            <Upload className="h-8 w-8" />
            <span className="text-sm font-medium">
              {t("admin.media.upload")}
            </span>
            <span className="text-xs text-center px-4">{bucketLabel}</span>
          </div>
        )}
      </button>

      {displayError && (
        <p className="text-xs text-red-600 text-center max-w-xs">
          {displayError}
        </p>
      )}
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

/**
 * MediaPicker — modal for browsing/uploading Appwrite Storage files.
 *
 * Props:
 *  - open         {boolean}
 *  - onClose      {fn}
 *  - bucketId     {string}    Which bucket to browse
 *  - multiple     {boolean}   Allow multi-select (default false)
 *  - selected     {string[]}  Currently selected fileIds
 *  - onSelect     {fn}        Called with fileId[] on confirm
 *  - isAdmin      {boolean}   Show upload tab (default false)
 */
export default function MediaPicker({
  open,
  onClose,
  bucketId = env.bucketExperienceMedia,
  multiple = false,
  selected: externalSelected = [],
  onSelect,
  isAdmin = false,
}) {
  const { t } = useLanguage();
  const [tab, setTab] = useState("browse");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(externalSelected);
  const { files, loading, error, hasMore, loadMore, refresh } = useBucketFiles(
    bucketId,
    { search },
  );

  // Sync external selection when picker opens
  useEffect(() => {
    if (open) {
      setSelected(externalSelected);
      setTab("browse");
      setSearch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleToggle(fileId) {
    if (multiple) {
      setSelected((prev) =>
        prev.includes(fileId)
          ? prev.filter((id) => id !== fileId)
          : [...prev, fileId],
      );
    } else {
      setSelected((prev) => (prev[0] === fileId ? [] : [fileId]));
    }
  }

  function handleConfirm() {
    onSelect?.(selected);
    onClose?.();
  }

  function handleUploaded(fileId) {
    refresh();
    if (multiple) {
      setSelected((prev) => (prev.includes(fileId) ? prev : [...prev, fileId]));
    } else {
      setSelected([fileId]);
    }
    setTab("browse");
  }

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — fullscreen mobile, centered modal desktop */}
      <div
        className={cn(
          "relative z-10 flex flex-col bg-white shadow-2xl",
          "w-full h-[92dvh] rounded-t-2xl",
          "sm:w-[640px] sm:h-[580px] sm:rounded-2xl",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-0 shrink-0">
          <h2 className="text-base font-semibold text-charcoal">
            {multiple
              ? t("admin.mediaPicker.titleMultiple")
              : t("admin.mediaPicker.titleSingle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-subtle hover:text-charcoal hover:bg-warm-gray transition-colors"
            aria-label={t("admin.media.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <TabBar tab={tab} setTab={setTab} isAdmin={isAdmin} />

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-hidden px-4 py-3 flex flex-col">
          {tab === "browse" ? (
            <BrowseTab
              bucketId={bucketId}
              multiple={multiple}
              selected={selected}
              onToggle={handleToggle}
              onLoadMore={loadMore}
              files={files}
              loading={loading}
              error={error}
              hasMore={hasMore}
              search={search}
              setSearch={setSearch}
            />
          ) : (
            <UploadTab bucketId={bucketId} onUploaded={handleUploaded} />
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-t border-sand-dark/30">
          <span className="text-sm text-charcoal-muted">
            {selected.length > 0
              ? t("admin.mediaPicker.selectedCount").replace(
                  "{count}",
                  selected.length,
                )
              : t("admin.mediaPicker.noneSelected")}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              {t("admin.mediaPicker.cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={selected.length === 0}
              onClick={handleConfirm}
            >
              {multiple
                ? t("admin.mediaPicker.addSelection")
                : t("admin.mediaPicker.select")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
