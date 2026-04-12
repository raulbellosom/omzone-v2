import { X, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/common/dropdown-menu";

const TYPE_OPTIONS = [
  { value: "session", labelKey: "experienceTypes.session" },
  { value: "immersion", labelKey: "experienceTypes.immersion" },
  { value: "retreat", labelKey: "experienceTypes.retreat" },
  { value: "stay", labelKey: "experienceTypes.stay" },
  { value: "private", labelKey: "experienceTypes.private" },
];

export default function ExperienceFilters({
  tags = [],
  selectedTags = [],
  selectedType = "",
  onToggleTag,
  onSelectType,
  onClear,
}) {
  const { t } = useLanguage();
  const hasFilters = selectedTags.length > 0 || selectedType !== "";
  const activeLabel = selectedType
    ? t(TYPE_OPTIONS.find((o) => o.value === selectedType)?.labelKey ?? "")
    : t("filters.allTypes");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Type dropdown — Radix */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "inline-flex items-center gap-2 pl-4 pr-3 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/30",
              selectedType
                ? "bg-charcoal text-white border-charcoal"
                : "bg-white text-charcoal border-warm-gray-dark/30 hover:border-sage/40",
            )}
          >
            {activeLabel}
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5",
                selectedType ? "text-white/70" : "text-charcoal-muted",
              )}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[160px]">
          <DropdownMenuItem
            onSelect={() => onSelectType("")}
            className={cn(!selectedType && "font-semibold text-sage")}
          >
            {!selectedType && <Check className="h-3.5 w-3.5 mr-1" />}
            {t("filters.allTypes")}
          </DropdownMenuItem>
          {TYPE_OPTIONS.map(({ value, labelKey }) => (
            <DropdownMenuItem
              key={value}
              onSelect={() => onSelectType(value)}
              className={cn(
                selectedType === value && "font-semibold text-sage",
              )}
            >
              {selectedType === value && <Check className="h-3.5 w-3.5 mr-1" />}
              {t(labelKey)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Divider */}
      <div className="hidden sm:block w-px h-6 bg-warm-gray-dark/20 shrink-0" />

      {/* Tag chips — horizontal scroll */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none -mx-1 px-1 [mask-image:linear-gradient(90deg,transparent,black_4px,black_calc(100%-4px),transparent)]">
          {tags.map((tag) => (
            <button
              key={tag.$id}
              onClick={() => onToggleTag(tag.$id)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer",
                selectedTags.includes(tag.$id)
                  ? "bg-sage/15 border-sage text-sage-dark"
                  : "bg-white border-warm-gray-dark/25 text-charcoal-subtle hover:border-sage/40 hover:text-charcoal-muted",
              )}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Clear button */}
      {hasFilters && (
        <button
          onClick={onClear}
          className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-charcoal-subtle hover:text-charcoal hover:bg-warm-gray/50 transition-colors cursor-pointer"
        >
          <X className="h-3 w-3" />
          {t("filters.clear")}
        </button>
      )}
    </div>
  );
}

export function ExperienceFiltersSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="h-9 w-32 rounded-full bg-warm-gray animate-pulse shrink-0" />
      <div className="hidden sm:block w-px h-6 bg-warm-gray/40 shrink-0" />
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-7 w-20 rounded-full bg-warm-gray animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
