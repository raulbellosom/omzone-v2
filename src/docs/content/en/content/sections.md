---
title: Sections
description: Modular content blocks for publications
section: content
order: 2
lastUpdated: 2026-04-25
---

# Sections

Sections are modular content blocks that compose the body of a Publication. Each section type serves a specific purpose, from displaying hero banners to organizing FAQ content. Sections are added to Publications via the **Sections** tab and can be reordered via drag-and-drop.

## Available Section Types

| Type | Description | Use Case |
|------|-------------|----------|
| `hero` | Full-width header with title, subtitle, and media | Primary visual entry point |
| `text` | Rich text content block | Body copy, descriptions |
| `gallery` | Grid of images with lightbox | Photo collections |
| `highlights` | Featured experiences or features | Showcase key offerings |
| `faq` | Accordion-style Q&A | Frequently asked questions |
| `itinerary` | Day-by-day schedule | Retreat and stay itineraries |
| `testimonials` | Customer quotes and ratings | Social proof |
| `inclusions` | What's included list | Amenities, services |
| `restrictions` | What's not included or restrictions | Important notices |
| `cta` | Call-to-action button or form | Conversion prompts |
| `video` | Embedded video player | Promotional or informational videos |

## Section Structure

Each section contains:

| Field | Type | Description |
|-------|------|-------------|
| Type | enum | Section type identifier |
| Order | integer | Display order within publication |
| Status | enum | `active` or `inactive` |
| Content | object | Type-specific fields |

> **Active vs Inactive:** Inactive sections are hidden from the published page but preserved for future activation.

## Section Type Details

### Hero Section

The hero section serves as the primary visual header for a publication.

| Field | Type | Description |
|-------|------|-------------|
| Title | string | Main heading text |
| Subtitle | string | Secondary descriptive text |
| Media Type | enum | `image` or `video` |
| Image/Video | file/URL | Visual content |
| Overlay | boolean | Add dark overlay for text readability |
| Overlay Opacity | number | 0-100 percentage |
| Alignment | enum | `left`, `center`, `right` |
| Height | enum | `small`, `medium`, `full` |

### Text Section

Rich text content for detailed narrative sections.

| Field | Type | Description |
|-------|------|-------------|
| Content | string | HTML or Markdown rich text |
| Alignment | enum | `left`, `center`, `right` |
| Background | enum | `white`, `light`, `dark` |

### Gallery Section

Image gallery with lightbox viewing.

| Field | Type | Description |
|-------|------|-------------|
| Images | files[] | Array of image files |
| Layout | enum | `grid`, `masonry`, `carousel` |
| Columns | integer | Number of columns (1-6) |
| Spacing | enum | `tight`, `normal`, `loose` |
| Lightbox | boolean | Enable lightbox on click |

### Highlights Section

Display featured experiences or highlights.

| Field | Type | Description |
|-------|------|-------------|
| Title | string | Section heading |
| Items | relation[] | Array of experiences to highlight |
| Display | enum | `cards`, `list`, `carousel` |
| Show Prices | boolean | Display pricing information |
| Show Descriptions | boolean | Display experience descriptions |

### FAQ Section

Accordion-style frequently asked questions.

| Field | Type | Description |
|-------|------|-------------|
| Title | string | Section heading |
| Items | array | Array of question/answer pairs |

**FAQ Item structure:**

| Field | Type | Description |
|-------|------|-------------|
| Question | string | The question text |
| Answer | string | The answer text |
| Order | integer | Display order |

### Itinerary Section

Day-by-day schedule for multi-day experiences.

| Field | Type | Description |
|-------|------|-------------|
| Title | string | Section heading |
| Days | array | Array of day entries |

**Itinerary Day structure:**

| Field | Type | Description |
|-------|------|-------------|
| Day | integer | Day number |
| Title | string | Day title (e.g., "Day 1: Arrival") |
| Description | string | Activities description |
| Meals | string[] | Included meals |
| Image | file | Optional day image |

### Testimonials Section

Customer testimonials with optional photos.

| Field | Type | Description |
|-------|------|-------------|
| Title | string | Section heading |
| Items | array | Array of testimonials |
| Layout | enum | `carousel`, `grid`, `single` |
| Show Rating | boolean | Display star ratings |

**Testimonial structure:**

| Field | Type | Description |
|-------|------|-------------|
| Quote | string | Customer testimonial text |
| Author | string | Customer name |
| Photo | file | Optional customer photo |
| Rating | number | Star rating (1-5) |
| Date | date | Date of testimonial |

### Inclusions Section

List of included items (amenities, services).

| Field | Type | Description |
|-------|------|-------------|
| Title | string | Section heading |
| Items | string[] | List of included items |
| Icon Style | enum | `check`, `plus`, `none` |
| Columns | integer | Number of columns |

### Restrictions Section

List of exclusions or important restrictions.

| Field | Type | Description |
|-------|------|-------------|
| Title | string | Section heading |
| Items | string[] | List of restrictions |
| Icon Style | enum | `x`, `warning`, `none` |
| Columns | integer | Number of columns |

### CTA Section

Call-to-action button or embedded form.

| Field | Type | Description |
|-------|------|-------------|
| Title | string | CTA heading |
| Description | string | Supporting text |
| Button Text | string | Button label |
| Button URL | string | Link destination |
| Style | enum | `primary`, `secondary`, `outline` |
| Form ID | string | Optional embedded form ID |

### Video Section

Embedded video player.

| Field | Type | Description |
|-------|------|-------------|
| Title | string | Section heading |
| Video Type | enum | `youtube`, `vimeo`, `self-hosted` |
| Video URL/ID | string | Video URL or ID |
| Thumbnail | file | Custom thumbnail image |
| Autoplay | boolean | Auto-play on load |
| Controls | boolean | Show video controls |

## Adding and Managing Sections

### Adding a Section

1. Open a Publication
2. Click the **Sections** tab
3. Click **Add Section**
4. Select the section type from the modal
5. Fill in the section content
6. Click **Save Section**

### Reordering Sections

1. In the Sections tab, click and hold the **drag handle** (⋮⋮) on the left side of a section
2. Drag to the desired position
3. Release to drop
4. Order numbers update automatically

### Editing a Section

1. Click the **edit icon** (pencil) on the section card
2. Modify content in the edit modal
3. Click **Save Changes**

### Deleting a Section

1. Click the **delete icon** (trash) on the section card
2. Confirm deletion in the modal

### Toggling Section Status

- Click the **status toggle** on the section card
- Active sections are visible on published pages
- Inactive sections are hidden but preserved

## Common Mistakes

- **Empty sections:** Publishing a page with no sections results in a blank page. Add meaningful content before publishing.
- **Wrong section type:** Text content belongs in a `text` section, not a `hero`. Using the correct type ensures proper styling.
- **Missing FAQ answers:** FAQ sections with questions but no answers create confusing UX. Always provide complete answers.
- **Incorrect itinerary dates:** Itinerary day numbers should be sequential. Gaps create confusion for customers.
- **Video without controls:** Videos with `controls: false` and `autoplay: true` can frustrate users who cannot stop playback.

## Related Pages

- [Publications](/docs/content/publications) — Publications that contain sections
