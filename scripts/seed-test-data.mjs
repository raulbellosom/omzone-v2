/**
 * Seed script — creates test data for OMZONE checkout flow testing.
 * Run with: node scripts/seed-test-data.mjs
 *
 * Creates: locations, addons, addon assignments, and slots
 * for the 4 direct-sale experiences.
 */

import { Client, Databases, ID } from "node-appwrite";

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
      console.log(`  ⊘ ${collectionId}/${documentId} (already exists)`);
    } else {
      console.error(`  ✗ ${collectionId}/${documentId}: ${err.message}`);
    }
    return null;
  }
}

function futureDate(daysFromNow, hour = 9, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// ─── Locations ────────────────────────────────────────────────────────────

async function seedLocations() {
  console.log("\n📍 Locations");
  await createDoc("locations", "loc-studio-cdmx", {
    name: "OMZONE Studio CDMX",
    description:
      "Our flagship urban wellness space in the heart of Condesa, Mexico City.",
    address: "Av. Ámsterdam 45, Col. Condesa, CDMX 06100",
    isActive: true,
  });
  await createDoc("locations", "loc-sierra-norte", {
    name: "OMZONE Sierra Norte Sanctuary",
    description:
      "A nature sanctuary nestled in the mountains of Oaxaca, surrounded by ancient forest.",
    address: "Km 12 Camino Benito Juárez, Sierra Norte, Oaxaca",
    isActive: true,
  });
}

// ─── Addons ───────────────────────────────────────────────────────────────

async function seedAddons() {
  console.log("\n🧩 Addons");
  await createDoc("addons", "addon-mat", {
    name: "Premium Yoga Mat",
    nameEs: "Tapete de Yoga Premium",
    slug: "premium-yoga-mat",
    description: "Eco-friendly premium yoga mat for your session.",
    addonType: "equipment",
    priceType: "fixed",
    basePrice: 150,
    currency: "MXN",
    isStandalone: false,
    isPublic: true,
    status: "active",
    sortOrder: 1,
  });
  await createDoc("addons", "addon-tea", {
    name: "Herbal Tea Ceremony",
    nameEs: "Ceremonia de Té Herbal",
    slug: "herbal-tea-ceremony",
    description:
      "Post-session artisanal herbal tea ceremony with locally sourced herbs.",
    addonType: "food",
    priceType: "per-person",
    basePrice: 200,
    currency: "MXN",
    isStandalone: false,
    isPublic: true,
    status: "active",
    sortOrder: 2,
  });
  await createDoc("addons", "addon-photo", {
    name: "Professional Photo Package",
    nameEs: "Paquete Fotográfico Profesional",
    slug: "professional-photo-package",
    description:
      "Capture your experience with professional photography — 10 edited digital photos.",
    addonType: "service",
    priceType: "fixed",
    basePrice: 500,
    currency: "MXN",
    isStandalone: true,
    isPublic: true,
    status: "active",
    sortOrder: 3,
  });
}

// ─── Addon Assignments ────────────────────────────────────────────────────

async function seedAddonAssignments() {
  console.log("\n🔗 Addon Assignments");

  // Breathwork: tea (optional) + mat (optional)
  await createDoc("addon_assignments", "aa-breathwork-tea", {
    experienceId: "exp-breathwork",
    addonId: "addon-tea",
    isRequired: false,
    isDefault: false,
    sortOrder: 1,
  });
  await createDoc("addon_assignments", "aa-breathwork-mat", {
    experienceId: "exp-breathwork",
    addonId: "addon-mat",
    isRequired: false,
    isDefault: false,
    sortOrder: 2,
  });

  // Sunrise: tea (default, not required) + photo (optional)
  await createDoc("addon_assignments", "aa-sunrise-tea", {
    experienceId: "exp-sunrise",
    addonId: "addon-tea",
    isRequired: false,
    isDefault: true,
    sortOrder: 1,
  });
  await createDoc("addon_assignments", "aa-sunrise-photo", {
    experienceId: "exp-sunrise",
    addonId: "addon-photo",
    isRequired: false,
    isDefault: false,
    sortOrder: 2,
  });

  // Forest: photo (optional)
  await createDoc("addon_assignments", "aa-forest-photo", {
    experienceId: "exp-forest",
    addonId: "addon-photo",
    isRequired: false,
    isDefault: false,
    sortOrder: 1,
  });

  // Retreat: tea (required) + photo (optional)
  await createDoc("addon_assignments", "aa-retreat-tea", {
    experienceId: "exp-retreat",
    addonId: "addon-tea",
    isRequired: true,
    isDefault: true,
    sortOrder: 1,
  });
  await createDoc("addon_assignments", "aa-retreat-photo", {
    experienceId: "exp-retreat",
    addonId: "addon-photo",
    isRequired: false,
    isDefault: false,
    sortOrder: 2,
  });
}

// ─── Slots ────────────────────────────────────────────────────────────────

async function seedSlots() {
  console.log("\n🗓️  Slots");

  // ── Breathwork Activation (session, ~90 min) ──
  // 3 upcoming slots over the next 2 weeks
  await createDoc("slots", "slot-breath-1", {
    experienceId: "exp-breathwork",
    slotType: "single_session",
    startDatetime: futureDate(3, 10, 0), // 3 days from now, 10:00 AM
    endDatetime: futureDate(3, 11, 30),
    timezone: "America/Mexico_City",
    capacity: 20,
    bookedCount: 0,
    locationId: "loc-studio-cdmx",
    status: "published",
    notes: "Saturday morning breathwork",
  });
  await createDoc("slots", "slot-breath-2", {
    experienceId: "exp-breathwork",
    slotType: "single_session",
    startDatetime: futureDate(7, 18, 0), // 1 week, 6:00 PM
    endDatetime: futureDate(7, 19, 30),
    timezone: "America/Mexico_City",
    capacity: 15,
    bookedCount: 0,
    locationId: "loc-studio-cdmx",
    status: "published",
    notes: "Wednesday evening breathwork",
  });
  await createDoc("slots", "slot-breath-3", {
    experienceId: "exp-breathwork",
    slotType: "single_session",
    startDatetime: futureDate(10, 10, 0), // 10 days, 10:00 AM
    endDatetime: futureDate(10, 11, 30),
    timezone: "America/Mexico_City",
    capacity: 20,
    bookedCount: 0,
    locationId: "loc-studio-cdmx",
    status: "published",
  });

  // ── Sunrise Meditation (session, ~60 min) ──
  // 3 upcoming slots at dawn
  await createDoc("slots", "slot-sunrise-1", {
    experienceId: "exp-sunrise",
    slotType: "single_session",
    startDatetime: futureDate(2, 6, 30), // 2 days, 6:30 AM
    endDatetime: futureDate(2, 7, 30),
    timezone: "America/Mexico_City",
    capacity: 12,
    bookedCount: 0,
    locationId: "loc-sierra-norte",
    status: "published",
    notes: "Dawn session — arrive 15 min early",
  });
  await createDoc("slots", "slot-sunrise-2", {
    experienceId: "exp-sunrise",
    slotType: "single_session",
    startDatetime: futureDate(5, 6, 30), // 5 days, 6:30 AM
    endDatetime: futureDate(5, 7, 30),
    timezone: "America/Mexico_City",
    capacity: 12,
    bookedCount: 0,
    locationId: "loc-sierra-norte",
    status: "published",
  });
  await createDoc("slots", "slot-sunrise-3", {
    experienceId: "exp-sunrise",
    slotType: "single_session",
    startDatetime: futureDate(9, 6, 30), // 9 days, 6:30 AM
    endDatetime: futureDate(9, 7, 30),
    timezone: "America/Mexico_City",
    capacity: 12,
    bookedCount: 0,
    locationId: "loc-sierra-norte",
    status: "published",
  });

  // ── Forest Bathing (immersion, ~4 hours) ──
  // 2 upcoming half-day slots
  await createDoc("slots", "slot-forest-1", {
    experienceId: "exp-forest",
    slotType: "single_session",
    startDatetime: futureDate(4, 8, 0), // 4 days, 8:00 AM
    endDatetime: futureDate(4, 12, 0),
    timezone: "America/Mexico_City",
    capacity: 10,
    bookedCount: 0,
    locationId: "loc-sierra-norte",
    status: "published",
    notes: "Half-day forest immersion — wear comfortable shoes",
  });
  await createDoc("slots", "slot-forest-2", {
    experienceId: "exp-forest",
    slotType: "single_session",
    startDatetime: futureDate(11, 8, 0), // 11 days, 8:00 AM
    endDatetime: futureDate(11, 12, 0),
    timezone: "America/Mexico_City",
    capacity: 10,
    bookedCount: 0,
    locationId: "loc-sierra-norte",
    status: "published",
  });

  // ── Deep Rest Retreat (3-day retreat) ──
  // 1 upcoming retreat
  await createDoc("slots", "slot-retreat-1", {
    experienceId: "exp-retreat",
    slotType: "retreat_day",
    startDatetime: futureDate(14, 16, 0), // 14 days from now, check-in 4 PM
    endDatetime: futureDate(17, 12, 0), // checkout 3 days later at noon
    timezone: "America/Mexico_City",
    capacity: 8,
    bookedCount: 0,
    locationId: "loc-sierra-norte",
    status: "published",
    notes: "3-night retreat — check-in 4 PM Friday, checkout noon Monday",
  });

  // ── 1 slot almost full (for testing "spots left" UI) ──
  await createDoc("slots", "slot-breath-full", {
    experienceId: "exp-breathwork",
    slotType: "single_session",
    startDatetime: futureDate(1, 19, 0), // tomorrow 7 PM
    endDatetime: futureDate(1, 20, 30),
    timezone: "America/Mexico_City",
    capacity: 15,
    bookedCount: 13, // only 2 spots left
    locationId: "loc-studio-cdmx",
    status: "published",
    notes: "Almost full — evening session",
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌿 OMZONE — Seeding test data\n");

  await seedLocations();
  await seedAddons();
  await seedAddonAssignments();
  await seedSlots();

  console.log("\n✅ Seed complete!");
  console.log("\nCheckout-ready experiences:");
  console.log("  • Breathwork Activation  — 4 slots, 2 addons (tea, mat)");
  console.log("  • Sunrise Meditation     — 3 slots, 2 addons (tea default, photo)");
  console.log("  • Forest Bathing         — 2 slots, 1 addon (photo)");
  console.log("  • Deep Rest Retreat      — 1 slot, 2 addons (tea required, photo)");
  console.log("\nNon-directcart experiences (no checkout):");
  console.log("  • Wellness Stay Sierra   — saleMode: assisted");
  console.log("  • Private Wellness       — saleMode: request");
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
