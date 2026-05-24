---
title: Reservation Playbooks
description: Real booking and payment playbooks for direct checkout and assisted sale
section: reference
order: 3
lastUpdated: 2026-05-06
relatedRoutes:
  - /admin/experiences
  - /admin/experiences/:id/pricing
  - /admin/experiences/:id/slots
  - /admin/sales/new
  - /checkout
relatedCollections:
  - experiences
  - pricing_tiers
  - slots
  - orders
  - order_items
  - payments
keywords:
  - checkout
  - stripe
  - slot capacity
  - assisted sale
  - reservation
---

# Reservation Playbooks

This page is the operational source of truth for real booking flows in OMZONE.

## Fast Admin Preflight (When Dates/Times Do Not Show)

Use this checklist before debugging code:

1. Experience is `published`.
2. Experience `saleMode` matches the flow:
   - Direct client checkout: `direct`
   - Assisted wizard: `assisted` (or admin flow with assisted orderType)
3. For scheduled experiences, `requiresSchedule = true`.
4. Pricing tier is active (`isActive = true`).
5. Tier `editionId` is correct for the intended schedule.
6. Slot is `published`.
7. Slot start datetime is in the future.
8. Slot has positive availability (`capacity - bookedCount > 0`).
9. Tier and slot are edition-compatible:
   - Tier with `editionId` only accepts slots with same `editionId`.
10. If all above pass and UI still hides slots, confirm filters and locale/timezone display.

---

## Playbook 1: Scheduled Direct Checkout (Embedded Stripe)

### Context
Customer buys online in public checkout for a scheduled experience.

### Preconditions
- Experience `saleMode=direct`, `status=published`.
- `requiresSchedule=true`.
- At least one active tier and one compatible published future slot.

### Flow
1. Customer selects pricing tier.
2. Customer selects slot (date/time + location details when available).
3. Quantity control unlocks and applies effective limits.
4. Customer reviews addons and guest details.
5. Review step triggers `create-checkout`.
6. Backend returns `clientSecret` and Checkout Session (`ui_mode=custom`).
7. Payment Element renders inside OMZONE (no hosted redirect).
8. Customer confirms payment.
9. Webhook confirms order, writes payment, reconciles slot capacity, triggers ticket generation.

### Expected Results
- UI: success route with order context.
- Backend:
  - `orders.status = confirmed`
  - `orders.paymentStatus = succeeded`
  - payment record exists
  - slot `bookedCount` reconciled

---

## Playbook 2: Direct Checkout with Capacity Drop (Auto Quantity Adjustment)

### Context
Customer changes tier or slot and the new compatible capacity is lower.

### Rules
- Effective quantity range is computed from:
  - Experience min/max
  - Tier min/max
  - Slot availability (`capacity - bookedCount`)
- Checkout normalizes quantity to allowed bounds.

### Expected UI Behavior
- Quantity is auto-adjusted to allowed value.
- User sees visible adjustment message.
- User cannot continue with out-of-range quantity.

### Expected Backend Behavior
- Backend re-validates constraints.
- Backend rejects stale invalid quantity even if UI state is outdated.

---

## Playbook 3: Addons in Direct/Assisted Checkout

### Supported Addon Price Types
- `per-person`: charged by attendee quantity.
- `fixed`: charged once per order.

### Unsupported in This Phase
- `per-day`, `per-unit`, `quote` for direct/assisted checkout.

### Expected Behavior
- Required addon with unsupported price type blocks checkout with explicit error.
- Optional unsupported addon is not purchasable in this flow.
- Totals use addon charge quantity, not naive attendee multiplication.

---

## Playbook 4: Assisted Sale (Manual Paid)

### Context
Admin/operator sells on behalf of a client and marks payment manually.

### Preconditions
- Experience and tier valid.
- If `requiresSchedule=true`, a valid slot must be selected (no bypass).

### Flow
1. Customer -> Experience -> Tier -> Slot (if required) -> Addons -> Quantity -> Review.
2. Admin selects manual payment.
3. `create-checkout` creates assisted order with manual paid path.
4. Order is created as confirmed/succeeded in manual flow.
5. Ticket generation is triggered.

### Expected Results
- Order is created and ready for fulfillment artifacts.
- No Stripe hosted checkout dependency in manual path.

---

## Playbook 5: Assisted Sale (Stripe Link)

### Context
Admin/operator prepares order, customer pays later through Stripe link.

### Flow
1. Wizard collects customer, experience, tier, required slot, addons, quantity.
2. Admin chooses Stripe link method.
3. Backend creates order + payment link metadata.
4. Customer completes payment through link.
5. Webhook confirms order and triggers fulfillment chain.

### Expected Results
- Order transitions to confirmed/succeeded after webhook.
- Payment record and slot reconciliation are created once (idempotent path).

---

## Playbook 6: Diagnose "No Dates/Times Visible to Customer"

### Typical Root Causes
- Tier linked to edition, but slots are unlinked or linked to different edition.
- Slots are in draft/cancelled/full with no remaining availability.
- Experience does not require schedule.
- Slot datetime is past.

### Recovery Sequence
1. Run the Fast Admin Preflight checklist on this page.
2. Correct tier-slot edition compatibility first.
3. Publish future slots with valid capacity.
4. Re-open checkout and verify slot list before payment step.

---

## Related Pages

- [Flows](./flows.md)
- [Experiences](../catalog/experiences.md)
- [Pricing Tiers](../catalog/pricing-tiers.md)
- [Slots & Agenda](../operations/slots.md)
- [Assisted Sale](../sales/assisted-sale.md)
- [Orders](../sales/orders.md)
