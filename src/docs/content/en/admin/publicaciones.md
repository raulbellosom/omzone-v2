---
title: Publications
description: How to create and manage blog publications and editorial content in OMZONE
section: admin
order: 15
lastUpdated: 2026-05-25
---

# Publications

A **publication** is a blog article — the editorial layer of OMZONE. Publications are where you tell the story of experiences, share wellness insights, and create content that clients discover on the public site.

Publications are intentionally separate from the commercial setup (pricing, schedules). This lets you update the storytelling without touching the business logic, and vice versa.

---

## All publications are blog posts

Publications in OMZONE are now a single content type: **blog**. There are no longer separate types for landing pages, institutional pages, or FAQ entries. Instead, use **tags** to organize and contextualize content:

| Tag             | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| `featured`      | Highlighted / promoted content                         |
| `faq`           | Appears on the Help & FAQ page accordion               |
| `landing`       | Content originally tied to the main landing experience |
| `institutional` | About, mission, values, and similar pages              |

A publication can have multiple tags. Tags are optional — a plain blog post needs no tags.

---

## Creating a publication

1. Go to **Publications** in the sidebar.
2. Click **New publication**.
3. Fill in the basics:
   - **Title** — The public-facing title (bilingual: English + Spanish).
   - **Subtitle** — Optional short line below the title.
   - **Excerpt** — A short teaser (2–3 lines) that appears in listings.
   - **Cover image** — The main photo clients see first.
   - **Tags** — Optional context labels (see table above).
   - **Suggested experience** — Link this publication to an experience for cross-promotion. This is a recommendation field — it does not gate the publication behind the experience.
4. Save. You'll be taken to the **Sections editor** to build the content.

---

## Building the content

Once the publication is created, you build its content using the **Sections editor** (also called SectionManager). Each section is a content area (hero image, text block, gallery, quote, etc.).

The section editor opens as a **slide-over panel** on the right side of the screen. You can:

- **Add** a section from the slide-over.
- **Edit** an existing section by clicking it.
- **Reorder** sections by dragging them.
- **Delete** a section from its actions menu.

See **Sections & Blocks** for details on how to structure a publication.

---

## Publication status

| Status        | What it means                                    |
| ------------- | ------------------------------------------------ |
| **Draft**     | Only visible to admins — not on the public site  |
| **Published** | Live on the public site                          |
| **Archived**  | Removed from the public site, kept for reference |

There is no "Scheduled" status — publish and archive manually as needed.

---

## Editing a publication

You can edit a publication at any time. Changes to metadata (title, tags, SEO fields) take effect immediately. Changes to sections require saving each section individually.

> If a publication is archived, an **orange warning banner** appears at the top of the edit page reminding you it is not publicly visible.

---

## SEO and discoverability

Publications support:

- **SEO title** and **SEO description** — for search engine results.
- **Slug** — the URL path (e.g., `/blog/my-article`). Set it once and avoid changing it to preserve SEO value.
- Structured data is generated automatically for publications linked to an experience.

Keep titles and descriptions unique across all publications for best search performance.

---

## Publications vs. experiences

| Publications                              | Experiences                                 |
| ----------------------------------------- | ------------------------------------------- |
| Tell the story — who, why, what to expect | Define the product — price, dates, capacity |
| Photos, narratives, instructor bios       | Sale mode, schedule, add-ons                |
| Standalone blog articles                  | Can exist without a publication             |
| Tagged for context                        | Linked to pricing tiers and slots           |

---

## Archiving and hard-delete

- **Archive**: moves the publication out of the public site. Reversible. Available to `admin` and `operator`.
- **Hard-delete**: permanently removes the publication and all its sections. Requires super-admin permissions.

See [Archiving & Deletion](../referencia/archivado-y-eliminacion.md) for the full reference.
