---
title: Introduction to OMZONE Admin
description: Getting started with the OMZONE administrative panel - navigation, concepts, and core workflows
section: getting-started
order: 1
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin
  - /admin/dashboard
  - /help/docs
relatedCollections:
  - user_profiles
keywords:
  - admin
  - getting started
  - navigation
  - concepts
  - workflow
---

# Introduction to OMZONE Admin

The OMZONE Admin panel is your control center for managing the entire wellness platform. From here you control catalog offerings, scheduling, sales, editorial content, and system configuration.

## Accessing the Admin Panel

Access the admin panel by navigating to `/admin` after logging in. You must have one of the following labels assigned to your account:

| Label | Display Name | Access Level |
|-------|--------------|--------------|
| `root` | Admin | Full system access, invisible in listings |
| `admin` | Admin | Full access to all admin features |
| `operator` | Operator | Scheduled access to operations and sales |
| `client` | Client | Portal access only, no admin |

> **Important:** The `root` label is invisible across the platform. Root users never appear in client or order listings, and root is never displayed as a role name. When displaying roles, always use "Admin" for both root and admin labels.

## Admin Navigation Structure

The sidebar contains seven main sections:

### General
- **Dashboard** (`/admin/dashboard`) - Overview of orders, revenue, upcoming slots, and pending requests
- **My Account** (`/admin/account`) - Profile and security settings

### Catalog
- **Experiences** (`/admin/experiences`) - Core wellness offerings (sessions, immersions, retreats, stays)
- **Addons** (`/admin/addons`) - Optional extras that can be attached to experiences
- **Packages** (`/admin/packages`) - Bundled experiences with fixed pricing
- **Passes** (`/admin/passes`) - Consumable credit passes for repeat visits

### Operations
- **Agenda** (`/admin/agenda`) - Global view of all scheduled slots across experiences
- **Resources** (`/admin/resources`) - Instructors, facilitators, therapists, equipment, locations, and rooms

### Sales
- **Requests** (`/admin/booking-requests`) - Incoming booking inquiries for experiences with `saleMode: request`
- **Orders** (`/admin/orders`) - All customer purchases across all channels
- **Tickets** (`/admin/tickets`) - Validatable tickets with QR codes for check-in
- **Clients** (`/admin/clients`) - Registered customer accounts

### Content
- **Publications** (`/admin/publications`) - Editorial and landing page content
- **Media** (`/admin/media`) - File manager for all buckets

### System
- **Settings** (`/admin/settings`) - Notification templates and system configuration

## Core Concept: Publications vs Experiences

A fundamental distinction in OMZONE:

| Aspect | Experience | Publication |
|--------|------------|-------------|
| **Purpose** | Operational, commercial | Editorial, SEO, narrative |
| **Contains** | Pricing tiers, editions, slots | Sections with content blocks |
| **Visibility** | Availability and booking | Landing pages and blog |
| **Links to** | Addons, slots, resources | Experience via `experienceId` |

> **Key Rule:** Pricing tiers belong to **Experiences**, not Publications. Do not add pricing to a Publication. A Publication can link to an Experience, but they are separate entities.

### When to Create Each

**Create an Experience when:**
- You want to sell a wellness offering
- You need pricing and availability management
- You want customers to book or request booking

**Create a Publication when:**
- You need a landing page for SEO
- You want editorial narrative content
- You need blog posts, institutional pages, or FAQs

## Standard Workflow: Adding a New Experience

Follow this sequence when setting up a new experience:

### Step 1: Create the Experience

Navigate to **Catalog -> Experiences -> New experience**

Fill in the core fields:
- **Name** - Internal identifier (not visible to customers)
- **Public name (EN/ES)** - Customer-facing name in both languages
- **Slug** - URL-friendly identifier (auto-generated from public name)
- **Type** - `session`, `immersion`, `retreat`, `stay`, `private`, or `package`
- **Sale mode** - `direct` (book now), `request` (inquiry required), `assisted` (admin creates order), `pass` (credit-based)
- **Fulfillment** - `ticket` (generates QR), `booking` (no ticket), `pass` (credit redemption), `package` (bundle)

Configure behavior toggles:
- **Requires slot** - Enable if specific date/time selection is needed
- **Generates tickets** - Enable to create QR-coded tickets on purchase
- **Allows multiple attendees** - Enable for group bookings with min/max quantity

### Step 2: Add Editions (Optional)

For experiences with multiple date ranges or versions:

Navigate to **Catalog -> Experiences -> [Experience Name] -> Editions -> New edition**

