---
title: Passes
description: Consumable credit passes for repeat visits and session bundles
section: catalog
order: 6
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/passes
  - /admin/passes/new
  - /admin/passes/:id/edit
relatedCollections:
  - passes
  - user_passes
  - pass_consumptions
keywords:
  - pass
  - credits
  - membership
  - bundle
  - sessions
---

# Passes

Passes are pre-paid credits that customers purchase to access multiple sessions or experiences over a defined period. Passes provide flexibility for repeat customers and create recurring revenue for the business.

## Pass Concepts

1. **Pass Definition** - The template that defines credits, price, and validity
2. **User Pass** - An instance of a pass assigned to a specific customer
3. **Pass Consumption** - A record of credits being used for a booking

## Creating a Pass

Navigate to **Catalog -> Passes -> New pass**

### Identity Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Pass name (e.g., "10-Session Pass") |
| `nameEs` | string | No | Spanish name |
| `slug` | string | Yes | URL-friendly identifier (auto-generated, can be edited) |
| `description` | text | No | English description |
| `descriptionEs` | text | No | Spanish description |

### Credits and Price Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `totalCredits` | integer | Yes | Number of sessions/uses included (must be at least 1) |
| `basePrice` | double | Yes | Pass purchase price |
| `currency` | string | Yes | Three-letter currency code |

### Validity Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `validityDays` | integer | No | Days until pass expires (leave empty for no expiry) |

If `validityDays` is not set, the pass does not expire.

### Valid Experiences Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `validExperienceIds` | string | No | JSON array of experience IDs (if none selected, pass applies to all) |

By default, a pass applies to all experiences. To restrict a pass to specific experiences, select them in this field.

### Status Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | enum | Yes | `active`, `inactive` |
| `sortOrder` | integer | No | Display order in listings |

### Cover Image Section

| Field | Type | Description |
|-------|------|-------------|
| `heroImageId` | file | Optional cover image |

## Pass Fulfillment

Passes use `fulfillmentType: pass`. When a customer purchases a pass:
1. A `user_passes` record is created
2. The customer receives credits equal to `totalCredits`
3. Credits can be consumed for future bookings

## User Pass Lifecycle

When a pass is purchased, a User Pass record is created:

```
active -> exhausted | expired | cancelled
```

| Status | Meaning |
|--------|---------|
| `active` | Pass has remaining credits and is valid |
| `exhausted` | All credits have been used |
| `expired` | Validity period has ended |
| `cancelled` | Manually cancelled by admin |

## Consuming Credits

When a customer with an active pass books an experience with `saleMode: pass`:

1. System checks for active user_passes with remaining credits
2. If found, credits are consumed for the booking
3. A `pass_consumptions` record tracks the usage

### Manual Credit Adjustment

Admins can manually consume or restore credits:
- **Consume** - Deduct credits (e.g., for a session not tracked otherwise)
- **Restore** - Add credits back (e.g., to correct an error)

Navigate to **System -> Clients -> [Client] -> Passes -> [Pass] -> Adjust credits**

## Pass Credits Per Experience

Different experiences consume different amounts of credits:

| Experience Configuration | Credits Consumed |
|--------------------------|------------------|
| Pass saleMode with slot | 1 credit per slot |
| Pass saleMode without slot | 1 credit per booking |

Some experiences may consume multiple credits based on duration or complexity. This depends on how the experience is configured.

## Common Mistakes

**Creating a pass with 0 credits.**
The `totalCredits` must be at least 1. Credits represent sessions or uses the customer receives.

**Setting validityDays too short.**
Consider the customer's perspective. A 30-session pass should have sufficient validity for the customer to use them. Common validity periods: 30, 60, 90, 180, 365 days.

**Not explaining credit consumption clearly.**
Ensure customers understand how credits work: "1 credit = 1 session" is the default, but some experiences may consume more credits.

**Forgetting to restrict valid experiences.**
If a pass should only work for specific experiences, set the `validExperienceIds`. Otherwise, the pass applies to all experiences.

## Pass Workflow Summary

1. Admin creates a pass template with credits and price
2. Customer purchases pass via checkout
3. User pass is created with `active` status and full credits
4. Customer books experiences using pass credits
5. Each booking consumes credits and creates consumption records
6. When credits reach 0, user pass status becomes `exhausted`
7. If validity period ends, status becomes `expired`

## Related Pages

- [Experiences](./experiences.md) - Sale mode and pass configuration
- [Orders](../sales/orders.md) - Where pass purchases appear
- [Tickets](../system/tickets.md) - Pass bookings may generate tickets
- [Clients](../system/clients.md) - View assigned passes