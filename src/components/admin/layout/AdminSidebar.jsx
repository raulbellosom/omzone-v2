import { NavLink, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Sparkles,
  CalendarRange,
  DollarSign,
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
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "General",
    items: [
      {
        name: "Dashboard",
        path: ROUTES.ADMIN,
        icon: LayoutDashboard,
        end: true,
      },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { name: "Experiencias", path: ROUTES.ADMIN_EXPERIENCES, icon: Sparkles },
      { name: "Ediciones", path: ROUTES.ADMIN_EDITIONS, icon: CalendarRange },
      { name: "Precios", path: ROUTES.ADMIN_PRICING, icon: DollarSign },
      { name: "Addons", path: ROUTES.ADMIN_ADDONS, icon: Puzzle },
      { name: "Paquetes", path: ROUTES.ADMIN_PACKAGES, icon: Package },
      { name: "Pases", path: ROUTES.ADMIN_PASSES, icon: Ticket },
    ],
  },
  {
    label: "Operación",
    items: [
      { name: "Agenda", path: ROUTES.ADMIN_SLOTS, icon: CalendarDays },
      { name: "Recursos", path: ROUTES.ADMIN_RESOURCES, icon: Warehouse },
    ],
  },
  {
    label: "Ventas",
    items: [
      { name: "Solicitudes", path: ROUTES.ADMIN_BOOKING_REQUESTS, icon: MessageSquare },
      { name: "Órdenes", path: ROUTES.ADMIN_ORDERS, icon: ShoppingCart },
      { name: "Tickets", path: ROUTES.ADMIN_TICKETS, icon: TicketCheck },
      { name: "Clientes", path: ROUTES.ADMIN_CLIENTS, icon: Users },
    ],
  },
  {
    label: "Contenido",
    items: [
      {
        name: "Publicaciones",
        path: ROUTES.ADMIN_PUBLICATIONS,
        icon: FileText,
      },
      { name: "Media", path: ROUTES.ADMIN_MEDIA, icon: Image },
    ],
  },
  {
    label: "Sistema",
    items: [
      { name: "Configuración", path: ROUTES.ADMIN_SETTINGS, icon: Settings },
    ],
  },
];

function SidebarNav({ onNavigate }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-charcoal-subtle">
            {section.label}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sage/10 text-sage-dark"
                        : "text-charcoal-muted hover:bg-warm-gray hover:text-charcoal",
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarHeader() {
  return (
    <div className="flex items-center gap-2 px-5 py-4 border-b border-warm-gray-dark/40">
      <span className="font-display text-lg font-semibold text-charcoal">
        OMZONE
      </span>
      <span className="text-[11px] font-medium text-charcoal-subtle uppercase tracking-wider">
        Admin
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
