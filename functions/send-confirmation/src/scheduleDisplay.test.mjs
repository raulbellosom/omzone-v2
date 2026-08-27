import assert from "node:assert/strict";
import { formatSlotDate, extractScheduleVars } from "./scheduleDisplay.js";

// ── formatSlotDate ───────────────────────────────────────────────────────────

assert.equal(formatSlotDate(""), "");
assert.equal(formatSlotDate(null), "");
assert.equal(formatSlotDate(undefined), "");

const formatted = formatSlotDate("2026-08-27T15:00:00.000Z");
assert.ok(formatted.includes("2026"), `expected year in "${formatted}"`);
assert.ok(formatted.includes("August"), `expected month name in "${formatted}"`);

// ── extractScheduleVars — no tickets ────────────────────────────────────────

assert.deepEqual(extractScheduleVars([]), { date: "", time: "", location: "" });
assert.deepEqual(extractScheduleVars(null), { date: "", time: "", location: "" });
assert.deepEqual(extractScheduleVars(undefined), { date: "", time: "", location: "" });

// ── extractScheduleVars — real ticketSnapshot shape (captured from omzone-dev) ──
// This is the canonical shape generate-ticket writes — NOT order_items.itemSnapshot,
// which uses different field names (slotStart/slotEnd) and never carries location.

const realTicketSnapshot = JSON.stringify({
  snapshotVersion: 1,
  orderNumber: "OMZ-20260827-1GQ",
  experienceName: "Performance Recovery Program",
  editionName: null,
  tierName: "Recuperacion de rendimiento",
  slotStartDatetime: "2026-08-27T03:24:00.000+00:00",
  slotTime: "21:24",
  slotDate: "2026-08-27T03:24:00.000+00:00",
  slotEndDate: "2026-08-27T05:30:00.000+00:00",
  timezone: "America/Mexico_City",
  locationName: "Omzone Coapinole",
  locationAddress: "C. 16 de Septiembre 464, Coapinole, 48290 Puerto Vallarta, Jal.",
  roomName: "Physiotherapy Treatment Rooms",
  unitPrice: 150,
  currency: "USD",
  participantName: "Raul Belloso Medina",
  participantEmail: "raul.belloso.m@gmail.com",
  addons: [],
  itemType: "edition",
  generatedAt: "2026-08-27T02:26:32.023Z",
});

const result = extractScheduleVars([{ ticketSnapshot: realTicketSnapshot }]);
assert.ok(result.date.length > 0, "date must not be empty for a valid ticketSnapshot");
assert.ok(result.date.includes("2026"), `expected year in "${result.date}"`);
assert.equal(result.location, "Omzone Coapinole");

// ── extractScheduleVars — the OLD buggy field names (order_items.itemSnapshot shape) ──
// Reproduces the actual bug: this shape must NOT accidentally produce a date/location,
// proving extractScheduleVars only reads the canonical ticketSnapshot field names.

const itemSnapshotShape = JSON.stringify({
  experienceId: "6a0a0cb9001e62fe4152",
  experienceName: "Performance Recovery Program",
  slotId: "6a8fa00000049357f586",
  slotStart: "2026-08-27T03:24:00.000+00:00",
  slotEnd: "2026-08-27T05:30:00.000+00:00",
});

const buggyShapeResult = extractScheduleVars([{ ticketSnapshot: itemSnapshotShape }]);
assert.equal(buggyShapeResult.date, "");
assert.equal(buggyShapeResult.location, "");

// ── extractScheduleVars — malformed JSON doesn't throw ──────────────────────

assert.deepEqual(
  extractScheduleVars([{ ticketSnapshot: "not valid json" }]),
  { date: "", time: "", location: "" },
);

// ── extractScheduleVars — missing ticketSnapshot field entirely ─────────────

assert.deepEqual(extractScheduleVars([{}]), { date: "", time: "", location: "" });

// ── extractScheduleVars — only uses the first ticket (matches QR's single-ticket design) ──

const secondTicketSnapshot = JSON.stringify({
  slotStartDatetime: "2026-09-01T10:00:00.000Z",
  locationName: "Second Location",
});
const multiTicketResult = extractScheduleVars([
  { ticketSnapshot: realTicketSnapshot },
  { ticketSnapshot: secondTicketSnapshot },
]);
assert.equal(multiTicketResult.location, "Omzone Coapinole");

console.log("scheduleDisplay tests passed");
