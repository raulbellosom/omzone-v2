import { NavLink } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import {
  Compass,
  LayoutDashboard,
  ShoppingBag,
  Ticket,
  User,
} from "lucide-react";

const TABS = [
  { name: "Explorar", path: ROUTES.PORTAL, icon: Compass, end: true },
  { name: "Mi Portal", path: ROUTES.PORTAL_DASHBOARD, icon: LayoutDashboard },
  { name: "Tickets", path: ROUTES.PORTAL_TICKETS, icon: Ticket },
  { name: "Órdenes", path: ROUTES.PORTAL_ORDERS, icon: ShoppingBag },
  { name: "Perfil", path: ROUTES.PORTAL_PROFILE, icon: User },
];

/**
 * Mobile bottom tab bar for portal navigation.
 * Visible on < lg breakpoints only.
 */
export default function PortalBottomTabs() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-warm-gray-dark/20 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? "text-sage"
                  : "text-charcoal-muted"
              }`
            }
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-xs font-medium leading-tight">
              {tab.name}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
