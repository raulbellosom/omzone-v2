import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const CONFIG = {
  landing:       "bg-sage/15 text-sage-darker border-sage/25",
  blog:          "bg-olive/15 text-olive border-olive/25",
  highlight:     "bg-sand/50 text-charcoal border-sand-dark/50",
  institutional: "bg-charcoal/[0.08] text-charcoal-light border-charcoal/[0.12]",
  faq:           "bg-warm-gray-dark/20 text-charcoal-muted border-warm-gray-dark/35",
};

export default function PublicationCategoryChip({ category }) {
  const { t } = useLanguage();
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
      CONFIG[category] ?? "bg-warm-gray text-charcoal-muted border-warm-gray-dark/30"
    )}>
      {t(`admin.publicationCategories.${category}`) || category}
    </span>
  );
}
