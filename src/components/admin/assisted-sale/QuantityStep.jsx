import { Minus, Plus } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import WizardStepWrapper from "./WizardStepWrapper";
import { computeCheckoutConstraints } from "@/lib/checkoutRules";

function formatPrice(amount, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div
      className={`flex justify-between items-center py-1.5 ${
        highlight ? "font-semibold text-charcoal" : "text-sm text-charcoal-muted"
      }`}
    >
      <span>{label}</span>
      <span className={highlight ? "text-base text-charcoal" : ""}>{value}</span>
    </div>
  );
}

export default function QuantityStep({ wizard, setWizardField }) {
  const { t } = useLanguage();
  const { experience, pricingTier, slot, quantity } = wizard;
  const currency = pricingTier?.currency || "MXN";

  const constraints = computeCheckoutConstraints({
    experience,
    tier: pricingTier,
    slot: slot || null,
    quantity,
  });
  const min = constraints.effectiveMin;
  const max = constraints.effectiveMax;
  const rangeValid = constraints.isValid;
  const canAdjust = rangeValid && max >= min;

  function decrement() {
    if (!canAdjust) return;
    if (quantity > min) setWizardField("quantity", quantity - 1);
  }

  function increment() {
    if (!canAdjust) return;
    if (quantity < max) setWizardField("quantity", quantity + 1);
  }

  const baseTotal = pricingTier ? pricingTier.basePrice * quantity : 0;

  return (
    <WizardStepWrapper
      title={t("admin.assistedSale.quantity.title")}
      description={t("admin.assistedSale.quantity.description")}
    >
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={decrement}
          disabled={!canAdjust || quantity <= min}
          className="w-10 h-10 rounded-full border-2 border-sand-dark flex items-center justify-center hover:border-sage disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="h-4 w-4 text-charcoal" />
        </button>
        <div className="text-center">
          <span className="text-3xl font-bold text-charcoal tabular-nums">{quantity}</span>
          <p className="text-xs text-charcoal-muted mt-0.5">
            {t("admin.assistedSale.quantity.participants")}
          </p>
        </div>
        <button
          type="button"
          onClick={increment}
          disabled={!canAdjust || quantity >= max}
          className="w-10 h-10 rounded-full border-2 border-sand-dark flex items-center justify-center hover:border-sage disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4 text-charcoal" />
        </button>
      </div>

      {!rangeValid && (
        <p className="text-xs text-red-700 mb-4">
          {t("admin.assistedSale.quantity.invalidRange")}
        </p>
      )}

      {rangeValid && (
        <p className="text-xs text-charcoal-subtle mb-4">
          {t("admin.assistedSale.quantity.allowedRange")
            .replace("{min}", String(min))
            .replace("{max}", String(max))}
        </p>
      )}

      {pricingTier && (
        <div className="rounded-xl border border-sand-dark/40 bg-warm-gray/20 p-4 divide-y divide-sand-dark/20">
          <SummaryRow
            label={`${pricingTier.name} × ${quantity}`}
            value={formatPrice(baseTotal, currency)}
          />
          {wizard.selectedAddonIds.length > 0 && (
            <SummaryRow
              label={t("admin.assistedSale.quantity.addonsCount").replace(
                "{count}",
                wizard.selectedAddonIds.length,
              )}
              value={t("admin.assistedSale.quantity.seeInReview")}
            />
          )}
          <SummaryRow
            label={t("admin.assistedSale.quantity.estimatedTotal")}
            value={formatPrice(baseTotal, currency)}
            highlight
          />
          <p className="pt-2 text-xs text-charcoal-subtle">
            {t("admin.assistedSale.quantity.serverNote")}
          </p>
        </div>
      )}
    </WizardStepWrapper>
  );
}
