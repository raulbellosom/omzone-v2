import { FileText } from "lucide-react";
import env from "@/config/env";
import { useFileUpload } from "@/hooks/useFileUpload";

function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageMime(mimeType) {
  return mimeType?.startsWith("image/");
}

function SkeletonCard() {
  return (
    <div className="aspect-square rounded-lg bg-warm-gray animate-pulse" />
  );
}

export default function MediaGrid({ files, loading, bucketId, onFileClick }) {
  const { getPreviewUrl } = useFileUpload(bucketId);
  const isDocBucket = bucketId === env.bucketDocuments;

  if (loading && files.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {files.map((file) => {
        const showImage = !isDocBucket && isImageMime(file.mimeType);
        const thumbUrl = showImage ? getPreviewUrl(file.$id, { width: 400, height: 400, quality: 70 }) : null;

        return (
          <button
            key={file.$id}
            type="button"
            onClick={() => onFileClick(file)}
            className="group relative aspect-square rounded-lg border border-sand-dark overflow-hidden bg-warm-gray/30 hover:ring-2 hover:ring-sage/50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-sage"
          >
            {showImage && thumbUrl ? (
              <img
                src={thumbUrl}
                alt={file.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-charcoal-muted">
                <FileText className="h-10 w-10" />
                <span className="text-xs uppercase tracking-wide">
                  {file.mimeType?.split("/")[1] || "file"}
                </span>
              </div>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs text-white truncate">{file.name}</p>
              <p className="text-[10px] text-white/70">{formatSize(file.sizeOriginal)}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
