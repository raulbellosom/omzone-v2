import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTicketDetail, invalidateTicket } from "@/hooks/useAdminTickets";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { Card } from "@/components/common/Card";
import Button from "@/components/common/Button";
import TicketStatusBadge from "@/components/admin/tickets/TicketStatusBadge";
import SnapshotViewer from "@/components/admin/orders/SnapshotViewer";
import TicketQR from "@/components/common/TicketQR";
import { ArrowLeft, Ticket, Ban } from "lucide-react";

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

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { ticket, experience, slot, order, loading, error } = useTicketDetail(ticketId);
  const [actionError, setActionError] = useState(null);
  const [invalidating, setInvalidating] = useState(false);

  const isAdmin =
    user?.labels?.includes(ROLES.ADMIN) || user?.labels?.includes(ROLES.ROOT);

  const handleInvalidate = async () => {
    if (!window.confirm(t("admin.ticketDetail.invalidateConfirm"))) return;
    setActionError(null);
    setInvalidating(true);
    try {
      await invalidateTicket(ticketId);
      window.location.reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setInvalidating(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  if (error || !ticket) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <p className="text-sm text-red-700">
          {error || t("admin.ticketDetail.notFound")}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3"
          onClick={() => navigate(ROUTES.ADMIN_TICKETS)}
        >
          {t("admin.tickets.backToTickets")}
        </Button>
      </Card>
    );
  }

  const snapshot = ticket.ticketSnapshot
    ? typeof ticket.ticketSnapshot === "string"
      ? JSON.parse(ticket.ticketSnapshot)
      : ticket.ticketSnapshot
    : null;

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => navigate(ROUTES.ADMIN_TICKETS)}
          className="flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("admin.tickets.backToTickets")}
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Ticket className="h-6 w-6 text-charcoal-muted hidden sm:block" />
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-charcoal font-mono">
                {ticket.ticketCode}
              </h1>
              <p className="text-sm text-charcoal-muted mt-0.5">
                {t("admin.ticketDetail.created")} {formatDate(ticket.$createdAt)}
              </p>
            </div>
          </div>
          <TicketStatusBadge status={ticket.status} />
        </div>
      </div>

      {actionError && (
        <Card className="p-3 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{actionError}</p>
        </Card>
      )}

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket info */}
          <Card className="p-5">
            <h2 className="text-base font-semibold text-charcoal mb-3">
              {t("admin.ticketDetail.ticketInfo")}
            </h2>
            <DetailRow label={t("admin.ticketDetail.code")}>{ticket.ticketCode}</DetailRow>
            <DetailRow label={t("admin.ticketDetail.status")}>
              <TicketStatusBadge status={ticket.status} />
            </DetailRow>
            <DetailRow label={t("admin.ticketDetail.participant")}>
              <div className="text-right">
                <p>{ticket.participantName || "—"}</p>
                {ticket.participantEmail && (
                  <p className="text-xs text-charcoal-muted">{ticket.participantEmail}</p>
                )}
              </div>
            </DetailRow>
            {ticket.usedAt && (
              <DetailRow label={t("admin.ticketDetail.usedAt")}>
                {formatDate(ticket.usedAt)}
              </DetailRow>
            )}
          </Card>

          {/* QR Code */}
          <Card className="p-5 flex flex-col items-center">
            <h2 className="text-base font-semibold text-charcoal mb-4">
              {t("admin.ticketDetail.qrCode")}
            </h2>
            <TicketQR value={ticket.ticketCode} size={180} />
            <p className="text-xs text-charcoal-muted mt-3 font-mono">
              {ticket.ticketCode}
            </p>
          </Card>

          {/* Related experience */}
          {experience && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-charcoal mb-3">
                {t("admin.ticketDetail.experience")}
              </h2>
              <DetailRow label={t("admin.ticketDetail.name")}>
                {experience.titleEn || experience.titleEs || "—"}
              </DetailRow>
              <DetailRow label={t("admin.ticketDetail.type")}>
                {experience.type || "—"}
              </DetailRow>
            </Card>
          )}

          {/* Related slot */}
          {slot && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-charcoal mb-3">
                {t("admin.ticketDetail.slot")}
              </h2>
              <DetailRow label={t("admin.ticketDetail.date")}>
                {formatDate(slot.startDate)}
              </DetailRow>
              <DetailRow label={t("admin.ticketDetail.status")}>
                {slot.status || "—"}
              </DetailRow>
              <DetailRow label={t("admin.ticketDetail.capacity")}>
                {slot.capacity ?? "—"}
              </DetailRow>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Related order */}
          {order && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-charcoal mb-3">
                {t("admin.ticketDetail.order")}
              </h2>
              <DetailRow label={t("admin.ticketDetail.orderNumber")}>
                <Link
                  to={`/admin/orders/${order.$id}`}
                  className="text-sage-dark hover:underline"
                >
                  {order.orderNumber || order.$id}
                </Link>
              </DetailRow>
              <DetailRow label={t("admin.ticketDetail.orderStatus")}>
                {order.status || "—"}
              </DetailRow>
            </Card>
          )}

          {/* Snapshot */}
          {snapshot && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-charcoal mb-3">
                {t("admin.ticketDetail.snapshot")}
              </h2>
              <SnapshotViewer snapshot={snapshot} />
            </Card>
          )}

          {/* Admin actions */}
          {isAdmin && ticket.status === "valid" && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-charcoal mb-3">
                {t("admin.ticketDetail.actions")}
              </h2>
              <Button
                variant="danger"
                size="sm"
                onClick={handleInvalidate}
                disabled={invalidating}
                className="w-full"
              >
                <Ban className="h-4 w-4 mr-1.5" />
                {invalidating
                  ? t("admin.common.loading")
                  : t("admin.ticketDetail.invalidate")}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
