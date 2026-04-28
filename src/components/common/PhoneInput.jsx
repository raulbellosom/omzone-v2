import { useState, useEffect, useRef } from "react";
import {
  defaultCountries,
  parseCountry,
  FlagImage,
} from "react-international-phone";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

// ── Full country list — MX first, US second, rest alphabetical ─────────────
const ALL_COUNTRIES = (() => {
  const parsed = defaultCountries.map(parseCountry);
  const mx = parsed.find((c) => c.iso2 === "mx");
  const us = parsed.find((c) => c.iso2 === "us");
  const rest = parsed.filter((c) => c.iso2 !== "mx" && c.iso2 !== "us");
  return [...[mx, us].filter(Boolean), ...rest];
})();

// Country display names via Intl.DisplayNames — browser-native, covers all countries
const displayNames = {
  es: new Intl.DisplayNames(["es"], { type: "region" }),
  en: new Intl.DisplayNames(["en"], { type: "region" }),
};

// Returns name in the given locale, falling back to the other locale then iso2
function getCountryName(iso2, locale = "es") {
  const code = iso2.toUpperCase();
  const primary = displayNames[locale] ?? displayNames.es;
  const fallback = locale === "es" ? displayNames.en : displayNames.es;
  try {
    return primary.of(code) || fallback.of(code) || iso2;
  } catch {
    return iso2;
  }
}

// Sorted by dialCode length DESC to avoid prefix collisions on detection
const BY_DIAL_LEN = [...ALL_COUNTRIES].sort(
  (a, b) => b.dialCode.length - a.dialCode.length,
);

// ── Helpers ─────────────────────────────────────────────────────────────────
function detectCountry(phone) {
  if (!phone) return ALL_COUNTRIES[0];
  const clean = phone.replace(/[\s-]/g, "");
  for (const c of BY_DIAL_LEN) {
    if (clean.startsWith(`+${c.dialCode}`)) return c;
  }
  return ALL_COUNTRIES[0];
}

function extractLocal(phone, dialCode) {
  if (!phone) return "";
  return phone.replace(/[\s-]/g, "").replace(`+${dialCode}`, "");
}

// ── Component ────────────────────────────────────────────────────────────────
/**
 * PhoneInput — split country selector + local number input.
 *
 * Props:
 *   value     string  — full phone string (e.g. "+52 55 1234 5678"), controlled
 *   onChange  fn      — (fullPhone: string) => void  — emits E.164-compatible string
 *   onBlur    fn      — forwarded to the number <input>
 *   id        string  — applied to the number <input> for label association
 *   disabled  bool
 *   error     bool    — red border state
 *   className string
 */
