import { useState, useEffect } from "react";
import { Input } from "@/components/common/Input";
import { cn } from "@/lib/utils";

function sanitizeSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function SlugInput({ value, onChange, error, disabled }) {
  const [manualOverride, setManualOverride] = useState(false);

  function handleChange(e) {
    setManualOverride(true);
    onChange(sanitizeSlug(e.target.value));
  }

  // Allow parent to reset override (e.g., when publicName clears)
  useEffect(() => {
    if (!value) setManualOverride(false);
  }, [value]);

  return (
    <div>
      <div className="relative">
        <Input
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="mi-experiencia-slug"
          className={cn(error && "border-red-400 focus:border-red-400 focus:ring-red-100")}
        />
        {manualOverride && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-charcoal-subtle">
            manual
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <p className="mt-1 text-xs text-charcoal-subtle">
        Solo minúsculas, números y guiones. Se genera automáticamente desde el nombre público.
      </p>
    </div>
  );
}
