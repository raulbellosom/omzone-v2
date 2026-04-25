---
title: Orders
description: Track and manage customer purchases
section: sales
order: 1
lastUpdated: 2026-04-25
---

# Orders

Orders represent purchases made by customers through the OMZONE platform. Each order captures a snapshot of the purchased items at the time of sale, ensuring historical accuracy regardless of future changes to experiences or pricing.

## Order Status Values

Order status tracks the lifecycle of a purchase from creation through fulfillment or cancellation.

| Status | Description | Terminal? | Admin Can Set | System Sets When |
|--------|-------------|-----------|---------------|------------------|
| `pending` | Order created, awaiting payment confirmation from Stripe | No | Yes (cancel) | Order first created |
| `paid` | Payment confirmed; order is ready for fulfillment | No | Yes (cancel, markRefunded) | Stripe webhook `payment_intent.succeeded` |
| `confirmed` | Fulfillment has started (tickets generated, pass activated) | No | No | `create-checkout` function triggers fulfillment |
| `cancelled` | Order cancelled before completion | Yes | Yes | Admin cancels from pending/paid |
| `refunded` | Payment has been refunded to customer | Yes | Yes | Admin issues refund OR automatic via Stripe |

### Status Details

#### `pending`

**Description:** The order has been created but payment has not yet been confirmed. This is the initial state for all orders.

**When System Sets:**
- Customer initiates checkout (direct purchase)
- Admin creates assisted sale order

**When Admin Can Set:**
- Cancel the order (moves to `cancelled`)

**Available Actions:**
- Cancel order
- View order details
- Modify billing/shipping info (if applicable)

**What Happens Next:**
- `paid` — Payment confirmed via Stripe webhook
- `cancelled` — Admin cancels before payment

---

#### `paid`

**Description:** Payment has been successfully captured. The funds are in the merchant account and the order is ready for fulfillment.

**When System Sets:**
- Stripe sends `payment_intent.succeeded` webhook
- Payment status changes from `processing` to `succeeded`

**When Admin Can Set:**
- Cancel the order (moves to `cancelled`, may trigger refund)
- Mark as refunded (moves to `refunded` directly)

**Available Actions:**
- Cancel order
- View payment details
- View Stripe payment intent

**What Happens Next:**
- `confirmed` — Fulfillment triggered automatically when checkout function processes
- `refunded` — Admin manually processes refund
- `cancelled` — Admin cancels before fulfillment

---

#### `confirmed`

**Description:** Fulfillment has been initiated. Tickets have been generated, passes have been activated, or other fulfillment actions have been taken.

**When System Sets:**
- `create-checkout` Appwrite Function completes successfully
- Tickets generated via `generate-ticket` Function
- Pass credits activated via `consume-pass` Function

**When Admin Can Set:**
- No direct admin transition. This status is system-controlled.

**Available Actions:**
- View tickets
- View pass activations
- Issue refund (moves to `refunded`)

**What Happens Next:**
- `refunded` — Admin issues refund after fulfillment

**Important:** At this stage, tickets may already be valid for check-in. If refund is issued, consider voiding any issued tickets manually.

---

#### `cancelled`

**Description:** The order was cancelled before completion. This is a terminal state.

**When System Sets:**
- Never set automatically by system

**When Admin Can Set:**
- From `pending` status — No payment captured, no action needed
- From `paid` status — Payment captured but not yet fulfilled; refund should be processed

**Available Actions:**
- Issue refund (if payment was captured)
- View order details for records

**What Happens Next:**
- `refunded` — If payment was captured, admin should issue refund

---

#### `refunded`

**Description:** Payment has been returned to the customer. This is a terminal state.

**When System Sets:**
- Stripe refund processed successfully

**When Admin Can Set:**
- From `paid` status — Direct refund without going through cancellation
- From `confirmed` status — Refund after fulfillment (consider ticket voiding)

**Available Actions:**
- View refund details
- View original payment information

**What Happens Next:**
- Terminal state — No further transitions

---

## Payment Status Values

Payment status tracks the state of the Stripe payment separately from order fulfillment status.

| Status | Description | Stripe Integration |
|--------|-------------|---------------------|
| `pending` | Checkout session created, no payment attempted | Stripe Checkout session initiated |
| `processing` | Payment intent in flight | Stripe processing payment |
| `succeeded` | Payment captured successfully | Payment intent succeeded |
| `failed` | Payment declined or error | Payment intent failed |
| `refunded` | Payment returned to customer | Refund issued via Stripe |

### Payment Status Details

#### `pending`

**Description:** The checkout process has been initiated but no payment has been attempted. Customer has not completed the Stripe payment flow.

**Stripe Reference:** Checkout session created, awaiting customer completion.

**What this means:**
- Order status may be `pending` as well
- No funds captured
- Customer may have abandoned checkout

---

#### `processing`

**Description:** The payment is currently being processed by Stripe. The payment intent is in flight.

**Stripe Reference:** Payment intent status is `processing`.

