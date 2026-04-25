---
title: Clients
description: Customer accounts and profiles
section: system
order: 2
lastUpdated: 2026-04-25
---

# Clients

Clients are registered user accounts on the OMZONE platform. They can log into the client portal to view orders, download tickets, manage passes, and update their profile information.

## Client vs User Profiles

| Entity | Description |
|--------|-------------|
| User (Auth) | Appwrite Auth account (email, password, phone) |
| User Profile | Extended profile data (name, preferences, notes) |

> **Domain separation:** A User account can exist without a User Profile (e.g., unverified registrations). All clients should have both User and User Profile records for complete functionality.

## Client Fields

### User Profile Fields

| Field | Type | Description |
|-------|------|-------------|
| User ID | string | Appwrite user ID reference |
| Name | string | Full display name |
| Email | string | Contact email address |
| Phone | string | Contact phone (E.164 format) |
| Avatar | file | Profile photo |
| Labels | string[] | Role labels (`client`, `admin`, `operator`, `root`) |
| Status | enum | `active`, `inactive`, `suspended` |
| Created At | datetime | Registration timestamp |
| Updated At | datetime | Last profile update |
| Preferences | JSON | User preferences (locale, notifications) |
| Notes | string | Internal admin notes |

### Appwrite User Attributes

| Field | Type | Description |
|-------|------|-------------|
| Email Verification | boolean | Email verified status |
| Phone Verification | boolean | Phone verified status |
| Registration | datetime | Account creation date |
| Labels | string[] | Security labels |

## Client Labels and Roles

| Label | Access | Description |
|-------|--------|-------------|
| `root` | Full system | Invisible admin (never displayed as role) |
| `admin` | Admin panel | Full admin access |
| `operator` | Admin panel | Limited admin access |
| `client` | Client portal | Standard client access |

> **Root users are invisible:** The `root` label is used for system administration and is filtered from all user listings via `excludeGhostUsers()`. Both `root` and `admin` labels display as "Admin" in the interface.

### Label Hierarchy

```
root (invisible)
  └── admin
        └── operator
              └── client
```

## Viewing Clients

Navigate to **System → Clients** to access the clients list.

### Filtering Clients

| Filter | Options |
|--------|---------|
| Status | All, active, inactive, suspended |
| Labels | Filter by role label |
| Date Range | Registration date filter |
| Search | Name, email, or phone |

### Client List Columns

| Column | Description |
|--------|-------------|
| Name | Client display name |
| Email | Contact email |
| Phone | Contact phone |
| Role | Displayed role name |
| Status | Account status |
| Registered | Registration date |
| Orders | Total order count |

## Client Profile Page

### Sections

**Contact Information:**
- Name, email, phone
- Email/phone verification badges
- Edit contact info

**Purchase History:**
- Total orders count
- Total spent
- Recent orders list

**Active Passes:**
- Current passes with remaining credits
- Expiration dates
- Pass usage history

**Ticket History:**
- Past tickets
- Check-in status

**Notes:**
- Internal admin notes (not visible to client)
- Editable by operators and admins

### Actions

| Action | Permission | Description |
|--------|------------|-------------|
| Edit Profile | operator+ | Update contact information |
| View Orders | operator+ | View all client orders |
| Manage Passes | operator+ | View and adjust pass credits |
| Add Notes | operator+ | Add internal notes |
| Suspend Account | admin | Disable client access |
| Delete Account | admin | Permanently remove account |

## Creating Clients Manually

Operators can create client accounts for phone bookings or walk-in customers:

1. Navigate to **System → Clients**
2. Click **Create Client**
3. Fill in required fields:
   - Full Name (required)
   - Email (required, unique)
   - Phone (required, E.164 format)
4. Set initial password (optional)
5. Click **Create**

> **Existing accounts:** If the email or phone already exists, the system prevents duplicate creation. Search first to avoid errors.

## Managing Client Labels

### Adding Labels

1. Open client profile
2. Click **Labels** section
3. Add label from dropdown (`client`, `operator`, `admin`)
4. Save changes

### Removing Labels

1. Open client profile
2. Click **Labels** section
3. Remove label
4. Save changes

> **Cannot remove own admin access:** Administrators cannot demote themselves below operator level.

## Internal Notes

The notes field stores internal observations about clients:

- Preferences and special requests
- Incident reports
- VIP designations
- Communication history

> **Notes are private:** Internal notes are only visible to admin panel users and are never shown to the client in the portal.

## Common Mistakes

- **Confusing labels with permissions:** Verify the actual permissions granted by a label, not just the label name.
- **Deleting active clients:** Deleting a client with active orders can cause orphaned records. Archive instead.
- **Editing wrong client:** Always confirm the client name before making changes. Similar names can cause confusion.
- **Phone format errors:** Phone numbers must be in E.164 format (`+52 55 1234 5678`). Invalid formats will fail SMS verification.
- **Not excluding ghost users:** When listing users for any purpose, use `excludeGhostUsers()` to filter out root accounts.

## Related Pages

- [Orders](/docs/sales/orders) — View client purchase history
- [Passes](/docs/catalog/passes) — Manage client passes and credits
- [Tickets](/docs/system/tickets) — View client ticket history
