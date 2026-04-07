/**
 * Seed script — creates demo publications with editorial sections for OMZONE.
 *
 * Run with:  APPWRITE_API_KEY=<key> node scripts/seed-publications.mjs
 *
 * Prerequisites: seed-experiences.mjs (for experienceId references).
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

// ─── Publications ─────────────────────────────────────────────────────────

async function seedPublications() {
  console.log("\n📰 Publications");

  // 1 ── Wellness article linked to sound healing / breathwork
  await createDoc("publications", "pub-art-of-sound-healing", {
    title: "The Art of Sound Healing",
    titleEs: "El Arte de la Sanación con Sonido",
    slug: "the-art-of-sound-healing",
    subtitle:
      "How ancient vibrations became one of the most sought-after wellness practices of our time.",
    subtitleEs:
      "Cómo las vibraciones ancestrales se convirtieron en una de las prácticas de bienestar más buscadas de nuestro tiempo.",
    excerpt:
      "Sound has been used as a healing tool for thousands of years. From Tibetan singing bowls to modern gong baths, the science behind vibrational therapy is catching up with what ancient cultures always knew: sound can heal.",
    excerptEs:
      "El sonido ha sido utilizado como herramienta de sanación durante miles de años. Desde cuencos tibetanos hasta baños de gongs modernos, la ciencia detrás de la terapia vibracional está alcanzando lo que las culturas ancestrales siempre supieron: el sonido puede sanar.",
    category: "blog",
    experienceId: "exp-breathwork",
    status: "published",
    publishedAt: new Date().toISOString(),
    seoTitle: "The Art of Sound Healing — Wellness Journal | OMZONE",
    seoDescription:
      "Discover how ancient sound healing practices are transforming modern wellness. From Tibetan bowls to guided breathwork sessions.",
  });

  // 2 ── Destination guide
  await createDoc("publications", "pub-pvr-wellness-paradise", {
    title: "Puerto Vallarta: A Wellness Paradise",
    titleEs: "Puerto Vallarta: Un Paraíso de Bienestar",
    slug: "puerto-vallarta-wellness-paradise",
    subtitle:
      "Beyond the beaches — discover why this Pacific coast gem is becoming a global wellness destination.",
    subtitleEs:
      "Más allá de las playas — descubre por qué esta joya del Pacífico se está convirtiendo en un destino de bienestar global.",
    excerpt:
      "Puerto Vallarta has long been known for its stunning coastline and vibrant culture. But a quieter revolution is taking place: the rise of the wellness traveler. From jungle retreats to beachfront yoga, the region offers an extraordinary convergence of nature, tradition, and intentional living.",
    excerptEs:
      "Puerto Vallarta ha sido conocido por su impresionante costa y vibrante cultura. Pero una revolución más silenciosa está ocurriendo: el auge del viajero de bienestar. Desde retiros en la selva hasta yoga frente al mar, la región ofrece una convergencia extraordinaria de naturaleza, tradición y vida intencional.",
    category: "blog",
    status: "published",
    publishedAt: new Date().toISOString(),
    seoTitle:
      "Puerto Vallarta: Wellness Paradise — Destination Guide | OMZONE",
    seoDescription:
      "Explore Puerto Vallarta as a wellness destination. Jungle retreats, beachfront yoga, Huichol traditions, and intentional living on Mexico's Pacific coast.",
  });

  // 3 ── Philosophy / brand story
  await createDoc("publications", "pub-behind-the-retreat", {
    title: "Behind the Retreat: Our Philosophy",
    titleEs: "Detrás del Retiro: Nuestra Filosofía",
    slug: "behind-the-retreat-our-philosophy",
    subtitle:
      "Why we believe rest is a radical act — and how OMZONE was born from that conviction.",
    subtitleEs:
      "Por qué creemos que descansar es un acto radical — y cómo OMZONE nació de esa convicción.",
    excerpt:
      "OMZONE was not born from a business plan. It was born from exhaustion — and from the realization that true rest is not a luxury, but a necessity. This is the story of how we decided to build a space where slowing down is the entire point.",
    excerptEs:
      "OMZONE no nació de un plan de negocios. Nació del agotamiento — y de la certeza de que el descanso verdadero no es un lujo, sino una necesidad. Esta es la historia de cómo decidimos construir un espacio donde desacelerar es todo el sentido.",
    category: "institutional",
    status: "published",
    publishedAt: new Date().toISOString(),
    seoTitle: "Our Philosophy — Behind the Retreat | OMZONE",
    seoDescription:
      "The story behind OMZONE. Why rest is radical, how our retreat philosophy was born, and what we believe about wellness, presence, and intentional living.",
  });
}

// ─── Publication Sections ─────────────────────────────────────────────────

async function seedSections() {
  console.log("\n📄 Publication Sections");

  // ── Sound Healing article sections ──

  await createDoc("sections", "sec-sound-1", {
    publicationId: "pub-art-of-sound-healing",
    sectionType: "text",
    title: "A History Written in Vibration",
    titleEs: "Una Historia Escrita en Vibración",
    content:
      "Long before modern science could measure frequency, ancient civilizations understood that sound carries power. Aboriginal Australians played the didgeridoo as a healing instrument over 40,000 years ago. Tibetan monks have used singing bowls for centuries, not merely as musical objects, but as tools to shift consciousness.\n\nThe principle is elegantly simple: every cell in your body vibrates at a specific frequency. When stress, illness, or emotional tension disrupts this natural resonance, sound can help restore it. This is not metaphor — it is physics.\n\nToday, hospitals use ultrasound to break kidney stones. Music therapists work with patients recovering from strokes. And in wellness spaces around the world, practitioners are rediscovering what the ancients always knew: when the right frequency meets a willing body, something shifts.",
    contentEs:
      "Mucho antes de que la ciencia moderna pudiera medir la frecuencia, las civilizaciones antiguas entendieron que el sonido porta poder. Los aborígenes australianos tocaban el didgeridoo como instrumento de sanación hace más de 40,000 años. Los monjes tibetanos han utilizado cuencos cantores durante siglos, no simplemente como objetos musicales, sino como herramientas para cambiar la conciencia.\n\nEl principio es elegantemente simple: cada célula de tu cuerpo vibra en una frecuencia específica. Cuando el estrés, la enfermedad o la tensión emocional interrumpen esta resonancia natural, el sonido puede ayudar a restaurarla. Esto no es metáfora — es física.\n\nHoy, los hospitales usan ultrasonido para romper cálculos renales. Los musicoterapeutas trabajan con pacientes recuperándose de accidentes cerebrovasculares. Y en espacios de bienestar alrededor del mundo, los practicantes están redescubriendo lo que los ancestros siempre supieron: cuando la frecuencia correcta encuentra un cuerpo dispuesto, algo cambia.",
    sortOrder: 1,
    isVisible: true,
  });

  await createDoc("sections", "sec-sound-2", {
    publicationId: "pub-art-of-sound-healing",
    sectionType: "highlights",
    title: "What Happens During a Sound Bath",
    titleEs: "Qué Sucede Durante un Baño de Sonido",
    content:
      "You lie down. You close your eyes. And then the sound begins — not music exactly, but a layered landscape of tones that seem to come from everywhere and nowhere at once. Crystal bowls hum at frequencies that slow your brainwaves from beta (alert, anxious) to theta (deep relaxation, meditation). Gongs send waves of vibration through your body that can release tension held in muscles for years.\n\nParticipants commonly report tingling sensations, emotional release, vivid imagery, and a profound sense of peace. Some fall into a state between waking and sleep — a liminal space where the body's natural healing mechanisms are most active.\n\nThere is no effort required. No technique to master. Just presence.",
    contentEs:
      "Te acuestas. Cierras los ojos. Y entonces el sonido comienza — no es música exactamente, sino un paisaje de tonos por capas que parecen venir de todas partes y de ninguna al mismo tiempo. Los cuencos de cristal vibran en frecuencias que desaceleran tus ondas cerebrales de beta (alerta, ansiosas) a theta (relajación profunda, meditación). Los gongs envían olas de vibración a través de tu cuerpo que pueden liberar tensión retenida en los músculos durante años.\n\nLos participantes comúnmente reportan sensaciones de cosquilleo, liberación emocional, imágenes vívidas y una profunda sensación de paz. Algunos caen en un estado entre vigilia y sueño — un espacio liminal donde los mecanismos naturales de sanación del cuerpo son más activos.\n\nNo se requiere esfuerzo. No hay técnica que dominar. Solo presencia.",
    sortOrder: 2,
    isVisible: true,
  });

  await createDoc("sections", "sec-sound-3", {
    publicationId: "pub-art-of-sound-healing",
    sectionType: "cta",
    title: "Experience It Yourself",
    titleEs: "Vívelo Tú Mismo",
    content:
      "Our Breathwork Activation sessions incorporate live ambient soundscapes, crystal bowls, and guided breathing to create a deeply immersive healing experience. The next session is just a few days away.",
    contentEs:
      "Nuestras sesiones de Activación de Respiración Consciente incorporan paisajes sonoros ambientales en vivo, cuencos de cristal y respiración guiada para crear una experiencia de sanación profundamente inmersiva. La próxima sesión está a solo unos días.",
    metadata: JSON.stringify({
      ctaText: "Explore Breathwork Sessions",
      ctaTextEs: "Explorar Sesiones de Breathwork",
      ctaLink: "/experiences/breathwork-activation",
    }),
    sortOrder: 3,
    isVisible: true,
  });

  // ── Puerto Vallarta guide sections ──

  await createDoc("sections", "sec-pvr-1", {
    publicationId: "pub-pvr-wellness-paradise",
    sectionType: "text",
    title: "The Quiet Revolution",
    titleEs: "La Revolución Silenciosa",
    content:
      "Puerto Vallarta sits where the Sierra Madre meets the Pacific — a geography that creates microclimates of extraordinary biodiversity, from tropical dry forest to cloud-kissed mountain peaks. For decades, travelers came for the beaches, the nightlife, the all-inclusive resorts. But a new wave of visitors is arriving with different intentions.\n\nThey come to unplug. To breathe. To step out of the relentless pace of modern life and into something slower, deeper, more deliberate.\n\nThe Bahía de Banderas region — stretching from Punta de Mita to the southern jungles beyond Mismaloya — now hosts an ecosystem of wellness practitioners, retreat centers, organic farms, and holistic communities. Yoga shalas overlook the ocean. Temazcal ceremonies are led by Huichol elders. Sound healers set up beside rivers in the jungle.\n\nThis is no longer a trend. It is a transformation.",
    contentEs:
      "Puerto Vallarta se encuentra donde la Sierra Madre se encuentra con el Pacífico — una geografía que crea microclimas de extraordinaria biodiversidad, desde bosque tropical seco hasta cimas de montañas besadas por las nubes. Durante décadas, los viajeros venían por las playas, la vida nocturna, los resorts todo incluido. Pero una nueva ola de visitantes llega con intenciones diferentes.\n\nVienen a desconectarse. A respirar. A salir del ritmo implacable de la vida moderna y entrar en algo más lento, profundo, más deliberado.\n\nLa región de Bahía de Banderas — que se extiende desde Punta de Mita hasta las selvas del sur más allá de Mismaloya — ahora alberga un ecosistema de practicantes de bienestar, centros de retiro, granjas orgánicas y comunidades holísticas. Shalas de yoga con vista al océano. Ceremonias de temazcal dirigidas por ancianos huicholes. Sanadores con sonido instalados junto a ríos en la selva.\n\nEsto ya no es una tendencia. Es una transformación.",
    sortOrder: 1,
    isVisible: true,
  });

  await createDoc("sections", "sec-pvr-2", {
    publicationId: "pub-pvr-wellness-paradise",
    sectionType: "text",
    title: "Nature as the First Teacher",
    titleEs: "La Naturaleza como Primera Maestra",
    content:
      "What makes Vallarta uniquely powerful as a wellness destination is not what humans have built — it is what was already here.\n\nThe jungle canopy filters light into patterns that naturally calm the nervous system. The sound of the ocean lulls your brainwaves into alpha states. The negative ions generated by waterfalls and surf literally change your blood chemistry, increasing serotonin and reducing inflammation.\n\nWhen we designed our experiences, we did not try to compete with nature. We learned to collaborate with it. Our forest bathing immersions follow trails chosen for their canopy density and acoustic richness. Our sunrise meditations are timed to the exact moment when the light shifts from indigo to gold. The environment is not a backdrop — it is the co-facilitator.\n\nIn Vallarta, nature does not just surround you. It holds you.",
    contentEs:
      "Lo que hace a Vallarta singularmente poderoso como destino de bienestar no es lo que los humanos han construido — es lo que ya estaba aquí.\n\nEl dosel de la selva filtra la luz en patrones que naturalmente calman el sistema nervioso. El sonido del océano lleva tus ondas cerebrales a estados alfa. Los iones negativos generados por cascadas y oleaje literalmente cambian tu química sanguínea, aumentando la serotonina y reduciendo la inflamación.\n\nCuando diseñamos nuestras experiencias, no intentamos competir con la naturaleza. Aprendimos a colaborar con ella. Nuestras inmersiones de baño de bosque siguen senderos elegidos por su densidad de dosel y riqueza acústica. Nuestras meditaciones al amanecer están cronometradas al momento exacto en que la luz cambia de índigo a dorado. El entorno no es un telón de fondo — es el co-facilitador.\n\nEn Vallarta, la naturaleza no solo te rodea. Te sostiene.",
    sortOrder: 2,
    isVisible: true,
  });

  await createDoc("sections", "sec-pvr-3", {
    publicationId: "pub-pvr-wellness-paradise",
    sectionType: "cta",
    title: "Begin Your Journey",
    titleEs: "Comienza Tu Viaje",
    content:
      "Puerto Vallarta is waiting. And so is the version of yourself that emerges when you finally give yourself permission to slow down.",
    contentEs:
      "Puerto Vallarta te espera. Y también la versión de ti mismo que emerge cuando finalmente te das permiso de desacelerar.",
    metadata: JSON.stringify({
      ctaText: "Explore All Experiences",
      ctaTextEs: "Explorar Todas las Experiencias",
      ctaLink: "/experiences",
    }),
    sortOrder: 3,
    isVisible: true,
  });

  // ── Behind the Retreat sections ──

  await createDoc("sections", "sec-retreat-1", {
    publicationId: "pub-behind-the-retreat",
    sectionType: "text",
    title: "Born from Exhaustion",
    titleEs: "Nacido del Agotamiento",
    content:
      "OMZONE was not drafted on a whiteboard. It was scribbled in a notebook at 2 AM by someone who had just finished a 14-hour day and realized — with the clarity that only true fatigue brings — that something fundamental was broken.\n\nNot the work itself, but the way we had collectively agreed to live: always available, always optimizing, always performing wellness without actually resting. We had meditation apps but no time to meditate. We had sleep trackers but no permission to sleep.\n\nThe question that started everything was simple: What if rest was the point? Not a reward for productivity. Not a recovery strategy. Not a trend. Just the thing itself — valuable, necessary, and radically undervalued.",
    contentEs:
      "OMZONE no se diseñó en un pizarrón. Se garabateó en una libreta a las 2 AM por alguien que acababa de terminar un día de 14 horas y se dio cuenta — con la claridad que solo trae el agotamiento verdadero — de que algo fundamental estaba roto.\n\nNo el trabajo en sí, sino la forma en que habíamos acordado colectivamente vivir: siempre disponibles, siempre optimizando, siempre performando bienestar sin realmente descansar. Teníamos apps de meditación pero no tiempo para meditar. Teníamos rastreadores de sueño pero no permiso para dormir.\n\nLa pregunta que empezó todo fue simple: ¿Qué pasaría si el descanso fuera el punto? No una recompensa por la productividad. No una estrategia de recuperación. No una tendencia. Solo la cosa misma — valiosa, necesaria y radicalmente subvalorada.",
    sortOrder: 1,
    isVisible: true,
  });

  await createDoc("sections", "sec-retreat-2", {
    publicationId: "pub-behind-the-retreat",
    sectionType: "text",
    title: "The Three Pillars",
    titleEs: "Los Tres Pilares",
    content:
      "Every decision at OMZONE passes through three questions:\n\n**Does it create stillness?** If an experience adds noise — even sophisticated noise — we rethink it. Our retreats have no background music in common areas. Meals are served without rush. The schedule includes generous white space. We believe silence is not absence. It is the room where something important can finally be heard.\n\n**Does it honor the body?** We reject the wellness-industrial complex that packages self-care as another form of achievement. You will not be scored, ranked, or measured here. Our yoga is gentle. Our meals are nourishing, not restrictive. Our therapists ask what you need, not what you should need.\n\n**Does it make you want to return?** Not from FOMO, but from memory. We design experiences that stay with you — the scent of copal in the morning air, the sound of rain on a tin roof during savasana, the taste of a mango picked from the tree outside your casita. These are not amenities. They are moments.",
    contentEs:
      "Cada decisión en OMZONE pasa por tres preguntas:\n\n**¿Crea quietud?** Si una experiencia añade ruido — incluso ruido sofisticado — la repensamos. Nuestros retiros no tienen música de fondo en áreas comunes. Las comidas se sirven sin prisa. La agenda incluye generosos espacios en blanco. Creemos que el silencio no es ausencia. Es la habitación donde algo importante finalmente puede ser escuchado.\n\n**¿Honra el cuerpo?** Rechazamos el complejo industrial del bienestar que empaqueta el autocuidado como otra forma de logro. Aquí no serás puntuado, clasificado ni medido. Nuestro yoga es suave. Nuestras comidas son nutritivas, no restrictivas. Nuestros terapeutas preguntan qué necesitas, no qué deberías necesitar.\n\n**¿Te hace querer volver?** No desde el FOMO, sino desde la memoria. Diseñamos experiencias que se quedan contigo — el aroma del copal en el aire matutino, el sonido de la lluvia sobre un techo de lámina durante savasana, el sabor de un mango recogido del árbol junto a tu casita. Estos no son amenidades. Son momentos.",
    sortOrder: 2,
    isVisible: true,
  });

  await createDoc("sections", "sec-retreat-3", {
    publicationId: "pub-behind-the-retreat",
    sectionType: "cta",
    title: "Join Us",
    titleEs: "Únete a Nosotros",
    content:
      "If something in this resonated with you — if you felt a small permission being granted just by reading it — that is exactly what our retreats feel like. Only deeper.",
    contentEs:
      "Si algo de esto resonó contigo — si sentiste un pequeño permiso siendo otorgado solo al leerlo — eso es exactamente lo que se siente en nuestros retiros. Solo que más profundo.",
    metadata: JSON.stringify({
      ctaText: "Discover the Deep Rest Retreat",
      ctaTextEs: "Descubre el Retiro de Descanso Profundo",
      ctaLink: "/experiences/deep-rest-retreat",
    }),
    sortOrder: 3,
    isVisible: true,
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("📝 OMZONE — Seeding publications\n");

  await seedPublications();
  await seedSections();

  console.log("\n✅ Publication seed complete.\n");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
