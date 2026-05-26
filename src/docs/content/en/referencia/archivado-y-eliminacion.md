---
title: Archiving & Deletion
description: How the OMZONE archiving and deletion system works — soft-archive, hard-delete, permissions, and cascades
section: referencia
order: 5
lastUpdated: 2026-05-25
---

# Archiving & Deletion

OMZONE uses a two-level approach to removing content: **soft-archive** (reversible) and **hard-delete** (permanent). Understanding the difference prevents accidental data loss.

---

## The two levels

### Soft-archive

Archiving hides a record from the active view but keeps it in the database. It is fully reversible.

- The record is tagged with `archivedAt` (timestamp), `archivedBy` (user ID), and `archiveReason` (optional text).
- Archived records disappear from lists and the public site.
- They can be restored at any time.
- **Who can archive / restore:** `admin`, `operator`.

### Hard-delete

Hard-delete permanently removes the record from the database. **It cannot be undone.**

- **Who can hard-delete:** super-admin only (restricted access).
- A confirmation dialog with explicit text entry is required before the deletion proceeds.
- Intended for cleanup of test data, duplicate records, or records that should never have existed.

---

## Archiving in the UI

Every archivable list page has an **Actions** dropdown (three-dot menu) on each row:

- **Archive** → opens a confirmation overlay asking for an optional reason.
- After archiving, the row is removed from the active list.

Pages with archivable records show an **Archived** tab that lists all archived items. From there you can **Restore** them.

### Archived content warning

When you open an archived record for editing (e.g., a publication), a warning banner appears at the top reminding you the record is archived and won't be visible publicly until restored.

---

## Hard-delete in the UI

The **Delete permanently** action is only visible for super-admin users. It appears in the same actions dropdown, below Archive.

A modal asks you to type the record's name or ID to confirm — this prevents accidental clicks.

---

## Cascade behavior

Some records support cascade archiving:

| Parent      | Cascades to                             |
| ----------- | --------------------------------------- |
| Experience  | Editions → Slots (optional, not forced) |
| Publication | Sections → Blocks (automatic)           |

The cascade is **optional** for experiences — you are asked whether to also archive related editions and slots. Say yes if you're taking an experience fully offline. Say no if you only want to hide the experience shell temporarily.

---

## Personal archive (portal)

The `archive-personal` function lets a logged-in client hide a record from their own portal view without it affecting any admin view. This is a client-side soft-hide — no `archivedAt` field is set on the main record. It is reversed from the portal settings.

---

## Which records can be archived

| Collection       | Soft-archive | Hard-delete      |
| ---------------- | ------------ | ---------------- |
| Experiences      | ✅           | ✅ (super-admin) |
| Editions         | ✅           | ✅ (super-admin) |
| Slots            | ✅           | ✅ (super-admin) |
| Publications     | ✅           | ✅ (super-admin) |
| Packages         | ✅           | ✅ (super-admin) |
| Passes           | ✅           | ✅ (super-admin) |
| Hero slides      | ✅           | ✅ (super-admin) |
| Contact messages | ✅           | —                |
| Orders           | —            | —                |
| Tickets          | —            | —                |

> Orders and tickets are **immutable** — they are never archived or deleted. This preserves the historical record of all transactions. If an order is invalid, it is cancelled (not deleted).

---

## The backend functions

Three Appwrite Functions handle archiving operations:

| Function               | What it does                                      |
| ---------------------- | ------------------------------------------------- |
| `archive-document`     | Soft-archives any document, sets archive fields   |
| `restore-document`     | Clears archive fields, restores to active         |
| `hard-delete-document` | Permanently removes a document (super-admin only) |
| `archive-personal`     | Adds a record to the client's personal hide list  |

All functions validate the caller's permissions before operating.

---

## Fields added to archivable collections

```json
{
  "archivedAt": "<datetime or null>",
  "archivedBy": "<user_id or null>",
  "archiveReason": "<string or null>"
}
```

A record is considered archived when `archivedAt` is not null.
