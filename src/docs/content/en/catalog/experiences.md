---
title: Experiences
description: Main configuration for publishable sellable wellness experiences
section: catalog
order: 1
lastUpdated: 2026-05-06
---

# Experiences

Experiences are the parent entity for schedule, pricing, addons, and checkout behavior.

## Commercial and Booking Controls

### `saleMode`

- `direct`: customer self-checkout with embedded Stripe payment.
- `request`: request flow (not direct instant payment).
- `assisted`: admin/operator creates sales through wizard.
- `pass`: pass-focused access patterns.

### `requiresSchedule`

- `true`: customer/admin must choose a valid slot in booking flow.
- `false`: slot selection is not required in checkout steps.

### `allowQuantity`, `minQuantity`, `maxQuantity`

- Controls order-size bounds at experience level.
- Effective checkout range is the intersection with tier rules and slot availability.

### `status`

- `draft`: not publicly bookable.
- `published`: visible and eligible for checkout (subject to tier/slot availability).

## Important Behavior Notes

1. Slot capacity is the operational authority in checkout.
2. Experience min/max do not replace slot capacity; they constrain order size.
3. If `requiresSchedule=false`, slots may exist operationally but are not required by checkout UX.
4. Experience copy fields (`publicName`, descriptions) affect customer-facing text only, not payment math.

## Publishing Readiness Checklist

Before going live:

1. Experience `status=published`.
2. At least one active pricing tier.
3. If scheduled, at least one future published slot with availability.
4. Tier-to-slot edition compatibility is valid.
5. Addon assignments are compatible with supported checkout addon price types.

## Common Misconfiguration Patterns

- Published experience with no active tier.
- Scheduled experience with only draft/past/full slots.
- Tier linked to edition without matching slots.
- Experience allows quantity but min/max conflict with tier or slot capacity.

## Related Pages

- [Pricing Tiers](./pricing-tiers.md)
- [Slots & Agenda](../operations/slots.md)
- [Reservation Playbooks](../reference/reservation-playbooks.md)
- [Flows](../reference/flows.md)
