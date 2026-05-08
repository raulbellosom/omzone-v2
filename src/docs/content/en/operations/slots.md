---
title: Slots & Agenda
description: Manage scheduled availability and operational capacity for bookings
section: operations
order: 1
lastUpdated: 2026-05-06
---

# Slots & Agenda

Slots define when a scheduled experience can be booked and how much capacity is available.

## Slot Statuses Used in Booking

| Status | Meaning in current flow |
|---|---|
| `draft` | Not visible for booking |
| `published` | Eligible for booking (if future and compatible) |
| `full` | No available capacity |
| `cancelled` | Not bookable |

## Capacity Authority

For checkout decisions, slot capacity is authoritative:

`effectiveAvailable = capacity - bookedCount`

This value constrains effective max quantity during booking.

## Edition Compatibility

Slots can be edition-linked.

- Tier with `editionId` requires slot with same `editionId`.
- Mismatch means slot is filtered/rejected for that tier.

## Minimum Slot Readiness for Checkout

1. `status=published`
2. start datetime in the future
3. positive availability
4. edition compatibility with selected tier

## Location Display in Checkout

When present, checkout uses slot-related location details such as:
- location name
- location address
- room name

Missing address should not block purchase; available location metadata is still shown.

## Common Operational Mistakes

1. Publishing tiers but leaving slots in draft.
2. Creating slots with wrong edition binding.
3. Assuming experience-level max quantity overrides slot capacity.

## Related Pages

- [Pricing Tiers](../catalog/pricing-tiers.md)
- [Experiences](../catalog/experiences.md)
- [Reservation Playbooks](../reference/reservation-playbooks.md)
