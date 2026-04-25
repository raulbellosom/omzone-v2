# OMZONE Documentation Enhancement Plan

## 1. Executive Summary

### Current Documentation State

The existing admin documentation in `/src/docs/content/` provides foundational coverage for OMZONE's admin interface but lacks the depth required for comprehensive understanding of user flows, field relationships, and system behavior.

**Existing Coverage:**
- Basic UI structure and navigation
- Database schema overview (appwrite.json)
- Field listings with types and descriptions
- Simple status flow diagrams

**Critical Gaps Identified:**

| Gap Category | Impact | Severity |
|--------------|--------|----------|
| Complete user flows | High | Admin cannot efficiently perform complex operations |
| Detailed form field explanations | High | Incorrect configurations leading to broken checkouts |
| Field interdependencies | Critical | Invalid combinations cause system errors |
| Order status matrix | High | Unclear payment vs order status relationships |
| Decision trees | Medium | Admin不了解何时使用不同sale modes |
| Intentional vs bugs | Low | Confusion about expected behavior |

### Scope of Enhancement Work

This plan covers documentation enhancements for:

1. **Experience Management** - 22 form fields across 6 sections
2. **Orders Section** - Status relationships and transition rules
3. **Publications Workflow** - Editorial content creation and linking
4. **Decision Trees** - Cross-feature interaction flows

---

## 2. Documentation Map

### Feature Area Coverage Matrix

| Feature Area | Current Coverage | Required Enhancements | Priority |
|--------------|------------------|----------------------|----------|
| Experience Form - Identity | Partial (basic fields listed) | Field-by-field with impact analysis | Critical |
| Experience Form - Classification | Partial (options listed) | Valid/invalid combinations, checkout impact | Critical |
| Experience Form - Description | Minimal | Bilingual handling, SEO impact | Medium |
| Experience Form - Media | Minimal | Gallery behavior, recommendations | Medium |
| Experience Form - Behavior | Minimal | Toggle dependencies | High |
| Experience Form - Publication | Minimal | Status transition implications | High |
| Experience Form - SEO | None | Meta tag best practices | Low |
| Orders - Status Flow | Basic (text diagram) | Complete state machine, admin vs system actions | Critical |
| Orders - Payment Status | None | Payment vs order status matrix | Critical |
| Orders - Transitions | None | Decision tree for transitions | High |
| Publications - Creation | None | When/how to create publications | High |
| Publications - Linking | None | Experience linking behavior | High |
| Publications - Sections | None | Section types and usage | Medium |

---

## 3. Experience Management Enhancement

### 3.1 Identity Section

**Fields in Scope:**
- `name` (internal name)
- `publicName` (English public name)
- `publicNameEs` (Spanish public name)
- `slug` (URL identifier)

#### `name` Field

| Attribute | Value |
|-----------|-------|
| Type | string |
| Required | Yes |
| Max Length | 255 |
| Visible to Customers | No |

**Documentation Requirements:**
- Internal-only identifier for admin reference
- Does NOT appear in any public-facing pages
- Used in admin lists and internal reports
- No impact on SEO, checkout flow, or customer communications

#### `publicName` Field

| Attribute | Value |
|-----------|-------|
| Type | string |
| Required | Yes |
| Max Length | 255 |
| Visible to Customers | Yes (English) |

**Documentation Requirements:**
- Primary customer-facing name in English
- Displayed in experience listings, detail pages, checkout
- Used in confirmation emails and tickets
- Auto-generates `slug` when field is first filled and slug is empty

**Impact Analysis:**
```
publicName → slug (auto-generate on first fill if slug empty)
publicName → Experience listing title
publicName → Checkout page header
publicName → Email confirmations
publicName → Ticket name (if generatesTickets=true)
```

#### `publicNameEs` Field

| Attribute | Value |
|-----------|-------|
| Type | string |
| Required | No |
| Max Length | 255 |
| Visible to Customers | Yes (Spanish locale) |

**Documentation Requirements:**
- Spanish translation of public name
- Only displayed when user locale is `es-MX` or `es`
- Falls back to `publicName` if empty

**Impact Analysis:**
```
publicNameEs → Spanish listing title (locale=es)
publicNameEs → Spanish checkout header (locale=es)
publicNameEs → Spanish confirmation email (locale=es)
```

#### `slug` Field

