/**
 * Archive system constants for OMZONE.
 *
 * Defines which collections support archiving (admin soft-delete) and which
 * additionally support personal archiving by the client (userArchivedAt).
 */

/**
 * Collections that support the admin soft-delete lifecycle:
 *   archivedAt / archivedBy / archiveReason
 *
 * Ordered by domain for readability.
 */
export const ARCHIVABLE_COLLECTIONS = [
  // Editorial
  "experiences",
  "publications",
  "packages",
  "hero_slides",
  "tags",
  // Agenda
  "editions",
  "slots",
  // Catalog
  "addons",
  "passes",
  // Pricing
  "pricing_tiers",
  "pricing_rules",
  // Venue / Resources
  "locations",
  "rooms",
  "resources",
  // Bookings
  "booking_requests",
  "bookings",
  // Transactional (admin can archive for operational clarity)
  "orders",
  "tickets",
  "user_passes",
  // Config
  "notification_templates",
];

/**
 * Collections where operator label is also allowed to archive
 * (cannot archive transactional or sensitive collections).
 */
export const OPERATOR_ARCHIVABLE_COLLECTIONS = [
  "slots",
  "bookings",
  "booking_requests",
];

/**
 * Collections where clients can archive their own documents from their portal
 * view (stores userArchivedAt, does NOT affect admin visibility).
 */
export const PERSONAL_ARCHIVE_COLLECTIONS = [
  "orders",
  "tickets",
  "user_passes",
];

/**
 * Collections where cascade archiving is triggered when the parent is archived.
 * Key = parent collection, value = list of child collections to cascade.
 */
export const CASCADE_ARCHIVE_MAP = {
  experiences: ["editions", "slots"],
};

/**
 * Collections where hard delete (root-only, permanent) requires the document
 * to be archived first. All archivable collections follow this rule.
 *
 * Transactional collections get an extra safeguard: mandatory reason field.
 */
export const TRANSACTIONAL_COLLECTIONS = [
  "orders",
  "tickets",
  "user_passes",
  "pass_consumptions",
];

/**
 * Default "active" status values per collection. Used by buildListQueries to
 * determine what "not archived / not draft" means for each collection.
 */
export const DEFAULT_ACTIVE_STATUS = {
  // Editorial — published is the "live" state
  experiences: "published",
  publications: "published",
  packages: "published",
  // Catalog — active is the "live" state
  addons: "active",
  passes: "active",
  // Everything else — no status filter applied by default (admin sees all non-archived)
};

/**
 * Collections whose `status` field contains a "draft" value that should be
 * excluded from the default admin list view (admin filters to non-archived
 * AND non-draft by default).
 */
export const HAS_DRAFT_STATUS = [
  "experiences",
  "publications",
  "packages",
  "editions",
  "slots",
];
