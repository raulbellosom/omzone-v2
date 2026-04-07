/**
 * Seed script — creates demo experiences, editions, pricing tiers, tags
 * and experience-tag assignments for OMZONE.
 *
 * Run with:  APPWRITE_API_KEY=<key> node scripts/seed-experiences.mjs
 *
 * Prerequisites: seed-test-data.mjs (locations, addons, slots) should run first.
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

// ─── Tags ─────────────────────────────────────────────────────────────────

async function seedTags() {
  console.log("\n🏷️  Tags");

  await createDoc("tags", "tag-sound-healing", {
    name: "Sound Healing",
    nameEs: "Sanación con Sonido",
    slug: "sound-healing",
    category: "wellness",
    sortOrder: 1,
  });
  await createDoc("tags", "tag-meditation", {
    name: "Meditation",
    nameEs: "Meditación",
    slug: "meditation",
    category: "wellness",
    sortOrder: 2,
  });
  await createDoc("tags", "tag-breathwork", {
    name: "Breathwork",
    nameEs: "Respiración Consciente",
    slug: "breathwork",
    category: "wellness",
    sortOrder: 3,
  });
  await createDoc("tags", "tag-nature", {
    name: "Nature Immersion",
    nameEs: "Inmersión en Naturaleza",
    slug: "nature-immersion",
    category: "activity",
    sortOrder: 4,
  });
  await createDoc("tags", "tag-retreat", {
    name: "Retreat",
    nameEs: "Retiro",
    slug: "retreat",
    category: "wellness",
    sortOrder: 5,
  });
  await createDoc("tags", "tag-couples", {
    name: "Couples",
    nameEs: "Parejas",
    slug: "couples",
    category: "audience",
    sortOrder: 6,
  });
  await createDoc("tags", "tag-spa", {
    name: "Spa & Massage",
    nameEs: "Spa y Masaje",
    slug: "spa-massage",
    category: "wellness",
    sortOrder: 7,
  });
  await createDoc("tags", "tag-beginner", {
    name: "Beginner Friendly",
    nameEs: "Para Principiantes",
    slug: "beginner-friendly",
    category: "level",
    sortOrder: 8,
  });
  await createDoc("tags", "tag-pvr", {
    name: "Puerto Vallarta",
    nameEs: "Puerto Vallarta",
    slug: "puerto-vallarta",
    category: "location",
    sortOrder: 9,
  });
  await createDoc("tags", "tag-weekend", {
    name: "Weekend",
    nameEs: "Fin de Semana",
    slug: "weekend",
    category: "duration",
    sortOrder: 10,
  });
  await createDoc("tags", "tag-yoga", {
    name: "Yoga",
    nameEs: "Yoga",
    slug: "yoga",
    category: "wellness",
    sortOrder: 11,
  });
  await createDoc("tags", "tag-overnight", {
    name: "Overnight Stay",
    nameEs: "Estancia con Hospedaje",
    slug: "overnight-stay",
    category: "duration",
    sortOrder: 12,
  });
}

// ─── Experiences ──────────────────────────────────────────────────────────

async function seedExperiences() {
  console.log("\n🌿 Experiences");

  // 1 ── Breathwork Activation (session)
  await createDoc("experiences", "exp-breathwork", {
    name: "Breathwork Activation",
    publicName: "Breathwork Activation",
    publicNameEs: "Activación de Respiración Consciente",
    slug: "breathwork-activation",
    type: "session",
    saleMode: "direct",
    fulfillmentType: "ticket",
    shortDescription:
      "A transformative 90-minute breathwork journey designed to release tension, awaken energy, and reconnect you with your body's natural rhythm.",
    shortDescriptionEs:
      "Un viaje transformador de respiración consciente de 90 minutos diseñado para liberar tensión, despertar tu energía y reconectarte con el ritmo natural de tu cuerpo.",
    longDescription:
      "Step into a space of intentional stillness and let your breath guide you inward. This session blends ancient pranayama techniques with modern somatic practices, creating a powerful bridge between body and mind.\n\nGuided by our certified facilitators, you will move through rhythmic breathing patterns that gently dissolve accumulated stress, open blocked energy pathways, and awaken a profound sense of presence. Many participants describe the experience as deeply emotional — a release they didn't know they needed.\n\nThe session takes place in our intimate studio space, bathed in warm candlelight and accompanied by live ambient soundscapes. We provide everything you need: comfortable mats, eye masks, and herbal tea to close the ceremony.\n\nWhether you are new to breathwork or a seasoned practitioner, this session meets you exactly where you are.",
    longDescriptionEs:
      "Entra en un espacio de quietud intencional y deja que tu respiración te guíe hacia adentro. Esta sesión fusiona técnicas ancestrales de pranayama con prácticas somáticas modernas, creando un puente poderoso entre cuerpo y mente.\n\nGuiado por nuestros facilitadores certificados, te moverás a través de patrones rítmicos de respiración que disuelven suavemente el estrés acumulado, abren vías de energía bloqueadas y despiertan una profunda sensación de presencia. Muchos participantes describen la experiencia como profundamente emocional — una liberación que no sabían que necesitaban.\n\nLa sesión tiene lugar en nuestro íntimo espacio de estudio, bañado en cálida luz de velas y acompañado de paisajes sonoros ambientales en vivo. Proporcionamos todo lo que necesitas: tapetes cómodos, antifaces y té herbal para cerrar la ceremonia.\n\nYa seas nuevo en el breathwork o un practicante experimentado, esta sesión te encuentra exactamente donde estás.",
    requiresSchedule: true,
    requiresDate: false,
    allowQuantity: true,
    maxQuantity: 5,
    minQuantity: 1,
    generatesTickets: true,
    status: "published",
    sortOrder: 1,
    seoTitle: "Breathwork Activation — 90min Guided Session | OMZONE",
    seoDescription:
      "Release tension and awaken energy through guided breathwork in Puerto Vallarta. 90-minute transformative session with live ambient sound.",
  });

  // 2 ── Sunrise Meditation (session)
  await createDoc("experiences", "exp-sunrise", {
    name: "Sunrise Meditation",
    publicName: "Sunrise Meditation",
    publicNameEs: "Meditación al Amanecer",
    slug: "sunrise-meditation",
    type: "session",
    saleMode: "direct",
    fulfillmentType: "ticket",
    shortDescription:
      "Welcome the day with a guided sunrise meditation surrounded by the sounds of nature — an unforgettable ritual of stillness and gratitude.",
    shortDescriptionEs:
      "Recibe el día con una meditación guiada al amanecer rodeado de los sonidos de la naturaleza — un ritual inolvidable de quietud y gratitud.",
    longDescription:
      "As the first light breaks across the Sierra, you are already seated — eyes soft, breath steady, wrapped in the cool mountain air. This is not a class. It is a ritual.\n\nOur facilitator guides you through a progressive meditation that begins with body awareness, moves into breath observation, and settles into open awareness — a spacious silence where the boundary between you and nature dissolves.\n\nThe session lasts approximately 60 minutes, followed by a communal moment of gratitude and a warm cup of herbal tea as the valley fills with golden light.\n\nNo prior meditation experience is necessary. We welcome absolute beginners and lifelong practitioners alike. The mountain does not judge — neither do we.",
    longDescriptionEs:
      "Cuando la primera luz cruza la Sierra, ya estás sentado — ojos suaves, respiración estable, envuelto en el aire fresco de la montaña. Esto no es una clase. Es un ritual.\n\nNuestro facilitador te guía a través de una meditación progresiva que comienza con conciencia corporal, avanza hacia la observación de la respiración y se asienta en una conciencia abierta — un silencio espacioso donde la frontera entre tú y la naturaleza se disuelve.\n\nLa sesión dura aproximadamente 60 minutos, seguida de un momento comunitario de gratitud y una taza caliente de té herbal mientras el valle se llena de luz dorada.\n\nNo se requiere experiencia previa en meditación. Damos la bienvenida tanto a principiantes absolutos como a practicantes de toda la vida. La montaña no juzga — nosotros tampoco.",
    requiresSchedule: true,
    requiresDate: false,
    allowQuantity: true,
    maxQuantity: 4,
    minQuantity: 1,
    generatesTickets: true,
    status: "published",
    sortOrder: 2,
    seoTitle: "Sunrise Meditation — Dawn Ritual in the Mountains | OMZONE",
    seoDescription:
      "Begin your day with a guided sunrise meditation in nature. 60-minute ritual of stillness, gratitude, and herbal tea in the Sierra mountains.",
  });

  // 3 ── Forest Bathing (immersion)
  await createDoc("experiences", "exp-forest", {
    name: "Forest Bathing Immersion",
    publicName: "Forest Bathing Immersion",
    publicNameEs: "Inmersión de Baño de Bosque",
    slug: "forest-bathing-immersion",
    type: "immersion",
    saleMode: "direct",
    fulfillmentType: "ticket",
    shortDescription:
      "A half-day sensory immersion in ancient forest — slow walking, deep listening, and the healing presence of trees.",
    shortDescriptionEs:
      "Una inmersión sensorial de medio día en bosque ancestral — caminata lenta, escucha profunda y la presencia sanadora de los árboles.",
    longDescription:
      "Inspired by the Japanese practice of Shinrin-yoku, this four-hour immersion invites you to step away from the noise and into the living, breathing intelligence of the forest.\n\nUnder the guidance of a certified forest therapy facilitator, you will move slowly through a carefully chosen trail, pausing at invitations — moments designed to deepen your sensory connection with the environment. Touch the bark of an ancient oak. Listen to the conversation between wind and leaves. Feel the earth support each step.\n\nThis is not a hike. There is no destination. The forest itself is the experience.\n\nThe immersion concludes with a tea ceremony prepared with plants gathered along the trail — a final gesture of reciprocity between you and the land.\n\nParticipants consistently report reduced stress, heightened clarity, and a renewed sense of belonging after this experience. Limited to 10 participants to preserve the intimacy of the encounter.",
    longDescriptionEs:
      "Inspirada en la práctica japonesa del Shinrin-yoku, esta inmersión de cuatro horas te invita a alejarte del ruido y entrar en la inteligencia viva y respirante del bosque.\n\nBajo la guía de un facilitador certificado en terapia forestal, te moverás lentamente por un sendero cuidadosamente elegido, deteniéndote en invitaciones — momentos diseñados para profundizar tu conexión sensorial con el entorno. Toca la corteza de un roble ancestral. Escucha la conversación entre el viento y las hojas. Siente la tierra sosteniendo cada paso.\n\nEsto no es una caminata. No hay destino. El bosque mismo es la experiencia.\n\nLa inmersión concluye con una ceremonia de té preparada con plantas recolectadas a lo largo del sendero — un gesto final de reciprocidad entre tú y la tierra.\n\nLos participantes reportan consistentemente menor estrés, mayor claridad y un renovado sentido de pertenencia después de esta experiencia. Limitado a 10 participantes para preservar la intimidad del encuentro.",
    requiresSchedule: true,
    requiresDate: false,
    allowQuantity: true,
    maxQuantity: 3,
    minQuantity: 1,
    generatesTickets: true,
    status: "published",
    sortOrder: 3,
    seoTitle: "Forest Bathing Immersion — Half-Day Shinrin-yoku | OMZONE",
    seoDescription:
      "Half-day forest bathing experience inspired by Shinrin-yoku. Slow walking, deep listening, and tea ceremony in ancient mountain forest.",
  });

  // 4 ── Deep Rest Retreat (3-day retreat)
  await createDoc("experiences", "exp-retreat", {
    name: "Deep Rest Retreat",
    publicName: "Deep Rest Retreat",
    publicNameEs: "Retiro de Descanso Profundo",
    slug: "deep-rest-retreat",
    type: "retreat",
    saleMode: "direct",
    fulfillmentType: "ticket",
    shortDescription:
      "Three days of intentional rest, restorative practices, and nourishing meals in our mountain sanctuary — a reset for body and mind.",
    shortDescriptionEs:
      "Tres días de descanso intencional, prácticas restaurativas y comidas nutritivas en nuestro santuario en la montaña — un reinicio para cuerpo y mente.",
    longDescription:
      "The Deep Rest Retreat is an invitation to do something radical: stop.\n\nFor three days, you will live at a pace your body has been craving. No alarms. No schedules to rush through. No screens competing for your attention. Instead, you will wake to birdsong, move through gentle yoga sequences, receive bodywork from skilled therapists, and nourish yourself with plant-forward meals prepared by our in-house chef.\n\nThe retreat is structured around three pillars: Stillness (meditation, silence, contemplation), Movement (yoga, walking, stretching), and Nourishment (meals, herbal infusions, community).\n\nAccommodation is in private casitas surrounded by forest. Each room features natural materials, blackout curtains for deep sleep, and a private terrace where you can watch the valley breathe.\n\nLimited to 8 guests per edition to ensure personal attention and an atmosphere of genuine intimacy.\n\nYou will leave lighter. Not because you carried less, but because you finally set something down.",
    longDescriptionEs:
      "El Retiro de Descanso Profundo es una invitación a hacer algo radical: detenerte.\n\nDurante tres días, vivirás a un ritmo que tu cuerpo ha estado anhelando. Sin alarmas. Sin agendas que correr. Sin pantallas compitiendo por tu atención. En su lugar, despertarás con el canto de los pájaros, te moverás a través de secuencias suaves de yoga, recibirás trabajo corporal de terapeutas especializados y te nutrirás con comidas de base vegetal preparadas por nuestro chef residente.\n\nEl retiro se estructura en torno a tres pilares: Quietud (meditación, silencio, contemplación), Movimiento (yoga, caminata, estiramiento) y Nutrición (comidas, infusiones herbales, comunidad).\n\nEl alojamiento es en casitas privadas rodeadas de bosque. Cada habitación presenta materiales naturales, cortinas blackout para un sueño profundo y una terraza privada donde puedes observar el valle respirar.\n\nLimitado a 8 huéspedes por edición para asegurar atención personalizada y una atmósfera de intimidad genuina.\n\nTe irás más ligero. No porque cargabas menos, sino porque finalmente dejaste algo ir.",
    requiresSchedule: true,
    requiresDate: true,
    allowQuantity: true,
    maxQuantity: 2,
    minQuantity: 1,
    generatesTickets: true,
    status: "published",
    sortOrder: 4,
    seoTitle: "Deep Rest Retreat — 3-Day Wellness Retreat | OMZONE",
    seoDescription:
      "Three-day restorative retreat in the mountains. Yoga, meditation, bodywork, and nourishing meals. Limited to 8 guests per edition.",
  });

  // 5 ── Private Couples Massage (private experience)
  await createDoc("experiences", "exp-couples-massage", {
    name: "Private Couples Massage",
    publicName: "Private Couples Massage",
    publicNameEs: "Masaje Privado para Parejas",
    slug: "private-couples-massage",
    type: "private",
    saleMode: "request",
    fulfillmentType: "booking",
    shortDescription:
      "A bespoke 90-minute massage experience for two — aromatherapy, warm stones, and uninterrupted presence in a private garden suite.",
    shortDescriptionEs:
      "Una experiencia de masaje personalizada de 90 minutos para dos — aromaterapia, piedras calientes y presencia ininterrumpida en una suite de jardín privada.",
    longDescription:
      "This is not a spa visit. It is a shared ritual of care.\n\nYou and your partner will be welcomed into our private garden suite — a space enclosed by tropical foliage, open to the sky, and designed for complete sensory comfort. Two skilled therapists work in synchrony, weaving together Swedish relaxation, deep tissue release, and warm volcanic stones enhanced with essential oils chosen for their calming properties.\n\nThe experience begins with a brief consultation to understand your preferences and any areas of tension. From there, your only task is to surrender.\n\nAfter the massage, you remain in the suite for as long as you wish — resting on heated loungers, sipping infused water, listening to the garden.\n\nAvailable by request. We accommodate your preferred date and time.",
    longDescriptionEs:
      "Esto no es una visita al spa. Es un ritual compartido de cuidado.\n\nTú y tu pareja serán recibidos en nuestra suite de jardín privada — un espacio envuelto por follaje tropical, abierto al cielo y diseñado para comodidad sensorial completa. Dos terapeutas especializados trabajan en sincronía, entrelazando relajación sueca, liberación de tejido profundo y piedras volcánicas calientes potenciadas con aceites esenciales elegidos por sus propiedades calmantes.\n\nLa experiencia comienza con una breve consulta para entender tus preferencias y cualquier área de tensión. A partir de ahí, tu única tarea es entregarte.\n\nDespués del masaje, permaneces en la suite todo el tiempo que desees — descansando en camastros calientes, saboreando agua infusionada, escuchando el jardín.\n\nDisponible por solicitud. Nos adaptamos a tu fecha y horario preferidos.",
    requiresSchedule: false,
    requiresDate: true,
    allowQuantity: false,
    maxQuantity: 2,
    minQuantity: 2,
    generatesTickets: false,
    status: "published",
    sortOrder: 5,
    seoTitle: "Private Couples Massage — Bespoke Spa Experience | OMZONE",
    seoDescription:
      "Bespoke 90-minute couples massage in a private garden suite. Aromatherapy, warm stones, and complete privacy in Puerto Vallarta.",
  });

  // 6 ── Sound Healing Journey (session)
  await createDoc("experiences", "exp-sound-healing", {
    name: "Sound Healing Journey",
    publicName: "Sound Healing Journey",
    publicNameEs: "Viaje de Sanación con Sonido",
    slug: "sound-healing-journey",
    type: "session",
    saleMode: "direct",
    fulfillmentType: "ticket",
    shortDescription:
      "A 75-minute immersive sound bath with Tibetan singing bowls, crystal bowls, and gongs — a vibrational journey that dissolves tension and opens space for deep inner stillness.",
    shortDescriptionEs:
      "Un baño de sonido inmersivo de 75 minutos con cuencos tibetanos, cuencos de cristal y gongs — un viaje vibracional que disuelve la tensión y abre espacio para una profunda quietud interior.",
    longDescription:
      "Close your eyes. Let sound do what words cannot.\n\nThis 75-minute sound healing journey guides you through layers of resonance created by Tibetan singing bowls, quartz crystal bowls, and a symphonic gong — each tuned to frequencies that interact with your body's natural energy centers.\n\nYou will lie comfortably on a cushioned mat, covered with a light blanket, as our facilitator Diego builds a soundscape that moves from gentle overtones into deep, resonant waves. Participants often describe the sensation as floating, melting, or being held by the sound itself.\n\nThe session begins with a brief body scan and breath awareness practice, then transitions into the sound bath. No prior experience is needed — the sound meets you wherever you are, whether your mind is racing or already quiet.\n\nAfter the journey, there is space for silent integration and a guided return to waking awareness. We close with a cup of warm herbal tea in candlelight.\n\nMany guests report improved sleep, emotional release, reduced anxiety, and a deep sense of calm that lasts for days after the session.",
    longDescriptionEs:
      "Cierra los ojos. Deja que el sonido haga lo que las palabras no pueden.\n\nEste viaje de sanación con sonido de 75 minutos te guía a través de capas de resonancia creadas por cuencos tibetanos, cuencos de cristal de cuarzo y un gong sinfónico — cada uno afinado a frecuencias que interactúan con los centros energéticos naturales de tu cuerpo.\n\nEstarás cómodamente recostado sobre un tapete acolchado, cubierto con una manta ligera, mientras nuestro facilitador Diego construye un paisaje sonoro que se mueve desde armónicos suaves hasta olas resonantes y profundas. Los participantes frecuentemente describen la sensación como flotar, derretirse o ser sostenidos por el sonido mismo.\n\nLa sesión comienza con un breve escaneo corporal y práctica de atención a la respiración, luego transiciona hacia el baño de sonido. No se necesita experiencia previa — el sonido te encuentra donde sea que estés, ya sea que tu mente esté acelerada o ya quieta.\n\nDespués del viaje, hay espacio para integración en silencio y un retorno guiado a la conciencia despierta. Cerramos con una taza de té herbal caliente a la luz de las velas.\n\nMuchos huéspedes reportan mejor sueño, liberación emocional, reducción de ansiedad y una profunda sensación de calma que dura días después de la sesión.",
    requiresSchedule: true,
    requiresDate: false,
    allowQuantity: true,
    maxQuantity: 4,
    minQuantity: 1,
    generatesTickets: true,
    status: "published",
    sortOrder: 6,
    seoTitle:
      "Sound Healing Journey — Tibetan Bowls & Gong Bath | OMZONE Puerto Vallarta",
    seoDescription:
      "75-minute sound healing session with Tibetan singing bowls, crystal bowls, and gongs in Puerto Vallarta. Deep relaxation and vibrational therapy.",
  });

  // 7 ── Tropical Vinyasa Flow (session)
  await createDoc("experiences", "exp-yoga-flow", {
    name: "Tropical Vinyasa Flow",
    publicName: "Tropical Vinyasa Flow",
    publicNameEs: "Vinyasa Flow Tropical",
    slug: "tropical-vinyasa-flow",
    type: "session",
    saleMode: "direct",
    fulfillmentType: "ticket",
    shortDescription:
      "A 60-minute morning yoga flow on an oceanfront terrace — breath-synchronized movement, tropical breeze, and the sound of Pacific waves as your soundtrack.",
    shortDescriptionEs:
      "Un flujo de yoga matutino de 60 minutos en una terraza frente al mar — movimiento sincronizado con la respiración, brisa tropical y el sonido de las olas del Pacífico como tu banda sonora.",
    longDescription:
      "The alarm is the sunrise. The studio is the ocean.\n\nThis 60-minute Vinyasa flow takes place on our Beachfront Terrace, an elevated open-air deck perched above Conchas Chinas, where the Pacific stretches endlessly to the west. You will move through a dynamic sequence of poses linked by breath — building heat, cultivating balance, and softening into stillness.\n\nInstructor Diego Ramírez designs each class around a theme drawn from the surrounding environment: the fluidity of water, the rootedness of tropical trees, the expansiveness of the horizon. The sequence progresses from sun salutations to standing poses, arm balances (optional), and floor work, closing with a 10-minute savasana accompanied by the rhythm of the waves below.\n\nAll levels are welcome. Modifications are offered for every pose, and the atmosphere is non-competitive — this is not a performance. It is a practice.\n\nAfter class, linger on the terrace. Watch the pelicans. Breathe the salt air. There is nowhere else to be.",
    longDescriptionEs:
      "La alarma es el amanecer. El estudio es el océano.\n\nEste flujo de Vinyasa de 60 minutos tiene lugar en nuestra Terraza Frente al Mar, una plataforma elevada al aire libre sobre Conchas Chinas, donde el Pacífico se extiende infinitamente hacia el oeste. Te moverás a través de una secuencia dinámica de posturas enlazadas por la respiración — generando calor, cultivando equilibrio y suavizándote hacia la quietud.\n\nEl instructor Diego Ramírez diseña cada clase alrededor de un tema inspirado por el entorno: la fluidez del agua, el arraigo de los árboles tropicales, la expansividad del horizonte. La secuencia progresa desde saludos al sol hacia posturas de pie, balances sobre brazos (opcionales) y trabajo en piso, cerrando con un savasana de 10 minutos acompañado por el ritmo de las olas debajo.\n\nTodos los niveles son bienvenidos. Se ofrecen modificaciones para cada postura, y la atmósfera es no competitiva — esto no es una presentación. Es una práctica.\n\nDespués de la clase, quédate en la terraza. Observa los pelícanos. Respira el aire salado. No hay otro lugar donde necesites estar.",
    requiresSchedule: true,
    requiresDate: false,
    allowQuantity: true,
    maxQuantity: 3,
    minQuantity: 1,
    generatesTickets: true,
    status: "published",
    sortOrder: 7,
    seoTitle:
      "Tropical Vinyasa Flow — Oceanfront Yoga | OMZONE Puerto Vallarta",
    seoDescription:
      "Morning Vinyasa yoga on a beachfront terrace in Puerto Vallarta. 60-minute flow with ocean views, all levels welcome. Book your spot today.",
  });

  // 8 ── Weekend Wellness Stay (stay)
  await createDoc("experiences", "exp-wellness-weekend", {
    name: "Weekend Wellness Stay",
    publicName: "Weekend Wellness Stay",
    publicNameEs: "Estancia Wellness de Fin de Semana",
    slug: "weekend-wellness-stay",
    type: "stay",
    saleMode: "direct",
    fulfillmentType: "booking",
    shortDescription:
      "Two nights at our Jungle Sanctuary in the Sierra de Vallejo — yoga, meditation, forest bathing, nourishing meals, and spa treatments woven into a weekend designed for complete restoration.",
    shortDescriptionEs:
      "Dos noches en nuestro Santuario en la Selva en la Sierra de Vallejo — yoga, meditación, baño de bosque, comidas nutritivas y tratamientos de spa entrelazados en un fin de semana diseñado para una restauración completa.",
    longDescription:
      "Some things require more than an afternoon. Some things require surrendering an entire weekend.\n\nThe Weekend Wellness Stay is OMZONE's signature overnight experience — two nights and three days at our Jungle Sanctuary, hidden in the foothills of the Sierra de Vallejo, 35 minutes north of Puerto Vallarta. From Friday afternoon to Sunday noon, you will live a rhythm shaped by nature: rising with the birds, moving with the breeze, eating when the body is hungry, resting when it asks.\n\nYour stay includes:\n\n• Two nights in a private casita (adobe walls, king bed, terrace with valley views, outdoor shower)\n• Daily morning yoga on the Open Air Pavilion (6:30 AM)\n• Guided meditation on the Meditation Deck\n• One half-day forest bathing immersion led by Marco Iván Torres\n• One 60-minute aromatherapy massage by Elena Cisneros\n• Three plant-forward meals daily, prepared with local ingredients from the Bahía de Banderas region\n• Unlimited access to herbal tea bar and cold-pressed juice station\n• Optional evening sound bath (Friday night)\n\nThe sanctuary accommodates a maximum of 4 guests per weekend to preserve intimacy and silence. There is no Wi-Fi by design — only birdsong, river sounds, and the wind through the trees.\n\nGuests consistently describe this experience as the reset they have been searching for — not a vacation from life, but a return to it.",
    longDescriptionEs:
      "Algunas cosas requieren más que una tarde. Algunas cosas requieren entregar un fin de semana completo.\n\nLa Estancia Wellness de Fin de Semana es la experiencia insignia con hospedaje de OMZONE — dos noches y tres días en nuestro Santuario en la Selva, escondido en las estribaciones de la Sierra de Vallejo, a 35 minutos al norte de Puerto Vallarta. Desde el viernes por la tarde hasta el domingo al mediodía, vivirás un ritmo moldeado por la naturaleza: levantarte con los pájaros, moverte con la brisa, comer cuando el cuerpo tiene hambre, descansar cuando lo pide.\n\nTu estancia incluye:\n\n• Dos noches en casita privada (paredes de adobe, cama king, terraza con vista al valle, regadera al aire libre)\n• Yoga matutino diario en el Pabellón al Aire Libre (6:30 AM)\n• Meditación guiada en la Plataforma de Meditación\n• Una inmersión de medio día de baño de bosque guiada por Marco Iván Torres\n• Un masaje de aromaterapia de 60 minutos por Elena Cisneros\n• Tres comidas diarias de base vegetal, preparadas con ingredientes locales de la región de Bahía de Banderas\n• Acceso ilimitado a barra de té herbal y estación de jugos prensados en frío\n• Baño de sonido opcional (viernes por la noche)\n\nEl santuario hospeda máximo 4 invitados por fin de semana para preservar la intimidad y el silencio. No hay Wi-Fi por diseño — solo el canto de los pájaros, los sonidos del río y el viento entre los árboles.\n\nLos huéspedes describen consistentemente esta experiencia como el reinicio que habían estado buscando — no unas vacaciones de la vida, sino un regreso a ella.",
    requiresSchedule: true,
    requiresDate: true,
    allowQuantity: true,
    maxQuantity: 2,
    minQuantity: 1,
    generatesTickets: false,
    status: "published",
    sortOrder: 8,
    seoTitle:
      "Weekend Wellness Stay — 2 Nights at Jungle Sanctuary | OMZONE Puerto Vallarta",
    seoDescription:
      "Two-night wellness retreat in the Sierra de Vallejo jungle near Puerto Vallarta. Yoga, forest bathing, spa, and nourishing meals. Limited to 4 guests.",
  });
}

// ─── Editions ─────────────────────────────────────────────────────────────

async function seedEditions() {
  console.log("\n📅 Editions");

  // Breathwork — rolling monthly edition
  await createDoc("editions", "ed-breathwork-may", {
    experienceId: "exp-breathwork",
    name: "May 2025 Sessions",
    nameEs: "Sesiones Mayo 2025",
    description: "All breathwork sessions scheduled for May 2025.",
    descriptionEs:
      "Todas las sesiones de respiración consciente programadas para mayo 2025.",
    startDate: futureDate(0),
    endDate: futureDate(30),
    registrationOpens: futureDate(-7),
    registrationCloses: futureDate(28),
    capacity: 80,
    status: "open",
  });

  // Sunrise — rolling edition
  await createDoc("editions", "ed-sunrise-may", {
    experienceId: "exp-sunrise",
    name: "May 2025 Dawn Series",
    nameEs: "Serie Amanecer Mayo 2025",
    description:
      "Sunrise meditation sessions through May. Early morning rituals in the mountains.",
    descriptionEs:
      "Sesiones de meditación al amanecer durante mayo. Rituales matutinos en las montañas.",
    startDate: futureDate(0),
    endDate: futureDate(30),
    registrationOpens: futureDate(-7),
    registrationCloses: futureDate(28),
    capacity: 36,
    status: "open",
  });

  // Forest Bathing — edition
  await createDoc("editions", "ed-forest-may", {
    experienceId: "exp-forest",
    name: "Spring Forest Immersions",
    nameEs: "Inmersiones de Bosque Primavera",
    description:
      "Two spring dates for our half-day forest bathing experience. Limited groups of 10.",
    descriptionEs:
      "Dos fechas de primavera para nuestra experiencia de baño de bosque de medio día. Grupos limitados a 10.",
    startDate: futureDate(0),
    endDate: futureDate(30),
    registrationOpens: futureDate(-7),
    registrationCloses: futureDate(25),
    capacity: 20,
    status: "open",
  });

  // Retreat — single edition
  await createDoc("editions", "ed-retreat-jun", {
    experienceId: "exp-retreat",
    name: "June 2025 Deep Rest",
    nameEs: "Descanso Profundo Junio 2025",
    description:
      "Our flagship 3-day retreat. Check-in Friday 4 PM, checkout Monday noon. 8 spots only.",
    descriptionEs:
      "Nuestro retiro insignia de 3 días. Check-in viernes 4 PM, checkout lunes mediodía. Solo 8 lugares.",
    startDate: futureDate(14),
    endDate: futureDate(17),
    registrationOpens: futureDate(-14),
    registrationCloses: futureDate(12),
    capacity: 8,
    status: "open",
  });

  // Couples Massage — open edition (no fixed dates)
  await createDoc("editions", "ed-couples-open", {
    experienceId: "exp-couples-massage",
    name: "Open Availability",
    nameEs: "Disponibilidad Abierta",
    description: "Book your preferred date and time. Subject to availability.",
    descriptionEs:
      "Reserva tu fecha y horario preferidos. Sujeto a disponibilidad.",
    status: "open",
    capacity: 100,
  });

  // Sound Healing — rolling monthly edition
  await createDoc("editions", "ed-sound-may", {
    experienceId: "exp-sound-healing",
    name: "May 2025 Sound Sessions",
    nameEs: "Sesiones de Sonido Mayo 2025",
    description:
      "All sound healing sessions scheduled for May 2025. Friday evenings and one special outdoor edition.",
    descriptionEs:
      "Todas las sesiones de sanación con sonido programadas para mayo 2025. Viernes por la noche y una edición especial al aire libre.",
    startDate: futureDate(0),
    endDate: futureDate(30),
    registrationOpens: futureDate(-7),
    registrationCloses: futureDate(28),
    capacity: 42,
    status: "open",
  });

  // Yoga Flow — rolling monthly edition
  await createDoc("editions", "ed-yoga-may", {
    experienceId: "exp-yoga-flow",
    name: "May 2025 Morning Flows",
    nameEs: "Flujos Matutinos Mayo 2025",
    description:
      "Morning Vinyasa sessions through May on our Beachfront Terrace, plus one special jungle edition.",
    descriptionEs:
      "Sesiones de Vinyasa matutinas durante mayo en nuestra Terraza Frente al Mar, más una edición especial en la selva.",
    startDate: futureDate(0),
    endDate: futureDate(30),
    registrationOpens: futureDate(-7),
    registrationCloses: futureDate(28),
    capacity: 51,
    status: "open",
  });

  // Wellness Weekend Stay — monthly edition
  await createDoc("editions", "ed-stay-may", {
    experienceId: "exp-wellness-weekend",
    name: "May 2025 Weekend Stays",
    nameEs: "Estancias de Fin de Semana Mayo 2025",
    description:
      "Two available weekends in May at the Jungle Sanctuary. Maximum 4 guests per weekend.",
    descriptionEs:
      "Dos fines de semana disponibles en mayo en el Santuario en la Selva. Máximo 4 huéspedes por fin de semana.",
    startDate: futureDate(0),
    endDate: futureDate(30),
    registrationOpens: futureDate(-14),
    registrationCloses: futureDate(10),
    capacity: 8,
    status: "open",
  });
}

// ─── Pricing Tiers ────────────────────────────────────────────────────────

async function seedPricingTiers() {
  console.log("\n💰 Pricing Tiers");

  // Breathwork — 2 tiers
  await createDoc("pricing_tiers", "pt-breathwork-standard", {
    experienceId: "exp-breathwork",
    editionId: "ed-breathwork-may",
    name: "Standard",
    nameEs: "Estándar",
    description: "General admission to the breathwork session.",
    descriptionEs: "Admisión general a la sesión de respiración consciente.",
    priceType: "per-person",
    basePrice: 850,
    currency: "MXN",
    isActive: true,
    sortOrder: 1,
  });
  await createDoc("pricing_tiers", "pt-breathwork-vip", {
    experienceId: "exp-breathwork",
    editionId: "ed-breathwork-may",
    name: "VIP Experience",
    nameEs: "Experiencia VIP",
    description:
      "Priority placement, premium mat, herbal tea ceremony included, and a 15-minute post-session sound bath.",
    descriptionEs:
      "Ubicación prioritaria, tapete premium, ceremonia de té herbal incluida y un baño de sonido de 15 minutos post-sesión.",
    priceType: "per-person",
    basePrice: 1400,
    currency: "MXN",
    badge: "BEST VALUE",
    isHighlighted: true,
    isActive: true,
    sortOrder: 2,
  });

  // Sunrise — single tier
  await createDoc("pricing_tiers", "pt-sunrise-standard", {
    experienceId: "exp-sunrise",
    editionId: "ed-sunrise-may",
    name: "Dawn Pass",
    nameEs: "Pase del Amanecer",
    description:
      "Guided morning meditation, herbal tea, and a moment of shared silence.",
    descriptionEs:
      "Meditación matutina guiada, té herbal y un momento de silencio compartido.",
    priceType: "per-person",
    basePrice: 600,
    currency: "MXN",
    isActive: true,
    sortOrder: 1,
  });

  // Forest Bathing — single tier
  await createDoc("pricing_tiers", "pt-forest-standard", {
    experienceId: "exp-forest",
    editionId: "ed-forest-may",
    name: "Full Immersion",
    nameEs: "Inmersión Completa",
    description:
      "Half-day forest experience with guided invitations and closing tea ceremony.",
    descriptionEs:
      "Experiencia de bosque de medio día con invitaciones guiadas y ceremonia de té de cierre.",
    priceType: "per-person",
    basePrice: 1200,
    currency: "MXN",
    isActive: true,
    sortOrder: 1,
  });

  // Retreat — 2 tiers
  await createDoc("pricing_tiers", "pt-retreat-shared", {
    experienceId: "exp-retreat",
    editionId: "ed-retreat-jun",
    name: "Shared Casita",
    nameEs: "Casita Compartida",
    description:
      "Three nights in a shared casita (2 guests). All meals, yoga, meditation, and one 60-min massage included.",
    descriptionEs:
      "Tres noches en casita compartida (2 huéspedes). Incluye todas las comidas, yoga, meditación y un masaje de 60 min.",
    priceType: "per-person",
    basePrice: 12500,
    currency: "MXN",
    isActive: true,
    sortOrder: 1,
  });
  await createDoc("pricing_tiers", "pt-retreat-private", {
    experienceId: "exp-retreat",
    editionId: "ed-retreat-jun",
    name: "Private Casita",
    nameEs: "Casita Privada",
    description:
      "Three nights in a private casita. All meals, yoga, meditation, two 90-min massages, and a private sound healing session.",
    descriptionEs:
      "Tres noches en casita privada. Incluye todas las comidas, yoga, meditación, dos masajes de 90 min y una sesión privada de sanación con sonido.",
    priceType: "per-person",
    basePrice: 18500,
    currency: "MXN",
    badge: "PREMIUM",
    isHighlighted: true,
    isActive: true,
    sortOrder: 2,
  });

  // Couples Massage — from pricing
  await createDoc("pricing_tiers", "pt-couples-signature", {
    experienceId: "exp-couples-massage",
    editionId: "ed-couples-open",
    name: "Signature Couples Ritual",
    nameEs: "Ritual de Parejas Signature",
    description:
      "90-minute synchronized massage for two with aromatherapy, warm stones, and private garden suite access.",
    descriptionEs:
      "Masaje sincronizado de 90 minutos para dos con aromaterapia, piedras calientes y acceso a suite de jardín privada.",
    priceType: "per-group",
    basePrice: 4500,
    currency: "MXN",
    minPersons: 2,
    maxPersons: 2,
    isActive: true,
    sortOrder: 1,
  });
  await createDoc("pricing_tiers", "pt-couples-luxury", {
    experienceId: "exp-couples-massage",
    editionId: "ed-couples-open",
    name: "Luxury Couples Escape",
    nameEs: "Escape de Lujo para Parejas",
    description:
      "120-minute extended massage with hot stones, facial treatment, champagne, chocolate truffles, and extended suite time.",
    descriptionEs:
      "Masaje extendido de 120 minutos con piedras calientes, tratamiento facial, champagne, trufas de chocolate y tiempo extendido en suite.",
    priceType: "per-group",
    basePrice: 7200,
    currency: "MXN",
    minPersons: 2,
    maxPersons: 2,
    badge: "MOST POPULAR",
    isHighlighted: true,
    isActive: true,
    sortOrder: 2,
  });

  // Sound Healing — 2 tiers
  await createDoc("pricing_tiers", "pt-sound-standard", {
    experienceId: "exp-sound-healing",
    editionId: "ed-sound-may",
    name: "Sound Bath",
    nameEs: "Baño de Sonido",
    description:
      "75-minute sound healing journey with cushioned mat, blanket, eye mask, and closing tea ceremony.",
    descriptionEs:
      "Viaje de sanación con sonido de 75 minutos con tapete acolchado, manta, antifaz y ceremonia de té de cierre.",
    priceType: "per-person",
    basePrice: 750,
    currency: "MXN",
    isActive: true,
    sortOrder: 1,
  });
  await createDoc("pricing_tiers", "pt-sound-premium", {
    experienceId: "exp-sound-healing",
    editionId: "ed-sound-may",
    name: "Sound Bath Premium",
    nameEs: "Baño de Sonido Premium",
    description:
      "Everything in Standard plus priority front-row placement, complimentary mindfulness journal, and a 15-minute private sound integration with crystal bowls after the group session.",
    descriptionEs:
      "Todo lo del Estándar más ubicación prioritaria en primera fila, diario de mindfulness de cortesía y 15 minutos de integración sonora privada con cuencos de cristal después de la sesión grupal.",
    priceType: "per-person",
    basePrice: 1250,
    currency: "MXN",
    badge: "DEEP EXPERIENCE",
    isHighlighted: true,
    isActive: true,
    sortOrder: 2,
  });

  // Yoga Flow — single tier
  await createDoc("pricing_tiers", "pt-yoga-standard", {
    experienceId: "exp-yoga-flow",
    editionId: "ed-yoga-may",
    name: "Morning Flow",
    nameEs: "Flujo Matutino",
    description:
      "60-minute Vinyasa flow on the Beachfront Terrace with yoga mat provided. All levels welcome.",
    descriptionEs:
      "Flujo de Vinyasa de 60 minutos en la Terraza Frente al Mar con tapete de yoga incluido. Todos los niveles bienvenidos.",
    priceType: "per-person",
    basePrice: 550,
    currency: "MXN",
    isActive: true,
    sortOrder: 1,
  });

  // Wellness Weekend Stay — 2 tiers
  await createDoc("pricing_tiers", "pt-stay-shared", {
    experienceId: "exp-wellness-weekend",
    editionId: "ed-stay-may",
    name: "Shared Casita",
    nameEs: "Casita Compartida",
    description:
      "Two nights in a shared casita (2 guests). All meals, daily yoga, meditation, one forest bathing immersion, and one 60-minute massage included.",
    descriptionEs:
      "Dos noches en casita compartida (2 huéspedes). Incluye todas las comidas, yoga diario, meditación, una inmersión de baño de bosque y un masaje de 60 minutos.",
    priceType: "per-person",
    basePrice: 9800,
    currency: "MXN",
    isActive: true,
    sortOrder: 1,
  });
  await createDoc("pricing_tiers", "pt-stay-private", {
    experienceId: "exp-wellness-weekend",
    editionId: "ed-stay-may",
    name: "Private Casita",
    nameEs: "Casita Privada",
    description:
      "Two nights in a private casita (1 guest). All meals, daily yoga, meditation, one forest bathing immersion, two 60-minute massages, aromatherapy kit to take home, and a private sound healing session.",
    descriptionEs:
      "Dos noches en casita privada (1 huésped). Incluye todas las comidas, yoga diario, meditación, una inmersión de baño de bosque, dos masajes de 60 minutos, kit de aromaterapia para llevar y una sesión privada de sanación con sonido.",
    priceType: "per-person",
    basePrice: 14500,
    currency: "MXN",
    badge: "ALL-INCLUSIVE",
    isHighlighted: true,
    isActive: true,
    sortOrder: 2,
  });
}

// ─── Experience ↔ Tag Assignments ─────────────────────────────────────────

async function seedExperienceTags() {
  console.log("\n🔗 Experience–Tag Assignments");

  const assignments = [
    // Breathwork
    ["exp-breathwork", "tag-breathwork"],
    ["exp-breathwork", "tag-beginner"],
    ["exp-breathwork", "tag-pvr"],
    // Sunrise
    ["exp-sunrise", "tag-meditation"],
    ["exp-sunrise", "tag-nature"],
    ["exp-sunrise", "tag-beginner"],
    // Forest
    ["exp-forest", "tag-nature"],
    ["exp-forest", "tag-meditation"],
    ["exp-forest", "tag-pvr"],
    // Retreat
    ["exp-retreat", "tag-retreat"],
    ["exp-retreat", "tag-meditation"],
    ["exp-retreat", "tag-spa"],
    ["exp-retreat", "tag-weekend"],
    // Couples
    ["exp-couples-massage", "tag-couples"],
    ["exp-couples-massage", "tag-spa"],
    ["exp-couples-massage", "tag-pvr"],
    // Sound Healing
    ["exp-sound-healing", "tag-sound-healing"],
    ["exp-sound-healing", "tag-beginner"],
    ["exp-sound-healing", "tag-pvr"],
    // Yoga Flow
    ["exp-yoga-flow", "tag-yoga"],
    ["exp-yoga-flow", "tag-beginner"],
    ["exp-yoga-flow", "tag-pvr"],
    // Wellness Weekend
    ["exp-wellness-weekend", "tag-retreat"],
    ["exp-wellness-weekend", "tag-overnight"],
    ["exp-wellness-weekend", "tag-nature"],
    ["exp-wellness-weekend", "tag-pvr"],
    ["exp-wellness-weekend", "tag-spa"],
  ];

  for (const [expId, tagId] of assignments) {
    const docId = `et-${expId.replace("exp-", "")}-${tagId.replace("tag-", "")}`;
    await createDoc("experience_tags", docId, {
      experienceId: expId,
      tagId: tagId,
    });
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌿 OMZONE — Seeding experiences\n");

  await seedTags();
  await seedExperiences();
  await seedEditions();
  await seedPricingTiers();
  await seedExperienceTags();

  console.log("\n✅ Experience seed complete.\n");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
