import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * E.164-ish phone regex: must start with '+', country code (1-3 digits),
 * then 6-14 digits. Allows spaces/dashes for readability.
 * Appwrite Auth requires the '+' prefix with country code.
 *
 * Valid:   +52 55 1234 5678, +1-555-123-4567, +525512345678
 * Invalid: 5512345678, 044 55 1234 5678, (55) 1234-5678
 */
const PHONE_E164 = /^\+\d{1,3}[\s-]?\d[\d\s-]{5,13}$/;

/**
 * Returns true if `value` is a valid phone with country prefix, or empty/null.
 */
export function isValidPhone(value) {
  if (!value || !value.trim()) return true; // optional — empty is valid
  return PHONE_E164.test(value.trim());
}

/**
 * Strips spaces and dashes to produce a clean E.164 string for Appwrite.
 * e.g. "+52 55 1234 5678" → "+525512345678"
 */
export function sanitizePhone(value) {
  if (!value || !value.trim()) return "";
  return value.trim().replace(/[\s-]/g, "");
}
