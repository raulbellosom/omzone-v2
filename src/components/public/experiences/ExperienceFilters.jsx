import { X, ChevronDown, SlidersHorizontal } from "lucide-react";
import Button from "@/components/common/Button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/common/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/common/dropdown-menu";
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

  const selectedTagNames = tags
    .filter((t) => selectedTags.includes(t.$id))
    .map((t) => t.name);

  const tagSummary =
    selectedTagNames.length === 0
      ? null
      : selectedTagNames.length <= 2
        ? selectedTagNames.join(", ")
        : `${selectedTagNames.length} selected`;

  return (
    <div className="space-y-4">
      {/* Dropdown row */}
      <div className="flex flex-wrap items-center gap-3">
        <SlidersHorizontal className="hidden sm:block h-4 w-4 text-charcoal-subtle" />

        {/* Type select */}
        <Select
          value={selectedType || "__all__"}
          onValueChange={(v) => onSelectType(v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="w-[160px] h-10 text-sm">
            <SelectValue placeholder={t("filters.allTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("filters.allTypes")}</SelectItem>
            {TYPE_OPTIONS.map(({ value, labelKey }) => (
              <SelectItem key={value} value={value}>
                {t(labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tags multi-select dropdown */}
        {tags.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={
                  "flex h-10 items-center justify-between gap-2 rounded-xl border px-4 text-sm transition-colors cursor-pointer " +
                  (selectedTags.length > 0
                    ? "border-sage bg-sage/5 text-charcoal"
                    : "border-sand-dark bg-white text-charcoal-subtle hover:border-sage/50")
                }
              >
                <span className="truncate max-w-[140px]">
                  {tagSummary || t("filters.tags")}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-charcoal-muted" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[220px] max-h-[280px] overflow-y-auto">
              <DropdownMenuLabel>{t("filters.tags")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag.$id}
                  checked={selectedTags.includes(tag.$id)}
                  onCheckedChange={() => onToggleTag(tag.$id)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {tag.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Clear filters */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="gap-1.5 text-charcoal-muted hover:text-charcoal">
            <X className="h-3.5 w-3.5" />
            {t("filters.clear")}
          </Button>
        )}
      </div>

      {/* Active filter pills */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {selectedType && (
            <span className="inline-flex items-center gap-1 rounded-full bg-charcoal text-white text-xs font-medium px-3 py-1">
              {TYPE_OPTIONS.find((o) => o.value === selectedType)?.labelKey ? t(TYPE_OPTIONS.find((o) => o.value === selectedType).labelKey) : selectedType}
              <button
                onClick={() => onSelectType("")}
                className="ml-0.5 hover:text-white/70 transition-colors cursor-pointer"
                aria-label={`Remove ${selectedType} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {tags
            .filter((t) => selectedTags.includes(t.$id))
            .map((tag) => (
              <span
                key={tag.$id}
                className="inline-flex items-center gap-1 rounded-full bg-sage/15 text-sage-dark text-xs font-medium px-3 py-1"
              >
                {tag.name}
                <button
                  onClick={() => onToggleTag(tag.$id)}
                  className="ml-0.5 hover:text-sage transition-colors cursor-pointer"
                  aria-label={`Remove ${tag.name} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton placeholder matching the filter row height.
 */
export function ExperienceFiltersSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-4 w-4 rounded bg-warm-gray animate-pulse hidden sm:block" />
      <div className="h-10 w-[160px] rounded-xl bg-warm-gray animate-pulse" />
      <div className="h-10 w-[140px] rounded-xl bg-warm-gray animate-pulse" />
    </div>
  );
}
