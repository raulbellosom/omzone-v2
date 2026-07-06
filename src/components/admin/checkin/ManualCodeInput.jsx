import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import Button from "@/components/common/Button";
import { cn } from "@/lib/utils";

export default function ManualCodeInput({
  onSubmitCode,
  disabled = false,
  focusToken = 0,
}) {
  const { t } = useLanguage();
  const [code, setCode] = useState("");
  const inputRef = useRef(null);

  // Refocus whenever the parent asks (e.g. modal closed).
  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(id);
  }, [focusToken]);

  const submitManual = () => {
    const sanitized = code.trim().toUpperCase();
    if (!sanitized) return;
    onSubmitCode(sanitized);
    setCode("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitManual();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm p-5">
      <label
        htmlFor="ticket-code-input"
        className="block text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-2"
      >
        {t("admin.checkin.manualSectionLabel")}
      </label>
      <div className="flex gap-3">
        <input
          ref={inputRef}
          id="ticket-code-input"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("admin.checkin.placeholder")}
          autoFocus
          autoComplete="off"
          disabled={disabled}
          className={cn(
            "flex-1 h-14 rounded-xl border border-sand-dark bg-white px-4 text-charcoal font-mono text-sm uppercase tracking-wide placeholder:text-charcoal-muted/40 placeholder:normal-case focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-shadow",
            disabled && "opacity-50",
          )}
        />
        <Button
          type="button"
          size="xl"
          disabled={disabled || !code.trim()}
          onClick={submitManual}
        >
          {t("admin.checkin.validate")}
        </Button>
      </div>
    </div>
  );
}
