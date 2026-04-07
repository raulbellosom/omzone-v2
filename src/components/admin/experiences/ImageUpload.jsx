import { useRef, useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, FileText, AlertCircle } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import env from "@/config/env";
import { cn } from "@/lib/utils";

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ progress }) {
  return (
    <div className="w-full h-1.5 bg-warm-gray rounded-full overflow-hidden">
      <div
        className="h-full bg-sage transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ImageUpload — reusable file upload widget for admin forms.
 *
 * Props:
 *  - fileId          {string}    Currently stored file ID (shows preview)
 *  - onUpload        {fn}        Called with fileId after successful upload
 *  - onRemove        {fn}        Called when user removes the current file
 *  - bucketId        {string}    Appwrite bucket ID (default: experience_media)
 *  - accept          {string}    Input accept override (e.g. ".pdf,image/*")
 *  - label           {string}    Helper label override
 *  - disabled        {boolean}
 */
export default function ImageUpload({
  fileId,
  onUpload,
  onRemove,
  bucketId = env.bucketExperienceMedia,
  accept,
  label,
  disabled,
}) {
  const { upload, getPreviewUrl, validate, uploading, progress, error, clearError, bucketLabel } =
    useFileUpload(bucketId);
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState(null);

  const displayError = error || localError;

  const previewUrl = fileId ? getPreviewUrl(fileId, { width: 800, height: 533 }) : null;

  // ── File handling ──────────────────────────────────────────────────────────

  async function handleFile(file) {
    if (!file) return;
    setLocalError(null);
    clearError();

    const validationError = validate(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    try {
      const { fileId: newId } = await upload(file);
      onUpload?.(newId);
    } catch {
      // error shown via hook state
    }
  }

  function handleInputChange(e) {
    handleFile(e.target.files?.[0]);
    e.target.value = ""; // allow re-select same file
  }

  // ── Drag and drop ──────────────────────────────────────────────────────────

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled && !uploading) setIsDragOver(true);
  }, [disabled, uploading]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, uploading]);

  // ── Accept string ──────────────────────────────────────────────────────────

  const inputAccept = accept ?? "image/jpeg,image/jpg,image/png,image/webp,image/gif";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={inputAccept}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled || uploading}
      />

      {/* ── Preview state ── */}
      {previewUrl ? (
        <div className="relative group w-full rounded-xl overflow-hidden border border-sand-dark/40 aspect-video bg-warm-gray">
          <img
            src={previewUrl}
            alt="Imagen subida"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <button
            type="button"
            onClick={() => { clearError(); setLocalError(null); onRemove?.(); }}
            disabled={disabled}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-charcoal hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
            aria-label="Eliminar imagen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* ── Drop zone ── */
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={disabled || uploading}
          className={cn(
            "flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50",
            isDragOver
              ? "border-sage bg-sage/10 scale-[1.01]"
              : "border-sand-dark/60 bg-warm-gray/40 hover:border-sage hover:bg-sage/5",
            (disabled || uploading) && "opacity-60 cursor-not-allowed",
            !disabled && !uploading && "cursor-pointer"
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3 text-charcoal-muted w-full px-8">
              <div className="w-8 h-8 rounded-full border-2 border-sage border-t-transparent animate-spin" />
              <span className="text-sm font-medium">Subiendo...</span>
              <div className="w-full max-w-xs">
                <ProgressBar progress={progress} />
                <p className="text-xs text-center mt-1">{progress}%</p>
              </div>
            </div>
          ) : isDragOver ? (
            <div className="flex flex-col items-center gap-2 text-sage pointer-events-none">
              <Upload className="h-8 w-8" />
              <span className="text-sm font-semibold">Suelta aquí</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-charcoal-muted pointer-events-none">
              <div className="p-3 rounded-full bg-warm-gray">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  <span className="text-sage">Seleccionar</span> o arrastra aquí
                </p>
                <p className="text-xs mt-0.5">{label ?? bucketLabel}</p>
              </div>
            </div>
          )}
        </button>
      )}

      {/* ── File ID with non-image bucket (documents) ── */}
      {fileId && !previewUrl && (
        <div className="flex items-center gap-2 rounded-lg border border-sand-dark/40 bg-warm-gray/50 px-3 py-2">
          <FileText className="h-4 w-4 text-charcoal-subtle shrink-0" />
          <span className="text-xs text-charcoal-muted truncate flex-1">{fileId}</span>
          <button
            type="button"
            onClick={() => { clearError(); setLocalError(null); onRemove?.(); }}
            disabled={disabled}
            className="text-charcoal-subtle hover:text-charcoal transition-colors disabled:cursor-not-allowed"
            aria-label="Eliminar archivo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Error state ── */}
      {displayError && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{displayError}</p>
        </div>
      )}
    </div>
  );
}
