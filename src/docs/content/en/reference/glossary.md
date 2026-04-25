---
title: Glossary
description: Key terms and definitions
section: reference
order: 1
lastUpdated: 2026-04-25
---

# Glossary

This glossary defines the key terms and concepts used throughout the OMZONE platform.

## A

### Addon

Optional extras that enhance a booking. Addons can be required (automatically included), default (pre-selected but removable), or optional (available to add).

| Type | Behavior |
|------|----------|
| `service` | Spa treatments, therapy sessions |
| `transport` | Airport transfers, transportation |
| `food` | Meals, catering |
| `accommodation` | Hotel nights, lodging |
| `equipment` | Rental gear, materials |
| `other` | Miscellaneous extras |

### Agenda

The operational layer containing slots, resources, and locations that define when and where experiences are available.

### Assisted Sale

Admin-created order on behalf of a customer. Used for phone bookings, in-person sales, complimentary reservations, and corporate bookings.

## B

### Booking Request

Inquiry for experiences with `saleMode: request` that require admin review and approval before confirmation. Customers submit requests which operators review, quote pricing, and approve or reject.

| Status | Description |
|--------|-------------|
| `pending` | Awaiting review |
| `reviewing` | Under admin review |
| `approved` | Approved with quoted price |
| `rejected` | Declined by admin |
| `converted` | Converted to assisted sale order |

## C

### Client

Customer account with portal access. Clients can view orders, download tickets, manage passes, and update their profile.

### Collection

Appwrite database table. Collections contain documents with typed attributes.

### Content

The editorial layer containing publications and sections. Publications provide the public-facing narrative and SEO content separate from commercial operations.

## D

### Domain Separation

OMZONE architectural principle separating concerns:

| Layer | Contents | Purpose |
|-------|----------|---------|
| Editorial | Publications, Sections, Tags | SEO, marketing narrative |
| Commercial | Experiences, Editions, Pricing Tiers, Addons, Packages | Pricing, operations |
| Agenda | Slots, Resources, Locations | Scheduling, capacity |
| Transactional | Orders, Tickets, Pass Consumptions | Immutable purchase records |
| User | User Profiles, Activity Logs | Accounts, audit |

## E

### Edition

Time-based variation of an Experience with its own date range, capacity, and pricing. Editions allow the same experience to run multiple times (e.g., "Spring 2026", "Summer 2026").

| Field | Description |
|-------|-------------|
| Name | Edition identifier |
| Start Date | Edition beginning |
| End Date | Edition end |
| Registration Start | When registration opens |
| Registration End | When registration closes |
| Capacity | Max attendees |
| Status | `draft`, `open`, `closed`, `completed`, `cancelled` |

### Experience

Core offering available for booking. The commercial unit with pricing, availability, and fulfillment rules.

| Type | Description |
|------|-------------|
| `session` | Single session (e.g., yoga class) |
| `immersion` | Extended session (e.g., sound bath) |
| `retreat` | Multi-day program |
| `stay` | Accommodation-based experience |
| `private` | Private booking |
| `package` | Bundled experiences |

### Experience Tabs

| Tab | Description |
|-----|-------------|
| Details | Core fields, classification, images |
| Pricing Tiers | Price points and edition pricing |
| Slots | Availability scheduling |
| Addons | Addon assignments |
| Publications | Linked publications |
| SEO | Search engine settings |

## F

### Fulfillment Type

Defines how the booking is delivered.

| Type | Description |
|------|-------------|
| `ticket` | Generates QR code tickets for check-in |
| `booking` | Confirmed reservation without tickets |
| `pass` | Activates pass credits |
| `package` | Bundled fulfillment tracking |

## G

### Ghost User

Root-level Appwrite users that should be excluded from listings. The `root` label identifies ghost users.

## L

### Label

Appwrite permission label attached to users for role-based access control.

| Label | Access |
|-------|--------|
| `root` | Full system (invisible) |
| `admin` | Admin panel access |
| `operator` | Limited admin access |
| `client` | Client portal access |

## O

### Order

Customer purchase containing one or more line items. Orders store frozen snapshots of pricing and experience data for historical accuracy.

| Status | Description |
|--------|-------------|
| `pending` | Awaiting payment |
| `paid` | Payment confirmed |
| `confirmed` | Fulfillment started |
| `completed` | All items consumed |
| `cancelled` | Order cancelled |
| `refunded` | Payment refunded |

### Order Line Item

Single item in an order with frozen snapshot data:

| Field | Description |
|-------|-------------|
| Item Type | `experience`, `package`, `pass`, `addon` |
| Item ID | Reference to purchased item |
| Snapshot | Frozen data at purchase time |
| Quantity | Units purchased |
| Unit Price | Price at purchase time |
| Subtotal | Line total |

## P

### Package

Bundle of experiences and/or addons sold at a discounted combined price. Packages group multiple items together.

| Item Type | Description |
|-----------|-------------|
| `experience` | Included experience slot |
| `addon` | Included addon |
| `benefit` | Included benefit or service |
| `accommodation` | Lodging inclusion |
| `meal` | Meal inclusion |

### Pass

Subscription allowing multiple bookings within a validity period. Passes have credits that are consumed when used.

| Status | Description |
|--------|-------------|
| `active` | Valid and usable |
| `exhausted` | All credits consumed |
| `expired` | Past validity period |
| `cancelled` | Manually cancelled |

### Pass Consumption

Record of pass credit usage when a booking uses pass credits.

| Field | Description |
|-------|-------------|
| User Pass ID | Parent pass reference |
| Order ID | Associated order |
| Credits Consumed | Number of credits used |
| Role | Usage context |

### Pricing Tier

Price point for an Experience. Tiers can be edition-specific and support multiple price types.

| Price Type | Description |
|------------|-------------|
| `fixed` | Flat rate regardless of attendees |
| `perPerson` | Rate multiplied by number of people |
| `perGroup` | Rate for entire group |
| `from` | Starting price for variable pricing |
| `quote` | Custom price entered by operator |

### Publication

Editorial/SEO content layer for the public website. Publications exist separately from Experiences and provide the narrative, images, and SEO content.

| Category | Use Case |
|----------|----------|
| `landing` | Primary landing pages |
| `blog` | Editorial articles |
| `highlight` | Featured content |
| `institutional` | About, policies |
| `faq` | FAQ pages |

## R

### Resource

Person or equipment assigned to slots for availability and capacity management.

| Type | Description |
|------|-------------|
| `instructor` | Lead teacher/facilitator |
| `facilitator` | Support facilitator |
| `therapist` | Therapy provider |
| `equipment` | Equipment resource |

### Resource Assignment Role

Role of an assigned resource within a slot:

| Role | Description |
|------|-------------|
| `lead` | Primary assigned person |
| `assistant` | Support person |
| `support` | Additional support |
| `equipment` | Equipment provision |

### Role

Label-based permission determining access level. See Label.

## S

### Sale Mode

How customers purchase the experience.

| Mode | Description |
|------|-------------|
| `direct` | Immediate purchase |
| `request` | Requires booking request approval |
| `assisted` | Admin-assisted phone/in-person sale |
| `pass` | Requires active pass |

### Section

Modular content block within a Publication.

| Type | Description |
|------|-------------|
| `hero` | Full-width header |
| `text` | Rich text content |
| `gallery` | Image grid |
| `highlights` | Featured experiences |
| `faq` | Accordion Q&A |
| `itinerary` | Day-by-day schedule |
| `testimonials` | Customer quotes |
| `inclusions` | Included items list |
| `restrictions` | Exclusions list |
| `cta` | Call-to-action |
| `video` | Embedded video |

### Slot

Specific date/time instance when an Experience is available for booking.

| Type | Description |
|------|-------------|
| `singleSession` | One-time session |
| `multiDay` | Multiple consecutive days |
| `retreatDay` | Day within a retreat |
| `private` | Private booking |

| Status | Description |
|--------|-------------|
| `draft` | Not yet published |
| `published` | Available for booking |
| `full` | At capacity |
| `cancelled` | Cancelled |

### Snapshot

JSON copy of price/experience data stored at purchase time. Snapshots ensure historical accuracy regardless of future changes.

### System Information

Platform status and version data displayed in admin for monitoring.

## T

### Ticket

Booking confirmation with QR code for check-in validation. Tickets are generated for experiences with `fulfillmentType: ticket`.

| Status | Description |
|--------|-------------|
| `pending` | Awaiting confirmation |
| `confirmed` | Valid and ready |
| `used` | Checked in |
| `cancelled` | Ticket cancelled |
| `expired` | Past slot date |

### Ticket Validation

Process of verifying ticket authenticity and eligibility for check-in. Validates:
- Ticket exists and is valid
- Status is `confirmed`
- Order payment is `paid` or `confirmed`
- Slot date/time matches
- Not already checked in

## U

### User Pass

Pass purchased and activated by a client. Links the pass definition to the purchasing user.

### User Profile

Extended profile data for Appwrite users including name, phone, preferences, and internal notes.
