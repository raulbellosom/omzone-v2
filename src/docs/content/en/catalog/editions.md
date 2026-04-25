---
title: Editions
description: Time-bound versions of an experience with specific date ranges, registration windows, and capacity
section: catalog
order: 2
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/experiences/:id/editions
  - /admin/experiences/:id/editions/new
  - /admin/experiences/:id/editions/:editionId/edit
relatedCollections:
  - editions
keywords:
  - edition
  - date range
  - capacity
  - registration
  - retreat
---

# Editions

Editions represent specific versions or installments of an experience, each with its own date range, registration window, and capacity. Use editions when you need multiple date-bound iterations of the same experience template.

## When to Use Editions

Editions are ideal for:
- **Retreats** with specific start/end dates (e.g., "Spring Retreat 2026")
- **Seasonal programs** with limited enrollment windows
- **Multi-session programs** where each installment has different logistics
- **Limited-capacity events** with registration cutoffs

Not all experiences need editions. If an experience is a recurring session with ongoing availability, you may only need slots without editions.

## Creating an Edition

Navigate to **Catalog -> Experiences -> [Experience Name] -> Editions -> New edition**

### Identity Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Edition name (e.g., "Summer Retreat 2026") |
| `nameEs` | string | No | Spanish edition name |
| `description` | text | No | English description for this specific edition |
| `descriptionEs` | text | No | Spanish description |

### Dates Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `startDate` | datetime | No | When this edition begins |
| `endDate` | datetime | No | When this edition ends |
| `registrationOpens` | datetime | No | When registration becomes available |
| `registrationCloses` | datetime | No | When registration closes (must be before startDate) |

### Capacity and Status Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `capacity` | integer | No | Maximum participants for this edition (leave empty for unlimited) |
| `status` | enum | Yes | `draft`, `open`, `closed`, `completed`, `cancelled` |
| `heroImageId` | file | No | Edition-specific cover image (optional override) |

## Edition Status Values

| Status | Meaning |
|--------|---------|
| `draft` | Edition exists but not accepting registrations |
| `open` | Registration is live |
| `closed` | Registration is closed |
| `completed` | Edition has concluded |
| `cancelled` | Edition was cancelled |

## Edition Workflow

```
draft -> open -> closed -> completed
              |
              v
          cancelled
```

### Registration Windows

Use `registrationOpens` and `registrationCloses` to create time-bound enrollment periods:

- `registrationOpens` - Date when customers can start booking this edition
- `registrationCloses` - Date when booking is no longer allowed (typically before the experience starts)

If `registrationCloses` is not set, registration remains open until the edition begins.

## Capacity Management

The edition `capacity` is separate from slot capacities. Use edition capacity for:
- Overall enrollment limits for the edition
- Coordinating with external capacity (venue, partners)
- Marketing limited-availability offers

Slot capacities within an edition should not exceed the edition capacity.

## Linking Pricing to Editions

When creating [Pricing Tiers](../catalog/pricing-tiers.md), you can optionally link them to a specific edition. This allows different pricing for different date ranges of the same experience.

For example:
- "Early Bird" pricing tier linked to "Spring Retreat 2026" edition
- "Regular" pricing tier linked to "Summer Retreat 2026" edition

## Common Mistakes

**Setting endDate before startDate.**
The end date must be after the start date. The form will show an error if this is violated.

**Setting registrationCloses after the startDate.**
Registration close date should be before the experience begins to allow preparation time.

**Creating editions when slots alone would suffice.**
Editions add complexity. If you only need date-based scheduling, consider using slots with `editionId` to reference an optional edition rather than creating multiple full editions.

**Forgetting to set capacity.**
If an edition has no capacity limit, it relies entirely on individual slot capacities. If you need an overall enrollment cap, set the edition capacity.

## Related Pages

- [Experiences](./experiences.md) - Parent entity for editions
- [Pricing Tiers](./pricing-tiers.md) - Linking pricing to specific editions
- [Slots & Agenda](../operations/slots.md) - Creating availability within editions