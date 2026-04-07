/**
 * @module reconciliation
 * @description Shared reconciliation logic for order state transitions and
 *   slot bookedCount updates. Imported by stripe-webhook and potentially
 *   by future functions (e.g., assisted sale).
 */

import { Query } from "node-appwrite";

// ─── State Machine ───────────────────────────────────────────────────────────

/**
 * Valid order status transitions.
 * Key = current status, Value = array of allowed next statuses.
 */
const ORDER_TRANSITIONS = {
  pending: ["paid", "cancelled"],
  paid: ["confirmed", "refunded"],
  confirmed: ["refunded"],
  cancelled: [],
  refunded: [],
};

/**
 * Valid payment status transitions.
 */
const PAYMENT_TRANSITIONS = {
  pending: ["processing", "succeeded", "failed"],
  processing: ["succeeded", "failed"],
  succeeded: ["refunded"],
  failed: [],
  refunded: [],
};

/**
 * Check if an order status transition is valid.
 * @param {string} from - Current status
 * @param {string} to - Desired status
 * @returns {boolean}
 */
export function isValidOrderTransition(from, to) {
  const allowed = ORDER_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
}

/**
 * Check if a payment status transition is valid.
 * @param {string} from - Current payment status
 * @param {string} to - Desired payment status
 * @returns {boolean}
 */
export function isValidPaymentTransition(from, to) {
  const allowed = PAYMENT_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
}

/**
 * Get allowed next statuses for a given order status.
 * @param {string} currentStatus
 * @returns {string[]}
 */
export function getAllowedOrderTransitions(currentStatus) {
  return ORDER_TRANSITIONS[currentStatus] || [];
}

// ─── Slot Reconciliation ─────────────────────────────────────────────────────

/**
 * After an order is paid, increment bookedCount on associated slots.
 * Reads order_items for the order, and for each item with a slotId,
 * increments the slot's bookedCount by the item's quantity.
 *
 * @param {Object} params
 * @param {import('node-appwrite').Databases} params.db - Appwrite Databases instance
 * @param {string} params.databaseId
 * @param {string} params.collectionOrderItems
 * @param {string} params.collectionSlots
 * @param {string} params.orderId
 * @param {Function} params.log - Logger
 */
export async function reconcileSlots({
  db,
  databaseId,
  collectionOrderItems,
  collectionSlots,
  orderId,
  log,
}) {
  // Fetch order items
  const itemsRes = await db.listDocuments(databaseId, collectionOrderItems, [
    Query.equal("orderId", orderId),
    Query.limit(100),
  ]);

  const items = itemsRes.documents;
  if (!items.length) {
    log(`No order items found for order ${orderId}, skipping slot reconciliation`);
    return;
  }

  for (const item of items) {
    const slotId = item.slotId;
    if (!slotId) continue;

    const quantity = item.quantity || 1;

    try {
      const slot = await db.getDocument(databaseId, collectionSlots, slotId);
      const currentBooked = slot.bookedCount || 0;
      const capacity = slot.capacity || 0;
      const newBooked = currentBooked + quantity;

      const updateData = { bookedCount: newBooked };

      // If booked reaches capacity, mark slot as full
      if (capacity > 0 && newBooked >= capacity) {
        updateData.status = "full";
        log(`Slot ${slotId} will be marked as full (${newBooked}/${capacity})`);
      }

      // Warn on overbooking but still process (policy: accept + log)
      if (capacity > 0 && newBooked > capacity) {
        log(`WARN: Slot ${slotId} overbooked — ${newBooked}/${capacity} (order ${orderId})`);
      }

      // Warn if slot is not available
      if (slot.status !== "available" && slot.status !== "full") {
        log(`WARN: Slot ${slotId} status is "${slot.status}", proceeding anyway (order ${orderId})`);
      }

      await db.updateDocument(databaseId, collectionSlots, slotId, updateData);
      log(`Slot ${slotId} bookedCount updated: ${currentBooked} → ${newBooked}`);
    } catch (err) {
      // Log but don't fail the entire reconciliation — payment was confirmed
      log(`ERROR: Failed to update slot ${slotId} for order ${orderId}: ${err.message}`);
    }
  }
}
