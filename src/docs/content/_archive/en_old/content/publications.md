---
title: Publications
description: Editorial and SEO content for the public website
section: content
order: 1
lastUpdated: 2026-04-25
---

# Publications

Publications are the **editorial layer** for OMZONE content, providing the public-facing narrative, marketing copy, and SEO-optimized pages that drive organic traffic. They exist separately from the commercial layer (experiences, pricing, slots) and serve purely as marketing content.

## Publications vs Experiences

| Aspect | Publications | Experiences |
|--------|--------------|-------------|
| Purpose | Editorial, SEO, marketing narrative | Commercial, pricing, availability |
| Content | Titles, descriptions, images, landing page content | Pricing tiers, slots, capacity, fulfillment |
| Status | `draft`, `published`, `archived` | `draft`, `published`, `paused`, `archived` |
| Pricing | No pricing fields | Pricing tiers with price types |
| Scheduling | No scheduling | Slots and availability |
| Linking | Can link to an Experience via `experienceId` | Referenced by Publication |

> **Domain separation:** Publications and Experiences are separate entities. A Publication can link to an Experience (via the `experienceId` field), but changes to one do not automatically affect the other. This separation allows editorial content to remain stable while commercial details change.

## When to Use Publications

Create a Publication for:

| Use Case | Description |
|----------|-------------|
| SEO Landing Pages | Optimized pages targeting specific keywords |
| Blog Posts | Editorial content, wellness articles, news |
| Experience Highlights | Curated featured experiences with narrative |
| Institutional Pages | About, terms, privacy, refund policies |
| FAQ Pages | Structured frequently asked questions |

## Publication Categories

| Category | Use Case | Description |
|----------|----------|-------------|
| `landing` | Main landing pages | Primary entry points for campaigns |
| `blog` | Blog posts | Articles, news, wellness tips |
| `highlight` | Featured content | Curated experiences with editorial narrative |
| `institutional` | About, policies | Company info, legal pages |
| `faq` | FAQ pages | Structured question/answer content |

## Creating a Publication

1. Navigate to **Content → Publications**
2. Click **Create New**
3. Select the **Category** (landing, blog, highlight, institutional, faq)
4. Fill in the details
5. Add sections for modular content
6. Set status to `published` when ready

## Publication Fields

### Core Fields

| Field | Type | Description |
|-------|------|-------------|
| Title | string | Publication title (supports i18n) |
| Slug | string | URL slug (unique per category) |
| Category | enum | `landing`, `blog`, `highlight`, `institutional`, `faq` |
| Excerpt | string | Short description (max 200 characters) |
| Description | string | Full content description (supports i18n) |
| Status | enum | `draft`, `published`, `archived` |

### Experience Link

| Field | Type | Description |
|-------|------|-------------|
| Experience | relation | Optional link to an Experience |

When an `experienceId` is set, the Publication can display related experience information while maintaining separate editorial control.

### Images

| Field | Type | Description |
|-------|------|-------------|
| Thumbnail | file | Main image for listing pages |
| Hero Image | file | Full-width header image |
| Gallery | files | Additional images for gallery sections |

### SEO

| Field | Type | Description |
|-------|------|-------------|
| SEO Title | string | Override title for search engines (max 60 chars) |
| SEO Description | string | Meta description (max 160 chars) |
| Canonical URL | string | Preferred URL for duplicate content |
| Index | boolean | Allow search engine indexing |
| Follow | boolean | Allow search engine following |

### Tags

| Field | Type | Description |
|-------|------|-------------|
| Tags | string[] | Array of tag names for categorization |

## Publication Status Lifecycle

```
draft → published → archived
         ↓
       paused → published
```

| Status | Description |
|--------|-------------|
| `draft` | Not visible to public; in preparation |
| `published` | Live and visible to public |
| `paused` | Temporarily unavailable (can resume) |
| `archived` | Permanently removed from public view |

## Publication Tabs

| Tab | Description |
|-----|-------------|
| Details | Core fields, experience link, images |
| Sections | Modular content blocks for the page body |
| SEO | Search engine optimization settings |
| Preview | Desktop/mobile preview of published content |

## Common Mistakes

- **Confusing with Experience:** Publications contain no pricing or scheduling. Always create the Experience first, then optionally create a Publication to provide editorial narrative.
- **Duplicate slugs:** Slugs must be unique within each category. Using the same slug in different categories is allowed.
- **Missing SEO fields:** Even internal publications benefit from SEO metadata for consistency and future proofing.
- **Not linking experience:** For landing pages about specific experiences, always link the `experienceId` to maintain proper domain relationships.
- **Publishing before sections:** A published Publication with no sections displays an empty page. Add meaningful sections before publishing.

## Related Pages

- [Sections](/docs/content/sections) — Modular content blocks for publications
- [Experiences](/docs/catalog/experiences) — Commercial layer linked by publications
- [Tags](/docs/catalog/tags) — Categorization for publications and experiences
