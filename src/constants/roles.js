export const ROLES = {
  ROOT: "root",
  ADMIN: "admin",
  OPERATOR: "operator",
  CLIENT: "client",
};

export function roleFromLabels(labels = []) {
  if (labels.includes(ROLES.ROOT)) return ROLES.ROOT;
  if (labels.includes(ROLES.ADMIN)) return ROLES.ADMIN;
  if (labels.includes(ROLES.OPERATOR)) return ROLES.OPERATOR;
  if (labels.includes(ROLES.CLIENT)) return ROLES.CLIENT;
  return null;
}

export function isRootRole(labels = []) {
  return labels.includes(ROLES.ROOT);
}

export function isAdminRole(labels = []) {
  const role = roleFromLabels(labels);
  return role === ROLES.ROOT || role === ROLES.ADMIN;
}

export function isOperatorRole(labels = []) {
  const role = roleFromLabels(labels);
  return role === ROLES.ROOT || role === ROLES.ADMIN || role === ROLES.OPERATOR;
}

export function canAccessAdminArea(labels = []) {
  const role = roleFromLabels(labels);
  return [ROLES.ROOT, ROLES.ADMIN, ROLES.OPERATOR].includes(role);
}

export function canAccessCustomerArea(labels = []) {
  return labels.includes(ROLES.CLIENT) || canAccessAdminArea(labels);
}

// ---------------------------------------------------------------------------
// Ghost user utilities — root users are invisible across the platform
// ---------------------------------------------------------------------------

/**
 * Returns true if the user is a ghost (root) and should be invisible
 * to all non-root viewers.
 */
export function isGhostUser(labels = []) {
  return labels.includes(ROLES.ROOT);
}

/**
 * Filters out ghost (root) users from a list.
 * If the viewer is also root, all items are returned unfiltered.
 *
 * @param {Array} items - Array of items to filter
 * @param {Array} viewerLabels - Labels of the current viewer
 * @param {Function} [getLabels] - Accessor to extract labels from each item
 */
export function excludeGhostUsers(
  items,
  viewerLabels = [],
  getLabels = (item) => item.labels ?? [],
) {
  if (isGhostUser(viewerLabels)) return items;
  return items.filter((item) => !isGhostUser(getLabels(item)));
}

/**
 * Returns a safe display name for a user's role.
 * Ensures "root" is NEVER exposed — root is shown as "Admin".
 */
export function displayRoleName(labels = []) {
  const role = roleFromLabels(labels);
  if (role === ROLES.ROOT || role === ROLES.ADMIN) return "Admin";
  if (role === ROLES.OPERATOR) return "Operador";
  if (role === ROLES.CLIENT) return "Cliente";
  return "—";
}
