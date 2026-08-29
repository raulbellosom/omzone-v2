/**
 * Pure check-in window math for validate-ticket, kept dependency-free from
 * the Appwrite SDK so it can be unit-tested directly with `node:assert`.
 */

export const DEFAULT_CHECKIN_WINDOW_BEFORE_MINUTES = 60;
export const DEFAULT_CHECKIN_WINDOW_AFTER_MINUTES = 30;

const MIN_WINDOW_MINUTES = 0;
const MAX_WINDOW_MINUTES = 1440;

/**
 * Parses a stored setting value into a valid minutes count, falling back to
 * `fallback` for anything missing, non-numeric, or out of the sane [0, 1440]
 * range — a bad/missing setting must never break check-in.
 */
export function parseWindowMinutes(rawValue, fallback) {
  const parsed = Number.parseInt(rawValue, 10);
  if (
    !Number.isFinite(parsed) ||
    parsed < MIN_WINDOW_MINUTES ||
    parsed > MAX_WINDOW_MINUTES
  ) {
    return fallback;
  }
  return parsed;
}

/**
 * Computes whether `now` falls inside the check-in window for a slot:
 * [slotStartDatetime - beforeMinutes, slotStartDatetime + afterMinutes].
 * Returns null when slotStartDatetime is missing or unparseable.
 */
export function computeScheduleState(
  slotStartDatetime,
  beforeMinutes,
  afterMinutes,
  now = new Date(),
) {
  if (!slotStartDatetime) return null;

  const start = new Date(slotStartDatetime);
  if (Number.isNaN(start.getTime())) return null;

  const windowStart = new Date(start.getTime() - beforeMinutes * 60 * 1000);
  const windowEnd = new Date(start.getTime() + afterMinutes * 60 * 1000);
  const minutesFromStart = Math.round((start.getTime() - now.getTime()) / 60000);

  if (now < windowStart) {
    return {
      withinWindow: false,
      reason: "too_early",
      validFrom: windowStart.toISOString(),
      validUntil: windowEnd.toISOString(),
      now: now.toISOString(),
      minutesFromStart,
    };
  }
  if (now > windowEnd) {
    return {
      withinWindow: false,
      reason: "too_late",
      validFrom: windowStart.toISOString(),
      validUntil: windowEnd.toISOString(),
      now: now.toISOString(),
      minutesFromStart,
    };
  }
  return {
    withinWindow: true,
    validFrom: windowStart.toISOString(),
    validUntil: windowEnd.toISOString(),
    now: now.toISOString(),
    minutesFromStart,
  };
}
