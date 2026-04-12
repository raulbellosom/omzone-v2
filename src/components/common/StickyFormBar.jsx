import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

/**
 * Sticky form action bar — sticks to the bottom of the scroll viewport.
 *
 * Renders a transparent spacer BEFORE the sticky container so content
 * hidden behind the bar can be scrolled into view. The sticky div uses
 * negative margins to bleed edge-to-edge and flush with <main>'s bottom.
 */
export default function StickyFormBar({
  submitting = false,
  disabled = false,
  submitLabel,
  onCancel,
  cancelLabel,
  isDirty,
  variant = "admin",
  className,
  children,
}) {
  const { t } = useLanguage();

  const label = submitLabel || t("admin.common.saveChanges");
  const isPortal = variant === "portal";

  return (
    <>
      {/* Scroll buffer — lets user scroll past content the bar covers */}
      <div className="h-10 " aria-hidden="true" />

      <div
        className={cn(
          "sticky bottom-10 md:bottom-0 z-20",
          isPortal ? "-mx-4 lg:-mx-8" : "-mx-4 md:-mx-6 lg:-mx-8",
          className,
        )}
      >
        {/* Gradient fade */}
        <div
          className={cn(
            "h-6 pointer-events-none",
            isPortal
              ? "bg-gradient-to-t from-cream to-transparent"
              : "bg-gradient-to-t from-warm-gray to-transparent",
          )}
          aria-hidden="true"
        />

        {/* Bar */}
        <div
          className={cn(
            "py-3 border-t border-warm-gray-dark/15 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]",
            isPortal
              ? "px-4 lg:px-8 bg-cream"
              : "px-4 md:px-6 lg:px-8 bg-warm-gray",
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Button
              type="submit"
              disabled={disabled || submitting}
              size="md"
              className="w-full sm:w-auto"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  {t("admin.common.saving")}
                </span>
              ) : (
                label
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={onCancel}
                disabled={disabled || submitting}
                className="w-full sm:w-auto"
              >
                {cancelLabel || t("common.cancel")}
              </Button>
            )}

            {isDirty && !submitting && (
              <span className="flex items-center justify-center gap-1.5 text-xs text-charcoal-muted animate-in fade-in sm:justify-start">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {t("admin.common.unsavedChanges")}
              </span>
            )}

            {children}
          </div>
        </div>
      </div>
    </>
  );
}
