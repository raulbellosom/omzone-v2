import { formatPrice } from "@/components/public/checkout/utils";
import { cn } from "@/lib/utils";

export default function AddonsStep({
  enrichedAddons,
  selectedAddonIds,
  toggleAddon,
  quantity,
}) {
  if (enrichedAddons.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-charcoal-subtle">
          No add-ons available for this experience.
        </p>
        <p className="text-xs text-charcoal-subtle/60 mt-1">
          You can continue to the next step.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-charcoal-subtle">
        Enhance your experience with optional add-ons.
      </p>

      <div className="grid gap-2">
        {enrichedAddons.map((addon) => {
          const isSelected = selectedAddonIds.includes(addon.$id);

          return (
            <button
              key={addon.$id}
              type="button"
              disabled={addon.isRequired}
              onClick={() => toggleAddon(addon.$id)}
              className={cn(
                "flex items-start gap-4 rounded-xl px-4 py-3 border text-left transition-all w-full",
                isSelected
                  ? "border-sage bg-sage/5 ring-1 ring-sage/40"
                  : "border-warm-gray-dark/20 bg-white hover:border-charcoal/20",
                addon.isRequired && "opacity-80 cursor-not-allowed",
              )}
            >
              {/* Checkbox indicator */}
              <span
                className={cn(
                  "flex-shrink-0 mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors",
                  isSelected
                    ? "bg-sage border-sage text-white"
                    : "border-warm-gray-dark/30 bg-white",
                )}
              >
                {isSelected && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-charcoal">
                    {addon.name}
                  </span>
                  {addon.isRequired && (
                    <span className="text-[10px] uppercase tracking-wider text-sage-dark bg-sage/10 px-1.5 py-0.5 rounded-full font-medium">
                      Required
                    </span>
                  )}
                </div>
                {addon.description && (
                  <p className="text-xs text-charcoal-subtle mt-0.5 line-clamp-2">
                    {addon.description}
                  </p>
                )}
              </div>

              <span className="text-sm font-semibold text-charcoal whitespace-nowrap">
                +{formatPrice(addon.effectivePrice, addon.currency)}
                {quantity > 1 && (
                  <span className="text-xs font-normal text-charcoal-subtle block">
                    × {quantity}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
