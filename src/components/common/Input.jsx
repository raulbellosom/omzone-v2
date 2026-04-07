import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef(({ className, type, icon: Icon, rightElement, value, ...props }, ref) => {
  const hasIcon = !!Icon;
  const hasRight = !!rightElement;

  return (
    <div className="relative">
      {hasIcon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-subtle">
          <Icon size={18} strokeWidth={1.8} />
        </span>
      )}
      <input
        type={type ?? "text"}
        value={value ?? ""}
        className={cn(
          "flex h-11 w-full rounded-xl border border-sand-dark bg-white py-2 text-sm text-charcoal placeholder:text-charcoal-subtle transition-colors",
          "focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-gray",
          hasIcon ? "pl-10 pr-4" : "px-4",
          hasRight && !hasIcon ? "pl-4 pr-10" : "",
          hasRight && hasIcon ? "pr-10" : "",
          className,
        )}
        ref={ref}
        {...props}
      />
      {hasRight && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </span>
      )}
    </div>
  );
});
Input.displayName = "Input";

export { Input };
export default Input;
