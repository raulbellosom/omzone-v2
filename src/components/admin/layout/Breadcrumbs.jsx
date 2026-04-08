import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const SEGMENT_KEYS = {
  admin: "admin.breadcrumbs.admin",
  experiences: "admin.breadcrumbs.experiences",
  editions: "admin.breadcrumbs.editions",
  pricing: "admin.breadcrumbs.pricing",
  addons: "admin.breadcrumbs.addons",
  packages: "admin.breadcrumbs.packages",
  passes: "admin.breadcrumbs.passes",
  slots: "admin.breadcrumbs.slots",
  resources: "admin.breadcrumbs.resources",
  orders: "admin.breadcrumbs.orders",
  tickets: "admin.breadcrumbs.tickets",
  clients: "admin.breadcrumbs.clients",
  publications: "admin.breadcrumbs.publications",
  media: "admin.breadcrumbs.media",
  settings: "admin.breadcrumbs.settings",
  users: "admin.breadcrumbs.users",
  new: "admin.breadcrumbs.new",
  edit: "admin.breadcrumbs.edit",
  locations: "admin.breadcrumbs.locations",
  rooms: "admin.breadcrumbs.rooms",
  "booking-requests": "admin.breadcrumbs.bookingRequests",
  sales: "admin.breadcrumbs.sales",
  "user-passes": "admin.breadcrumbs.userPasses",
  sections: "admin.breadcrumbs.sections",
  checkin: "admin.breadcrumbs.checkin",
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    const label = SEGMENT_KEYS[segment] ? t(SEGMENT_KEYS[segment]) : segment;
    const isLast = index === segments.length - 1;
    return { path, label, isLast };
  });

  return (
    <nav
      aria-label={t("admin.breadcrumbsAriaLabel")}
      className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-none"
    >
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1">
          {i > 0 && (
            <ChevronRight className="h-3.5 w-3.5 text-charcoal-subtle shrink-0" />
          )}
          {crumb.isLast ? (
            <span className="font-medium text-charcoal">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className="text-charcoal-muted hover:text-charcoal transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
