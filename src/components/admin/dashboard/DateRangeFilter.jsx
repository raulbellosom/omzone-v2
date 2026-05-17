import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
} from "date-fns";

export const PRESETS = [
  "today",
  "thisWeek",
  "thisMonth",
  "last30",
  "last3m",
  "thisYear",
];

export function getPresetRange(preset) {
  const now = new Date();
  switch (preset) {
    case "today":
      return {
        start: startOfDay(now).toISOString(),
        end: endOfDay(now).toISOString(),
      };
    case "thisWeek":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        end: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      };
    case "thisMonth":
      return {
        start: startOfMonth(now).toISOString(),
        end: endOfMonth(now).toISOString(),
      };
    case "last30":
      return {
        start: startOfDay(subDays(now, 29)).toISOString(),
        end: endOfDay(now).toISOString(),
      };
    case "last3m":
      return {
        start: startOfDay(subMonths(now, 3)).toISOString(),
        end: endOfDay(now).toISOString(),
      };
    case "thisYear":
      return {
        start: startOfYear(now).toISOString(),
        end: endOfYear(now).toISOString(),
      };
    default:
      return {
        start: startOfMonth(now).toISOString(),
        end: endOfMonth(now).toISOString(),
      };
  }
}

export default function DateRangeFilter({ value, onChange }) {
  const { t } = useLanguage();

  const activePreset = useMemo(() => {
    if (!value) return "thisMonth";
    return (
      PRESETS.find((p) => {
        const r = getPresetRange(p);
        return r.start === value.start && r.end === value.end;
      }) ?? null
    );
  }, [value]);

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none shrink-0">
      {PRESETS.map((preset) => (
        <button
          key={preset}
          onClick={() => onChange(getPresetRange(preset))}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
            activePreset === preset
              ? "bg-sage text-white"
              : "bg-neutral-100 text-charcoal-muted hover:bg-sage/10 hover:text-sage",
          )}
        >
          {t(`admin.dashboard.filter.${preset}`)}
        </button>
      ))}
    </div>
  );
}
