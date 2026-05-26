---
title: Agenda & schedules
description: How to create and manage session schedules in the OMZONE admin panel
section: admin
order: 7
lastUpdated: 2026-05-25
---

# Agenda & schedules

The **Agenda** is your master calendar. Every session, retreat, and event lives here — with its date, time, location, capacity, and assigned resources.

---

## The global agenda view

Go to **Agenda** in the sidebar to see all scheduled sessions across all experiences. You can filter by:

- Date range
- Experience
- Location
- Status (`draft`, `published`, `full`, `cancelled`)

This is your day-to-day operational view.

---

## Creating a schedule

1. Go to **Agenda** and click **New schedule**, or open a specific experience and add a schedule from within it.
2. Fill in the details:
   - **Experience** — Which experience this session belongs to.
   - **Slot type** — `single_session` (a standalone, time-limited event) or `private` (a privately requested session).
   - **Date and time** — When it starts (and ends, if applicable).
   - **Capacity** — Maximum number of attendees.
   - **Location** — Where it takes place.
   - **Resources** — Instructor(s) and any equipment needed.
3. Set the status to **Published** to make it bookable.
4. Save.

---

## Schedule status

| Status      | What it means                                              |
| ----------- | ---------------------------------------------------------- |
| `draft`     | Not yet visible to clients — use while setting up          |
| `published` | Live and bookable by clients                               |
| `full`      | Capacity reached — no more bookings accepted               |
| `cancelled` | Session cancelled — all associated tickets are invalidated |

The system automatically transitions a session to **`full`** when all spots are taken. You don't need to do this manually.

> Only **`single_session`** and **`private`** slot types are available in the UI. Other slot types exist in the database for internal use but are not exposed to admin users.

---

## Editing a schedule

You can edit a schedule at any time — update the time, increase capacity, change the location. If the session already has bookings, clients with tickets won't be notified automatically; you'll need to do that separately if needed.

---

## Recurring sessions

If you run the same session every week (e.g., Monday yoga at 9 AM), you'll need to create each instance separately. Consider creating them in bulk for the month ahead so clients can plan and book in advance.

---

## Viewing attendees

Click any schedule entry to open it. Inside you'll find the full attendee list — everyone who has a ticket for that session.

---

## Cancelling a session

See _Use case: Handling a cancellation_ for the full step-by-step guide to cancelling a session and notifying attendees.
