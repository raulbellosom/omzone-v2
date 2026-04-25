# OMZONE Admin Documentation — Implementation Plan

**Version:** 1.0  
**Date:** 2026-04-25  
**Mode:** Documentation Platform  
**Status:** Phase 2 — Implementation Planning  

---

## Table of Contents

1. [Current Project Audit Summary](#1-current-project-audit-summary)
2. [Recommended Documentation Architecture](#2-recommended-documentation-architecture)
3. [Recommended Route Structure](#3-recommended-route-structure)
4. [Documentation IA/Navigation Map](#4-documentation-ianavigation-map)
5. [Page Template Standard](#5-page-template-standard)
6. [Content Metadata Standard](#6-content-metadata-standard)
7. [UI Component Plan](#7-ui-component-plan)
8. [Search Strategy](#8-search-strategy)
9. [Copy Page Behavior](#9-copy-page-behavior)
10. [Styling and UX Guidelines](#10-styling-and-ux-guidelines)
11. [Implementation Phases](#11-implementation-phases)
12. [Mode Handoff Plan](#12-mode-handoff-plan)
13. [Initial Documentation Page List](#13-initial-documentation-page-list)
14. [Risks and Decisions](#14-risks-and-decisions)
15. [Final Deliverable](#15-final-deliverable)

---

## 1. Current Project Audit Summary

### What Was Found

**Admin Panel Structure:**
- 47 admin page files across 7 sidebar categories
- 51 distinct admin routes under `/admin/*`
- Uses React Router v7 with lazy loading (except HomePage)
- TanStack React Query v5 for data fetching

**Admin Sidebar Categories (mirrored from `AdminSidebar.jsx` NAV_SECTIONS):**

| Category | Label Key | Items |
|---|---|---|
| General | `admin.sidebar.general` | Dashboard, Account |
| Catalog | `admin.sidebar.catalog` | Experiences, Addons, Packages, Passes |
| Operations | `admin.sidebar.operations` | Agenda/Slots, Resources |
| Sales | `admin.sidebar.sales` | Booking Requests, Orders, Tickets, Clients |
| Content | `admin.sidebar.content` | Publications, Media |
| System | `admin.sidebar.system` | Settings |

**Key Entities and Relationships:**

```
experiences (Editorial domain)
    ├── editions (Commercial)
    │       ├── pricing_tiers (Commercial)
    │       └── pricing_rules (Commercial)
    ├── slots (Agenda domain)
    │       └── resources (Agenda domain)
    ├── addons via addon_assignments (Commercial)
    ├── tags via experience_tags (Editorial)
    └── publications via experienceId (Editorial)

publications
    └── sections (content blocks with sectionType enum)

passes (Commercial)
    └── user_passes → pass_consumptions (Transactional)

orders (Transactional)
    └── order_items (with itemSnapshot JSON)

tickets (Transactional)
    └── ticketSnapshot JSON

booking_requests (Transactional)
```

**Collections from appwrite.json (5 Domains):**

| Domain | Collections |
|---|---|
| Editorial | `experiences`, `publications`, `sections`, `tags`, `experience_tags` |
| Commercial | `editions`, `pricing_tiers`, `pricing_rules`, `addons`, `addon_assignments`, `packages`, `package_items`, `passes`, `user_passes` |
| Agenda | `slots`, `slot_resources`, `resources`, `locations`, `rooms` |
| Transactional | `orders`, `order_items`, `payments`, `tickets`, `ticket_redemptions`, `pass_consumptions`, `refunds`, `booking_requests` |
| User | `user_profiles`, `admin_activity_logs` |

**Experience Types:** `session`, `immersion`, `retreat`, `stay`, `private`, `package`  
**Sale Modes:** `direct`, `request`, `assisted`, `pass`  
**Fulfillment Types:** `ticket`, `booking`, `pass`, `package`  
**Publication Categories:** `landing`, `blog`, `highlight`, `institutional`, `faq`  
**Section Types:** `hero`, `text`, `gallery`, `highlights`, `faq`, `itinerary`, `testimonials`, `inclusions`, `restrictions`, `cta`, `video`

**i18n:** EN/ES in `src/i18n/es/admin.json` (1583 lines). Admin labels use `labelKey` pattern.

**Styling:** TailwindCSS v4 with CSS-first `@theme` config. Design tokens: cream, sand, warm-gray, sage, charcoal palette. Fonts: Playfair Display (display), Inter (body). Shadows: card, hover, modal, premium.

**Existing Documentation:** `docs/architecture/` has 7 ADR files; `docs/tasks/` has 66 task files (mostly Spanish); `docs/core/` has master requirements.

**Appwrite Functions:** `assign-user-label`, `create-checkout`, `stripe-webhook`, `generate-ticket`, `validate-ticket`, `consume-pass`, `send-confirmation`, `send-reminder`.

**Key Files Informing Documentation:**

| File | Purpose |
|---|---|
| `src/constants/routes.js` | All admin route definitions |
| `src/components/admin/layout/AdminSidebar.jsx` | Navigation structure reference |
| `src/layouts/AdminLayout.jsx` | Admin layout pattern |
| `appwrite.json` | All collection schemas |
| `src/i18n/es/admin.json` | All admin label keys |
| `docs/architecture/00_domain-map.md` | Domain boundaries and entity relationships |
| `src/styles/globals.css` | Design tokens and typography |
| `src/pages/admin/sales/AssistedSalePage.jsx` | Assisted sale wizard (7-step) |
| `src/pages/admin/BookingRequestListPage.jsx` | Booking request lifecycle |
| `src/pages/admin/PublicationSectionsPage.jsx` | Section type management |

---

## 2. Recommended Documentation Architecture

### Folder Structure

```
src/
  docs/
    content/
      index.md                          # Landing page
      getting-started/
        index.md
        admin-panel-overview.md
        roles-and-access.md
      catalog/
        index.md
        experiences/
          index.md
          creating.md
          editions.md
          pricing.md
          addons.md
          slots.md
        addons/
          index.md
          creating.md
        packages/
          index.md
          creating.md
        passes/
          index.md
          creating.md
          consumption.md
      operations/
        index.md
        agenda.md
        resources.md
        locations-rooms.md
        booking-requests.md
      sales/
        index.md
        orders.md
        assisted-sale.md
        tickets.md
      content/
        index.md
        publications.md
        sections.md
        media.md
      system/
        index.md
        clients.md
        settings.md
      reference/
        index.md
        data-dictionary.md
        error-codes.md
        workflow-complete-experience.md
        common-mistakes.md
    config/
      navigation.js       # Sidebar nav structure (JS for easy ordering)
      pages.js            # Page registry with metadata
    components/
      DocsLayout.jsx
      DocsSidebar.jsx
      DocsTopbar.jsx
      DocsBreadcrumbs.jsx
      DocsSearch.jsx
      DocsPage.jsx
      DocsTableOfContents.jsx
      DocsCopyPageButton.jsx
      DocsCopyCodeButton.jsx
      DocsPrevNext.jsx
      DocsMobileDrawer.jsx
      DocsEmptyState.jsx
      DocsNotFound.jsx
    hooks/
      useDocsSearch.js
      usePageMetadata.js
      useCopyPage.js
    lib/
      markdown.js          # Markdown parsing utilities
      search.js            # Local search engine
    styles/
      docs.css            # Docs-specific overrides
```

### Content Storage Approach

**Decision: Markdown files in `src/docs/content/`**

**Justification:**
- Content can be written and updated without touching React code
- Supports frontmatter for metadata
- Clear separation between content and UI
- Easy to migrate to MDX later if needed
- Lightweight — no build-time processing needed for initial version

**Alternative considered:** JS objects/pages — rejected because content authors need to touch code for every edit. JSON metadata — rejected because it adds indirection without benefit for this scale.

### Tech Stack for Rendering

- **Markdown parsing:** `react-markdown` with `remark-gfm` for tables and task lists
- **Syntax highlighting:** `rehype-highlight` or `react-syntax-highlighter`
- **Frontmatter parsing:** `gray-matter` or manual regex (lightweight, no heavy deps)
- **No MDX for now** — keeps the stack simple and avoids build complexity

```javascript
// Example: basic markdown rendering
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}
  components={{ pre, code }}
>
  {content}
</ReactMarkdown>
```

---

## 3. Recommended Route Structure

### Base Route

The documentation will live under `/help/docs` as a nested route within the admin section. This keeps it alongside admin functionality.

```
/help
/help/docs                                    → Landing/index page
/help/docs/getting-started                    → Getting started section
/help/docs/getting-started/admin-panel-overview
/help/docs/getting-started/roles-and-access
/help/docs/catalog                            → Catalog section index
/help/docs/catalog/experiences                → Experiences index
/help/docs/catalog/experiences/creating
/help/docs/catalog/experiences/editions
/help/docs/catalog/experiences/pricing
/help/docs/catalog/experiences/addons
/help/docs/catalog/experiences/slots
/help/docs/catalog/addons
/help/docs/catalog/packages
/help/docs/catalog/passes
/help/docs/operations                         → Operations section
/help/docs/operations/agenda
/help/docs/operations/resources
/help/docs/operations/booking-requests
/help/docs/sales                               → Sales section
/help/docs/sales/orders
/help/docs/sales/assisted-sale
/help/docs/sales/tickets
/help/docs/content                             → Content section
/help/docs/content/publications
/help/docs/content/sections
/help/docs/content/media
/help/docs/system                              → System section
/help/docs/system/clients
/help/docs/system/settings
/help/docs/reference                           → Reference section
/help/docs/reference/data-dictionary
/help/docs/reference/error-codes
/help/docs/reference/workflow-complete-experience
/help/docs/reference/common-mistakes
```

### URL Pattern

- Section indices: `/help/docs/{section}` (e.g., `/help/docs/catalog`)
- Sub-section indices: `/help/docs/{section}/{subsection}` (e.g., `/help/docs/catalog/experiences`)
- Topic pages: `/help/docs/{section}/{subsection}/{topic}` (e.g., `/help/docs/catalog/experiences/creating`)

### Route Registration in `App.jsx`

```javascript
// Docs routes — lazy loaded
const DocsLayout = lazy(() => import("@/docs/components/DocsLayout"));
const DocsPage = lazy(() => import("@/docs/components/DocsPage"));

// Under admin layout or as standalone
<Route path="/help" element={<DocsLayout />}>
  <Route path="docs" element={<DocsPage />}>
    <Route index element={<DocsIndexPage />} />
    <Route path="getting-started" element={<DocsSectionPage />} />
    <Route path="getting-started/:slug" element={<DocsPage />} />
    {/* ... rest of sections */}
  </Route>
</Route>
```

### DocsLayout vs AdminLayout

**Decision: Standalone DocsLayout (NOT nested in AdminLayout)**

Rationale:
- Documentation is a separate concern from admin panel operation
- Avoids breadcrumb conflicts with admin navigation
- Cleaner URL structure
- Can be styled independently
- Future: if docs become public, no admin dependency

The DocsLayout will have its own sidebar (docs navigation) and topbar.

---

## 4. Documentation IA/Navigation Map

### Sidebar Structure (6 sections matching admin categories)

```
Getting Started (new — not in admin sidebar)
├── Admin Panel Overview
├── Roles and Access
└── Navigation Guide

Catalog (mirrors admin sidebar: Catálogo)
├── Experiences
│   ├── Experiences Index
│   ├── Creating an Experience
│   ├── Managing Editions
│   ├── Pricing Tiers
│   ├── Assigning Addons
│   └── Managing Slots
├── Addons
│   ├── Addons Index
│   └── Creating Addons
├── Packages
│   ├── Packages Index
│   └── Creating Packages
└── Passes
    ├── Passes Index
    ├── Creating Passes
    └── Pass Consumption Flow

Operations (mirrors admin sidebar: Operación)
├── Agenda / Slots
├── Resources
├── Locations and Rooms
└── Booking Requests

Sales (mirrors admin sidebar: Ventas)
├── Orders
├── Assisted Sale
└── Tickets

Content (mirrors admin sidebar: Contenido)
├── Publications
├── Sections
└── Media

System (mirrors admin sidebar: Sistema)
├── Clients
└── Settings

Reference (new — knowledge base)
├── Data Dictionary
├── Error Codes
├── Workflow: Complete Experience
└── Common Mistakes
```

### Section Order in Sidebar

1. **Getting Started** — onboarding for new admin users
2. **Catalog** — the primary operational section
3. **Operations** — agenda and resource management
4. **Sales** — transaction and ticket handling
5. **Content** — editorial CMS
6. **System** — users and configuration
7. **Reference** — glossary, data dictionary, troubleshooting

### Navigation Configuration

Stored in `src/docs/config/navigation.js` as a JS array for easy reordering:

```javascript
export const DOCS_NAVIGATION = [
  {
    section: "getting-started",
    labelKey: "docs.gettingStarted",
    icon: "BookOpen",
    order: 1,
    items: [
      { slug: "admin-panel-overview", labelKey: "docs.adminPanelOverview" },
      { slug: "roles-and-access", labelKey: "docs.rolesAndAccess" },
      { slug: "navigation-guide", labelKey: "docs.navigationGuide" },
    ],
  },
  // ... etc
];
```

---

## 5. Page Template Standard

Every documentation page must follow this structure:

### Required Sections

```markdown
---
title: Page Title
description: Brief description of what this page covers.
section: section-slug
slug: page-slug
order: 1
keywords: [keyword1, keyword2]
relatedRoutes: [/admin/experiences, /admin/experiences/:id/editions]
relatedCollections: [experiences, editions]
lastUpdated: 2026-04-25
status: draft | review | published
---

# Page Title

## Overview
Brief description of what this page covers and when to use it.

## Audience
Who is this page for? (operator, admin, root)

## Related Admin Screen
Link to the actual admin screen this docs page refers to.

## When to Use
Bullet points explaining when an admin should refer to this page.

## Step-by-Step Usage

### Step 1: [Action Name]
Description of the action with expected outcome.

### Step 2: [Action Name]
...

## Fields Explained

| Field | Type | Required | Description |
|---|---|---|---|
| fieldName | string | Yes | Description |

## Common Mistakes
1. Mistake 1 — how to avoid
2. Mistake 2 — how to avoid

## Related Pages
- [Related Page Title](./related-page)
- [Another Page](./another-page)

---

*Last updated: 2026-04-25*
```

### Page Template Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | Page title shown in h1 and browser tab |
| `description` | string | Yes | One-sentence summary for SEO and tooltips |
| `section` | string | Yes | Which section this page belongs to |
| `slug` | string | Yes | URL slug (matches filename) |
| `order` | number | Yes | Sort order within section |
| `keywords` | array | No | Search keywords |
| `relatedRoutes` | array | No | Admin routes this page documents |
| `relatedCollections` | array | No | Appwrite collections referenced |
| `lastUpdated` | string | Yes | ISO date of last content update |
| `status` | enum | Yes | draft, review, or published |
| `audience` | string | No | admin, operator, root (inferred from section) |

---

## 6. Content Metadata Standard

### Frontmatter Schema

```yaml
---
title: "Creating an Experience"
description: "Step-by-step guide to creating a new experience in the OMZONE admin panel."
section: "catalog/experiences"
slug: "creating"
order: 2
keywords:
  - experience
  - create
  - catalog
  - session
  - immersion
relatedRoutes:
  - /admin/experiences/new
  - /admin/experiences/:id/edit
relatedCollections:
  - experiences
  - editions
lastUpdated: "2026-04-25"
status: "draft"
audience: "operator"
---
```

### Page Registry (`src/docs/config/pages.js`)

```javascript
export const DOCS_PAGES = [
  {
    slug: "admin-panel-overview",
    title: "Admin Panel Overview",
    section: "getting-started",
    order: 1,
    file: "getting-started/admin-panel-overview.md",
    status: "draft",
  },
  // ... auto-generated from content directory structure
];
```

### Metadata Parsing

Content files are parsed at runtime:

```javascript
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  return yaml.parse(match[1]);
}
```

---

## 7. UI Component Plan

### Complete Component List

| Component | Purpose | Props |
|---|---|---|
| `DocsLayout` | Root layout for all docs pages | `children` |
| `DocsSidebar` | Left navigation sidebar | `currentPath`, `isOpen`, `onClose` |
| `DocsTopbar` | Top bar with search, breadcrumbs, theme | `onToggleSidebar` |
| `DocsBreadcrumbs` | Breadcrumb trail | `items: [{label, path}]` |
| `DocsSearch` | Search input with results dropdown | `onResultSelect` |
| `DocsPage` | Main content wrapper with TOC | `content`, `metadata` |
| `DocsTableOfContents` | Right-side TOC panel | `headings: [{id, text, level}]` |
| `DocsCopyPageButton` | Copy full page as markdown | `content`, `title` |
| `DocsCopyCodeButton` | Copy single code block | `code`, `language` |
| `DocsPrevNext` | Bottom navigation (prev/next) | `previous`, `next` |
| `DocsMobileDrawer` | Mobile sidebar drawer | `isOpen`, `onClose`, `children` |
| `DocsEmptyState` | No content state | `message` |
| `DocsNotFound` | 404 for docs pages | |

### DocsLayout Structure

```
DocsLayout
├── DocsTopbar
│   ├── Logo/Title
│   ├── DocsBreadcrumbs
│   ├── DocsSearch
│   └── Theme toggle
├── DocsSidebar (desktop) / DocsMobileDrawer (mobile)
└── DocsContentArea
    ├── DocsPage (markdown content)
    ├── DocsTableOfContents (sticky right panel)
    └── DocsPrevNext
```

### Props Detail

**DocsSidebar:**
```typescript
interface DocsSidebarProps {
  currentPath: string;
  isOpen: boolean;
  onClose: () => void;
  navigation: NavSection[];
}
```

**DocsPage:**
```typescript
interface DocsPageProps {
  title: string;
  description: string;
  content: string;       // raw markdown
  headings: Heading[];   // extracted from markdown
  relatedPages?: string[];
  previousPage?: PageInfo;
  nextPage?: PageInfo;
}
```

**DocsTableOfContents:**
```typescript
interface DocsTableOfContentsProps {
  headings: Heading[];
  activeId: string;
  onHeadingClick: (id: string) => void;
}
```

### Mobile Behavior

- Sidebar is hidden by default on mobile
- Hamburger menu in DocsTopbar opens DocsMobileDrawer
- Drawer slides in from left with backdrop
- TOC collapses to floating button on mobile (< 1024px)

---

## 8. Search Strategy

### First Version: Local/Static Search

**Implementation:** Build-time search index + runtime filtering

**How it works:**
1. At build time, extract all page content and titles
2. Build a JSON index with title, slug, keywords, and content excerpt
3. At runtime, filter index based on user query
4. No external dependencies, works offline

```javascript
// search-index.json (generated at build)
[
  {
    slug: "creating-an-experience",
    title: "Creating an Experience",
    section: "catalog/experiences",
    keywords: ["experience", "create", "catalog"],
    excerpt: "Step-by-step guide to creating a new experience...",
    content: "Full content for snippet highlighting..."
  },
  // ...
]
```

**Search Features (v1):**
- Full-text search across title, keywords, and content
- Results grouped by section
- Keyboard navigation (arrow keys, enter to select)
- Recent searches (stored in localStorage)
- Minimum 2-character query

### Future: AI/Semantic Search Upgrade Path

**MiniMax Integration (when API keys available):**
1. Add `VITE_MINIMAX_API_KEY` env variable
2. Implement semantic search via MiniMax API
3. Natural language query understanding ("how do I configure X")
4. Context-aware results with section citations

**Upgrade path does NOT require rewrites — the search interface stays the same; only the search engine backend changes.**

### Search UI

- Cmd/Ctrl+K opens search modal
- Floating search icon in topbar
- Results show: title, section, excerpt with highlighted match
- Click or Enter navigates to page

---

## 9. Copy Page Behavior

### Copy Full Page

**Trigger:** "Copy page" button in DocsPage topbar

**Behavior:**
1. Parse current page markdown content (strip frontmatter)
2. Convert to clean markdown format
3. Copy to clipboard via `navigator.clipboard.writeText()`
4. Show toast confirmation: "Page copied to clipboard"

**Format:**
```markdown
# Page Title

## Overview
Content without frontmatter...

## Step-by-Step Usage
...
```

### Copy Code Block

**Trigger:** Copy button on each `<pre>` block

**Behavior:**
1. Extract code content from the pre element
2. Copy raw text (no language labels)
3. Show toast: "Code copied"

### Copy Code Button Position

- Appears on hover over `<pre>` block (top-right corner)
- Icon: clipboard icon
- Appears on all code blocks regardless of language

### Toast Notifications

Use existing OMZONE toast system (if any) or simple inline notification. Default to clipboard API's built-in feedback if no custom toast exists.

---

## 10. Styling and UX Guidelines

### OMZONE Visual Direction

The docs should feel like a natural extension of the OMZONE brand:
- **Calm** — low visual noise, generous whitespace
- **Premium** — editorial typography, restrained use of color
- **Zen** — clean lines, no clutter, breathing room
- **Editorial** — Playfair Display for headings, magazine-like layouts
- **Spacious** — max-width content areas, room to breathe
- **Mobile-first** — works perfectly on phone and tablet
- **Admin-friendly** — clear hierarchy, efficient navigation

### Typography

| Element | Font | Weight | Size |
|---|---|---|---|
| H1 (page title) | Playfair Display | 700 | 2rem |
| H2 (section) | Playfair Display | 600 | 1.5rem |
| H3 (subsection) | Playfair Display | 600 | 1.25rem |
| Body | Inter | 400 | 1rem |
| Code | JetBrains Mono or Fira Code | 400 | 0.875rem |
| UI labels | Inter | 500 | 0.875rem |

### Color Usage

Follow OMZONE design tokens from `globals.css`:

| Token | Hex | Usage |
|---|---|---|
| `--color-cream` | `#faf8f5` | Page background |
| `--color-charcoal` | `#2c2c2c` | Primary text |
| `--color-sage` | `#7c8c6e` | Accent, links, active states |
| `--color-sage-dark` | `#65755a` | Hover states |
| `--color-warm-gray` | `#f0ece6` | Card backgrounds, sidebar |
| `--color-charcoal-muted` | `#6b6b6b` | Secondary text |

**Link color:** sage with underline on hover  
**Code blocks:** warm-gray background with charcoal text  
**Sidebar active:** sage/10 background with sage-dark text  

### Spacing System

- Page max-width: 720px (content)
- Content padding: 1.5rem mobile, 2rem desktop
- Section spacing: 3rem between major sections
- Paragraph spacing: 1.5rem
- Code block margin: 2rem vertical

### Component Styling

**DocsSidebar:**
- Width: 260px (desktop)
- Background: white with subtle border
- Active item: sage/10 background, sage-dark text
- Section headers: uppercase tracking-wider, 11px

**DocsTopbar:**
- Height: 56px
- Background: cream with bottom border
- Search input: rounded-full, warm-gray background

**DocsTableOfContents:**
- Width: 220px (desktop)
- Sticky position
- H3 headings indented

### No Emojis

OMZONE does not use emojis. Use Lucide icons consistently for all visual indicators.

### Animations

Reuse OMZONE's existing animation tokens:
- `--animate-fade-in` for page transitions
- `--animate-sheet-in-left` for mobile drawer

---

## 11. Implementation Phases

### Phase 1: Audit and Architecture

**Objective:** Finalize the technical plan and directory structure

**Files likely touched:**
- `docs/OMZONE-admin-docs-implementation-plan.md` (this document)
- `docs/docs-plan.md` (original brief — leave as reference)

**Acceptance Criteria:**
- Plan is complete with all 15 sections
- Directory structure defined
- Route structure finalized
- No ambiguity on what gets built

**Test Steps:**
- Review this document
- Confirm directory structure makes sense
- Confirm route patterns are correct

**Mode Handoff:** Documentation Platform → Code mode for Phase 2

---

### Phase 2: Docs Data Model and Content Structure

**Objective:** Create the directory structure, config files, and placeholder content

**Files to create:**
- `src/docs/config/navigation.js` — sidebar nav structure
- `src/docs/config/pages.js` — page registry
- `src/docs/content/` — directory with all section subdirectories
- `src/docs/content/index.md` — landing page
- `src/docs/styles/docs.css` — docs-specific styles
- `src/docs/lib/markdown.js` — parsing utilities
- `src/docs/lib/search.js` — search index builder

**Files to modify:**
- `App.jsx` — add `/help/docs/*` routes (docs layout only, no content yet)
- `src/constants/routes.js` — add `HELP_DOCS` route constant

**Acceptance Criteria:**
- Directory structure exists with empty placeholder pages
- Config files define navigation and page registry
- App.jsx has docs routes that render empty DocsLayout
- Build passes without errors

**Test Steps:**
1. Run `npm run dev`
2. Navigate to `/help/docs`
3. Confirm DocsLayout renders (empty sidebar, empty content area)
4. Verify no console errors

**Mode Handoff:** Code mode builds skeleton → Documentation Writer mode fills content in Phase 5

---

### Phase 3: Documentation Layout and Routing

**Objective:** Build the core UI shell — DocsLayout, DocsSidebar, DocsTopbar

**Files to create:**
- `src/docs/components/DocsLayout.jsx`
- `src/docs/components/DocsSidebar.jsx`
- `src/docs/components/DocsTopbar.jsx`
- `src/docs/components/DocsBreadcrumbs.jsx`
- `src/docs/components/DocsMobileDrawer.jsx`

**Files to modify:**
- `src/docs/styles/docs.css` — layout and component styles

**Acceptance Criteria:**
- DocsLayout renders with sidebar, topbar, and content area
- Sidebar shows all nav sections with expand/collapse
- Mobile: hamburger opens drawer from left
- Breadcrumbs update based on current route
- Theme follows OMZONE design tokens

**Test Steps:**
1. Navigate to `/help/docs/catalog/experiences/creating`
2. Verify sidebar shows "Catalog > Experiences > Creating"
3. Resize to mobile — confirm drawer behavior
4. Check all sections are visible in sidebar

**Mode Handoff:** Code mode owns this phase

---

### Phase 4: Markdown/Rendering Support

**Objective:** Add markdown parsing, content loading, and rendering

**Files to create:**
- `src/docs/components/DocsPage.jsx` — content renderer
- `src/docs/components/DocsTableOfContents.jsx` — right-side TOC
- `src/docs/components/DocsPrevNext.jsx` — bottom navigation
- `src/docs/components/DocsNotFound.jsx`
- `src/docs/components/DocsEmptyState.jsx`
- `src/docs/lib/markdown.js` — remark/rehype plugins setup

**Packages to add:**
```bash
npm install react-markdown remark-gfm rehype-highlight
```

**Files to modify:**
- `src/docs/config/pages.js` — add content loading logic
- `src/docs/styles/docs.css` — markdown content styles

**Acceptance Criteria:**
- Markdown files in `src/docs/content/` render as HTML
- Headings generate IDs for anchor links
- Code blocks have syntax highlighting
- Tables render correctly (GFM)
- Prev/Next navigation works between pages

**Test Steps:**
1. Navigate to a docs page
2. Verify markdown renders correctly (headers, lists, code, tables)
3. Click heading in TOC — scrolls to section
4. Click Prev/Next — navigates between pages

**Mode Handoff:** Code mode owns this phase

---

### Phase 5: Initial Manual Pages

**Objective:** Write the actual documentation content for required pages

**Pages to write (Priority order):**
1. `getting-started/admin-panel-overview.md` (required)
2. `getting-started/roles-and-access.md` (required)
3. `catalog/experiences/index.md` (required)
4. `catalog/experiences/creating.md` (required)
5. `catalog/experiences/editions.md` (required)
6. `catalog/experiences/pricing.md` (required)
7. `catalog/experiences/slots.md` (required)
8. `sales/assisted-sale.md` (required — complex workflow)
9. `catalog/passes/consumption.md` (required — complex flow)
10. `reference/workflow-complete-experience.md` (required — key workflow)
11. `reference/common-mistakes.md` (required — prevent errors)
12. `reference/data-dictionary.md` (required — entity reference)

**Files to inspect first:**
- `src/pages/admin/ExperienceCreatePage.jsx`
- `src/pages/admin/ExperienceEditPage.jsx`
- `src/pages/admin/sales/AssistedSalePage.jsx`
- `src/pages/admin/PassListPage.jsx`
- `src/pages/admin/UserPassDetailPage.jsx`
- `src/pages/admin/BookingRequestListPage.jsx`
- `src/pages/admin/PublicationSectionsPage.jsx`
- `src/i18n/es/admin.json` (for field labels)

**Acceptance Criteria:**
- All required pages have complete content
- Content matches actual admin panel behavior
- Field descriptions are accurate
- Step-by-step instructions work

**Test Steps:**
1. Read each page for accuracy
2. Follow step-by-step instructions in actual admin panel
3. Verify field descriptions match forms
4. Check no contradictory information

**Mode Handoff:** Documentation Writer mode owns content writing. Code mode handles any structural fixes.

---

### Phase 6: Search and Copy Features

**Objective:** Add search and copy-to-clipboard functionality

**Files to create:**
- `src/docs/components/DocsSearch.jsx` — search modal
- `src/docs/components/DocsCopyPageButton.jsx`
- `src/docs/components/DocsCopyCodeButton.jsx`
- `src/docs/hooks/useDocsSearch.js`
- `src/docs/hooks/useCopyPage.js`
- `src/docs/lib/search-index.json` (generated at build)
- `src/docs/lib/build-search-index.js` (build script)

**Files to modify:**
- `DocsLayout.jsx` — add search modal
- `DocsPage.jsx` — add copy buttons
- `App.jsx` — add Cmd+K shortcut handler

**Search Index Generation:**
```javascript
// build-search-index.js
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

function buildIndex() {
  // Read all .md files
  // Extract frontmatter + content excerpt
  // Write to search-index.json
}
```

**Acceptance Criteria:**
- Cmd/Ctrl+K opens search modal
- Typing shows filtered results
- Enter or click navigates to page
- "Copy page" button copies markdown to clipboard
- Copy code button works on all code blocks
- Toast confirms copy action

**Test Steps:**
1. Press Cmd+K — search modal opens
2. Type "experience" — results appear
3. Press Enter — navigates to experience page
4. Click "Copy page" — clipboard has markdown
5. Hover code block — copy button appears
6. Click copy — code copied, toast shown

**Mode Handoff:** Code mode owns this phase

---

### Phase 7: Responsive Polish

**Objective:** Ensure perfect mobile/tablet experience

**Files to modify:**
- `src/docs/components/DocsSidebar.jsx` — hide on mobile
- `src/docs/components/DocsMobileDrawer.jsx` — full mobile nav
- `src/docs/components/DocsTopbar.jsx` — hamburger menu
- `src/docs/components/DocsTableOfContents.jsx` — collapse to button
- `src/docs/styles/docs.css` — responsive breakpoints

**Acceptance Criteria:**
- Mobile (< 768px): sidebar hidden, hamburger opens drawer
- Tablet (768-1024px): sidebar partial, some TOC visible
- Desktop (> 1024px): full sidebar + TOC
- All interactive elements have 44px minimum tap target
- No horizontal scroll at any breakpoint

**Test Steps:**
1. Test on mobile viewport (resize browser)
2. Test on tablet viewport
3. Test touch interactions on drawer
4. Verify no horizontal overflow

**Mode Handoff:** Code mode owns this phase

---

### Phase 8: Review and Validation

**Objective:** Validate complete implementation against plan

**Tasks:**
1. Review all phases for completeness
2. Check navigation hierarchy is correct
3. Verify all required pages have content
4. Test search across all pages
5. Verify copy functionality works
6. Check mobile responsiveness
7. Review styling matches OMZONE brand

**Acceptance Criteria:**
- All 15 plan sections addressed
- All 7 admin sections have documentation
- Search returns relevant results
- Copy works for pages and code blocks
- Mobile experience is complete
- No console errors
- No broken links

**Mode Handoff:** QA/Review. Documentation Platform mode does final validation.

---

## 12. Mode Handoff Plan

### When to Use Each Mode

| Mode | When to Use |
|---|---|
| **Documentation Platform** | Planning, architecture, component design, routing decisions, metadata standards, styling guidelines. Used for creating this plan and validating implementation completeness. |
| **Documentation Writer** | Writing actual markdown content for documentation pages. Inspecting admin pages to write accurate field descriptions and step-by-step guides. Does NOT touch UI code. |
| **Code** | Building React components, routes, styles, search functionality, copy features. Implements the UI shell and interactive features. |
| **Skill Writer** | Not needed for this project. |
| **Orchestrator** | Not needed — task is well-defined and sequential. |

### Mode Transition Sequence

1. **Documentation Platform** → creates this plan
2. **Code** → Phase 2 (skeleton), Phase 3 (layout), Phase 4 (rendering), Phase 6 (search/copy), Phase 7 (responsive)
3. **Documentation Writer** → Phase 5 (content pages)
4. **Documentation Platform** → Phase 8 (validation)
5. **Code** → fixes from validation

### Handoff Prompts

**Code mode prompt for Phase 2:**
> Create the docs directory structure under `src/docs/` with:
> - `src/docs/config/navigation.js` with nav structure
> - `src/docs/config/pages.js` with page registry
> - `src/docs/content/` with all section subdirectories (empty .gitkeep files)
> - `src/docs/styles/docs.css` with placeholder styles
> - Add docs routes to App.jsx under `/help/docs/*` using lazy loading with DocsLayout (placeholder)
> - Add HELP_DOCS route constant to `src/constants/routes.js`
> Do NOT write any content pages yet.

**Documentation Writer mode prompt for Phase 5:**
> Write documentation pages for the following slugs. Use the page template standard from the implementation plan. Content must be based on inspecting the actual admin page source files.
> Pages: [list from Phase 5]

---

## 13. Initial Documentation Page List

### Getting Started (3 pages)

| Slug | Title | Purpose | Priority | Source Files |
|---|---|---|---|---|
| `admin-panel-overview` | Admin Panel Overview | Introduction to the admin panel, its purpose, and how to access it | required | `AdminLayout.jsx`, `AdminSidebar.jsx` |
| `roles-and-access` | Roles and Access Levels | Explain admin, operator, root labels and what each can access | required | `src/constants/roles.js`, `src/routes/guards.jsx` |
| `navigation-guide` | Navigation Guide | How to use the sidebar, breadcrumbs, and find pages | recommended | `AdminSidebar.jsx`, `Breadcrumbs.jsx` |

### Catalog — Experiences (6 pages)

| Slug | Title | Purpose | Priority | Source Files |
|---|---|---|---|---|
| `experiences/index` | Experiences | Overview of the experiences module | required | `ExperienceListPage.jsx` |
| `experiences/creating` | Creating an Experience | Step-by-step for new experience | required | `ExperienceCreatePage.jsx`, `ExperienceEditPage.jsx` |
| `experiences/editions` | Managing Editions | How to create and manage editions | required | `EditionListPage.jsx`, `EditionCreatePage.jsx` |
| `experiences/pricing` | Pricing Tiers | Adding and managing pricing | required | `PricingTierListPage.jsx` |
| `experiences/addons` | Assigning Addons | Linking addons to experiences | required | `AddonAssignmentListPage.jsx` |
| `experiences/slots` | Managing Slots | Creating availability/schedules | required | `SlotListPage.jsx`, `SlotCreatePage.jsx` |

### Catalog — Addons, Packages, Passes (5 pages)

| Slug | Title | Purpose | Priority | Source Files |
|---|---|---|---|---|
| `addons/index` | Addons | Overview of addon management | required | `AddonListPage.jsx` |
| `addons/creating` | Creating Addons | How to create standalone and experience-linked addons | required | `AddonCreatePage.jsx`, `AddonEditPage.jsx` |
| `packages/index` | Packages | Overview of package management | required | `PackageListPage.jsx` |
| `packages/creating` | Creating Packages | How to create and manage packages | required | `PackageCreatePage.jsx`, `PackageEditPage.jsx` |
| `passes/consumption` | Pass Consumption Flow | How passes are used and tracked | required | `PassListPage.jsx`, `UserPassDetailPage.jsx`, `consume-pass` function |

### Operations (4 pages)

| Slug | Title | Purpose | Priority | Source Files |
|---|---|---|---|---|
| `agenda` | Agenda / Slots | Global agenda view and slot management | required | `AgendaGlobalPage.jsx`, `SlotListPage.jsx` |
| `resources` | Resources | Managing instructors, equipment, spaces | required | `ResourcesPage.jsx`, `ResourceCreatePage.jsx` |
| `locations-rooms` | Locations and Rooms | Managing physical locations | required | `LocationCreatePage.jsx`, `RoomCreatePage.jsx` |
| `booking-requests` | Booking Requests | Quote-to-conversion workflow | required | `BookingRequestListPage.jsx`, `BookingRequestDetailPage.jsx` |

### Sales (3 pages)

| Slug | Title | Purpose | Priority | Source Files |
|---|---|---|---|---|
| `orders` | Orders | Order management and status | required | `OrderListPage.jsx`, `OrderDetailPage.jsx` |
| `assisted-sale` | Assisted Sale | 7-step wizard walkthrough | required | `AssistedSalePage.jsx` |
| `tickets` | Tickets | Ticket management and QR codes | required | `TicketListPage.jsx`, `TicketDetailPage.jsx` |

### Content (3 pages)

| Slug | Title | Purpose | Priority | Source Files |
|---|---|---|---|---|
| `publications` | Publications | Editorial CMS overview | required | `PublicationListPage.jsx` |
| `sections` | Sections | Section types and content blocks | required | `PublicationSectionsPage.jsx` |
| `media` | Media Manager | Managing images and assets | required | `MediaManagerPage.jsx` |

### System (2 pages)

| Slug | Title | Purpose | Priority | Source Files |
|---|---|---|---|---|
| `clients` | Clients | Client/user management | required | `ClientListPage.jsx`, `ClientDetailPage.jsx` |
| `settings` | Settings | Platform configuration | required | `SettingsPage.jsx` |

### Reference (4 pages)

| Slug | Title | Purpose | Priority | Source Files |
|---|---|---|---|---|
| `data-dictionary` | Data Dictionary | All collection attributes documented | required | `appwrite.json` (all collections) |
| `error-codes` | Error Codes | Admin error codes and solutions | recommended | (not yet written — identify from testing) |
| `workflow-complete-experience` | Complete Experience Workflow | End-to-end walkthrough | required | (synthesize from all experience-related pages) |
| `common-mistakes` | Common Mistakes | Top errors and how to avoid | required | (based on Phase 1 audit gaps) |

### Future Pages (Not implemented in Phase 1-8)

| Slug | Title | Purpose | Priority |
|---|---|---|---|
| `stripe-integration` | Stripe Integration | Payment setup and webhook handling | future |
| `i18n-guide` | Internationalization Guide | EN/ES content management | future |
| `seo-guide` | SEO Best Practices | Meta tags, sitemaps, og images | future |
| `check-in流程` | Check-in Process | QR scanning and ticket validation | future |
| `notification-templates` | Notification Templates | Email/SMS template management | future |

---

## 14. Risks and Decisions

### Decision 1: Markdown vs React Content

**Decision: Markdown files**

**Rationale:** 
- Content writers don't need to touch React code
- Updates don't require rebuilds (for static deploy)
- Standard format with tooling support
- Easier to migrate to MDX later if needed

**Risk:** Markdown parsing adds runtime dependency  
**Mitigation:** Keep parsing lightweight with react-markdown only

---

### Decision 2: Static Search vs AI Search

**Decision: Static search first, AI upgrade later**

**Rationale:**
- Works offline, no external dependencies
- Can be implemented immediately
- Upgrade path is clear (same interface, different backend)

**Risk:** Basic keyword matching may not find all relevant results  
**Mitigation:** Add keyword field to frontmatter for better matching

---

### Decision 3: `/help/docs` vs `/docs`

**Decision: `/help/docs`**

**Rationale:**
- Keeps docs under admin help umbrella
- `/docs` might conflict with public-facing documentation (future)
- Clear hierarchy: `/help` → `/help/docs`

---

### Decision 4: Public vs Protected Route

**Decision: Admin-only (protected)**

**Rationale:**
- Documentation is for internal admin/operator use
- Content may reveal system structure
- No external audience identified

**Risk:** If docs need to go public later, need to restructure  
**Mitigation:** Document this decision clearly

---

### Decision 5: i18n Now vs Later

**Decision: English only initially, Spanish structure in labels**

**Rationale:**
- Phase 1 content is in English
- Admin panel uses i18n labels — docs can use same pattern
- Adding EN/ES toggle adds complexity

**Risk:** Spanish-speaking operators may need Spanish docs  
**Mitigation:** Structure allows adding `es/` subdirectory later with same page slugs

---

### Decision 6: Generated from Code vs Manually Curated

**Decision: Manually curated**

**Rationale:**
- Admin pages change frequently — generated docs would be stale
- Curated docs can provide context and workflow guidance
- Code inspection happens during writing, not automatically

**Risk:** Content may drift from actual UI over time  
**Mitigation:** Include `lastUpdated` in frontmatter; periodic review process

---

### Decision 7: Content Storage Format

**Decision: Markdown files with YAML frontmatter**

**Rationale:**
- Industry standard for documentation
- Easy to parse with gray-matter
- Supports rich content (code, tables, headings)

**Risk:** No built-in i18n support  
**Mitigation:** Frontmatter has `titleEs`, `titleEn` fields if needed

---

## 15. Final Deliverable

### Recommended First Implementation Task Prompt

**For Code Mode — Phase 2:**

```
Create the documentation platform skeleton for OMZONE admin panel under src/docs/.

## Deliverables

1. **Directory structure:**
   - src/docs/config/navigation.js
   - src/docs/config/pages.js  
   - src/docs/content/ with subdirectories: getting-started, catalog/experiences, catalog/addons, catalog/packages, catalog/passes, operations, sales, content, system, reference
   - src/docs/styles/docs.css (placeholder)

2. **Config: navigation.js**
   Create DOCS_NAVIGATION array with 7 sections:
   - getting-started (icon: BookOpen)
   - catalog (icon: Sparkles) 
   - operations (icon: CalendarDays)
   - sales (icon: ShoppingCart)
   - content (icon: FileText)
   - system (icon: Settings)
   - reference (icon: Book)
   Each section has label, icon, order, and items array with slug and label.

3. **Config: pages.js**
   Create DOCS_PAGES registry that exports page metadata for all planned docs pages.
   Include: slug, title, section, order, file path.

4. **Routes in App.jsx:**
   - Add HELP_DOCS = "/help/docs" to routes.js
   - Add DocsLayout lazy import
   - Add route: <Route path="/help/docs/*" element={<DocsLayout />} />
   DocsLayout should render:
   - A topbar with "OMZONE Help" title
   - An empty sidebar (placeholder)
   - An Outlet for content

5. **Styling:**
   In docs.css, use OMZONE design tokens. Min-height 100dvh. Background cream. Sidebar white with border.

## What NOT to do
- Do NOT write any markdown content files
- Do NOT implement search yet
- Do NOT implement copy functionality
- Do NOT build the full DocsSidebar component — placeholder div is fine

## Design Tokens to Use
From globals.css: cream (#faf8f5), warm-gray (#f0ece6), sage (#7c8c6e), charcoal (#2c2c2c), charcoal-muted (#6b6b6b). Font: Playfair Display for headings, Inter for body.
```

---

### Summary

This implementation plan defines:
- **Architecture:** Markdown content with React rendering shell
- **Routes:** `/help/docs/*` with standalone DocsLayout
- **Navigation:** 7 sections mirroring admin sidebar + Getting Started + Reference
- **Components:** 13 UI components for layout, search, copy, navigation
- **Content:** 30+ documentation pages across 7 sections
- **Styling:** OMZONE design tokens, editorial typography, mobile-first
- **Search:** Local static index first, MiniMax AI upgrade path defined
- **Phases:** 8 sequential phases from skeleton to validation

The plan is conservative — no features beyond what was requested, no rewrites of existing code, no AI implementation in Phase 1. Each phase is independently testable and can be handed off to the appropriate mode.

---

*Document created by Documentation Platform mode — Phase 2 Implementation Planning*