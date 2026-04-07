import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/common/Button";

export default function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="relative py-28 md:py-36 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80"
          alt=""
          role="presentation"
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-charcoal/60" />

      {/* Content */}
      <div className="relative z-10 container-shell text-center px-6">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight max-w-3xl mx-auto">
          {t("home.cta.title")}
        </h2>

        <p className="mt-5 md:mt-6 text-base md:text-lg text-white/80 max-w-xl mx-auto leading-relaxed font-light">
          {t("home.cta.subtitle")}
        </p>

        <div className="mt-10">
          <Button size="xl" variant="outline" className="border-white text-white hover:bg-white hover:text-charcoal" asChild>
            <Link to="/experiences">{t("home.cta.button")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
