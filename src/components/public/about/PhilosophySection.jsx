import { Compass, Flame, Shield, Link2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const PILLARS = [
  { key: "intention", Icon: Compass },
  { key: "transformation", Icon: Flame },
  { key: "sanctuary", Icon: Shield },
  { key: "connection", Icon: Link2 },
];

export default function PhilosophySection() {
  const { t } = useLanguage();

  return (
    <section className="bg-charcoal text-white py-20 md:py-28">
      <div className="container-shell">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage-muted">
            {t("about.philosophy.eyebrow")}
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            {t("about.philosophy.title")}
          </h2>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {PILLARS.map(({ key, Icon }) => (
            <div key={key} className="text-center group">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-colors duration-300 group-hover:bg-sage group-hover:border-sage">
                <Icon className="h-7 w-7 text-sage-muted group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
              </div>

              <h3 className="mt-6 font-display text-xl md:text-2xl font-semibold">
                {t(`about.philosophy.${key}.title`)}
              </h3>

              <p className="mt-3 text-sm md:text-base text-white/65 leading-relaxed max-w-xs mx-auto">
                {t(`about.philosophy.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