Editions allow:
- Different date ranges with `startDate` and `endDate`
- Registration windows with `registrationOpens` and `registrationCloses`
- Edition-specific capacity limits
- Edition-specific cover images

### Step 3: Add Pricing Tiers

Navigate to **Catalog -> Experiences -> [Experience Name] -> Pricing -> New tier**

Pricing tier fields:
- **Name (EN/ES)** - Tier label (e.g., "Early Bird", "General Admission")
- **Price type** - `fixed`, `per-person`, `per-group`, `from`, `quote`
- **Base price** - Numeric price value
- **Currency** - Three-letter code (e.g., MXN, USD)
- **Badge** - Optional label like "Popular" or "Bestseller"
- **Highlighted** - Show as featured tier
- **Edition** - Optional link to a specific edition

### Step 4: Add Slots (If Required)

Navigate to **Catalog -> Experiences -> [Experience Name] -> Slots -> New slot**

Slot fields:
- **Slot type** - `single_session`, `multi_day`, `retreat_day`, `private`
- **Start/End datetime** - Date and time with timezone
- **Capacity** - Maximum participants
- **Location** - Physical location (from predefined locations)
- **Room** - Specific room within the location
- **Status** - `draft`, `published`, `full`, `cancelled`

For recurring slots, use **Quick Create** to generate multiple slots based on a pattern.

### Step 5: Assign Resources (Optional)

Navigate to **Catalog -> Experiences -> [Experience Name] -> Slots -> [Slot Name] -> Resources**

Resources can be assigned to slots with roles:
- **Lead** - Primary instructor or facilitator
- **Assistant** - Supporting teacher or helper
- **Support** - Technical or logistical support
- **Equipment** - Equipment being used

### Step 6: Assign Addons (Optional)

Navigate to **Catalog -> Experiences -> [Experience Name] -> Addons -> Assign addon**

Addons can be:
- **Required** - Automatically included with the experience
- **Default** - Pre-selected during checkout
- **Optional** - Available but not pre-selected

### Step 7: Create Publication (Optional)

Only create a Publication if you need editorial content visible to the public:

Navigate to **Content -> Publications -> New publication**

Publication fields:
- **Title (EN/ES)** - Public-facing title
- **Slug** - URL identifier
- **Category** - `landing`, `blog`, `highlight`, `institutional`, `faq`
- **Experience** - Optional link to an Experience (does not transfer pricing or slots)

Publication sections are built using modular content blocks:
- `hero`, `text`, `gallery`, `highlights`, `faq`, `itinerary`, `testimonials`, `inclusions`, `restrictions`, `cta`, `video`

## Experience Status Lifecycle

```
draft -> published -> archived
```

| Status | Visibility | Booking |
|--------|------------|---------|
| `draft` | Admin only | Not available |
| `published` | Public catalog | Available for booking |
| `archived` | Admin only | Not available, can be reactivated |

## Sale Mode Behaviors

| Sale Mode | Customer Action | Admin Action |
|-----------|-----------------|--------------|
| `direct` | Book and pay immediately | Review completed orders |
| `request` | Submit inquiry with details | Review request, quote price, convert to order |
| `assisted` | Contact admin directly | Use Assisted Sale wizard to create order |
| `pass` | Use existing pass credits | Monitor pass consumption |

## Fulfillment Types

| Fulfillment | Generates Ticket | Notes |
|-------------|-------------------|-------|
| `ticket` | Yes - QR code | Full check-in workflow |
| `booking` | No | Simple confirmation only |
| `pass` | No | Credit-based redemption |
| `package` | Yes - one per package | Bundle redemption |

## Roles and Permissions Summary

| Action | Root | Admin | Operator | Client |
|--------|------|-------|----------|--------|
| Create Experiences | Yes | Yes | No | No |
| Edit Experiences | Yes | Yes | No | No |
| Create Slots | Yes | Yes | Yes | No |
| View Orders | Yes | Yes | Yes | Own only |
| Create Assisted Sales | Yes | Yes | No | No |
| Manage Resources | Yes | Yes | No | No |
| View Tickets | Yes | Yes | Yes | Own only |
| Check-in Tickets | Yes | Yes | Yes | No |
| Edit Publications | Yes | Yes | No | No |
| Access Settings | Yes | Yes | No | No |

## Getting Help

If you need assistance:
- Use the sidebar navigation to browse documentation sections
- Check the [Reference - Glossary](../reference/glossary) for terminology definitions
- Review [Reference - Troubleshooting](../reference/troubleshooting) for common error solutions