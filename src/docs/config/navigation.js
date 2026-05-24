// Navigation structure for /help/docs
// All titles support { en, es } i18n structure

export const docsNavigation = {
  bienvenida: {
    title: { en: "Getting Started", es: "Bienvenida" },
    order: 1,
    pages: [
      {
        slug: "bienvenida",
        title: { en: "Welcome to OMZONE", es: "Bienvenida a OMZONE" },
        order: 1,
      },
      {
        slug: "como-iniciar-sesion",
        title: { en: "Logging In", es: "Cómo iniciar sesión" },
        order: 2,
      },
      {
        slug: "roles-y-permisos",
        title: { en: "Roles & Permissions", es: "Roles y permisos" },
        order: 3,
      },
      {
        slug: "recorrido-del-panel",
        title: { en: "Panel Tour", es: "Recorrido del panel" },
        order: 4,
      },
    ],
  },
  admin: {
    title: { en: "Admin Panel", es: "Panel de Administración" },
    order: 2,
    pages: [
      {
        slug: "panel-resumen",
        title: { en: "Dashboard", es: "Resumen del panel" },
        order: 1,
      },
      {
        slug: "experiencias",
        title: { en: "Experiences", es: "Experiencias" },
        order: 2,
      },
      {
        slug: "precios",
        title: { en: "Pricing", es: "Precios" },
        order: 3,
      },
      {
        slug: "complementos",
        title: { en: "Add-ons", es: "Complementos" },
        order: 4,
      },
      {
        slug: "paquetes-y-pases",
        title: { en: "Packages & Passes", es: "Paquetes y pases" },
        order: 5,
      },
      {
        slug: "agenda-y-horarios",
        title: { en: "Agenda & Schedules", es: "Agenda y horarios" },
        order: 6,
      },
      {
        slug: "recursos",
        title: { en: "Resources", es: "Recursos" },
        order: 7,
      },
      {
        slug: "ubicaciones",
        title: { en: "Locations", es: "Ubicaciones" },
        order: 8,
      },
      {
        slug: "solicitudes-de-reserva",
        title: { en: "Booking Requests", es: "Solicitudes de reserva" },
        order: 9,
      },
      {
        slug: "ordenes",
        title: { en: "Orders", es: "Órdenes" },
        order: 10,
      },
      {
        slug: "tickets",
        title: { en: "Tickets", es: "Tickets" },
        order: 11,
      },
      {
        slug: "venta-asistida",
        title: { en: "Assisted Sale", es: "Venta asistida" },
        order: 12,
      },
      {
        slug: "clientes",
        title: { en: "Clients", es: "Clientes" },
        order: 13,
      },
      {
        slug: "publicaciones",
        title: { en: "Publications", es: "Publicaciones" },
        order: 14,
      },
      {
        slug: "secciones-y-bloques",
        title: { en: "Sections & Blocks", es: "Secciones y bloques" },
        order: 15,
      },
      {
        slug: "multimedia",
        title: { en: "Media", es: "Multimedia" },
        order: 16,
      },
      {
        slug: "configuracion",
        title: { en: "Settings", es: "Configuración" },
        order: 17,
      },
    ],
  },
  portal: {
    title: { en: "Client Portal", es: "Portal del Cliente" },
    order: 3,
    pages: [
      {
        slug: "que-es-el-portal",
        title: { en: "What is the Portal?", es: "¿Qué es el portal?" },
        order: 1,
      },
      {
        slug: "mis-reservas-y-tickets",
        title: { en: "My Bookings & Tickets", es: "Mis reservas y tickets" },
        order: 2,
      },
      {
        slug: "mis-pases",
        title: { en: "My Passes", es: "Mis pases" },
        order: 3,
      },
      {
        slug: "mi-perfil",
        title: { en: "My Profile", es: "Mi perfil" },
        order: 4,
      },
      {
        slug: "historial-de-compras",
        title: { en: "Purchase History", es: "Historial de compras" },
        order: 5,
      },
      {
        slug: "validar-ticket",
        title: {
          en: "Using Your Ticket",
          es: "Cómo usar tu ticket el día del evento",
        },
        order: 6,
      },
    ],
  },
  landing: {
    title: { en: "Public Website", es: "Sitio Público" },
    order: 4,
    pages: [
      {
        slug: "estructura-de-la-landing",
        title: { en: "Website Structure", es: "Estructura del sitio" },
        order: 1,
      },
      {
        slug: "como-explora-un-visitante",
        title: { en: "How Visitors Browse", es: "Cómo navega un visitante" },
        order: 2,
      },
      {
        slug: "pagina-de-experiencia",
        title: { en: "Experience Page", es: "Página de una experiencia" },
        order: 3,
      },
      {
        slug: "flujo-de-compra",
        title: { en: "Purchase Flow", es: "Flujo de compra" },
        order: 4,
      },
    ],
  },
  casosDeUso: {
    title: { en: "Use Cases", es: "Casos de Uso" },
    order: 5,
    pages: [
      {
        slug: "lanzar-una-sesion",
        title: {
          en: "Launch a Yoga Session",
          es: "Lanzar una nueva sesión de yoga",
        },
        order: 1,
      },
      {
        slug: "organizar-un-retiro",
        title: {
          en: "Organize a Weekend Retreat",
          es: "Organizar un retiro de fin de semana",
        },
        order: 2,
      },
      {
        slug: "vender-un-paquete",
        title: {
          en: "Sell a 10-Class Package",
          es: "Vender un paquete de 10 clases",
        },
        order: 3,
      },
      {
        slug: "solicitud-privada",
        title: {
          en: "Handle a Private Experience Request",
          es: "Recibir una solicitud de experiencia privada",
        },
        order: 4,
      },
      {
        slug: "dar-de-alta-instructor",
        title: {
          en: "Add a New Instructor",
          es: "Dar de alta un nuevo instructor",
        },
        order: 5,
      },
      {
        slug: "cierre-del-dia",
        title: { en: "End-of-Day Review", es: "Revisión de cierre del día" },
        order: 6,
      },
      {
        slug: "manejar-cancelacion",
        title: { en: "Handle a Cancellation", es: "Manejar una cancelación" },
        order: 7,
      },
      {
        slug: "recuperar-acceso-cliente",
        title: {
          en: "Restore Client Access",
          es: "Recuperar acceso de un cliente",
        },
        order: 8,
      },
    ],
  },
  referencia: {
    title: { en: "Reference", es: "Referencia Rápida" },
    order: 6,
    pages: [
      {
        slug: "glosario",
        title: { en: "Glossary", es: "Glosario" },
        order: 1,
      },
      {
        slug: "problemas-frecuentes",
        title: { en: "Common Problems", es: "Problemas frecuentes" },
        order: 2,
      },
      {
        slug: "preguntas-frecuentes",
        title: { en: "FAQ", es: "Preguntas frecuentes" },
        order: 3,
      },
    ],
  },
};

// Helper to get localized title
export function getLocalizedTitle(titleObj, lang = "es") {
  if (typeof titleObj === "string") return titleObj;
  if (typeof titleObj === "object" && titleObj !== null) {
    return (
      titleObj[lang] ||
      titleObj.es ||
      titleObj.en ||
      Object.values(titleObj)[0] ||
      ""
    );
  }
  return "";
}

export const getAllPages = () => {
  const pages = [];
  Object.entries(docsNavigation).forEach(([sectionKey, section]) => {
    section.pages.forEach((page) => {
      pages.push({
        ...page,
        section: sectionKey,
        sectionTitle: section.title,
      });
    });
  });
  return pages;
};