| Attribute | Value |
|-----------|-------|
| Type | string |
| Required | Yes |
| Pattern | lowercase letters, numbers, hyphens |
| Constraint | Must be unique across all experiences |

**Documentation Requirements:**
- URL-friendly identifier
- Auto-generated from `publicName` when first created (if empty)
- Once set, CAN be changed but changes URL (breaks existing links)
- Cannot conflict with publication slugs
- Shown in browser address bar

**Impact Analysis:**
```
slug → URL structure: /experiences/{slug}
slug → Must not conflict with /{slug} for publications
slug → Changing breaks existing bookmarks/links
slug → Used for canonical URLs in SEO
```

**Valid/Invalid Combinations:**
| Scenario | Valid? | Notes |
|----------|--------|-------|
| slug = "yoga-session" | Yes | Standard format |
| slug = "yoga Session" | No | Contains uppercase and space |
| slug = "yoga%session" | No | Contains invalid character |
| slug = existing-publication-slug | No | Slugs must be unique across experiences AND publications |

---

### 3.2 Classification Section

**Fields in Scope:**
- `type` (experience type)
- `saleMode` (how customers purchase)
- `fulfillmentType` (what customers receive)

#### `type` Field

| Attribute | Value |
|-----------|-------|
| Type | enum |
| Required | Yes |
| Options | session, immersion, retreat, stay, private, package |

**Detailed Options Analysis:**

| Type | Description | Typical Duration | Listing Display |
|------|-------------|------------------|-----------------|
| `session` | Individual yoga or wellness session | 1-2 hours | "Session" badge |
| `immersion` | Multi-hour intensive experience | 3-8 hours | "Immersion" badge |
| `retreat` | Extended program spanning days | 1-14 days | "Retreat" badge |
| `stay` | Accommodation-based experience | 1+ nights | "Stay" badge |
| `private` | One-on-one or exclusive group | Variable | "Private" badge |
| `package` | Bundled experiences combined | Variable | "Package" badge |

**Documentation Requirements:**
- Classification badge appears on experience cards
- Does NOT affect functionality (no gates based on type)
- Purely organizational/customer communication
- Can be combined with any saleMode and fulfillmentType

**Impact Analysis:**
```
type → Classification badge in listings
type → Filtering options in admin
type → No functional gates or restrictions
type → Customer expectation setting
```

#### `saleMode` Field

| Attribute | Value |
|-----------|-------|
| Type | enum |
| Required | Yes |
| Options | direct, request, assisted, pass |

**Detailed Options Analysis:**

| Mode | Checkout Behavior | Admin Involvement | Stripe Integration |
|------|-------------------|-------------------|-------------------|
| `direct` | Immediate purchase | None | Yes - Stripe Checkout |
| `request` | Customer submits request | Admin reviews and quotes | No - manual follow-up |
| `assisted` | Admin creates order | Full wizard-driven | Yes - admin initiates |
| `pass` | Uses existing credits | None | No - credit redemption |

**Critical Relationship with `fulfillmentType`:**

| Sale Mode | Valid Fulfillment Types | Invalid Combinations | Reason |
|-----------|------------------------|---------------------|--------|
| `direct` | ticket, booking, package | pass | Pass mode requires existing credits |
| `request` | ticket, booking, pass, package | - | Admin quotes manually |
| `assisted` | ticket, booking, pass, package | - | Full flexibility for admin |
| `pass` | pass | ticket, booking, package | Pass credits are consumed, not purchased |

**Decision Tree for Sale Mode Selection:**

```
Does customer purchase online without admin involvement?
├── YES → Does customer use existing credits?
│         ├── YES → saleMode = "pass", fulfillmentType = "pass"
│         └── NO → saleMode = "direct", fulfillmentType = "ticket" or "booking" or "package"
└── NO → Does customer submit request and admin quotes?
          ├── YES → saleMode = "request", fulfillmentType = any
          └── NO → saleMode = "assisted", fulfillmentType = any
```

**Checkout Flow Impact:**

| saleMode | Checkout UI Changes |
|----------|---------------------|
| `direct` | Full checkout with Stripe payment |
| `request` | "Request Booking" button instead of "Book Now", no payment |
| `assisted` | Not available for self-service (admin creates via wizard) |
| `pass` | "Redeem Pass" button, enters pass code or selects from owned passes |

