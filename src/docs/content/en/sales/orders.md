---
title: Orders
description: Operational order and payment states for checkout and assisted sale
section: sales
order: 1
lastUpdated: 2026-05-06
---

# Orders

Orders store immutable purchase snapshots and represent the source of truth for reservation and payment operations.

## Current Status Model

| Order Status | Meaning | Typical Trigger |
|---|---|---|
| `pending` | Order created, payment not confirmed | Checkout context created |
| `confirmed` | Payment validated and fulfillment flow started | Stripe webhook or assisted manual path |
| `cancelled` | Order cancelled | Admin action |
| `refunded` | Payment refunded | Admin action / refund flow |
| `paid` | Legacy compatibility status | Historical/legacy operational path |

## Payment Status Model

| Payment Status | Meaning |
|---|---|
| `pending` | Payment not yet finalized |
| `processing` | Payment in flight |
| `succeeded` | Payment confirmed |
| `failed` | Payment failed |
| `refunded` | Payment refunded |

## Important Clarification About `paid`

`paid` is kept for compatibility and historical continuity.  
The main current successful path is:

`pending -> confirmed` with `paymentStatus=succeeded`.

If you see `paid`, treat it as a transitional/legacy state, not the primary endpoint of current direct checkout.

## Direct Checkout Lifecycle (Current)

1. Order starts in `pending`.
2. Embedded Stripe payment is confirmed.
3. Webhook validates event and updates order.
4. Order moves to `confirmed`.
5. Payment record is written.
6. Slot reconciliation and ticket generation are triggered.

## Assisted Sale Lifecycle (Current)

### Manual Paid
- Assisted flow can produce `confirmed/succeeded` directly after validation.

### Stripe Link
- Order remains pending until customer payment is confirmed by webhook.
- Then transitions to `confirmed/succeeded`.

## Admin Operations

Common actions:
- Cancel order (`cancelled`)
- Mark refunded (`refunded`)
- Retry fulfillment side effects (when applicable)

Always verify payment and ticket consequences before cancelling/refunding confirmed reservations.

## Snapshot and Audit Behavior

- Order snapshot freezes experience/tier/addon values at purchase time.
- Historical orders must not be reconstructed from mutable live relations.
- Constraint context at purchase time should remain traceable in snapshot data.

## Related Pages

- [Reservation Playbooks](../reference/reservation-playbooks.md)
- [Assisted Sale](./assisted-sale.md)
- [Flows](../reference/flows.md)
- [Known Limitations](../reference/known-limitations.md)
