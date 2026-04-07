import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/hooks/useLanguage";
import UserAvatar from "@/components/common/UserAvatar";
import { ROUTES } from "@/constants/routes";
import {
  LayoutDashboard,
  ShoppingBag,
  Ticket,
  Sparkles,
  User,
  LogOut,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", path: ROUTES.PORTAL, icon: LayoutDashboard, end: true },
  { key: "orders", path: ROUTES.PORTAL_ORDERS, icon: ShoppingBag },
  { key: "tickets", path: ROUTES.PORTAL_TICKETS, icon: Ticket },
  { key: "passes", path: ROUTES.PORTAL_PASSES, icon: Sparkles },
  { key: "profile", path: ROUTES.PORTAL_PROFILE, icon: User },
];

/**
 * Portal sidebar — desktop: persistent, mobile: overlay sheet.
 */
export default function PortalSidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { profile } = useUserProfile();
  const { t } = useLanguage();

  const displayName =
    profile?.displayName || user?.name || user?.email?.split("@")[0] || "User";
  const photoId = profile?.photoId || null;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 bg-white border-r border-warm-gray-dark/20
          w-72 max-w-[75vw] sm:max-w-[80vw] flex flex-col
          transition-transform duration-300 ease-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header — user info */}
        <div className="p-5 border-b border-warm-gray-dark/10">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <span className="font-display text-sm font-semibold text-charcoal tracking-wider uppercase">
              {t("portal.sidebar.myPortal")}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-warm-gray/30 transition-colors"
            >
              <X className="w-5 h-5 text-charcoal-muted" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <UserAvatar name={displayName} photoId={photoId} size="lg" />
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-charcoal truncate">
                {displayName}
              </p>
              <p className="text-xs text-charcoal-muted truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-sage/10 text-sage"
                        : "text-charcoal-muted hover:bg-warm-gray/20 hover:text-charcoal"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {t(`portal.sidebar.${item.key}`)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-warm-gray-dark/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-charcoal-muted hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {t("portal.sidebar.logout")}
          </button>
        </div>
      </aside>
    </>
  );
}