**What this means:**
- Order status is typically `pending`
- Customer has submitted payment
- Stripe has not yet confirmed success or failure
- Do NOT cancel orders in this state — wait for final status

---

#### `succeeded`

**Description:** Payment was successfully captured. Funds are in the merchant account.

**Stripe Reference:** Payment intent succeeded.

**What this means:**
- Order status may be `paid` or `confirmed`
- Funds captured and available
- Payment can be refunded if needed

---

#### `failed`

**Description:** Payment was declined or an error occurred during processing.

**Stripe Reference:** Payment intent failed with error.

**What this means:**
- Order status is typically `pending`
- No funds captured
- Customer may need to retry with different payment method

---

#### `refunded`

**Description:** Full or partial refund has been issued to the customer.

**Stripe Reference:** Refund created via Stripe Dashboard or API.

**What this means:**
- Order status is typically `refunded`
- Funds returned to customer
- Refund may be full or partial

---

## Status Matrix

The relationship between order status and payment status determines the valid states of an order.

### Valid Combinations

| Order Status | Valid Payment Statuses | Notes |
|--------------|------------------------|-------|
| `pending` | `pending`, `processing`, `failed` | Payment not confirmed; awaiting, in-flight, or failed |
| `paid` | `succeeded` | Payment captured; awaiting fulfillment |
| `confirmed` | `succeeded` | Payment confirmed; fulfillment in progress |
| `cancelled` | `succeeded`, `refunded` | Payment captured but order cancelled; may need refund |
| `refunded` | `refunded` | Payment returned |

### Invalid Combinations

These combinations should never occur in normal operation:

| Invalid Combination | Reason |
|---------------------|--------|
| `orderStatus="pending"` + `paymentStatus="succeeded"` | Payment succeeded should trigger order to become `paid` |
| `orderStatus="paid"` + `paymentStatus="pending"` | Order cannot be paid without successful payment |
| `orderStatus="confirmed"` + `paymentStatus="pending"` | Cannot confirm without payment |
| `orderStatus="cancelled"` + `paymentStatus="processing"` | Cannot cancel while payment still processing |
| `orderStatus="refunded"` + `paymentStatus="succeeded"` | If refunded, payment status should reflect refund |
| `orderStatus="cancelled"` + `paymentStatus="failed"` | No payment to cancel if failed |

### Status Flow Diagram

```
                                    ┌─────────────────────────────────────────┐
                                    │                                         │
                                    ▼                                         │
┌─────────┐    payment succeeded    ┌─────┐    fulfillment triggered     ┌───────────┐    admin refund    ┌──────────┐
│ PENDING │ ──────────────────────► │ PAID │ ───────────────────────────► │ CONFIRMED │ ──────────────────► │ REFUNDED │
└─────────┘                         └─────┘                              └───────────┘                     └──────────┘
     │                                     │                                     │
     │ cancel                              │ cancel                              │
     ▼                                     ▼                                     │
┌───────────┐                         ┌───────────┐                             │
│ CANCELLED │ ◄────────────────────── │ CANCELLED │                             │
└───────────┘                         └───────────┘                             │
     │                                     │                                     │
     │ (if payment captured)               │ (if payment captured)               │
     ▼                                     ▼                                     │
┌──────────┐                         ┌──────────┐ ────────────────────────────────┘
│ REFUNDED │                         │ REFUNDED │
└──────────┘                         └──────────┘
```

### Transition Matrix: Admin vs System Actions

| Current Status | Admin Can Transition To | System Transitions To | Automatic Triggers |
|----------------|------------------------|-----------------------|-------------------|
| `pending` | `cancelled` | `paid` | Stripe webhook `payment_intent.succeeded` |
| `paid` | `cancelled`, `refunded` | `confirmed` | `create-checkout` function |
| `confirmed` | `refunded` | — (terminal for auto) | Ticket validation completes |
| `cancelled` | `refunded` (if paid) | — (terminal) | — |
| `refunded` | — | — (terminal) | — |

---

## Decision Flow: Order Status Transitions

```
START: Order Created (status = "pending")
│
├──► Is payment confirmed?
│   │
│   ├──► NO ─ Is checkout abandoned/expired?
│   │         └──► YES ─ Order remains pending (eventual cleanup)
│   │         └──► NO ─ Wait for Stripe webhook
│   │
│   └──► YES ─ Stripe webhook received
│             └──► status becomes "paid"
│
├──► Admin decides to cancel?
│   └──► YES ─ status becomes "cancelled"
│             └──► Was payment captured?
│                   ├──► YES ─ Admin should issue refund → "refunded"
│                   └──► NO ─ Terminal state
│
└──► Payment captured (status = "paid")
      │
      ├──► Fulfillment triggered automatically
      │     └──► status becomes "confirmed"
      │           └──► Tickets/pass activated
      │
      └──► Admin issues refund before fulfillment
            └──► status becomes "refunded"
```

---

## Filtering Orders

Navigate to **Sales → Orders** to access the orders list.

### Status Filter

