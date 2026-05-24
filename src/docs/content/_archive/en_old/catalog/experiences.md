---
title: Experiences
description: How to create and configure a complete wellness experience in OMZONE
section: catalog
order: 1
lastUpdated: 2026-05-16
---

# Experiences

An **experience** is the main product your platform offers: a yoga class, a weekend retreat, a spa stay, or any wellness journey you want to sell or book. Everything a client sees and purchases starts here.

Each experience is configured through **5 tabs**: Info, Editions, Pricing, Addons, and Slots. Each one covers a different part of the experience, and it's important to complete all of them before publishing.

> **Before publishing** you need at least: the Info tab fully completed, at least one active pricing tier, and if the experience requires a date, at least one available slot.

---

## Tab: Info

This is the main profile of the experience. Here you define its name, how it looks, what kind of sale it is, and how it appears to clients.

### Name and URL

**Internal name**
This is only for you and your team. Clients never see it. Useful for telling apart multiple versions of the same experience.

> Example: `Morning Yoga V2 - High Season`

**Public name (EN) / Public name (ES)**
This is what clients see. Make it attractive and descriptive.

> Example EN: `Morning Flow Yoga` / ES: `Yoga de la Mañana`

**Slug (URL)**
The web address for this experience. It's generated automatically from the name, but you can edit it. Use only lowercase letters, numbers, and hyphens.

> Example: `morning-flow-yoga` → the URL would be `/experiences/morning-flow-yoga`

---

### Type and sale mode

**Type**
Classifies what kind of experience this is. This affects how it's organized on the platform.

| Type      | When to use it                               |
| --------- | -------------------------------------------- |
| Session   | A class or activity lasting a few hours      |
| Immersion | An intense full-day experience               |
| Retreat   | A multi-day program                          |
| Stay      | Lodging + integrated activities              |
| Private   | An exclusive experience for a specific group |

**Sale mode**
Defines how clients can purchase this experience.

| Mode       | What it means                                                      |
| ---------- | ------------------------------------------------------------------ |
| Direct     | Client pays online instantly by card                               |
| On request | Client submits a request and you confirm it (no automatic payment) |
| Assisted   | Can only be sold from the admin panel                              |
| By pass    | Only accessible to clients who have an active pass                 |

> **Recommendation:** Use "Direct" for sessions or activities with a fixed price. Use "On request" for retreats or private experiences where you need to coordinate before confirming.

**Fulfillment type**
What the client receives after confirming their purchase.

| Fulfillment | What the client receives                              |
| ----------- | ----------------------------------------------------- |
| Ticket      | A digital ticket with a QR code to present on the day |
| Booking     | A booking confirmation (no physical ticket)           |

---

### Description

**Short description (EN) / Short description (ES)**
A brief 2–3 line summary. Appears in listings, cards, and previews. Maximum 500 characters.

> Example: `60-minute vinyasa yoga class at sunrise with ocean views. All levels welcome. Mat and water included.`

**Long description (EN) / Long description (ES)**
The full description clients will see when they open the experience. Share all the details: what's included, what to expect, who leads it, what to bring. Maximum 5,000 characters.

---

### Cover image and gallery

**Cover image**
The main photo representing the experience. It's the first image clients will see. Use a high-quality, horizontal image that captures the essence of the experience.

**Gallery**
Additional photos of the experience. You can upload multiple images that will appear on the experience's page.

---

### Booking behavior

**Requires date/slot selection**
If enabled, clients must choose an available time slot when booking. If disabled, they can purchase without selecting a date.

> Enable for: sessions with a fixed schedule, retreats with specific dates.
> Disable for: on-demand experiences or gift items with no fixed date.

**Requires specific date**
Enable this if the experience has a single fixed date (for example, a particular weekend retreat).

**Generates tickets after purchase**
If enabled, a digital ticket is automatically generated for the client once the purchase is confirmed.

**Allows multiple attendees**
Enable this if a client can purchase for more than one person in the same order.

**Minimum attendees / Maximum attendees**
If you allow multiple attendees, define how many can attend per order, minimum and maximum.

> Example: Minimum 2, Maximum 8 for a small group experience.

---

### Publication and visibility

**Status**

- **Draft**: The experience exists but is not visible or bookable by clients. Use this while you're setting it up.
- **Published**: The experience is visible to clients and can be booked (as long as it has an active price and available slot).

