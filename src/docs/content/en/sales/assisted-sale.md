---
title: Assisted Sale
description: Admin/operator guided reservation flow with manual payment or Stripe link
section: sales
order: 2
lastUpdated: 2026-05-06
---

# Assisted Sale

Assisted Sale is the admin/operator wizard to create reservations on behalf of a customer.

## Wizard Flow

1. Customer
2. Experience
3. Pricing Tier
4. Slot (required when `requiresSchedule=true`)
5. Addons
6. Quantity
7. Review + Payment Method

## Critical Rules

### Slot Is Mandatory for Scheduled Experiences

If the selected experience has `requiresSchedule=true`, the wizard must include a valid slot.  
There is no skip/bypass path in this phase.

### Tier-Slot Edition Compatibility

- Tier with `editionId` only accepts slots with same `editionId`.
- Incompatible slot choices must be rejected.

### Quantity Constraints

Quantity is validated by effective intersection of:
- Experience min/max
- Tier min/max
- Slot availability

### Addons in Assisted Checkout

- Supported price types: `fixed`, `per-person`.
- Unsupported in this phase: `per-day`, `per-unit`, `quote`.
- Unsupported required addons block completion.

## Payment Method Choices

### Manual Paid
- Creates assisted order in confirmed/succeeded manual path.
- Triggers fulfillment side effects (tickets) after order creation.

### Stripe Link
- Creates order + payment link.
- Final confirmation comes from webhook when customer pays.

## Operational Best Practices

1. Always verify slot availability before final confirm.
2. Confirm customer email if Stripe link will be sent.
3. Re-check addon type support before completing.
4. If slot list is empty, resolve agenda configuration before proceeding.

## Related Pages

- [Reservation Playbooks](../reference/reservation-playbooks.md)
- [Orders](./orders.md)
- [Pricing Tiers](../catalog/pricing-tiers.md)
- [Slots & Agenda](../operations/slots.md)
