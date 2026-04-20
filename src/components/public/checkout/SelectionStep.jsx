import { formatPrice } from "@/components/public/checkout/utils";
import { cn } from "@/lib/utils";
import { useLanguage, localizedField } from "@/hooks/useLanguage";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/common/select";

export default function SelectionStep({
  experience,
  pricingTiers,
  slots,
  selectedTierId,
  setSelectedTierId,
  selectedSlotId,
  setSelectedSlotId,
  quantity,
  setQuantity,
}) {
  const { t, language } = useLanguage();
  const minQty = experience.minQuantity || 1;
  const maxQty = experience.maxQuantity || 20;

  return (
    <div className="space-y-6">
      {/* Experience summary */}
      <div className="rounded-xl border border-warm-gray-dark/20 bg-white p-4 flex gap-4 items-center">
        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-warm-gray flex items-center justify-center text-2xl">
          🧘
        </div>
        <div className="min-w-0">
          <p className="text-xs text-charcoal-subtle uppercase tracking-wider">
            {experience.type}
          </p>
          <h3 className="text-base font-semibold text-charcoal truncate">
            {localizedField(experience, "publicName", language)}
          </h3>
        </div>
      </div>

      {/* Pricing tier selection */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-charcoal mb-2">
          {t("selection.selectOption")}
        </legend>
        <div className="grid gap-2">
          {pricingTiers.map((tier) => (
            <label
              key={tier.$id}
              className={cn(
                "flex items-center justify-between rounded-xl px-4 py-3 border cursor-pointer transition-all",
                selectedTierId === tier.$id
                  ? "border-sage bg-sage/5 ring-1 ring-sage/40"
                  : "border-warm-gray-dark/20 bg-white hover:border-charcoal/20",
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="pricingTier"
                  value={tier.$id}
                  checked={selectedTierId === tier.$id}
                  onChange={() => setSelectedTierId(tier.$id)}
                  className="accent-sage"
                />
                <div>
                  <span className="text-sm font-medium text-charcoal">
                    {localizedField(tier, "name", language)}
                  </span>
                  {tier.badge && (
                    <span className="ml-2 text-xs bg-sage text-white rounded-full px-2 py-0.5">
                      {tier.badge}
                    </span>
                  )}
                  {localizedField(tier, "description", language) && (
                    <p className="text-xs text-charcoal-subtle mt-0.5">
                      {localizedField(tier, "description", language)}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-sm font-bold text-charcoal whitespace-nowrap">
                {formatPrice(tier.basePrice, tier.currency)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Slot selection */}
      {experience.requiresSchedule && slots.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-charcoal mb-2">
            {t("selection.chooseDateTime")}
          </legend>
          <Select
            value={selectedSlotId || "__empty__"}
            onValueChange={(v) => setSelectedSlotId(v === "__empty__" ? "" : v)}
          >
            <SelectTrigger className="w-full h-12 cursor-pointer">
              <SelectValue placeholder={t("selection.selectTimeSlot")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__empty__">
                {t("selection.selectTimeSlot")}
              </SelectItem>
              {slots.map((slot) => {
                const start = new Date(slot.startDatetime);
                const end = new Date(slot.endDatetime);
                const available = slot.capacity - slot.bookedCount;
                return (
                  <SelectItem key={slot.$id} value={slot.$id}>
                    {start.toLocaleDateString(
                      language === "es" ? "es-MX" : "en-US",
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      },
                    )}{" "}
                    ·{" "}
                    {start.toLocaleTimeString(
                      language === "es" ? "es-MX" : "en-US",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                      },
                    )}
                    {" – "}
                    {end.toLocaleTimeString(
                      language === "es" ? "es-MX" : "en-US",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                      },
                    )}{" "}
                    ({available}{" "}
                    {available === 1
                      ? t("selection.spot")
                      : t("selection.spots")}{" "}
                    left)
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </fieldset>
      )}

      {/* Quantity selector */}
      {experience.allowQuantity && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-charcoal mb-2">
            {t("selection.attendees")}
          </legend>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(minQty, quantity - 1))}
              disabled={quantity <= minQty}
              className="w-10 h-10 rounded-full border border-warm-gray-dark/20 bg-white flex items-center justify-center text-charcoal hover:bg-warm-gray disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              −
            </button>
            <span className="text-lg font-semibold text-charcoal w-8 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
              disabled={quantity >= maxQty}
              className="w-10 h-10 rounded-full border border-warm-gray-dark/20 bg-white flex items-center justify-center text-charcoal hover:bg-warm-gray disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>
        </fieldset>
      )}
    </div>
  );
}
