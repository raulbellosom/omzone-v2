---
title: Flows
description: Decision trees and flow diagrams for OMZONE admin operations
section: reference
order: 1
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/experiences
  - /admin/experiences/new
  - /portal/checkout
  - /admin/publications
relatedCollections:
  - experiences
  - orders
  - publications
  - slots
keywords:
  - flow
  - decision tree
  - workflow
  - checkout
  - creation
---

# Flows

Visual decision trees and flow diagrams for OMZONE admin operations.

---

## Experience Creation Flow

### Step-by-Step Creation Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXPERIENCE CREATION FLOW                           │
└─────────────────────────────────────────────────────────────────────────────┘

START: Navigate to Catalog → Experiences → New experience
          │
          ▼
┌─────────────────┐
│ 1. IDENTITY     │
│ ─────────────── │
│ • name (internal)│
│ • publicName    │  ──► Auto-generates slug from publicName
│ • publicNameEs  │
│ • slug          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. CLASSIFICATION│
│ ────────────────│
│ • type          │  ──► session, immersion, retreat, stay, private, package
│ • saleMode      │  ──► direct, request, assisted, pass
│ • fulfillmentType│ ──► ticket, booking, pass, package
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. DESCRIPTION  │
│ ────────────────│
│ • shortDesc (EN)│  ──► Max 500 chars
│ • shortDesc (ES)│
│ • longDesc (EN) │  ──► Max 5000 chars
│ • longDesc (ES) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. IMAGES       │
│ ────────────────│
│ • heroImageId   │  ──► Single cover image
│ • galleryImageIds│ ──► Up to 10 gallery images
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. BEHAVIOR     │
│ ────────────────│
│ • requiresSchedule│ ──► Customer selects slot?
│ • requiresDate  │
│ • allowQuantity │
│ • generatesTickets│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 6. PUBLICATION  │
│ ────────────────│
│ • status        │  ──► draft (default)
│ • sortOrder     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 7. SEO          │
│ ────────────────│
│ • seoTitle      │  ──► Max 255 chars (optional)
│ • seoDescription│  ──► Max 500 chars (optional)
└────────┬────────┘
         │
         ▼
    ┌────┴────┐
    │ VALIDATE │
    └────┬────┘
         │
    ┌────┴────┐
    │ Errors? │
    └────┬────┘
    YES/ \NO
   ┌────┘  └────┐
   ▼            ▼
┌──────┐   ┌────────┐
│ FIX  │   │ CREATE │
│ERRORS│   │ EXPERIENCE
└──────┘   └───┬────┘
               │
               ▼
     ┌─────────────────┐
     │ Post-Creation    │
     │ Steps (Optional)│
     └────────┬────────┘
              │
    ┌─────────┼─────────┬────────────┐
    ▼         ▼         ▼            ▼
┌────────┐ ┌───────┐ ┌────────┐ ┌────────┐
│ Add    │ │ Add   │ │ Assign │ │ Create │
│Editions│ │Pricing│ │ Addons │ │ Slots  │
└────────┘ └───────┘ └────────┘ └────────┘
```

### Classification Selection Decision Tree

```
What type of experience is this?
│
├── session ─────► Immersion ─────► Multi-hour intensive
│                     │
                     ▼
              RETREAT ──────► Extended program (days)
              │
              ▼
           STAY ──────► Accommodation-based
           │
           ▼
        PRIVATE ──────► One-on-one or exclusive group
        │
        ▼
     PACKAGE ──────► Bundled experiences combined
```

---

## Checkout Flow Variations

The checkout experience varies significantly based on the experience's `saleMode`.

### saleMode = "direct" (Stripe Checkout)

```
┌─────────────────────────────────────────────────────────────────┐
│                     DIRECT CHECKOUT FLOW                        │
└─────────────────────────────────────────────────────────────────┘

Customer on experience detail page
          │
          ▼
┌─────────────────┐
│ "Book Now" button│
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Select tier     │────►│ Select slot     │ (if requiresSchedule=true)
│ (if pricing     │     │ (shows capacity) │
│  tiers exist)  │     └────────┬────────┘
└────────┬────────┘              │
         │                        ▼
         │              ┌─────────────────┐
         │              │ Select addons   │ (optional)
         │              │ (if available)  │
         │              └────────┬────────┘
         │                        │
         └────────────┬───────────┘
                      ▼
           ┌─────────────────┐
           │ Quantity        │ (if allowQuantity=true)
           │ (min/max enforcement)
           └────────┬────────┘
                    │
                    ▼
           ┌─────────────────┐
           │ Enter guest     │
           │ details         │
           └────────┬────────┘
                    │
                    ▼
           ┌─────────────────┐
           │ Stripe Checkout  │◄─── Payment captured
           │ (redirect)       │
           └────────┬────────┘
                    │
                    ▼
           ┌─────────────────┐
           │ generate-ticket │◄─── Creates ticket(s)
           │ function        │
           └────────┬────────┘
                    │
                    ▼
           ┌─────────────────┐
           │ Confirmation     │
           │ email sent       │
           └─────────────────┘