| Filter Option | Shows Orders With |
|--------------|-------------------|
| All Statuses | All orders regardless of status |
| Pending | Orders awaiting payment |
| Paid | Orders with confirmed payment |
| Confirmed | Orders with fulfillment started |
| Cancelled | Cancelled orders |
| Refunded | Refunded orders |

### Payment Status Filter

| Filter Option | Shows Orders With |
|--------------|-------------------|
| All Payments | All orders |
| Pending | Checkout initiated, no payment |
| Processing | Payment in flight |
| Succeeded | Payment captured |
| Failed | Payment declined |
| Refunded | Payment returned |

---

## Admin Actions by Status

### Pending Orders

| Action | Description | Effect |
|--------|-------------|--------|
| View Details | Open order detail page | Navigate to full order view |
| Cancel | Cancel the order | `status → cancelled` |

### Paid Orders

| Action | Description | Effect |
|--------|-------------|--------|
| View Details | Open order detail page | Navigate to full order view |
| Cancel | Cancel before fulfillment | `status → cancelled` |
| Mark Refunded | Process refund directly | `status → refunded`, payment refunded |

### Confirmed Orders

| Action | Description | Effect |
|--------|-------------|--------|
| View Details | Open order detail page | Navigate to full order view |
| View Tickets | See generated tickets | List of tickets for this order |
| Issue Refund | Refund after fulfillment | `status → refunded`, payment refunded |

### Cancelled Orders

| Action | Description | Effect |
|--------|-------------|--------|
| View Details | Open order detail page | Navigate to full order view |
| Issue Refund | Refund captured payment | `paymentStatus → refunded` |

### Refunded Orders

| Action | Description | Effect |
|--------|-------------|--------|
| View Details | Open order detail page | Navigate to full order view |
| View Refund | See refund details | Payment records with refund info |

---

## Common Mistakes

### Cancelling Without Refund

**Problem:** Cancelling a paid order without issuing a refund.

**Impact:** Customer's payment is captured but not returned.

**Correct Flow:**
1. Cancel order → status becomes `cancelled`
2. Issue refund → payment returned, status becomes `refunded`

---

### Issuing Refund Before Cancellation

**Problem:** Attempting to refund without cancelling first (when order status requires cancellation).

**Correct Flow:**
1. Cancel the order first
2. Then issue the refund

---

### Cancelling During Processing

**Problem:** Attempting to cancel an order with `paymentStatus = "processing"`.

**Impact:** Cannot cancel while payment is still in flight.

**Correct Flow:**
1. Wait for payment to reach final state (`succeeded` or `failed`)
2. Then proceed with cancellation or fulfillment

---

### Ignoring Tickets After Refund

**Problem:** Refunding a confirmed order without considering issued tickets.

**Impact:** Tickets remain valid until manually voided.

**Correct Flow:**
1. Issue refund for order
2. Manually void/cancel any issued tickets in **Sales → Tickets**

---

### Modifying Prices After Purchase

**Problem:** Adjusting pricing tiers after purchases have been made.

**Impact:** Historical orders maintain frozen snapshots; changes don't affect past orders.

**Note:** Pricing changes only affect new orders. Existing orders preserve the price at time of purchase.

---

## Order Timeline

Each order maintains a timeline of events:

```
1. Order Created
   └── status: "pending"
   └── paymentStatus: "pending"
   
2. Payment Initiated (if Stripe Checkout)
   └── paymentStatus: "processing"
   
3a. Payment Succeeded ───────────────────────────────────────────┐
   └── paymentStatus: "succeeded"                               │
   └── status: "paid"                                           │
                                                               │
3b. Payment Failed                                              │
   └── paymentStatus: "failed"                                  │
   └── status remains: "pending"                                │
                                                               │
4. Fulfillment Triggered (automatic)                           │
   └── status: "confirmed"                                      │
   └── Tickets generated                                        │
   └── Pass credits activated                                    │
                                                               │
5. Refund Issued (if applicable)                               │
   └── paymentStatus: "refunded"                                │
   └── status: "refunded"                                       │
                                                               │
6. Order Cancelled (if applicable) ────────────────────────────┘
   └── status: "cancelled"
```

---

## Related Pages

- [Assisted Sale](/docs/sales/assisted-sale) — Create orders manually on behalf of clients
- [Tickets](/docs/system/tickets) — View and validate tickets for check-in
- [Clients](/docs/system/clients) — View client purchase history

---

## Database Reference

**Collection:** `orders` (defined in `appwrite.json`)

**Key Attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| `status` | enum | Order status: pending, paid, confirmed, cancelled, refunded |
| `paymentStatus` | enum | Payment status: pending, processing, succeeded, failed, refunded |
| `stripeSessionId` | string | Stripe Checkout session ID |
| `stripePaymentIntentId` | string | Stripe Payment Intent ID |
| `paidAt` | datetime | Timestamp when payment was confirmed |
| `cancelledAt` | datetime | Timestamp when order was cancelled |

**Indexes:**
- `idx_status` — Filter by order status
- `idx_paymentStatus` — Filter by payment status
- `idx_userId` — Filter by customer
- `idx_orderNumber` — Unique order number lookup