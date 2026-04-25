---
title: Experiences
description: Core wellness offerings - sessions, immersions, retreats, stays, and packages
section: catalog
order: 1
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/experiences
  - /admin/experiences/new
  - /admin/experiences/:id/edit
relatedCollections:
  - experiences
  - editions
  - pricing_tiers
  - addon_assignments
keywords:
  - experience
  - catalog
  - offering
  - session
  - immersion
  - retreat
  - stay
  - package
---

# Experiences

Experiences are the core offerings in OMZONE. Each experience defines what customers can book, how they can book it, and what they receive upon purchase.

## Overview

Navigate to **Catalog -> Experiences** to see all experiences. From here you can:
- Filter by type, status, or search by name
- Create new experiences
- Edit existing experiences
- Update status (draft, published, archived)
- Access editions, pricing, addons, and slots

---

## Field Reference

Complete documentation for all form fields in the Experience editor.

### Identity Section

Fields in the Identity section control how the experience is identified internally and displayed to customers.

#### `name` (Internal Name)

| Attribute | Value |
|-----------|-------|
| Type | string |
| Required | Yes |
| Max Length | 255 |
| Visible to Customers | No |

**Purpose:** Internal identifier for admin reference.

**Impact Analysis:**
```
name → Admin lists and internal reports
name → NOT visible in any public-facing pages
name → NOT used in customer emails or tickets
name → No impact on SEO or checkout flow
```

**Best Practices:**
- Use descriptive names for internal organization (e.g., "Yoga Sunrise — internal name")
- Does not need to be translated since it's admin-only

---

#### `publicName` (Public Name EN)

| Attribute | Value |
|-----------|-------|
| Type | string |
| Required | Yes |
| Max Length | 255 |
| Visible to Customers | Yes (English locale) |

**Purpose:** Primary customer-facing name in English.

**Impact Analysis:**
```
publicName → Experience listing title (locale=en)
publicName → Checkout page header
publicName → Email confirmations (locale=en)
publicName → Ticket name (if generatesTickets=true)
publicName → Auto-generates slug when first filled (if slug is empty)
```

**Important:** This field is mandatory and drives multiple downstream systems.

---

#### `publicNameEs` (Public Name ES)

| Attribute | Value |
|-----------|-------|
| Type | string |
| Required | No |
| Max Length | 255 |
| Visible to Customers | Yes (Spanish locale) |

**Purpose:** Spanish translation of the public name.

**Behavior:**
- Only displayed when user locale is `es-MX` or `es`
- Falls back to `publicName` if this field is empty

**Impact Analysis:**
```
publicNameEs → Spanish listing title (locale=es)
publicNameEs → Spanish checkout header (locale=es)
publicNameEs → Spanish confirmation email (locale=es)
```

---

#### `slug` (URL Identifier)

| Attribute | Value |
|-----------|-------|
| Type | string |
| Required | Yes |
| Pattern | lowercase letters, numbers, hyphens only |
| Uniqueness | Must be unique across ALL experiences AND publications |

**Auto-generation Behavior:**
- When `publicName` is first filled and `slug` is empty, the slug auto-generates from the public name
- Once set, changing `publicName` does NOT automatically update the slug
- User can manually edit the slug at any time

**Impact Analysis:**
```
slug → URL structure: /experiences/{slug}
slug → Must not conflict with /{slug} for publications
slug → Changing breaks existing bookmarks and external links
slug → Used for canonical URLs in SEO
```

**Valid Examples:**
| Example | Valid? | Notes |
|---------|--------|-------|
| `yoga-session` | Yes | Standard format |
| `yoga-session-2026` | Yes | With numbers |
| `Yoga Session` | No | Contains uppercase and space |
| `yoga%session` | No | Contains invalid character `%` |
| `yoga session` | No | Contains space |

**Critical Constraint:** Slugs must be unique across both experiences AND publications. A slug like "yoga" cannot be used for both an experience and a publication.

---

### Classification Section

Fields in the Classification section determine how customers purchase and what they receive.

#### `type` (Experience Type)

| Attribute | Value |
|-----------|-------|
| Type | enum |
| Required | Yes |
| Options | `session`, `immersion`, `retreat`, `stay`, `private`, `package` |

**Options Analysis:**

| Type | Description | Typical Duration | Listing Badge |
|------|-------------|------------------|--------------|
| `session` | Individual yoga or wellness session | 1-2 hours | "Session" |
| `immersion` | Multi-hour intensive experience | 3-8 hours | "Immersion" |
| `retreat` | Extended program spanning days | 1-14 days | "Retreat" |
| `stay` | Accommodation-based experience | 1+ nights | "Stay" |
| `private` | One-on-one or exclusive group | Variable | "Private" |
| `package` | Bundled experiences combined | Variable | "Package" |

