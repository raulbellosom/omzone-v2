import {
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import Badge from "@/components/common/Badge";
import { cn } from "@/lib/utils";

const TYPE_LABELS = {
  hero: "Hero",
  text: "Texto",
  gallery: "Galería",
  highlights: "Highlights",
  faq: "FAQ",
  itinerary: "Itinerario",
  testimonials: "Testimonios",
  inclusions: "Inclusiones",
  restrictions: "Restricciones",
  cta: "Call to Action",
  video: "Video",
};

const TYPE_VARIANTS = {
  hero: "sage",
  text: "default",
  gallery: "warm",
  highlights: "success",
  faq: "sand",
  itinerary: "outline",
  testimonials: "warm",
  inclusions: "sage",
  restrictions: "warning",
  cta: "danger",
  video: "charcoal",
};

export default function SectionCard({
  section,
  dragListeners,
  isDragging,
  onEdit,
  onDelete,
  onToggleVisibility,
  disabled,
}) {
  const typeLabel = TYPE_LABELS[section.sectionType] ?? section.sectionType;
  const typeVariant = TYPE_VARIANTS[section.sectionType] ?? "default";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-colors",
        section.isVisible
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
        aria-label="Arrastrar para reordenar"
        {...dragListeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={typeVariant} size="sm">
            {typeLabel}
          </Badge>
          {section.title && (
            <span className="text-sm font-medium text-charcoal truncate">
              {section.title}
            </span>
          )}
        </div>
        {section.content && (
          <p className="text-xs text-charcoal-subtle mt-0.5 line-clamp-1">
            {section.content.slice(0, 120)}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onToggleVisibility(section)}
          disabled={disabled}
          className="p-1.5 rounded-lg text-charcoal-subtle hover:text-charcoal hover:bg-warm-gray transition-colors disabled:opacity-50"
          aria-label={section.isVisible ? "Ocultar sección" : "Mostrar sección"}
          title={section.isVisible ? "Visible" : "Oculta"}
        >
          {section.isVisible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onEdit(section)}
          disabled={disabled}
          className="p-1.5 rounded-lg text-charcoal-subtle hover:text-sage hover:bg-sage/10 transition-colors disabled:opacity-50"
          aria-label="Editar sección"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(section)}
          disabled={disabled}
          className="p-1.5 rounded-lg text-charcoal-subtle hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          aria-label="Eliminar sección"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
