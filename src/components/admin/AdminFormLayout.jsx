import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

export default function AdminFormLayout({
  children,
  onSubmit,
  submitting = false,
  disabled = false,
  submitLabel,
  onCancel,
  cancelLabel,
  isDirty,
  asideChildren,
}) {
  const { t } = useLanguage();

  const label = submitLabel || t("admin.common.saveChanges");
  const isDisabled = disabled || submitting;

  const submitButton = (fullWidth) => (
    <Button
      type="submit"
      disabled={isDisabled}
      size="md"
      className={fullWidth ? "w-full" : "w-full sm:w-auto"}
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
  );

  const cancelButton = (fullWidth) =>
    onCancel ? (
      <Button
        type="button"
        variant="ghost"
        size="md"
        onClick={onCancel}
        disabled={isDisabled}
        className={fullWidth ? "w-full" : "w-full sm:w-auto"}
      >
        {cancelLabel || t("common.cancel")}
      </Button>
    ) : null;

  const dirtyIndicator = () =>
    isDirty && !submitting ? (
      <span className="flex items-center gap-1.5 text-xs text-charcoal-muted animate-in fade-in">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        {t("admin.common.unsavedChanges")}
      </span>
    ) : null;

  return (
    <form onSubmit={onSubmit}>
      <div className="lg:flex lg:gap-6 lg:items-start">
        {/* Left: form fields */}
        <div className="space-y-6 lg:flex-1 min-w-0">{children}</div>

        {/* Right: desktop aside */}
        <aside className="hidden lg:block lg:w-72 xl:w-80 shrink-0 self-start sticky top-0 space-y-4">
          <div className="rounded-2xl border border-sand-dark/40 bg-white p-4 shadow-sm space-y-3">
            <p className="text-xs font-semibold text-charcoal-subtle uppercase tracking-wider">
              {t("admin.common.actions")}
            </p>
            {submitButton(true)}
            {cancelButton(true)}
            {dirtyIndicator()}
          </div>
          {asideChildren}
        </aside>
      </div>

      {/* Mobile/tablet: sticky bottom bar */}
      <div className="lg:hidden">
        <div className="h-20" aria-hidden="true" />
        <div className={cn("sticky bottom-0 z-20", "-mx-4 md:-mx-6")}>
          <div
            className="h-6 pointer-events-none bg-linear-to-t from-warm-gray to-transparent"
            aria-hidden="true"
          />
          <div className="py-3 px-4 md:px-6 border-t border-warm-gray-dark/15 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] bg-warm-gray">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {submitButton(false)}
              {cancelButton(false)}
              {dirtyIndicator()}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