#### `fulfillmentType` Field

| Attribute | Value |
|-----------|-------|
| Type | enum |
| Required | Yes |
| Options | ticket, booking, pass, package |

**Detailed Options Analysis:**

| Fulfillment | What Customer Receives | Ticket Generated? | Check-in Required? |
|-------------|------------------------|-------------------|-------------------|
| `ticket` | QR-coded ticket with unique ID | Yes | Yes (validate ticket) |
| `booking` | Confirmation email only | No | No (honor system) |
| `pass` | Credit deducted from pass | No | Yes (consume pass) |
| `package` | Ticket(s) for bundled items | Yes (per item) | Yes (validate tickets) |

**Critical Constraints:**

| Constraint | Description |
|------------|-------------|
| `generatesTickets` dependency | When `fulfillmentType` = "ticket" or "package", `generatesTickets` should typically be `true` |
| `requiresSchedule` compatibility | For "ticket" fulfillment, `requiresSchedule` should typically be `true` |
| Multiple attendees | When `allowQuantity` = `true`, ticket generates ONE ticket with quantity, not multiple tickets |

**Invalid Combinations and Explanations:**

| Combination | Error/Issue | Why Invalid |
|-------------|-------------|-------------|
| saleMode="direct" + fulfillmentType="pass" | Stripe checkout doesn't handle pass redemption | Customer cannot pay AND redeem credits simultaneously |
| fulfillmentType="ticket" + generatesTickets=false | Conflicting settings | Ticket fulfillment implies ticket generation |
| saleMode="pass" + fulfillmentType="ticket" | Payment flow mismatch | Pass credits are consumed, not purchased with money |

---

### 3.3 Description Section

**Fields in Scope:**
- `shortDescription` (English)
- `shortDescriptionEs` (Spanish)
- `longDescription` (English)
- `longDescriptionEs` (Spanish)

**Documentation Requirements:**

| Field | Max Length | Display Location | Fallback Behavior |
|-------|------------|-------------------|-------------------|
| `shortDescription` | 500 chars | Experience card, above fold of detail page | Uses `longDescription` truncated if empty |
| `shortDescriptionEs` | 500 chars | Spanish experience card, above fold (locale=es) | Falls back to `shortDescription` |
| `longDescription` | 5,000 chars | Below fold on detail page | Uses `shortDescription` extended if empty |
| `longDescriptionEs` | 5,000 chars | Below fold on detail page (locale=es) | Falls back to `longDescription` |

**Bilingual Handling Decision Tree:**

```
Display language = English (locale starts with "en")
├── shortDescriptionEs empty? → Display shortDescription
└── shortDescriptionEs filled? → Display shortDescriptionEs

Display language = Spanish (locale starts with "es")
├── shortDescriptionEs empty? → Display shortDescription (English fallback)
└── shortDescriptionEs filled? → Display shortDescriptionEs
```

**SEO Impact:**
- Short description may be used as meta description fallback
- Long description contributes to page content SEO
- No automatic truncation for SEO; ensure first 155 chars are compelling

---

### 3.4 Cover/Gallery Section

**Fields in Scope:**
- `heroImageId` (cover image)
- `galleryImageIds` (additional images)

**Documentation Requirements:**

| Field | Type | Max Count | Display | Recommendations |
|-------|------|----------|---------|-----------------|
| `heroImageId` | file | 1 | Experience card background, detail page hero | 1920x1080 or larger, JPG/WebP |
| `galleryImageIds` | file[] | 10 | Gallery carousel on detail page | Consistent aspect ratio, 1200px+ width |

**Behavior Analysis:**
- Hero image shows as background on experience card with text overlay
- Gallery shows as clickable carousel on detail page
- Removing hero image leaves placeholder (no auto-fallback to gallery[0])
- Gallery is ordered array; first image is NOT used as fallback for hero

**Impact on Checkout:**
- No direct impact on checkout flow
- Images are for presentation only

---

### 3.5 Behavior Section

**Fields in Scope:**
- `requiresSchedule` (boolean)
- `requiresDate` (boolean)
- `allowQuantity` (boolean)
- `minQuantity` / `maxQuantity` (integers)
- `generatesTickets` (boolean)

**Toggle Dependencies and Combinations:**

