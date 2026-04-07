import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { databases } from "@/lib/appwrite";
import { useAuth } from "@/hooks/useAuth";
import env from "@/config/env";
import { ROUTES } from "@/constants/routes";
import { Badge } from "@/components/common/Badge";
import Button from "@/components/common/Button";
import TicketQR from "@/components/common/TicketQR";
import {
  ArrowLeft,
  Printer,
  Share2,
  Calendar,
  Clock,
  MapPin,
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

const STATUS_LABEL = {
  valid: "Activo",
  used: "Usado",
  cancelled: "Cancelado",
  expired: "Expirado",
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
  const navigate = useNavigate();
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
          setError("Ticket no encontrado");
          return;
        }
        setTicket(doc);
      })
      .catch(() => setError("Ticket no encontrado"))
      .finally(() => setLoading(false));
  }, [ticketId, user?.$id]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mi Ticket — OMZONE",
          url,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (error || !ticket) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-charcoal-muted">{error || "Ticket no encontrado"}</p>
        <Button variant="outline" onClick={() => navigate(ROUTES.PORTAL_TICKETS)}>
          Volver a Tickets
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
  const isPastEvent =
    ticket.status === "valid" &&
    (snap.slotStartDatetime || snap.editionDate) &&
    (snap.slotStartDatetime || snap.editionDate) < new Date().toISOString();

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(ROUTES.PORTAL_TICKETS)}
        className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Mis Tickets
      </button>

      {/* Print-friendly ticket card */}
      <div
        id="ticket-print-area"
        className="bg-white rounded-2xl border border-warm-gray-dark/10 shadow-sm p-6 md:p-8 space-y-6 print:shadow-none print:border-0 print:rounded-none print:p-0"
      >
        {/* Title + status */}
        <div className="text-center space-y-2">
          <h1 className="text-xl md:text-2xl font-display font-bold text-charcoal">
            {snap.experienceName || "Ticket de Experiencia"}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Badge variant={STATUS_VARIANT[ticket.status] || "default"}>
              {STATUS_LABEL[ticket.status] || ticket.status}
            </Badge>
            {isPastEvent && (
              <Badge variant="warning">Evento pasado</Badge>
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
          <DetailRow label="Experiencia">{snap.experienceName}</DetailRow>
          {snap.editionName && (
            <DetailRow label="Edición">{snap.editionName}</DetailRow>
          )}
          {(snap.slotStartDatetime || snap.editionDate) && (
            <DetailRow label="Fecha">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(snap.slotStartDatetime || snap.editionDate)}
              </span>
            </DetailRow>
          )}
          {snap.slotTime && (
            <DetailRow label="Hora">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {snap.slotTime}
              </span>
            </DetailRow>
          )}
          {snap.locationName && (
            <DetailRow label="Ubicación">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {snap.locationName}
              </span>
            </DetailRow>
          )}
          {snap.tierName && (
            <DetailRow label="Tier">{snap.tierName}</DetailRow>
          )}
          {snap.pricingOptionName && (
            <DetailRow label="Opción">{snap.pricingOptionName}</DetailRow>
          )}
          {(ticket.participantName || snap.participantName) && (
            <DetailRow label="Participante">
              {ticket.participantName || snap.participantName}
            </DetailRow>
          )}
          {addons.length > 0 && (
            <DetailRow label="Addons">
              <span className="text-right">
                {addons.map((a) => a.name || a.addonName).join(", ")}
              </span>
            </DetailRow>
          )}
          {ticket.usedAt && (
            <DetailRow label="Usado el">{formatDateTime(ticket.usedAt)}</DetailRow>
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
              Ver orden asociada
            </Link>
          </div>
        )}

        {/* OMZONE branding for print */}
        <p className="text-center text-xs text-charcoal-muted/60 print:mt-8">
          OMZONE &middot; Wellness Experiences
        </p>
      </div>

      {/* Actions — hidden on print */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center print:hidden">
        <Button
          size="md"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={handleShare}
          className="inline-flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Compartir
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={() => navigate(ROUTES.PORTAL_TICKETS)}
        >
          Volver a Tickets
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
