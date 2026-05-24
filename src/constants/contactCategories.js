/**
 * Contact message categories used in contact_messages collection.
 * category field values, display config, and helpers.
 */

export const CONTACT_CATEGORIES = {
  contact: {
    key: "contact",
    color: "text-charcoal-muted bg-sand",
    dotColor: "bg-charcoal-muted",
    labelEn: "Contact",
    labelEs: "Contacto",
  },
  invoice_request: {
    key: "invoice_request",
    color: "text-amber-700 bg-amber-50",
    dotColor: "bg-amber-500",
    labelEn: "Invoice",
    labelEs: "Factura",
  },
  faq: {
    key: "faq",
    color: "text-blue-700 bg-blue-50",
    dotColor: "bg-blue-400",
    labelEn: "FAQ",
    labelEs: "FAQ",
  },
  support: {
    key: "support",
    color: "text-purple-700 bg-purple-50",
    dotColor: "bg-purple-400",
    labelEn: "Support",
    labelEs: "Soporte",
  },
  other: {
    key: "other",
    color: "text-charcoal-muted bg-sand",
    dotColor: "bg-charcoal-subtle",
    labelEn: "Other",
    labelEs: "Otro",
  },
};

export const CATEGORY_LIST = Object.values(CONTACT_CATEGORIES);

export function getCategoryConfig(category) {
  return CONTACT_CATEGORIES[category] ?? CONTACT_CATEGORIES.contact;
}
