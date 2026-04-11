import { CheckCircle2 } from "lucide-react";
import { usePricingTiers } from "@/hooks/usePricingTiers";
import { useLanguage } from "@/hooks/useLanguage";
import WizardStepWrapper from "./WizardStepWrapper";
import { cn } from "@/lib/utils";

function formatPrice(amount, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function TierCard({ tier, selected, onSelect, t }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-xl border-2 px-4 py-3.5 transition-all",
        selected
          ? "border-sage bg-sage/5"
          : tier.isHighlighted
            ? "border-sage/30 bg-sage/3 hover:border-sage/60"
            : "border-sand-dark/40 hover:border-sage/50",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-charcoal">{tier.name}</p>
            {tier.badge && (
              <span className="text-[10px] font-semibold bg-sage text-white rounded-full px-2 py-0.5 uppercase tracking-wide">
                {tier.badge}
              </span>
            )}
            {tier.isHighlighted && !tier.badge && (
              <span className="text-[10px] font-semibold bg-sage/20 text-sage rounded-full px-2 py-0.5 uppercase tracking-wide">
                {t("admin.assistedSale.tier.recommended")}
              </span>
            )}
          </div>
          {tier.description && (
            <p className="text-xs text-charcoal-muted mt-0.5">
              {tier.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-base font-bold text-charcoal">
            {formatPrice(tier.basePrice, tier.currency)}
          </span>
          {selected && <CheckCircle2 className="h-5 w-5 text-sage" />}
        </div>
      </div>
    </button>
  );
}

export default function PricingTierStep({ wizard, setWizardField }) {
  const { t } = useLanguage();
  const { data: tiers, loading } = usePricingTiers(wizard.experience?.$id);
  const activeTiers = tiers.filter((t) => t.isActive);

  function handleSelect(tier) {
    setWizardField("pricingTier", tier);
    // Reset slot when tier changes (price-sensitive)
    setWizardField("slot", null);
    setWizardField("slotSkipped", false);
  }

  if (!wizard.experience) {
    return (
      <WizardStepWrapper
        title={t("admin.assistedSale.tier.title")}
        description={t("admin.assistedSale.tier.noExperience")}
      >
        <p className="text-sm text-charcoal-muted">
          {t("admin.assistedSale.tier.goBack")}
        </p>
      </WizardStepWrapper>
    );
  }

  return (
    <WizardStepWrapper
      title={t("admin.assistedSale.tier.title")}
      description={t("admin.assistedSale.tier.description").replace(
        "{name}",
        wizard.experience.publicName,
      )}
    >
      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 rounded-full border-2 border-sage border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && activeTiers.length === 0 && (
        <p className="text-sm text-charcoal-muted py-4">
          {t("admin.assistedSale.tier.noTiers")}
        </p>
      )}

      <div className="space-y-2">
        {activeTiers.map((tier) => (
          <TierCard
            key={tier.$id}
            tier={tier}
            selected={wizard.pricingTier?.$id === tier.$id}
            onSelect={() => handleSelect(tier)}
            t={t}
          />
        ))}
      </div>
    </WizardStepWrapper>
  );
}
