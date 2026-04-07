import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const SEGMENT_LABELS = {
  admin: "Admin",
  experiences: "Experiencias",
  editions: "Ediciones",
  pricing: "Precios",
  addons: "Addons",
  packages: "Paquetes",
  passes: "Pases",
  slots: "Agenda",
  resources: "Recursos",
  orders: "Órdenes",
  tickets: "Tickets",
  clients: "Clientes",
  publications: "Publicaciones",
  media: "Media",
  settings: "Configuración",
  users: "Usuarios",
  new: "Crear",
  edit: "Editar",
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    const label = SEGMENT_LABELS[segment] || segment;
    const isLast = index === segments.length - 1;
    return { path, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
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
