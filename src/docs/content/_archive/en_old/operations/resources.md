---
title: Resources
description: Manage instructors, facilitators, therapists, equipment, and other operational resources
section: operations
order: 2
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/resources
  - /admin/resources/new
  - /admin/resources/:id/edit
relatedCollections:
  - resources
  - slot_resources
keywords:
  - resource
  - instructor
  - facilitator
  - therapist
  - equipment
---

# Resources

Resources are the people and equipment that support experience delivery. They include instructors, facilitators, therapists, and equipment that can be assigned to slots.

## Resource Types

| Type | Description |
|------|-------------|
| `instructor` | Yoga or wellness teacher |
| `facilitator` | Program or session facilitator |
| `therapist` | Massage, bodywork, or wellness therapist |
| `equipment` | Equipment needed for sessions |

## Creating a Resource

Navigate to **Operations -> Resources -> New resource**

### Identity Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Resource name (e.g., "Maria Garcia") |
| `type` | enum | Yes | `instructor`, `facilitator`, `therapist`, `equipment` |
| `description` | text | No | Description or bio |
| `contactInfo` | string | No | Email, phone, or other contact |
| `photoId` | file | No | Photo of the resource |
| `isActive` | boolean | Yes | Whether the resource is available |

### Metadata Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `metadata` | JSON | No | Additional structured data |

Metadata can include certifications, languages, specializations, etc. Example:
```json
{
  "certifications": ["RYT-200", "RYT-500"],
  "languages": ["es", "en"],
  "specializations": ["vinyasa", "yin"]
}
```

## Managing Resources

Navigate to **Operations -> Resources** to:
- View all resources
- Filter by type
- Search by name
- Edit resource details
- Toggle active/inactive status

## Resources in Slot Assignment

Resources are assigned to slots to track:
- Who is leading a session
- Who is assisting
- What equipment is needed

Assignment happens at the slot level, not the experience level. A resource can be assigned to any slot across any experience.

## Resource Status

Resources have an `isActive` flag:
- `true` - Available for assignment
- `false` - Not available (archived or no longer working)

Inactive resources do not appear in resource selection dropdowns.

## Common Mistakes

**Not keeping resource contact info up to date.**
Contact information helps with scheduling coordination. Keep email and phone current.

**Setting `isActive` to false without checking slot assignments.**
If a resource becomes unavailable, check existing slot assignments. Cancel or reassign before deactivating.

**Forgetting to add certifications or specializations.**
Use the metadata field to store relevant qualifications. This helps when searching for the right resource for a particular experience.

## Related Pages

- [Slots & Agenda](./slots.md) - Where resources are assigned
- [Locations](./locations.md) - Physical spaces that may have associated resources