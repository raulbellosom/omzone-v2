import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import { Sparkles, CalendarDays, ShoppingCart } from "lucide-react";

const ACTIONS = [
  {
    i18nKey: "admin.dashboard.createExperience",
    path: ROUTES.ADMIN_EXPERIENCE_NEW,
    icon: Sparkles,
    adminOnly: false,
  },
  {
    i18nKey: "admin.dashboard.viewAgenda",
    path: ROUTES.ADMIN_SLOTS,
    icon: CalendarDays,
    adminOnly: false,
  },
  {
    i18nKey: "admin.dashboard.newSale",
    path: "/admin/sales/new",
    icon: ShoppingCart,
    adminOnly: true,
  },
];

export default function QuickActions({ isAdmin }) {
  const { t } = useLanguage();
  const visible = ACTIONS.filter((a) => !a.adminOnly || isAdmin);

  return (
    <div className="flex flex-wrap gap-3">
      {visible.map((action) => (
        <Link
          key={action.path}
          to={action.path}
          className="inline-flex items-center gap-2 rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm font-medium text-charcoal shadow-sm hover:bg-warm-gray hover:shadow-card transition-all min-h-11"
        >
          <action.icon className="h-4 w-4 text-sage" />
          {t(action.i18nKey)}
        </Link>
      ))}
    </div>
  );
}
