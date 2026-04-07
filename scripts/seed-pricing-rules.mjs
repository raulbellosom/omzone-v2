/**
 * Seed script — creates pricing rules for OMZONE.
 * Run with: APPWRITE_API_KEY=<key> node scripts/seed-pricing-rules.mjs
 *
 * Creates: early-bird discounts, quantity discounts, and promo-code rules
 *          attached to existing pricing tiers.
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

// ─── Pricing Rules ───────────────────────────────────────────────────────

async function seedPricingRules() {
  console.log("\n💲 Pricing Rules");

  // Early-bird: 15 % off Breathwork Standard if booked ≥ 7 days before slot
  await createDoc("pricing_rules", "rule-breathwork-earlybird", {
    pricingTierId: "pt-breathwork-standard",
    ruleType: "early-bird",
    condition: JSON.stringify({ daysBeforeSlot: 7 }),
    adjustment: JSON.stringify({ type: "percentage", value: -15 }),
    priority: 10,
    isActive: true,
    validFrom: "2025-01-01T00:00:00.000+00:00",
    validUntil: "2025-12-31T23:59:59.000+00:00",
  });

  // Early-bird: 10 % off Sound Healing Standard if booked ≥ 5 days before slot
  await createDoc("pricing_rules", "rule-sound-earlybird", {
    pricingTierId: "pt-sound-standard",
    ruleType: "early-bird",
    condition: JSON.stringify({ daysBeforeSlot: 5 }),
    adjustment: JSON.stringify({ type: "percentage", value: -10 }),
    priority: 10,
    isActive: true,
    validFrom: "2025-01-01T00:00:00.000+00:00",
    validUntil: "2025-12-31T23:59:59.000+00:00",
  });

  // Quantity discount: buy 3+ Yoga Flow tickets → 50 MXN off each
  await createDoc("pricing_rules", "rule-yoga-group", {
    pricingTierId: "pt-yoga-standard",
    ruleType: "quantity-discount",
    condition: JSON.stringify({ minQuantity: 3, maxQuantity: 10 }),
    adjustment: JSON.stringify({ type: "fixed", value: -50, perUnit: true }),
    priority: 20,
    isActive: true,
    validFrom: "2025-01-01T00:00:00.000+00:00",
    validUntil: "2025-12-31T23:59:59.000+00:00",
  });

  // Promo code: OMZONE25 → 25 % off Retreat Full-Immersion tier
  await createDoc("pricing_rules", "rule-retreat-promo", {
    pricingTierId: "pt-retreat-full",
    ruleType: "promo-code",
    condition: JSON.stringify({ code: "OMZONE25" }),
    adjustment: JSON.stringify({ type: "percentage", value: -25 }),
    priority: 5,
    isActive: true,
    validFrom: "2025-05-01T00:00:00.000+00:00",
    validUntil: "2025-08-31T23:59:59.000+00:00",
  });

  // Date-range: Summer promo — 20 % off Wellness Weekend Shared Casita in June-July
  await createDoc("pricing_rules", "rule-stay-summer", {
    pricingTierId: "pt-stay-shared",
    ruleType: "date-range",
    condition: JSON.stringify({
      from: "2025-06-01",
      until: "2025-07-31",
    }),
    adjustment: JSON.stringify({ type: "percentage", value: -20 }),
    priority: 15,
    isActive: true,
    validFrom: "2025-06-01T00:00:00.000+00:00",
    validUntil: "2025-07-31T23:59:59.000+00:00",
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("💲 OMZONE — Seeding pricing rules\n");
  await seedPricingRules();
  console.log("\n✅ Pricing rules seed complete.\n");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
