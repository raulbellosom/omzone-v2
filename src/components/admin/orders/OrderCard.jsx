import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { Card } from "@/components/common/Card";
import OrderStatusBadge from "./OrderStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

function formatCurrency(amount, currency = "MXN") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function OrderCard({ order }) {
  return (
    <Link
      to={ROUTES.ADMIN_ORDER_DETAIL.replace(":orderId", order.$id)}
      className="block"
    >
      <Card className="p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-charcoal truncate">{order.orderNumber}</p>
          <p className="text-xs text-charcoal-muted truncate">
            {order.customerName || "—"} · {order.customerEmail || ""}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex items-center justify-between text-xs text-charcoal-muted">
        <div className="flex items-center gap-3">
          <PaymentStatusBadge status={order.paymentStatus} />
          <span>{formatDate(order.$createdAt)}</span>
        </div>
        <span className="font-medium text-charcoal text-sm">
          {formatCurrency(order.totalAmount, order.currency)}
        </span>
      </div>
      </Card>
    </Link>
  );
}
