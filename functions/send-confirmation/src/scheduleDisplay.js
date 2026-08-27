/**
 * Extracts date/time/location display strings for the confirmation email.
 *
 * The canonical source is a ticket's `ticketSnapshot` (built by generate-ticket),
 * NOT `order_items.itemSnapshot` — that snapshot uses different field names
 * (slotStart/slotEnd instead of slotStartDatetime) and never carries a location
 * at all, which is why the confirmation email's date/time/location fields were
 * always coming through empty.
 *
 * `slotStartDatetime` is stored as an absolute UTC instant. It MUST be
 * formatted with the venue's `timezone` (also in ticketSnapshot) explicitly —
 * without it, Intl falls back to the Appwrite function runtime's default
 * timezone (UTC), which can land on the wrong day entirely for evening slots
 * (e.g. 18:30 in Mexico City is already past midnight UTC, the next day).
 *
 * Only the first ticket is used, matching the single-ticket-representative
 * assumption already made for the QR code in this same function.
 */

export function formatSlotDate(iso, timeZone) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  });
}

export function extractScheduleVars(tickets) {
  if (!Array.isArray(tickets) || tickets.length === 0) {
    return { date: "", time: "", location: "" };
  }

  let snapshot;
  try {
    snapshot = JSON.parse(tickets[0].ticketSnapshot || "{}");
  } catch {
    return { date: "", time: "", location: "" };
  }

  return {
    date: formatSlotDate(snapshot.slotStartDatetime, snapshot.timezone),
    time: "",
    location: snapshot.locationName || "",
  };
}