```

### saleMode = "request" (Booking Request)

```
┌─────────────────────────────────────────────────────────────────┐
│                    REQUEST CHECKOUT FLOW                        │
└─────────────────────────────────────────────────────────────────┘

Customer on experience detail page
          │
          ▼
┌─────────────────┐
│ "Request Booking│
│  button"        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select tier     │ (if pricing tiers exist)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select slot     │ (if requiresSchedule=true)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Enter contact   │
│ info + message  │
└────────┬────────┘
         │
         ▼
    ┌────┴────┐
    │ SUBMIT  │
    └────┬────┘
         │
         ▼
┌─────────────────┐
│ Create booking  │
│ request record  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Admin receives  │
│ notification    │
└────────┬────────┘
         │
         ▼
    ┌────┴────┐
    │ Admin    │
    │ reviews  │
    └────┬────┘
         │
    ┌────┴────┐
    │ APPROVE │   ┌───────┐
    │ & QUOTE  │──►│ Send  │
    │          │   │ quote │
    └────┬────┘   └───────┘
         │
    ┌────┴────┐
    │ DECLINE │
    └─────────┘
```

### saleMode = "assisted" (Admin Wizard)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ASSISTED SALE FLOW                          │
│                    (Admin-initiated)                            │
└─────────────────────────────────────────────────────────────────┘

Admin navigates to Sales → New assisted sale
          │
          ▼
┌─────────────────┐
│ Step 1: Customer│
│ ────────────────│
│ Search existing │
│ or create new   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Step 2: Experience│
│ ─────────────────│
│ Select published │
│ experience       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Step 3: Pricing │
│ ───────────────│
│ Select tier     │
│ (shows pricing) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Step 4: Slot    │
│ ───────────────│
│ Select date/time│
│ (if required)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Step 5: Addons  │
│ ───────────────│
│ Select optional │
│ addons          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Step 6: Quantity│
│ ───────────────│
│ Set participant │
│ count           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Step 7: Review  │
│ ───────────────│
│ Verify all      │
│ details         │
└────────┬────────┘
         │
         ▼
    ┌────┴────┐
    │ Confirm │
    │ Sale    │
    └────┬────┘
         │
    ┌────┴────┐
    │ Create  │
    │ order   │
    └────┬────┘
         │
    ┌────┴────┐
    │ Payment │
    │ method  │
    └────┬────┘
         │
   ┌─────┴─────┐
   ▼           ▼
┌──────┐  ┌────────────┐
│ Mark │  │ Generate   │
│ paid │  │ Stripe link│
│      │  └────────────┘
└──────┘
         │
         ▼
┌─────────────────┐
│ Tickets auto    │
│ generated (if   │
│ applicable)     │
└─────────────────┘
```

### saleMode = "pass" (Pass Redemption)

```
┌─────────────────────────────────────────────────────────────────┐
│                      PASS REDEMPTION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

Customer on experience detail page
          │
          ▼
┌─────────────────┐
│ "Redeem Pass"  │
│ button          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Enter pass code │
│ OR select from  │
│ owned passes    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select tier     │ (if pricing tiers exist)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select slot     │ (if requiresSchedule=true)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ consume-pass    │
│ function        │◄─── Deducts credit from pass
└────────┬────────┘
         │
         ▼
    ┌────┴────┐
    │ Credits │
    │ available?
    └────┬────┘
   NO/   \YES
  ┌────┐   │
  ▼    │   ▼
┌──────┐ │ ┌─────────────────┐
│ Error│ │ │ Generate ticket │
│"Not  │ │ │ (if applicable)│
│ enough│ │ └────────┬────────┘
│ credits"│  │         │
└──────┘ │         ▼
         │ ┌─────────────────┐
         │ │ Confirmation     │
         │ │ email sent       │
         │ └─────────────────┘
         │
         └──────────────────────► END
```

---

## Content Publishing Flow

### Publication Creation Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                 PUBLICATION CREATION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

Navigate to Content → Publications → New publication
          │
          ▼
