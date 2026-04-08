import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import Badge from "@/components/common/Badge";
import OptimizedImage from "@/components/common/OptimizedImage";
import { useLanguage, localizedField } from "@/hooks/useLanguage";
import { Ticket, Zap, Clock } from "lucide-react";

function formatPrice(amount, currency = "MXN") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PassCard({ pass }) {
  const { language, t } = useLanguage();
  const slug = pass.slug || pass.$id;
  const detailPath = ROUTES.PASS.replace(":slug", slug);
  const name = localizedField(pass, "name", language);
  const description = localizedField(pass, "description", language);

  return (
    <Link
      to={detailPath}
      className="group block rounded-2xl bg-white border border-warm-gray-dark/30 shadow-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Hero image */}
      {pass.heroImageId && (
        <OptimizedImage
          fileId={pass.heroImageId}
          widths={[400, 800]}
          alt={name}
          className="aspect-video"
          imgClass="transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {/* Content */}
      <div className="p-5">
        {/* Badge row */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="sage">
            <Ticket className="h-3 w-3 mr-1" />
            {t("passes.credits", { count: pass.totalCredits })}
          </Badge>
          {pass.validityDays && (
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {t("passes.validDays", { days: pass.validityDays })}
            </Badge>
          )}
        </div>

        {/* Name */}
        <h3 className="font-display text-lg font-semibold text-charcoal leading-tight line-clamp-2">
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className="mt-2 text-sm text-charcoal-muted leading-relaxed line-clamp-3">
            {description}
          </p>
        )}

        {/* Price */}
        <div className="mt-4 pt-3 border-t border-warm-gray-dark/20 flex items-center justify-between">
          <p className="text-sm">
            <span className="font-semibold text-charcoal">
              {formatPrice(pass.basePrice, pass.currency)}
            </span>
            <span className="text-charcoal-subtle text-xs ml-1">
              {pass.currency}
            </span>
          </p>
          <span className="text-xs text-sage font-medium flex items-center gap-1 group-hover:underline">
            <Zap className="h-3 w-3" />
            {t("passes.getPass")}
          </span>
        </div>
      </div>
    </Link>
  );
}
