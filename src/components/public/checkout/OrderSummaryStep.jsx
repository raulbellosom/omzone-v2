import { formatPrice } from "@/components/public/checkout/utils";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function OrderSummaryStep({
  experience,
  selectedTier,
  selectedSlot,
  selectedAddons,
  quantity,
  indicativeTotal,
  currency,
  submitting,
  submitError,
  onSubmit,
}) {
  return (
    <div className="space-y-6">
      {/* Line items */}
      <div className="rounded-xl border border-warm-gray-dark/20 bg-white divide-y divide-warm-gray-dark/10">
        {/* Experience */}
        <div className="px-4 py-3 flex justify-between items-start">
          <div className="min-w-0">
            <p className="text-sm font-medium text-charcoal">
              {experience.publicName}
            </p>
            {selectedTier && (
              <p className="text-xs text-charcoal-subtle mt-0.5">
                {selectedTier.name}
                {quantity > 1 && ` × ${quantity}`}
              </p>
            )}
            {selectedSlot && (
              <p className="text-xs text-charcoal-subtle mt-0.5">
                {new Date(selectedSlot.startDatetime).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}{" "}
                ·{" "}
                {new Date(selectedSlot.startDatetime).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
          <span className="text-sm font-semibold text-charcoal whitespace-nowrap">
            {selectedTier
              ? formatPrice(selectedTier.basePrice * quantity, currency)
              : "–"}
          </span>
        </div>

        {/* Addons */}
        {selectedAddons.map((addon) => (
          <div
            key={addon.$id}
            className="px-4 py-3 flex justify-between items-center"
          >
            <div>
              <p className="text-sm text-charcoal">{addon.name}</p>
              {quantity > 1 && (
                <p className="text-xs text-charcoal-subtle">× {quantity}</p>
              )}
            </div>
            <span className="text-sm font-semibold text-charcoal whitespace-nowrap">
              {formatPrice(addon.effectivePrice * quantity, currency)}
            </span>
          </div>
        ))}

        {/* Total */}
        <div className="px-4 py-3 flex justify-between items-center">
          <span className="text-sm font-bold text-charcoal">
            Estimated Total
          </span>
          <span className="text-lg font-bold text-charcoal">
            {formatPrice(indicativeTotal, currency)}
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-charcoal-subtle text-center">
        The final amount will be verified before payment is processed.
      </p>

      {/* Error */}
      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* Submit */}
      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={submitting}
        onClick={onSubmit}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing…
          </span>
        ) : (
          "Confirm & Pay"
        )}
      </Button>
    </div>
  );
}
