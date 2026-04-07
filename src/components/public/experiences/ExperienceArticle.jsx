import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import Badge from "@/components/common/Badge";
import OptimizedImage from "@/components/common/OptimizedImage";
import { useLanguage, localizedField } from "@/hooks/useLanguage";

const TYPE_BADGE_VARIANT = {
  session: "sage",
  immersion: "sand",
  retreat: "charcoal",
  stay: "warm",
  private: "outline",
  package: "default",
};

/**
 * Cycling layout variants:
 *  0 → cinematic  (full-bleed image, overlay text)
 *  1 → split      (image left, content right)
 *  2 → split-rev  (content left, image right)
 *  3 → minimal    (centered narrow card, image top)
 */
function getVariant(index) {
  const cycle = index % 4;
  if (cycle === 0) return "cinematic";
  if (cycle === 1) return "split";
  if (cycle === 2) return "split-reverse";
  return "minimal";
}

export default function ExperienceArticle({ experience, index = 0 }) {
  const { language, t } = useLanguage();
  const slug = experience.slug || experience.$id;
  const detailPath = ROUTES.EXPERIENCE.replace(":slug", slug);
  const title = localizedField(experience, "publicName", language);
  const description = localizedField(experience, "shortDescription", language);
  const variant = getVariant(index);

  const badgeEl = (
    <Badge
      variant={TYPE_BADGE_VARIANT[experience.type] || "default"}
      className="text-xs px-3 py-1 shadow-sm"
    >
      {t(`experienceTypes.${experience.type}`) || experience.type}
    </Badge>
  );

  const tagsEl = experience.tagNames?.length > 0 && (
    <div className="flex flex-wrap gap-2">
      {experience.tagNames.map((tag) => (
        <span
          key={tag}
          className="text-xs border rounded-full px-3 py-1"
          style={{
            borderColor:
              variant === "cinematic"
                ? "rgba(255,255,255,0.35)"
                : "rgba(0,0,0,0.12)",
            color: variant === "cinematic" ? "rgba(255,255,255,0.7)" : undefined,
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );

  /* ────────────────────  CINEMATIC  ──────────────────── */
  if (variant === "cinematic") {
    return (
      <article className="group">
        <Link to={detailPath} className="block relative h-[50vh] sm:h-[60vh] md:h-[65vh] min-h-[380px] max-h-[720px] overflow-hidden">
          <OptimizedImage
            fileId={experience.heroImageId}
            widths={[1000, 1600, 2200]}
            alt={title}
            className="absolute inset-0 h-full w-full"
            imgClass="transition-transform duration-[1.2s] group-hover:scale-[1.03]"
            eager={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/25 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 md:p-12 lg:p-16 xl:p-20">
            <div className="max-w-3xl">
              {badgeEl}
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.1] mt-4 tracking-tight">
                {title}
              </h2>
              {description && (
                <p className="mt-4 md:mt-6 text-base md:text-lg text-white/80 leading-relaxed max-w-2xl">
                  {description}
                </p>
              )}
              <div className="mt-5">{tagsEl}</div>
              <span className="inline-flex items-center gap-2 text-white/90 font-medium text-sm mt-6 group-hover:gap-3 transition-all duration-300">
                {t("experienceList.discoverCta")}
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  /* ────────────────────  SPLIT / SPLIT-REVERSE  ──────────────────── */
  if (variant === "split" || variant === "split-reverse") {
    const isReverse = variant === "split-reverse";
    return (
      <article className="group">
        <Link
          to={detailPath}
          className={`flex flex-col lg:flex-row ${isReverse ? "lg:flex-row-reverse" : ""}`}
        >
          {/* Image — 55% on desktop */}
          <div className="relative w-full lg:w-[55%] xl:w-1/2 shrink-0 overflow-hidden">
            <OptimizedImage
              fileId={experience.heroImageId}
              widths={[600, 1000, 1600]}
              alt={title}
              className="aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[480px]"
              imgClass="transition-transform duration-[1s] group-hover:scale-[1.03]"
            />
            <div className="absolute top-5 left-5">{badgeEl}</div>
          </div>

          {/* Content — 45% */}
          <div
            className={`flex flex-col justify-center w-full lg:w-[45%] xl:w-1/2 px-6 py-8 sm:px-10 sm:py-10 lg:px-14 xl:px-20 ${
              isReverse ? "bg-cream" : "bg-white"
            }`}
          >
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-bold text-charcoal leading-tight tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-4 md:mt-5 text-base md:text-lg text-charcoal-muted leading-relaxed">
                {description}
              </p>
            )}
            <div className="mt-5">{tagsEl}</div>
            <div className="mt-6 lg:mt-8">
              <span className="inline-flex items-center gap-2 text-sage-dark font-medium text-sm group-hover:gap-3 transition-all duration-300">
                {t("experienceList.discoverCta")}
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  /* ────────────────────  MINIMAL (centered)  ──────────────────── */
  return (
    <article className="group max-w-5xl mx-auto w-full px-6 lg:px-0">
      <Link to={detailPath} className="block">
        <div className="overflow-hidden rounded-card">
          <OptimizedImage
            fileId={experience.heroImageId}
            widths={[800, 1200, 1600]}
            alt={title}
            className="aspect-[21/9] w-full"
            imgClass="transition-transform duration-[1s] group-hover:scale-[1.03]"
          />
        </div>
        <div className="text-center pt-6 pb-2">
          <div className="mb-3">{badgeEl}</div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal leading-tight tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-3 md:mt-4 text-base md:text-lg text-charcoal-muted leading-relaxed max-w-2xl mx-auto">
              {description}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">{tagsEl}</div>
          <span className="inline-flex items-center gap-2 text-sage-dark font-medium text-sm mt-5 group-hover:gap-3 transition-all duration-300">
            {t("experienceList.discoverCta")}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </article>
  );
}
