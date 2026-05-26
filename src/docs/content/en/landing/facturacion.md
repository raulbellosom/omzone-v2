---
title: Invoice Requests
description: The public invoice request page on OMZONE — how it works, what clients need, and how requests reach the admin panel
section: landing
order: 5
lastUpdated: 2026-05-25
---

# Invoice Requests

The **Invoice Requests** page (`/facturacion`) lets clients request a Mexican tax invoice (CFDI) for any order they placed on OMZONE. It is a public page — no login required — and is accessible directly from the confirmation email every client receives after purchase.

---

## How clients get there

Every order confirmation email includes an **"Request invoice"** button that links directly to:

```
https://omzone.mx/facturacion?orderCode=YOUR-ORDER-CODE
```

The `orderCode` query parameter pre-fills the order code field in the form, so clients don't need to type it manually.

Clients can also navigate to `/facturacion` directly from the website footer.

---

## The invoice request form

The form collects everything needed to generate a Mexican CFDI:

| Field               | Required | Description                                         |
| ------------------- | -------- | --------------------------------------------------- |
| **Name**            | ✅       | Full name of the requester                          |
| **Email**           | ✅       | Contact email (receives confirmation)               |
| **WhatsApp**        | ✅       | Phone number for follow-up                          |
| **Order code**      | ✅       | The OMZONE order number (pre-filled from link)      |
| **RFC**             | ✅       | Mexican tax ID (Registro Federal de Contribuyentes) |
| **Tax regime**      | —        | Régimen fiscal (dropdown)                           |
| **CFDI use**        | —        | Uso de CFDI (dropdown)                              |
| **Fiscal email**    | —        | Email where the invoice PDF should be sent          |
| **Additional info** | —        | Any extra notes (e.g., specific billing address)    |

A **reCAPTCHA v2** checkbox is required to submit the form. This prevents automated abuse.

---

## What happens after submission

1. The form data is sent to the `submit-contact` Appwrite Function.
2. The function validates the data, verifies the reCAPTCHA token server-side, and creates a new record in the `contact_messages` collection with:
   - `category: "invoice_request"`
   - The fiscal fields stored in the `categoryData` JSON field
3. The message appears in the admin panel under **Contact Messages** with an amber **Invoice** badge.
4. The admin team reviews the request and generates or arranges the invoice outside of OMZONE.

> OMZONE does not generate invoices automatically. The form is a structured request channel.

---

## Validation and errors

- All required fields must be filled before submitting.
- Email is validated for correct format.
- reCAPTCHA must be completed.
- If the reCAPTCHA fails or the request is malformed, the user sees an error message and can try again.

---

## For admins: handling invoice requests

Invoice requests land in **Contact Messages** with the **Invoice** category. Open any invoice message to see the full fiscal data panel:

- Order code, RFC, tax regime, CFDI use, fiscal email, WhatsApp, and any additional notes.
- Use the **Admin notes** field to log what you did (e.g., "CFDI sent via email 2026-05-25").

→ See [Contact Messages](../admin/mensajes.md) for full details on the admin workflow.

---

## After successful submission

The page shows a success message confirming the request was received. Clients can submit another request using the "Send another" button (the form resets automatically).
