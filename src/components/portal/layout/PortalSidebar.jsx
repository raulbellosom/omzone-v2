import { NavLink } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";
import {
  Compass,
  LayoutDashboard,
  ShoppingBag,
  Ticket,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "explore", path: ROUTES.PORTAL, icon: Compass, end: true },
  { key: "dashboard", path: ROUTES.PORTAL_DASHBOARD, icon: LayoutDashboard },
  { key: "orders", path: ROUTES.PORTAL_ORDERS, icon: ShoppingBag },
  { key: "tickets", path: ROUTES.PORTAL_TICKETS, icon: Ticket },
  { key: "profile", path: ROUTES.PORTAL_PROFILE, icon: User },
];

/**
 * Portal sidebar — desktop only (lg+). Navigation links only.
 * User info, logout, and back-to-site are handled by the shared Navbar.
 */
export default function PortalSidebar() {
  const { t } = useLanguage();

  return (
    <aside className="hidden lg:flex flex-col w-56 xl:w-60 shrink-0 sticky top-16 h-[calc(100dvh-4rem)] bg-white border-r border-warm-gray-dark/15 overflow-y-auto">
      {/* Section label */}
      <div className="px-5 pt-6 pb-3">
        <p className="text-[10px] font-semibold text-charcoal-muted uppercase tracking-widest">
          Mi Portal
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-6">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sage/10 text-sage"
                      : "text-charcoal-muted hover:bg-warm-gray/20 hover:text-charcoal"
                  }`
                }
              >
                <item.icon className="w-4.5 h-4.5 shrink-0" />
                {t(`portal.sidebar.${item.key}`)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

