import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Textarea = forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-20 w-full rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-subtle transition-colors resize-vertical",
        "focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-gray",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
export default Textarea;
