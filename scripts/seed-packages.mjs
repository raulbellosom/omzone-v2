/**
 * Seed script — creates realistic packages and package items for OMZONE.
 * Run with: node scripts/seed-packages.mjs
 *
 * Creates: 2 packages with multiple items each
 * Requires: APPWRITE_API_KEY env var
 */

import { Client, Databases } from "node-appwrite";

const client = new Client()
  .setEndpoint("https://aprod.racoondevs.com/v1")
  .setProject("omzone-dev")
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);
const DB = "omzone_db";

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

// ─── Packages ─────────────────────────────────────────────────────────────

async function seedPackages() {
  console.log("\n📦 Packages");

  await createDoc("packages", "pkg-deep-rest-3d", {
    name: "Deep Rest Retreat — 3 Days",
    nameEs: "Retiro Descanso Profundo — 3 Días",
    slug: "deep-rest-retreat-3-days",
    description:
      "Three days of intentional stillness in the Sierra Norte mountains. This immersive retreat weaves breathwork, forest bathing, and guided meditation into a rhythm designed to dissolve accumulated tension and restore your body's natural capacity for deep rest. Includes boutique accommodation, three plant-based meals daily, and all guided sessions.",
    descriptionEs:
      "Tres días de quietud intencional en las montañas de la Sierra Norte. Este retiro inmersivo entrelaza breathwork, baño de bosque y meditación guiada en un ritmo diseñado para disolver la tensión acumulada y restaurar la capacidad natural de tu cuerpo para el descanso profundo. Incluye hospedaje boutique, tres comidas a base de plantas por día y todas las sesiones guiadas.",
    totalPrice: 18500,
    currency: "MXN",
    durationDays: 3,
    capacity: 12,
    heroImageId: null,
    status: "published",
    sortOrder: 1,
  });

  await createDoc("packages", "pkg-urban-reset", {
    name: "Urban Reset — Half-Day Wellness",
    nameEs: "Reset Urbano — Medio Día de Bienestar",
    slug: "urban-reset-half-day-wellness",
    description:
      "A curated half-day escape in our Condesa studio, designed for those who need a deep pause without leaving the city. Begin with a breathwork activation to release mental noise, flow into a sunrise-inspired guided meditation, and close with an artisanal herbal tea ceremony. Professional photography captures the essence of your journey.",
    descriptionEs:
      "Un escape de medio día curado en nuestro estudio de Condesa, diseñado para quienes necesitan una pausa profunda sin salir de la ciudad. Comienza con una activación de breathwork para liberar el ruido mental, fluye hacia una meditación guiada inspirada en el amanecer, y cierra con una ceremonia artesanal de té herbal. La fotografía profesional captura la esencia de tu experiencia.",
    totalPrice: 4200,
    currency: "MXN",
    durationDays: null,
    capacity: 8,
    heroImageId: null,
    status: "published",
    sortOrder: 2,
  });

  await createDoc("packages", "pkg-sierra-immersion", {
    name: "Sierra Immersion — 5 Days",
    nameEs: "Inmersión Sierra — 5 Días",
    slug: "sierra-immersion-5-days",
    description:
      "Five days of full sensory immersion in ancient Oaxacan forest. Extended breathwork journeys, daily forest bathing, evening meditation circles, farm-to-table meals, and private cabin accommodation. This is our deepest offering — for those ready to truly let go.",
    descriptionEs:
      "Cinco días de inmersión sensorial completa en el bosque ancestral oaxaqueño. Jornadas extendidas de breathwork, baño de bosque diario, círculos de meditación vespertinos, comidas de la granja a la mesa, y alojamiento en cabaña privada. Esta es nuestra oferta más profunda — para quienes están listos para soltar de verdad.",
    totalPrice: 35000,
    currency: "MXN",
    durationDays: 5,
    capacity: 8,
    heroImageId: null,
    status: "draft",
    sortOrder: 3,
  });
}

// ─── Package Items ────────────────────────────────────────────────────────

