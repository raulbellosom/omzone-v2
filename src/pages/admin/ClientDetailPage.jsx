import { useParams, useNavigate, Link } from "react-router-dom";
import { useClientDetail } from "@/hooks/useAdminClients";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";
import { Card } from "@/components/common/Card";
import Button from "@/components/common/Button";
import {
  ArrowLeft,
  User,
  ShoppingCart,
  Ticket,
  CreditCard,
} from "lucide-react";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount, currency = "MXN") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

function getDisplayName(profile) {
  if (profile?.displayName) return profile.displayName;
  const parts = [profile?.firstName, profile?.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "—";
}

function DetailRow({ label, children }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-sand-dark/30 last:border-0">
      <span className="text-sm text-charcoal-muted shrink-0">{label}</span>
      <span className="text-sm font-medium text-charcoal text-right break-all min-w-0">
        {children}
      </span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-warm-gray" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4 lg:col-span-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-20 rounded bg-warm-gray" />
              <div className="h-4 w-28 rounded bg-warm-gray" />
            </div>
          ))}
        </Card>
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-3">
            <div className="h-5 w-24 rounded bg-warm-gray" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 w-full rounded bg-warm-gray" />
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-sections ────────────────────────────────────────────────────────────

function ClientOrdersSection({ orders, t }) {
  if (orders.length === 0) {
    return (
      <Card className="p-6 text-center">
        <ShoppingCart className="h-8 w-8 text-charcoal-muted mx-auto mb-2" />
        <p className="text-sm text-charcoal-muted">
          {t("admin.clientDetail.noOrders")}
        </p>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-sand-dark/30">
      {orders.map((order) => (
        <Link
          key={order.$id}
          to={ROUTES.ADMIN_ORDER_DETAIL.replace(":orderId", order.$id)}
          className="flex items-center justify-between px-4 py-3 hover:bg-warm-gray/30 transition-colors"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-charcoal truncate">
              {order.orderNumber || order.$id.slice(0, 8)}
            </p>
            <p className="text-xs text-charcoal-muted">
              {formatDate(order.$createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-medium capitalize px-2 py-0.5 rounded-full bg-warm-gray text-charcoal">
              {order.status}
            </span>
            <span className="text-sm font-medium text-charcoal">
              {formatCurrency(order.totalAmount, order.currency)}
            </span>
          </div>
        </Link>
      ))}
    </Card>
  );
}

function ClientTicketsSection({ tickets, t }) {
  if (tickets.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Ticket className="h-8 w-8 text-charcoal-muted mx-auto mb-2" />
        <p className="text-sm text-charcoal-muted">
          {t("admin.clientDetail.noTickets")}
        </p>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-sand-dark/30">
      {tickets.map((ticket) => (
        <Link
          key={ticket.$id}
          to={ROUTES.ADMIN_TICKET_DETAIL.replace(":ticketId", ticket.$id)}
          className="flex items-center justify-between px-4 py-3 hover:bg-warm-gray/30 transition-colors"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-charcoal truncate">
              {ticket.ticketCode || ticket.$id.slice(0, 8)}
            </p>
            <p className="text-xs text-charcoal-muted truncate">
              {ticket.experienceName || "—"}
            </p>
          </div>
          <span className="text-xs font-medium capitalize px-2 py-0.5 rounded-full bg-warm-gray text-charcoal shrink-0">
            {ticket.status}
          </span>
        </Link>
      ))}
    </Card>
  );
}

function ClientPassesSection({ passes, t }) {
  if (passes.length === 0) {
    return (
      <Card className="p-6 text-center">
        <CreditCard className="h-8 w-8 text-charcoal-muted mx-auto mb-2" />
        <p className="text-sm text-charcoal-muted">
          {t("admin.clientDetail.noPasses")}
        </p>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-sand-dark/30">
      {passes.map((pass) => {
        let passName = "—";
        try {
          const snap = pass.passSnapshot ? JSON.parse(pass.passSnapshot) : null;
          passName = snap?.name || snap?.title || passName;
        } catch {
          /* ignore parse errors */
        }
        const remaining = (pass.totalCredits ?? 0) - (pass.usedCredits ?? 0);

        return (
          <div
            key={pass.$id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-charcoal truncate">
                {passName}
              </p>
              <p className="text-xs text-charcoal-muted">
                {remaining}/{pass.totalCredits ?? 0}{" "}
                {t("admin.clientDetail.creditsRemaining")}
              </p>
            </div>
            <span className="text-xs font-medium capitalize px-2 py-0.5 rounded-full bg-warm-gray text-charcoal shrink-0">
              {pass.status}
            </span>
          </div>
        );
      })}
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ClientDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profile, orders, tickets, passes, loading, error } =
    useClientDetail(userId);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(ROUTES.ADMIN_CLIENTS)}
          className="flex items-center gap-1 text-sm text-charcoal-muted hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("admin.clientDetail.back")}
        </button>
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <button
          onClick={() => navigate(ROUTES.ADMIN_CLIENTS)}
          className="flex items-center gap-1 text-sm text-charcoal-muted hover:text-charcoal transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("admin.clientDetail.back")}
        </button>
        <h1 className="text-2xl font-semibold text-charcoal">
          {getDisplayName(profile)}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card — sidebar */}
        <Card className="p-6 lg:col-span-1 self-start">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-sage/20 flex items-center justify-center">
              <User className="h-6 w-6 text-sage" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-charcoal truncate">
                {getDisplayName(profile)}
              </p>
              <p className="text-xs text-charcoal-muted">
                ID: {profile?.$id?.slice(0, 12)}…
              </p>
            </div>
          </div>

          <div className="space-y-0">
            {profile?.firstName && (
              <DetailRow label={t("admin.clientDetail.firstName")}>
                {profile.firstName}
              </DetailRow>
            )}
            {profile?.lastName && (
              <DetailRow label={t("admin.clientDetail.lastName")}>
                {profile.lastName}
              </DetailRow>
            )}
            <DetailRow label={t("admin.clientDetail.phone")}>
              {profile?.phone || "—"}
            </DetailRow>
            <DetailRow label={t("admin.clientDetail.language")}>
              {profile?.language?.toUpperCase() || "—"}
            </DetailRow>
            <DetailRow label={t("admin.clientDetail.registered")}>
              {formatDateTime(profile?.$createdAt)}
            </DetailRow>
          </div>
        </Card>

        {/* Main content — orders, tickets, passes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Orders */}
          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-charcoal-muted" />
              {t("admin.clientDetail.orders")}
              <span className="text-sm font-normal text-charcoal-muted">
                ({orders.length})
              </span>
            </h2>
            <ClientOrdersSection orders={orders} t={t} />
          </section>

          {/* Tickets */}
          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-charcoal-muted" />
              {t("admin.clientDetail.tickets")}
              <span className="text-sm font-normal text-charcoal-muted">
                ({tickets.length})
              </span>
            </h2>
            <ClientTicketsSection tickets={tickets} t={t} />
          </section>

          {/* Passes */}
          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-charcoal-muted" />
              {t("admin.clientDetail.passes")}
              <span className="text-sm font-normal text-charcoal-muted">
                ({passes.length})
              </span>
            </h2>
            <ClientPassesSection passes={passes} t={t} />
          </section>
        </div>
      </div>
    </div>
  );
}
