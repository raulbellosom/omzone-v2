import { useParams, useNavigate, Link } from "react-router-dom";
import { useUserOrderDetail } from "@/hooks/useUserOrderDetail";
import { Badge } from "@/components/common/Badge";
import { ROUTES } from "@/constants/routes";
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  Ticket,
  Sparkles,
  Calendar,
  ChevronRight,
} from "lucide-react";

const ORDER_STATUS = {
  pending: { label: "Pendiente", variant: "warning" },
  paid: { label: "Pagada", variant: "success" },
  confirmed: { label: "Confirmada", variant: "success" },
  cancelled: { label: "Cancelada", variant: "danger" },
  refunded: { label: "Reembolsada", variant: "warm" },
};

const PAYMENT_STATUS = {
  pending: { label: "Pendiente", variant: "warning" },
  processing: { label: "Procesando", variant: "warm" },
  succeeded: { label: "Pagado", variant: "success" },
  failed: { label: "Fallido", variant: "danger" },
  refunded: { label: "Reembolsado", variant: "warm" },
};

const TICKET_STATUS = {
  valid: { label: "Activo", variant: "success" },
  used: { label: "Usado", variant: "warm" },
  cancelled: { label: "Cancelado", variant: "danger" },
  expired: { label: "Expirado", variant: "warning" },
};

const ITEM_ICONS = {
  edition: Package,
  addon: Sparkles,
  package: ShoppingBag,
  pass: Ticket,
};

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function parseSnapshot(json) {
  if (!json) return {};
  try {
    return typeof json === "string" ? JSON.parse(json) : json;
  } catch {
    return {};
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-5 w-32 rounded bg-warm-gray/40" />
      <div className="bg-white rounded-2xl p-5 space-y-4">
        <div className="h-6 w-48 rounded bg-warm-gray/40" />
        <div className="h-4 w-24 rounded bg-warm-gray/30" />
        <div className="space-y-3 pt-3 border-t border-warm-gray-dark/10">
          {[1, 2].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-36 rounded bg-warm-gray/30" />
              <div className="h-4 w-20 rounded bg-warm-gray/30" />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-3 border-t border-warm-gray-dark/10">
          <div className="h-6 w-28 rounded bg-warm-gray/40" />
        </div>
      </div>
    </div>
  );
}

function ItemRow({ item }) {
  const Icon = ITEM_ICONS[item.itemType] || Package;
  const snapshot = parseSnapshot(item.itemSnapshot);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-warm-gray-dark/10 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-sage/10 text-sage flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal">{item.name}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-charcoal-muted mt-0.5">
          <span className="capitalize">{item.itemType}</span>
          {item.quantity > 1 && <span>× {item.quantity}</span>}
          {snapshot.tierName && <span>{snapshot.tierName}</span>}
          {snapshot.slotStart && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDateTime(snapshot.slotStart)}
            </span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-charcoal">
          {formatCurrency(item.totalPrice, item.currency)}
        </p>
        {item.quantity > 1 && (
          <p className="text-xs text-charcoal-muted">
            {formatCurrency(item.unitPrice, item.currency)} c/u
          </p>
        )}
      </div>
    </div>
  );
}

function TicketRow({ ticket }) {
  const ts = TICKET_STATUS[ticket.status] || TICKET_STATUS.valid;
  const snapshot = parseSnapshot(ticket.ticketSnapshot);

  return (
    <Link
      to={`/portal/tickets/${ticket.$id}`}
      className="flex items-center gap-3 py-3 border-b border-warm-gray-dark/10 last:border-0 group hover:bg-sage/5 -mx-2 px-2 rounded-lg transition-colors"
    >
      <div className="w-8 h-8 rounded-lg bg-sage/10 text-sage flex items-center justify-center flex-shrink-0">
        <Ticket className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal truncate">
          {snapshot.experienceName || "Ticket"}
        </p>
        <p className="text-xs text-charcoal-muted">{ticket.ticketCode}</p>
      </div>
      <Badge variant={ts.variant} className="flex-shrink-0">
        {ts.label}
      </Badge>
      <ChevronRight className="w-4 h-4 text-charcoal-muted/50 flex-shrink-0" />
    </Link>
  );
}

export default function PortalOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { order, items, tickets, loading, error } = useUserOrderDetail(orderId);

  if (loading) return <LoadingSkeleton />;

  if (error || !order) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(ROUTES.PORTAL_ORDERS)}
          className="flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Mis Órdenes
        </button>
        <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error || "Orden no encontrada"}
        </div>
      </div>
    );
  }

  const os = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
  const ps = PAYMENT_STATUS[order.paymentStatus] || PAYMENT_STATUS.pending;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate(ROUTES.PORTAL_ORDERS)}
        className="flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Mis Órdenes
      </button>

      {/* Order header */}
      <div className="bg-white rounded-2xl border border-warm-gray-dark/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="font-display text-xl font-bold text-charcoal">
              Orden #{order.orderNumber}
            </h1>
            <p className="text-sm text-charcoal-muted mt-0.5">
              {formatDate(order.$createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-charcoal-muted">Orden:</span>
              <Badge variant={os.variant}>{os.label}</Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-charcoal-muted">Pago:</span>
              <Badge variant={ps.variant}>{ps.label}</Badge>
            </div>
          </div>
        </div>

        {/* Customer info */}
        {(order.customerName || order.customerEmail) && (
          <div className="text-sm text-charcoal-muted border-t border-warm-gray-dark/10 pt-3 mb-4">
            {order.customerName && (
              <p className="font-medium text-charcoal">{order.customerName}</p>
            )}
            {order.customerEmail && <p>{order.customerEmail}</p>}
          </div>
        )}

        {/* Items */}
        <div className="border-t border-warm-gray-dark/10 pt-3">
          <h2 className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-2">
            Items
          </h2>
          {items.length > 0 ? (
            <div>
              {items.map((item) => (
                <ItemRow key={item.$id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-charcoal-muted py-2">
              Sin detalles de items disponibles
            </p>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-warm-gray-dark/10 pt-3 mt-3 space-y-1.5">
          {order.subtotal != null && order.subtotal !== order.totalAmount && (
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-muted">Subtotal</span>
              <span className="text-charcoal">
                {formatCurrency(order.subtotal, order.currency)}
              </span>
            </div>
          )}
          {order.taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-muted">Impuestos</span>
              <span className="text-charcoal">
                {formatCurrency(order.taxAmount, order.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-sm font-medium text-charcoal">Total</span>
            <span className="text-xl font-bold text-charcoal">
              {formatCurrency(order.totalAmount, order.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Associated tickets */}
      {tickets.length > 0 && (
        <div className="bg-white rounded-2xl border border-warm-gray-dark/10 p-5">
          <h2 className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-2">
            Tickets ({tickets.length})
          </h2>
          <div>
            {tickets.map((ticket) => (
              <TicketRow key={ticket.$id} ticket={ticket} />
            ))}
          </div>
        </div>
      )}

      {/* Payment info from order fields */}
      {order.paidAt && (
        <div className="bg-white rounded-2xl border border-warm-gray-dark/10 p-5">
          <h2 className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-2">
            Pago
          </h2>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Fecha de pago</span>
              <span className="text-charcoal">
                {formatDateTime(order.paidAt)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
