---
title: Locations
description: Manage physical locations and spaces where experiences take place
section: operations
order: 3
lastUpdated: 2026-05-17
relatedRoutes:
  - /admin/resources (Locations tab)
  - /admin/resources/locations/new
  - /admin/resources/locations/:id/edit
  - /admin/spaces/new
  - /admin/spaces/:id/edit
relatedCollections:
  - locations
  - rooms
keywords:
  - location
  - venue
  - space
  - room
  - studio
---

# Locations

Locations are physical venues where experiences take place. Each location can contain multiple spaces.

## Creating a Location

Navigate to **Operations -> Resources -> Locations -> New location**

### Location Fields

| Field         | Type    | Required | Description                                   |
| ------------- | ------- | -------- | --------------------------------------------- |
| `name`        | string  | Yes      | Location name (e.g., "Tulum Studio")          |
| `address`     | string  | No       | Full physical address                         |
| `coordinates` | string  | No       | Latitude,longitude (e.g., "20.2114,-87.4653") |
| `description` | text    | No       | Description of the location                   |
| `isActive`    | boolean | Yes      | Whether the location is available             |

### Address and Coordinates

The `address` field stores the full street address for display purposes.

The `coordinates` field (format: latitude,longitude) enables:

- Map integration
- Geolocation features
- Distance calculations

Both fields are optional but recommended for venues that serve customers.

## Creating a Room

Navigate to **Operations -> Resources -> Rooms -> New room**

### Room Fields

| Field         | Type      | Required | Description                                               |
| ------------- | --------- | -------- | --------------------------------------------------------- |
| `locationId`  | reference | Yes      | Parent location                                           |
| `name`        | string    | Yes      | Room name (e.g., "Main Studio")                           |
| `type`        | enum      | No       | `studio`, `therapy_room`, `outdoor`, `pool_area`, `other` |
| `capacity`    | integer   | No       | Maximum number of participants                            |
| `description` | text      | No       | Room description                                          |
| `isActive`    | boolean   | Yes      | Whether the room is available                             |

### Room Types

| Type           | Description                     |
| -------------- | ------------------------------- |
| `studio`       | General practice or class space |
| `therapy_room` | Small space for treatments      |
| `outdoor`      | Open-air space                  |
| `pool_area`    | Pool-adjacent space             |
| `other`        | Other types of spaces           |

## Location Hierarchy

```
Location (e.g., "Tulum Yoga Center")
  ├── Space 1 (e.g., "Main Studio")
  ├── Space 2 (e.g., "Meditation Room")
  └── Space 3 (e.g., "Outdoor Terrace")
```

## Using Locations in Slots

When creating or editing a slot, you can assign:

- A location (the venue)
- A space (specific area within the venue)

The space selection only appears after a location is selected. You must first select a location, then select the space.

## Location in Slot Display

Slots show their assigned location and space:

- **Location** - The venue name
- **Space** - The specific area within the venue

This helps customers understand where an experience will take place.

## Common Mistakes

**Creating spaces without selecting a location first.**
Spaces must belong to a location. When creating a space, you must select the parent location from the dropdown. If no locations exist, create one first.

**Not setting space capacity.**
The capacity helps prevent overbooking. Set the maximum participants based on the physical space constraints.

**Setting location coordinates incorrectly.**
The coordinates must be in "latitude,longitude" format (e.g., "20.2114,-87.4653"). Do not include spaces or other characters.

**Archiving a location with active spaces.**
If a location is no longer used, deactivate it. This cascades to all spaces under it, preventing new slot assignments.

## Related Pages

- [Slots & Agenda](./slots.md) - Where locations and spaces are assigned
- [Resources](./resources.md) - Instructors and equipment that work at locations
