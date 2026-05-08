---
title: Pricing Tiers
description: Configure tier pricing, edition compatibility, and person limits
section: catalog
order: 3
lastUpdated: 2026-05-06
---

# Pricing Tiers

Pricing tiers define purchasable options for an experience.

## Fields That Affect Checkout

### `isActive`

Only active tiers are selectable in checkout.

### `editionId` (optional)

If present, the tier only works with slots of the same edition.

### `minPersons` / `maxPersons` (optional)

Tier-level quantity bounds.  
They are intersected with:
- Experience min/max
- Slot availability

### `priceType`

Tier price types influence base order math (for the tier item).  
For addon support rules, see checkout-specific addon constraints in [Reservation Playbooks](../reference/reservation-playbooks.md).

## Compatibility Rule (Tier -> Slot)

1. Tier has `editionId = X` -> only slots with `editionId = X`.
2. Tier has no `editionId` -> can work with general compatible slots.

If no compatible slots remain, customer cannot proceed with scheduled checkout for that tier.

## Common Configuration Errors

1. `minPersons > maxPersons`.
2. Tier linked to an edition that has no published future slots.
3. Tier active but all matching slots are full or in the past.

## Admin Validation Expectations

- New invalid bounds should be blocked in admin forms.
- Legacy invalid data may still exist and is rejected during checkout validation.

## Related Pages

- [Experiences](./experiences.md)
- [Slots & Agenda](../operations/slots.md)
- [Reservation Playbooks](../reference/reservation-playbooks.md)
