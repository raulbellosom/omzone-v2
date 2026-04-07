import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Badge from "@/components/common/Badge";
import OptimizedImage from "@/components/common/OptimizedImage";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";

const TYPE_LABELS = {
  session: "Session",
  immersion: "Immersion",
  retreat: "Retreat",
  stay: "Stay",
  private: "Private",
  package: "Package",
};
const TYPE_BADGE = {
  session: "sage",
  immersion: "sand",
  retreat: "charcoal",
  stay: "warm",
  private: "outline",
  package: "default",
};

export default function ExperienceHero({ experience }) {
  const { t } = useLanguage();

  return (
    <div className="relative w-full -mt-20">
      {/* Image */}
      <div className="relative w-full aspect-3/4 sm:aspect-video md:aspect-21/9 overflow-hidden bg-warm-gray">
        <OptimizedImage
          fileId={experience.heroImageId}
          widths={[800, 1200, 1600]}
          quality={85}
          alt={experience.publicName}
          className="w-full h-full"
          eager
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

        {/* Back link — overlaid top-left, below navbar */}
        <div className="absolute top-20 left-0 right-0 z-10">
          <div className="container-shell">
            <Link
              to={ROUTES.EXPERIENCES}
              className="inline-flex items-center gap-1.5 text-sm text-white/90 hover:text-white transition-colors group backdrop-blur-sm bg-black/20 rounded-full px-3 py-1.5"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              {t("experienceDetail.allExperiences")}
            </Link>
          </div>
        </div>

        {/* Content over image */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container-shell">
            <div className="mb-3">
              <Badge variant={TYPE_BADGE[experience.type] || "default"}>
                {TYPE_LABELS[experience.type] || experience.type}
              </Badge>
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl">
              {experience.publicName}
            </h1>
            {experience.shortDescription && (
              <p className="mt-3 text-white/80 text-base md:text-lg max-w-2xl leading-relaxed">
                {experience.shortDescription}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
