// Navigation structure mirroring admin sidebar
// Section order, titles, and page slugs
// All titles and descriptions support i18n with { en, es } structure

export const docsNavigation = {
  gettingStarted: {
    title: { en: 'Getting Started', es: 'Primeros Pasos' },
    order: 1,
    pages: [
      { slug: 'introduction', title: { en: 'Introduction', es: 'Introducción' }, order: 1 },
    ]
  },
  catalog: {
    title: { en: 'Catalog', es: 'Catálogo' },
    order: 2,
    pages: [
      { slug: 'experiences', title: { en: 'Experiences', es: 'Experiencias' }, order: 1 },
      { slug: 'editions', title: { en: 'Editions', es: 'Ediciones' }, order: 2 },
      { slug: 'pricing-tiers', title: { en: 'Pricing Tiers', es: 'Niveles de Precio' }, order: 3 },
      { slug: 'addons', title: { en: 'Addons', es: 'Complementos' }, order: 4 },
      { slug: 'packages', title: { en: 'Packages', es: 'Paquetes' }, order: 5 },
      { slug: 'passes', title: { en: 'Passes', es: 'Pases' }, order: 6 },
    ]
  },
  operations: {
    title: { en: 'Operations', es: 'Operaciones' },
    order: 3,
    pages: [
      { slug: 'slots', title: { en: 'Slots & Agenda', es: 'Ranuras y Agenda' }, order: 1 },
      { slug: 'resources', title: { en: 'Resources', es: 'Recursos' }, order: 2 },
      { slug: 'locations', title: { en: 'Locations & Rooms', es: 'Ubicaciones y Salas' }, order: 3 },
      { slug: 'booking-requests', title: { en: 'Booking Requests', es: 'Solicitudes de Reserva' }, order: 4 },
    ]
  },
  sales: {
    title: { en: 'Sales', es: 'Ventas' },
    order: 4,
    pages: [
      { slug: 'orders', title: { en: 'Orders', es: 'Órdenes' }, order: 1 },
      { slug: 'assisted-sale', title: { en: 'Assisted Sale', es: 'Venta Asistida' }, order: 2 },
    ]
  },
  content: {
    title: { en: 'Content', es: 'Contenido' },
    order: 5,
    pages: [
      { slug: 'publications', title: { en: 'Publications', es: 'Publicaciones' }, order: 1 },
      { slug: 'sections', title: { en: 'Sections', es: 'Secciones' }, order: 2 },
    ]
  },
  system: {
    title: { en: 'System', es: 'Sistema' },
    order: 6,
    pages: [
      { slug: 'tickets', title: { en: 'Tickets', es: 'Tickets' }, order: 1 },
      { slug: 'clients', title: { en: 'Clients', es: 'Clientes' }, order: 2 },
      { slug: 'media', title: { en: 'Media', es: 'Multimedia' }, order: 3 },
      { slug: 'settings', title: { en: 'Settings', es: 'Configuración' }, order: 4 },
    ]
  },
  reference: {
    title: { en: 'Reference', es: 'Referencia' },
    order: 7,
    pages: [
      { slug: 'glossary', title: { en: 'Glossary', es: 'Glosario' }, order: 1 },
      { slug: 'flows', title: { en: 'Flows', es: 'Flujos' }, order: 2 },
      { slug: 'known-limitations', title: { en: 'Known Limitations', es: 'Limitaciones Conocidas' }, order: 3 },
      { slug: 'troubleshooting', title: { en: 'Troubleshooting', es: 'Solución de Problemas' }, order: 4 },
    ]
  }
};

// Helper to get localized title
export function getLocalizedTitle(titleObj, lang = 'en') {
  if (typeof titleObj === 'string') return titleObj;
  if (typeof titleObj === 'object' && titleObj !== null) {
    return titleObj[lang] || titleObj.en || Object.values(titleObj)[0] || '';
  }
  return '';
}

export const getAllPages = () => {
  const pages = [];
  Object.entries(docsNavigation).forEach(([sectionKey, section]) => {
    section.pages.forEach(page => {
      pages.push({
        ...page,
        section: sectionKey,
        sectionTitle: section.title
      });
    });
  });
  return pages;
};
