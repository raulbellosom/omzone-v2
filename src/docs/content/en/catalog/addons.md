---
title: Addons
description: Optional extras that can be attached to experiences - services, transport, food, equipment, and more
section: catalog
order: 4
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/addons
  - /admin/addons/new
  - /admin/addons/:id/edit
  - /admin/experiences/:id/addons
relatedCollections:
  - addons
  - addon_assignments
keywords:
  - addon
  - extra
  - service
  - upgrade
  - transport
---

# Addons

Addons are optional extras that customers can add to their experience booking. Examples include airport transfers, meal packages, equipment rentals, accommodation upgrades, and spa services.

## Addon Structure

There are two concepts:
1. **Addon (standalone)** - The addon definition with name, description, type, and base pricing
2. **Addon Assignment** - The link between an addon and a specific experience, with optional overrides

## Creating an Addon

Navigate to **Catalog -> Addons -> New addon**

### Identity Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Addon name (e.g., "Airport Transfer") |
| `nameEs` | string | No | Spanish name |
| `slug` | string | Yes | URL-friendly identifier (auto-generated, can be edited) |
| `description` | text | No | English description of the addon |
| `descriptionEs` | text | No | Spanish description |

### Type and Price Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `addonType` | enum | Yes | `service`, `transport`, `food`, `accommodation`, `equipment`, `other` |
| `priceType` | enum | Yes | `fixed`, `per-person`, `per-day`, `per-unit`, `quote` |
| `basePrice` | double | Yes | Base price value |
| `currency` | string | Yes | Three-letter currency code |

**Addon Types:**

| Type | Use Case |
|------|----------|
| `service` | Spa treatment, massage, private session |
| `transport` | Airport pickup, shuttle service |
| `food` | Meal package, catering, welcome dinner |
| `accommodation` | Room upgrade, lodging extension |
| `equipment` | Yoga mat rental, props, gear |
| `other` | Anything not covered above |

**Price Types:**

| Type | Description |
|------|-------------|
| `fixed` | Single price regardless of context |
| `per-person` | Per individual attendee |
| `per-day` | Per day of the experience |
| `per-unit` | Per unit/item |
| `quote` | Custom quote required |

### Options Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isStandalone` | boolean | Yes | Can be sold independently (not linked to an experience) |
| `isPublic` | boolean | Yes | Visible to customers on the public site |
| `followsMainDuration` | boolean | No | Automatically extend if the main experience duration changes |
| `maxQuantity` | integer | No | Maximum units per booking (leave empty for unlimited) |

### Status Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | enum | Yes | `active`, `inactive` |
| `sortOrder` | integer | No | Display order in listings |

## Assigning Addons to Experiences

Navigate to **Catalog -> Experiences -> [Experience Name] -> Addons -> Assign addon**

### Assignment Options

| Field | Type | Description |
|-------|------|-------------|
| `addonId` | reference | The addon to assign |
| `editionId` | reference | Optional - link to specific edition |
| `isRequired` | boolean | Automatically included (customer cannot opt out) |
| `isDefault` | boolean | Pre-selected during checkout |
| `overridePrice` | double | Optional - different price than base price |
| `sortOrder` | integer | Display order in the addon list |

### Assignment Behavior

| Required | Default | Behavior |
|----------|---------|----------|
| No | No | Optional addon, customer chooses |
| Yes | No | Required addon, included automatically, cannot remove |
| No | Yes | Pre-selected but customer can deselect |
| Yes | Yes | Required AND pre-selected |

## Standalone vs Experience-Linked Addons

**Standalone addons (`isStandalone: true`):**
- Can be purchased separately via direct link or search
- Useful for add-ons customers might want without booking an experience first
- Example: "Equipment Rental" that any visitor can add

**Experience-linked addons (`isStandalone: false`):**
- Only available when booking a specific experience
- Appear during the checkout flow for that experience
- Example: "Sunset Dinner" only available when booking "Retreat Week"

## Common Mistakes

**Creating addons without checking the experience sale mode.**
Addons are attached to experiences. Ensure the experience exists and has the correct sale mode before assigning addons.

**Setting `isRequired` without understanding the impact.**
Required addons are automatically included and the customer cannot remove them. Use this for mandatory fees like environmental fees or insurance.

**Forgetting to set `isPublic`.**
If `isPublic` is false, the addon will not appear in customer-facing interfaces even if assigned to an experience.

**Not setting an override price when needed.**
If an experience needs a different price than the base addon price, use `overridePrice` on the assignment. Otherwise, the base price applies.

## Addon Workflow in Checkout

When a customer books an experience with assigned addons:

1. Customer selects pricing tier
2. If slot is required, customer selects slot
3. Addon selection appears (optional addons shown)
4. Required addons are automatically included
5. Default addons are pre-selected but can be removed
6. Customer can add optional addons
7. Total is calculated including all selected addons

## Related Pages

- [Experiences](./experiences.md) - The parent entity for addon assignments
- [Assisted Sale](../sales/assisted-sale.md) - Addons in the manual sale workflow
- [Packages](./packages.md) - Alternative bundling approach