| Toggle | Default | When Enabled | When Disabled |
|--------|---------|--------------|---------------|
| `requiresSchedule` | false | Customer must select specific date+time slot | Customer selects date only or no date |
| `requiresDate` | false | Customer must select a date | No date selection required |
| `allowQuantity` | false | Multiple attendees allowed | Single ticket per order |
| `generatesTickets` | true | QR tickets generated after purchase | No ticket generation |

**Decision Tree for Scheduling Configuration:**

```
Experience has fixed time slots that customers must book?
├── YES → requiresSchedule = true
└── NO → Does experience happen on specific dates but not times?
          ├── YES → requiresDate = true
          └── NO → Both false (open timing or appointment-based)
```

**Decision Tree for Quantity Configuration:**

```
Can multiple people use the same booking?
├── YES → allowQuantity = true
│        └── Set minQuantity and maxQuantity
└── NO → allowQuantity = false
         └── minQuantity and maxQuantity ignored
```

**Quantity Behavior Impact:**

| allowQuantity | minQuantity | maxQuantity | Behavior |
|---------------|--------------|--------------|----------|
| false | - | - | Exactly 1 ticket per order |
| true | empty | empty | 1 to unlimited per order |
| true | 2 | empty | Minimum 2, no maximum |
| true | empty | 5 | Maximum 5, minimum 1 |
| true | 2 | 5 | Minimum 2, maximum 5 |

**Ticket Generation Relationship:**

| generatesTickets | fulfillmentType | Expected Behavior |
|------------------|-----------------|-------------------|
| true | ticket | QR ticket generated with unique code |
| true | booking | Ticket generated (should use "booking" instead) |
| false | ticket | No ticket generated (may be inconsistent) |
| false | booking | No ticket (correct for booking type) |
| true/false | pass | No ticket generated (pass consumption separate) |
| true/false | package | Ticket generated per package item |

---

### 3.6 Publication Status Section

**Fields in Scope:**
- `status` (draft, published, archived)
- `sortOrder` (display order)

**Status Lifecycle Diagram:**

```
┌─────────┐     publish      ┌───────────┐     archive     ┌──────────┐
│  DRAFT  │ ───────────────► │ PUBLISHED │ ──────────────► │ ARCHIVED │
└─────────┘                  └───────────┘                  └──────────┘
     ▲                           │                              │
     │         unpublish         │         return to draft      │
     └───────────────────────────┴──────────────────────────────┘
```

**Status Impact Analysis:**

| Status | Public Listing | Booking Available | Can Edit | Can Delete |
|--------|----------------|-------------------|----------|------------|
| `draft` | No | No | Yes | Yes |
| `published` | Yes | Yes (if pricing exists) | Yes | No |
| `archived` | No | No | Yes | No |

**Important Constraint:**
- An experience in `published` status can be moved to `archived` but NOT deleted
- Deleting requires first moving to `draft`
- Archived experiences can be returned to `draft` for editing, then re-published

**Sort Order Behavior:**
- Lower numbers appear first in listings
- Default is empty (treated as 0 or last position)
- Same sort order results in alphabetical tiebreaker by publicName

---

### 3.7 SEO Section

**Fields in Scope:**
- `seoTitle`
- `seoDescription`

**Documentation Requirements:**

| Field | Max Length | Purpose | Fallback When Empty |
|-------|------------|---------|---------------------|
| `seoTitle` | 255 chars | Custom page title for search engines | Uses `publicName` |
| `seoDescription` | 500 chars | Meta description for search engines | Uses first 155 chars of `shortDescription` or `longDescription` |

**Best Practices:**
- seoTitle should be compelling and include key terms
- seoDescription should include call-to-action
- Both should be unique per page (no duplicate meta tags)

---

## 4. Orders Section Enhancement

### 4.1 Order Status Values

**Order Status Enum:**
```
pending → paid → confirmed → completed
                   ↓
              cancelled → refunded
```

| Status | Description | Admin Can Modify? | System Transitions To |
|--------|-------------|-------------------|----------------------|
| `pending` | Order created, awaiting payment | Yes (cancel) | paid (payment confirmed) |
| `paid` | Payment confirmed, ready for fulfillment | Yes (cancel) | confirmed (tickets generated) |
| `confirmed` | Fulfillment started (tickets/pass activated) | No (auto) | completed (consumed) or cancelled |
| `completed` | All items fulfilled and consumed | No | - (terminal state) |
| `cancelled` | Order cancelled before completion | Yes (refund if paid) | refunded (if payment captured) |
| `refunded` | Payment refunded | No | - (terminal state) |

