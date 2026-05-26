---
title: Contact Messages
description: How to manage contact messages, invoice requests, and support tickets from the OMZONE admin panel
section: admin
order: 2
lastUpdated: 2026-05-25
---

# Contact Messages

**Contact Messages** is the unified inbox for all inbound communications from the public site — general inquiries, invoice requests, FAQ submissions, and support tickets. Every form submission on the site lands here.

---

## Getting there

In the sidebar go to **Messages** (or **Mensajes**).

---

## The messages list

The list shows all incoming messages ordered from newest to oldest. You can filter by:

- **Read / Unread** — Focus on what hasn't been reviewed yet.
- **Category** — Narrow down to a specific type of message.
- **Search** — Find by sender name, email, or subject.

Pagination loads 25 messages at a time.

---

## Message categories

Each message is automatically tagged with one of five categories:

| Category    | Badge color | What it means                                  |
| ----------- | ----------- | ---------------------------------------------- |
| **Contact** | Gray        | General inquiry submitted via the contact form |
| **Invoice** | Amber       | Billing / tax invoice request for a past order |
| **FAQ**     | Blue        | A question submitted from the Help & FAQ page  |
| **Support** | Purple      | A support request or reported issue            |
| **Other**   | Gray        | Anything that doesn't fit the above categories |

---

## Opening a message

Click any message to open its detail view. You'll see:

- **Sender** — Name, email, and phone (if provided).
- **Subject and message** — The full text the sender wrote.
- **Category badge** — At a glance what kind of message it is.
- **Preferred contact method** — How the sender wants you to reply (email, phone call, or WhatsApp). Available for Contact, Support, and Other categories.
- **Read status** — Whether the message has been opened.
- **Received at** — Date and time the message arrived.

---

## Marking as read / unread

Use the **Mark as read** / **Mark as unread** toggle at the top of the detail view. When you first open a message it is automatically marked as read. You can flip it back to unread if you need to follow up later.

The **read timestamp** (`readAt`) is recorded when a message transitions from unread to read.

---

## Admin notes

The **Admin notes** field at the bottom of the detail view lets you write internal notes about the message — action taken, follow-up needed, outcome. Notes are private and never shown to the client.

Click **Save notes** to persist them.

---

## Invoice request panel

When a message has the **Invoice** (`invoice_request`) category, an extra data panel appears in the detail view showing all the fiscal information the client submitted:

| Field               | Description                                     |
| ------------------- | ----------------------------------------------- |
| **Order code**      | The OMZONE order number the invoice is for      |
| **WhatsApp**        | The client's WhatsApp number                    |
| **RFC**             | Mexican tax ID                                  |
| **Tax regime**      | Fiscal regime (régimen fiscal)                  |
| **CFDI use**        | The intended use of the invoice (uso de CFDI)   |
| **Fiscal email**    | The email where the invoice should be delivered |
| **Additional info** | Any extra notes the client added                |
| **Order found**     | Whether the system could match the order code   |

Invoice requests originate from the public `/facturacion` page. See [Invoice Requests](../landing/facturacion.md) for details on that flow.

---

## Soft-archiving a message

If you want to keep the inbox clean without deleting data permanently, use the **Archive** option from the actions menu. Archived messages can be restored at any time.

See [Archiving & Deletion](../referencia/archivado-y-eliminacion.md) for the full reference on archiving behavior.

---

## Dashboard badge

The admin dashboard shows a combined banner alerting you when there are **unread contact messages** or **pending booking requests**. This badge counts all messages where `isRead = false`.

---

## Tips

- Handle invoice requests promptly — clients are waiting for a tax document they usually need for accounting.
- Use admin notes to track what happened (e.g., "Invoice sent via email 2026-05-25").
- Use the **Unread** filter each morning for a quick triage.
- Copy the client's email with the copy button to reply directly from your email client.
