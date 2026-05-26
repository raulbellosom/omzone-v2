---
title: Email Templates
description: Reference for all transactional and auth email templates in OMZONE — triggers, variables, and how to deploy them
section: referencia
order: 4
lastUpdated: 2026-05-25
---

# Email Templates

OMZONE sends automated emails at key moments of the customer journey — order confirmation, reminders, booking updates, and more. All templates live in `docs/email-templates/` and are bilingual (English + Spanish).

---

## Template inventory

| Template file                         | Trigger                                      | Type          |
| ------------------------------------- | -------------------------------------------- | ------------- |
| `order-pending.en/es.html`            | Order created, awaiting payment              | Transactional |
| `order-confirmation.en/es.html`       | Payment confirmed, tickets generated         | Transactional |
| `order-cancelled.en/es.html`          | Order cancelled (by admin or failed payment) | Transactional |
| `order-refunded.en/es.html`           | Order refunded to client                     | Transactional |
| `booking-request-received.en/es.html` | Private booking request submitted            | Transactional |
| `booking-request-quoted.en/es.html`   | Admin sent a quote with a payment link       | Transactional |
| `booking-request-declined.en/es.html` | Admin declined a booking request             | Transactional |
| `pass-purchased.en/es.html`           | Pass or package order fulfilled              | Transactional |
| `event-reminder.en/es.html`           | 24–48 hours before a booked session          | Transactional |
| `verification.en/es.html`             | Email verification during registration       | Auth (manual) |

---

## Template variables

Templates use `{{variableName}}` placeholders that the Appwrite Function replaces at send time.

### Common variables

| Variable             | Description                                    |
| -------------------- | ---------------------------------------------- |
| `{{customerName}}`   | Client's display name                          |
| `{{orderNumber}}`    | Unique order code (e.g., `OMZ-20260525-001`)   |
| `{{experienceName}}` | Name of the experience purchased               |
| `{{date}}`           | Session date                                   |
| `{{time}}`           | Session time                                   |
| `{{location}}`       | Location name                                  |
| `{{ticketCodes}}`    | All ticket codes for the order                 |
| `{{ticketCode}}`     | Single ticket code (used in per-ticket emails) |
| `{{totalAmount}}`    | Total amount paid (formatted with currency)    |
| `{{qrDataUrl}}`      | Base64-encoded QR code image for the ticket    |
| `{{portalUrl}}`      | URL to the client portal                       |

### Booking request variables

| Variable             | Description                          |
| -------------------- | ------------------------------------ |
| `{{quoteAmount}}`    | Amount quoted by the admin           |
| `{{paymentLink}}`    | Payment link sent to the client      |
| `{{declineReason}}`  | Reason the booking was declined      |
| `{{requestSummary}}` | Summary of what the client requested |

---

## Subject line

Each template file contains its subject line as an HTML comment at the very top:

```html
<!-- Subject: Your OMZONE tickets are ready — {{orderNumber}} -->
```

The `send-confirmation` and `send-notification` Appwrite Functions extract this comment and use it as the email subject.

---

## Invoice request CTA block

Starting from this update, **order-confirmation**, **order-pending**, **order-cancelled**, and **order-refunded** templates include an **invoice request block** at the bottom:

```
Need a tax invoice for this order?
[Request invoice →]  ← links to /facturacion?orderCode={{orderNumber}}
```

The link pre-fills the order code on the public `/facturacion` form so clients can request their CFDI in seconds. When a client uses this link, the request appears in the admin panel under **Contact Messages** with the **Invoice** category.

→ See [Invoice Requests](../landing/facturacion.md) and [Contact Messages](../admin/mensajes.md) for the full flow.

---

## Deploying transactional templates

Transactional templates are stored in the `notification_templates` Appwrite collection and sent by the `send-confirmation` and `send-notification` Functions. To sync the HTML files to the database:

```bash
APPWRITE_API_KEY=<key> node scripts/seed-notification-templates.mjs
```

This script upserts all templates — it is safe to run multiple times. After running it, the Functions will automatically use the updated HTML on the next send.

---

## Deploying auth templates (verification)

The `verification.en/es.html` and password recovery templates are **not** stored in the database. They must be pasted manually into the Appwrite Console:

1. Open **Appwrite Console → Project → Auth → Templates**.
2. Select the template type (Verification, Recovery, etc.).
3. Paste the HTML content for each locale.
4. Save.

These templates use Appwrite's own variable syntax (`{{url}}`, `{{project}}`) — do not confuse them with the `{{variableName}}` syntax used in transactional templates.

---

## Editing a template

1. Open the file in `docs/email-templates/` in your editor.
2. Make your changes. Keep inline styles — most email clients do not support external CSS.
3. Test by sending to a real inbox (Gmail, Outlook, Apple Mail) before deploying.
4. Run the seed script or paste to Console, depending on the template type.

---

## Best practices

- **Always inline styles** — Email clients strip external stylesheets.
- **Both locales** — Update the `.en.html` and `.es.html` versions together to keep parity.
- **Preview variables** — Use realistic placeholder values when previewing (real order codes, names, dates).
- **Avoid images as content** — Background images are fine for decoration, but never put critical information only in images (many clients block images by default).
