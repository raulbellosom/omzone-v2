# OMZONE — Email templates

This directory contains two sets of email templates:

1. **Auth templates** — Used by Appwrite Auth (verification, recovery). Must be pasted manually in the Appwrite Console.
2. **Transactional templates** — HTML source files for the `notification_templates` collection. Loaded via the seed script.

---

## Auth templates (Appwrite Console)

| File                   | Template     | Language | Suggested subject              |
| ---------------------- | ------------ | -------- | ------------------------------ |
| `verification.es.html` | Verification | es       | `Confirma tu correo en OMZONE` |
| `verification.en.html` | Verification | en       | `Confirm your email at OMZONE` |

**How to deploy:** Appwrite Console → Project `omzone-dev` → Auth → Templates → paste HTML per language. A custom SMTP server must be configured under Project → Settings → SMTP.

**Allowed variables:** `{{user}}`, `{{redirect}}`, `{{project}}`, `{{team}}`

---

## Transactional templates

These files are the source-of-truth for transactional emails sent from Appwrite Functions via the `send-notification` dispatcher.

### Workflow

1. Edit the HTML files in this directory.
2. Run the seed script to upsert into `notification_templates`:
   ```
   APPWRITE_API_KEY=<key> node scripts/seed-notification-templates.mjs
   ```
3. The `send-notification` Function reads the active template by `key` and renders `{{placeholder}}` tokens.

### Subject extraction

The subject is extracted automatically from the HTML comment header:

```html
<!--
  Subject: Your exact email subject here
-->
```

---

## Transactional template keys

| Key                        | Trigger                                          | Variables                                                                                                                        |
| -------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `order-pending`            | Order created, awaiting payment                  | `customerName` `orderNumber` `experienceName` `date` `totalAmount` `portalUrl`                                                   |
| `order-confirmation`       | Order paid and tickets generated                 | `customerName` `orderNumber` `experienceName` `date` `location` `ticketCodes` `ticketCode` `totalAmount` `qrDataUrl` `portalUrl` |
| `order-cancelled`          | Order cancelled (admin action or failed payment) | `customerName` `orderNumber` `experienceName` `adminNote`                                                                        |
| `order-refunded`           | Order refunded                                   | `customerName` `orderNumber` `experienceName` `adminNote`                                                                        |
| `booking-request-received` | New private booking request submitted            | `customerName` `experienceName` `date` `participants` `adminNote` `portalUrl`                                                    |
| `booking-request-quoted`   | Admin sent a quote with payment link             | `customerName` `experienceName` `quotedAmount` `paymentLink` `adminNote` `portalUrl`                                             |
| `booking-request-declined` | Admin declined the booking request               | `customerName` `experienceName` `adminNote` `portalUrl`                                                                          |
| `pass-purchased`           | Pass or package order fulfilled                  | `customerName` `passName` `passCredits` `orderNumber` `portalUrl`                                                                |
| `event-reminder`           | 24–48h before a booked slot                      | `customerName` `experienceName` `date` `time` `location` `ticketCode` `qrDataUrl` `portalUrl`                                    |
| `payment-link`             | Admin sends manual payment link to customer      | `customerName` `orderNumber` `experienceName` `totalAmount` `paymentLinkUrl`                                                     |

### QR codes

For templates that include `{{qrDataUrl}}`:

- `send-confirmation` generates the QR from the first ticket code using `qrcode@1.5.4`
- `send-notification` auto-generates QR if `ticketCode` is provided in vars and `qrDataUrl` is not

---

## Design tokens

All transactional templates use the OMZONE editorial palette:

| Token       | Value     | Usage                   |
| ----------- | --------- | ----------------------- |
| Outer bg    | `#f2ede6` | Body background         |
| Card bg     | `#faf8f5` | Main email container    |
| Border      | `#e8dfd3` | Card border, dividers   |
| Dark        | `#2c2c2c` | Headings, CTA button bg |
| Sage        | `#7c8c6e` | Labels, taglines        |
| Link        | `#5c6b4f` | Inline links            |
| Summary row | `#f0ece6` | Info table rows         |
| Footer bg   | `#f0ece6` | Footer area             |

Wordmark font: `Georgia, serif`. Body font: system sans-serif stack.
