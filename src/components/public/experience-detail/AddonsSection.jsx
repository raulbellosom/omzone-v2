import { Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

function formatPrice(amount, currency = "MXN") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const ADDON_TYPE_KEYS = {
  service: "addonsSection.typeService",
  product: "addonsSection.typeProduct",
  transport: "addonsSection.typeTransport",
  food: "addonsSection.typeFood",
  upgrade: "addonsSection.typeUpgrade",
};

function AddonCard({ addon, t }) {
  return (
    <div
      className="flex items-start gap-4 rounded-xl border border-warm-gray-dark/30 bg-white p-4 md:p-5 w-full"
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-sage/10 text-sage">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h4 className="text-sm font-semibold text-charcoal">
              {addon.name}
              {addon.isRequired && (
                <span className="ml-2 inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 rounded-full px-2 py-0.5">
                  {t("addonsSection.recommended")}
                </span>
              )}
            </h4>
            {addon.addonType && (
              <span className="text-xs text-charcoal-subtle">
                {ADDON_TYPE_KEYS[addon.addonType]
                  ? t(ADDON_TYPE_KEYS[addon.addonType])
                  : addon.addonType}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-charcoal flex-shrink-0">
            +{formatPrice(addon.basePrice, addon.currency)}
          </p>
        </div>
        {addon.description && (
          <p className="mt-1.5 text-sm text-charcoal-muted leading-relaxed">
            {addon.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AddonsSection({ addons }) {
  const { t } = useLanguage();
  if (!addons || addons.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container-shell">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-2">
          {t("addonsSection.title")}
        </h2>
        <p className="text-charcoal-muted mb-8">
          {t("addonsSection.subtitle")}
        </p>

        <div className="grid gap-3 sm:grid-cols-2 max-w-4xl">
          {addons.map((addon) => (
            <AddonCard key={addon.$id} addon={addon} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
