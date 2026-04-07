/**
 * AdminSelect — Radix-powered styled dropdown for admin forms and filters.
 *
 * API matches the native <select> pattern used across admin pages:
 *   value, onChange(value), options[{value,label}], placeholder, disabled, error, className
 *
 * Handles empty-string values internally (Radix Select doesn't accept "").
 */
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/common/select";
import { cn } from "@/lib/utils";

const EMPTY_SENTINEL = "__empty__";

export default function AdminSelect({
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  error = false,
  className,
  minWidth = "min-w-[160px]",
  triggerClassName,
  fullWidth = true,
}) {
  // Map "" ↔ sentinel because Radix Select ignores empty-string values
  const radixValue = value === "" || value == null ? EMPTY_SENTINEL : value;

  function handleChange(next) {
    onChange(next === EMPTY_SENTINEL ? "" : next);
  }

  // Separate "all" option (value="") from the rest
  const allOption = options.find((o) => o.value === "");
  const realOptions = options.filter((o) => o.value !== "");

  return (
    <Select value={radixValue} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          "h-10 cursor-pointer",
          fullWidth ? "w-full" : "w-auto",
          minWidth,
          error && "border-red-400",
          triggerClassName,
          className,
        )}
      >
        <SelectValue
          placeholder={placeholder || allOption?.label || "Select…"}
        />
      </SelectTrigger>
      <SelectContent>
        {allOption && (
          <SelectItem value={EMPTY_SENTINEL}>{allOption.label}</SelectItem>
        )}
        {realOptions.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
