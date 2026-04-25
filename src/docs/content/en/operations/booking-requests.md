---
title: Booking Requests
description: Manage incoming booking inquiries for experiences with saleMode set to 'request'
section: operations
order: 4
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/booking-requests
  - /admin/booking-requests/:id
relatedCollections:
  - booking_requests
  - experiences
  - editions
keywords:
  - booking request
  - inquiry
  - quote
  - request
---

# Booking Requests

Booking requests come from customers for experiences with `saleMode: request`. Instead of booking directly, customers submit an inquiry that includes their details and requirements. Admins then review, quote a price, and convert interested customers to orders.

## How Booking Requests Work

### Customer Flow

1. Customer views an experience with `saleMode: request`
2. Customer clicks "Request Booking" (or similar)
3. Customer fills out a form with:
   - Preferred date
   - Number of participants
   - Contact name, email, phone
   - Message or special requests
4. Request is submitted and appears in admin

### Admin Flow

1. Review incoming requests
2. Assess feasibility and resources
3. Set pricing and add notes
4. Respond (approve/quote, decline, or request more info)
5. For approved requests: convert to an order and send payment link

## Viewing Booking Requests

Navigate to **Operations -> Requests**

The list shows:
- Contact name
- Experience name
- Requested date
- Number of participants
- Status

Filter by status to focus on pending requests.

## Booking Request Detail

Click on a request to view its full details:

### Contact Information
- Name, email, phone
- Message or special requests

### Experience Context
- Which experience was requested
- Which edition (if any)
- Preferred date

### Admin Section
- `adminNotes` - Internal notes (not visible to customer)
- `quotedAmount` - Price quoted to the customer (in MXN)
- `status` - Current status of the request

## Booking Request Status Values

| Status | Description |
|--------|-------------|
| `pending` | New request, awaiting review |
| `reviewing` | Admin is actively reviewing and responding |
| `approved` | Quoted and waiting for customer confirmation |
| `rejected` | Admin declined the request |
| `converted` | Customer confirmed, order created |

## Status Transitions

```
pending -> reviewing -> approved -> converted
              |
              v
          rejected
```

### Transition Rules

- `pending` to `reviewing` - Admin starts review
- `reviewing` to `approved` - Admin quotes price and waits
- `reviewing` to `rejected` - Admin declines
- `approved` to `converted` - Customer confirms, order created

## Responding to a Request

### Step 1: Start Review

Set status to `reviewing` to indicate you're working on it.

### Step 2: Add Admin Notes

Add internal notes about the request:
- Feasibility assessment
- Resource availability
- Pricing decisions
- Follow-up needed

### Step 3: Set Quoted Amount

Enter the `quotedAmount` in MXN. This is the price you're offering to the customer.

### Step 4: Approve

Set status to `approved` to send the quote to the customer.

### Step 5: Convert to Order

When the customer confirms and payment is ready:

1. Click "Convert to Order"
2. The system creates an order with:
   - Customer information
   - Experience/edition
   - Quoted amount
3. The `convertedOrderId` is stored on the request
4. Status changes to `converted`

## Converting to an Assisted Sale

The converted order is created as an assisted sale (order type: `request-conversion`). The admin can then:

1. Navigate to **Sales -> Orders -> [Order Number]**
2. Send the payment link to the customer
3. Mark as paid when received

## Common Mistakes

**Not entering a quoted amount before approving.**
The `quotedAmount` is required for conversion. If you approve without quoting, you may need to edit the request to add the amount before converting.

**Forgetting to add admin notes.**
Internal notes help other team members understand context. Document your assessment and decisions.

**Converting without customer confirmation.**
The conversion creates an order immediately. Ensure the customer has confirmed before converting.

**Setting status too early.**
Moving to `reviewing` or `approved` sends signals to the customer. Make sure you've gathered enough information before changing status.

## Related Pages

- [Orders](../sales/orders.md) - Where converted requests appear
- [Assisted Sale](../sales/assisted-sale.md) - Manual order creation
- [Experiences](../catalog/experiences.md) - Configuring saleMode