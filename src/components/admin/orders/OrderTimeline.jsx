import { Clock, CreditCard, CheckCircle, XCircle, RefreshCw } from "lucide-react";

function formatTimestamp(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const EVENTS = [
  {
    key: "created",
    icon: Clock,
    label: "Order created",
    getDate: (order) => order.$createdAt,
    color: "text-charcoal-muted",
  },
  {
    key: "paid",
    icon: CreditCard,
    label: "Payment confirmed",
    getDate: (order) => order.paidAt,
    color: "text-emerald-600",
  },
  {
    key: "confirmed",
    icon: CheckCircle,
    label: "Order confirmed",
    getDate: (order) => (order.status === "confirmed" ? order.$updatedAt : null),
    color: "text-sage",
  },
  {
    key: "cancelled",
    icon: XCircle,
    label: "Order cancelled",
    getDate: (order) => order.cancelledAt,
    color: "text-red-500",
  },
  {
    key: "refunded",
    icon: RefreshCw,
    label: "Order refunded",
    getDate: (order) => (order.status === "refunded" ? order.$updatedAt : null),
    color: "text-charcoal-muted",
  },
];

export default function OrderTimeline({ order }) {
  const timeline = EVENTS.map((ev) => ({
    ...ev,
    date: ev.getDate(order),
  })).filter((ev) => ev.date);

  if (!timeline.length) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-charcoal">Timeline</h3>
      <div className="space-y-3">
        {timeline.map((ev) => {
          const Icon = ev.icon;
          return (
            <div key={ev.key} className="flex items-start gap-3">
              <div className={`mt-0.5 ${ev.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-charcoal">{ev.label}</p>
                <p className="text-xs text-charcoal-muted">{formatTimestamp(ev.date)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
