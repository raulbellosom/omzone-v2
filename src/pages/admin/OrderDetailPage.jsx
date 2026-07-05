import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useOrderDetail, updateOrderStatus, resendPaymentLink } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { getErrorMessage } from "@/lib/errors";
import { ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { Card } from "@/components/common/Card";
import Button from "@/components/common/Button";
import OrderStatusBadge from "@/components/admin/orders/OrderStatusBadge";
import PaymentStatusBadge from "@/components/admin/orders/PaymentStatusBadge";
import SnapshotViewer from "@/components/admin/orders/SnapshotViewer";
import OrderTimeline from "@/components/admin/orders/OrderTimeline";
import StatusTransitionDropdown from "@/components/admin/orders/StatusTransitionDropdown";
import { ArrowLeft, ShoppingCart, Copy, MessageCircle, MailIcon, Clock } from "lucide-react";

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
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
      <Card className="p-6 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-24 rounded bg-warm-gray" />
            <div className="h-4 w-32 rounded bg-warm-gray" />
          </div>
        ))}
      </Card>
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const { order, items, payments, loading, error } = useOrderDetail(orderId);
  const { t } = useLanguage();
  const [actionError, setActionError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const isAdmin =
    user?.labels?.includes(ROLES.ADMIN) || user?.labels?.includes(ROLES.ROOT);

  const handleStatusChange = async (newStatus) => {
    setActionError(null);
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      window.location.reload();
    } catch (err) {
      setActionError(getErrorMessage(err, t, "common.errorSaveFailed"));
    } finally {
      setUpdating(false);
    }
  };

  const handleResendPaymentLink = async () => {
    setResending(true);
    setActionError(null);
    setResendSuccess(false);
    try {
      await resendPaymentLink(orderId);
      setResendSuccess(true);
    } catch (err) {
      setActionError(getErrorMessage(err, t, "common.errorSaveFailed"));
    } finally {
      setResending(false);
    }
  };

  const handleCopyLink = () => {
    if (!order?.stripePaymentLinkUrl) return;
    navigator.clipboard.writeText(order.stripePaymentLinkUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  /** Days remaining until paymentLinkExpiresAt. Negative = expired. */
  const paymentLinkDaysLeft = order?.paymentLinkExpiresAt
    ? Math.ceil(
        (new Date(order.paymentLinkExpiresAt) - new Date()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  /** Phone from snapshot for WhatsApp deep-link */
  const whatsappPhone = (() => {
    try {
      const snap = JSON.parse(order?.snapshot || "{}");
      return (snap.customerPhone || "").replace(/[^\d]/g, "") || null;
    } catch {
      return null;
    }
  })();

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <p className="text-sm font-medium text-red-700 mb-1">
          {t("admin.orders.notFound")}
        </p>
        <p className="text-xs text-red-500">{t("admin.orders.loadError")}</p>
        <Button variant="ghost" size="sm" className="mt-3" asChild>
          <Link to={ROUTES.ADMIN_ORDERS}>{t("admin.orders.backToOrders")}</Link>
        </Button>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card className="p-10 text-center">
        <ShoppingCart className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-charcoal">
          {t("admin.orders.notFound")}
        </h2>
        <Button variant="ghost" size="sm" className="mt-3" asChild>
          <Link to={ROUTES.ADMIN_ORDERS}>{t("admin.orders.backToOrders")}</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to={ROUTES.ADMIN_ORDERS}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-display font-semibold text-charcoal truncate">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-charcoal-muted">
            {formatDate(order.$createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {actionError && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{actionError}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* General info */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-charcoal mb-4">
              {t("admin.orderDetail.orderDetails")}
            </h2>
            <DetailRow label={t("admin.orderDetail.orderNumber")}>
              {order.orderNumber}
            </DetailRow>
            <DetailRow label={t("admin.orderDetail.type")}>
              {order.orderType || "direct"}
            </DetailRow>
            <DetailRow label={t("admin.orderDetail.subtotal")}>
              {formatCurrency(order.subtotal, order.currency)}
            </DetailRow>
            {order.taxAmount > 0 && (
              <DetailRow label={t("admin.orderDetail.tax")}>
                {formatCurrency(order.taxAmount, order.currency)}
              </DetailRow>
            )}
            <DetailRow label={t("admin.orderDetail.total")}>
              {formatCurrency(order.totalAmount, order.currency)}
            </DetailRow>
            <DetailRow label={t("admin.orderDetail.currency")}>
              {(order.currency || "MXN").toUpperCase()}
            </DetailRow>
          </Card>

          {/* Customer */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-charcoal mb-4">
              {t("admin.orderDetail.customer")}
            </h2>
            <DetailRow label={t("admin.orderDetail.name")}>
              {order.customerName || "—"}
            </DetailRow>
            <DetailRow label={t("admin.orderDetail.email")}>
              {order.customerEmail || "—"}
            </DetailRow>
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-charcoal mb-4">
              {t("admin.orderDetail.items").replace("{count}", items.length)}
            </h2>
            {items.length === 0 ? (
              <p className="text-sm text-charcoal-muted">
                {t("admin.orderDetail.noItems")}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-sand-dark/40">
                      <th className="pb-2 text-left font-medium text-charcoal-muted">
                        {t("admin.orderDetail.item")}
                      </th>
                      <th className="pb-2 text-right font-medium text-charcoal-muted">
                        {t("admin.orderDetail.qty")}
                      </th>
                      <th className="pb-2 text-right font-medium text-charcoal-muted">
                        {t("admin.orderDetail.unitPrice")}
                      </th>
                      <th className="pb-2 text-right font-medium text-charcoal-muted">
                        {t("admin.orderDetail.itemTotal")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.$id}
                        className="border-b border-sand-dark/20 last:border-0"
                      >
                        <td className="py-2">
                          <p className="text-charcoal">
                            {item.name || item.itemType || "Item"}
                          </p>
                          {item.slotId && (
                            <p className="text-xs text-charcoal-muted">
                              Slot: {item.slotId}
                            </p>
                          )}
                        </td>
                        <td className="py-2 text-right text-charcoal">
                          {item.quantity || 1}
                        </td>
                        <td className="py-2 text-right text-charcoal">
                          {formatCurrency(item.unitPrice || 0, order.currency)}
                        </td>
                        <td className="py-2 text-right font-medium text-charcoal">
                          {formatCurrency(
                            item.totalPrice ||
                              (item.unitPrice || 0) * (item.quantity || 1),
                            order.currency,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Payments */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-charcoal mb-4">
              {t("admin.orderDetail.payments").replace(
                "{count}",
                payments.length,
              )}
            </h2>
            {payments.length === 0 ? (
              <p className="text-sm text-charcoal-muted">
                {t("admin.orderDetail.noPayments")}
              </p>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div
                    key={p.$id}
                    className="flex items-center justify-between py-2 border-b border-sand-dark/20 last:border-0"
                  >
                    <div>
                      <p className="text-sm text-charcoal font-medium">
                        {formatCurrency(p.amount, p.currency)}
                      </p>
                      <p className="text-xs text-charcoal-muted truncate max-w-50">
                        {p.stripePaymentIntentId || "—"}
                      </p>
                    </div>
                    <PaymentStatusBadge status={p.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Snapshot */}
          {order.snapshot && (
            <Card className="p-6">
              <SnapshotViewer snapshot={order.snapshot} />
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card className="p-6">
            <OrderTimeline order={order} />
          </Card>

          {/* Status transition (admin only) */}
          {isAdmin && (
            <Card className="p-6">
              <StatusTransitionDropdown
                currentStatus={order.status}
                onTransition={handleStatusChange}
                disabled={updating}
              />
            </Card>
          )}

          {/* Stripe reference */}
          {(order.stripeSessionId || order.stripePaymentIntentId) && (
            <Card className="p-6">
              <h3 className="text-sm font-medium text-charcoal mb-3">Stripe</h3>
              {order.stripeSessionId && (
                <DetailRow label="Session">{order.stripeSessionId}</DetailRow>
              )}
              {order.stripePaymentIntentId && (
                <DetailRow label="Payment Intent">
                  {order.stripePaymentIntentId}
                </DetailRow>
              )}
            </Card>
          )}

          {/* Payment Link panel (request-conversion + pending) */}
          {order.orderType === "request-conversion" &&
            order.paymentStatus !== "succeeded" &&
            order.stripePaymentLinkUrl && (
              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-semibold text-charcoal">
                  {t("admin.orders.paymentLink")}
                </h3>

                {/* Expiry indicator */}
                {paymentLinkDaysLeft !== null && (
                  <div
                    className={`flex items-center gap-1.5 text-xs font-medium ${
                      paymentLinkDaysLeft <= 0
                        ? "text-red-600"
                        : paymentLinkDaysLeft <= 2
                          ? "text-amber-600"
                          : "text-charcoal-muted"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {paymentLinkDaysLeft <= 0
                      ? t("admin.orders.paymentLinkExpired")
                      : t("admin.orders.paymentLinkExpires").replace(
                          "{days}",
                          paymentLinkDaysLeft,
                        )}
                  </div>
                )}

                {/* URL preview */}
                <p className="text-xs text-charcoal-muted font-mono break-all bg-sand rounded-md px-2 py-1.5">
                  {order.stripePaymentLinkUrl}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 rounded-md border border-sand-dark px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-sand transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {linkCopied ? t("admin.orders.copied") : t("admin.orders.copyLink")}
                  </button>

                  {whatsappPhone && (
                    <a
                      href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                        `Hola ${order.customerName || ""}, aquí tu link de pago para la orden ${order.orderNumber}: ${order.stripePaymentLinkUrl}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1ebe5d] transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {t("admin.orders.openWhatsApp")}
                    </a>
                  )}

                  {isAdmin && paymentLinkDaysLeft > 0 && (
                    <button
                      type="button"
                      onClick={handleResendPaymentLink}
                      disabled={resending}
                      className="inline-flex items-center gap-1.5 rounded-md border border-forest/30 bg-forest/5 px-3 py-1.5 text-xs font-medium text-forest hover:bg-forest/10 transition-colors disabled:opacity-50"
                    >
                      <MailIcon className="h-3.5 w-3.5" />
                      {resending
                        ? t("admin.orders.resendingLink")
                        : t("admin.orders.resendLink")}
                    </button>
                  )}
                </div>

                {resendSuccess && (
                  <p className="text-xs text-emerald-700 font-medium">
                    {t("admin.orders.linkResent")}
                  </p>
                )}
              </Card>
            )}

          {order.notes && (
            <Card className="p-6">
              <h3 className="text-sm font-medium text-charcoal mb-2">Notes</h3>
              <p className="text-sm text-charcoal-muted whitespace-pre-wrap">
                {order.notes}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
