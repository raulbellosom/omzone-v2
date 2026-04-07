import Badge from "@/components/common/Badge";
import OptimizedImage from "@/components/common/OptimizedImage";

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
  return (
    <div className="relative w-full">
      {/* Image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-warm-gray">
        <OptimizedImage
          fileId={experience.heroImageId}
          widths={[800, 1200, 1600]}
          quality={85}
          alt={experience.publicName}
          className="w-full h-full"
          eager
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

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
