import { useContext } from "react";
import { LanguageContext } from "@/contexts/LanguageContext";

/**
 * Access the language context: language, setLanguage, t(key).
 */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

/**
 * Return the localized value of a field on an entity.
 *
 * Convention: EN field is `fieldName`, ES field is `fieldNameEs`.
 * - If language is "es" and `item[fieldNameEs]` has a value → return ES.
 * - If ES is empty → fallback to EN.
 * - If language is "en" → return EN directly.
 *
 * @param {Object} item   — entity (experience, publication, etc.)
 * @param {string} field  — base field name, e.g. "publicName"
 * @param {string} language — "en" | "es"
 * @returns {string}
 */
export function localizedField(item, field, language) {
  if (!item) return "";
  if (language === "es") {
    const esKey = field + "Es";
    const esVal = item[esKey];
    if (esVal && esVal.trim()) return esVal;
  }
  return item[field] ?? "";
}