┌─────────────────┐
│ 1. IDENTITY     │
│ ─────────────── │
│ • title (EN)    │
│ • title (ES)    │
│ • slug          │  ──► Must be unique across experiences too
│ • category      │  ──► landing, blog, highlight, institutional, faq
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. SUBTITLE     │
│ & EXCERPT       │
│ ────────────────│
│ • subtitle (EN) │
│ • subtitle (ES) │
│ • excerpt (EN)  │  ──► Short summary for listings (max 500)
│ • excerpt (ES)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. LINKED       │
│ EXPERIENCE      │
│ ────────────────│
│ • experienceId  │  ──► Optional: connects to booking
│                  │       Shows "Book Now" CTA if linked
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. COVER IMAGE  │
│ ────────────────│
│ • coverImageId  │  ──► Used for OG/social sharing
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. PUBLICATION  │
│ ────────────────│
│ • status        │  ──► draft (default)
│ • publishDate   │  ──► Optional, auto-assigned if empty
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 6. SEO          │
│ ────────────────│
│ • seoTitle      │
│ • seoDescription│
│ • ogImage       │  ──► Social sharing image
└────────┬────────┘
         │
         ▼
    ┌────┴────┐
    │ CREATE  │
    │ PUBLICATION
    └────┬────┘
         │
         ▼
┌─────────────────┐
│ Add Sections     │
│ (Content blocks) │
└────────┬────────┘
         │
         ▼
    ┌────┴────┐
    │ Publish │
    │ when    │
    │ ready   │
    └────┬────┘
         │
         ▼
   publishedAt
   auto-set
```

### Section Types and Usage

```
SECTION TYPE        PURPOSE                    CONTENT FIELDS
─────────────       ─────────────────────────  ─────────────────────
┌─────────────┐
│    hero     │   Full-width banner          title, mediaIds
└─────────────┘
┌─────────────┐
│    text     │   Rich text content           title, content (markdown)
└─────────────┘
┌─────────────┐
│   gallery   │   Image gallery               title, mediaIds
└─────────────┘
┌─────────────┐
│  highlights │   Featured items list        title, metadata (JSON)
└─────────────┘
┌─────────────┐
│     faq     │   Q&A pairs                   title, content
└─────────────┘
┌─────────────┐
│  itinerary  │   Schedule/timeline          title, content, metadata
└─────────────┘
┌─────────────┐
│ testimonials│   Customer quotes             title, content, mediaIds
└─────────────┘
┌─────────────┐
│  inclusions │   What's included list      title, content
└─────────────┘
┌─────────────┐
│ restrictions│   What's not included        title, content
└─────────────┘
┌─────────────┐
│     cta     │   Call to action button       title, metadata (link)
└─────────────┘
┌─────────────┐
│    video    │   Video embed                 title, mediaIds (URL)
└─────────────┘
```

### When to Link Experience to Publication

```
Should I link this publication to an experience?
│
├── Is this a marketing landing page for a specific experience?
│         │
│         ├── YES → Link it. Shows "Book Now" button with pricing.
│         │
│         └── NO
│               │
│               ▼
├── Is this an informational article that mentions experiences?
│         │
│         ├── YES → Optional. May link for contextual booking.
│         │
│         └── NO
│               │
│               ▼
├── Is this a blog post?
│         │
│         ├── YES → Optional. Link if there's a clear booking path.
│         │
│         └── NO
│               │
│               ▼
├── Is this an institutional page (About, Contact, Terms)?
│         │
│         └── YES → Do NOT link. No purchase path.
│
└── Is this an FAQ?
          │
          └── YES → Do NOT link. No purchase path.
```

---

## Order Status Flow

### Order Lifecycle Diagram

```
                                     ┌─────────────────────────────────────┐
                                     │                                     │
                                     ▼                                     │
┌─────────┐    payment succeeded    ┌─────┐    fulfillment triggered     ┌───────────┐    all consumed    ┌───────────┐
│ PENDING │ ──────────────────────► │ PAID │ ───────────────────────────► │ CONFIRMED │ ──────────────────► │ COMPLETED │
└─────────┘                         └─────┘                              └───────────┘                     └───────────┘
     │                                     │                                     │
     │ cancel                              │ cancel                              │
     ▼                                     ▼                                     ▼
┌───────────┐                         ┌───────────┐                         ┌───────────┐
│ CANCELLED │ ◄────────────────────── │ CANCELLED │                         │ CANCELLED │
└───────────┘                         └───────────┘                         └───────────┘
     │                                     │                                     │
     │ refund (if paid)                    │ refund (if paid)                    │
     ▼                                     ▼                                     │