### 4.2 Payment Status Values

**Payment Status Enum:**
```
pending → processing → succeeded
                          ↓
                    failed ←→ refunded
```

| Status | Description | Stripe Integration |
|--------|-------------|-------------------|
| `pending` | Checkout initiated, no payment attempt | Stripe Checkout session created |
| `processing` | Stripe processing payment | Payment intent in flight |
| `succeeded` | Payment captured successfully | Payment intent succeeded |
| `failed` | Payment declined or error | Payment intent failed |
| `refunded` | Payment returned to customer | Refund issued via Stripe |

### 4.3 Status Matrix

**Valid Order Status + Payment Status Combinations:**

| Order Status | Valid Payment Statuses | Notes |
|--------------|----------------------|-------|
| `pending` | `pending`, `processing`, `failed` | Payment not yet confirmed |
| `paid` | `succeeded` | Payment captured |
| `confirmed` | `succeeded` | Payment complete, fulfilling |
| `completed` | `succeeded` | Fully consumed |
| `cancelled` | `succeeded`, `refunded` | May have payment to refund |
| `refunded` | `refunded` | Payment returned |

**Invalid Combinations (Should Not Occur):**

| Invalid Combination | Reason |
|---------------------|--------|
| orderStatus="pending" + paymentStatus="succeeded" | Payment succeeded should move order to "paid" |
| orderStatus="paid" + paymentStatus="pending" | Order should not be "paid" without successful payment |
| orderStatus="cancelled" + paymentStatus="processing" | Cannot cancel while payment still processing |

### 4.4 Admin Actions per Status

| Current Status | Available Actions | Effect |
|---------------|-------------------|--------|
| `pending` | Cancel | orderStatus → cancelled |
| `pending` | (auto) Payment confirmed | orderStatus → paid, paymentStatus → succeeded |
| `paid` | Cancel | orderStatus → cancelled, may trigger refund |
| `paid` | (auto) Fulfillment triggered | orderStatus → confirmed |
| `confirmed` | (auto) All consumed | orderStatus → completed |
| `confirmed` | Cancel (admin override) | orderStatus → cancelled, refunds if applicable |
| `completed` | Issue refund | paymentStatus → refunded (outside order flow) |
| `cancelled` | Issue refund | paymentStatus → refunded |
| `refunded` | None | Terminal state |

### 4.5 System Actions per Status

**Automatic Transitions:**

| Trigger | From Status | To Status | Side Effects |
|---------|-------------|-----------|--------------|
| Stripe webhook: payment_intent.succeeded | pending | paid | Record payment, update timestamps |
| create-checkout function: fulfillment ready | paid | confirmed | Generate tickets, activate pass |
| validate-ticket function: all consumed | confirmed | completed | Mark order complete |
| Admin cancel action | pending, paid | cancelled | Release slot capacity |
| stripe-webhook function: refund created | cancelled, completed | refunded | Record refund |

### 4.6 Order Status Flow Diagram

```
                                    ┌─────────────────────────────────────┐
                                    │                                     │
                                    ▼                                     │
┌─────────┐    payment succeeded    ┌─────┐    fulfillment triggered     ┌───────────┐    all consumed    ┌───────────┐
│ PENDING │ ──────────────────────► │ PAID │ ───────────────────────────► │ CONFIRMED │ ──────────────────► │ COMPLETED │
└─────────┘                         └─────┘                              └───────────┘                     └───────────┘
     │                                     │                                     │
     │ cancel                              │ cancel                              │
     ▼                                     ▼                                     ▼
┌───────────┐                         ┌───────────┐                         ┌───────────┐
│ CANCELLED │ ◄────────────────────── │ CANCELLED │                         │ CANCELLED │
└───────────┘                         └───────────┘                         └───────────┘
     │                                     │                                     │
     │ refund (if paid)                    │ refund (if paid)                    │
     ▼                                     ▼                                     │
┌──────────┐                         ┌──────────┐                              │
│ REFUNDED │                         │ REFUNDED │ ──────────────────────────────┘
└──────────┘                         └──────────┘
```

