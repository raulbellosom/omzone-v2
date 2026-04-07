import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePortalDashboard } from "@/hooks/usePortalDashboard";
import UserAvatar from "@/components/common/UserAvatar";
import { ROUTES } from "@/constants/routes";
import {
  Ticket,
  Sparkles,
  ShoppingBag,
  Calendar,
  ArrowRight,
  Compass,
  User,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, to, color = "sage" }) {
  const colors = {
    sage: "bg-sage/10 text-sage",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-warm-gray-dark/10 hover:border-sage/30 hover:shadow-sm transition-all"
    >
      <div
        className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-charcoal-muted font-medium">{label}</p>
        <p className="text-xl font-bold text-charcoal">{value}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-charcoal-muted opacity-40 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

function UpcomingCard({ ticket }) {
  const s = ticket._snapshot || {};
  const date = s.slotStartDatetime || s.editionDate;
  const formatted = date
    ? new Date(date).toLocaleDateString("es-MX", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Sin fecha";

  return (
    <Link
      to={`/portal/tickets/${ticket.$id}`}
      className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-warm-gray-dark/10 hover:border-sage/30 hover:shadow-sm transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-sage/10 text-sage flex items-center justify-center flex-shrink-0">
        <Calendar className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-charcoal truncate">
          {s.experienceName || "Experiencia"}
        </p>
        <p className="text-xs text-charcoal-muted">{formatted}</p>
        {s.locationName && (
          <p className="text-xs text-charcoal-muted/70 truncate">
            {s.locationName}
          </p>
        )}
      </div>
      <ArrowRight className="w-4 h-4 text-charcoal-muted flex-shrink-0" />
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 bg-warm-gray/40 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-warm-gray/30 rounded-2xl" />
        ))}
      </div>
      <div className="h-6 w-40 bg-warm-gray/30 rounded-lg" />
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 bg-warm-gray/30 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function PortalDashboardPage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { data, loading, error } = usePortalDashboard();

  if (loading || profileLoading) return <DashboardSkeleton />;

  const displayName =
    profile?.displayName || user?.name || user?.email?.split("@")[0] || "there";
  const photoId = profile?.photoId || null;
  const hasActivity =
    data.activeTickets > 0 || data.activePasses > 0 || data.recentOrders > 0;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center gap-4">
        <UserAvatar name={displayName} photoId={photoId} size="xl" />
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal">
            Hola, {displayName}
          </h1>
          <p className="text-sm text-charcoal-muted mt-0.5">
            Bienvenido a tu espacio personal de bienestar
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">
          No pudimos cargar tu información. Intenta recargar la página.
        </div>
      )}

      {/* Activity stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          icon={Ticket}
          label="Tickets activos"
          value={data.activeTickets}
          to={ROUTES.PORTAL_TICKETS}
          color="sage"
        />
        <StatCard
          icon={Sparkles}
          label="Pases activos"
          value={data.activePasses}
          to={ROUTES.PORTAL_PASSES}
          color="amber"
        />
        <StatCard
          icon={ShoppingBag}
          label="Órdenes"
          value={data.recentOrders}
          to={ROUTES.PORTAL_ORDERS}
          color="blue"
        />
      </div>

      {/* Upcoming experiences */}
      {data.upcomingTickets.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold text-charcoal">
              Próximas experiencias
            </h2>
            <Link
              to={ROUTES.PORTAL_TICKETS}
              className="text-xs text-sage font-medium hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-2">
            {data.upcomingTickets.map((t) => (
              <UpcomingCard key={t.$id} ticket={t} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!hasActivity && !error && (
        <div className="text-center py-12 px-6">
          <div className="w-16 h-16 rounded-2xl bg-sage/10 text-sage flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="font-display text-xl font-semibold text-charcoal mb-2">
            Tu journey comienza aquí
          </h2>
          <p className="text-sm text-charcoal-muted max-w-sm mx-auto mb-6">
            Descubre experiencias de bienestar diseñadas para reconectar
            contigo. Sesiones, inmersiones, retiros y más te esperan.
          </p>
          <Link
            to="/experiencias"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sage text-white text-sm font-semibold hover:bg-sage-dark transition-colors"
          >
            Explorar experiencias
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Quick links */}
      {hasActivity && (
        <section>
          <h2 className="font-display text-lg font-semibold text-charcoal mb-3">
            Acceso rápido
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Mis Tickets", to: ROUTES.PORTAL_TICKETS, icon: Ticket },
              {
                label: "Mis Órdenes",
                to: ROUTES.PORTAL_ORDERS,
                icon: ShoppingBag,
              },
              { label: "Mis Pases", to: ROUTES.PORTAL_PASSES, icon: Sparkles },
              { label: "Mi Perfil", to: ROUTES.PORTAL_PROFILE, icon: User },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-warm-gray-dark/10 hover:border-sage/30 hover:shadow-sm transition-all text-center"
              >
                <link.icon className="w-5 h-5 text-sage" />
                <span className="text-xs font-medium text-charcoal">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
