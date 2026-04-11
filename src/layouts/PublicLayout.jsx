import { Outlet, Link, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import StructuredData from "@/components/common/StructuredData";
import { useLanguage } from "@/hooks/useLanguage";
import env from "@/config/env";
import { ROUTES } from "@/constants/routes";

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "OMZONE",
  url: env.siteUrl,
  logo: `${env.siteUrl}/logo.png`,
  description:
    "Premium wellness experiences in Puerto Vallarta and Bahía de Banderas",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Puerto Vallarta",
    addressRegion: "Jalisco",
    addressCountry: "MX",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 20.6534,
    longitude: -105.2253,
  },
  areaServed: [
    { "@type": "City", name: "Puerto Vallarta" },
    { "@type": "City", name: "Bahía de Banderas" },
  ],
};

export default function PublicLayout() {
  const location = useLocation();
  const { t } = useLanguage();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <StructuredData data={ORGANIZATION_SCHEMA} />
      <Navbar />

      <main className={isHome ? "flex-1" : "flex-1 pt-20"}>
        <Outlet />
      </main>

      <footer className="border-t border-warm-gray-dark/40 bg-white">
        <div className="container-shell py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link
                to={ROUTES.HOME}
                className="font-display text-xl font-bold text-charcoal tracking-widest"
              >
                OMZONE
              </Link>
              <p className="mt-3 text-sm text-charcoal-muted leading-relaxed max-w-xs">
                {t("footer.tagline")}
              </p>
            </div>

            {/* Experiences */}
            <div>
              <h4 className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-4">
                {t("footer.experiences")}
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to={ROUTES.EXPERIENCES}
                    className="text-sm text-charcoal-muted hover:text-sage transition-colors"
                  >
                    {t("footer.allExperiences")}
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.EXPERIENCES}
                    className="text-sm text-charcoal-muted hover:text-sage transition-colors"
                  >
                    {t("footer.sessions")}
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.EXPERIENCES}
                    className="text-sm text-charcoal-muted hover:text-sage transition-colors"
                  >
                    {t("footer.immersions")}
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.EXPERIENCES}
                    className="text-sm text-charcoal-muted hover:text-sage transition-colors"
                  >
                    {t("footer.retreats")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-4">
                {t("footer.company")}
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to={ROUTES.ABOUT}
                    className="text-sm text-charcoal-muted hover:text-sage transition-colors"
                  >
                    {t("footer.about")}
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.CONTACT}
                    className="text-sm text-charcoal-muted hover:text-sage transition-colors"
                  >
                    {t("footer.contact")}
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.PRIVACY}
                    className="text-sm text-charcoal-muted hover:text-sage transition-colors"
                  >
                    {t("footer.privacy")}
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.TERMS}
                    className="text-sm text-charcoal-muted hover:text-sage transition-colors"
                  >
                    {t("footer.terms")}
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.REFUND_POLICY}
                    className="text-sm text-charcoal-muted hover:text-sage transition-colors"
                  >
                    {t("footer.refundPolicy")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-4">
                {t("footer.connect")}
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <span className="text-sm text-charcoal-muted">
                    {t("footer.instagram")}
                  </span>
                </li>
                <li>
                  <span className="text-sm text-charcoal-muted">
                    {t("footer.facebook")}
                  </span>
                </li>
                <li>
                  <span className="text-sm text-charcoal-muted">
                    {t("footer.emailUs")}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-6 border-t border-warm-gray-dark/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-charcoal-subtle">
              &copy; {new Date().getFullYear()} {t("footer.copyright")}
            </p>
            <p className="text-xs text-charcoal-subtle italic">
              {t("footer.crafted")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
