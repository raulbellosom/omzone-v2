import { formatPrice } from "@/components/public/checkout/utils";
import { cn } from "@/lib/utils";
import { useLanguage, localizedField } from "@/hooks/useLanguage";

/**
 * Sticky sidebar on desktop / collapsible bottom bar on mobile
 * showing the running indicative total.
 */
export default function OrderSummary({
  selectedTier,
  selectedAddons,
  quantity,
  indicativeTotal,
  currency,
  className,
}) {
  const { t, language } = useLanguage();

  return (
    <aside
      className={cn(
        "rounded-2xl border border-warm-gray-dark/20 bg-white p-5 space-y-4",
        className,
      )}
    >
      <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider">
        {t("orderSummary.title")}
      </h3>

      <div className="divide-y divide-warm-gray-dark/10 text-sm">
        {selectedTier && (
          <div className="flex justify-between py-2">
            <span className="text-charcoal">
              {localizedField(selectedTier, "name", language)}
              {quantity > 1 && (
                <span className="text-charcoal-subtle"> × {quantity}</span>
              )}
            </span>
            <span className="font-medium text-charcoal">
              {formatPrice(selectedTier.basePrice * quantity, currency)}
            </span>
          </div>
        )}

        {selectedAddons.map((addon) => (
          <div key={addon.$id} className="flex justify-between py-2">
            <span className="text-charcoal">
              {localizedField(addon, "name", language)}
              {quantity > 1 && (
                <span className="text-charcoal-subtle"> × {quantity}</span>
              )}
            </span>
            <span className="font-medium text-charcoal">
              {formatPrice(addon.effectivePrice * quantity, currency)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-warm-gray-dark/20">
        <span className="text-sm font-bold text-charcoal">
          {t("orderSummary.total")}
        </span>
        <span className="text-xl font-bold text-charcoal">
          {formatPrice(indicativeTotal, currency)}
        </span>
      </div>

      <p className="text-[11px] text-charcoal-subtle leading-relaxed">
        {t("orderSummary.disclaimer")}
      </p>
    </aside>
  );
}
