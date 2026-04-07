import { Minus, Plus } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import WizardStepWrapper from "./WizardStepWrapper";

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
      className={`flex justify-between items-center py-1.5 ${highlight ? "font-semibold text-charcoal" : "text-sm text-charcoal-muted"}`}
    >
      <span>{label}</span>
      <span className={highlight ? "text-base text-charcoal" : ""}>
        {value}
      </span>
    </div>
  );
}

export default function QuantityStep({ wizard, setWizardField }) {
  const { t } = useLanguage();
  const { experience, pricingTier, quantity } = wizard;
  const min = experience?.minQuantity || 1;
  const max = experience?.maxQuantity || 99;
  const currency = pricingTier?.currency || "MXN";

  function decrement() {
    if (quantity > min) setWizardField("quantity", quantity - 1);
  }
  function increment() {
    if (quantity < max) setWizardField("quantity", quantity + 1);
  }

  // Price estimates (display only — server recalculates)
  const baseTotal = pricingTier ? pricingTier.basePrice * quantity : 0;

  return (
    <WizardStepWrapper
      title={t("admin.assistedSale.quantity.title")}
      description={t("admin.assistedSale.quantity.description")}
    >
      {/* Quantity picker */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={decrement}
          disabled={quantity <= min}
          className="w-10 h-10 rounded-full border-2 border-sand-dark flex items-center justify-center hover:border-sage disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="h-4 w-4 text-charcoal" />
        </button>
        <div className="text-center">
          <span className="text-3xl font-bold text-charcoal tabular-nums">
            {quantity}
          </span>
          <p className="text-xs text-charcoal-muted mt-0.5">
            {t("admin.assistedSale.quantity.participants")}
          </p>
        </div>
        <button
          type="button"
          onClick={increment}
          disabled={quantity >= max}
          className="w-10 h-10 rounded-full border-2 border-sand-dark flex items-center justify-center hover:border-sage disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4 text-charcoal" />
        </button>
        {min > 1 && (
          <p className="text-xs text-charcoal-subtle">
            {t("admin.assistedSale.quantity.minimum").replace("{min}", min)}
          </p>
        )}
      </div>

      {/* Price summary (indicative) */}
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
