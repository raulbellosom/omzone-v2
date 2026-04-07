/**
 * Seed script — creates site-level settings for OMZONE.
 * Run with: APPWRITE_API_KEY=<key> node scripts/seed-settings.mjs
 *
 * Creates: general, branding, checkout, notifications, and SEO settings.
 *
 * Idempotent: re-running skips existing documents (409).
 */

import { Client, Databases } from "node-appwrite";

const client = new Client()
  .setEndpoint("https://aprod.racoondevs.com/v1")
  .setProject("omzone-dev")
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);
const DB = "omzone_db";

// ─── Helpers ──────────────────────────────────────────────────────────────

async function createDoc(collectionId, documentId, data) {
  try {
    const doc = await db.createDocument(DB, collectionId, documentId, data);
    console.log(`  ✓ ${collectionId}/${documentId}`);
    return doc;
  } catch (err) {
    if (err.code === 409) {
      console.log(`  ⏭ ${collectionId}/${documentId} (exists)`);
    } else {
      console.error(`  ✗ ${collectionId}/${documentId}:`, err.message);
    }
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────

async function seedSettings() {
  console.log("\n⚙️  Settings");

  // ── General ──
  await createDoc("settings", "setting-site-name", {
    key: "site_name",
    value: "OMZONE",
    category: "general",
    description: "Platform display name",
  });

  await createDoc("settings", "setting-site-tagline", {
    key: "site_tagline",
    value: "Premium Wellness Experiences in Puerto Vallarta",
    category: "general",
    description: "Main tagline shown in header and meta fallback",
  });

  await createDoc("settings", "setting-default-locale", {
    key: "default_locale",
    value: "en",
    category: "general",
    description: "Default language: en or es",
  });

  await createDoc("settings", "setting-timezone", {
    key: "timezone",
    value: "America/Mexico_City",
    category: "general",
    description: "Platform default timezone for scheduling",
  });

  await createDoc("settings", "setting-default-currency", {
    key: "default_currency",
    value: "MXN",
    category: "general",
    description: "Default currency for pricing display",
  });

  await createDoc("settings", "setting-contact-email", {
    key: "contact_email",
    value: "hello@omzone.mx",
    category: "general",
    description: "Public contact email address",
  });

  await createDoc("settings", "setting-contact-phone", {
    key: "contact_phone",
    value: "+52 322 000 0000",
    category: "general",
    description: "Public contact phone number",
  });

  // ── Branding ──
  await createDoc("settings", "setting-brand-primary", {
    key: "brand_primary_color",
    value: "#1a1a2e",
    category: "branding",
    description: "Primary brand color (deep navy)",
  });

  await createDoc("settings", "setting-brand-accent", {
    key: "brand_accent_color",
    value: "#c9a96e",
    category: "branding",
    description: "Accent / gold color for CTAs and highlights",
  });

  await createDoc("settings", "setting-brand-font", {
    key: "brand_font_family",
    value: "Cormorant Garamond, serif",
    category: "branding",
    description: "Primary heading font family",
  });

  // ── Checkout ──
  await createDoc("settings", "setting-stripe-mode", {
    key: "stripe_mode",
    value: "test",
    category: "checkout",
    description: "Stripe environment: test or live",
  });

  await createDoc("settings", "setting-checkout-ttl", {
    key: "checkout_session_ttl_minutes",
    value: "30",
    category: "checkout",
    description: "Stripe checkout session expiry in minutes",
  });

  await createDoc("settings", "setting-max-tickets", {
    key: "max_tickets_per_order",
    value: "10",
    category: "checkout",
    description: "Maximum ticket quantity per single order",
  });

  // ── Notifications ──
  await createDoc("settings", "setting-notif-sender-name", {
    key: "notification_sender_name",
    value: "OMZONE Wellness",
    category: "notifications",
    description: "From name for transactional emails",
  });

  await createDoc("settings", "setting-notif-sender-email", {
    key: "notification_sender_email",
    value: "noreply@omzone.mx",
    category: "notifications",
    description: "From email for transactional emails",
  });

  await createDoc("settings", "setting-reminder-hours", {
    key: "reminder_hours_before",
    value: "24",
    category: "notifications",
    description: "Hours before slot to send reminder email",
  });

  // ── SEO ──
  await createDoc("settings", "setting-seo-title", {
    key: "seo_default_title",
    value: "OMZONE — Premium Wellness Experiences in Puerto Vallarta",
    category: "seo",
    description: "Fallback <title> when page has no specific SEO title",
  });

  await createDoc("settings", "setting-seo-description", {
    key: "seo_default_description",
    value:
      "Discover breathwork, sound healing, yoga, forest bathing, and transformative retreats in Puerto Vallarta and Riviera Nayarit. Book your next wellness experience.",
    category: "seo",
    description: "Fallback meta description",
  });

  await createDoc("settings", "setting-seo-og-image", {
    key: "seo_default_og_image",
    value: "/images/og-default.jpg",
    category: "seo",
    description: "Fallback Open Graph image path",
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("⚙️  OMZONE — Seeding settings\n");
  await seedSettings();
  console.log("\n✅ Settings seed complete.\n");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
