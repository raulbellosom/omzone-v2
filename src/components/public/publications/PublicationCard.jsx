import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import Badge from "@/components/common/Badge";
import OptimizedImage from "@/components/common/OptimizedImage";
import { useLanguage, localizedField } from "@/hooks/useLanguage";
import env from "@/config/env";

const CATEGORY_VARIANT = {
  blog: "sage",
  highlight: "warm",
  landing: "charcoal",
  institutional: "outline",
  faq: "sand",
};

export default function PublicationCard({ publication }) {
  const { language, t } = useLanguage();
  const slug = publication.slug || publication.$id;
  const detailPath = ROUTES.PUBLICATION.replace(":slug", slug);
  const title = localizedField(publication, "title", language);
  const excerpt = localizedField(publication, "excerpt", language);
  const category = publication.category;

  const publishedDate = publication.publishedAt
    ? new Date(publication.publishedAt).toLocaleDateString(
        language === "es" ? "es-MX" : "en-US",
        { year: "numeric", month: "long", day: "numeric" },
      )
    : null;

  return (
    <Link
      to={detailPath}
      className="group block rounded-2xl bg-white border border-warm-gray-dark/30 shadow-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Hero image */}
      {publication.heroImageId && (
        <OptimizedImage
          fileId={publication.heroImageId}
          bucketId={env.bucketPublicationMedia}
          widths={[400, 800]}
          alt={title}
          className="aspect-video"
          imgClass="transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {/* Content */}
      <div className="p-5">
        {/* Category + date row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {category && (
            <Badge variant={CATEGORY_VARIANT[category] || "default"}>
              {t(`publications.category.${category}`) || category}
            </Badge>
          )}
          {publishedDate && (
            <span className="text-xs text-charcoal-subtle">
              {publishedDate}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-semibold text-charcoal leading-tight line-clamp-2">
          {title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="mt-2 text-sm text-charcoal-muted leading-relaxed line-clamp-3">
            {excerpt}
          </p>
        )}

        {/* Read more */}
        <p className="mt-3 text-sm text-sage font-medium group-hover:underline">
          {t("publications.readMore")} →
        </p>
      </div>
    </Link>
  );
}
