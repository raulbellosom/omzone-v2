import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";
import { getResponsiveSrcSet, getPreviewUrl } from "@/hooks/useImagePreview";
import env from "@/config/env";

/**
 * OptimizedImage — responsive Appwrite Storage image with srcSet,
 * lazy loading, skeleton placeholder and fade-in transition.
 *
 * Props:
 *  - fileId      {string}   Appwrite file ID
 *  - bucketId    {string}   Bucket ID (default: experience_media)
 *  - widths      {number[]} Responsive widths for srcSet (default [400,800,1200])
 *  - quality     {number}   JPEG quality 0-100 (default 80)
 *  - alt         {string}
 *  - className   {string}   Applied to outer wrapper
 *  - imgClass    {string}   Applied to <img>
 *  - fit         {string}   "cover" | "contain" (default "cover")
 *  - eager       {boolean}  Set true for above-the-fold images (disables lazy)
 *  - priority    {boolean}  Alias for eager
 *  - fallbackWidth {number} Fixed width if srcSet not desired
 *  - fallbackHeight {number}
 */
export default function OptimizedImage({
  fileId,
  bucketId = env.bucketExperienceMedia,
  widths = [400, 800, 1200],
  quality = 80,
  alt = "",
  className,
  imgClass,
  fit = "cover",
  eager = false,
  priority = false,
  fallbackWidth,
  fallbackHeight,
}) {
  const [status, setStatus] = useState("idle");
  const isEager = eager || priority;

  if (!fileId) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-warm-gray rounded-lg",
          className,
        )}
      >
        <ImageIcon className="h-6 w-6 text-charcoal-subtle" />
      </div>
    );
  }

  // Generate responsive srcSet or a single fixed-width URL
  let src, srcSet, sizes;
  if (fallbackWidth) {
    src = getPreviewUrl(fileId, {
      bucketId,
      width: fallbackWidth,
      height: fallbackHeight,
      quality,
    });
    srcSet = null;
    sizes = null;
  } else {
    ({ src, srcSet, sizes } = getResponsiveSrcSet(fileId, {
      bucketId,
      quality,
      widths,
    }));
  }

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-warm-gray rounded-lg",
          className,
        )}
      >
        <ImageIcon className="h-6 w-6 text-charcoal-subtle" />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-warm-gray", className)}>
      {/* Skeleton pulse while loading */}
      {status !== "loaded" && status !== "error" && (
        <div className="absolute inset-0 animate-pulse bg-warm-gray" />
      )}

      {status === "error" ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="h-6 w-6 text-charcoal-subtle" />
        </div>
      ) : (
        <img
          src={src}
          srcSet={srcSet || undefined}
          sizes={sizes || undefined}
          alt={alt}
          loading={isEager ? "eager" : "lazy"}
          fetchPriority={isEager ? "high" : undefined}
          decoding={isEager ? "sync" : "async"}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={cn(
            "w-full h-full transition-opacity duration-300",
            fit === "cover" ? "object-cover" : "object-contain",
            status === "loaded" ? "opacity-100" : "opacity-0",
            imgClass,
          )}
        />
      )}
    </div>
  );
}
