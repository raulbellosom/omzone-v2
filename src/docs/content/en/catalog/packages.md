---
title: Packages
description: Bundled experiences combining multiple items at a fixed price
section: catalog
order: 5
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/packages
  - /admin/packages/new
  - /admin/packages/:id/edit
relatedCollections:
  - packages
  - package_items
keywords:
  - package
  - bundle
  - retreat
  - stay
---

# Packages

Packages are pre-configured bundles that combine multiple items (experiences, addons, benefits, accommodation, meals) at a fixed total price. Unlike experiences which have multiple pricing tiers, packages have a single price that includes all bundled items.

## When to Use Packages

Use packages when:
- You want to offer a complete retreat experience at one price
- You need to bundle multiple services together
- You want to pre-curate a specific combination for customers
- You have a fixed-stay offering with multiple included elements

## Creating a Package

Navigate to **Catalog -> Packages -> New package**

### Identity Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Package name (e.g., "Wellness Retreat Package") |
| `nameEs` | string | No | Spanish name |
| `slug` | string | Yes | URL-friendly identifier (auto-generated, can be edited) |
| `description` | text | No | English description of the package |
| `descriptionEs` | text | No | Spanish description |

### Price and Logistics Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `totalPrice` | double | Yes | Fixed package price |
| `currency` | string | Yes | Three-letter currency code |
| `durationDays` | integer | No | Duration in days (for display purposes) |
| `capacity` | integer | No | Maximum participants for the package |

### Status Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | enum | Yes | `draft`, `published`, `archived` |
| `sortOrder` | integer | No | Display order in listings |

### Images Section

| Field | Type | Description |
|-------|------|-------------|
| `heroImageId` | file | Cover image for the package |
| `galleryImageIds` | file[] | Additional images for gallery |

## Package Items

A package consists of multiple items. Navigate to **Catalog -> Packages -> [Package Name] -> Items** to add items.

### Item Types

| Type | Description | Example |
|------|-------------|---------|
| `experience` | Links to an existing experience | 5 yoga sessions |
| `addon` | Links to an existing addon | Airport transfer |
| `benefit` | Descriptive inclusion (no reference) | Welcome cocktail |
| `accommodation` | Lodging details | 4 nights in ocean-view room |
| `meal` | Food inclusions | All meals included |

### Item Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `itemType` | enum | Yes | `experience`, `addon`, `benefit`, `accommodation`, `meal` |
| `referenceId` | string | No | ID of the linked experience or addon (optional) |
| `description` | text | Yes | Description of what's included |
| `descriptionEs` | text | No | Spanish description |
| `quantity` | integer | No | Number of units included |
| `sortOrder` | integer | No | Display order in package listing |

### Item Example Patterns

**Experience item:**
```
itemType: "experience"
referenceId: "yoga-session-123"
description: "Daily morning yoga sessions"
quantity: 5
```

**Benefit item (no reference):**
```
itemType: "benefit"
referenceId: null
description: "Welcome wellness kit"
quantity: 1
```

**Accommodation item:**
```
itemType: "accommodation"
referenceId: null
description: "4 nights in Garden View Suite"
quantity: 1
```

## Publishing Requirements

A package must have at least one item before it can be published. The validation ensures:
- At least one package item exists
- Items have required fields completed

## Package vs Experience with Addons

| Aspect | Package | Experience + Addons |
|--------|---------|---------------------|
| Price | Single fixed price | Base price + addon prices |
| Customization | Fixed contents | Customer chooses addons |
| Use case | Pre-curated stays | Modular experiences |
| Management | Package-level | Experience-level |

## Common Mistakes

**Publishing a package with no items.**
A package must have at least one item before it can be set to `published`. Add items in the Items tab before publishing.

**Not linking experiences or addons when appropriate.**
Use `referenceId` to link to existing experiences or addons. This creates a proper relationship and allows the system to track what's included.

**Forgetting duration or capacity.**
Set `durationDays` for multi-day packages so customers know the length. Set `capacity` if the package has a participant limit.

## Package Display

Packages appear in the public catalog with:
- Hero image
- Name and description
- Duration and capacity
- Included items (preview)
- Total price

The fulfillment type for packages is `package`, which generates a ticket upon purchase.

## Related Pages

- [Experiences](./experiences.md) - Can be included as items in packages
- [Addons](./addons.md) - Can be included as items in packages
- [Pricing Tiers](./pricing-tiers.md) - Alternative pricing model for experiences