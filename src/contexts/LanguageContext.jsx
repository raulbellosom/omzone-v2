import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

// EN partitions
import enCommon from "@/i18n/en/common.json";
import enLanding from "@/i18n/en/landing.json";
import enCheckout from "@/i18n/en/checkout.json";
import enPortal from "@/i18n/en/portal.json";
import enAdmin from "@/i18n/en/admin.json";

// ES partitions
import esCommon from "@/i18n/es/common.json";
import esLanding from "@/i18n/es/landing.json";
import esCheckout from "@/i18n/es/checkout.json";
import esPortal from "@/i18n/es/portal.json";
import esAdmin from "@/i18n/es/admin.json";

const STORAGE_KEY = "omzone_lang";
const VALID_LANGS = ["en", "es"];
const DEFAULT_LANG = "en";

const messages = {
  en: { ...enCommon, ...enLanding, ...enCheckout, ...enPortal, ...enAdmin },
  es: { ...esCommon, ...esLanding, ...esCheckout, ...esPortal, ...esAdmin },
};

export const LanguageContext = createContext(null);

function resolve(obj, path) {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && VALID_LANGS.includes(stored)) return stored;
    } catch {
      /* SSR or restricted storage */
    }
    return DEFAULT_LANG;
  });

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* ignore */
    }
  }, [language]);

  const setLanguage = useCallback((lang) => {
    if (VALID_LANGS.includes(lang)) {
      setLanguageState(lang);
    }
  }, []);

  /**
   * Translate a static UI string by dot-path key.
   * Falls back to EN if key is missing in the current language, then to the key itself.
   * Supports interpolation: t("key", { name: "Val" }) replaces {name} in the string.
   */
  const t = useCallback(
    (key, params) => {
      let val = resolve(messages[language], key);
      if (val === undefined) {
        val = resolve(messages[DEFAULT_LANG], key);
      }
      if (val === undefined) return key;
      if (params && typeof val === "string") {
        return val.replace(/\{(\w+)\}/g, (_, k) =>
          params[k] !== undefined ? params[k] : `{${k}}`,
        );
      }
      return val;
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
