import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const SEGMENT_KEYS = {
  admin: "admin.breadcrumbs.admin",
  experiences: "admin.breadcrumbs.experiences",
  editions: "admin.breadcrumbs.editions",
  pricing: "admin.breadcrumbs.pricing",
  addons: "admin.breadcrumbs.addons",
  packages: "admin.breadcrumbs.packages",
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
  create: "admin.breadcrumbs.new",
  "quick-create": "admin.breadcrumbs.new",
  locations: "admin.breadcrumbs.locations",
  rooms: "admin.breadcrumbs.rooms",
  spaces: "admin.breadcrumbs.rooms",
  "booking-requests": "admin.breadcrumbs.bookingRequests",
  "contact-messages": "admin.breadcrumbs.contactMessages",
  sales: "admin.breadcrumbs.sales",
  "user-passes": "admin.breadcrumbs.userPasses",
  sections: "admin.breadcrumbs.sections",
  "check-in": "admin.breadcrumbs.checkin",
  "hero-slides": "admin.breadcrumbs.heroSlides",
  account: "admin.breadcrumbs.account",
};

/**
 * Overrides the link destination for path segments that don't have their own
 * standalone route (they live as tabs on a parent page).
 * Key: the path that would be generated from the segment.
 * Value: the actual navigable URL.
 */
const PATH_LINK_OVERRIDES = {
  "/admin/locations": "/admin/resources?tab=locations",
  "/admin/rooms": "/admin/resources?tab=spaces",
  "/admin/spaces": "/admin/resources?tab=spaces",
};

/**
 * Detects document/entity ID segments (Appwrite 20-char alphanumeric IDs or
 * UUIDs). These are never useful as breadcrumb links and their targets don't
 * exist as standalone routes, so they are skipped entirely.
 */
const ID_RE =
  /^[a-zA-Z0-9]{15,}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isIdSegment(segment) {
  return ID_RE.test(segment) && !SEGMENT_KEYS[segment];
}

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  // Build crumbs from path segments, skipping entity ID segments.
  // The path for each crumb still includes the skipped ID segments so that
  // links resolve to valid routes (e.g. /admin/experiences/:id/editions).
  const crumbs = [];
  segments.forEach((segment, index) => {
    if (isIdSegment(segment)) return;
    const path = "/" + segments.slice(0, index + 1).join("/");
    const to = PATH_LINK_OVERRIDES[path] ?? path;
    const label = SEGMENT_KEYS[segment] ? t(SEGMENT_KEYS[segment]) : segment;
    crumbs.push({ path, to, label, isLast: false });
  });
  if (crumbs.length > 0) crumbs[crumbs.length - 1].isLast = true;

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
              to={crumb.to}
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
