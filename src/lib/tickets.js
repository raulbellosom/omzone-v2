/**
 * Safely parses a ticket's `ticketSnapshot` field, which Appwrite stores as a
 * JSON string (not a native object) — accessing properties on it directly
 * without parsing always yields `undefined`.
 *
 * @param {object} ticket - A tickets collection document.
 * @returns {object|null} Parsed snapshot, or null if missing/unparseable.
 */
export function parseTicketSnapshot(ticket) {
  if (!ticket?.ticketSnapshot) return null;
  if (typeof ticket.ticketSnapshot !== "string") return ticket.ticketSnapshot;
  try {
    return JSON.parse(ticket.ticketSnapshot);
  } catch {
    return null;
  }
}
