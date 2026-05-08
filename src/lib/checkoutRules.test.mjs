import assert from "node:assert/strict";
import {
  ADDON_PRICE_TYPES_SUPPORTED_IN_CHECKOUT,
  computeAddonChargeQuantity,
  computeCheckoutConstraints,
  getSlotAvailable,
  isTierSlotCompatible,
} from "./checkoutRules.js";

assert.deepEqual(ADDON_PRICE_TYPES_SUPPORTED_IN_CHECKOUT, ["fixed", "per-person"]);

assert.equal(getSlotAvailable({ capacity: 8, bookedCount: 3 }), 5);
assert.equal(getSlotAvailable({ capacity: 3, bookedCount: 5 }), 0);

assert.deepEqual(
  isTierSlotCompatible(
    { $id: "tier_1", editionId: "ed_1" },
    { $id: "slot_1", editionId: "ed_1" },
  ),
  { compatible: true, reason: null },
);

assert.deepEqual(
  isTierSlotCompatible(
    { $id: "tier_1", editionId: "ed_1" },
    { $id: "slot_2", editionId: "ed_2" },
  ),
  { compatible: false, reason: "edition_mismatch" },
);

assert.deepEqual(computeAddonChargeQuantity("per-person", 4), { chargeQuantity: 4 });
assert.deepEqual(computeAddonChargeQuantity("fixed", 4), { chargeQuantity: 1 });
assert.deepEqual(computeAddonChargeQuantity("per-day", 4), {
  errorCode: "ERR_CHECKOUT_ADDON_PRICE_TYPE_UNSUPPORTED",
});

assert.deepEqual(
  computeCheckoutConstraints({
    experience: { allowQuantity: true, minQuantity: 2, maxQuantity: 7, requiresSchedule: true },
    tier: { minPersons: 3, maxPersons: 5 },
    slot: { capacity: 10, bookedCount: 6 },
    quantity: 7,
  }),
  {
    effectiveMin: 3,
    effectiveMax: 4,
    effectiveAvailable: 4,
    normalizedQuantity: 4,
    compatibility: { tierSlotCompatible: true, reason: null },
    isValid: true,
    errorCode: null,
  },
);

assert.deepEqual(
  computeCheckoutConstraints({
    experience: { allowQuantity: true, minQuantity: 6, maxQuantity: 2, requiresSchedule: false },
    tier: null,
    slot: null,
    quantity: 1,
  }),
  {
    effectiveMin: 6,
    effectiveMax: 2,
    effectiveAvailable: null,
    normalizedQuantity: 2,
    compatibility: { tierSlotCompatible: true, reason: null },
    isValid: false,
    errorCode: "ERR_CHECKOUT_CONSTRAINT_INVALID",
  },
);

assert.deepEqual(
  computeCheckoutConstraints({
    experience: { allowQuantity: false, requiresSchedule: false },
    tier: { minPersons: 3, maxPersons: 3 },
    slot: null,
    quantity: 4,
  }),
  {
    effectiveMin: 3,
    effectiveMax: 1,
    effectiveAvailable: null,
    normalizedQuantity: 1,
    compatibility: { tierSlotCompatible: true, reason: null },
    isValid: false,
    errorCode: "ERR_CHECKOUT_CONSTRAINT_INVALID",
  },
);

console.log("checkout rules tests passed");
