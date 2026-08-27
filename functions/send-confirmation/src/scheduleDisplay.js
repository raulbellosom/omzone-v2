/**
 * Extracts date/time/location display strings for the confirmation email.
 *
 * The canonical source is a ticket's `ticketSnapshot` (built by generate-ticket),
 * NOT `order_items.itemSnapshot` — that snapshot uses different field names
 * (slotStart/slotEnd instead of slotStartDatetime) and never carries a location
 * at all, which is why the confirmation email's date/time/location fields were
 * always coming through empty.
 *
 * Only the first ticket is used, matching the single-ticket-representative
 * assumption already made for the QR code in this same function.
 */

export function formatSlotDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
    date: formatSlotDate(snapshot.slotStartDatetime),
    time: "",
    location: snapshot.locationName || "",
  };
}
