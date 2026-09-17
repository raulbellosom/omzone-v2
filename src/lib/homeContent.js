// Shared by the editor, browser and Node renderer. No environment or browser APIs.
export const HOME_CONTENT_ID = "home";
export const HOME_FIELDS = {
  heroTitle: 160, heroTitleEs: 160,
  heroDescription: 600, heroDescriptionEs: 600,
  seoTitle: 120, seoTitleEs: 120,
  seoDescription: 320, seoDescriptionEs: 320,
};

export const DEFAULT_HOME_CONTENT = {
  heroTitle: "Experiences in Puerto Vallarta",
  heroTitleEs: "Experiencias en Puerto Vallarta",
  heroDescription: "Sessions, sound healing, breathwork, immersions, retreats and stays — crafted for mind, body and soul in Bahía de Banderas.",
  heroDescriptionEs: "Sesiones de bienestar, sanación con sonido, respiración, inmersiones, retiros y estancias — diseñadas para tu transformación en Bahía de Banderas.",
  seoTitle: "Experiences in Puerto Vallarta",
  seoTitleEs: "Experiencias en Puerto Vallarta",
  seoDescription: "Discover experiences in Puerto Vallarta — sound healing, breathwork, immersions, retreats and transformative stays in Bahía de Banderas.",
  seoDescriptionEs: "Descubre experiencias en Puerto Vallarta: sanación con sonido, respiración, inmersiones, retiros y estancias transformadoras en Bahía de Banderas.",
  ogImageId: "", ogBucketId: "",
};

export const homePath = (language) => language === "es" ? "/es" : "/";
export const homeLanguage = (pathname) =>
  pathname === "/" ? "en" : /^\/es\/?$/.test(pathname) ? "es" : null;

export function normalizeHomeContent(value = {}) {
  const result = {};
  for (const key of [...Object.keys(HOME_FIELDS), "ogImageId", "ogBucketId"]) {
    result[key] = typeof value[key] === "string" ? value[key].trim() : "";
  }
  for (const key of ["seoTitle", "seoTitleEs"]) {
    result[key] = result[key].replace(/(?:\s*[—–-]\s*OMZONE)+\s*$/i, "").trim();
  }
  if (!result.ogImageId) result.ogBucketId = "";
  return result;
}

export function validateHomeContent(value, allowedBuckets = []) {
  const errors = {};
  const data = normalizeHomeContent(value);
  for (const [key, limit] of Object.entries(HOME_FIELDS)) {
    if (!data[key]) errors[key] = "required";
    else if (data[key].length > limit) errors[key] = "tooLong";
  }
  if (data.ogImageId && (!/^[\w.-]{1,255}$/.test(data.ogImageId) || !allowedBuckets.includes(data.ogBucketId))) {
    errors.ogImageId = "invalidImage";
  }
  return { data, errors, valid: Object.keys(errors).length === 0 };
}

export function homePresentation(data, language, config) {
  const suffix = language === "es" ? "Es" : "";
  const origin = new URL(config.siteUrl).origin;
  const image = data.ogImageId && data.ogBucketId
    ? `${config.appwriteEndpoint}/storage/buckets/${encodeURIComponent(data.ogBucketId)}/files/${encodeURIComponent(data.ogImageId)}/preview?project=${encodeURIComponent(config.appwriteProjectId)}&width=1200&height=630`
    : `${origin}/og-home.jpg`;
  return {
    title: data[`heroTitle${suffix}`], description: data[`heroDescription${suffix}`],
    seoTitle: data[`seoTitle${suffix}`], seoDescription: data[`seoDescription${suffix}`],
    canonical: origin + homePath(language), ogImage: image,
    alternates: { en: origin + "/", es: origin + "/es", "x-default": origin + "/" },
  };
}

export function serializeHomeBootstrap(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
