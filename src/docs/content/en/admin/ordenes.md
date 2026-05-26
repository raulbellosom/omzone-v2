---
title: Orders
description: How to view and manage purchase orders in the OMZONE admin panel
section: admin
order: 10
lastUpdated: 2026-05-25
---

# Orders

An **order** is the record of a purchase. Every time a client pays for an experience, a package, or a pass, an order is created.

---

## The orders list

Go to **Orders** in the sidebar to see all purchases. You can filter by:

- Date range
- Status
- Client name or email
- Experience

---

## Order statuses

| Status    | What it means                                   |
| --------- | ----------------------------------------------- |
| Pending   | Payment was started but not completed           |
| Completed | Payment confirmed — tickets have been generated |
| Cancelled | Order was cancelled (by client or admin)        |
| Refunded  | Payment was returned to the client              |

---

## What's inside an order

Click any order to open it. You'll see:

- **Client** — Who made the purchase and their contact info.
- **Items** — What they bought, at what price, with which add-ons.
- **Payment details** — Amount, payment method, date.
- **Tickets** — The tickets generated for this order (with their QR codes).
- **Activity log** — A timestamped history of every action taken on this order.

---

## Price snapshots

Orders store the **exact price** the client paid at the time of purchase. Even if you later change the price of an experience, the order will always show the original amount.

This is intentional — it gives you a reliable sales history.

---

## Cancelling an order

1. Open the order.
2. Click **Cancel order**.
3. Choose what to do with the tickets (cancel them, or move them to another date).
4. If a refund applies, the system will prompt you for the refund details.

---

## Exporting orders

Use the **Export** button (if available) to download a spreadsheet of orders for a given date range. Useful for accounting and reporting.

---

## Tax invoice requests (facturación)

When an order is confirmed, the **order confirmation email** includes a CTA that links clients to the public `/facturacion` page with the order code pre-filled:

```
Need a tax invoice? [Request invoice →]  ← links to /facturacion?orderCode=OMZ-XXXX
```

The client fills in their tax details (RFC, tax regime, CFDI use, fiscal email). The request is submitted as a **Contact Message** with the **Invoice** category. You'll see it in the **Messages** inbox in the admin panel.

→ See [Contact Messages](../admin/mensajes.md) for how to manage invoice requests and [Email Templates](../referencia/email-templates.md) for the CTA block details.
