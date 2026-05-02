import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Mail } from "lucide-react";

const CONTENT = {
  en: {
    eyebrow: "Coming Soon",
    title: "Something beautiful\nis being crafted.",
    subtitle:
      "We are putting the finishing touches on a new wellness experience for Puerto Vallarta and Bahía de Banderas. In the meantime, don't hesitate to reach out.",
    contactLabel: "Get in touch",
  },
  es: {
    eyebrow: "Próximamente",
    title: "Algo hermoso\nestá siendo creado.",
    subtitle:
      "Estamos dando los últimos toques a una nueva experiencia de bienestar para Puerto Vallarta y Bahía de Banderas. Mientras tanto, no dudes en contactarnos.",
    contactLabel: "Contáctanos",
  },
};

export default function UnderConstructionPage() {
  const { language, setLanguage } = useLanguage();
  const c = CONTENT[language] ?? CONTENT.en;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-charcoal flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-sage/8 blur-[140px]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-sage/4 blur-[100px] translate-x-1/3 -translate-y-1/3" />
      </div>

      {/* Language switcher — top right */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-10">
        <div
          className="inline-flex items-center rounded-full border border-white/20 bg-white/8 p-0.5"
          role="radiogroup"
          aria-label="Language"
        >
          {["en", "es"].map((code) => (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={language === code}
              onClick={() => setLanguage(code)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 min-w-[40px] cursor-pointer ${
                language === code
                  ? "bg-white text-charcoal shadow-sm"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main
        className={`relative z-10 text-center max-w-lg mx-auto transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        {/* Brand wordmark */}
        <div className="mb-10 sm:mb-12">
          <span className="font-display text-xl sm:text-2xl font-semibold tracking-[0.3em] text-white/90 uppercase select-none">
            OMZONE
          </span>
        </div>

        {/* Accent divider */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-8 h-px bg-sage/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-sage/50" />
          <div className="w-8 h-px bg-sage/40" />
        </div>

        {/* Eyebrow */}
        <p className="text-sage text-xs sm:text-sm font-medium tracking-[0.35em] uppercase mb-7">
          {c.eyebrow}
        </p>

        {/* Headline */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-[3.5rem] font-semibold text-white leading-tight mb-7 whitespace-pre-line">
          {c.title}
        </h1>

        {/* Subtitle */}
        <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-12 max-w-sm mx-auto">
          {c.subtitle}
        </p>

        {/* Contact CTA */}
        <div className="flex flex-col items-center gap-2">
          <a
            href="mailto:admin@omzone.com"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-sage/40 text-sage hover:bg-sage/10 hover:border-sage/70 transition-all duration-200 text-sm font-medium group"
          >
            <Mail className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            admin@omzone.com
          </a>
          <span className="text-white/25 text-xs tracking-wide">
            {c.contactLabel}
          </span>
        </div>
      </main>

      {/* Footer */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 text-white/18 text-xs tracking-widest uppercase select-none whitespace-nowrap">
        © {new Date().getFullYear()} OMZONE — Puerto Vallarta
      </div>
    </div>
  );
}
