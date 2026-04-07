import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export default function LanguageSwitcher({ className }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-warm-gray-dark/40 bg-white/60 p-0.5",
        className,
      )}
      role="radiogroup"
      aria-label="Language"
    >
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          role="radio"
          aria-checked={language === code}
          onClick={() => setLanguage(code)}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 min-w-[36px] min-h-[28px]",
            language === code
              ? "bg-charcoal text-white shadow-sm"
              : "text-charcoal-muted hover:text-charcoal",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