┌──────────┐                         ┌──────────┐                              │
│ REFUNDED │                         │ REFUNDED │ ──────────────────────────────┘
└──────────┘                         └──────────┘
```

### Order Status Transitions

| Current Status | Action | New Status | Side Effects |
|---------------|--------|------------|--------------|
| `pending` | Payment confirmed | `paid` | Stripe webhook updates paymentStatus |
| `pending` | Admin cancels | `cancelled` | — |
| `paid` | Admin cancels | `cancelled` | May trigger refund |
| `paid` | Fulfillment triggered | `confirmed` | Tickets generated, pass activated |
| `confirmed` | Admin cancels | `cancelled` | Refunds if applicable |
| `confirmed` | All consumed | `completed` | — |
| `cancelled` | Refund issued | `refunded` | — |
| `completed` | Refund issued | `refunded` | Outside order flow |

### Payment Status vs Order Status Matrix

**Valid Combinations:**

| Order Status | Valid Payment Statuses | Notes |
|--------------|----------------------|-------|
| `pending` | `pending`, `processing`, `failed` | Payment not yet confirmed |
| `paid` | `succeeded` | Payment captured |
| `confirmed` | `succeeded` | Payment complete, fulfilling |
| `completed` | `succeeded` | Fully consumed |
| `cancelled` | `succeeded`, `refunded` | May have payment to refund |
| `refunded` | `refunded` | Payment returned |

**Invalid Combinations (Should Never Occur):**

| Invalid Combination | Reason |
|---------------------|--------|
| `orderStatus="pending"` + `paymentStatus="succeeded"` | Payment succeeded should move order to "paid" |
| `orderStatus="paid"` + `paymentStatus="pending"` | Order should not be "paid" without successful payment |
| `orderStatus="cancelled"` + `paymentStatus="processing"` | Cannot cancel while payment still processing |

### Admin Actions per Status

```
Current Status: PENDING
├── "Cancel" button visible
│   └── Effect: orderStatus → cancelled
│
└── (auto) Payment confirmed
    └── Effect: orderStatus → paid, paymentStatus → succeeded

Current Status: PAID
├── "Cancel" button visible
│   └── Effect: orderStatus → cancelled, may trigger refund
│
└── (auto) Fulfillment triggered
    └── Effect: orderStatus → confirmed

Current Status: CONFIRMED
├── (auto) All consumed
│   └── Effect: orderStatus → completed
│
└── "Cancel" button visible (admin override)
    └── Effect: orderStatus → cancelled, refunds if applicable

Current Status: COMPLETED
└── "Issue Refund" button visible (outside order flow)
    └── Effect: paymentStatus → refunded

Current Status: CANCELLED
└── "Issue Refund" button visible
    └── Effect: paymentStatus → refunded

Current Status: REFUNDED
└── No actions available (terminal state)
```

---

## Experience Publishing Flow

```
Is the experience ready to go live?
│
├── Are all required fields filled?
│   ├── name ──► Required
│   ├── publicName ──► Required
│   ├── slug ──► Required, unique
│   ├── type ──► Required
│   ├── saleMode ──► Required
│   └── fulfillmentType ──► Required
│
└── YES ──► Continue
    │
    ▼
├── Does experience have at least one pricing tier?
│   └── NO ──► Add pricing tier before publishing
│
└── YES ──► Continue
    │
    ▼
    ┌─────────┐
    │ Publish │
    └────┬────┘
         │
         ▼
┌─────────────────┐
│ status →        │
│ published       │
└────────┬────────┘
         │
         ▼
    ┌────┴────┐
    │ Visible │
    │ in catalog │
    └────┬────┘
         │
    ┌────┴────┐
    │ Bookable? │
    └────┬────┘
         │
    YES/ \NO
   ┌────┘  └────┐
   │           │
   ▼           ▼
 Available   No pricing
 for         tiers or
 booking     no slots
             (if required)
```

---

## Slot Creation Flow

```
Navigate to Experience → Slots tab
          │
          ▼
┌─────────────────┐
│ Create Slot      │
│ ─────────────── │
│ • slotType       │  ──► single, multi-day, retreat-day, private
│ • edition        │  ──► Optional link to edition
│ • startDate/time │
│ • endDate/time   │
│ • timezone       │
│ • capacity       │  ──► Must be > 0
│ • location       │
│ • room           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Assign Resources │
│ (Optional)       │
│ ─────────────── │
│ • instructor    │
│ • equipment      │
│ • facilitator    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Set Status       │
│ ─────────────── │
│ • status         │  ──► open, closed, full, cancelled
│ • internalNotes   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Slot Available   │
│ for Booking      │
└─────────────────┘
```

---

## Related Pages

- [Experiences](../catalog/experiences.md) - Complete field documentation
- [Orders](../sales/orders.md) - Order management
- [Publications](../content/publications.md) - Editorial content
- [Slots & Agenda](../operations/slots.md) - Slot management
- [Known Limitations](./known-limitations.md) - Intentional constraints and edge cases