---

## 5. Content Publishing Flow

### 5.1 Publication Creation Decision Tree

```
Need to create editorial content that is NOT a direct purchase link?
├── YES → Create Publication
│        ├── Is this a landing page? → category = "landing"
│        ├── Is this a blog post? → category = "blog"
│        ├── Is this a highlight feature? → category = "highlight"
│        ├── Is this institutional content? → category = "institutional"
│        └── Is this an FAQ? → category = "faq"
└── NO → May not need publication (consider experience directly)
```

### 5.2 Publication Categories

| Category | Purpose | Shows in Public Navigation? |
|----------|---------|---------------------------|
| `landing` | Marketing landing pages | No (direct URL access) |
| `blog` | Blog posts/articles | Blog listing (if implemented) |
| `highlight` | Featured experiences/articles | May appear in highlights section |
| `institutional` | About, contact, terms pages | May appear in footer navigation |
| `faq` | Frequently asked questions | FAQ section |

### 5.3 Experience Linking

**When to Link Experience to Publication:**

| Scenario | Link Experience? | Notes |
|----------|-----------------|-------|
| Publication promotes specific experience | Yes | Shows "Book Now" CTA linking to experience |
| Publication is informational only | No | No purchase path |
| Publication is blog/article | Optional | May link for context |

**Link Behavior:**
- `experienceId` field on publication creates the link
- Linked publications display experience pricing and "Book Now" button
- Unlinked publications have no purchase path

### 5.4 Section Types

**Available Section Types:**

| Section Type | Purpose | Content Fields |
|--------------|---------|----------------|
| `hero` | Full-width hero banner | title, mediaIds (image/video) |
| `text` | Rich text content block | title, content (markdown) |
| `gallery` | Image gallery | title, mediaIds |
| `highlights` | Featured items list | title, metadata (JSON) |
| `faq` | Q&A pairs | title, content (Q&A format) |
| `itinerary` | Schedule/timeline | title, content, metadata |
| `testimonials` | Customer quotes | title, content, mediaIds |
| `inclusions` | What's included list | title, content |
| `restrictions` | What's not included | title, content |
| `cta` | Call to action button | title, metadata (link) |
| `video` | Video embed | title, mediaIds (video URL) |

### 5.5 Publication Workflow

```
1. Create Publication
   └── Enter title, slug, category
   
2. Add Sections
   └── Reorder sections via drag-drop or sortOrder
   
3. Link Experience (optional)
   └── Connect to experience for booking CTA
   
4. Set Status
   └── draft → published (when ready)
   
5. Publish
   └── publishedAt timestamp set automatically on publish
```

---

## 6. Known Limitations and Intentional Behavior

### 6.1 Intentional Constraints (Document as Design Decisions)

| Constraint | Expected Behavior | Reasoning |
|------------|------------------|-----------|
| Slug uniqueness across experiences AND publications | Cannot have experience slug="yoga" and publication slug="yoga" | Single URL namespace |
| Status "archived" cannot be deleted | Must return to "draft" before deletion | Prevents accidental data loss |
| Payment status and order status are separate | An order can be "cancelled" with payment "succeeded" (refund pending) | Allows partial state tracking |
| Short description fallback to long description | If shortDescription empty, system doesn't auto-generate from long | Manual control for SEO |
| Hero image no fallback | If heroImageId empty, shows placeholder color | Explicit image selection required |
| Pass saleMode requires fulfillmentType="pass" | Direct purchase and credit redemption cannot coexist | Clear separation of purchase types |

### 6.2 Known Edge Cases

| Edge Case | Current Behavior | Recommended Action |
|-----------|------------------|-------------------|
| Order cancelled after tickets generated | Tickets remain valid until manually invalidated | Admin should void tickets manually |
| Experience unpublished with active orders | Orders continue normally (snapshot preserves data) | Ensure customer communication |
| Slug changed after publication | Old URLs return 404 | Redirect not automatic, must configure |
| Pricing tier deleted after purchase | Order snapshot preserves price | Historical accuracy maintained |

### 6.3 Features with Constraints

| Feature | Constraint | Workaround |
|---------|------------|------------|
| Multiple attendees with single ticket | Ticket shows quantity, not individual names | Require guest info at check-in |
| Gallery order | Array order determines display | Drag-drop to reorder |
| Spanish content fallback | Empty ES field falls back to EN | Always provide translations for best UX |
| Min quantity validation | Only enforced at checkout | Validate before publishing |