**Impact Analysis:**
```
type → Classification badge in listings
type → Filtering options in admin
type → No functional gates or restrictions
type → Purely organizational and customer expectation setting
```

**Note:** Type does NOT affect functionality. It can be combined with any saleMode and fulfillmentType.

---

#### `saleMode` (Sale Mode)

| Attribute | Value |
|-----------|-------|
| Type | enum |
| Required | Yes |
| Options | `direct`, `request`, `assisted`, `pass` |

**Options Analysis:**

| Mode | Checkout Behavior | Admin Involvement | Stripe Integration |
|------|-------------------|-------------------|-------------------|
| `direct` | Immediate purchase online | None required | Yes — Stripe Checkout |
| `request` | Customer submits request | Admin reviews and quotes | No — manual follow-up |
| `assisted` | Admin creates order manually | Full wizard-driven | Yes — admin initiates |
| `pass` | Customer uses existing credits | None | No — credit redemption |

**Critical Relationship with `fulfillmentType`:**

| Sale Mode | Valid Fulfillment Types | Invalid Combinations |
|-----------|------------------------|---------------------|
| `direct` | `ticket`, `booking`, `package` | `pass` |
| `request` | `ticket`, `booking`, `pass`, `package` | — |
| `assisted` | `ticket`, `booking`, `pass`, `package` | — |
| `pass` | `pass` | `ticket`, `booking`, `package` |

**Why These Combinations Are Invalid:**

| Combination | Reason |
|-------------|--------|
| `saleMode="direct"` + `fulfillmentType="pass"` | Cannot pay AND redeem credits simultaneously |
| `saleMode="pass"` + `fulfillmentType="ticket"` | Pass credits are consumed, not purchased |
| `saleMode="pass"` + `fulfillmentType="booking"` | Pass credits are consumed, not purchased |
| `saleMode="pass"` + `fulfillmentType="package"` | Pass credits are consumed, not purchased |

**Checkout Flow Impact:**

| saleMode | Customer UI Behavior |
|----------|---------------------|
| `direct` | Full checkout with Stripe payment, "Book Now" button |
| `request` | "Request Booking" button instead of "Book Now", no payment step |
| `assisted` | Not available for self-service (admin creates via wizard only) |
| `pass` | "Redeem Pass" button, enters pass code or selects from owned passes |

---

#### `fulfillmentType` (Fulfillment Type)

| Attribute | Value |
|-----------|-------|
| Type | enum |
| Required | Yes |
| Options | `ticket`, `booking`, `pass`, `package` |

**Options Analysis:**

| Fulfillment | What Customer Receives | Ticket Generated? | Check-in Required? |
|------------|------------------------|-------------------|-------------------|
| `ticket` | QR-coded ticket with unique ID | Yes | Yes (validate at entry) |
| `booking` | Confirmation email only | No | No (honor system) |
| `pass` | Credit deducted from pass | No | Yes (consume pass) |
| `package` | Ticket(s) for bundled items | Yes (per item) | Yes (validate each ticket) |

**Critical Constraints:**

| Constraint | Description |
|------------|-------------|
| `generatesTickets` dependency | When `fulfillmentType` = "ticket" or "package", `generatesTickets` should typically be `true` |
| `requiresSchedule` compatibility | For "ticket" fulfillment, `requiresSchedule` should typically be `true` |
| Multiple attendees | When `allowQuantity` = `true`, ticket generates ONE ticket with quantity, not multiple individual tickets |

---

### Description Section

Fields in the Description section control the textual content displayed to customers.

#### `shortDescription` (Short Description EN)

| Attribute | Value |
|-----------|-------|
| Type | string |
| Required | No |
| Max Length | 500 characters |

**Display Locations:**
- Experience card in listings
- Above the fold on detail page
- May be used as meta description fallback for SEO

**Fallback Behavior:**
- If empty and `longDescription` is filled, the system may use truncated `longDescription`
- No automatic generation from other fields

---

#### `shortDescriptionEs` (Short Description ES)

| Attribute | Value |
|-----------|-------|
| Type | string |
| Required | No |
| Max Length | 500 characters |

**Display Location:** Spanish experience card and above fold (locale=es)

**Fallback Behavior:**
- If empty, falls back to `shortDescription` (English)
- System does NOT auto-translate

---

#### `longDescription` (Long Description EN)

| Attribute | Value |
|-----------|-------|
| Type | text |
| Required | No |
| Max Length | 5,000 characters |

**Display Location:** Below the fold on the experience detail page

**Fallback Behavior:**
- If empty and `shortDescription` is filled, system may extend shortDescription
- No automatic generation