**Display order**
A number that determines where this experience appears in listings. Lower number = appears first.

> Example: If you want "Morning Yoga" to appear before "Evening Meditation", give Morning Yoga a lower number.

---

### SEO (Google ranking)

**SEO Title**
The title that will appear in Google search results. If left empty, the public name is used. Keep it under 60 characters.

> Example: `Yoga Class in Puerto Vallarta | OMZONE Wellness`

**SEO Description**
The descriptive text that appears below the title in Google. It should summarize the experience in 1–2 sentences and mention the location. Maximum 160 characters.

> Example: `Sunrise vinyasa yoga session in Puerto Vallarta. All levels welcome. Book online.`

---

## Tab: Editions

An **edition** represents a specific version or season of the experience. It's useful for organizing experiences that repeat on different dates — like a retreat you run in March and another in June. Each one is a separate edition of the same experience.

> **When do I need to create an edition?**
>
> - For retreats or experiences with defined start and end dates.
> - When you want to offer the same experience in different seasons, each with its own prices or capacity.
> - For programs that have an early registration period.
>
> If your experience is a class that runs every Tuesday, you probably don't need editions — just use the Slots tab directly.

### Fields for an edition

**Name / Name (ES)**
How you identify this edition. Clients can see it.

> Example: `Spring Retreat 2026` / `Retiro de Primavera 2026`

**Description (EN) / Description (ES)**
Specific details about this edition: program dates, included activities, what's new compared to previous editions.

**Start date / End date**
The date range this edition covers.

> Example: Start: March 14, 2026 — End: March 17, 2026

**Registration open / Registration close**
The dates when registration opens and closes. Registration must close before the experience begins.

> Example: Registration opens January 1, closes March 10.

**Maximum capacity**
How many people can enroll in this edition in total.

**Status**

- **Draft**: In preparation, not visible to clients.
- **Open**: Accepting bookings or requests.
- **Closed**: Registration closed, but may still be shown.
- **Completed**: The edition has already taken place.
- **Cancelled**: The edition was cancelled.

---

## Tab: Pricing

Here you define how much the experience costs. You can have **multiple pricing tiers** for the same experience — for example, a standard price, an early bird price, and a VIP price.

Each tier is an option the client will see when purchasing and can choose what works best for them.

### Fields for a pricing tier

**Name / Name (ES)**
How this price appears to clients.

> Example: `Standard Price` / `Early Bird` / `VIP All-Inclusive`

**Description (EN) / Description (ES)**
What's included or what makes it different from the other tiers.

> Example: `Includes access to all sessions, materials, and meals.`

**Price type**
How the price is calculated.

| Type       | How it works                                                    |
| ---------- | --------------------------------------------------------------- |
| Fixed      | One price, regardless of how many people                        |
| Per person | Multiplied by the number of attendees                           |
| Per group  | A flat price for the whole group, regardless of size            |
| From       | A minimum reference price; the actual price is defined at quote |
| Quote      | No fixed price — the price is agreed directly with the client   |

**Base price**
The amount in numbers. If the type is "Per person", this is the price per attendee.

> Example: $85 USD

**Currency**
MXN (Mexican pesos) or USD (US dollars).

**Minimum persons / Maximum persons**
Optionally limit this pricing tier to groups of a certain size.

> Example: The "Per group" price only applies for groups of 4 to 10 people.

**Badge**
A short label that appears visually on the price to highlight it.

> Example: `Most popular` / `Today only!` / `Early Bird`

**Highlighted**
Enable this to make this pricing tier appear visually emphasized among the available options.

**Active**
Only active pricing tiers are shown to clients. You can deactivate a tier temporarily without deleting it.

**Display order**
What position this tier appears at among the other pricing options.

**Edition**
If this experience has editions, you can link this price to a specific edition. That way, the "Spring Early Bird" price only applies to the spring edition and not the others.

---

## Tab: Addons

**Addons** are additional products or services that clients can add when purchasing the experience. They appear during checkout as optional (or required) extras.

> **Examples of addons:**
>
> - Round-trip transportation
> - Private room upgrade
> - Session photography
> - Welcome kit
> - Extra 30-minute massage

> **Important:** Addons are created first in the "Addons" section of the catalog. From this tab you only assign them to the experience — you cannot create a new addon here.

### Fields for an addon assignment

**Addon**
Select from the catalog which addon you want to offer with this experience.

