import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  useBookingRequestDetail,
  updateBookingRequestStatus,
  updateBookingRequestFields,
  VALID_TRANSITIONS,
  getStatusLabel,
  getStatusBadgeClass,
  getStatusI18nKey,
} from "@/hooks/useBookingRequests";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { getErrorMessage } from "@/lib/errors";
import { ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { auditAction } from "@/lib/audit";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import Input from "@/components/common/Input";
import NotFoundPage from "@/pages/NotFoundPage";
import {
  ArrowLeft,
  User,
  Mail,
  MailIcon,
  Phone,
  Calendar,
  Users,
  MessageSquare,
  FileText,
  DollarSign,
  ExternalLink,
  Copy,
  Check,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { functions } from "@/lib/appwrite";
import { resendPaymentLink } from "@/hooks/useOrders";
import env from "@/config/env";

function formatDate(iso, locale = "en-US") {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-MX" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-40 rounded bg-warm-gray" />
      <div className="h-8 w-64 rounded bg-warm-gray" />
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-3/4 rounded bg-warm-gray" />
          ))}
        </Card>
        <Card className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-2/3 rounded bg-warm-gray" />
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── Info row ────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-charcoal-subtle mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-charcoal-subtle">{label}</p>
        <p className="text-sm text-charcoal">{value || "—"}</p>
      </div>
    </div>
  );
}

// ─── Status actions ─────────────────────────────────────────────────────────