**SEO Note:** Contributes to page content SEO. Ensure first 155 characters are compelling as search engines may use this portion.

---

#### `longDescriptionEs` (Long Description ES)

| Attribute | Value |
|-----------|-------|
| Type | text |
| Required | No |
| Max Length | 5,000 characters |

**Display Location:** Below the fold on detail page (locale=es)

**Fallback Behavior:**
- If empty, falls back to `longDescription` (English)
- System does NOT auto-translate

---

### Cover/Gallery Section

#### `heroImageId` (Cover Image)

| Attribute | Value |
|-----------|-------|
| Type | file |
| Max Count | 1 |

**Display Behavior:**
- Shown as background on experience card with text overlay
- Hero section on experience detail page
- Used as OG image fallback if no OG image set on publication

**Recommendations:**
- Resolution: 1920x1080 or larger
- Format: JPG or WebP
- Aspect ratio: 16:9 recommended

**Important:** If hero image is removed, a placeholder color is shown. The system does NOT auto-fallback to gallery[0].

---

#### `galleryImageIds` (Gallery Images)

| Attribute | Value |
|-----------|-------|
| Type | file[] |
| Max Count | 10 |

**Display Behavior:**
- Displayed as clickable carousel on experience detail page
- Ordered array — first image is NOT used as fallback for hero

**Recommendations:**
- Consistent aspect ratio across gallery
- Minimum width: 1200px
- Format: JPG or WebP

---

### Behavior Section

Toggle fields that control booking behavior.

#### `requiresSchedule` (Requires Date/Slot Selection)

| Attribute | Value |
|-----------|-------|
| Type | boolean |
| Default | false |

**When Enabled:**
- Customer must select a specific date+time slot during checkout
- Only slots with `status = "open"` are available
- Slot capacity is enforced

**When Disabled:**
- Customer selects date only (if `requiresDate = true`)
- Or no date selection at all (open timing/appointment-based)

**Decision Tree:**
```
Does experience have fixed time slots that customers must book?
├── YES → requiresSchedule = true
└── NO → Does experience happen on specific dates but not times?
          ├── YES → requiresDate = true
          └── NO → Both false (open timing or appointment-based)
```

---

#### `requiresDate` (Requires Specific Date)

| Attribute | Value |
|-----------|-------|
| Type | boolean |
| Default | false |

**When Enabled:**
- Customer must select a date during checkout
- Time slot selection NOT required (unless `requiresSchedule = true`)

**When Disabled:**
- No date selection required
- Useful for experiences with open timing

---

#### `allowQuantity` (Allows Multiple Attendees)

| Attribute | Value |
|-----------|-------|
| Type | boolean |
| Default | false |

**When Enabled:**
- Multiple attendees allowed in one order
- `minQuantity` and `maxQuantity` fields appear

**When Disabled:**
- Exactly 1 ticket per order
- Quantity fields are hidden

**Quantity Configuration:**

| allowQuantity | minQuantity | maxQuantity | Behavior |
|---------------|-------------|-------------|----------|
| false | — | — | Exactly 1 ticket per order |
| true | empty | empty | 1 to unlimited per order |
| true | 2 | empty | Minimum 2, no maximum |
| true | empty | 5 | Maximum 5, minimum 1 |
| true | 2 | 5 | Minimum 2, maximum 5 |

**Important:** When quantity > 1, the system generates ONE ticket with the quantity, not individual tickets per person. For individual named tickets, additional guest information collection may be needed at check-in.

---

#### `generatesTickets` (Generates Tickets After Purchase)

| Attribute | Value |
|-----------|-------|
| Type | boolean |
| Default | true |

**Ticket Generation Relationship:**

| generatesTickets | fulfillmentType | Expected Behavior |
|-----------------|-----------------|-------------------|
| true | `ticket` | QR ticket generated with unique code |
| true | `booking` | Ticket generated (consider using "booking" instead) |
| false | `ticket` | No ticket generated (may be inconsistent) |
| false | `booking` | No ticket (correct for booking type) |
| true/false | `pass` | No ticket generated (pass consumption is separate) |
| true/false | `package` | Ticket generated per package item |

---

### Publication Section

#### `status` (Publication Status)

| Attribute | Value |
|-----------|-------|
| Type | enum |
| Required | Yes |
| Options | `draft`, `published`, `archived` |

**Status Lifecycle:**

```
┌─────────┐     publish      ┌───────────┐     archive     ┌──────────┐
│  DRAFT  │ ───────────────► │ PUBLISHED │ ──────────────► │ ARCHIVED │
└─────────┘                  └───────────┘                  └──────────┘
     ▲                           │                              │
     │         unpublish         │         return to draft      │
     └───────────────────────────┴──────────────────────────────┘
```

