import { MapPin } from "lucide-react";
import { formatPrice } from "@/components/public/checkout/utils";
import { cn } from "@/lib/utils";
import { useLanguage, localizedField } from "@/hooks/useLanguage";
import OptimizedImage from "@/components/common/OptimizedImage";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/common/select";

function formatSlotLabel(slot, language, t) {
  const start = new Date(slot.startDatetime);
  const end = new Date(slot.endDatetime);
  const available = Math.max(
    0,
    Number(slot.capacity || 0) - Number(slot.bookedCount || 0),
  );
  const locale = language === "es" ? "es-MX" : "en-US";
  const datePart = start.toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const startPart = start.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
  const endPart = end.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart} · ${startPart} - ${endPart} (${available} ${
    available === 1 ? t("selection.spot") : t("selection.spots")
  })`;
}

function formatSlotLocation(slot, t) {
  const parts = [slot.locationName, slot.roomName, slot.locationAddress].filter(
    Boolean,
  );
  if (!parts.length) return t("selection.locationPending");
  return parts.join(" · ");
}

export default function SelectionStep({
  experience,
  pricingTiers,
  slots,
  selectedEdition,
  editionError,
  selectedTierId,
  setSelectedTierId,
  selectedSlotId,
  setSelectedSlotId,
  quantity,
  setQuantity,
  effectiveConstraints,
  quantityNotice,
  tierSlotCompatibility,
}) {
  const { t, language } = useLanguage();

  const editionName = selectedEdition
    ? localizedField(selectedEdition, "name", language) || selectedEdition.name
    : null;

  const canPickSlot = Boolean(selectedTierId);
  const requiresSchedule = Boolean(experience.requiresSchedule);
  const canPickQuantity = !requiresSchedule || Boolean(selectedSlotId);
  const minQty = effectiveConstraints?.effectiveMin ?? 1;
  const maxQty = effectiveConstraints?.effectiveMax ?? 1;
  const showRange = Number.isFinite(minQty) && Number.isFinite(maxQty);

  return (
    <div className="space-y-6">
      {editionName && (
        <div className="rounded-xl border border-sage/40 bg-sage/5 px-4 py-3 text-sm">
          <p className="text-xs uppercase tracking-wider text-sage font-semibold">
            {t("selection.youAreBookingEdition")}
          </p>
          <p className="mt-1 font-medium text-charcoal">{editionName}</p>
        </div>
      )}
      {editionError && !editionName && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("selection.editionNotAvailable")}
        </div>
      )}
      <div className="rounded-xl border border-warm-gray-dark/20 bg-white p-4 flex gap-4 items-center">
        <OptimizedImage
          fileId={experience.heroImageId}
          widths={[64, 128]}
          alt={localizedField(experience, "publicName", language)}
          className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden"
          imgClass="w-full h-full object-cover"
          aspectRatio="1/1"
        />
        <div className="min-w-0">
          <p className="text-xs text-charcoal-subtle uppercase tracking-wider">
            {experience.type}
          </p>
          <h3 className="text-base font-semibold text-charcoal truncate">
            {localizedField(experience, "publicName", language)}
          </h3>
        </div>
      </div>

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

      {requiresSchedule && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-charcoal mb-2">
            {t("selection.chooseDateTime")}
          </legend>
          <Select
            value={selectedSlotId || "__empty__"}
            onValueChange={(value) =>
              setSelectedSlotId(value === "__empty__" ? "" : value)
            }
            disabled={!canPickSlot}
          >
            <SelectTrigger className="w-full h-12 cursor-pointer disabled:opacity-50">
              <SelectValue
                placeholder={
                  canPickSlot
                    ? t("selection.selectTimeSlot")
                    : t("selection.selectTierFirst")
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__empty__">
                {t("selection.selectTimeSlot")}
              </SelectItem>
              {slots.map((slot) => (
                <SelectItem key={slot.$id} value={slot.$id}>
                  {formatSlotLabel(slot, language, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canPickSlot && slots.length === 0 && (
            <p className="text-xs text-amber-700">
              {t("selection.noCompatibleSlots")}
            </p>
          )}
          {selectedSlotId &&
            (() => {
              const selectedSlot = slots.find(
                (slot) => slot.$id === selectedSlotId,
              );
              const locationParts = selectedSlot
                ? [selectedSlot.locationName, selectedSlot.roomName].filter(
                    Boolean,
                  )
                : [];
              const address = selectedSlot?.locationAddress;
              if (!locationParts.length && !address) return null;
              return (
                <div className="flex items-start gap-2 mt-2 px-3 py-2.5 rounded-xl bg-sage/8 border border-sage/20 text-charcoal">
                  <MapPin className="h-4 w-4 text-sage mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    {locationParts.length > 0 && (
                      <p className="text-sm font-medium leading-snug">
                        {locationParts.join(" · ")}
                      </p>
                    )}
                    {address && (
                      <p className="text-xs text-charcoal-muted mt-0.5 leading-snug">
                        {address}
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}
        </fieldset>
      )}

      {experience.allowQuantity && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-charcoal mb-2">
            {t("selection.attendees")}
          </legend>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(minQty, quantity - 1))}
              disabled={!canPickQuantity || quantity <= minQty}
              className="w-10 h-10 rounded-full border border-warm-gray-dark/20 bg-white flex items-center justify-center text-charcoal hover:bg-warm-gray disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              -
            </button>
            <span className="text-lg font-semibold text-charcoal w-8 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
              disabled={!canPickQuantity || quantity >= maxQty}
              className="w-10 h-10 rounded-full border border-warm-gray-dark/20 bg-white flex items-center justify-center text-charcoal hover:bg-warm-gray disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>
          {!canPickQuantity && (
            <p className="text-xs text-charcoal-subtle">
              {t("selection.selectSlotFirst")}
            </p>
          )}
          {canPickQuantity && showRange && (
            <p className="text-xs text-charcoal-subtle">
              {t("selection.allowedRange")
                .replace("{min}", String(minQty))
                .replace("{max}", String(maxQty))}
            </p>
          )}
          {quantityNotice && (
            <p className="text-xs text-amber-700">
              {t("selection.quantityAdjusted")
                .replace("{prev}", String(quantityNotice.prev))
                .replace("{next}", String(quantityNotice.next))
                .replace("{min}", String(quantityNotice.min))
                .replace("{max}", String(quantityNotice.max))}
            </p>
          )}
          {!tierSlotCompatibility.compatible && (
            <p className="text-xs text-red-700">
              {t("selection.tierSlotIncompatible")}
            </p>
          )}
        </fieldset>
      )}
    </div>
  );
}
