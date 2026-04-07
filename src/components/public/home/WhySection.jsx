import { Sparkles, Mountain, Heart, Users } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import Container from "@/components/common/Container";

const PILLARS = [
  { key: "curated", Icon: Sparkles },
  { key: "setting", Icon: Mountain },
  { key: "transformative", Icon: Heart },
  { key: "intimate", Icon: Users },
];

export default function WhySection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-warm-gray">
      <Container>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage">
            {t("home.why.eyebrow")}
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal leading-tight">
            {t("home.why.title")}
          </h2>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {PILLARS.map(({ key, Icon }) => (
            <div key={key} className="text-center group">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/10 text-sage transition-colors duration-300 group-hover:bg-sage group-hover:text-white">
                <Icon className="h-6 w-6" strokeWidth={1.5} />
              </div>

              <h3 className="mt-5 font-display text-lg md:text-xl font-semibold text-charcoal">
                {t(`home.why.pillars.${key}.title`)}
              </h3>

              <p className="mt-3 text-sm md:text-base text-charcoal-muted leading-relaxed">
                {t(`home.why.pillars.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
