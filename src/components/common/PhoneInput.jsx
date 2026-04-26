import { useState } from "react";
import { defaultCountries, parseCountry, FlagImage } from "react-international-phone";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

// ── Full country list — MX first, rest alphabetical ─────────────────────────
const ALL_COUNTRIES = (() => {
  const parsed = defaultCountries.map(parseCountry);
  const mx = parsed.find((c) => c.iso2 === "mx");
  const rest = parsed.filter((c) => c.iso2 !== "mx");
  return mx ? [mx, ...rest] : rest;
})();

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
  const { t } = useLanguage();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [country, setCountryState] = useState(() => detectCountry(value));
  const [localNumber, setLocalNumber] = useState(() =>
    extractLocal(value, detectCountry(value).dialCode),
  );

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
    setLocalNumber(raw);
    emit(country.dialCode, raw);
  }

  // ── Filter countries by search ───────────────────────────────────────────
  const filtered = search
    ? ALL_COUNTRIES.filter((c) => {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.dialCode.includes(q);
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
                      {c.name}
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
