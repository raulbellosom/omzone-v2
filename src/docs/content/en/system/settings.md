---
title: Settings
description: Platform configuration and preferences
section: system
order: 4
lastUpdated: 2026-04-25
---

# Settings

The Settings page contains platform-wide configuration options that control business behavior, localization, integrations, and security. Most settings require admin-level access to modify.

## General Settings

### Business Information

| Field | Description |
|-------|-------------|
| Business Name | Display name for the company |
| Legal Name | Official legal entity name |
| Contact Email | Primary contact email |
| Phone | Business phone number |
| Address | Physical address |

### Branding

| Field | Description |
|-------|-------------|
| Logo | Main logo image (light variant) |
| Logo Dark | Logo for dark backgrounds |
| Favicon | Browser tab icon |
| Primary Color | Brand accent color |
| Secondary Color | Secondary accent color |

## Localization

| Field | Options | Default |
|-------|---------|---------|
| Default Currency | MXN, USD | MXN |
| Timezone | America/Mexico_City, America/Cancun, America/Tijuana | America/Mexico_City |
| Date Format | DD/MM/YYYY, MM/DD/YYYY | DD/MM/YYYY |
| Time Format | 12-hour, 24-hour | 24-hour |
| Default Locale | en, es | en |

> **Timezone importance:** Slot times are stored in the configured timezone. Changing timezone after bookings exist can cause display inconsistencies.

## Booking Settings

### Booking Rules

| Field | Description |
|-------|-------------|
| Minimum Advance Notice | Hours before slot when booking closes |
| Maximum Advance Booking | Days ahead customers can book |
| Cancellation Window | Hours before slot when free cancellation ends |
| Cancellation Policy | Policy text displayed at checkout |

### Capacity Settings

| Field | Description |
|-------|-------------|
| Default Capacity | Default max attendees per slot |
| Allow Overbooking | Allow bookings beyond capacity |
| Overbooking Limit | Maximum overbook percentage |

### Experience Defaults

| Field | Description |
|-------|-------------|
| Default Status | Default status for new experiences |
| Default Sale Mode | Default sale mode for new experiences |
| Auto-publish Slots | Automatically publish slots with experience |

## Payment Settings

### Currency Configuration

| Field | Description |
|-------|-------------|
| Default Currency | Primary currency for pricing |
| Supported Currencies | MXN, USD |
| Auto-conversion | Convert prices to display currency |

### Stripe Integration

| Field | Description |
|-------|-------------|
| Stripe Publishable Key | Stripe API publishable key |
| Stripe Secret Key | Stripe API secret key (hidden) |
| Webhook Secret | Stripe webhook signing secret |
| Test Mode | Toggle Stripe test mode |

> **Webhook configuration:** Stripe webhooks must be configured in the Stripe dashboard pointing to the Appwrite Function endpoint for payment reconciliation.

### Payment Methods

| Method | Status |
|--------|--------|
| Card | Enabled/Disabled |
| Pay at Venue | Enabled/Disabled |
| Bank Transfer | Enabled/Disabled |

## Notification Settings

### Email Templates

Customize notification email content:

| Template | Variables |
|----------|-----------|
| Order Confirmation | `{{customerName}}`, `{{orderId}}`, `{{items}}`, `{{total}}` |
| Booking Reminder | `{{customerName}}`, `{{experienceName}}`, `{{slotDateTime}}` |
| Cancellation Notice | `{{customerName}}`, `{{orderId}}`, `{{reason}}` |
| Pass Expiration | `{{customerName}}`, `{{passName}}`, `{{expirationDate}}` |

### Reminder Timing

| Reminder | Default Timing |
|----------|---------------|
| 48-hour reminder | Enabled, 48 hours before slot |
| 24-hour reminder | Enabled, 24 hours before slot |
| 1-hour reminder | Disabled |

### Sender Information

| Field | Description |
|-------|-------------|
| Sender Name | Email sender display name |
| Sender Email | Verified sending email |
| Reply-To Email | Reply-to address |

## Security Settings

### Password Policy

| Field | Default |
|-------|---------|
| Minimum Length | 8 characters |
| Require Uppercase | Yes |
| Require Numbers | Yes |
| Require Special Characters | No |
| Password Expiration | Never |

### Session Settings

| Field | Default |
|-------|---------|
| Session Timeout | 30 minutes |
| Max Concurrent Sessions | 3 |
| Remember Device | Enabled |

### Admin Access

| Field | Description |
|-------|-------------|
| Two-Factor Required | Require 2FA for admin accounts |
| IP Whitelist | Restrict admin access to IPs |
| Audit Logging | Log all admin actions |

## System Information

View platform status and version information:

| Field | Description |
|-------|-------------|
| Appwrite Version | Server version |
| Database Status | Connection status |
| Storage Status | Storage connectivity |
| API Status | API endpoint health |
| Last Deployment | Deployment timestamp |

### Integration Status

| Service | Status |
|---------|--------|
| Stripe | Connected/Disconnected |
| Email | Configured/Not configured |
| CDN | Active/Inactive |

## Bucket Configuration

### Storage Buckets

| Bucket | Permissions | File Types |
|-------|-------------|------------|
| `experiences` | Public read | jpg, png, webp, gif |
| `publications` | Public read | jpg, png, webp, gif, mp4 |
| `avatars` | Auth read | jpg, png, webp, gif |
| `documents` | Admin write | pdf |
| `marketing` | Public read | jpg, png, webp, gif, mp4 |

## Common Mistakes

- **Changing currency affects new orders only:** Currency changes do not retroactively convert existing orders or pricing tiers.
- **Timezone mismatch:** If business operates across timezones, ensure timezone matches the primary location for accurate slot times.
- **Disabling payment method without alternatives:** Always maintain at least one enabled payment method.
- **Webhook URL misconfiguration:** Stripe webhooks must point to the correct Appwrite Function endpoint.
- **Removing 2FA requirement:** Disabling 2FA for admins compromises security. Keep enabled.

## Related Pages

- [Orders](/docs/sales/orders) — Payment configuration affects checkout
- [Experiences](/docs/catalog/experiences) — Default settings apply to new experiences
- [Media](/docs/system/media) — Storage bucket configuration
