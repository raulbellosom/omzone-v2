---
title: Known Limitations
description: Intentional constraints and known edge cases in OMZONE
section: reference
order: 2
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/experiences
  - /admin/orders
  - /portal
relatedCollections:
  - experiences
  - orders
  - slots
keywords:
  - limitations
  - constraints
  - edge cases
  - intentional behavior
  - troubleshooting
---

# Known Limitations

This document describes intentional design constraints, known edge cases, and behavioral nuances in OMZONE. Understanding these helps distinguish between expected behavior and issues that may need resolution.

---

## Intentional Constraints (Design Decisions)

These behaviors are intentionally implemented and should not be changed without careful consideration of downstream effects.

### 1. Slug Uniqueness Across Experiences AND Publications

| Constraint | Expected Behavior | Reasoning |
|------------|------------------|-----------|
| Slug must be unique across experiences AND publications | Cannot have experience `slug="yoga"` and publication `slug="yoga"` | Single URL namespace - `/experiences/yoga` and `/yoga` would conflict |

**Impact:** If you create an experience with slug "yoga", no publication can use "yoga" as its slug, and vice versa.

**Workaround:** Choose slugs carefully. Consider using prefixes like `experience-yoga` for experiences or `article-yoga` for publications.

---

### 2. Published Experiences Cannot Be Deleted

| Constraint | Expected Behavior | Reasoning |
|------------|------------------|-----------|
| Experience in `published` status cannot be deleted | Must move to `draft` before deletion | Prevents accidental data loss; archived experiences can be recovered |

**Impact:** If you publish an experience and later decide it's no longer needed, you must:
1. Move status to `archived` (removes from public catalog)
2. Move status to `draft` (enables deletion)
3. Delete the experience

**Workaround:** Always archive before attempting to delete a published experience.

---

### 3. Payment Status and Order Status Are Separate

| Constraint | Expected Behavior | Reasoning |
|------------|------------------|-----------|
| Order can be `cancelled` with payment `succeeded` | Allows tracking of refund state separately | Enables partial state tracking for orders with captured payments |

**Valid Combination Example:**
```
orderStatus = "cancelled"
paymentStatus = "succeeded"
```
This indicates the order was cancelled but payment was captured and not yet refunded.

**Another Valid Combination:**
```
orderStatus = "cancelled"
paymentStatus = "refunded"
```
This indicates the order was cancelled and the payment has been returned.

---

### 4. Short Description Does Not Auto-Fallback to Long Description

| Constraint | Expected Behavior | Reasoning |
|------------|------------------|-----------|
| If `shortDescription` is empty, system does NOT auto-generate from `longDescription` | Must manually fill shortDescription | Manual control for SEO optimization |

**Impact:** If you only fill `longDescription`, the system will not automatically use a truncated version as `shortDescription`.

**Workaround:** Always provide both `shortDescription` (500 chars max) and `longDescription` (5000 chars max) for proper SEO and display behavior.

---

### 5. Hero Image Has No Fallback

| Constraint | Expected Behavior | Reasoning |
|------------|------------------|-----------|
| If `heroImageId` is empty, shows placeholder color | System does NOT auto-fallback to `galleryImageIds[0]` | Explicit image selection required; gallery images may have different aspect ratios |

**Impact:** Removing the hero image leaves a colored placeholder rather than promoting the first gallery image.

**Workaround:** Always set a hero image when you want a cover image displayed.

---

### 6. Pass SaleMode Requires FulfillmentType="pass"

| Constraint | Expected Behavior | Reasoning |
|------------|------------------|-----------|
| `saleMode="pass"` can only have `fulfillmentType="pass"` | Direct purchase and credit redemption cannot coexist | Clear separation of purchase types |

**Invalid Combinations:**
- `saleMode="pass"` + `fulfillmentType="ticket"` ❌
- `saleMode="pass"` + `fulfillmentType="booking"` ❌
- `saleMode="pass"` + `fulfillmentType="package"` ❌

