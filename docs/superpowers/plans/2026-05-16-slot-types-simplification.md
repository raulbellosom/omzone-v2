# Slot Types Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the slot type dropdown from 4 options to 2 (single_session, private), removing multi_day and retreat_day from admin UI and translations.

**Architecture:** Pure UI change — remove array entries from the options constant, chip config, and i18n files. No DB schema changes, no logic changes, no tests needed (no behavior is added or removed).

**Tech Stack:** React JSX, JSON i18n files (en/es)

---

### Task 1: Remove from SlotForm options

**Files:**
- Modify: `src/components/admin/slots/SlotForm.jsx:14-19`

- [ ] **Step 1: Edit SLOT_TYPE_OPTIONS**

Replace lines 14-19 in `src/components/admin/slots/SlotForm.jsx`:

```jsx
const SLOT_TYPE_OPTIONS = [
  { value: "single_session", i18nKey: "admin.slotForm.typeSingle" },
  { value: "private", i18nKey: "admin.slotForm.typePrivate" },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/slots/SlotForm.jsx
git commit -m "feat: reduce slot types to single_session and private"
```

---

### Task 2: Remove from SlotTypeChip

**Files:**
- Modify: `src/components/admin/slots/SlotTypeChip.jsx:4-16`

- [ ] **Step 1: Edit CONFIG and LABELS objects**

Replace lines 4-16 in `src/components/admin/slots/SlotTypeChip.jsx`:

```jsx
const CONFIG = {
  single_session: "bg-sage/15 text-sage-darker border-sage/25",
  private:        "bg-charcoal/[0.08] text-charcoal-light border-charcoal/[0.12]",
};

const LABELS = {
  single_session: "admin.slotForm.typeSingle",
  private:        "admin.slotForm.typePrivate",
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/slots/SlotTypeChip.jsx
git commit -m "feat: remove multi_day and retreat_day from slot type chip"
```

---

### Task 3: Remove unused i18n keys

**Files:**
- Modify: `src/i18n/en/admin.json:607-608`
- Modify: `src/i18n/es/admin.json:607-608`

- [ ] **Step 1: Remove keys from English translations**

In `src/i18n/en/admin.json`, within the `slotForm` object, delete these two lines:

```json
"typeMultiDay": "Multi-day",
"typeRetreatDay": "Retreat day",
```

- [ ] **Step 2: Remove keys from Spanish translations**

In `src/i18n/es/admin.json`, within the `slotForm` object, delete these two lines:

```json
"typeMultiDay": "Multi-día",
"typeRetreatDay": "Día de retiro",
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/en/admin.json src/i18n/es/admin.json
git commit -m "chore: remove unused multi_day and retreat_day i18n keys"
```

---

### Task 4: Manual verification

- [ ] **Step 1: Start dev server and open slot edit page**

```bash
npm run dev
```

Navigate to any slot edit page (e.g. `localhost:5174/admin/experiences/<id>/slots/<id>/edit`).

- [ ] **Step 2: Verify dropdown shows only 2 options**

Open the "Slot type" dropdown — confirm only "Single session" and "Private" appear.

- [ ] **Step 3: Verify chip renders for both types**

Check a slot list page that shows `SlotTypeChip`. Confirm chips for `single_session` and `private` render correctly (sage and charcoal colors). Confirm no visual errors for any existing slots.
