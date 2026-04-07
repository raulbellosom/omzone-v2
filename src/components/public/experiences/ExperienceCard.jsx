import { Link } from "react-router-dom";
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

function formatPrice(amount, currency = "MXN") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ExperienceCard({ experience, priceInfo }) {
  const { language, t } = useLanguage();
  const slug = experience.slug || experience.$id;
  const detailPath = ROUTES.EXPERIENCE.replace(":slug", slug);
  const title = localizedField(experience, "publicName", language);
  const description = localizedField(experience, "shortDescription", language);

  return (
    <Link
      to={detailPath}
      className="group block rounded-2xl bg-white border border-warm-gray-dark/30 shadow-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Hero image */}
      <OptimizedImage
        fileId={experience.heroImageId}
        widths={[400, 800]}
        alt={title}
        className="aspect-4/3"
        imgClass="transition-transform duration-500 group-hover:scale-105"
      />

      {/* Content */}
      <div className="p-5">
        {/* Type badge */}
        <div className="mb-3">
          <Badge variant={TYPE_BADGE_VARIANT[experience.type] || "default"}>
            {t(`experienceTypes.${experience.type}`) || experience.type}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-semibold text-charcoal leading-tight line-clamp-2">
          {title}
        </h3>

        {/* Short description */}
        {description && (
          <p className="mt-2 text-sm text-charcoal-muted leading-relaxed line-clamp-2">
            {description}
          </p>
        )}

        {/* Price */}
        <div className="mt-4 pt-3 border-t border-warm-gray-dark/20">
          {priceInfo ? (
            <p className="text-sm">
              <span className="text-charcoal-muted">{t("price.from")} </span>
              <span className="font-semibold text-charcoal">
                {formatPrice(priceInfo.minPrice, priceInfo.currency)}
              </span>
              <span className="text-charcoal-subtle text-xs ml-1">
                {priceInfo.currency}
              </span>
            </p>
          ) : (
            <p className="text-sm text-charcoal-muted italic">
              {t("price.inquire")}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
