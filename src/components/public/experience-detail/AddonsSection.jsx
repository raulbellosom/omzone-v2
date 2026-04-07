import { Plus } from "lucide-react";

function formatPrice(amount, currency = "MXN") {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

const ADDON_TYPE_LABELS = {
  service:   "Service",
  product:   "Product",
  transport: "Transport",
  food:      "Food & Beverage",
  upgrade:   "Upgrade",
};

function AddonCard({ addon }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-warm-gray-dark/30 bg-white p-4 md:p-5">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-sage/10 flex items-center justify-center">
        <Plus className="h-4 w-4 text-sage" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h4 className="text-sm font-semibold text-charcoal">{addon.name}</h4>
            {addon.addonType && (
              <span className="text-xs text-charcoal-subtle">{ADDON_TYPE_LABELS[addon.addonType] ?? addon.addonType}</span>
            )}
          </div>
          <p className="text-sm font-semibold text-charcoal flex-shrink-0">
            +{formatPrice(addon.basePrice, addon.currency)}
          </p>
        </div>
        {addon.description && (
          <p className="mt-1.5 text-sm text-charcoal-muted leading-relaxed">{addon.description}</p>
        )}
      </div>
    </div>
  );
}

export default function AddonsSection({ addons }) {
  if (!addons || addons.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container-shell">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-2">Add-ons</h2>
        <p className="text-charcoal-muted mb-8">Enhance your experience with these optional extras.</p>

        <div className="grid gap-3 sm:grid-cols-2 max-w-4xl">
          {addons.map((addon) => (
            <AddonCard key={addon.$id} addon={addon} />
          ))}
        </div>
      </div>
    </section>
  );
}
