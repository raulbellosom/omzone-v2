import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { useLanguage } from "@/hooks/useLanguage";
import ItemTypeBadge from "@/components/admin/packages/ItemTypeBadge";

function formatPrice(amount, currency) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

const STATUS_BADGE = {
  draft: { variant: "warm", i18nKey: "admin.packageStatuses.draft" },
  published: { variant: "success", i18nKey: "admin.packageStatuses.published" },
  archived: { variant: "default", i18nKey: "admin.packageStatuses.archived" },
};

export default function PackagePreview({ pkg, items = [] }) {
  const { t } = useLanguage();
  if (!pkg) return null;

  const badge = STATUS_BADGE[pkg.status] || STATUS_BADGE.draft;

  return (
    <Card className="p-5 space-y-5 border-sage/30">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-charcoal">{pkg.name}</h3>
          {pkg.nameEs && (
            <p className="text-sm text-charcoal-subtle">{pkg.nameEs}</p>
          )}
        </div>
        <Badge variant={badge.variant}>{t(badge.i18nKey)}</Badge>
      </div>

      {/* Description */}
      {pkg.description && (
        <p className="text-sm text-charcoal-muted leading-relaxed">
          {pkg.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-muted">
        <span className="font-semibold text-charcoal">
          {formatPrice(pkg.totalPrice, pkg.currency)}
        </span>
        {pkg.durationDays && (
          <span>
            {pkg.durationDays} {t("admin.packagePreview.days")}
          </span>
        )}
        {pkg.capacity && (
          <span>
            {t("admin.packagePreview.upToPeople").replace(
              "{count}",
              pkg.capacity,
            )}
          </span>
        )}
      </div>

      {/* Inclusions */}
      {items.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-charcoal-subtle uppercase tracking-wider">
            {t("admin.packagePreview.includes")}
          </h4>
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li
                key={item.$id || item._tempId || i}
                className="flex items-start gap-2.5"
              >
                <ItemTypeBadge
                  type={item.itemType}
                  className="mt-0.5 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm text-charcoal">
                    {item.quantity && item.quantity > 1 && (
                      <span className="font-medium">{item.quantity}× </span>
                    )}
                    {item.description}
                  </p>
                  {item.descriptionEs && (
                    <p className="text-xs text-charcoal-subtle mt-0.5">
                      {item.descriptionEs}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {items.length === 0 && (
        <p className="text-sm text-charcoal-subtle italic">
          {t("admin.packagePreview.noItemsYet")}
        </p>
      )}
    </Card>
  );
}
