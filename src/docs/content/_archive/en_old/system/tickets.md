---
title: Tickets
description: Manage booking tickets and check-ins
section: system
order: 1
lastUpdated: 2026-04-25
---

# Tickets

Tickets are digital booking confirmations generated when customers purchase experiences with `fulfillmentType: ticket`. Each ticket contains booking details, attendee information, and a unique QR code for check-in validation at the venue.

## Ticket Lifecycle

```
pending → confirmed → used
     ↓         ↓
 cancelled  expired
```

| Status | Description |
|--------|-------------|
| `pending` | Ticket created but order not yet confirmed |
| `confirmed` | Ticket valid and ready for use |
| `used` | Customer has checked in at the venue |
| `cancelled` | Ticket cancelled (order cancelled or manual) |
| `expired` | Ticket past the scheduled slot date/time |

> **Automatic generation:** Tickets are automatically generated when an order transitions to `confirmed` status. This happens after successful payment processing.

## Ticket Fields

| Field | Type | Description |
|-------|------|-------------|
| Ticket ID | string | Unique identifier |
| QR Code | string | Unique QR code for check-in |
| Order ID | relation | Parent order reference |
| Slot | relation | Scheduled slot |
| Experience | relation | Experience booked |
| Edition | relation | Edition (if applicable) |
| Pricing Tier | relation | Selected pricing tier |
| Customer Name | string | Attendee full name |
| Customer Email | string | Attendee email |
| Quantity | integer | Number of spots |
| Status | enum | `pending`, `confirmed`, `used`, `cancelled`, `expired` |
| Checked In At | datetime | Timestamp of check-in |
| Checked In By | relation | Operator who validated |

## Viewing Tickets

Navigate to **System → Tickets** to access the tickets list.

### Filtering Tickets

| Filter | Options |
|--------|---------|
| Status | All, pending, confirmed, used, cancelled, expired |
| Date Range | Filter by slot date |
| Experience | Filter by experience |
| Location | Filter by venue |

### Ticket Actions

| Action | Description |
|--------|-------------|
| View Details | Open ticket detail page with full information |
| Validate QR | Open check-in scanner |
| Cancel Ticket | Cancel and release slot capacity |
| Resend Email | Resend confirmation to customer |
| Print Ticket | Generate printable version |

## Check-In Process

The check-in process validates tickets and records venue attendance.

### Accessing Check-In

Navigate to **System → Check-In** or press `Ctrl+K` → "Check-In Scanner"

### Validation Flow

1. **Scan QR code** or search by order/ticket ID
2. **System validates:**
   - Ticket exists and is valid
   - Ticket status is `confirmed`
   - Order payment status is `paid` or `confirmed`
   - Slot date/time matches current time window
   - Ticket has not already been checked in
3. **Display result:**
   - Success: Shows customer name and booking details
   - Failure: Shows error message explaining why

### Validation Errors

| Error | Cause |
|-------|-------|
| Ticket not found | QR code not recognized |
| Ticket already used | Check-in already recorded |
| Order not paid | Payment not confirmed |
| Wrong time window | Checking in outside allowed time |
| Slot cancelled | Associated slot was cancelled |

### Completing Check-In

1. Scan or search for valid ticket
2. Verify attendee identity (name matches)
3. Click **Check In** button
4. System records timestamp and operator

## Check-In Reports

| Report | Description |
|--------|-------------|
| Daily Attendance | Tickets checked in by date |
| Experience Breakdown | Attendance by experience |
| No-Show Report | Confirmed tickets not checked in |
| Late Check-Ins | Check-ins after slot start time |

## Ticket Detail Page

### Information Sections

**Booking Details:**
- Experience name and type
- Slot date, time, location, room
- Edition name (if applicable)
- Pricing tier

**Customer Information:**
- Full name
- Email
- Phone
- Number of attendees

**Status Timeline:**
- Created (order placed)
- Confirmed (payment received)
- Checked In (timestamp and operator)

### QR Code Display

The ticket detail page shows:
- Large QR code for scanning
- Ticket ID in plain text
- Downloadable QR code image

## Common Mistakes

- **Checking in wrong ticket:** Always verify the customer name matches the booking before marking as checked in.
- **Double check-in:** The system prevents duplicate check-ins, but manually verify if the error seems incorrect.
- **Wrong time window:** Tickets may only be checked in during the allowed window (typically 30 minutes before to 30 minutes after slot start).
- **Ignoring slot cancellation:** If a slot is cancelled, all associated tickets become invalid even if previously confirmed.
- **Releasing capacity incorrectly:** When cancelling tickets, ensure slot capacity is properly released for rebooking.

## Related Pages

- [Orders](/docs/sales/orders) — View orders that generated tickets
- [Slots](/docs/operations/slots) — Manage slot availability
- [Check-In](/docs/operations/check-in) — Dedicated check-in interface
