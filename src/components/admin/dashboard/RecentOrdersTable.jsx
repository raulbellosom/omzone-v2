import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { Card } from "@/components/common/Card";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const STATUS_COLOR = {
  paid: "bg-emerald-100 text-emerald-800",
  confirmed: "bg-blue-100 text-blue-800",
  pending: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-600",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount, currency = "MXN") {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      {[1, 2, 3, 4, 5].map((c) => (
        <td key={c} className="px-4 py-3">
          <div className="h-4 rounded bg-warm-gray w-3/4" />
        </td>
      ))}
    </tr>
  ));
}

// ─── Desktop table ───────────────────────────────────────────────────────────

function OrderTable({ orders, loading, t }) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-sand-dark bg-warm-gray/60">
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.recentOrders.order")}
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.recentOrders.customer")}
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.recentOrders.total")}
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.recentOrders.status")}
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.recentOrders.date")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-dark/30">
          {loading ? (
            <SkeletonRows />
          ) : orders.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-charcoal-muted"
              >
                {t("admin.recentOrders.noOrders")}
              </td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr
                key={o.$id}
                className="hover:bg-warm-gray/50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-charcoal">
                  <Link
                    to={ROUTES.ADMIN_ORDER_DETAIL.replace(":orderId", o.$id)}
                    className="hover:text-sage-dark hover:underline underline-offset-2 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-charcoal-muted">
                  {o.customerName}
                </td>
                <td className="px-4 py-3 text-right font-medium text-charcoal">
                  {formatCurrency(o.totalAmount, o.currency)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
                      STATUS_COLOR[o.status] || "bg-gray-100 text-gray-600",
                    )}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-charcoal-muted">
                  {formatDate(o.$createdAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Mobile cards ────────────────────────────────────────────────────────────

function OrderCards({ orders, loading, t }) {
  if (loading) {
    return (
      <div className="md:hidden space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse space-y-2">
            <div className="h-4 w-1/2 rounded bg-warm-gray" />
            <div className="h-3 w-3/4 rounded bg-warm-gray" />
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="md:hidden">
        <Card className="p-6 text-center text-sm text-charcoal-muted">
          {t("admin.recentOrders.noOrders")}
        </Card>
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-3">
      {orders.map((o) => (
        <Link
          key={o.$id}
          to={ROUTES.ADMIN_ORDER_DETAIL.replace(":orderId", o.$id)}
          className="block"
        >
          <Card className="p-4 cursor-pointer hover:shadow-card-hover transition-shadow">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-charcoal">
              {o.orderNumber}
            </span>
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
                STATUS_COLOR[o.status] || "bg-gray-100 text-gray-600",
              )}
            >
              {o.status}
            </span>
          </div>
          <p className="text-xs text-charcoal-muted">{o.customerName}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold text-charcoal">
              {formatCurrency(o.totalAmount, o.currency)}
            </span>
            <span className="text-xs text-charcoal-subtle">
              {formatDate(o.$createdAt)}
            </span>
          </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function RecentOrdersTable({ orders, loading }) {
  const { t } = useLanguage();
  return (
    <>
      <OrderTable orders={orders} loading={loading} t={t} />
      <OrderCards orders={orders} loading={loading} t={t} />
    </>
  );
}
