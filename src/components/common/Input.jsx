import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

const TEMPORAL_PLACEHOLDERS = {
  date: "YYYY-MM-DD",
  "datetime-local": "YYYY-MM-DD, HH:MM",
  time: "HH:MM",
  month: "YYYY-MM",
  week: "YYYY-W##",
};

const Input = forwardRef(
  (
    {
      className,
      containerClassName,
      type,
      icon: Icon,
      rightElement,
      value,
      placeholder,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const hasIcon = !!Icon;
    const hasRight = !!rightElement;
    const inputType = type ?? "text";
    const isTemporal = TEMPORAL_PLACEHOLDERS[inputType] !== undefined;
    const temporalPlaceholder = placeholder || TEMPORAL_PLACEHOLDERS[inputType];
    const showTemporalPlaceholder = isTemporal && !value && !focused;

    return (
      <div className={cn("relative min-w-0 w-full", containerClassName)}>
        {hasIcon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-subtle">
            <Icon size={18} strokeWidth={1.8} />
          </span>
        )}
        <input
          type={inputType}
          value={value ?? ""}
          placeholder={placeholder}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          className={cn(
            "flex h-11 min-w-0 max-w-full w-full rounded-xl border border-sand-dark bg-white py-2 text-sm text-charcoal placeholder:text-charcoal-subtle transition-colors",
            "focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-gray",
            hasIcon ? "pl-10 pr-4" : "px-4",
            hasRight && !hasIcon ? "pl-4 pr-10" : "",
            hasRight && hasIcon ? "pr-10" : "",
            isTemporal && "[color-scheme:light]",
            showTemporalPlaceholder &&
              "text-transparent [&::-webkit-datetime-edit]:text-transparent",
            className,
          )}
          ref={ref}
          {...props}
        />
        {showTemporalPlaceholder && (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-0 right-12 flex items-center truncate text-sm text-charcoal-subtle",
              hasIcon ? "left-10" : "left-4",
              props.disabled && "opacity-50",
            )}
          >
            {temporalPlaceholder}
          </span>
        )}
        {hasRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
export default Input;
