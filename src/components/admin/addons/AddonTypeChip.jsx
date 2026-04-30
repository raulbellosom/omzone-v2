import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const CONFIG = {
  service:       "bg-sage/15 text-sage-darker border-sage/25",
  transport:     "bg-olive/15 text-olive border-olive/25",
  food:          "bg-sand/50 text-charcoal border-sand-dark/50",
  accommodation: "bg-charcoal/[0.08] text-charcoal-light border-charcoal/[0.12]",
  equipment:     "bg-cream-dark/70 text-charcoal border-charcoal/10",
  other:         "bg-warm-gray-dark/20 text-charcoal-muted border-warm-gray-dark/35",
};

export default function AddonTypeChip({ type }) {
  const { t } = useLanguage();
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
      CONFIG[type] ?? "bg-warm-gray text-charcoal-muted border-warm-gray-dark/30"
    )}>
      {t(`admin.addonTypes.${type}`) || type}
    </span>
  );
}