**Is required**
If enabled, clients cannot complete the purchase without including this addon. Use it for things that are always included but need to be tracked or charged separately.

**Is default**
If enabled, the addon appears pre-selected when the client reaches the extras step (though they can remove it if it's not required).

**Custom price**
If you want this addon to have a different price than its standard catalog price, enter it here. If left empty, the original catalog price is used.

> Example: The "Photography" addon normally costs $50, but for this retreat you want to offer it at $35.

**Display order**
What position this addon appears at in the list of available extras during checkout.

---

## Tab: Slots

**Slots** are the specific time windows when the experience can be booked. Each slot has its own date, time, and number of available spots.

> **Example:** The "Morning Yoga" experience might have a slot every Tuesday and Thursday at 7am. Each of those slots is independent — it has its own available spots, and when it fills up, that specific slot is no longer available, but the others still are.

### Fields for a slot

**Start datetime / End datetime**
When this session or occurrence begins and ends.

> Example: Tuesday, May 20, 2026, 7:00 AM — 8:00 AM

**Timezone**
What timezone those times are in. The default is Central Mexico time. Change it if the experience takes place in a different city or country.

**Slot type**

| Type           | When to use it                               |
| -------------- | -------------------------------------------- |
| Single session | A short class or activity (hours)            |
| Multi-day      | A span covering several consecutive days     |
| Retreat day    | A specific day within a longer retreat       |
| Private        | A session reserved exclusively for one group |

**Edition**
If the experience has editions, you can link this slot to a specific edition so the system connects them correctly.

**Capacity**
How many people can book this slot. Once that number is reached, the slot closes automatically for new bookings.

> Example: Capacity 12. Once there are 12 confirmed reservations, this slot no longer appears available.

**Location / Room or space**
Where this session takes place. First choose the location (physical venue) and then the specific room or space within it.

**Status**

- **Draft**: Exists in the system but clients cannot see or book it.
- **Published**: Visible and available for clients to book.

**Internal notes**
Text only visible to you and your team. Add special instructions, reminders, or logistics details.

> Example: `Remember to bring the projector. Instructor arrives 30 min early to set up.`

---

## Checklist before publishing

Before changing an experience's status to **Published** and opening it to clients, verify:

- [ ] Public name and short description completed (in both languages if applicable)
- [ ] Cover image uploaded
- [ ] Type, Sale mode, and Fulfillment type correctly configured
- [ ] At least one active pricing tier created
- [ ] If the experience requires a slot: at least one future slot in **Published** status with available spots
- [ ] If using editions: pricing tier and slot are linked to the same edition
- [ ] Addons assigned if applicable (required and optional)

---

## Common use cases

### Weekly recurring class

A yoga class that repeats every Tuesday and Thursday at 7am:

1. Create the experience → Type: **Session**, Sale mode: **Direct**, Fulfillment: **Ticket**
2. Enable **Requires date/slot selection** and **Generates tickets after purchase**
3. In **Pricing**: create a "Single class" tier at $20 USD per person
4. In **Slots**: add a slot for each Tuesday and Thursday, with capacity of 15 per slot
5. Change status to **Published**

### Multi-day retreat with early bird pricing

A 4-day retreat you offer twice a year, with a special price for early sign-ups:

1. Create the experience → Type: **Retreat**, Sale mode: **Direct** or **On request**
2. In **Editions**: create "May Retreat 2026" with dates May 14–17 and registration closing May 10
3. In **Pricing**: create "Early Bird" ($280 USD) and "Regular Price" ($350 USD), both linked to that edition
4. In **Slots**: create a Multi-day slot for May 14–17, linked to the same edition
5. In **Addons**: add "Private room" and "Transportation" as optional extras
6. Change status to **Published**

### Private experience with custom quote

A private meditation session for groups where the price depends on group size:

1. Create the experience → Type: **Private**, Sale mode: **On request**
2. In **Pricing**: create a tier with Price type: **Quote**
3. No fixed slots needed — the schedule is coordinated with the client when confirming the request
4. Change status to **Published** so it appears in the catalog and clients can submit requests

---

## Related pages

- [Editions](./editions.md)
- [Pricing Tiers](./pricing-tiers.md)
- [Addons](./addons.md)
- [Slots & Agenda](../operations/slots.md)
- [Booking Requests](../operations/booking-requests.md)
- [System Flows](../reference/flows.md)
