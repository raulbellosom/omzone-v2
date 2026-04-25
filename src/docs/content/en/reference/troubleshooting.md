---
title: Troubleshooting
description: Common issues and solutions
section: reference
order: 2
lastUpdated: 2026-04-25
---

# Troubleshooting

This guide covers common issues encountered in the OMZONE admin panel and their solutions.

## Booking Issues

### Customer can't complete payment

**Symptoms:** Checkout fails or payment page doesn't load.

**Diagnostic Steps:**
1. Check Stripe configuration in Settings → Payment
2. Verify Stripe keys are correct (not test keys in production)
3. Confirm Stripe account is in good standing
4. Check Stripe dashboard for specific error messages

**Solutions:**
- Verify publishable key matches environment
- Check if customer's card is valid and has funds
- Confirm Stripe webhook is configured and receiving events
- Review Stripe transaction logs for decline reasons

### Slot shows "Full" but should have availability

**Symptoms:** Slot capacity appears exhausted but you expected open spots.

**Diagnostic Steps:**
1. Check slot capacity settings
2. Verify no resource conflicts (instructor availability)
3. Review existing bookings for that slot
4. Check for blocked dates or manual capacity locks

**Solutions:**
- Increase slot capacity in slot edit page
- Add additional resources to resolve conflicts
- Cancel unnecessary bookings to free capacity
- Check if overbooking limit is restricting availability

### Booking request not appearing

**Symptoms:** Customer submitted request but it's not visible in requests list.

**Diagnostic Steps:**
1. Check request status filters (default may show only `pending`)
2. Verify experience has `saleMode: request`
3. Confirm customer submitted the request correctly
4. Review request in database if still missing

**Solutions:**
- Change filter to "All" to see non-pending requests
- Confirm experience configuration includes `saleMode: request`
- Check customer email for confirmation
- Verify Appwrite function executed successfully

### Order stuck in "Pending"

**Symptoms:** Order shows `pending` status indefinitely.

**Diagnostic Steps:**
1. Check Stripe dashboard for payment status
2. Review webhook logs in Appwrite
3. Verify webhook URL is correctly configured in Stripe

**Solutions:**
- If payment succeeded in Stripe: Manually verify and update status via admin
- If payment failed: Contact customer for new payment method
- Replay webhook from Stripe dashboard if webhook failed
- Verify webhook secret matches configuration

## Account Issues

### Client can't log in

**Symptoms:** Client reports login failures.

**Diagnostic Steps:**
1. Verify email address is correct
2. Check account status in System → Clients
3. Confirm labels include `client`
4. Check if password meets requirements

**Solutions:**
- Send password reset from login page
- Verify account status is `active` (not `inactive` or `suspended`)
- Check labels in client profile
- Confirm email verification is complete

### Forgot password email not received

**Symptoms:** Customer reports reset email doesn't arrive.

**Diagnostic Steps:**
1. Check spam/junk folder
2. Verify email address is correct
3. Check if Appwrite function sent the email
4. Review email logs

**Solutions:**
- Check spam folder first
- Verify email address matches registered account
- Resend verification email from admin panel
- Confirm Appwrite email templates are configured
- Check if company's email filters are blocking messages

### Can't access admin panel

**Symptoms:** User with admin label cannot access admin routes.

**Diagnostic Steps:**
1. Verify user has correct labels (`admin`, `operator`)
2. Check label assignment in client profile
3. Confirm route guard configuration

**Solutions:**
- Add appropriate label via System → Clients → Edit Labels
- Contact admin with `root` access to verify permissions
- Clear browser cache and session storage
- Verify no IP restrictions are blocking access

## Payment Issues

### Stripe webhook not working

**Symptoms:** Payments confirm but order status doesn't update.

**Diagnostic Steps:**
1. Verify webhook URL in Stripe dashboard
2. Check webhook secret configuration
3. Review webhook logs in Stripe
4. Check Appwrite function logs

**Solutions:**
- Configure webhook URL pointing to Appwrite Function endpoint
- Verify webhook secret matches Appwrite configuration
- Check "Signing secret is valid" in Stripe dashboard
- Review Appwrite function execution logs for errors
- Replay missed webhook events from Stripe dashboard

### Refund failing

**Symptoms:** Refund button doesn't work or returns error.

**Diagnostic Steps:**
1. Verify order status allows refund (`paid` or `confirmed`)
2. Check Stripe dashboard refund capability
3. Confirm refund hasn't already been processed

**Solutions:**
- Only refund orders with `paid` or `confirmed` status
- Cancel first, then refund to maintain status flow
- Verify Stripe account has refund capability
- Check Stripe refund limit (90-day standard limit)

## Check-In Issues

### QR code not scanning

**Symptoms:** Scanner can't read ticket QR code.

**Diagnostic Steps:**
1. Test camera permissions in browser
2. Verify QR code isn't damaged (if printed)
3. Check if ticket status allows check-in

**Solutions:**
- Grant camera permissions in browser settings
- Use manual ticket search instead of scanning
- Clean QR code if printed (no smudges)
- Verify ticket is not `cancelled` or `expired`
- Try different browser if camera issues persist

### Ticket already used error

**Symptoms:** Valid ticket shows "already checked in" error.

