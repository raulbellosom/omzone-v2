import { NavLink, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { ROLES } from "@/constants/roles";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Sparkles,
  Puzzle,
  Package,
  Ticket,
  CalendarDays,
  Warehouse,
  ShoppingCart,
  TicketCheck,
  Users,
  MessageSquare,
  FileText,
  Image,
  Settings,
  UserCog,
  BookOpen,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    labelKey: "admin.sidebar.general",
    items: [
      {
        nameKey: "admin.sidebar.dashboard",
        path: ROUTES.ADMIN,
        icon: LayoutDashboard,
        end: true,
      },
    ],
  },
  {
    labelKey: "admin.sidebar.catalog",
    items: [
      {
        nameKey: "admin.sidebar.experiences",
        path: ROUTES.ADMIN_EXPERIENCES,
        icon: Sparkles,
      },
      {
        nameKey: "admin.sidebar.addons",
        path: ROUTES.ADMIN_ADDONS,
        icon: Puzzle,
      },
      {
        nameKey: "admin.sidebar.packages",
        path: ROUTES.ADMIN_PACKAGES,
        icon: Package,
      },
      {
        nameKey: "admin.sidebar.passes",
        path: ROUTES.ADMIN_PASSES,
        icon: Ticket,
      },
    ],
  },
  {
    labelKey: "admin.sidebar.operations",
    items: [
      {
        nameKey: "admin.sidebar.agenda",
        path: ROUTES.ADMIN_SLOTS,
        icon: CalendarDays,
      },
      {
        nameKey: "admin.sidebar.resources",
        path: ROUTES.ADMIN_RESOURCES,
        icon: Warehouse,
      },
    ],
  },
  {
    labelKey: "admin.sidebar.sales",
    items: [
      {
        nameKey: "admin.sidebar.bookingRequests",
        path: ROUTES.ADMIN_BOOKING_REQUESTS,
        icon: MessageSquare,
      },
      {
        nameKey: "admin.sidebar.orders",
        path: ROUTES.ADMIN_ORDERS,
        icon: ShoppingCart,
      },
      {
        nameKey: "admin.sidebar.tickets",
        path: ROUTES.ADMIN_TICKETS,
        icon: TicketCheck,
      },
      {
        nameKey: "admin.sidebar.clients",
        path: ROUTES.ADMIN_CLIENTS,
        icon: Users,
      },
    ],
  },
  {
    labelKey: "admin.sidebar.content",
    items: [
      {
        nameKey: "admin.sidebar.publications",
        path: ROUTES.ADMIN_PUBLICATIONS,
        icon: FileText,
      },
      { nameKey: "admin.sidebar.media", path: ROUTES.ADMIN_MEDIA, icon: Image },
    ],
  },
  {
    labelKey: "admin.sidebar.system",
    items: [
      {
        nameKey: "admin.sidebar.account",
        path: ROUTES.ADMIN_ACCOUNT,
        icon: UserCog,
      },
      {
        nameKey: "admin.sidebar.settings",
        path: ROUTES.ADMIN_SETTINGS,
        icon: Settings,
      },
    ],
  },
  {
    labelKey: "admin.sidebar.documentation",
    items: [
      {
        nameKey: "admin.sidebar.docs",
        path: "/help/docs/en",
        icon: BookOpen,
        rootOnly: true,
      },
    ],
  },
];

function SidebarNav({ onNavigate }) {
  const { t } = useLanguage();
  const { labels } = useAuth();
  const isRoot = labels.includes(ROLES.ROOT);
  
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {NAV_SECTIONS.map((section) => (
        <div key={section.labelKey}>
          <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-charcoal-subtle">
            {t(section.labelKey)}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              // Skip root-only items for non-root users
              if (item.rootOnly && !isRoot) return null;
              
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-h-11",
                        isActive
                          ? "bg-sage/10 text-sage-dark"
                          : "text-charcoal-muted hover:bg-warm-gray hover:text-charcoal",
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{t(item.nameKey)}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarHeader() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2 px-5 h-14 shrink-0 border-b border-warm-gray-dark/40">
      <span className="font-display text-lg font-semibold text-charcoal">
        OMZONE
      </span>
      <span className="text-[11px] font-medium text-charcoal-subtle uppercase tracking-wider">
        {t("admin.sidebar.admin")}
      </span>
    </div>
  );
}

export default function AdminSidebar({ open, onClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-white border-r border-warm-gray-dark/40">
        <SidebarHeader />
        <SidebarNav />
      </aside>

      {/* Mobile/tablet overlay sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm animate-overlay-in"
            onClick={onClose}
          />
          {/* Drawer */}
          <aside className="relative z-10 flex h-full w-72 max-w-[80vw] flex-col bg-white shadow-modal animate-sheet-in-left">
            <SidebarHeader />
            <SidebarNav onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}

export { NAV_SECTIONS };
