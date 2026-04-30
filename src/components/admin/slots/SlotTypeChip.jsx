import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const CONFIG = {
  single_session: "bg-sage/15 text-sage-darker border-sage/25",
  multi_day:      "bg-olive/15 text-olive border-olive/25",
  retreat_day:    "bg-sand/50 text-charcoal border-sand-dark/50",
  private:        "bg-charcoal/[0.08] text-charcoal-light border-charcoal/[0.12]",
};

const LABELS = {
  single_session: "admin.slotForm.typeSingle",
  multi_day:      "admin.slotForm.typeMultiDay",
  retreat_day:    "admin.slotForm.typeRetreatDay",
  private:        "admin.slotForm.typePrivate",
};

export default function SlotTypeChip({ type }) {
  const { t } = useLanguage();
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
      CONFIG[type] ?? "bg-warm-gray text-charcoal-muted border-warm-gray-dark/30"
    )}>
      {LABELS[type] ? t(LABELS[type]) : type}
    </span>
  );
}
