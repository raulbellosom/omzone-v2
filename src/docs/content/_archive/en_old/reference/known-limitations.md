---
title: Known Limitations
description: Intentional constraints and current-phase limits for booking and payment behavior
section: reference
order: 4
lastUpdated: 2026-05-06
---

# Known Limitations

This page lists constraints that are intentional in the current phase and should not be treated as defects by default.

## Booking and Capacity

1. Slot capacity is the final operational cap in checkout.
2. Experience/tier min-max rules constrain order size but do not override slot availability.
3. `editions.capacity` is informational in this phase (not enforced in checkout).

## Tier-Slot Compatibility

1. Tier with `editionId` requires slot with same `editionId`.
2. Misconfigured edition links can make all slots disappear for a selected tier.

## Addon Limits in Direct/Assisted Checkout

Supported now:
- `fixed`
- `per-person`

Not supported now:
- `per-day`
- `per-unit`
- `quote`

Required unsupported addon types block checkout by design.

## Assisted Sale Constraints

1. For `requiresSchedule=true`, slot is mandatory in wizard.
2. No skip-slot bypass path in this phase for scheduled experiences.

## Stripe and Order Status Nuance

1. Direct checkout is embedded (`ui_mode=custom` + Payment Element), not legacy hosted redirect.
2. Primary successful state path is `pending -> confirmed` with `paymentStatus=succeeded`.
3. `paid` remains a legacy compatibility state for historical/operational continuity.

## Data Quality Limits

1. Legacy invalid min/max configurations may still exist.
2. Admin forms should block new invalid bounds, but checkout backend still enforces and can reject legacy bad data.

## Related Pages

- [Reservation Playbooks](./reservation-playbooks.md)
- [Flows](./flows.md)
- [Troubleshooting](./troubleshooting.md)
