import { useLanguage } from "@/hooks/useLanguage";

export default function MissionSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-cream">
      {/* Mission */}
      <div className="container-shell py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text */}
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage">
              {t("about.mission.eyebrow")}
            </span>
            <h2 className="mt-4 font-display text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal leading-tight">
              {t("about.mission.title")}
            </h2>
            <div className="mt-6 space-y-4 text-base md:text-lg text-charcoal-muted leading-relaxed">
              <p>{t("about.mission.body1")}</p>
              <p>{t("about.mission.body2")}</p>
              <p>{t("about.mission.body3")}</p>
            </div>
          </div>

          {/* Image */}
          <div className="relative overflow-hidden rounded-card">
            <img
              src="/images/clase-de-yoga-aereo-selva-tropical.png"
              alt="Wellness retreat surrounded by nature"
              className="w-full h-auto object-cover aspect-[4/3]"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>

      {/* Vision — centered narrow block with different bg */}
      <div className="bg-warm-gray">
        <div className="container-shell py-16 md:py-20 max-w-3xl mx-auto text-center">
          <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal leading-tight">
            {t("about.mission.visionTitle")}
          </h3>
          <div className="mt-6 space-y-4 text-base md:text-lg text-charcoal-muted leading-relaxed">
            <p>{t("about.mission.visionBody1")}</p>
            <p>{t("about.mission.visionBody2")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
