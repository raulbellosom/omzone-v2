// Navigation structure mirroring admin sidebar
// Section order, titles, and page slugs

export const docsNavigation = {
  gettingStarted: {
    title: 'Getting Started',
    order: 1,
    pages: [
      { slug: 'introduction', title: 'Introduction', order: 1 },
    ]
  },
  catalog: {
    title: 'Catalog',
    order: 2,
    pages: [
      { slug: 'experiences', title: 'Experiences', order: 1 },
      { slug: 'editions', title: 'Editions', order: 2 },
      { slug: 'pricing-tiers', title: 'Pricing Tiers', order: 3 },
      { slug: 'addons', title: 'Addons', order: 4 },
      { slug: 'packages', title: 'Packages', order: 5 },
      { slug: 'passes', title: 'Passes', order: 6 },
    ]
  },
  operations: {
    title: 'Operations',
    order: 3,
    pages: [
      { slug: 'slots', title: 'Slots & Agenda', order: 1 },
      { slug: 'resources', title: 'Resources', order: 2 },
      { slug: 'locations', title: 'Locations & Rooms', order: 3 },
      { slug: 'booking-requests', title: 'Booking Requests', order: 4 },
    ]
  },
  sales: {
    title: 'Sales',
    order: 4,
    pages: [
      { slug: 'orders', title: 'Orders', order: 1 },
      { slug: 'assisted-sale', title: 'Assisted Sale', order: 2 },
    ]
  },
  content: {
    title: 'Content',
    order: 5,
    pages: [
      { slug: 'publications', title: 'Publications', order: 1 },
      { slug: 'sections', title: 'Sections', order: 2 },
    ]
  },
  system: {
    title: 'System',
    order: 6,
    pages: [
      { slug: 'tickets', title: 'Tickets', order: 1 },
      { slug: 'clients', title: 'Clients', order: 2 },
      { slug: 'media', title: 'Media', order: 3 },
      { slug: 'settings', title: 'Settings', order: 4 },
    ]
  },
  reference: {
    title: 'Reference',
    order: 7,
    pages: [
      { slug: 'glossary', title: 'Glossary', order: 1 },
      { slug: 'flows', title: 'Flows', order: 2 },
      { slug: 'known-limitations', title: 'Known Limitations', order: 3 },
      { slug: 'troubleshooting', title: 'Troubleshooting', order: 4 },
    ]
  }
};

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