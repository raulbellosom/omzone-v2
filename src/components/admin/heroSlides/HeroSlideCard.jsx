import { GripVertical, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import ImagePreview from "@/components/common/ImagePreview";
import { cn } from "@/lib/utils";
import { useLanguage, localizedField } from "@/hooks/useLanguage";
import env from "@/config/env";

export default function HeroSlideCard({
  slide,
  dragListeners,
  isDragging,
  onEdit,
  onDelete,
  onToggleVisibility,
  disabled,
}) {
  const { t, language } = useLanguage();
  const caption = localizedField(slide, "caption", language);
  const eyebrow = localizedField(slide, "eyebrow", language);
  const alt = localizedField(slide, "altText", language);
  const bucketId = slide.bucketId || env.bucketPublicResources;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5 transition-colors",
        slide.isVisible
          ? "border-warm-gray-dark/40"
          : "border-dashed border-sand-dark bg-warm-gray/30 opacity-70",
        isDragging && "shadow-lg ring-2 ring-sage/30",
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="touch-none shrink-0 cursor-grab active:cursor-grabbing p-1 -ml-1 text-charcoal-subtle hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-30"
        disabled={disabled}
        aria-label={t("admin.heroSlides.dragToReorder")}
        {...dragListeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Thumbnail */}
      <div className="shrink-0 w-20 h-12 rounded-lg overflow-hidden bg-warm-gray">
        <ImagePreview
          fileId={slide.mediaFileId}
          bucketId={bucketId}
          width={160}
          height={96}
          className="w-full h-full"
          fit="cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {eyebrow && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-sage">
              {eyebrow}
            </span>
          )}
          <span className="text-sm font-medium text-charcoal truncate">
            {caption || alt || slide.mediaFileId.slice(0, 10)}
          </span>
        </div>
        {alt && caption && (
          <p className="text-xs text-charcoal-subtle mt-0.5 line-clamp-1">
            {alt}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onToggleVisibility(slide)}
          disabled={disabled}
          className="p-1.5 rounded-lg text-charcoal-subtle hover:text-charcoal hover:bg-warm-gray transition-colors disabled:opacity-50"
          aria-label={
            slide.isVisible
              ? t("admin.heroSlides.hide")
              : t("admin.heroSlides.show")
          }
          title={
            slide.isVisible
              ? t("admin.heroSlides.visible")
              : t("admin.heroSlides.hidden")
          }
        >
          {slide.isVisible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onEdit(slide)}
          disabled={disabled}
          className="p-1.5 rounded-lg text-charcoal-subtle hover:text-sage hover:bg-sage/10 transition-colors disabled:opacity-50"
          aria-label={t("admin.heroSlides.edit")}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(slide)}
          disabled={disabled}
          className="p-1.5 rounded-lg text-charcoal-subtle hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          aria-label={t("admin.heroSlides.delete")}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