**Workaround:** If you need pass-based bookings, use `fulfillmentType="pass"`. For purchased tickets, use `saleMode="direct"` with `fulfillmentType="ticket"`.

---

### 7. Direct SaleMode Cannot Use Pass Fulfillment

| Constraint | Expected Behavior | Reasoning |
|------------|------------------|-----------|
| `saleMode="direct"` cannot have `fulfillmentType="pass"` | Cannot pay AND redeem credits simultaneously | Stripe Checkout handles payment, not credit redemption |

**Workaround:** Create separate experiences for pass redemption vs direct purchase, or use `saleMode="assisted"` for mixed scenarios.

---

### 8. Gallery Order Determines Display Order

| Constraint | Expected Behavior | Reasoning |
|------------|------------------|-----------|
| Gallery images are displayed in array order | First gallery image is NOT used as hero fallback | Explicit control over image presentation |

**Impact:** The order you arrange images in the gallery is the order they'll appear.

**Workaround:** Drag and drop to reorder gallery images as needed.

---

### 9. Spanish Content Fallback

| Constraint | Expected Behavior | Reasoning |
|------------|------------------|-----------|
| Empty `*Es` fields fall back to English version | `publicNameEs` → `publicName`, `shortDescriptionEs` → `shortDescription` | System does NOT auto-translate |

**Impact:** Users with `locale=es` will see English content if Spanish translations are not provided.

**Workaround:** Always provide Spanish translations (`*Es` fields) for the best bilingual user experience.

---

### 10. Min/Max Quantity Only Enforced at Checkout

| Constraint | Expected Behavior | Reasoning |
|------------|------------------|-----------|
| `minQuantity` and `maxQuantity` validation only occurs during checkout | Can save experience with any quantity settings | Server-side validation at order creation time |

**Impact:** You can set `minQuantity=5` but the admin UI won't prevent saving the experience.

**Workaround:** Validate quantity requirements before publishing an experience. Consider adding admin warnings for potentially problematic configurations.

---

## Known Edge Cases

These are scenarios that behave unexpectedly but are not bugs. They may require manual intervention or specific handling.

### 1. Order Cancelled After Tickets Generated

| Edge Case | Current Behavior | Recommended Action |
|-----------|------------------|-------------------|
| Order is cancelled after tickets have been generated | Tickets remain valid until manually invalidated | Admin should void/invalidate tickets manually |

**Why This Happens:** Tickets are generated when the order transitions to `confirmed`, before cancellation is possible.

**Manual Resolution:**
1. Navigate to the order in Admin
2. Go to the Tickets section
3. Invalidate each ticket
4. Cancel the order

---

### 2. Experience Unpublished With Active Orders

| Edge Case | Current Behavior | Recommended Action |
|-----------|------------------|-------------------|
| Experience is moved to `archived` with pending/active orders | Orders continue normally (snapshot preserves data) | Ensure customer communication if experience is no longer available |

**Why This Happens:** Orders store a snapshot of experience data at purchase time. Changing the experience doesn't affect existing orders.

**Manual Resolution:** Contact affected customers if the experience will no longer be available.

---

### 3. Slug Changed After Publication

| Edge Case | Current Behavior | Recommended Action |
|-----------|------------------|-------------------|
| Slug is changed after the experience has been published | Old URLs return 404 | Set up redirect manually or update external links |

**Why This Happens:** Slug is used in the URL; changing it creates a new URL path.

**Workaround:** Before changing a slug:
1. Note the old slug
2. Update the slug
3. Set up a redirect (outside OMZONE scope - requires server/config level changes)

---

### 4. Pricing Tier Deleted After Purchase

| Edge Case | Current Behavior | Recommended Action |
|-----------|------------------|-------------------|
| Pricing tier is deleted after orders have been placed | Order snapshot preserves price | Historical accuracy maintained; no action needed |

