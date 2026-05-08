import assert from "node:assert/strict";
import {
  computeAddonChargeQuantity,
  computeCheckoutConstraints,
  isTierSlotCompatible,
} from "./checkout-rules.js";

assert.deepEqual(
  isTierSlotCompatible({ editionId: "edition_a" }, { editionId: "edition_a" }),
  { compatible: true, reason: null },
);

assert.deepEqual(
  isTierSlotCompatible({ editionId: "edition_a" }, { editionId: "edition_b" }),
  { compatible: false, reason: "edition_mismatch" },
);

assert.deepEqual(computeAddonChargeQuantity("fixed", 5), {
  chargeQuantity: 1,
});
assert.deepEqual(computeAddonChargeQuantity("per-person", 5), {
  chargeQuantity: 5,
});
assert.deepEqual(computeAddonChargeQuantity("per-day", 5), {
  errorCode: "ERR_CHECKOUT_ADDON_PRICE_TYPE_UNSUPPORTED",
});

assert.deepEqual(
  computeCheckoutConstraints({
    experience: { allowQuantity: true, minQuantity: 1, maxQuantity: 5, requiresSchedule: true },
    tier: { minPersons: 2, maxPersons: 4, editionId: "edition_a" },
    slot: { capacity: 5, bookedCount: 2, editionId: "edition_a" },
    quantity: 5,
  }),
  {
    effectiveMin: 2,
    effectiveMax: 3,
    effectiveAvailable: 3,
    normalizedQuantity: 3,
    compatibility: { tierSlotCompatible: true, reason: null },
    isValid: true,
    errorCode: null,
  },
);

console.log("create-checkout rules tests passed");
