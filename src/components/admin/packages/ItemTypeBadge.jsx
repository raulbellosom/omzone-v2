import { cn } from "@/lib/utils";

const ITEM_TYPE_CONFIG = {
  experience: { label: "Experiencia", icon: "🧘", color: "bg-sage/15 text-sage-dark" },
  addon: { label: "Addon", icon: "✨", color: "bg-amber-50 text-amber-700" },
  benefit: { label: "Beneficio", icon: "🎁", color: "bg-purple-50 text-purple-700" },
  accommodation: { label: "Hospedaje", icon: "🏠", color: "bg-blue-50 text-blue-700" },
  meal: { label: "Alimentación", icon: "🍽️", color: "bg-orange-50 text-orange-700" },
};

export default function ItemTypeBadge({ type, className }) {
  const config = ITEM_TYPE_CONFIG[type] || {
    label: type,
    icon: "📦",
    color: "bg-warm-gray text-charcoal-muted",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.color,
        className,
      )}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}

export { ITEM_TYPE_CONFIG };
