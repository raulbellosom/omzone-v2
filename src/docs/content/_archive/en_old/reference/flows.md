---
title: Flows
description: Current operational flows for experiences, checkout, and order lifecycle
section: reference
order: 2
lastUpdated: 2026-05-06
relatedRoutes:
  - /admin/experiences
  - /admin/sales/new
  - /checkout
relatedCollections:
  - experiences
  - pricing_tiers
  - slots
  - orders
  - payments
keywords:
  - flows
  - checkout
  - stripe
  - assisted sale
---

# Flows

This page summarizes the current production behavior. For step-by-step operational scenarios, use [Reservation Playbooks](./reservation-playbooks.md).

## Core Reservation Flow (Direct)

1. Customer selects pricing tier.
2. If `requiresSchedule=true`, customer must select a compatible future slot.
3. Quantity is validated with effective limits:
   - Experience min/max
   - Tier min/max
   - Slot availability (`capacity - bookedCount`)
4. Customer reviews addons and details.
5. System creates checkout context and renders Stripe Payment Element in-app.
6. Webhook confirms payment and order lifecycle actions.

## Core Reservation Flow (Assisted)

1. Admin/operator runs wizard: Customer -> Experience -> Tier -> Slot -> Addons -> Quantity -> Review.
2. Slot is mandatory for scheduled experiences (`requiresSchedule=true`).
3. Payment path:
   - Manual paid, or
   - Stripe link for later customer payment.
4. Backend confirms order and triggers fulfillment chain.

## Compatibility Rules

### Tier-Slot Compatibility

- If a tier has `editionId`, it only accepts slots with the same `editionId`.
- If a tier has no `editionId`, it can use compatible general slots.

### Capacity Authority

- Operational capacity is always the slot.
- Effective availability is `capacity - bookedCount`.
- `editions.capacity` is informational in this phase.

### Addon Price Types in Checkout

- Supported: `fixed`, `per-person`.
- Not supported in direct/assisted checkout (phase scope): `per-day`, `per-unit`, `quote`.

## Stripe Payment Flow (Current)

- Direct checkout uses Stripe Checkout Session with `ui_mode=custom`.
- Payment UI is embedded (Payment Element) inside OMZONE.
- Main fulfillment signal is webhook confirmation.
- Do not treat frontend completion alone as paid/confirmed state.

## Order Lifecycle (Current Operating Model)

- Main successful path: `pending -> confirmed` with `paymentStatus=succeeded`.
- `paid` is a legacy/compatibility status that may exist in historical or operational edge paths.
- Cancellation/refund workflows remain available through admin actions.

## Troubleshooting Pointer

If dates/times do not appear, run the checklist in [Reservation Playbooks](./reservation-playbooks.md#fast-admin-preflight-when-datestimes-do-not-show).

## Related Pages

- [Reservation Playbooks](./reservation-playbooks.md)
- [Known Limitations](./known-limitations.md)
- [Experiences](../catalog/experiences.md)
- [Pricing Tiers](../catalog/pricing-tiers.md)
- [Slots & Agenda](../operations/slots.md)
- [Orders](../sales/orders.md)
