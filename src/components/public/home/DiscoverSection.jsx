import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import Container from "@/components/common/Container";

const TYPES = [
  {
    key: "sessions",
    image:
      "https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=800&q=80",
  },
  {
    key: "immersions",
    image:
      "https://images.unsplash.com/photo-1510797215324-95aa89f43c33?auto=format&fit=crop&w=800&q=80",
  },
  {
    key: "retreats",
    image:
      "https://images.unsplash.com/photo-1600618528240-fb9fc964b853?auto=format&fit=crop&w=800&q=80",
  },
  {
    key: "stays",
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
  },
];

export default function DiscoverSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-cream">
      <Container>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage">
            {t("home.discover.eyebrow")}
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal leading-tight">
            {t("home.discover.title")}
          </h2>
          <p className="mt-4 text-base md:text-lg text-charcoal-muted leading-relaxed">
            {t("home.discover.subtitle")}
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {TYPES.map(({ key, image }) => (
            <Link
              key={key}
              to="/experiences"
              className="group relative flex flex-col overflow-hidden rounded-card bg-white shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={image}
                  alt={t(`home.discover.${key}.title`)}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent" />
              </div>

              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <h3 className="font-display text-xl md:text-2xl font-semibold text-white">
                  {t(`home.discover.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-white/80 leading-relaxed line-clamp-3">
                  {t(`home.discover.${key}.description`)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