function StatusActions({ request, isAdmin, onAction, acting, t }) {
  const transitions = VALID_TRANSITIONS[request.status] || [];
  if (transitions.length === 0) return null;

  const btnConfig = {
    reviewing: {
      i18nKey: "admin.bookingRequests.startReview",
      variant: "outline",
    },
    approved: {
      i18nKey: "admin.bookingRequests.approveQuote",
      variant: "default",
    },
    rejected: {
      i18nKey: "admin.bookingRequests.decline",
      variant: "destructive",
    },
    converted: {
      i18nKey: "admin.bookingRequests.sendQuote",
      variant: "default",
    },
  };

  return (
    <div className="flex flex-wrap gap-2">
      {transitions.map((tr) => {
        // Only admin can convert
        if (tr === "converted" && !isAdmin) return null;
        const cfg = btnConfig[tr] || { i18nKey: null, variant: "outline" };
        return (
          <Button
            key={tr}
            variant={cfg.variant}
            size="sm"
            onClick={() => onAction(tr)}
            disabled={acting}
          >
            {cfg.i18nKey ? t(cfg.i18nKey) : tr}
          </Button>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BookingRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin =
    user?.labels?.includes(ROLES.ADMIN) || user?.labels?.includes(ROLES.ROOT);

  const { request, experience, convertedOrder, loading, error, refetch } =
    useBookingRequestDetail(id);
  const { t, lang } = useLanguage();

  const [adminNotes, setAdminNotes] = useState("");
  const [quotedAmount, setQuotedAmount] = useState("");
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState(false);
  const [converting, setConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Sync form once request loads
  if (request && !notesLoaded) {
    setAdminNotes(request.adminNotes || "");
    setQuotedAmount(
      request.quotedAmount != null ? String(request.quotedAmount) : "",
    );
    setNotesLoaded(true);
  }

  if (loading) return <LoadingSkeleton />;
  if (error === "not_found" || !request) return <NotFoundPage />;

  // ── Save notes/quote ───────────────────────────────────────────────────────
  async function handleSaveFields() {
    setSaving(true);
    setActionError(null);
    try {
      await updateBookingRequestFields(id, {
        adminNotes,
        quotedAmount: quotedAmount ? parseFloat(quotedAmount) : null,
      });
      auditAction({
        action: "booking_request.fields_update",
        entityType: "booking_requests",
        entityId: id,
        details: {
          hasNotes: !!adminNotes,
          quotedAmount: quotedAmount ? parseFloat(quotedAmount) : null,
        },
      });
      refetch();
    } catch (err) {
      setActionError(getErrorMessage(err, t, "common.errorSaveFailed"));
    } finally {
      setSaving(false);
    }
  }

  // ── Status transition ──────────────────────────────────────────────────────
  async function handleStatusAction(newStatus) {
    if (newStatus === "converted") {
      handleConvert();
      return;
    }

    setActing(true);
    setActionError(null);
    try {
      await updateBookingRequestStatus(id, newStatus, {
        adminNotes,
        quotedAmount: quotedAmount ? parseFloat(quotedAmount) : undefined,
        adminUserId: user?.$id,
      });
      auditAction({
        action: "booking_request.status_update",
        entityType: "booking_requests",
        entityId: id,
        details: { status: newStatus },
      });
      refetch();
      setNotesLoaded(false); // re-sync
    } catch (err) {
      setActionError(getErrorMessage(err, t, "common.errorSaveFailed"));
    } finally {
      setActing(false);
    }
  }

  // ── Convert to order ───────────────────────────────────────────────────────
  async function handleConvert() {
    if (!quotedAmount || parseFloat(quotedAmount) <= 0) {
      setActionError(t("admin.bookingRequests.quoteRequired"));
      return;
    }

    setConverting(true);
    setActionError(null);
    try {
      // First persist the quotedAmount
      await updateBookingRequestFields(id, {
        quotedAmount: parseFloat(quotedAmount),
        adminNotes,
      });

      // Execute create-checkout with request-conversion type (Stripe Payment Link)
      const payload = JSON.stringify({
        experienceId: request.experienceId,
        bookingRequestId: request.$id,
        quotedAmount: parseFloat(quotedAmount),
        quantity: request.participants || 1,
        customerName: request.contactName,
        customerEmail: request.contactEmail,
        customerPhone: request.contactPhone || "",
        orderType: "request-conversion",
      });

      const execution = await functions.createExecution(
        env.functionCreateCheckout,
        payload,
        false,
        "/",
        "POST",
      );

      const result = JSON.parse(execution.responseBody || "{}");
      if (!result.ok) {
        throw new Error(result.error?.message || "Conversion failed");
      }

      setConversionResult(result.data);
      refetch();
      setNotesLoaded(false);
    } catch (err) {
      setActionError(getErrorMessage(err, t, "common.errorSaveFailed"));
    } finally {
      setConverting(false);
    }
  }

  // ── Resend payment link ────────────────────────────────────────────────────
  async function handleResend(orderId) {
    setResending(true);
    setResendSuccess(false);
    setActionError(null);
    try {
      await resendPaymentLink(orderId);
      setResendSuccess(true);
    } catch (err) {
      setActionError(getErrorMessage(err, t, "common.errorSaveFailed"));
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        to={ROUTES.ADMIN_BOOKING_REQUESTS}
        className="inline-flex items-center gap-1.5 text-sm text-charcoal-subtle hover:text-charcoal transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        {t("admin.bookingRequests.backToAll")}
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-charcoal">
            {t("admin.bookingDetail.title")}
          </h1>
          <p className="text-sm text-charcoal-muted mt-0.5">
            {t("admin.bookingDetail.created")}{" "}
            {formatDate(request.$createdAt, lang)}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center self-start rounded-full px-3 py-1 text-sm font-semibold",
            getStatusBadgeClass(request.status),
          )}
        >
          {getStatusI18nKey(request.status)
            ? t(getStatusI18nKey(request.status))
            : getStatusLabel(request.status)}
        </span>
      </div>

      {/* Error banner */}
      {actionError && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{actionError}</p>
        </Card>
      )}

      {/* Conversion success / persisted payment link */}
      {(() => {
        // Show either the freshly-converted result or the persisted order data
        const paymentLink =
          conversionResult?.paymentLink ||
          convertedOrder?.stripePaymentLinkUrl ||
          null;
        const orderNumber =
          conversionResult?.orderNumber || convertedOrder?.orderNumber || "";
        const orderId =
          conversionResult?.orderId || request.convertedOrderId || null;
        if (!paymentLink && !orderId) return null;
        return (
          <Card className="p-4 border-emerald-200 bg-emerald-50 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <p className="text-sm text-emerald-800 font-medium">
                {t("admin.bookingRequests.quoteSent")} — {orderNumber}
              </p>
            </div>

            {paymentLink && (
              <div className="rounded-md bg-white border border-emerald-200 p-3 space-y-2">
                <p className="text-xs font-medium text-charcoal-muted">
                  {t("admin.orders.paymentLink")}
                </p>
                <p className="text-xs text-charcoal break-all font-mono">
                  {paymentLink}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                      linkCopied
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50",
                    )}
                    onClick={() => {
                      navigator.clipboard.writeText(paymentLink);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    }}
                  >
                    {linkCopied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {linkCopied
                      ? t("admin.orders.copied")
                      : t("admin.orders.copyLink")}
                  </button>
                  {request.contactPhone && (
                    <a
                      href={`https://wa.me/${request.contactPhone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
                        `Hola ${request.contactName}, aquí tu cotización para ${
                          experience?.publicName || "la experiencia"
                        } — ${formatCurrency(parseFloat(quotedAmount))} MXN. Puedes pagar aquí: ${paymentLink}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1ebe5d] transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {t("admin.orders.openWhatsApp")}
                    </a>
                  )}
                  {isAdmin && orderId && (
                    <button
                      type="button"
                      onClick={() => handleResend(orderId)}
                      disabled={resending}
                      className="inline-flex items-center gap-1.5 rounded-md border border-forest/30 bg-forest/5 px-3 py-1.5 text-xs font-medium text-forest hover:bg-forest/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MailIcon className="h-3.5 w-3.5" />
                      {resending
                        ? t("admin.orders.resendingLink")
                        : t("admin.orders.resendLink")}
                    </button>
                  )}
                </div>
                {resendSuccess && (
                  <p className="text-xs text-emerald-700 font-medium mt-1">
                    {t("admin.orders.linkResent")}
                  </p>
                )}
              </div>
            )}

            {orderId && (
              <div className="flex pt-1">
                <Link
                  to={ROUTES.ADMIN_ORDER_DETAIL.replace(":orderId", orderId)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  {t("admin.orders.viewOrder")}{" "}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </Card>
        );
      })()}

      {/* Content grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact info */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-charcoal mb-2">
            {t("admin.bookingDetail.contactInfo")}
          </h2>
          <InfoRow
            icon={User}
            label={t("admin.orderDetail.name")}
            value={request.contactName}
          />
          <InfoRow
            icon={Mail}
            label={t("admin.orderDetail.email")}
            value={request.contactEmail}
          />
          <InfoRow
            icon={Phone}
            label={t("admin.bookingDetail.phone")}
            value={request.contactPhone}
          />
          <InfoRow
            icon={Users}
            label={t("admin.bookingRequests.participant")}
            value={request.participants}
          />
          <InfoRow
            icon={Calendar}
            label={t("admin.bookingRequests.date")}
            value={formatDate(request.requestedDate, lang)}
          />
          {request.message && (
            <div className="flex items-start gap-3">
              <MessageSquare className="h-4 w-4 text-charcoal-subtle mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-charcoal-subtle">
                  {t("admin.bookingDetail.message")}
                </p>
                <p className="text-sm text-charcoal whitespace-pre-wrap">
                  {request.message}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Experience info */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-charcoal mb-2">
            {t("admin.bookingRequests.experience")}
          </h2>
          {experience ? (
            <>
              <p className="text-sm font-medium text-charcoal">
                {(lang === "es" && experience.publicNameEs) ||
                  experience.publicName}
              </p>
              <p className="text-xs text-charcoal-subtle capitalize">
                {t(`admin.experienceTypes.${experience.type}`) ||
                  experience.type}
              </p>
              <p className="text-xs text-charcoal-subtle">
                {t("admin.experienceForm.saleMode")}:{" "}
                <span className="font-medium">
                  {t(`admin.saleModes.${experience.saleMode}`) ||
                    experience.saleMode}
                </span>
              </p>
              <Link
                to={`/experiences/${experience.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs text-sage hover:underline"
              >
                {t("admin.bookingDetail.viewPublicPage")}{" "}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </>
          ) : (
            <p className="text-sm text-charcoal-muted italic">
              Experience not found
            </p>
          )}

          {request.convertedOrderId && (
            <div className="pt-3 border-t border-sand-dark/40">
              <p className="text-xs text-charcoal-subtle">
                {t("admin.bookingDetail.convertedOrder")}
              </p>
              <Link
                to={ROUTES.ADMIN_ORDER_DETAIL.replace(
                  ":orderId",
                  request.convertedOrderId,
                )}
                className="text-sm text-sage font-medium hover:underline inline-flex items-center gap-1"
              >
                {request.convertedOrderId} <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}

          {request.respondedAt && (
            <div>
              <p className="text-xs text-charcoal-subtle">
                {t("admin.bookingDetail.respondedAt")}
              </p>
              <p className="text-sm text-charcoal">
                {formatDate(request.respondedAt, lang)}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Admin notes & quoted amount */}
      <Card className="p-6 space-y-4">
        <h2 className="text-base font-semibold text-charcoal">
          {t("admin.bookingDetail.adminNotes")}
        </h2>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            <FileText className="inline h-3.5 w-3.5 mr-1" />
            {t("admin.bookingDetail.internalNotes")}
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            placeholder={t("admin.bookingDetail.notesPlaceholder")}
            className="w-full rounded-xl border border-sand-dark bg-white px-4 py-2.5 text-sm text-charcoal placeholder-charcoal-subtle focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 resize-none"
            disabled={request.status === "converted"}
          />
        </div>

        <div className="max-w-xs">
          <label className="block text-sm font-medium text-charcoal mb-1">
            <DollarSign className="inline h-3.5 w-3.5 mr-1" />
            {t("admin.bookingDetail.quotedAmount")}
          </label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={quotedAmount}
            onChange={(e) => setQuotedAmount(e.target.value)}
            placeholder="0.00"
            disabled={request.status === "converted"}
          />
        </div>

        {request.status !== "converted" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveFields}
            disabled={saving}
          >
            {saving
              ? t("admin.bookingDetail.saving")
              : t("admin.bookingDetail.saveNotes")}
          </Button>
        )}
      </Card>

      {/* Actions */}
      {request.status !== "converted" && (
        <Card className="p-6 space-y-3">
          <h2 className="text-base font-semibold text-charcoal">
            {t("admin.bookingDetail.actions")}
          </h2>
          <StatusActions
            request={request}
            isAdmin={isAdmin}
            onAction={handleStatusAction}
            acting={acting || converting}
            t={t}
          />
          {converting && (
            <p className="text-sm text-charcoal-muted animate-pulse">
              {t("admin.bookingRequests.converting")}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
