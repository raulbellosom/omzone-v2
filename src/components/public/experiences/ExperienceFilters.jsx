import { X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

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

  return (
    <div className="space-y-4">
      {/* Type pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onSelectType("")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
            !selectedType
              ? "bg-charcoal text-white shadow-sm"
              : "bg-warm-gray text-charcoal-muted hover:bg-sand hover:text-charcoal"
          }`}
        >
          {t("filters.allTypes")}
        </button>
        {TYPE_OPTIONS.map(({ value, labelKey }) => (
          <button
            key={value}
            onClick={() => onSelectType(selectedType === value ? "" : value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
              selectedType === value
                ? "bg-charcoal text-white shadow-sm"
                : "bg-warm-gray text-charcoal-muted hover:bg-sand hover:text-charcoal"
            }`}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {/* Tag pills — horizontal scroll on mobile */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1 [mask-image:linear-gradient(90deg,transparent,black_8px,black_calc(100%-8px),transparent)]">
          {tags.map((tag) => (
            <button
              key={tag.$id}
              onClick={() => onToggleTag(tag.$id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer ${
                selectedTags.includes(tag.$id)
                  ? "bg-sage/15 border-sage text-sage-dark"
                  : "bg-transparent border-warm-gray-dark/40 text-charcoal-subtle hover:border-sage/50 hover:text-charcoal-muted"
              }`}
            >
              {tag.name}
            </button>
          ))}

          {hasFilters && (
            <button
              onClick={onClear}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-charcoal-subtle hover:text-charcoal transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
              {t("filters.clear")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ExperienceFiltersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-full bg-warm-gray animate-pulse" />
        ))}
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-7 w-20 rounded-full bg-warm-gray animate-pulse" />
        ))}
      </div>
    </div>
  );
}