export default function PhoneInput({
  value = "",
  onChange,
  onBlur,
  id,
  disabled = false,
  error = false,
  className,
}) {
  const { t, language } = useLanguage();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [country, setCountryState] = useState(() => detectCountry(value));
  const [localNumber, setLocalNumber] = useState(() =>
    extractLocal(value, detectCountry(value).dialCode),
  );

  // Sync internal state when the controlled `value` is set externally
  // (e.g., after profile loads asynchronously on first visit).
  // Only overwrite if the user hasn't started typing (localNumber still empty).
  const userTyping = useRef(false);
  useEffect(() => {
    if (!value || userTyping.current) return;
    const detected = detectCountry(value);
    setCountryState(detected);
    setLocalNumber(extractLocal(value, detected.dialCode));
  }, [value]);

  // ── Emit combined value ──────────────────────────────────────────────────
  function emit(dialCode, local) {
    const phone = local.trim() ? `+${dialCode} ${local.trim()}` : "";
    onChange?.(phone);
  }

  function handleCountrySelect(c) {
    setCountryState(c);
    setOpen(false);
    setSearch("");
    emit(c.dialCode, localNumber);
  }

  function handleLocalChange(e) {
    // Allow digits and spaces only
    const raw = e.target.value.replace(/[^\d\s]/g, "");
    userTyping.current = true;
    setLocalNumber(raw);
    emit(country.dialCode, raw);
  }

  // ── Filter countries by search ───────────────────────────────────────────
  const filtered = search
    ? ALL_COUNTRIES.filter((c) => {
        const raw = search.toLowerCase();
        // Strip leading + so "+1", "+52" etc. match dial codes
        const q = raw.replace(/^\+/, "");
        // Search in current locale name + English fallback for robustness
        const localeName = getCountryName(c.iso2, language).toLowerCase();
        const enName = getCountryName(c.iso2, "en").toLowerCase();
        return (
          localeName.includes(raw) ||
          enName.includes(raw) ||
          c.dialCode.includes(q)
        );
      })
    : ALL_COUNTRIES;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={cn("flex", className)}>
      {/* Country selector */}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label={`Country: ${country.name} +${country.dialCode}`}
            aria-expanded={open}
            aria-haspopup="listbox"
            className={cn(
              "flex items-center gap-1.5 h-11 px-3 rounded-l-xl border border-r-0 border-sand-dark bg-white",
              "text-sm text-charcoal whitespace-nowrap transition-colors select-none shrink-0",
              "focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 focus:z-10",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-gray",
              error && "border-red-400",
              open && "border-sage ring-2 ring-sage/20 z-10",
            )}
          >
            <FlagImage
              iso2={country.iso2}
              size={20}
              style={{ display: "block", flexShrink: 0 }}
              aria-hidden="true"
            />
            <span className="text-charcoal-subtle text-xs tabular-nums">
              +{country.dialCode}
            </span>
            <ChevronDown
              size={13}
              className={cn(
                "text-charcoal-subtle transition-transform duration-150",
                open && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="z-50 w-64 rounded-xl border border-sand-dark bg-white shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95"
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {/* Search */}
            <div className="p-2 border-b border-sand-dark/40">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("common.phoneSearchPlaceholder")}
                className="w-full rounded-lg border border-sand-dark px-3 py-1.5 text-sm text-charcoal placeholder:text-charcoal-subtle focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage/30"
              />
            </div>

            {/* Country list */}
            <ul
              className="max-h-52 overflow-y-auto py-1"
              role="listbox"
              aria-label="Select country"
            >
              {filtered.map((c) => (
                <li
                  key={c.iso2}
                  role="option"
                  aria-selected={c.iso2 === country.iso2}
                >
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors",
                      "hover:bg-warm-gray/50",
                      c.iso2 === country.iso2 && "bg-sage/10",
                    )}
                    onClick={() => handleCountrySelect(c)}
                  >
                    <FlagImage
                      iso2={c.iso2}
                      size={18}
                      style={{ display: "block", flexShrink: 0 }}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        "flex-1 truncate",
                        c.iso2 === country.iso2
                          ? "text-sage font-medium"
                          : "text-charcoal",
                      )}
                    >
                      {getCountryName(c.iso2, language)}
                    </span>
                    <span className="text-charcoal-subtle text-xs tabular-nums shrink-0">
                      +{c.dialCode}
                    </span>
                  </button>
                </li>
              ))}

              {filtered.length === 0 && (
                <li className="px-3 py-4 text-sm text-charcoal-subtle text-center">
                  {t("common.phoneNoCountries")}
                </li>
              )}
            </ul>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Local number input */}
      <input
        id={id}
        type="tel"
        value={localNumber}
        onChange={handleLocalChange}
        onBlur={onBlur}
        placeholder="55 1234 5678"
        disabled={disabled}
        autoComplete="tel-national"
        className={cn(
          "flex h-11 flex-1 min-w-0 rounded-r-xl border border-sand-dark bg-white px-4 py-2",
          "text-sm text-charcoal placeholder:text-charcoal-subtle transition-colors",
          "focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-gray",
          error && "border-red-400",
        )}
      />
    </div>
  );
}
