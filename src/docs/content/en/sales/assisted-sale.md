---
title: Assisted Sale
description: Create orders on behalf of clients
section: sales
order: 2
lastUpdated: 2026-04-25
---

# Assisted Sale

Assisted Sale enables operators to create orders on behalf of clients, handling phone bookings, in-person point of sale, complimentary reservations, and corporate group bookings where direct client interaction is required.

## When to Use Assisted Sale

| Scenario | Description |
|----------|-------------|
| Phone bookings | Customer calls to reserve, operator completes the transaction |
| In-person point of sale | Walk-in customer pays at the desk |
| Complimentary bookings | Staff, VIP, or partner complimentary reservations |
| Corporate/group bookings | Multiple attendees with a single invoice |

> **Note:** Clients managed through Assisted Sale do not require an existing portal account. However, an account can be created for future self-service access.

## Accessing Assisted Sale

Navigate to **Sales → Assisted Sale** or press `Ctrl+K` and search for "New Sale."

## The 7-Step Wizard

The Assisted Sale wizard guides you through order creation in sequential steps. Progress is saved at each step, allowing you to return to complete the sale later.

### Step 1: Customer

Select or create the customer for this order.

| Option | Description |
|--------|-------------|
| Search Existing | Search by name, email, or phone number |
| Create New Client | Register a new client account with name, email, and phone |

> **Phone validation:** Phone numbers must be in E.164 format (`+52 55 1234 5678`). Use the `sanitizePhone()` utility to format numbers correctly.

**Fields for new client:**
- Full Name (required)
- Email (required)
- Phone (required, E.164 format)
- Password (optional, for creating portal access)

### Step 2: Experience

Select the experience to book.

| Filter | Description |
|--------|-------------|
| Search | Find by experience name |
| Type Filter | Filter by experience type (session, immersion, retreat, stay, private, package) |
| Status Filter | Show only published experiences |

**Experience card displays:**
- Name and type badge
- Public name (if different from name)
- Thumbnail image
- Sale mode indicator (`direct`, `request`, `assisted`, `pass`)
- Starting price

**Required information:**
- Experience (required)
- Edition (required for editions-based experiences)

### Step 3: Pricing Tier

Select the pricing tier for the chosen experience.

| Field | Description |
|-------|-------------|
| Tier Name | Name of the tier (e.g., "Individual", "Couple", "Group") |
| Price Type | `fixed`, `perPerson`, `perGroup`, `from`, `quote` |
| Amount | Calculated or quoted amount |

**Price type explanations:**

| Price Type | Description |
|------------|-------------|
| `fixed` | Flat rate regardless of attendees |
| `perPerson` | Rate multiplied by number of people |
| `perGroup` | Rate for the entire group |
| `from` | Starting price; final price calculated at checkout |
| `quote` | Custom price entered by operator |

### Step 4: Slot (Conditional)

This step appears only if the selected experience has `requiresSchedule` enabled.

| Field | Description |
|-------|-------------|
| Slot Date | Select from available published slots |
| Slot Time | Available times for the selected date |
| Attendees | Number of spots to reserve |

**Slot information displayed:**
- Date and time
- Location and room
- Available capacity
- Assigned instructor/facilitator

> **Conditional step:** If the experience does not require scheduling (e.g., on-demand immersions), this step is skipped and you proceed directly to Addons.

### Step 5: Addons

Select optional addons to include with the booking.

| Option | Description |
|--------|-------------|
| Required Addons | Pre-selected; cannot be removed |
| Default Addons | Pre-selected; can be removed |
| Optional Addons | Available to add |

**Addon assignment types:**

| Type | Behavior |
|------|----------|
| `required` | Automatically included; cannot be removed |
| `default` | Pre-selected but removable |
| `optional` | Available to add if desired |

**Addon types:**
- `service` — Spa treatments, therapy sessions
- `transport` — Airport transfers, transportation
- `food` — Meals, catering
- `accommodation` — Hotel nights, lodging
- `equipment` — Rental gear, materials
- `other` — Miscellaneous addons

### Step 6: Quantity

Specify the quantity for each line item.

| Field | Description |
|-------|-------------|
| Quantity | Number of units (affects total price for per-person tiers) |
| Notes | Special instructions for this item |

> **Per-person pricing:** When a per-person tier is selected, the quantity represents the number of people, and the total is calculated as: `unit price × quantity`.

### Step 7: Review

Final review before processing payment.

**Review displays:**
- Customer information
- Selected experience and edition
- Selected pricing tier
- Slot date/time (if applicable)
- Quantity
- Selected addons
- Price breakdown (subtotal, addons, total)
- Payment section

**Payment options:**

| Option | Description |
|--------|-------------|
| New Payment | Take card information for Stripe processing |
| Complimentary | Mark as free (requires reason) |
| Existing Payment on File | Use stored payment method |

**Complimentary sales:**
- Select "Complimentary" payment option
- Enter reason (required)
- Order completes with `paid` status but no charge
- Tickets are still generated for the customer

## Processing the Sale

1. **Review all details** on the final step
2. **Select payment method:**
   - For paid sales: Enter card details or use payment on file
   - For complimentary: Select "Complimentary" and provide reason
3. **Click "Complete Sale"**
4. **Order confirmation:**
   - Order is created with status `paid`
   - Status transitions to `confirmed`
   - Tickets are generated automatically
   - Pass credits are activated (if applicable)
   - Confirmation email is sent to customer

## Common Mistakes

- **Skipping slot selection:** For scheduled experiences, always select a slot. Missing slot information means tickets cannot be generated.
- **Wrong customer selected:** Always verify the customer name before completing the sale. Orders cannot be reassigned to a different customer.
- **Incorrect quantity:** For per-person pricing, quantity means number of people. Enter the correct number of attendees.
- **Forgetting required addons:** Required addons are automatically included but verify they are appropriate for the booking.
- **Complimentary without reason:** Complimentary sales require a reason for audit purposes. Always document the business justification.

## Related Pages

- [Orders](/docs/sales/orders) — View and manage all orders
- [Slots](/docs/operations/slots) — Manage availability and capacity
- [Clients](/docs/system/clients) — Access client management
