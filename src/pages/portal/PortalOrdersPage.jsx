import { useState } from "react";
import { Link } from "react-router-dom";
import { useUserOrders } from "@/hooks/useUserOrders";
import { Badge } from "@/components/common/Badge";
import { ShoppingBag, Compass, ChevronRight, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "", label: "Todas" },
  { value: "paid", label: "Pagadas" },
  { value: "pending", label: "Pendientes" },
  { value: "cancelled", label: "Canceladas" },
];

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

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
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

function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-warm-gray-dark/10 p-4 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-28 rounded bg-warm-gray/40" />
        <div className="h-5 w-16 rounded-full bg-warm-gray/40" />
      </div>
      <div className="h-3 w-20 rounded bg-warm-gray/30" />
      <div className="flex justify-between items-end">
        <div className="h-5 w-24 rounded bg-warm-gray/30" />
        <div className="h-4 w-16 rounded bg-warm-gray/30" />
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const os = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
  const ps = PAYMENT_STATUS[order.paymentStatus] || PAYMENT_STATUS.pending;

  return (
    <Link
      to={`/portal/orders/${order.$id}`}
      className="group block bg-white rounded-2xl border border-warm-gray-dark/10 hover:border-sage/30 hover:shadow-sm transition-all p-4"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-charcoal truncate">
            #{order.orderNumber}
          </p>
          <p className="text-xs text-charcoal-muted mt-0.5">
            {formatDate(order.$createdAt)}
          </p>
        </div>
        <Badge variant={os.variant} className="flex-shrink-0">
          {os.label}
        </Badge>
      </div>

      <div className="flex items-end justify-between mt-3">
        <div>
          <p className="text-lg font-bold text-charcoal">
            {formatCurrency(order.totalAmount, order.currency)}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <CreditCard className="w-3 h-3 text-charcoal-muted" />
            <span className="text-[11px] text-charcoal-muted">Pago:</span>
            <Badge variant={ps.variant}>{ps.label}</Badge>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-charcoal-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>
    </Link>
  );
}

export default function PortalOrdersPage() {
  const [status, setStatus] = useState("");
  const { data, loading, loadingMore, error, loadMore, hasMore } =
    useUserOrders({ status });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <ShoppingBag className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-charcoal">
            Mis Órdenes
          </h1>
          <p className="text-sm text-charcoal-muted">
            Historial de tus compras
          </p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap",
              status === f.value
                ? "bg-sage text-white"
                : "bg-white text-charcoal-muted border border-warm-gray-dark/20 hover:border-sage/40",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && data.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-sage/10 text-sage flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <p className="text-charcoal-muted">
            {status
              ? "No hay órdenes con este filtro"
              : "Aún no tienes órdenes"}
          </p>
          {!status && (
            <Link
              to="/experiencias"
              className="inline-flex items-center gap-2 text-sm text-sage font-semibold hover:underline"
            >
              Explorar experiencias
            </Link>
          )}
        </div>
      )}

      {/* Order grid */}
      {!loading && data.length > 0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.map((order) => (
              <OrderCard key={order.$id} order={order} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center pt-2">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2 rounded-full text-sm font-medium text-sage border border-sage/30 hover:bg-sage/5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loadingMore ? "Cargando..." : "Cargar más"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
