import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle, Clock, Ticket } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import TicketQR from "@/components/common/TicketQR";
import { useOrderBySession } from "@/hooks/useOrderBySession";
import { useLanguage } from "@/hooks/useLanguage";

function formatCurrency(amount, currency = "MXN") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso, lang = "en") {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function LoadingSkeleton() {
  return (
    <div className="min-h-[60vh] bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6 animate-pulse">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-warm-gray" />
        </div>
        <div className="h-8 w-48 mx-auto rounded bg-warm-gray" />
        <div className="h-4 w-64 mx-auto rounded bg-warm-gray" />
        <div className="bg-white rounded-2xl p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-24 rounded bg-warm-gray" />
              <div className="h-4 w-32 rounded bg-warm-gray" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Shown when webhook hasn't processed yet — gentle, not an error */
function ProcessingState() {
  const { t } = useLanguage();
  return (
    <div className="min-h-[60vh] bg-cream flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center">
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal font-display">
            {t("checkoutSuccess.processingTitle")}
          </h1>
          <p className="text-charcoal-subtle text-sm md:text-base">
            {t("checkoutSuccess.processingDesc")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to={ROUTES.PORTAL_ORDERS}>
            <Button size="md">{t("checkoutSuccess.viewOrders")}</Button>
          </Link>
          <Link to={ROUTES.EXPERIENCES}>
            <Button variant="outline" size="md">
              {t("checkoutSuccess.exploreMore")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const orderId = params.get("order_id");
  const { language, t } = useLanguage();

  const { order, items, tickets, loading } = useOrderBySession(sessionId, orderId);

  // Loading
  if (loading) return <LoadingSkeleton />;

  // No order found or not yet paid — show processing state
  if (!order || order.status === "pending") return <ProcessingState />;

  const snapshot = order.orderSnapshot ? JSON.parse(order.orderSnapshot) : null;

  return (
    <div className="min-h-[60vh] bg-cream py-10 px-4">
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal font-display">
            {t("checkoutSuccess.thankYou")}
          </h1>
          <p className="text-charcoal-subtle text-sm md:text-base">
            {t("checkoutSuccess.confirmed")}
          </p>
        </div>

        {/* Order summary card */}
        <div className="bg-white rounded-2xl shadow-sm border border-sand-dark/30 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-charcoal">
              {t("checkoutSuccess.orderSummary")}
            </h2>
            <Badge variant="success">{order.status}</Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b border-sand-dark/20">
              <span className="text-charcoal-muted">
                {t("checkoutSuccess.orderLabel")}
              </span>
              <span className="font-mono font-medium text-charcoal">
                {order.orderNumber}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sand-dark/20">
              <span className="text-charcoal-muted">
                {t("checkoutSuccess.dateLabel")}
              </span>
              <span className="text-charcoal">
                {formatDate(order.$createdAt, language)}
              </span>
            </div>

            {/* Items */}
            {items.length > 0 && (
              <div className="pt-2 space-y-2">
                {items.map((item) => {
                  const snap = item.itemSnapshot
                    ? JSON.parse(item.itemSnapshot)
                    : {};
                  return (
                    <div
                      key={item.$id}
                      className="flex justify-between py-1.5 border-b border-sand-dark/20"
                    >
                      <span className="text-charcoal">
                        {snap.experienceName || snap.addonName || item.itemType}
                        {item.quantity > 1 && (
                          <span className="text-charcoal-muted">
                            {" "}
                            × {item.quantity}
                          </span>
                        )}
                      </span>
                      <span className="font-medium text-charcoal">
                        {formatCurrency(item.subtotal, order.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between py-2 font-semibold text-base">
              <span className="text-charcoal">
                {t("checkoutSuccess.total")}
              </span>
              <span className="text-charcoal">
                {formatCurrency(order.totalAmount, order.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Tickets */}
        {tickets.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-sand-dark/30 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-sage" />
              <h2 className="font-display font-semibold text-charcoal">
                {t("checkoutSuccess.tickets")}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {tickets.map((ticket) => {
                const snap = ticket.ticketSnapshot
                  ? JSON.parse(ticket.ticketSnapshot)
                  : {};
                return (
                  <div
                    key={ticket.$id}
                    className="border border-sand-dark/30 rounded-xl p-4 space-y-3 text-center"
                  >
                    <p className="font-medium text-charcoal text-sm">
                      {snap.experienceName || "Experience"}
                    </p>
                    {snap.editionDate && (
                      <p className="text-xs text-charcoal-muted">
                        {formatDate(snap.editionDate)}
                        {snap.slotTime && ` · ${snap.slotTime}`}
                      </p>
                    )}
                    <TicketQR value={ticket.ticketCode} size={140} />
                    <p className="font-mono text-xs text-charcoal-muted tracking-wider">
                      {ticket.ticketCode}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={ROUTES.PORTAL_TICKETS}>
            <Button size="md">View My Tickets</Button>
          </Link>
          <Link to={ROUTES.EXPERIENCES}>
            <Button variant="outline" size="md">
              Explore More
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
