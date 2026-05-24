import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { databases } from "@/lib/appwrite";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTicketPassDownload } from "@/hooks/useTicketPassDownload";
import env from "@/config/env";
import { ROUTES } from "@/constants/routes";
import { Badge } from "@/components/common/Badge";
import Button from "@/components/common/Button";
import TicketQR from "@/components/common/TicketQR";
import {
  ArrowLeft,
  Printer,
  Share2,
  Download,
  Loader2,
  Calendar,
  Clock,
  ShoppingBag,
} from "lucide-react";

const DB = env.appwriteDatabaseId;
const COL_TICKETS = env.collectionTickets;

const STATUS_VARIANT = {
  valid: "success",
  used: "warm",
  cancelled: "danger",
  expired: "warning",
};

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailRow({ label, children }) {
  if (!children) return null;
  return (
    <div className="flex justify-between items-start py-2 border-b border-warm-gray-dark/10 last:border-0">
      <span className="text-sm text-charcoal-muted">{label}</span>
      <span className="text-sm font-medium text-charcoal text-right">
        {children}
      </span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-32 rounded bg-warm-gray/40" />
      <div className="bg-white rounded-2xl p-6 space-y-4">
        <div className="h-6 w-48 rounded bg-warm-gray/40 mx-auto" />
        <div className="h-52 w-52 rounded bg-warm-gray/30 mx-auto" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-24 rounded bg-warm-gray/30" />
            <div className="h-4 w-32 rounded bg-warm-gray/30" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { downloadPass, downloading } = useTicketPassDownload();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticketId) return;

    setLoading(true);
    databases
      .getDocument(DB, COL_TICKETS, ticketId)
      .then((doc) => {
        // Security: only show own tickets
        if (doc.userId !== user?.$id) {
          setError(t("portal.tickets.notFound"));
          return;
        }
        setTicket(doc);
      })
      .catch(() => setError(t("portal.tickets.notFound")))
      .finally(() => setLoading(false));
  }, [ticketId, user?.$id, t]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("portal.tickets.shareTitle"),
          url,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [t]);

  if (loading) return <LoadingSkeleton />;

  if (error || !ticket) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-charcoal-muted">
          {error || t("portal.tickets.notFound")}
        </p>
        <Button variant="outline" asChild>
          <Link to={ROUTES.PORTAL_TICKETS}>{t("portal.tickets.backLink")}</Link>
        </Button>
      </div>
    );
  }

  let snap = {};
  try {
    snap =
      typeof ticket.ticketSnapshot === "string"
        ? JSON.parse(ticket.ticketSnapshot)
        : ticket.ticketSnapshot || {};
  } catch {
    /* */
  }

  const addons = Array.isArray(snap.addons) ? snap.addons : [];
  const slotDatetime = snap.slotStartDatetime || snap.slotDate;
  const isPastEvent =
    ticket.status === "valid" &&
    slotDatetime &&
    slotDatetime < new Date().toISOString();

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to={ROUTES.PORTAL_TICKETS}
        className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("portal.tickets.backLink")}
      </Link>

      {/* Print-friendly ticket card */}
      <div
        id="ticket-print-area"
        className="bg-white rounded-2xl border border-warm-gray-dark/10 shadow-sm p-6 md:p-8 space-y-6 print:shadow-none print:border-0 print:rounded-none print:p-0"
      >
        {/* Title + status */}
        <div className="text-center space-y-2">
          <h1 className="text-xl md:text-2xl font-display font-bold text-charcoal">
            {snap.experienceName || t("portal.tickets.experienceFallback")}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Badge variant={STATUS_VARIANT[ticket.status] || "default"}>
              {t(`portal.tickets.status.${ticket.status}`) || ticket.status}
            </Badge>
            {isPastEvent && (
              <Badge variant="warning">{t("portal.tickets.pastEvent")}</Badge>
            )}
          </div>
        </div>

        {/* QR — responsive: 200px mobile, 250px md+ */}
        <div className="flex justify-center py-4 print:py-2">
          <div className="block md:hidden">
            <TicketQR value={ticket.ticketCode} size={200} />
          </div>
          <div className="hidden md:block">
            <TicketQR value={ticket.ticketCode} size={250} />
          </div>
        </div>
        <p className="text-center font-mono text-sm text-charcoal-muted tracking-widest">
          {ticket.ticketCode}
        </p>

        {/* Details */}
        <div className="max-w-sm mx-auto space-y-0">
          <DetailRow label={t("portal.tickets.detailExperience")}>
            {snap.experienceName}
          </DetailRow>
          {snap.editionName && (
            <DetailRow label={t("portal.tickets.detailEdition")}>
              {snap.editionName}
            </DetailRow>
          )}
          {(slotDatetime || snap.editionDate) && (
            <DetailRow label={t("portal.tickets.detailDate")}>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(slotDatetime || snap.editionDate)}
              </span>
            </DetailRow>
          )}
          {(snap.slotTime || slotDatetime) && (
            <DetailRow label={t("portal.tickets.detailTime")}>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {snap.slotTime ||
                  new Date(slotDatetime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
              </span>
            </DetailRow>
          )}
          {snap.locationName && (
            <DetailRow label={t("portal.tickets.detailLocation")}>
              <span className="text-right">
                <span className="block">{snap.locationName}</span>
                {snap.locationAddress && (
                  <span className="block text-xs text-charcoal-muted font-normal mt-0.5">
                    {snap.locationAddress}
                  </span>
                )}
                {snap.roomName && (
                  <span className="block text-xs text-charcoal-muted font-normal">
                    {snap.roomName}
                  </span>
                )}
              </span>
            </DetailRow>
          )}
          {snap.tierName && (
            <DetailRow label={t("portal.tickets.detailTier")}>
              {snap.tierName}
            </DetailRow>
          )}
          {snap.pricingOptionName && (
            <DetailRow label={t("portal.tickets.detailOption")}>
              {snap.pricingOptionName}
            </DetailRow>
          )}
          {(ticket.participantName || snap.participantName) && (
            <DetailRow label={t("portal.tickets.detailParticipant")}>
              {ticket.participantName || snap.participantName}
            </DetailRow>
          )}
          {addons.length > 0 && (
            <DetailRow label={t("portal.tickets.detailAddons")}>
              <span className="text-right">
                {addons.map((a) => a.name || a.addonName).join(", ")}
              </span>
            </DetailRow>
          )}
          {ticket.usedAt && (
            <DetailRow label={t("portal.tickets.detailUsedAt")}>
              {formatDateTime(ticket.usedAt)}
            </DetailRow>
          )}
        </div>

        {/* Order link — hidden on print */}
        {ticket.orderId && (
          <div className="text-center print:hidden">
            <Link
              to={`/portal/orders/${ticket.orderId}`}
              className="inline-flex items-center gap-1.5 text-xs text-sage font-medium hover:underline"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {t("portal.tickets.viewOrder")}
            </Link>
          </div>
        )}

        {/* OMZONE branding for print */}
        <p className="text-center text-xs text-charcoal-muted/60 print:mt-8">
          OMZONE &middot; Experiences in Puerto Vallarta
        </p>
      </div>

      {/* Actions — hidden on print */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center print:hidden">
        <Button
          size="md"
          onClick={() => downloadPass(ticket, snap, language)}
          disabled={downloading}
          className="inline-flex items-center gap-2"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {t("portal.tickets.downloadButton")}
        </Button>
        <Button
          size="md"
          variant="outline"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          {t("portal.tickets.printButton")}
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={handleShare}
          className="inline-flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          {t("portal.tickets.shareButton")}
        </Button>
        <Button variant="outline" size="md" asChild>
          <Link to={ROUTES.PORTAL_TICKETS}>
            {t("portal.tickets.backButton")}
          </Link>
        </Button>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page { margin: 1cm; }
          body * { visibility: hidden; }
          #ticket-print-area, #ticket-print-area * { visibility: visible; }
          #ticket-print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