**Status Impact:**

| Status | Catalog Visibility | Booking Available | Can Edit | Can Delete |
|--------|-------------------|-------------------|----------|------------|
| `draft` | No | No | Yes | Yes |
| `published` | Yes | Yes (if pricing exists) | Yes | No |
| `archived` | No | No | Yes | No |

**Deletion Constraint:** An experience in `published` status can be moved to `archived` but CANNOT be deleted. You must first move it to `draft` before deletion.

---

#### `sortOrder` (Display Order)

| Attribute | Value |
|-----------|-------|
| Type | integer |
| Required | No |

**Behavior:**
- Lower numbers appear first in listings
- Empty/0 is treated as last position
- Same sort order results in alphabetical tiebreaker by `publicName`

---

### SEO Section

#### `seoTitle` (SEO Title)

| Attribute | Value |
|-----------|-------|
| Type | string |
| Required | No |
| Max Length | 255 characters |

**Purpose:** Custom page title for search engines.

**Fallback:** Uses `publicName` if empty.

**Best Practices:**
- Should be compelling and include key terms
- Should be unique per page (no duplicate titles)
- Include brand name for brand searches

---

#### `seoDescription` (SEO Description)

| Attribute | Value |
|-----------|-------|
| Type | string |
| Required | No |
| Max Length | 500 characters |

**Purpose:** Meta description for search engines.

**Fallback:** Uses first 155 characters of `shortDescription` or `longDescription` if empty.

**Best Practices:**
- Should include call-to-action
- Should be unique per page
- First 155 characters shown in search results

---

## Sale Mode Decision Tree

Use this decision tree to select the appropriate sale mode:

```
Does customer purchase online without admin involvement?
│
├── YES → Does customer use existing credits?
│         │
│         ├── YES → saleMode = "pass"
│         │         fulfillmentType = "pass"
│         │
│         └── NO → saleMode = "direct"
│                  fulfillmentType = "ticket" or "booking" or "package"
│
└── NO → Does customer submit request and admin quotes?
          │
          ├── YES → saleMode = "request"
          │         fulfillmentType = any
          │
          └── NO → saleMode = "assisted"
                   fulfillmentType = any
```

---

## Common Mistakes

### Setting pricing on a Publication instead of the Experience

Pricing tiers belong to the Experience. Publications are for editorial content only. If you need pricing visible on a Publication, link the Publication to an Experience that has pricing tiers.

### Using a `slug` that might conflict with future publications

The slug is permanent once set. Choose carefully. A slug like "yoga-retreat" will prevent any publication from using that slug as its URL.

### Creating an experience without any pricing tiers

Customers cannot book an experience that has no pricing tiers. Always add at least one pricing tier before publishing.

### Setting `requiresSchedule` to false but then creating slots

If an experience does not require scheduling, customers will not be prompted to select a slot. Slots can still be created but will not be shown during checkout.

### Using invalid saleMode + fulfillmentType combinations

| Combination | Issue |
|-------------|-------|
| `direct` + `pass` | Cannot pay AND redeem credits simultaneously |
| `pass` + `ticket` | Pass credits are consumed, not purchased |

---

## Experience Tabs

After creating an experience, additional tabs appear:

### Info Tab

Edit the core experience data (same fields as creation).

### Editions Tab

Manage time-bound versions of an experience (see [Editions](./editions.md)).

### Pricing Tab

Add and manage pricing tiers (see [Pricing Tiers](./pricing-tiers.md)).

### Addons Tab

Assign optional addons to this experience (see [Addons](./addons.md)).

### Slots Tab

Create availability slots for scheduled booking (see [Slots & Agenda](../operations/slots.md)).

---

## Experience Status Lifecycle

```
draft -> published -> archived
```

| Status | Catalog Visibility | Booking Available | Can Edit |
|--------|--------------------|--------------------|----------|
| `draft` | Admin only | No | Yes |
| `published` | Public | Yes | Yes |
| `archived` | Admin only | No | Yes |

To publish: Edit the experience and set status to `published`.
To archive: Edit the experience and set status to `archived`.
From archived, you can return to `draft` and then `published` again.

---

## Related Pages

- [Editions](./editions.md) - Time-bound versions of experiences
- [Pricing Tiers](./pricing-tiers.md) - Setting prices for experiences
- [Addons](./addons.md) - Optional extras
- [Slots & Agenda](../operations/slots.md) - Creating availability
- [Orders](../sales/orders.md) - Order status and transitions
- [Flows](../reference/flows.md) - Decision trees and flow diagrams
- [Known Limitations](../reference/known-limitations.md) - Intentional constraints and edge cases
