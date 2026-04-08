import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const ITEM_TYPE_CONFIG = {
  experience: {
    i18nKey: "experience",
    icon: "🧘",
    color: "bg-sage/15 text-sage-dark",
  },
  addon: { i18nKey: "addon", icon: "✨", color: "bg-amber-50 text-amber-700" },
  benefit: {
    i18nKey: "benefit",
    icon: "🎁",
    color: "bg-purple-50 text-purple-700",
  },
  accommodation: {
    i18nKey: "accommodation",
    icon: "🏠",
    color: "bg-blue-50 text-blue-700",
  },
  meal: { i18nKey: "meal", icon: "🍽️", color: "bg-orange-50 text-orange-700" },
};

export default function ItemTypeBadge({ type, className }) {
  const { t } = useLanguage();
  const config = ITEM_TYPE_CONFIG[type] || {
    i18nKey: null,
    icon: "📦",
    color: "bg-warm-gray text-charcoal-muted",
  };
  const label = config.i18nKey ? t(`admin.itemType.${config.i18nKey}`) : type;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.color,
        className,
      )}
    >
      <span>{config.icon}</span>
      {label}
    </span>
  );
}

export { ITEM_TYPE_CONFIG };
