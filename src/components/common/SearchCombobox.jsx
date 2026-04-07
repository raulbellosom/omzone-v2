/**
 * SearchCombobox — Searchable select with Radix Popover.
 *
 * API:  value, onValueChange(value), options[{value,label,description?,keywords?}],
 *       placeholder, searchPlaceholder, emptyMessage, disabled, error, className
 *
 * Mobile-safe: uses collisionPadding to stay inside viewport.
 */
import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/common/popover";
import { cn } from "@/lib/utils";

export default function SearchCombobox({
  value,
  onValueChange,
  options = [],
  placeholder = "Select…",
  searchPlaceholder = "Search",
  emptyMessage = "No results found.",
  disabled = false,
  error = false,
  className,
}) {
  const inputId = useId();
  const anchorRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(320);

  const selectedOption = options.find((o) => o.value === value) ?? null;
  const [query, setQuery] = useState(selectedOption?.label ?? "");

  // Sync label when value changes externally
  useEffect(() => {
    setQuery(selectedOption?.label ?? "");
  }, [selectedOption]);

  // Match panel width to trigger width
  useEffect(() => {
    if (!anchorRef.current) return undefined;
    const el = anchorRef.current;
    const update = () => setPanelWidth(el.offsetWidth || 320);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const isShowingSelectedLabel =
    selectedOption && normalizedQuery === selectedOption.label.toLowerCase();

  const filteredOptions = options.filter((o) => {
    if (!normalizedQuery || isShowingSelectedLabel) return true;
    const haystack = [o.label, o.description, ...(o.keywords ?? [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  function handleInputChange(e) {
    setQuery(e.target.value);
    setOpen(true);
    if (value) onValueChange("");
  }

  function handleSelect(option) {
    onValueChange(option.value);
    setQuery(option.label);
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleClear() {
    onValueChange("");
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div ref={anchorRef} className={cn("relative", className)}>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-subtle" />
          <input
            id={inputId}
            ref={inputRef}
            value={query}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={`${inputId}-listbox`}
            onFocus={() => setOpen(true)}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            className={cn(
              "flex h-11 w-full rounded-xl border border-sand-dark bg-white py-2 pl-10 pr-16 text-sm text-charcoal",
              "placeholder:text-charcoal-subtle transition-colors",
              "focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-gray",
              error && "border-red-400",
            )}
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
            {(query || value) && (
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full text-charcoal-muted transition-colors hover:text-charcoal hover:bg-warm-gray"
                onClick={handleClear}
                aria-label="Clear selection"
                tabIndex={-1}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronsUpDown className="h-4 w-4 text-charcoal-subtle" />
          </div>
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        className="max-h-72 overflow-hidden p-2"
        style={{ width: `${panelWidth}px` }}
      >
        <div className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-[0.15em] text-charcoal-subtle">
          {searchPlaceholder}
        </div>
        <div
          id={`${inputId}-listbox`}
          role="listbox"
          className="max-h-56 space-y-0.5 overflow-y-auto overscroll-contain pr-1"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left transition-colors",
                    isSelected
                      ? "bg-sage/10 text-charcoal"
                      : "text-charcoal-muted hover:bg-warm-gray/70 hover:text-charcoal",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(option)}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                      isSelected
                        ? "border-sage bg-sage text-white"
                        : "border-warm-gray-dark/40 bg-white text-transparent",
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-inherit">
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="mt-0.5 block text-xs text-charcoal-subtle">
                        {option.description}
                      </span>
                    )}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="rounded-lg border border-dashed border-warm-gray-dark/50 px-4 py-5 text-center text-sm text-charcoal-muted">
              {emptyMessage}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