async function seedPackageItems() {
  console.log("\n📋 Package Items");

  // ── Deep Rest Retreat — 3 Days ──
  console.log("\n  [Deep Rest Retreat — 3 Days]");

  await createDoc("package_items", "pi-dr3d-breathwork", {
    packageId: "pkg-deep-rest-3d",
    itemType: "experience",
    referenceId: "exp-breathwork",
    description:
      "Two guided breathwork activation sessions — morning and sunset rhythm",
    descriptionEs:
      "Dos sesiones guiadas de activación de breathwork — ritmo matutino y al atardecer",
    quantity: 2,
    sortOrder: 0,
  });

  await createDoc("package_items", "pi-dr3d-forest", {
    packageId: "pkg-deep-rest-3d",
    itemType: "experience",
    referenceId: "exp-forest",
    description:
      "Three forest bathing immersions through ancient cloud forest trails",
    descriptionEs:
      "Tres inmersiones de baño de bosque por senderos de bosque de niebla ancestral",
    quantity: 3,
    sortOrder: 1,
  });

  await createDoc("package_items", "pi-dr3d-meditation", {
    packageId: "pkg-deep-rest-3d",
    itemType: "experience",
    referenceId: "exp-sunrise",
    description: "Daily sunrise meditation with panoramic mountain views",
    descriptionEs:
      "Meditación al amanecer diaria con vistas panorámicas a la montaña",
    quantity: 3,
    sortOrder: 2,
  });

  await createDoc("package_items", "pi-dr3d-accommodation", {
    packageId: "pkg-deep-rest-3d",
    itemType: "accommodation",
    referenceId: null,
    description:
      "Boutique cabin accommodation — 3 nights, private room with forest views",
    descriptionEs:
      "Alojamiento en cabaña boutique — 3 noches, habitación privada con vista al bosque",
    quantity: 3,
    sortOrder: 3,
  });

  await createDoc("package_items", "pi-dr3d-meals", {
    packageId: "pkg-deep-rest-3d",
    itemType: "meal",
    referenceId: null,
    description:
      "Full board plant-based cuisine — breakfast, lunch, and dinner crafted with locally sourced ingredients",
    descriptionEs:
      "Pensión completa de cocina a base de plantas — desayuno, comida y cena elaborados con ingredientes de origen local",
    quantity: 9,
    sortOrder: 4,
  });

  await createDoc("package_items", "pi-dr3d-tea", {
    packageId: "pkg-deep-rest-3d",
    itemType: "addon",
    referenceId: "addon-tea",
    description:
      "Evening herbal tea ceremony — a meditative closing ritual each night",
    descriptionEs:
      "Ceremonia de té herbal nocturna — un ritual meditativo de cierre cada noche",
    quantity: 3,
    sortOrder: 5,
  });

  await createDoc("package_items", "pi-dr3d-welcome", {
    packageId: "pkg-deep-rest-3d",
    itemType: "benefit",
    referenceId: null,
    description:
      "Welcome kit with journal, essential oil blend, and artisanal cacao",
    descriptionEs:
      "Kit de bienvenida con diario, mezcla de aceites esenciales y cacao artesanal",
    quantity: 1,
    sortOrder: 6,
  });

  // ── Urban Reset — Half-Day Wellness ──
  console.log("\n  [Urban Reset — Half-Day Wellness]");

  await createDoc("package_items", "pi-ur-breathwork", {
    packageId: "pkg-urban-reset",
    itemType: "experience",
    referenceId: "exp-breathwork",
    description:
      "Guided breathwork activation — 60-minute conscious breathing journey",
    descriptionEs:
      "Activación de breathwork guiada — viaje de respiración consciente de 60 minutos",
    quantity: 1,
    sortOrder: 0,
  });

  await createDoc("package_items", "pi-ur-meditation", {
    packageId: "pkg-urban-reset",
    itemType: "experience",
    referenceId: "exp-sunrise",
    description:
      "Guided meditation session — sunrise-inspired visualization and body scan",
    descriptionEs:
      "Sesión de meditación guiada — visualización inspirada en el amanecer y escaneo corporal",
    quantity: 1,
    sortOrder: 1,
  });

  await createDoc("package_items", "pi-ur-tea", {
    packageId: "pkg-urban-reset",
    itemType: "addon",
    referenceId: "addon-tea",
    description:
      "Closing herbal tea ceremony with locally foraged botanical infusions",
    descriptionEs:
      "Ceremonia de cierre con infusiones botánicas de recolección local",
    quantity: 1,
    sortOrder: 2,
  });

  await createDoc("package_items", "pi-ur-photo", {
    packageId: "pkg-urban-reset",
    itemType: "addon",
    referenceId: "addon-photo",
    description:
      "Professional photo package — 10 edited images capturing your wellness journey",
    descriptionEs:
      "Paquete fotográfico profesional — 10 imágenes editadas capturando tu experiencia de bienestar",
    quantity: 1,
    sortOrder: 3,
  });

  await createDoc("package_items", "pi-ur-snack", {
    packageId: "pkg-urban-reset",
    itemType: "meal",
    referenceId: null,
    description: "Organic cold-pressed juice and plant-based snack board",
    descriptionEs:
      "Jugo orgánico prensado en frío y tabla de snacks a base de plantas",
    quantity: 1,
    sortOrder: 4,
  });

  // ── Sierra Immersion — 5 Days (draft) ──
  console.log("\n  [Sierra Immersion — 5 Days]");

  await createDoc("package_items", "pi-si5d-breathwork", {
    packageId: "pkg-sierra-immersion",
    itemType: "experience",
    referenceId: "exp-breathwork",
    description:
      "Daily extended breathwork journey — progressive depth across five days",
    descriptionEs:
      "Jornada diaria extendida de breathwork — profundidad progresiva a lo largo de cinco días",
    quantity: 5,
    sortOrder: 0,
  });

  await createDoc("package_items", "pi-si5d-forest", {
    packageId: "pkg-sierra-immersion",
    itemType: "experience",
    referenceId: "exp-forest",
    description:
      "Guided forest bathing excursions through ancient cloud forest and river trails",
    descriptionEs:
      "Excursiones guiadas de baño de bosque por senderos de bosque de niebla ancestral y río",
    quantity: 5,
    sortOrder: 1,
  });

  await createDoc("package_items", "pi-si5d-meditation", {
    packageId: "pkg-sierra-immersion",
    itemType: "experience",
    referenceId: "exp-sunrise",
    description:
      "Sunrise meditation circles and evening sound journey sessions",
    descriptionEs:
      "Círculos de meditación al amanecer y sesiones vespertinas de viaje sonoro",
    quantity: 10,
    sortOrder: 2,
  });

  await createDoc("package_items", "pi-si5d-accommodation", {
    packageId: "pkg-sierra-immersion",
    itemType: "accommodation",
    referenceId: null,
    description:
      "Private forest cabin — 5 nights with views of the canopy and mountain ridge",
    descriptionEs:
      "Cabaña privada en el bosque — 5 noches con vistas al dosel y la cresta montañosa",
    quantity: 5,
    sortOrder: 3,
  });

  await createDoc("package_items", "pi-si5d-meals", {
    packageId: "pkg-sierra-immersion",
    itemType: "meal",
    referenceId: null,
    description:
      "Full board farm-to-table cuisine — all meals sourced from local organic producers",
    descriptionEs:
      "Pensión completa de cocina de la granja a la mesa — todas las comidas de productores orgánicos locales",
    quantity: 15,
    sortOrder: 4,
  });

  await createDoc("package_items", "pi-si5d-welcome", {
    packageId: "pkg-sierra-immersion",
    itemType: "benefit",
    referenceId: null,
    description:
      "Welcome ceremony, curated wellness kit, and post-retreat integration guide",
    descriptionEs:
      "Ceremonia de bienvenida, kit de bienestar curado y guía de integración post-retiro",
    quantity: 1,
    sortOrder: 5,
  });

  await createDoc("package_items", "pi-si5d-photo", {
    packageId: "pkg-sierra-immersion",
    itemType: "addon",
    referenceId: "addon-photo",
    description:
      "Professional documentation of your full retreat experience — digital gallery included",
    descriptionEs:
      "Documentación profesional de toda tu experiencia de retiro — galería digital incluida",
    quantity: 1,
    sortOrder: 6,
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌿 OMZONE — Seeding packages\n");

  await seedPackages();
  await seedPackageItems();

  console.log("\n✅ Package seed complete!");
  console.log("\nCreated packages:");
  console.log("  • Deep Rest Retreat — 3 Days      (published, $18,500 MXN)");
  console.log(
    "    7 items: 3 experiences, 1 accommodation, 1 meals, 1 addon, 1 benefit",
  );
  console.log("  • Urban Reset — Half-Day Wellness  (published, $4,200 MXN)");
  console.log("    5 items: 2 experiences, 2 addons, 1 meal");
  console.log("  • Sierra Immersion — 5 Days        (draft, $35,000 MXN)");
  console.log(
    "    7 items: 3 experiences, 1 accommodation, 1 meals, 1 addon, 1 benefit",
  );
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