**Diagnostic Steps:**
1. Verify with customer their ticket status
2. Check check-in history for the ticket
3. Confirm no accidental duplicate check-in

**Solutions:**
- Verify customer's name matches ticket
- Check timeline in ticket detail for check-in timestamp
- If genuine error: Supervisor override may be required
- Contact admin if ticket was incorrectly marked used

### Check-in report missing tickets

**Symptoms:** Daily report doesn't show all expected check-ins.

**Diagnostic Steps:**
1. Verify date filter on report
2. Check ticket status filters
3. Confirm tickets were actually checked in

**Solutions:**
- Ensure report date range includes slot date
- Check if some bookings used passes (different tracking)
- Verify ticket status filter includes `confirmed`
- Review slot completion status

## Catalog Issues

### Experience not showing on public site

**Symptoms:** Published experience doesn't appear in listing.

**Diagnostic Steps:**
1. Check experience status is `published`
2. Verify slots exist and are published
3. Confirm pricing tiers exist
4. Check if publication links the experience

**Solutions:**
- Set experience status to `published`
- Create and publish at least one slot
- Add at least one pricing tier
- Check publication experienceId linkage if using landing page

### Pricing tier not applying

**Symptoms:** Wrong price shows at checkout.

**Diagnostic Steps:**
1. Verify tier is linked to correct experience
2. Check if edition-specific pricing overrides
3. Confirm tier is active and not archived

**Solutions:**
- Verify tier assignment in experience Pricing Tiers tab
- Check edition-specific pricing configuration
- Set tier status to active
- Clear checkout cache and retry

### Addon not appearing at checkout

**Symptoms:** Required addon doesn't show in checkout.

**Diagnostic Steps:**
1. Verify addon is linked to experience
2. Check addon assignment type (`required`, `default`, `optional`)
3. Confirm addon is active

**Solutions:**
- Add addon to experience via Addons tab
- Check assignment type: `required` addons are automatic, `optional` require selection
- Set addon status to active
- Verify addon belongs to correct experience

## Slot and Availability Issues

### Slot not appearing for booking

**Symptoms:** Slot exists but customers can't select it.

**Diagnostic Steps:**
1. Check slot status is `published`
2. Verify slot date is in the future
3. Confirm capacity isn't zero
4. Check if experience has a publication linking it

**Solutions:**
- Set slot status to `published`
- Create slot with future date
- Increase slot capacity above zero
- Verify experience is published
- Check minimum advance notice isn't blocking booking

### Capacity not releasing on cancellation

**Symptoms:** Cancelled booking doesn't free slot capacity.

**Diagnostic Steps:**
1. Verify cancellation happened before slot time
2. Check if slot auto-update is configured
3. Review cancellation workflow

**Solutions:**
- Manually adjust slot capacity if auto-release failed
- Ensure cancellation occurred before slot start time
- Verify slot has sufficient remaining capacity
- Check Appwrite function logs for capacity update errors

## Media Issues

### Image upload failing

**Symptoms:** Images fail to upload to Media Manager.

**Diagnostic Steps:**
1. Check file size is under 10MB limit
2. Verify file format is supported
3. Check browser console for errors

**Solutions:**
- Compress images before uploading
- Convert to supported format (JPG, PNG, WebP)
- Try different browser if console errors persist
- Check storage bucket permissions

### Image not displaying

**Symptoms:** Uploaded image shows broken icon or empty.

**Diagnostic Steps:**
1. Verify upload completed successfully
2. Check image URL is correct
3. Confirm file format supported

**Solutions:**
- Wait for image optimization to complete
- Verify image was uploaded to correct bucket
- Check browser console for loading errors
- Try re-uploading if file corrupted

## System Issues

### Slow page loads

**Symptoms:** Admin panel pages take excessive time to load.

**Diagnostic Steps:**
1. Check internet connection
2. Verify no ongoing maintenance
3. Check Appwrite server status
4. Review browser performance

**Solutions:**
- Clear browser cache and cookies
- Check Appwrite server status page
- Disable browser extensions that may interfere
- Try incognito/private browsing mode
- Check network tab for slow API calls

### Data not saving

**Symptoms:** Form submissions fail or data reverts.

**Diagnostic Steps:**
1. Check browser console for validation errors
2. Verify required fields are filled
3. Check session timeout

**Solutions:**
- Complete all required fields
- Clear browser session storage
- Check for validation errors displayed on form
- Verify Appwrite connection is active
- Refresh page and retry submission

### Two-factor authentication issues

**Symptoms:** Can't complete 2FA setup or login.

**Diagnostic Steps:**
1. Verify time-based OTP is synced
2. Check if backup codes were saved
3. Confirm authenticator app is correct

**Solutions:**
- Use backup codes if 2FA device unavailable
- Contact admin to reset 2FA (requires admin access)
- Verify device time is accurate (OTP is time-based)
- Ensure correct account is configured in authenticator app

## Getting Additional Help

If issues persist after trying these solutions:

1. **Check Appwrite logs:** Review function execution logs for backend errors
2. **Verify Stripe dashboard:** Check for payment-specific issues there
3. **Review browser console:** Network errors indicate API issues
4. **Contact support:** Escalate with specific error messages and timestamps
5. **Check system status:** Verify all integrations are operational
