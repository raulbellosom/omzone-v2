import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

function formatPrice(amount, currency = "MXN") {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

function PricingTierCard({ tier, t }) {
  return (
    <div className={cn(
      "relative flex flex-col rounded-2xl border p-6 transition-all",
      tier.isHighlighted
        ? "border-charcoal/20 bg-white shadow-md"
        : "border-warm-gray-dark/30 bg-white shadow-card hover:shadow-md"
    )}>
      {tier.badge && (
        <span className={cn(
          "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
          tier.isHighlighted ? "bg-charcoal/90 text-white" : "bg-charcoal text-white"
        )}>
          {tier.badge}
        </span>
      )}

      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold text-charcoal">{tier.name}</h3>
        {tier.description && (
          <p className="mt-1.5 text-sm text-charcoal-muted leading-relaxed">{tier.description}</p>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-warm-gray-dark/20">
        <p className="text-2xl font-bold text-charcoal">
          {formatPrice(tier.basePrice, tier.currency)}
          <span className="text-sm font-normal text-charcoal-subtle ml-1">{tier.currency}</span>
        </p>
        {(tier.minPersons || tier.maxPersons) && (
          <p className="text-xs text-charcoal-subtle mt-1">
            {tier.minPersons && tier.maxPersons
              ? t("pricingSection.personsRange").replace("{min}", tier.minPersons).replace("{max}", tier.maxPersons)
              : tier.minPersons
                ? t("pricingSection.personsMin").replace("{min}", tier.minPersons)
                : t("pricingSection.personsMax").replace("{max}", tier.maxPersons)}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PricingSection({ tiers }) {
  const { t } = useLanguage();
  if (!tiers || tiers.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container-shell">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-2">{t("pricingSection.title")}</h2>
        <p className="text-charcoal-muted mb-8">{t("pricingSection.subtitle")}</p>

        <div className={cn(
          "grid gap-6",
          tiers.length === 1 ? "max-w-sm" :
          tiers.length === 2 ? "sm:grid-cols-2 max-w-2xl" :
          "sm:grid-cols-2 lg:grid-cols-3"
        )}>
          {tiers.map((tier) => (
            <PricingTierCard key={tier.$id} tier={tier} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
