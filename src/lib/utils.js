import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Validates a phone in E.164 format.
 * Strips spaces and dashes first, then checks: '+' + 8–15 digits
 * (1–3 country code digits + 7–12 national digits, per ITU-T E.164).
 *
 * Valid:   +52 55 1234 5678, +1-555-123-4567, +525512345678
 * Invalid: 5512345678, +52 1234, +52 123, (55) 1234-5678
 */
export function isValidPhone(value) {
  if (!value || !value.trim()) return true; // optional — empty is valid
  const clean = value.trim().replace(/[\s-]/g, "");
  return /^\+\d{8,15}$/.test(clean);
}

/**
 * Strips spaces and dashes to produce a clean E.164 string for Appwrite.
 * e.g. "+52 55 1234 5678" → "+525512345678"
 */
export function sanitizePhone(value) {
  if (!value || !value.trim()) return "";
  return value.trim().replace(/[\s-]/g, "");
}
