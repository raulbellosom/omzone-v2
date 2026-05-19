import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/common/Button";
import ImagePreview from "@/components/common/ImagePreview";
import MediaPicker from "@/components/admin/media/MediaPicker";
import env from "@/config/env";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * MediaImageField — image selector widget using MediaPicker (browse library + upload new).
 *
 * Replaces a plain ImageUpload drop-zone when you want the user to be able to:
 *   1. Pick an image already in the bucket (gallery/browse tab)
 *   2. Upload a new image (upload tab)
 *
 * Props:
 *  - fileId        {string}                Currently selected Appwrite file ID
 *  - bucketId      {string}                Bucket where the current fileId lives (for preview)
 *  - buckets       {Array<{id,label}>}     Optional: show all image buckets as tabs in picker
 *  - onChange      {fn(fileId, bucketId)}  Called with the selected fileId + its source bucket
 *  - disabled      {boolean}
 *  - aspectRatio   {string}                "video" (16:9, default) | "square" (1:1) | "og" (1200×630)
 */
export default function MediaImageField({
  fileId,
  bucketId = env.bucketExperienceMedia,
  buckets,
  onChange,
  disabled,
  aspectRatio = "video",
}) {
  const { t } = useLanguage();
  const [pickerOpen, setPickerOpen] = useState(false);

  const previewDims =
    aspectRatio === "square"
      ? { width: 600, height: 600 }
      : aspectRatio === "og"
        ? { width: 1200, height: 630 }
        : { width: 1200, height: 675 };

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "og"
        ? "aspect-[1200/630]"
        : "aspect-video";

  function handleSelect(ids, activeBucketId) {
    const id = ids[0] ?? "";
    onChange?.(id, activeBucketId || bucketId);
    setPickerOpen(false);
  }

  return (
    <div className="flex flex-col sm:flex-row items-start gap-3">
      {/* Thumbnail */}
      <div
        className={`w-full sm:w-64 ${aspectClass} rounded-xl overflow-hidden border border-sand-dark/40 bg-warm-gray shrink-0`}
      >
        {fileId ? (
          <ImagePreview
            fileId={fileId}
            bucketId={bucketId}
            width={previewDims.width}
            height={previewDims.height}
            className="w-full h-full"
            fit="cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-charcoal-subtle">
            <ImagePlus className="h-8 w-8" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPickerOpen(true)}
          disabled={disabled}
        >
          <ImagePlus className="h-4 w-4" />
          {fileId ? t("admin.media.changeImage") : t("admin.media.selectImage")}
        </Button>
        {fileId && (
          <button
            type="button"
            onClick={() => onChange?.("", bucketId)}
            disabled={disabled}
            className="flex items-center gap-1 text-xs text-charcoal-subtle hover:text-red-600 disabled:opacity-50 transition-colors"
          >
            <X className="h-3 w-3" />
            {t("admin.media.removeImage")}
          </button>
        )}
      </div>

      {/* Picker modal */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        bucketId={bucketId}
        buckets={buckets}
        multiple={false}
        selected={fileId ? [fileId] : []}
        onSelect={handleSelect}
        isAdmin
      />
    </div>
  );
}
