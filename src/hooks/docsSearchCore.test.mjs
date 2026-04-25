import assert from 'node:assert/strict';

import { createDocsSearcher } from './docsSearchCore.js';

function createFuseStub() {
  const calls = [];
  const docsBySlug = new Map();

  return {
    calls,
    factory(index) {
      index.forEach((item) => docsBySlug.set(item.slug, item));

      return {
        search(query) {
          calls.push(query);
          const normalized = query.toLowerCase();

          return index
            .filter((item) => {
              const text = [
                item.slug,
                item.title?.en,
                item.title?.es,
                item.description?.en,
                item.description?.es,
                ...(item.searchKeywords || []),
                item.content?.en,
                item.content?.es,
              ].join(' ').toLowerCase();

              return normalized
                .split(/\s+/)
                .some((word) => word.length >= 2 && text.includes(word));
            })
            .map((item) => ({ item, matches: [], score: 0.1 }));
        },
      };
    },
  };
}

const index = [
  {
    slug: 'assisted-sale',
    title: { en: 'Assisted Sale', es: 'Venta asistida' },
    description: { en: 'Create orders on behalf of clients', es: 'Crear ordenes para clientes' },
    searchKeywords: ['sales mode', 'saleMode', 'venta asistida'],
    content: { en: 'Use sales mode request for booking requests.', es: 'Usa modo venta para solicitudes.' },
    headings: { en: [], es: [] },
  },
  {
    slug: 'booking-requests',
    title: { en: 'Booking Requests', es: 'Solicitudes de reserva' },
    description: { en: 'Manage incoming booking inquiries', es: 'Gestiona solicitudes entrantes' },
    searchKeywords: ['booking request', 'request sales'],
    content: { en: 'Requests can be converted into assisted sale orders.', es: 'Las solicitudes pueden convertirse.' },
    headings: { en: [], es: [] },
  },
];

const noisyCrossRef = Array.from({ length: 750 }, (_, i) => ({
  term: `sales mode generated concept ${i}`,
  pages: [{ slug: i % 2 === 0 ? 'assisted-sale' : 'booking-requests', title: 'Generated' }],
}));

const fuse = createFuseStub();
const search = createDocsSearcher({
  index,
  crossRef: noisyCrossRef,
  fuseFactory: fuse.factory,
});

const results = search('sales mode');

assert.equal(fuse.calls.length, 1, 'search should run one Fuse query per user query');
assert.deepEqual(
  results.map((result) => result.item.slug),
  ['assisted-sale', 'booking-requests'],
  'cross-reference matches should append relevant pages without extra Fuse searches',
);
