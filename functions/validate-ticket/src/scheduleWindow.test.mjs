import assert from "node:assert/strict";
import {
  DEFAULT_CHECKIN_WINDOW_BEFORE_MINUTES,
  DEFAULT_CHECKIN_WINDOW_AFTER_MINUTES,
  parseWindowMinutes,
  computeScheduleState,
} from "./scheduleWindow.js";

// ── parseWindowMinutes ──────────────────────────────────────────────────────

assert.equal(parseWindowMinutes("60", 30), 60);
assert.equal(parseWindowMinutes("0", 30), 0);
assert.equal(parseWindowMinutes("1440", 30), 1440);
assert.equal(parseWindowMinutes("1441", 30), 30); // above max -> fallback
assert.equal(parseWindowMinutes("-1", 30), 30); // negative -> fallback
assert.equal(parseWindowMinutes("abc", 30), 30); // not numeric -> fallback
assert.equal(parseWindowMinutes(undefined, 30), 30); // missing -> fallback
assert.equal(parseWindowMinutes(null, 30), 30); // null -> fallback

// ── computeScheduleState — invalid input ────────────────────────────────────

assert.equal(computeScheduleState(null, 60, 30), null);
assert.equal(computeScheduleState(undefined, 60, 30), null);
assert.equal(computeScheduleState("not-a-date", 60, 30), null);

// ── computeScheduleState — window boundaries ────────────────────────────────
// Slot starts 2026-08-27T09:00:00.000Z, window = [-60min, +30min] = [08:00, 09:30]

const slotStart = "2026-08-27T09:00:00.000Z";

const atWindowOpen = computeScheduleState(
  slotStart, 60, 30, new Date("2026-08-27T08:00:00.000Z"),
);
assert.equal(atWindowOpen.withinWindow, true);
assert.equal(atWindowOpen.validFrom, "2026-08-27T08:00:00.000Z");
assert.equal(atWindowOpen.validUntil, "2026-08-27T09:30:00.000Z");

const oneMinuteBeforeOpen = computeScheduleState(
  slotStart, 60, 30, new Date("2026-08-27T07:59:00.000Z"),
);
assert.equal(oneMinuteBeforeOpen.withinWindow, false);
assert.equal(oneMinuteBeforeOpen.reason, "too_early");

const atSlotStart = computeScheduleState(
  slotStart, 60, 30, new Date("2026-08-27T09:00:00.000Z"),
);
assert.equal(atSlotStart.withinWindow, true);

const atWindowClose = computeScheduleState(
  slotStart, 60, 30, new Date("2026-08-27T09:30:00.000Z"),
);
assert.equal(atWindowClose.withinWindow, true);

const oneMinuteAfterClose = computeScheduleState(
  slotStart, 60, 30, new Date("2026-08-27T09:31:00.000Z"),
);
assert.equal(oneMinuteAfterClose.withinWindow, false);
assert.equal(oneMinuteAfterClose.reason, "too_late");

// ── Defaults sanity ──────────────────────────────────────────────────────────

assert.equal(DEFAULT_CHECKIN_WINDOW_BEFORE_MINUTES, 60);
assert.equal(DEFAULT_CHECKIN_WINDOW_AFTER_MINUTES, 30);

console.log("scheduleWindow tests passed");
