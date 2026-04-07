/**
 * Seed script — creates pass templates for OMZONE.
 * Run with: APPWRITE_API_KEY=<key> node scripts/seed-passes.mjs
 *
 * Creates: 3 pass types (Starter, Explorer, Unlimited)
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

// ─── Passes ───────────────────────────────────────────────────────────────

async function seedPasses() {
  console.log("\n🎫 Passes");

  await createDoc("passes", "pass-starter", {
    name: "Starter Pass",
    nameEs: "Pase Introductorio",
    slug: "starter-pass",
    description:
      "Your first step into OMZONE. Three credits to explore any single-session experience — breathwork, sound healing, yoga, or sunrise meditation. Valid for 60 days from purchase.",
    descriptionEs:
      "Tu primer paso en OMZONE. Tres créditos para explorar cualquier experiencia de sesión individual — respiración, sanación con sonido, yoga o meditación al amanecer. Válido por 60 días desde la compra.",
    totalCredits: 3,
    basePrice: 1500,
    currency: "MXN",
    validityDays: 60,
    validExperienceIds: JSON.stringify([
      "exp-breathwork",
      "exp-sunrise",
      "exp-sound-healing",
      "exp-yoga-flow",
    ]),
    status: "active",
    sortOrder: 1,
  });

  await createDoc("passes", "pass-explorer", {
    name: "Explorer Pass",
    nameEs: "Pase Explorador",
    slug: "explorer-pass",
    description:
      "Six credits to mix and match across sessions and immersions. Attend a forest bathing walk one week and a sound healing ceremony the next — your wellness rhythm, your choice. Valid for 90 days.",
    descriptionEs:
      "Seis créditos para combinar sesiones e inmersiones a tu gusto. Asiste a un baño de bosque una semana y a una ceremonia de sanación con sonido la siguiente — tu ritmo de bienestar, tu elección. Válido por 90 días.",
    totalCredits: 6,
    basePrice: 2700,
    currency: "MXN",
    validityDays: 90,
    validExperienceIds: JSON.stringify([
      "exp-breathwork",
      "exp-sunrise",
      "exp-forest",
      "exp-sound-healing",
      "exp-yoga-flow",
    ]),
    status: "active",
    sortOrder: 2,
  });

  await createDoc("passes", "pass-unlimited", {
    name: "Unlimited Season Pass",
    nameEs: "Pase de Temporada Ilimitado",
    slug: "unlimited-season-pass",
    description:
      "Unlimited access to every session and immersion experience for an entire season. Attend as many times as you like — this is your all-access key to deep, sustained transformation. Valid for 180 days.",
    descriptionEs:
      "Acceso ilimitado a todas las sesiones e inmersiones durante toda una temporada. Asiste todas las veces que quieras — esta es tu llave de acceso total a una transformación profunda y sostenida. Válido por 180 días.",
    totalCredits: 99,
    basePrice: 7500,
    currency: "MXN",
    validityDays: 180,
    validExperienceIds: JSON.stringify([
      "exp-breathwork",
      "exp-sunrise",
      "exp-forest",
      "exp-sound-healing",
      "exp-yoga-flow",
    ]),
    status: "active",
    sortOrder: 3,
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("🎫 OMZONE — Seeding passes\n");
  await seedPasses();
  console.log("\n✅ Passes seed complete.\n");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