---

## 7. Implementation Roadmap

### Phase 1: Critical Gaps (Week 1-2)

| Task | Priority | Deliverable |
|------|----------|-------------|
| Document order status matrix | Critical | Status combination table, flow diagram |
| Document payment status values | Critical | Payment status glossary with Stripe mapping |
| Document admin vs system actions | Critical | Transition matrix by current status |
| Document saleMode + fulfillmentType valid combinations | Critical | Decision tree and validation rules |

### Phase 2: Experience Fields (Week 3-4)

| Task | Priority | Deliverable |
|------|----------|-------------|
| Document identity section fields | High | Field reference with impact analysis |
| Document classification section | High | Valid/invalid combinations, decision tree |
| Document behavior section toggles | High | Toggle dependencies and interaction |
| Document quantity and ticket generation | High | Rules and edge cases |

### Phase 3: Decision Trees (Week 5-6)

| Task | Priority | Deliverable |
|------|----------|-------------|
| Create experience creation decision tree | High | Visual flowchart for field selection |
| Create checkout flow variations by saleMode | High | User journey diagrams |
| Create order transition decision tree | Medium | Admin action guidance |
| Create publication workflow diagram | Medium | Content creation flow |

### Phase 4: Known Limitations (Week 7)

| Task | Priority | Deliverable |
|------|----------|-------------|
| Document intentional constraints | Medium | Design decision log |
| Document known edge cases | Low | Troubleshooting appendix |
| Document behavior section vs bugs | Low | Intentional behavior flags |

---

## 8. Cross-Reference Strategy

### Documentation Linking Convention

Every document should include:

1. **Related Collections** - Database tables that the feature affects
2. **Related Routes** - Admin and public routes
3. **Related Pages** - Links to other documentation pages

### Relationship Map

```
Experience
├── affects → Editions (via experienceId)
├── affects → Pricing Tiers (via experienceId)
├── affects → Addon Assignments (via experienceId)
├── affects → Slots (via experienceId)
├── linked-from → Publications (via experienceId)
└── generates → Orders (via checkout)
└── generates → Tickets (via fulfillment)

Order
├── contains → Order Items (via orderId)
├── contains → Payments (via orderId)
├── affects → Tickets (via orderId)
├── affects → Pass Consumptions (via orderId)
└── derived-from → Snapshot (frozen at purchase)

Publication
├── contains → Sections (via publicationId)
└── links-to → Experience (optional, via experienceId)
```

### Navigation Structure

```
Admin Documentation
├── Getting Started
├── Catalog
│   ├── Experiences ← links to field reference
│   ├── Editions
│   ├── Pricing Tiers
│   ├── Addons
│   ├── Packages
│   └── Passes
├── Content
│   ├── Publications ← links to workflow
│   └── Sections
├── Operations
│   ├── Slots
│   ├── Locations
│   └── Resources
├── Sales
│   ├── Orders ← links to status matrix
│   └── Assisted Sale
├── System
│   ├── Clients
│   ├── Tickets
│   ├── Media
│   └── Settings
└── Reference
    ├── Glossary
    └── Troubleshooting ← includes known limitations
```

---

## 9. Acceptance Criteria

### Documentation Completeness

- [ ] ALL form fields in Experience management have entry
- [ ] ALL order status combinations documented
- [ ] ALL payment status values explained
- [ ] ALL valid/invalid field combinations specified
- [ ] ALL system vs admin action boundaries clear
- [ ] Decision trees cover all major user flows
- [ ] Known limitations section distinguishes intentional vs bugs

### Quality Standards

- [ ] Every field has: name, type, options, impact description
- [ ] Every status has: description, valid transitions, admin actions
- [ ] Every decision tree has: clear starting point, branching logic, outcomes
- [ ] Cross-references use consistent linking format
- [ ] Examples provided for complex fields (slug, quantity settings)

### Implementability

- [ ] Plan is actionable by Documentation Writer mode
- [ ] Each task has clear deliverable
- [ ] Priority assignments enable efficient execution
- [ ] Phases build on each other logically

---

*Document created: 2026-04-25*
*Last updated: 2026-04-25*
*Status: Approved for implementation*