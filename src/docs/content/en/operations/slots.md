---
title: Slots & Agenda
description: Create and manage availability slots for scheduled experiences, including recurring patterns and resource assignments
section: operations
order: 1
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/agenda
  - /admin/experiences/:id/slots
  - /admin/experiences/:id/slots/new
  - /admin/experiences/:id/slots/:slotId/edit
  - /admin/experiences/:id/slots/quick-create
relatedCollections:
  - slots
  - slot_resources
  - resources
  - locations
  - rooms
keywords:
  - slot
  - agenda
  - schedule
  - availability
  - calendar
  - booking
---

# Slots & Agenda

Slots represent specific date/time instances when an experience is available for booking. Slots are the availability layer that connects experiences to the calendar.

## Understanding Slots

A slot contains:
- Which experience it belongs to (required)
- Which edition it belongs to (optional)
- Date/time range with timezone
- Capacity (maximum participants)
- Location and room assignments
- Resource assignments (instructors, equipment)
- Status

## Accessing Slots

### Experience-Level Slots

Navigate to **Catalog -> Experiences -> [Experience Name] -> Slots**

Use this for creating slots for a specific experience.

### Global Agenda

Navigate to **Operations -> Agenda**

View all slots across all experiences in a unified calendar. Use the global agenda to:
- See all scheduled sessions at a glance
- Identify scheduling conflicts
- Plan resource allocation

## Creating a Single Slot

Navigate to **Catalog -> Experiences -> [Experience Name] -> Slots -> New slot**

### Basic Information Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slotType` | enum | Yes | `single_session`, `multi_day`, `retreat_day`, `private` |
| `edition` | reference | No | Link to a specific edition |

**Slot Types:**

| Type | Use Case |
|------|----------|
| `single_session` | One-time session with start and end datetime |
| `multi_day` | Spans multiple days with start and end datetime |
| `retreat_day` | Single day within a multi-day retreat |
| `private` | Private session with specific participants |

### Date and Time Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `startDatetime` | datetime | Yes | Start date and time |
| `endDatetime` | datetime | Yes | End date and time |
| `timezone` | string | Yes | Timezone (e.g., America/Mexico_City) |

**Available Timezones:**
- Mexico City (CST) - `America/Mexico_City`
- Cancun (EST) - `America/Cancun`
- Tijuana (PST) - `America/Tijuana`

### Location Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `locationId` | reference | No | Physical location |
| `roomId` | reference | No | Room or space within the location |

Locations and rooms are created in **Operations -> Resources -> Locations** and **Rooms** tabs.

### Capacity Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `capacity` | integer | Yes | Maximum participants (must be greater than 0) |

### Status and Notes Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | enum | Yes | `draft`, `published`, `full`, `cancelled` |
| `notes` | text | No | Internal notes (not visible to customers) |

**Slot Status Values:**

| Status | Meaning |
|--------|---------|
| `draft` | Not yet published, not visible to customers |
| `published` | Available for booking |
| `full` | Capacity reached, no more bookings |
| `cancelled` | No longer available |

## Creating Recurring Slots (Quick Create)

For regular recurring slots (e.g., "Every Monday at 9am"), use Quick Create:

Navigate to **Catalog -> Experiences -> [Experience Name] -> Slots -> Quick Create**

### Step 1: Define the Pattern

Select days of the week:
- Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday

Select at least one day.

### Step 2: Define Date Range

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `startDate` | date | Yes | First occurrence |
| `endDate` | date | Yes | Last occurrence |
| `startTime` | time | Yes | Session start time |
| `endTime` | time | Yes | Session end time |
| `timezone` | string | Yes | Timezone |

### Step 3: Define Logistics

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `capacity` | integer | Yes | Max participants per slot |
| `locationId` | reference | No | Location for all slots |
| `roomId` | reference | No | Room for all slots |
| `slotType` | enum | Yes | Type for all slots |

The Quick Create will generate slots for each matching day within the date range.

## Assigning Resources to Slots

Resources (instructors, facilitators, therapists, equipment) can be assigned to slots:

Navigate to **Catalog -> Experiences -> [Experience Name] -> Slots -> [Slot Name] -> Resources**

### Assignment Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resourceId` | reference | Yes | The resource to assign |
| `role` | enum | Yes | `lead`, `assistant`, `support`, `equipment` |

**Resource Roles:**

| Role | Description |
|------|-------------|
| `lead` | Primary instructor or facilitator |
| `assistant` | Supporting teacher or helper |
| `support` | Technical or logistical support |
| `equipment` | Equipment being used |

### Resource Assignment Workflow

1. Open a slot
2. Go to Resources tab
3. Click "Assign resource"
4. Search for and select a resource
5. Choose the role
6. Add optional notes
7. Confirm assignment

## Slot Status Lifecycle

```
draft -> published -> full | cancelled
```

### Publishing a Slot

Set status to `published` to make the slot visible and bookable.

### Cancelling a Slot with Active Bookings

If a slot has existing bookings and needs to be cancelled:
1. A warning shows the count of active bookings
2. Confirm the cancellation
3. Customers with existing bookings should be notified manually

### Full Slots

When `bookedCount` equals `capacity`, the slot status can be manually set to `full` or may auto-update based on configuration.

## Common Mistakes

**Creating slots without checking edition dates.**
If the slot is linked to an edition, ensure the slot datetime falls within the edition's start and end dates.

**Not setting capacity.**
The capacity must be greater than 0. Consider the physical constraints of the room and the experience requirements.

**Forgetting to publish slots.**
Slots default to `draft` status. Draft slots are not visible to customers. Remember to publish slots when ready.

**Setting endDatetime before startDatetime.**
The end time must be after the start time. The form will show an error.

**Not assigning resources when needed.**
If an experience requires specific instructors or equipment, assign resources to the slots to track availability and requirements.

## Global Agenda View

The global agenda (**Operations -> Agenda**) shows all slots across all experiences:
- Filter by status (all, published, cancelled)
- Filter by experience type
- View in table or calendar format
- Quick navigation to individual slots

Use the global agenda for:
- Identifying scheduling conflicts
- Planning staff allocation
- Overview of the week's activities

## Related Pages

- [Experiences](../catalog/experiences.md) - Parent entity for slots
- [Editions](../catalog/editions.md) - Optional edition linking
- [Resources](./resources.md) - Instructors, facilitators, and equipment
- [Locations](./locations.md) - Physical locations and rooms