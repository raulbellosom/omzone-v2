import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

export const ALL_GRANULARITIES = ["day", "week", "month"];

export default function GranularityFilter({ value, onChange, available }) {
  const { t } = useLanguage();
  if (!available || available.length <= 1) return null;

  return (
    <div className="flex gap-1 p-0.5 bg-neutral-100 rounded-lg">
      {available.map((g) => (
        <button
          key={g}
          onClick={() => onChange(g)}
          className={cn(
            "px-3 py-1 rounded-md text-xs font-medium transition-colors",
            value === g
              ? "bg-white text-charcoal shadow-sm"
              : "text-charcoal-muted hover:text-charcoal",
          )}
        >
          {t(`admin.dashboard.granularity.${g}`)}
        </button>
      ))}
    </div>
  );
}
