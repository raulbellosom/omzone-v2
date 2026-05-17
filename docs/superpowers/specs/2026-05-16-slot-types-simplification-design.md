# Slot Types Simplification

**Date:** 2026-05-16  
**Status:** Approved

## Context

OMZONE currently shows 4 slot types in the admin form (Single session, Multi-day, Retreat day, Private). These types have zero behavioral impact — no form field differences, no validation differences, no checkout differences. Only `single_session` is used in practice. The type field is purely decorative.

## Decision

Reduce the slot type dropdown from 4 to 2 options: `single_session` and `private`. Remove `multi_day` and `retreat_day`.

**Why keep `private`:** OMZONE does offer private/1:1 sessions. Admins handle capacity manually (set to 1), but the label is useful for identifying the slot at a glance. No special behavior is added — the type remains a label only.

**Why remove `multi_day` and `retreat_day`:** Multi-day retreats are not part of the current catalog. Adding them to the UI without any supporting behavior creates confusion (as evidenced by this brainstorming session).

## Scope

**In scope:**
- Remove `multi_day` and `retreat_day` from the `SLOT_TYPES` constant in `SlotForm.jsx`
- Remove corresponding color entries in `SlotTypeChip.jsx`
- Remove unused i18n translation keys from `en/admin.json` and `es/admin.json`

**Out of scope:**
- No DB schema changes (the enum values stay in Appwrite for future use)
- No behavioral logic added to `private` type
- No changes to `SlotQuickCreatePage.jsx` (already hardcodes `single_session`)
- No changes to `checkoutRules.js` or any hook
