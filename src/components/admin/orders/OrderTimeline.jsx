import {
  Clock,
  CreditCard,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const EVENTS = [
  {
    key: "created",
    icon: Clock,
    i18nKey: "orderCreated",
    getDate: (order) => order.$createdAt,
    color: "text-charcoal-muted",
  },
  {
    key: "paid",
    icon: CreditCard,
    i18nKey: "paymentConfirmed",
    getDate: (order) => order.paidAt,
    color: "text-emerald-600",
  },
  {
    key: "confirmed",
    icon: CheckCircle,
    i18nKey: "orderConfirmed",
    getDate: (order) =>
      order.status === "confirmed" ? order.$updatedAt : null,
    color: "text-sage",
  },
  {
    key: "cancelled",
    icon: XCircle,
    i18nKey: "orderCancelled",
    getDate: (order) => order.cancelledAt,
    color: "text-red-500",
  },
  {
    key: "refunded",
    icon: RefreshCw,
    i18nKey: "orderRefunded",
    getDate: (order) => (order.status === "refunded" ? order.$updatedAt : null),
    color: "text-charcoal-muted",
  },
];

export default function OrderTimeline({ order }) {
  const { t, lang } = useLanguage();

  function formatTimestamp(iso) {
    if (!iso) return null;
    return new Date(iso).toLocaleString(lang === "es" ? "es-MX" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const timeline = EVENTS.map((ev) => ({
    ...ev,
    date: ev.getDate(order),
  })).filter((ev) => ev.date);

  if (!timeline.length) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-charcoal">
        {t("admin.orderTimeline.title")}
      </h3>
      <div className="space-y-3">
        {timeline.map((ev) => {
          const Icon = ev.icon;
          return (
            <div key={ev.key} className="flex items-start gap-3">
              <div className={`mt-0.5 ${ev.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-charcoal">
                  {t(`admin.orderTimeline.${ev.i18nKey}`)}
                </p>
                <p className="text-xs text-charcoal-muted">
                  {formatTimestamp(ev.date)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
