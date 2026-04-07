/**
 * OMZONE — Create Global Project Variables in Appwrite 1.9.0
 *
 * INSTRUCTIONS:
 * 1. Open the Appwrite Console in your browser (https://aprod.racoondevs.com)
 * 2. Navigate to your project "omzone-dev"
 * 3. Open browser DevTools → Console (F12)
 * 4. Copy ALL of this script and paste it into the Console
 * 5. Press Enter — it will create all variables sequentially
 *
 * WHY: The Console UI in 1.9.0 has a bug that doesn't send "variableId"
 *       in the POST body, causing a 400 error. This script adds it.
 */

(async () => {
  const vars = [
    // ─── Database ───
    { key: "APPWRITE_DATABASE_ID", value: "omzone_db" },

    // ─── Collection IDs ───
    { key: "APPWRITE_COLLECTION_EXPERIENCES", value: "experiences" },
    { key: "APPWRITE_COLLECTION_EDITIONS", value: "experience_editions" },
    { key: "APPWRITE_COLLECTION_PRICING_TIERS", value: "pricing_tiers" },
    { key: "APPWRITE_COLLECTION_PRICING_OPTIONS", value: "pricing_rules" },
    { key: "APPWRITE_COLLECTION_ADDONS", value: "addons" },
    {
      key: "APPWRITE_COLLECTION_ADDON_ASSIGNMENTS",
      value: "addon_assignments",
    },
    { key: "APPWRITE_COLLECTION_PACKAGES", value: "packages" },
    { key: "APPWRITE_COLLECTION_PACKAGE_ITEMS", value: "package_items" },
    { key: "APPWRITE_COLLECTION_PASSES", value: "passes" },
    { key: "APPWRITE_COLLECTION_USER_PASSES", value: "user_passes" },
    {
      key: "APPWRITE_COLLECTION_PASS_CONSUMPTIONS",
      value: "pass_consumptions",
    },
    { key: "APPWRITE_COLLECTION_SLOTS", value: "slots" },
    { key: "APPWRITE_COLLECTION_SLOT_RESOURCES", value: "slot_resources" },
    { key: "APPWRITE_COLLECTION_RESOURCES", value: "resources" },
    { key: "APPWRITE_COLLECTION_LOCATIONS", value: "locations" },
    { key: "APPWRITE_COLLECTION_ROOMS", value: "rooms" },
    { key: "APPWRITE_COLLECTION_ORDERS", value: "orders" },
    { key: "APPWRITE_COLLECTION_ORDER_ITEMS", value: "order_items" },
    { key: "APPWRITE_COLLECTION_PAYMENTS", value: "payments" },
    { key: "APPWRITE_COLLECTION_TICKETS", value: "tickets" },
    { key: "APPWRITE_COLLECTION_REFUNDS", value: "refunds" },
    { key: "APPWRITE_COLLECTION_PUBLICATIONS", value: "publications" },
    { key: "APPWRITE_COLLECTION_SECTIONS", value: "publication_sections" },
    { key: "APPWRITE_COLLECTION_TAGS", value: "tags" },
    { key: "APPWRITE_COLLECTION_EXPERIENCE_TAGS", value: "experience_tags" },
    { key: "APPWRITE_COLLECTION_USER_PROFILES", value: "user_profiles" },
    { key: "APPWRITE_COLLECTION_SETTINGS", value: "settings" },
    { key: "APPWRITE_COLLECTION_BOOKINGS", value: "bookings" },
    {
      key: "APPWRITE_COLLECTION_NOTIFICATION_TEMPLATES",
      value: "notification_templates",
    },
    {
      key: "APPWRITE_COLLECTION_ADMIN_ACTIVITY_LOGS",
      value: "admin_activity_logs",
    },
    { key: "APPWRITE_COLLECTION_BOOKING_REQUESTS", value: "booking_requests" },
    {
      key: "APPWRITE_COLLECTION_TICKET_REDEMPTIONS",
      value: "ticket_redemptions",
    },

    // ─── Stripe (secret) — set real values in Appwrite Console ───
    {
      key: "STRIPE_SECRET_KEY",
      value: "YOUR_STRIPE_SECRET_KEY",
      secret: true,
    },
    {
      key: "STRIPE_WEBHOOK_SECRET",
      value: "YOUR_STRIPE_WEBHOOK_SECRET",
      secret: true,
    },

    // ─── Frontend ───
    { key: "FRONTEND_URL", value: "http://localhost:5173" },

    // ─── Email ───
    { key: "EMAIL_PROVIDER", value: "resend" },
    { key: "EMAIL_FROM", value: "OMZONE <noreply@omzone.com>" },
    {
      key: "RESEND_API_KEY",
      value: "YOUR_RESEND_API_KEY",
      secret: true,
    },

    // ─── Reminder ───
    { key: "REMINDER_WINDOW_START_HOURS", value: "24" },
    { key: "REMINDER_WINDOW_END_HOURS", value: "48" },

    // ─── Function IDs ───
    { key: "APPWRITE_FUNCTION_GENERATE_TICKET", value: "generate-ticket" },
    { key: "APPWRITE_FUNCTION_SEND_CONFIRMATION", value: "send-confirmation" },
  ];

  let ok = 0,
    skip = 0,
    fail = 0;

  for (const v of vars) {
    try {
      const res = await fetch("/v1/project/variables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variableId: "unique()",
          key: v.key,
          value: v.value,
          secret: v.secret || false,
        }),
      });

      if (res.status === 201) {
        console.log(`✅ ${v.key}`);
        ok++;
      } else if (res.status === 409) {
        console.log(`⏭️  ${v.key} (already exists)`);
        skip++;
      } else {
        const err = await res.json();
        console.error(`❌ ${v.key} (${res.status}): ${err.message}`);
        fail++;
      }
    } catch (e) {
      console.error(`❌ ${v.key}: ${e.message}`);
      fail++;
    }
  }

  console.log(`\n══════════════════════════════`);
  console.log(`✅ Created: ${ok}  ⏭️ Skipped: ${skip}  ❌ Failed: ${fail}`);
  console.log(`══════════════════════════════`);
})();
