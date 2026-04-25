---
title: Pricing Tiers
description: Configure pricing for experiences with multiple pricing options, price types, and edition-specific pricing
section: catalog
order: 3
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/experiences/:id/pricing
  - /admin/experiences/:id/pricing/new
  - /admin/experiences/:id/pricing/:tierId/edit
relatedCollections:
  - pricing_tiers
  - pricing_rules
keywords:
  - pricing
  - price
  - tier
  - cost
  - ticket
---

# Pricing Tiers

Pricing tiers define what customers pay to book an experience. Each experience can have multiple tiers to offer different price points or booking options (e.g., early bird, general admission, VIP).

> **Important:** Pricing tiers belong to **Experiences**, not Publications. Do not add pricing to a Publication. If a Publication needs pricing information, link it to an Experience that has pricing tiers.

## Creating a Pricing Tier

Navigate to **Catalog -> Experiences -> [Experience Name] -> Pricing -> New tier**

### Identity Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Tier name shown to customers (e.g., "Early Bird") |
| `nameEs` | string | No | Spanish tier name |
| `description` | text | No | English description of what's included |
| `descriptionEs` | text | No | Spanish description |

### Price Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `priceType` | enum | Yes | `fixed`, `per-person`, `per-group`, `from`, `quote` |
| `basePrice` | double | Yes | Numeric price value (must be greater than 0) |
| `currency` | string | Yes | Three-letter currency code (e.g., MXN, USD) |

### Price Types

| Type | Description | Example |
|------|-------------|---------|
| `fixed` | Single price regardless of participants | 1500 MXN total |
| `per-person` | Price per individual attendee | 500 MXN per person |
| `per-group` | Price per group (regardless of size) | 3000 MXN for the group |
| `from` | Starting price indicator (display only) | "From $1,200 MXN" |
| `quote` | Custom quote required (no fixed price) | Contact for pricing |

### Persons Section (Optional)

For `per-person` and `per-group` types:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `minPersons` | integer | No | Minimum participants required |
| `maxPersons` | integer | No | Maximum participants allowed |

### Visuals and Assignment Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `badge` | string | No | Short label like "Popular", "Bestseller", "Early Bird" |
| `isHighlighted` | boolean | No | Show as the featured/recommended tier |
| `edition` | reference | No | Link to a specific edition (makes tier edition-specific) |
| `isActive` | boolean | Yes | Whether this tier is available for booking |
| `sortOrder` | integer | No | Display order (lower number = appears first) |

## Pricing Tier Options

### Edition-Specific Pricing

Link a pricing tier to a specific edition. When customers select that edition, only the relevant pricing tiers appear. Example use cases:

- "Early Bird Spring 2026" tier linked to "Spring Retreat 2026" edition
- "Regular Season" tier with no edition link (applies to all other editions)

### Highlighted Tiers

The `isHighlighted` flag marks a tier as recommended. In the customer-facing experience, highlighted tiers appear prominently. Use this for your best-value or most popular option.

### Badges

Display short labels on pricing tiers to draw attention:
- "Popular" - Most booked
- "Bestseller" - Top revenue generator
- "Early Bird" - Limited-time discount
- "Limited" - Scarcity messaging

## Pricing Rules

Pricing rules can modify the displayed price based on conditions:

| Rule Type | Description |
|-----------|-------------|
| `early-bird` | Discount for booking far in advance |
| `quantity-discount` | Discount for larger groups |
| `date-range` | Special pricing during specific dates |
| `promo-code` | Coupon-based discounts |

Pricing rules are managed separately and linked to pricing tiers. They are evaluated at checkout time.

## Common Mistakes

**Creating a tier with basePrice of 0.**
The base price must be greater than 0 for `fixed`, `per-person`, and `per-group` types. Use `quote` or `from` if you need to display without a specific price.

**Forgetting to set `isActive` to true.**
New tiers default to active, but double-check when copying tiers from other experiences. Inactive tiers are not shown to customers.

**Linking a tier to the wrong edition.**
When linking to an edition, ensure it's the correct one. Once saved, the link is permanent unless you edit the tier.

**Creating pricing on a Publication instead of an Experience.**
Publications do not hold pricing. Link the Publication to an Experience that has the desired pricing tiers.

## Pricing Tier Display Order

Tiers are displayed in ascending `sortOrder` value. To control which tier appears first:

1. Set `sortOrder` to a lower number for the tier you want shown first
2. Use `isHighlighted: true` to feature a specific tier prominently

## Related Pages

- [Experiences](./experiences.md) - Parent entity for pricing tiers
- [Editions](./editions.md) - Edition-specific pricing
- [Packages](./packages.md) - Bundled pricing without per-tier configuration
- [Passes](./passes.md) - Credit-based pricing model