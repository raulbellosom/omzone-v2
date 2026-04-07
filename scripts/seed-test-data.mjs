/**
 * Seed script — creates foundational operational data for OMZONE.
 * Run with: APPWRITE_API_KEY=<key> node scripts/seed-test-data.mjs
 *
 * Creates: locations, rooms, resources, addons, addon assignments,
 *          slots, and slot resources — all set in Puerto Vallarta /
 *          Bahía de Banderas / Riviera Nayarit.
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

  await createDoc("locations", "loc-pvr-studio", {
    name: "OMZONE Studio PVR",
    description:
      "Our urban wellness studio in the heart of Puerto Vallarta's Zona Romántica — an intimate space designed for breathwork, yoga, and sound healing, steps away from Playa de los Muertos.",
    address: "Calle Basilio Badillo 320, Zona Romántica, Puerto Vallarta, Jalisco 48380",
    coordinates: "20.6094,-105.2364",
    isActive: true,
  });

  await createDoc("locations", "loc-pvr-jungle", {
    name: "OMZONE Jungle Sanctuary",
    description:
      "A nature sanctuary hidden in the Sierra de Vallejo foothills, 35 minutes north of Puerto Vallarta. Surrounded by tropical dry forest, rivers, and the sounds of trogons and cicadas — this is where retreats, immersions, and overnight stays unfold.",
    address: "Km 18 Carretera a Las Palmas, Sierra de Vallejo, Riviera Nayarit 63735",
    coordinates: "20.7812,-105.3041",
    isActive: true,
  });

  await createDoc("locations", "loc-pvr-beach", {
    name: "OMZONE Beachfront Terrace",
    description:
      "An elevated oceanfront terrace perched above Conchas Chinas beach, where the Pacific meets the jungle. Open-air sunrise meditations, twilight yoga, and private spa rituals with the sound of waves as the only soundtrack.",
    address: "Carretera a Barra de Navidad Km 2.5, Conchas Chinas, Puerto Vallarta, Jalisco 48390",
    coordinates: "20.5948,-105.2502",
    isActive: true,
  });
}

// ─── Rooms ────────────────────────────────────────────────────────────────

async function seedRooms() {
  console.log("\n🏠 Rooms");

  // Studio PVR
  await createDoc("rooms", "room-studio-main", {
    locationId: "loc-pvr-studio",
    name: "Main Studio",
    description:
      "A luminous 90 m² studio with bamboo floors, floor-to-ceiling windows overlooking a courtyard garden, and adjustable warm lighting. Configured for group breathwork, yoga, and sound healing.",
    capacity: 20,
    type: "studio",
    isActive: true,
  });
  await createDoc("rooms", "room-studio-therapy", {
    locationId: "loc-pvr-studio",
    name: "Therapy Room",
    description:
      "A private treatment room designed for individual massage, bodywork, and aromatherapy sessions. Heated table, ambient sound system, and natural ventilation.",
    capacity: 2,
    type: "therapy_room",
    isActive: true,
  });
  await createDoc("rooms", "room-studio-garden", {
    locationId: "loc-pvr-studio",
    name: "Garden Terrace",
    description:
      "A shaded courtyard terrace surrounded by tropical plants, ideal for post-session tea ceremonies, small group meditation, and evening sound baths under the stars.",
    capacity: 12,
    type: "outdoor",
    isActive: true,
  });

  // Jungle Sanctuary
  await createDoc("rooms", "room-jungle-pavilion", {
    locationId: "loc-pvr-jungle",
    name: "Open Air Pavilion",
    description:
      "A palapa-roofed pavilion elevated above the forest canopy, with 360° views of the Sierra de Vallejo. Used for group breathwork, yoga, and ceremony. Natural stone floor and hanging lanterns.",
    capacity: 15,
    type: "outdoor",
    isActive: true,
  });
  await createDoc("rooms", "room-jungle-deck", {
    locationId: "loc-pvr-jungle",
    name: "Meditation Deck",
    description:
      "A teak wood deck suspended over a seasonal creek, nestled under ancient ficus trees. Designed for silent meditation, journaling, and forest sound immersions.",
    capacity: 10,
    type: "outdoor",
    isActive: true,
  });
  await createDoc("rooms", "room-jungle-casita-a", {
    locationId: "loc-pvr-jungle",
    name: "Private Casita Ceiba",
    description:
      "An intimate adobe casita named after the sacred ceiba tree. King-size bed, private terrace, outdoor shower, and blackout curtains for deep rest. Ideal for retreat guests and private bodywork.",
    capacity: 2,
    type: "therapy_room",
    isActive: true,
  });
  await createDoc("rooms", "room-jungle-casita-b", {
    locationId: "loc-pvr-jungle",
    name: "Private Casita Copal",
    description:
      "A secluded casita surrounded by copal trees, with a hammock terrace overlooking the valley. Twin beds convertible to king, private bathroom, and a writing desk.",
    capacity: 2,
    type: "therapy_room",
    isActive: true,
  });

  // Beach Terrace
  await createDoc("rooms", "room-beach-sunrise", {
    locationId: "loc-pvr-beach",
    name: "Sunrise Deck",
    description:
      "An east-facing wooden deck positioned for unobstructed Pacific sunrise views. Open-air with retractable shade sails, used for dawn meditation and morning yoga sessions.",
    capacity: 12,
    type: "outdoor",
    isActive: true,
  });
  await createDoc("rooms", "room-beach-pool", {
    locationId: "loc-pvr-beach",
    name: "Pool Lounge",
    description:
      "A saltwater infinity pool area overlooking Conchas Chinas cove. Heated loungers, tropical landscaping, and a juice bar. Used for post-session relaxation and private spa rituals.",
    capacity: 8,
    type: "pool_area",
    isActive: true,
  });
}

// ─── Resources ────────────────────────────────────────────────────────────

async function seedResources() {
  console.log("\n👤 Resources");

  await createDoc("resources", "res-ana", {
    name: "Ana Lucía Vega",
    type: "facilitator",
    description:
      "Certified breathwork facilitator and meditation guide with 12 years of practice. Trained in Holotropic Breathwork (Grof Foundation) and Vipassana meditation. Ana Lucía leads OMZONE's signature breathwork sessions and silent meditation rituals.",
    contactInfo: "ana@omzone.com",
    isActive: true,
    metadata: JSON.stringify({
      specialties: ["breathwork", "meditation", "pranayama"],
      certifications: ["Holotropic Breathwork - Grof Foundation", "Vipassana 10-day Teacher Training"],
      languages: ["es", "en"],
    }),
  });

  await createDoc("resources", "res-marco", {
    name: "Marco Iván Torres",
    type: "instructor",
    description:
      "Forest therapy guide certified by the Association of Nature & Forest Therapy (ANFT). Marco has guided over 500 forest bathing immersions across Mexico's Sierra Madre and tropical forests. His approach integrates Shinrin-yoku with indigenous plant knowledge from the Wixárika tradition.",
    contactInfo: "marco@omzone.com",
    isActive: true,
    metadata: JSON.stringify({
      specialties: ["forest-therapy", "nature-immersion", "hiking", "ethnobotany"],
      certifications: ["ANFT Certified Forest Therapy Guide", "Wilderness First Responder"],
      languages: ["es", "en"],
    }),
  });

  await createDoc("resources", "res-sofia", {
    name: "Sofía de la Fuente",
    type: "therapist",
    description:
      "Licensed massage therapist with 8 years of experience in deep tissue, Swedish, and hot stone modalities. Sofía trained at the Instituto de Terapias Corporales in Guadalajara and specializes in couples' synchronized massage and aromatherapy body treatments.",
    contactInfo: "sofia@omzone.com",
    isActive: true,
    metadata: JSON.stringify({
      specialties: ["deep-tissue", "swedish", "hot-stone", "couples-massage", "aromatherapy"],
      certifications: ["Licensed Massage Therapist - ITC Guadalajara", "Aromatherapy Diploma - IFA"],
      languages: ["es", "en"],
    }),
  });

  await createDoc("resources", "res-diego", {
    name: "Diego Ramírez Estrada",
    type: "facilitator",
    description:
      "Yoga instructor (RYT-500) and sound healing practitioner. Diego teaches Vinyasa and Yin yoga, and facilitates immersive sound journeys using Tibetan singing bowls, crystal bowls, and gongs. He spent two years studying with sound healers in Rishikesh and Bali.",
    contactInfo: "diego@omzone.com",
    isActive: true,
    metadata: JSON.stringify({
      specialties: ["vinyasa-yoga", "yin-yoga", "sound-healing", "tibetan-bowls"],
      certifications: ["RYT-500 Yoga Alliance", "Sound Healing Academy Level 3"],
      languages: ["es", "en", "pt"],
    }),
  });

  await createDoc("resources", "res-elena", {
    name: "Elena Cisneros Montaño",
    type: "therapist",
    description:
      "Spa therapist and aromatherapist with 10 years of experience in luxury wellness resorts across the Riviera Nayarit. Elena designs custom essential oil blends and leads sensory spa rituals that combine bodywork with breathwork. She is OMZONE's lead therapist for private experiences.",
    contactInfo: "elena@omzone.com",
    isActive: true,
    metadata: JSON.stringify({
      specialties: ["aromatherapy", "facial-treatment", "spa-rituals", "essential-oils"],
      certifications: ["IFA Aromatherapy Diploma", "CIDESCO Spa Therapy", "Reiki Level 2"],
      languages: ["es", "en"],
    }),
  });
}

// ─── Addons ───────────────────────────────────────────────────────────────

async function seedAddons() {
  console.log("\n🧩 Addons");

  await createDoc("addons", "addon-mat", {
    name: "Premium Yoga Mat",
    nameEs: "Tapete de Yoga Premium",
    slug: "premium-yoga-mat",
    description:
      "Eco-friendly premium yoga mat made from natural rubber and jute — yours to use during the session. Antimicrobial, extra-thick cushioning, and a textured surface for stable practice.",
    descriptionEs:
      "Tapete de yoga premium ecológico hecho de caucho natural y yute — tuyo para usar durante la sesión. Antimicrobiano, acolchado extra grueso y superficie texturizada para una práctica estable.",
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
      "A post-session artisanal tea ceremony with locally sourced herbs from the Sierra de Vallejo — chamomile, lemongrass, and hierba santa, prepared in the traditional clay pot method.",
    descriptionEs:
      "Una ceremonia de té artesanal post-sesión con hierbas de la Sierra de Vallejo — manzanilla, hierba limón y hierba santa, preparadas en el método tradicional de olla de barro.",
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
      "Capture your experience with professional photography by a local Vallarta artist — 10 edited digital photos delivered within 48 hours to your email.",
    descriptionEs:
      "Captura tu experiencia con fotografía profesional de un artista local de Vallarta — 10 fotos digitales editadas entregadas en 48 horas a tu correo.",
    addonType: "service",
    priceType: "fixed",
    basePrice: 500,
    currency: "MXN",
    isStandalone: true,
    isPublic: true,
    status: "active",
    sortOrder: 3,
  });

  await createDoc("addons", "addon-transport", {
    name: "Roundtrip Transfer",
    nameEs: "Transporte Redondo",
    slug: "roundtrip-transfer",
    description:
      "Private roundtrip transfer from your hotel in Puerto Vallarta or Riviera Nayarit to the experience location. Air-conditioned vehicle with bottled water. Driver arrives 15 minutes early.",
    descriptionEs:
      "Transporte privado redondo desde tu hotel en Puerto Vallarta o Riviera Nayarit hasta la ubicación de la experiencia. Vehículo con aire acondicionado y agua embotellada. El conductor llega 15 minutos antes.",
    addonType: "transport",
    priceType: "per-person",
    basePrice: 450,
    currency: "MXN",
    isStandalone: false,
    isPublic: true,
    maxQuantity: 6,
    status: "active",
    sortOrder: 4,
  });

  await createDoc("addons", "addon-journal", {
    name: "Mindfulness Journal & Pen Set",
    nameEs: "Diario de Mindfulness y Set de Pluma",
    slug: "mindfulness-journal-set",
    description:
      "A handcrafted leather-bound journal and artisan pen from Tlaquepaque — take home a beautiful companion for continuing your reflective practice after the experience.",
    descriptionEs:
      "Un diario encuadernado en piel artesanal y pluma de artesano de Tlaquepaque — llévate un hermoso compañero para continuar tu práctica reflexiva después de la experiencia.",
    addonType: "equipment",
    priceType: "fixed",
    basePrice: 350,
    currency: "MXN",
    isStandalone: true,
    isPublic: true,
    status: "active",
    sortOrder: 5,
  });

  await createDoc("addons", "addon-smoothie", {
    name: "Fresh Detox Smoothie Flight",
    nameEs: "Vuelo de Smoothies Detox Frescos",
    slug: "detox-smoothie-flight",
    description:
      "A trio of cold-pressed smoothies made with tropical fruits from the Bahía — green spirulina, mango-turmeric, and pitaya-coconut. Served chilled after your session.",
    descriptionEs:
      "Un trío de smoothies prensados en frío con frutas tropicales de la Bahía — espirulina verde, mango-cúrcuma y pitaya-coco. Servidos fríos después de tu sesión.",
    addonType: "food",
    priceType: "per-person",
    basePrice: 280,
    currency: "MXN",
    isStandalone: false,
    isPublic: true,
    status: "active",
    sortOrder: 6,
  });

  await createDoc("addons", "addon-aromatherapy", {
    name: "Custom Aromatherapy Kit",
    nameEs: "Kit de Aromaterapia Personalizado",
    slug: "custom-aromatherapy-kit",
    description:
      "A take-home aromatherapy kit with three custom essential oil blends designed by our resident therapist Elena — crafted to extend the calm and balance of your OMZONE experience into your daily life.",
    descriptionEs:
      "Un kit de aromaterapia para llevar con tres mezclas personalizadas de aceites esenciales diseñadas por nuestra terapeuta residente Elena — creadas para extender la calma y el equilibrio de tu experiencia OMZONE a tu vida diaria.",
    addonType: "service",
    priceType: "fixed",
    basePrice: 650,
    currency: "MXN",
    isStandalone: true,
    isPublic: true,
    status: "active",
    sortOrder: 7,
  });
}

// ─── Addon Assignments ────────────────────────────────────────────────────

async function seedAddonAssignments() {
  console.log("\n🔗 Addon Assignments");

  // Breathwork: tea + mat + smoothie
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
  await createDoc("addon_assignments", "aa-breathwork-smoothie", {
    experienceId: "exp-breathwork",
    addonId: "addon-smoothie",
    isRequired: false,
    isDefault: false,
    sortOrder: 3,
  });

  // Sunrise: tea (default) + photo + smoothie
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
  await createDoc("addon_assignments", "aa-sunrise-smoothie", {
    experienceId: "exp-sunrise",
    addonId: "addon-smoothie",
    isRequired: false,
    isDefault: false,
    sortOrder: 3,
  });

  // Forest: photo + transport + journal
  await createDoc("addon_assignments", "aa-forest-photo", {
    experienceId: "exp-forest",
    addonId: "addon-photo",
    isRequired: false,
    isDefault: false,
    sortOrder: 1,
  });
  await createDoc("addon_assignments", "aa-forest-transport", {
    experienceId: "exp-forest",
    addonId: "addon-transport",
    isRequired: false,
    isDefault: false,
    sortOrder: 2,
  });
  await createDoc("addon_assignments", "aa-forest-journal", {
    experienceId: "exp-forest",
    addonId: "addon-journal",
    isRequired: false,
    isDefault: false,
    sortOrder: 3,
  });

  // Retreat: tea (required) + photo + transport + aromatherapy
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
  await createDoc("addon_assignments", "aa-retreat-transport", {
    experienceId: "exp-retreat",
    addonId: "addon-transport",
    isRequired: false,
    isDefault: false,
    sortOrder: 3,
  });
  await createDoc("addon_assignments", "aa-retreat-aromatherapy", {
    experienceId: "exp-retreat",
    addonId: "addon-aromatherapy",
    isRequired: false,
    isDefault: false,
    sortOrder: 4,
  });

  // Couples Massage: aromatherapy (default) + photo
  await createDoc("addon_assignments", "aa-couples-aromatherapy", {
    experienceId: "exp-couples-massage",
    addonId: "addon-aromatherapy",
    isRequired: false,
    isDefault: true,
    sortOrder: 1,
  });
  await createDoc("addon_assignments", "aa-couples-photo", {
    experienceId: "exp-couples-massage",
    addonId: "addon-photo",
    isRequired: false,
    isDefault: false,
    sortOrder: 2,
  });

  // Sound Healing: mat + tea + journal
  await createDoc("addon_assignments", "aa-sound-mat", {
    experienceId: "exp-sound-healing",
    addonId: "addon-mat",
    isRequired: false,
    isDefault: false,
    sortOrder: 1,
  });
  await createDoc("addon_assignments", "aa-sound-tea", {
    experienceId: "exp-sound-healing",
    addonId: "addon-tea",
    isRequired: false,
    isDefault: true,
    sortOrder: 2,
  });
  await createDoc("addon_assignments", "aa-sound-journal", {
    experienceId: "exp-sound-healing",
    addonId: "addon-journal",
    isRequired: false,
    isDefault: false,
    sortOrder: 3,
  });

  // Yoga Flow: mat (default) + smoothie + photo
  await createDoc("addon_assignments", "aa-yoga-mat", {
    experienceId: "exp-yoga-flow",
    addonId: "addon-mat",
    isRequired: false,
    isDefault: true,
    sortOrder: 1,
  });
  await createDoc("addon_assignments", "aa-yoga-smoothie", {
    experienceId: "exp-yoga-flow",
    addonId: "addon-smoothie",
    isRequired: false,
    isDefault: false,
    sortOrder: 2,
  });
  await createDoc("addon_assignments", "aa-yoga-photo", {
    experienceId: "exp-yoga-flow",
    addonId: "addon-photo",
    isRequired: false,
    isDefault: false,
    sortOrder: 3,
  });

  // Wellness Weekend Stay: transport (default) + aromatherapy + photo
  await createDoc("addon_assignments", "aa-stay-transport", {
    experienceId: "exp-wellness-weekend",
    addonId: "addon-transport",
    isRequired: false,
    isDefault: true,
    sortOrder: 1,
  });
  await createDoc("addon_assignments", "aa-stay-aromatherapy", {
    experienceId: "exp-wellness-weekend",
    addonId: "addon-aromatherapy",
    isRequired: false,
    isDefault: false,
    sortOrder: 2,
  });
  await createDoc("addon_assignments", "aa-stay-photo", {
    experienceId: "exp-wellness-weekend",
    addonId: "addon-photo",
    isRequired: false,
    isDefault: false,
    sortOrder: 3,
  });
}

// ─── Slots ────────────────────────────────────────────────────────────────

async function seedSlots() {
  console.log("\n🗓️  Slots");

  // ── Breathwork Activation (session, ~90 min) ──
  await createDoc("slots", "slot-breath-1", {
    experienceId: "exp-breathwork",
    editionId: "ed-breathwork-may",
    slotType: "single_session",
    startDatetime: futureDate(3, 10, 0),
    endDatetime: futureDate(3, 11, 30),
    timezone: "America/Mexico_City",
    capacity: 20,
    bookedCount: 0,
    locationId: "loc-pvr-studio",
    roomId: "room-studio-main",
    status: "published",
    notes: "Saturday morning breathwork — Main Studio",
  });
  await createDoc("slots", "slot-breath-2", {
    experienceId: "exp-breathwork",
    editionId: "ed-breathwork-may",
    slotType: "single_session",
    startDatetime: futureDate(7, 18, 0),
    endDatetime: futureDate(7, 19, 30),
    timezone: "America/Mexico_City",
    capacity: 15,
    bookedCount: 0,
    locationId: "loc-pvr-studio",
    roomId: "room-studio-main",
    status: "published",
    notes: "Wednesday evening breathwork — candlelight session",
  });
  await createDoc("slots", "slot-breath-3", {
    experienceId: "exp-breathwork",
    editionId: "ed-breathwork-may",
    slotType: "single_session",
    startDatetime: futureDate(10, 10, 0),
    endDatetime: futureDate(10, 11, 30),
    timezone: "America/Mexico_City",
    capacity: 20,
    bookedCount: 0,
    locationId: "loc-pvr-studio",
    roomId: "room-studio-main",
    status: "published",
  });
  await createDoc("slots", "slot-breath-full", {
    experienceId: "exp-breathwork",
    editionId: "ed-breathwork-may",
    slotType: "single_session",
    startDatetime: futureDate(1, 19, 0),
    endDatetime: futureDate(1, 20, 30),
    timezone: "America/Mexico_City",
    capacity: 15,
    bookedCount: 13,
    locationId: "loc-pvr-studio",
    roomId: "room-studio-main",
    status: "published",
    notes: "Almost full — only 2 spots left",
  });

  // ── Sunrise Meditation (session, ~60 min) ──
  await createDoc("slots", "slot-sunrise-1", {
    experienceId: "exp-sunrise",
    editionId: "ed-sunrise-may",
    slotType: "single_session",
    startDatetime: futureDate(2, 6, 30),
    endDatetime: futureDate(2, 7, 30),
    timezone: "America/Mexico_City",
    capacity: 12,
    bookedCount: 0,
    locationId: "loc-pvr-beach",
    roomId: "room-beach-sunrise",
    status: "published",
    notes: "Dawn session on the Sunrise Deck — arrive 15 min early",
  });
  await createDoc("slots", "slot-sunrise-2", {
    experienceId: "exp-sunrise",
    editionId: "ed-sunrise-may",
    slotType: "single_session",
    startDatetime: futureDate(5, 6, 30),
    endDatetime: futureDate(5, 7, 30),
    timezone: "America/Mexico_City",
    capacity: 12,
    bookedCount: 0,
    locationId: "loc-pvr-beach",
    roomId: "room-beach-sunrise",
    status: "published",
  });
  await createDoc("slots", "slot-sunrise-3", {
    experienceId: "exp-sunrise",
    editionId: "ed-sunrise-may",
    slotType: "single_session",
    startDatetime: futureDate(9, 6, 30),
    endDatetime: futureDate(9, 7, 30),
    timezone: "America/Mexico_City",
    capacity: 12,
    bookedCount: 0,
    locationId: "loc-pvr-beach",
    roomId: "room-beach-sunrise",
    status: "published",
  });

  // ── Forest Bathing (immersion, ~4 hours) ──
  await createDoc("slots", "slot-forest-1", {
    experienceId: "exp-forest",
    editionId: "ed-forest-may",
    slotType: "single_session",
    startDatetime: futureDate(4, 7, 0),
    endDatetime: futureDate(4, 11, 0),
    timezone: "America/Mexico_City",
    capacity: 10,
    bookedCount: 0,
    locationId: "loc-pvr-jungle",
    roomId: "room-jungle-pavilion",
    status: "published",
    notes: "Half-day forest immersion — wear comfortable shoes, bring water",
  });
  await createDoc("slots", "slot-forest-2", {
    experienceId: "exp-forest",
    editionId: "ed-forest-may",
    slotType: "single_session",
    startDatetime: futureDate(11, 7, 0),
    endDatetime: futureDate(11, 11, 0),
    timezone: "America/Mexico_City",
    capacity: 10,
    bookedCount: 0,
    locationId: "loc-pvr-jungle",
    roomId: "room-jungle-pavilion",
    status: "published",
  });

  // ── Deep Rest Retreat (3-day retreat) ──
  await createDoc("slots", "slot-retreat-1", {
    experienceId: "exp-retreat",
    editionId: "ed-retreat-jun",
    slotType: "retreat_day",
    startDatetime: futureDate(14, 16, 0),
    endDatetime: futureDate(17, 12, 0),
    timezone: "America/Mexico_City",
    capacity: 8,
    bookedCount: 0,
    locationId: "loc-pvr-jungle",
    status: "published",
    notes: "3-night retreat — check-in 4 PM Friday, checkout noon Monday. Jungle Sanctuary.",
  });

  // ── Sound Healing Journey (session, ~75 min) ──
  await createDoc("slots", "slot-sound-1", {
    experienceId: "exp-sound-healing",
    editionId: "ed-sound-may",
    slotType: "single_session",
    startDatetime: futureDate(4, 19, 0),
    endDatetime: futureDate(4, 20, 15),
    timezone: "America/Mexico_City",
    capacity: 15,
    bookedCount: 0,
    locationId: "loc-pvr-studio",
    roomId: "room-studio-main",
    status: "published",
    notes: "Friday evening sound bath — candlelight and incense",
  });
  await createDoc("slots", "slot-sound-2", {
    experienceId: "exp-sound-healing",
    editionId: "ed-sound-may",
    slotType: "single_session",
    startDatetime: futureDate(8, 19, 0),
    endDatetime: futureDate(8, 20, 15),
    timezone: "America/Mexico_City",
    capacity: 15,
    bookedCount: 0,
    locationId: "loc-pvr-studio",
    roomId: "room-studio-main",
    status: "published",
  });
  await createDoc("slots", "slot-sound-garden", {
    experienceId: "exp-sound-healing",
    editionId: "ed-sound-may",
    slotType: "single_session",
    startDatetime: futureDate(12, 20, 0),
    endDatetime: futureDate(12, 21, 15),
    timezone: "America/Mexico_City",
    capacity: 12,
    bookedCount: 0,
    locationId: "loc-pvr-studio",
    roomId: "room-studio-garden",
    status: "published",
    notes: "Special outdoor edition — sound bath under the stars on Garden Terrace",
  });

  // ── Tropical Vinyasa Flow (session, ~60 min) ──
  await createDoc("slots", "slot-yoga-1", {
    experienceId: "exp-yoga-flow",
    editionId: "ed-yoga-may",
    slotType: "single_session",
    startDatetime: futureDate(2, 7, 30),
    endDatetime: futureDate(2, 8, 30),
    timezone: "America/Mexico_City",
    capacity: 12,
    bookedCount: 0,
    locationId: "loc-pvr-beach",
    roomId: "room-beach-sunrise",
    status: "published",
    notes: "Morning yoga on Sunrise Deck — ocean breeze and birdsong",
  });
  await createDoc("slots", "slot-yoga-2", {
    experienceId: "exp-yoga-flow",
    editionId: "ed-yoga-may",
    slotType: "single_session",
    startDatetime: futureDate(5, 7, 30),
    endDatetime: futureDate(5, 8, 30),
    timezone: "America/Mexico_City",
    capacity: 12,
    bookedCount: 0,
    locationId: "loc-pvr-beach",
    roomId: "room-beach-sunrise",
    status: "published",
  });
  await createDoc("slots", "slot-yoga-3", {
    experienceId: "exp-yoga-flow",
    editionId: "ed-yoga-may",
    slotType: "single_session",
    startDatetime: futureDate(9, 7, 30),
    endDatetime: futureDate(9, 8, 30),
    timezone: "America/Mexico_City",
    capacity: 12,
    bookedCount: 0,
    locationId: "loc-pvr-beach",
    roomId: "room-beach-sunrise",
    status: "published",
  });
  await createDoc("slots", "slot-yoga-jungle", {
    experienceId: "exp-yoga-flow",
    editionId: "ed-yoga-may",
    slotType: "single_session",
    startDatetime: futureDate(6, 8, 0),
    endDatetime: futureDate(6, 9, 0),
    timezone: "America/Mexico_City",
    capacity: 15,
    bookedCount: 0,
    locationId: "loc-pvr-jungle",
    roomId: "room-jungle-pavilion",
    status: "published",
    notes: "Special jungle edition — yoga in the Open Air Pavilion",
  });

  // ── Weekend Wellness Stay (stay, 2 nights) ──
  await createDoc("slots", "slot-stay-1", {
    experienceId: "exp-wellness-weekend",
    editionId: "ed-stay-may",
    slotType: "multi_day",
    startDatetime: futureDate(6, 15, 0),
    endDatetime: futureDate(8, 12, 0),
    timezone: "America/Mexico_City",
    capacity: 4,
    bookedCount: 0,
    locationId: "loc-pvr-jungle",
    status: "published",
    notes: "Weekend stay — check-in Friday 3 PM, checkout Sunday noon. Jungle Sanctuary.",
  });
  await createDoc("slots", "slot-stay-2", {
    experienceId: "exp-wellness-weekend",
    editionId: "ed-stay-may",
    slotType: "multi_day",
    startDatetime: futureDate(13, 15, 0),
    endDatetime: futureDate(15, 12, 0),
    timezone: "America/Mexico_City",
    capacity: 4,
    bookedCount: 0,
    locationId: "loc-pvr-jungle",
    status: "published",
    notes: "Weekend stay — second available date",
  });
}

// ─── Slot Resources ───────────────────────────────────────────────────────

async function seedSlotResources() {
  console.log("\n🔗 Slot Resources");

  // Breathwork slots → Ana Lucía (lead)
  await createDoc("slot_resources", "sr-breath-1-ana", {
    slotId: "slot-breath-1",
    resourceId: "res-ana",
    role: "lead",
    notes: "Lead breathwork facilitator",
  });
  await createDoc("slot_resources", "sr-breath-2-ana", {
    slotId: "slot-breath-2",
    resourceId: "res-ana",
    role: "lead",
  });
  await createDoc("slot_resources", "sr-breath-3-ana", {
    slotId: "slot-breath-3",
    resourceId: "res-ana",
    role: "lead",
  });

  // Sunrise meditation → Ana Lucía (lead)
  await createDoc("slot_resources", "sr-sunrise-1-ana", {
    slotId: "slot-sunrise-1",
    resourceId: "res-ana",
    role: "lead",
    notes: "Dawn meditation guide",
  });
  await createDoc("slot_resources", "sr-sunrise-2-ana", {
    slotId: "slot-sunrise-2",
    resourceId: "res-ana",
    role: "lead",
  });

  // Forest bathing → Marco (lead)
  await createDoc("slot_resources", "sr-forest-1-marco", {
    slotId: "slot-forest-1",
    resourceId: "res-marco",
    role: "lead",
    notes: "Certified forest therapy guide",
  });
  await createDoc("slot_resources", "sr-forest-2-marco", {
    slotId: "slot-forest-2",
    resourceId: "res-marco",
    role: "lead",
  });

  // Retreat → Ana Lucía (lead) + Marco (assistant) + Sofía (support therapist)
  await createDoc("slot_resources", "sr-retreat-1-ana", {
    slotId: "slot-retreat-1",
    resourceId: "res-ana",
    role: "lead",
    notes: "Lead meditation and breathwork facilitator for the retreat",
  });
  await createDoc("slot_resources", "sr-retreat-1-marco", {
    slotId: "slot-retreat-1",
    resourceId: "res-marco",
    role: "assistant",
    notes: "Forest immersion guide — day 2 morning",
  });
  await createDoc("slot_resources", "sr-retreat-1-sofia", {
    slotId: "slot-retreat-1",
    resourceId: "res-sofia",
    role: "support",
    notes: "Massage therapist — individual sessions throughout the retreat",
  });

  // Sound Healing → Diego (lead)
  await createDoc("slot_resources", "sr-sound-1-diego", {
    slotId: "slot-sound-1",
    resourceId: "res-diego",
    role: "lead",
    notes: "Sound healing facilitator — bowls, gongs, and crystal bowls",
  });
  await createDoc("slot_resources", "sr-sound-2-diego", {
    slotId: "slot-sound-2",
    resourceId: "res-diego",
    role: "lead",
  });
  await createDoc("slot_resources", "sr-sound-garden-diego", {
    slotId: "slot-sound-garden",
    resourceId: "res-diego",
    role: "lead",
    notes: "Outdoor sound bath — special edition",
  });

  // Yoga Flow → Diego (lead)
  await createDoc("slot_resources", "sr-yoga-1-diego", {
    slotId: "slot-yoga-1",
    resourceId: "res-diego",
    role: "lead",
    notes: "Vinyasa flow instructor",
  });
  await createDoc("slot_resources", "sr-yoga-2-diego", {
    slotId: "slot-yoga-2",
    resourceId: "res-diego",
    role: "lead",
  });
  await createDoc("slot_resources", "sr-yoga-3-diego", {
    slotId: "slot-yoga-3",
    resourceId: "res-diego",
    role: "lead",
  });
  await createDoc("slot_resources", "sr-yoga-jungle-diego", {
    slotId: "slot-yoga-jungle",
    resourceId: "res-diego",
    role: "lead",
    notes: "Special jungle yoga session",
  });

  // Wellness Weekend Stay → Ana Lucía (lead) + Elena (support spa)
  await createDoc("slot_resources", "sr-stay-1-ana", {
    slotId: "slot-stay-1",
    resourceId: "res-ana",
    role: "lead",
    notes: "Lead facilitator — meditation and breathwork sessions during stay",
  });
  await createDoc("slot_resources", "sr-stay-1-elena", {
    slotId: "slot-stay-1",
    resourceId: "res-elena",
    role: "support",
    notes: "Spa therapist — aromatherapy massage included in stay",
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌿 OMZONE — Seeding foundational data (Puerto Vallarta)\n");

  await seedLocations();
  await seedRooms();
  await seedResources();
  await seedAddons();
  await seedAddonAssignments();
  await seedSlots();
  await seedSlotResources();

  console.log("\n✅ Seed complete!");
  console.log("\nLocations: 3 (Studio PVR, Jungle Sanctuary, Beachfront Terrace)");
  console.log("Rooms: 9 (3 studio, 4 jungle, 2 beach)");
  console.log("Resources: 5 (2 facilitators, 2 therapists, 1 instructor)");
  console.log("Addons: 7 (mat, tea, photo, transport, journal, smoothie, aromatherapy)");
  console.log("Addon assignments: 24 (across 8 experiences)");
  console.log("Slots: 20 (breathwork 4, sunrise 3, forest 2, retreat 1, sound 3, yoga 4, stay 2)");
  console.log("Slot resources: 20 (facilitator/therapist assignments)");
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
