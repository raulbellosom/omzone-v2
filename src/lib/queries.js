import { Query } from "@/lib/appwrite";

/**
 * src/lib/queries.js
 *
 * Centralised query builder for archive-aware list queries.
 *
 * Every admin and public list page should go through buildListQueries()
 * to guarantee consistent filtering:
 *   - By default, archived documents (archivedAt != null) are hidden.
 *   - By default, drafts are hidden in admin operational views.
 *   - Public pages force published/active status and always hide archived.
 */

// ---------------------------------------------------------------------------
// Preset builders
// ---------------------------------------------------------------------------

/**
 * Returns the query clauses that exclude archived documents.
 * Appwrite has no Query.isNull(), so we use a workaround: filtering by a
 * date far in the future covers documents where archivedAt is null (unset).
 *
 * Actually Appwrite 1.9 DOES support Query.isNull() — we use that.
 */
export function excludeArchived() {
  return [Query.isNull("archivedAt")];
}

/**
 * Returns query clauses that show ONLY archived documents.
 */
export function onlyArchived() {
  return [Query.isNotNull("archivedAt")];
}

/**
 * Returns query clauses that exclude client-personal-archived documents.
 * Used in portal views where the client can hide their own records.
 */
export function excludePersonalArchived() {
  return [Query.isNull("userArchivedAt")];
}

/**
 * Returns query clauses that show ONLY client-personal-archived documents.
 */
export function onlyPersonalArchived() {
  return [Query.isNotNull("userArchivedAt")];
}

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

/**
 * Builds a standard set of Query clauses for listing documents.
 *
 * @param {object} opts
 * @param {boolean} [opts.includeArchived=false]  - Include documents where archivedAt != null
 * @param {boolean} [opts.includeDrafts=false]    - Include documents with status "draft"
 * @param {string|null} [opts.status=null]        - Filter by exact status value (overrides includeDrafts for status)
 * @param {boolean} [opts.includePersonalArchived=false] - Include userArchivedAt != null (portal views)
 * @param {string|null} [opts.search=null]        - Fulltext search term (caller must specify the right Query)
 * @param {Query[]} [opts.extra=[]]               - Additional Query clauses to append
 * @returns {Query[]}
 */
export function buildListQueries({
  includeArchived = false,
  includeDrafts = false,
  status = null,
  includePersonalArchived = false,
  extra = [],
} = {}) {
  const queries = [];

  // Archive filter
  if (!includeArchived) {
    queries.push(...excludeArchived());
  }

  // Personal archive filter (portal views)
  if (!includePersonalArchived) {
    // Only add this filter if the collection has userArchivedAt;
    // the caller is responsible for knowing whether this applies.
    // The hook decides whether to pass this option.
  }

  // Status filter
  if (status) {
    queries.push(Query.equal("status", status));
  } else if (!includeDrafts) {
    // Exclude drafts by default when no specific status is requested.
    // We use notEqual so that other statuses (published, active, open, etc.)
    // all pass through — but "draft" is hidden.
    queries.push(Query.notEqual("status", "draft"));
  }

  // Extra caller-supplied clauses
  if (extra.length) {
    queries.push(...extra);
  }

  return queries;
}

/**
 * Builds query clauses for PUBLIC-facing pages.
 * Always excludes archived, always requires the given active status.
 *
 * @param {string} activeStatus - e.g. "published" or "active"
 * @param {Query[]} [extra=[]]
 * @returns {Query[]}
 */
export function buildPublicListQueries(activeStatus, extra = []) {
  return [...excludeArchived(), Query.equal("status", activeStatus), ...extra];
}

/**
 * Builds query clauses for portal views.
 * Excludes archived (admin-archived) but respects the includePersonalArchived flag.
 *
 * @param {object} opts
 * @param {boolean} [opts.includePersonalArchived=false]
 * @param {string|null} [opts.status=null]
 * @param {Query[]} [opts.extra=[]]
 * @returns {Query[]}
 */
export function buildPortalListQueries({
  includePersonalArchived = false,
  status = null,
  extra = [],
} = {}) {
  const queries = [
    // Always hide admin-archived from client portal
    ...excludeArchived(),
  ];

  // Personal archive filter
  if (!includePersonalArchived) {
    queries.push(...excludePersonalArchived());
  } else {
    queries.push(...onlyPersonalArchived());
  }

  if (status) {
    queries.push(Query.equal("status", status));
  }

  if (extra.length) {
    queries.push(...extra);
  }

  return queries;
}