**Why This Happens:** Orders store a snapshot of pricing data at purchase time.

**No Action Required:** Historical orders will always show the correct price that was charged.

---

### 5. Multiple Attendees With Single Ticket

| Edge Case | Current Behavior | Recommended Action |
|-----------|------------------|-------------------|
| Order with `quantity > 1` generates ONE ticket with quantity | Ticket shows "Quantity: 5" not individual names | Collect guest info at check-in |

**Why This Happens:** The system generates one ticket per order line item, not per attendee.

**Workaround:** At check-in, request guest list or ID verification to confirm all attendees are present.

---

### 6. Pass Credits Remain After Experience Archived

| Edge Case | Current Behavior | Recommended Action |
|-----------|------------------|-------------------|
| Pass credits exist but linked experience is archived | Credits can still be consumed for other valid experiences | No automatic credit adjustment |

**Why This Happens:** Passes are not tied to specific experiences (unless `validExperienceIds` is set).

**Manual Resolution:** If you need to invalidate credits, manually adjust them in the Admin panel.

---

### 7. Slot Cancelled With Existing Bookings

| Edge Case | Current Behavior | Recommended Action |
|-----------|------------------|-------------------|
| Slot is cancelled but has active bookings | Slot status changes to `cancelled` | Contact customers manually; no automatic notification |

**Why This Happens:** Slot cancellation does not automatically trigger customer notifications.

**Manual Resolution:** 
1. Identify affected customers from the order list
2. Contact them directly about the cancellation
3. Issue refunds if appropriate

---

## Features With Constraints

These features have specific limitations that administrators should be aware of.

### Multiple Attendees on Single Ticket

| Constraint | Details | Workaround |
|------------|---------|------------|
| Ticket shows quantity, not individual names | `allowQuantity=true` generates one ticket with `quantity=N` | Request guest info at check-in |

---

### Gallery Image Order

| Constraint | Details | Workaround |
|------------|---------|------------|
| Array order determines display order | `galleryImageIds[0]` is first, but NOT used as hero fallback | Drag-drop to reorder |

---

### Spanish Translation Fallback

| Constraint | Details | Workaround |
|------------|---------|------------|
| Empty ES field falls back to EN | System does NOT auto-translate | Provide translations manually |

---

### Quantity Validation

| Constraint | Details | Workaround |
|------------|---------|------------|
| `minQuantity`/`maxQuantity` only enforced at checkout | Admin UI allows any values | Validate before publishing |

---

### Assisted Sale Slot Skip

| Constraint | Details | Workaround |
|------------|---------|------------|
| Order can be created without assigned slot | `skipSlot` option in assisted sale wizard | Assign slot later from order detail |

---

## Distinguishing Intentional vs Unintentional Behavior

Use this guide to determine if something is an intentional constraint or an issue requiring resolution.

### Indicators of Intentional Behavior

| Sign | Description |
|------|-------------|
| Documented in this page | The behavior matches a listed intentional constraint |
| Consistent with domain model | Behavior aligns with the system's data architecture |
| No workaround in code | Fixing would require architectural changes |
| Has clear reasoning | The constraint serves a purpose (e.g., prevents data loss, maintains consistency) |

### Indicators Requiring Resolution

| Sign | Description |
|------|-------------|
| Not documented here | Behavior doesn't match any known constraint |
| Inconsistent | Same action produces different results in different contexts |
| Data corruption | Invalid combinations that should be prevented |
| Security concern | Behavior exposes data or access that shouldn't be allowed |

---

## Reporting Issues

If you encounter behavior that:

1. **Doesn't match** any constraint listed in this document
2. **Feels like a bug** rather than intentional design
3. **Causes data inconsistencies** or corruption

Please report it to the development team with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable

---

## Related Pages

- [Experiences](../catalog/experiences.md) - Field documentation
- [Orders](../sales/orders.md) - Order status transitions
- [Flows](./flows.md) - Decision trees and diagrams
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions