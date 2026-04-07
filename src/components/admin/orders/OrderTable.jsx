import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import OrderStatusBadge from "./OrderStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount, currency = "MXN") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function SkeletonRow() {
  return (
    <tr className="border-b border-sand-dark/40 animate-pulse">
      <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-warm-gray" /></td>
      <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-32 rounded bg-warm-gray" /></td>
      <td className="px-4 py-3"><div className="h-5 w-16 rounded-full bg-warm-gray" /></td>
      <td className="px-4 py-3 hidden md:table-cell"><div className="h-5 w-20 rounded-full bg-warm-gray" /></td>
      <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-16 rounded bg-warm-gray" /></td>
      <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-20 rounded bg-warm-gray" /></td>
    </tr>
  );
}

export default function OrderTable({ orders, loading }) {
  const navigate = useNavigate();

  const handleRowClick = (orderId) => {
    navigate(ROUTES.ADMIN_ORDER_DETAIL.replace(":orderId", orderId));
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-sand-dark">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-warm-gray/50">
            <th className="px-4 py-3 text-left font-medium text-charcoal">Order #</th>
            <th className="px-4 py-3 text-left font-medium text-charcoal hidden sm:table-cell">Customer</th>
            <th className="px-4 py-3 text-left font-medium text-charcoal">Status</th>
            <th className="px-4 py-3 text-left font-medium text-charcoal hidden md:table-cell">Payment</th>
            <th className="px-4 py-3 text-right font-medium text-charcoal hidden md:table-cell">Total</th>
            <th className="px-4 py-3 text-left font-medium text-charcoal hidden lg:table-cell">Date</th>
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

          {!loading && orders.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-charcoal-subtle">
                No orders found
              </td>
            </tr>
          )}

          {!loading &&
            orders.map((order) => (
              <tr
                key={order.$id}
                className="border-b border-sand-dark/40 hover:bg-warm-gray/30 transition-colors cursor-pointer"
                onClick={() => handleRowClick(order.$id)}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-charcoal">{order.orderNumber}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="min-w-0">
                    <p className="text-charcoal truncate">{order.customerName || "—"}</p>
                    <p className="text-xs text-charcoal-subtle truncate">{order.customerEmail || ""}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <PaymentStatusBadge status={order.paymentStatus} />
                </td>
                <td className="px-4 py-3 text-right font-medium text-charcoal hidden md:table-cell">
                  {formatCurrency(order.totalAmount, order.currency)}
                </td>
                <td className="px-4 py-3 text-charcoal-subtle hidden lg:table-cell">
                  {formatDate(order.$createdAt)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
