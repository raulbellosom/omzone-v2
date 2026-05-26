---
title: Help & FAQ
description: The public Help and FAQ page on OMZONE — accordion FAQ and quick contact form
section: landing
order: 6
lastUpdated: 2026-05-25
---

# Help & FAQ

The **Help & FAQ** page (`/help`) is a public resource for visitors and clients who have questions or need to get in touch. It combines a searchable accordion FAQ with a quick contact form — no login required.

---

## What's on the page

### FAQ accordion

A list of common questions and answers organized by topic. Each item expands on click to reveal the answer.

FAQ content is managed via **Publications** — any blog publication tagged with `faq` is automatically included. To add or edit FAQ entries, create or update a publication with the `faq` tag and keep it in **Published** status. See [Publications](../admin/publicaciones.md) for how to manage publications and [Sections & Blocks](../admin/secciones-y-bloques.md) for editing their content.

The page includes JSON-LD structured data (`schema.org/FAQPage`) for SEO, which helps answers appear directly in Google search results.

### Quick contact form

Below the FAQ section is an embedded contact form for visitors who didn't find an answer:

| Field                        | Required | Description                         |
| ---------------------------- | -------- | ----------------------------------- |
| **Name**                     | ✅       | Sender's full name                  |
| **Email**                    | ✅       | Contact email                       |
| **Topic**                    | ✅       | What the question or issue is about |
| **Phone**                    | —        | Optional phone number               |
| **Message**                  | ✅       | The full message                    |
| **Preferred contact method** | —        | email, call, or WhatsApp            |

A **reCAPTCHA v2** checkbox is required to submit.

---

## How submissions are routed

Submissions from the quick contact form are sent via the `submit-contact` Appwrite Function and land in **Contact Messages** in the admin panel. The category assigned depends on the context:

- Submissions from the FAQ page default to category **FAQ**.
- If the user describes a problem, they may select **Support**.

All submissions are visible in the admin **Mensajes** inbox. See [Contact Messages](../admin/mensajes.md).

---

## Seeding FAQ content

FAQ content is seeded in development using:

```bash
APPWRITE_API_KEY=<key> node scripts/seed-faq-publications.mjs
```

This creates a base set of FAQ publications with the `faq` tag. In production, FAQ content is managed through the admin Publications module.

---

## Accessing the page

The page is available at:

- `/help`
- `/faq` (alias)

It is linked from the website footer and can be linked from email templates or other pages as needed.
