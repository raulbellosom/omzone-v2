const MAX_BOUND = Number.MAX_SAFE_INTEGER;

function toPositiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toOptionalMax(value) {
  const n = toPositiveInt(value);
  return n == null ? MAX_BOUND : n;
}

function toOptionalMin(value) {
  const n = toPositiveInt(value);
  return n == null ? 1 : n;
}

export function getSlotAvailable(slot) {
  if (!slot) return null;
  const capacity = Number(slot.capacity || 0);
  const booked = Number(slot.bookedCount || 0);
  return Math.max(0, capacity - booked);
}

export function isTierSlotCompatible(tier, slot) {
  if (!tier || !slot) return { compatible: true, reason: null };
  if (!tier.editionId) return { compatible: true, reason: null };
  if (!slot.editionId) return { compatible: false, reason: "edition_mismatch" };
  if (tier.editionId !== slot.editionId) {
    return { compatible: false, reason: "edition_mismatch" };
  }
  return { compatible: true, reason: null };
}

export function computeAddonChargeQuantity(priceType, quantity) {
  if (priceType === "per-person") {
    return { chargeQuantity: Math.max(1, Number(quantity || 1)) };
  }
  if (priceType === "fixed") {
    return { chargeQuantity: 1 };
  }
  return { errorCode: "ERR_CHECKOUT_ADDON_PRICE_TYPE_UNSUPPORTED" };
}

export function computeCheckoutConstraints({
  experience,
  tier,
  slot,
  quantity,
}) {
  const safeQuantity = Math.max(1, Number(quantity || 1));
  const experienceAllowsQuantity = Boolean(experience?.allowQuantity);
  const baseMin = experienceAllowsQuantity ? 1 : 1;
  const baseMax = experienceAllowsQuantity ? MAX_BOUND : 1;

  const experienceMin = toOptionalMin(experience?.minQuantity);
  const experienceMax = toOptionalMax(experience?.maxQuantity);
  const tierMin = toOptionalMin(tier?.minPersons);
  const tierMax = toOptionalMax(tier?.maxPersons);

  let effectiveMin = Math.max(baseMin, experienceMin, tierMin);
  let effectiveMax = Math.min(baseMax, experienceMax, tierMax);

  const effectiveAvailable = getSlotAvailable(slot);
  if (effectiveAvailable != null) {
    effectiveMax = Math.min(effectiveMax, effectiveAvailable);
  }

  const compatibility = isTierSlotCompatible(tier, slot);
  const isRangeValid = effectiveMin <= effectiveMax;
  const normalizedQuantity = isRangeValid
    ? clamp(safeQuantity, effectiveMin, effectiveMax)
    : Math.max(1, effectiveMax);
  const isValid = compatibility.compatible && isRangeValid;

  return {
    effectiveMin,
    effectiveMax,
    effectiveAvailable,
    normalizedQuantity,
    compatibility: {
      tierSlotCompatible: compatibility.compatible,
      reason: compatibility.reason,
    },
    isValid,
    errorCode: isValid ? null : "ERR_CHECKOUT_CONSTRAINT_INVALID",
  };
}
