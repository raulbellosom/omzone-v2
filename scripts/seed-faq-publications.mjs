import { Client, Databases } from "node-appwrite";

const client = new Client()
  .setEndpoint("https://aprod.racoondevs.com/v1")
  .setProject("omzone-dev")
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);
const DB = "omzone_db";
const COL = "publications";

const faqs = [
  {
    id: "faq-how-to-book",
    title: "How do I book an experience?",
    titleEs: "¿Cómo reservo una experiencia?",
    slug: "how-to-book",
    excerpt:
      "Browse available experiences, select your preferred date and time, and complete checkout with your preferred payment method. You'll receive a confirmation with your ticket immediately.",
    excerptEs:
      "Explora las experiencias disponibles, selecciona tu fecha y hora preferida y completa el pago. Recibirás una confirmación con tu boleto de inmediato.",
    seoTitle: "How to Book an Experience — OMZONE FAQ",
    seoDescription:
      "Learn how to discover and book wellness experiences at OMZONE in Puerto Vallarta.",
  },
  {
    id: "faq-payment-methods",
    title: "What payment methods do you accept?",
    titleEs: "¿Qué métodos de pago aceptan?",
    slug: "payment-methods",
    excerpt:
      "We accept all major credit and debit cards via our secure Stripe checkout. All transactions are encrypted and processed safely.",
    excerptEs:
      "Aceptamos todas las tarjetas de crédito y débito principales a través de nuestro checkout seguro con Stripe. Todas las transacciones son cifradas y procesadas de forma segura.",
    seoTitle: "Payment Methods — OMZONE FAQ",
    seoDescription:
      "Accepted payment methods at OMZONE wellness experiences in Puerto Vallarta.",
  },
  {
    id: "faq-cancellation-policy",
    title: "Can I cancel or reschedule my booking?",
    titleEs: "¿Puedo cancelar o reagendar mi reserva?",
    slug: "cancellation-policy",
    excerpt:
      "Cancellations made at least 48 hours before your session are fully refunded. Contact our team directly to reschedule or discuss special circumstances.",
    excerptEs:
      "Las cancelaciones realizadas con al menos 48 horas de anticipación son reembolsadas en su totalidad. Contáctanos directamente para reagendar o tratar casos especiales.",
    seoTitle: "Cancellation Policy — OMZONE FAQ",
    seoDescription:
      "OMZONE cancellation and rescheduling policy for wellness experience bookings.",
  },
  {
    id: "faq-wellness-pass",
    title: "What is a Wellness Pass?",
    titleEs: "¿Qué es un Wellness Pass?",
    slug: "what-is-wellness-pass",
    excerpt:
      "A Wellness Pass gives you access to a bundle of sessions at a special rate. Passes are valid for a set period and can be redeemed across eligible experiences.",
    excerptEs:
      "Un Wellness Pass te da acceso a un paquete de sesiones con una tarifa especial. Los pases tienen una vigencia determinada y pueden canjearse en experiencias elegibles.",
    seoTitle: "What is a Wellness Pass — OMZONE FAQ",
    seoDescription:
      "Learn about OMZONE Wellness Passes, how they work and what experiences they include.",
  },
  {
    id: "faq-location",
    title: "Where are you located?",
    titleEs: "¿Dónde están ubicados?",
    slug: "our-location",
    excerpt:
      "OMZONE is based in Puerto Vallarta, Jalisco, Mexico. Exact session locations vary by experience and are shared in your booking confirmation.",
    excerptEs:
      "OMZONE está ubicado en Puerto Vallarta, Jalisco, México. La ubicación exacta de cada sesión varía según la experiencia y se comparte en tu confirmación de reserva.",
    seoTitle: "Our Location — OMZONE FAQ",
    seoDescription:
      "OMZONE wellness experiences are located in Puerto Vallarta and the Riviera Nayarit corridor, Mexico.",
  },
  {
    id: "faq-what-to-bring",
    title: "What should I wear or bring to a session?",
    titleEs: "¿Qué debo usar o traer a una sesión?",
    slug: "what-to-bring",
    excerpt:
      "Comfortable, breathable clothing suitable for movement is recommended. We provide all necessary equipment. Just bring water and an open mind.",
    excerptEs:
      "Se recomienda ropa cómoda y transpirable, adecuada para el movimiento. Nosotros proporcionamos todo el equipo necesario. Solo trae agua y mente abierta.",
    seoTitle: "What to Bring — OMZONE FAQ",
    seoDescription:
      "What to wear and bring to your OMZONE wellness session in Puerto Vallarta.",
  },
  {
    id: "faq-private-bookings",
    title: "Are private or group bookings available?",
    titleEs: "¿Hay reservas privadas o grupales disponibles?",
    slug: "private-group-bookings",
    excerpt:
      "Yes! We offer private experiences tailored for individuals, couples, or groups. Contact us to design an exclusive wellness session for your event.",
    excerptEs:
      "Sí. Ofrecemos experiencias privadas para individuos, parejas o grupos. Contáctanos para diseñar una sesión de bienestar exclusiva para tu evento.",
    seoTitle: "Private and Group Bookings — OMZONE FAQ",
    seoDescription:
      "Private and group wellness experiences available at OMZONE in Puerto Vallarta.",
  },
  {
    id: "faq-access-tickets",
    title: "How do I access my tickets after purchase?",
    titleEs: "¿Cómo accedo a mis boletos después de comprar?",
    slug: "access-tickets",
    excerpt:
      "Your tickets are available in your client portal under My Tickets. You'll also receive them in the confirmation email sent right after checkout.",
    excerptEs:
      "Tus boletos están disponibles en tu portal de cliente, en la sección Mis Boletos. También los recibirás en el correo de confirmación enviado tras el pago.",
    seoTitle: "Accessing Your Tickets — OMZONE FAQ",
    seoDescription:
      "How to access your OMZONE tickets and booking confirmations after purchase.",
  },
  {
    id: "faq-account-required",
    title: "Do I need to create an account to book?",
    titleEs: "¿Necesito crear una cuenta para reservar?",
    slug: "account-required",
    excerpt:
      "While you can browse experiences without an account, you'll need to register to complete a booking. Registration takes less than a minute.",
    excerptEs:
      "Puedes explorar las experiencias sin cuenta, pero necesitarás registrarte para completar una reserva. El registro toma menos de un minuto.",
    seoTitle: "Account Required to Book — OMZONE FAQ",
    seoDescription:
      "Do I need to create an account to book a wellness experience at OMZONE?",
  },
  {
    id: "faq-omzone-cancellation",
    title: "What if OMZONE cancels a session?",
    titleEs: "¿Qué pasa si OMZONE cancela una sesión?",
    slug: "omzone-cancellation",
    excerpt:
      "If we need to cancel a session, you will be notified immediately and offered a full refund or complimentary rescheduling to an equivalent experience.",
    excerptEs:
      "Si necesitamos cancelar una sesión, serás notificado de inmediato y se te ofrecerá un reembolso completo o reagendamiento gratuito a una experiencia equivalente.",
    seoTitle: "If OMZONE Cancels a Session — FAQ",
    seoDescription:
      "What happens when OMZONE cancels a session — refund and rescheduling policy.",
  },
];

let created = 0;
for (const faq of faqs) {
  const { id, ...data } = faq;
  try {
    await db.createDocument(DB, COL, id, {
      ...data,
      category: "faq",
      status: "published",
      publishedAt: "2026-05-23T00:00:00.000+00:00",
    });
    console.log("✓", faq.title);
    created++;
  } catch (e) {
    console.error("✗", faq.title, "—", e.message);
  }
}
console.log(`\nDone: ${created}/${faqs.length} created`);
