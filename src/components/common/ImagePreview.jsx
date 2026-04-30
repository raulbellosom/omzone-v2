import { useState } from "react";
import { storage } from "@/lib/appwrite";
import env from "@/config/env";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

/**
 * ImagePreview — displays an Appwrite Storage image by fileId.
 *
 * Props:
 *  - fileId     {string}   Appwrite file ID
 *  - bucketId   {string}   Bucket ID (default: experience_media)
 *  - width      {number}   Preview width px (default 800)
 *  - height     {number}   Preview height px (default 600)
 *  - quality    {number}   JPEG quality 0-100 (default 80)
 *  - alt        {string}
 *  - className  {string}   Applied to the outer wrapper
 *  - imgClass   {string}   Applied to the <img> element
 *  - fit        {string}   "cover" | "contain" (default "cover")
 */
export default function ImagePreview({
  fileId,
  bucketId = env.bucketExperienceMedia,
  width = 800,
  height = 600,
  quality = 80,
  alt = "",
  className,
  imgClass,
  fit = "cover",
}) {
  const [status, setStatus] = useState("idle"); // idle | loading | loaded | error

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

  let src = null;
  try {
    // params: bucketId, fileId, width, height, gravity, quality,
    //         borderWidth, borderColor, borderRadius, opacity, rotation, background, output
    src = storage.getFilePreview(
      bucketId,
      fileId,
      width,
      height,
      undefined,
      quality,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "webp",
    );
  } catch {
    // invalid fileId — fall through to error state
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
      {/* Skeleton while loading */}
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
          alt={alt}
          loading="lazy"
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
