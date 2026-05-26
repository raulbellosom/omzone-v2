---
title: Hero Slides
description: How to manage the hero carousel on the OMZONE landing page from the admin panel
section: admin
order: 18
lastUpdated: 2026-05-25
---

# Hero Slides

**Hero Slides** controls the full-width image carousel that visitors see at the very top of the OMZONE landing page. Each slide can have a background image, a call-to-action, and an optional schedule so it only appears during a specific date range.

---

## Getting there

In the sidebar go to **Content → Hero Slides**.

---

## The slides list

The list shows all slides in their current display order. The number at the left of each card represents its position in the carousel — slide 1 is shown first.

From the list you can:

- **Reorder** slides by dragging them.
- **Toggle visibility** on/off without archiving.
- **Edit** any slide.
- **Archive** a slide you no longer need.

---

## Creating a slide

Click **New slide** and fill in the fields:

### Image

Select an image from the media library. Hero images should be **wide-format** (recommended minimum 1920 × 1080 px). Portraits and square images won't fill the carousel properly.

### Alt text (bilingual)

Provide descriptive alt text in both English and Spanish. This is required for accessibility and SEO.

### Call to action (CTA)

Optional. If set, a button appears over the slide:

- **Label** — The button text (e.g., "Explore retreats", "Book now").
- **URL** — Where the button links to. Can be an internal path (`/experiences`) or an external URL.

### Schedule

Optional. If you only want the slide to appear during a specific campaign or season:

- **Starts at** — Date and time the slide becomes visible.
- **Ends at** — Date and time the slide is automatically hidden.

If both fields are empty, the slide is always visible (as long as it's not archived).

### Visibility

Use the **Active** toggle to show or hide the slide instantly without scheduling. Useful for quick adjustments.

---

## Reordering slides

Drag a slide card by its handle to move it up or down in the list. The order is saved automatically. The carousel on the public site reflects the new order immediately.

---

## Best practices

- **Keep it to 3–5 slides** — Too many slides cause visitors to miss the message.
- **Use high-contrast overlays** — Text needs to be legible over the image. If the image is light, the text overlay should be dark and vice versa.
- **One clear CTA per slide** — Don't ask visitors to do two things in the same slide.
- **Schedule seasonal slides** — Use `startsAt` / `endsAt` for holiday campaigns so you never forget to take them down.
- **Always set alt text** — Required for screen readers and for proper SEO indexing of the image.

---

## Archiving and restoring slides

Archive a slide via the actions menu (three dots → Archive). Archived slides disappear from the carousel but are kept in the system. You can restore them at any time.

For permanent removal, only `root` users can hard-delete a slide. See [Archiving & Deletion](../referencia/archivado-y-eliminacion.md).
