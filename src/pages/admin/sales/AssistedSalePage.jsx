import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import AssistedSaleWizard from "@/components/admin/assisted-sale/AssistedSaleWizard";
import { ROUTES } from "@/constants/routes";

export default function AssistedSalePage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          to={ROUTES.ADMIN_ORDERS}
          className="mt-0.5 text-charcoal-subtle hover:text-charcoal transition-colors"
          aria-label={t("admin.sales.backToOrders")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-sage" />
            <h1 className="text-xl font-bold text-charcoal">
              {t("admin.sales.title")}
            </h1>
          </div>
          <p className="text-sm text-charcoal-muted mt-0.5">
            {t("admin.sales.subtitle")}
          </p>
        </div>
      </div>

      {/* Wizard */}
      <AssistedSaleWizard />
    </div>
  );
}
