import { Helmet } from "react-helmet-async";
import env from "@/config/env";

const DEFAULT_DESCRIPTION =
  "Discover transformative wellness experiences in Puerto Vallarta — sessions, immersions, retreats and stays crafted for mind, body and soul.";
const DEFAULT_OG_IMAGE = `${env.siteUrl}/logo.png`;

/**
 * Reusable SEO head component.
 *
 * @param {object}  props
 * @param {string}  props.title         - Page title (appended with " — OMZONE")
 * @param {string}  [props.description] - Meta description
 * @param {string}  [props.ogTitle]     - OG title override (defaults to title)
 * @param {string}  [props.ogDescription] - OG description override
 * @param {string}  [props.ogImage]     - Absolute URL for og:image
 * @param {string}  [props.ogType]      - og:type (default "website")
 * @param {string}  [props.canonical]   - Canonical URL (absolute)
 * @param {boolean} [props.noindex]     - Add noindex,nofollow
 * @param {React.ReactNode} [props.children] - Extra Helmet children
 */
export default function SEOHead({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  canonical,
  noindex = false,
  children,
}) {
  const fullTitle = title
    ? `${title} — ${env.siteName}`
    : `${env.siteName} — Wellness Experiences`;
  const desc = description || DEFAULT_DESCRIPTION;
  const oTitle = ogTitle || title || env.siteName;
  const oDesc = ogDescription || desc;
  const oImg = ogImage || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={oTitle} />
      <meta property="og:description" content={oDesc} />
      <meta property="og:image" content={oImg} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={env.siteName} />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={oTitle} />
      <meta name="twitter:description" content={oDesc} />
      <meta name="twitter:image" content={oImg} />

      {children}
    </Helmet>
  );
}
