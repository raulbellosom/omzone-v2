import { Link } from "react-router-dom";
import { Badge } from "@/components/common/Badge";
import TicketQR from "@/components/common/TicketQR";
import { useTicketPassDownload } from "@/hooks/useTicketPassDownload";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Calendar,
  Clock,
  Archive,
  RotateCcw,
  Download,
  Loader2,
} from "lucide-react";

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
    month: "short",
    year: "numeric",
  });
}

export default function TicketCard({
  ticket,
  onArchive,
  isArchived,
  archiving,
}) {
  const { language } = useLanguage();
  const { downloadPass, downloading } = useTicketPassDownload();
  const snap = ticket.ticketSnapshot ? JSON.parse(ticket.ticketSnapshot) : {};

  const statusVariant = STATUS_VARIANT[ticket.status] || "default";
  const statusLabel = STATUS_LABEL[ticket.status] || ticket.status;

  return (
    <div className="bg-white rounded-2xl border border-warm-gray-dark/10 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Clickable main area */}
      <Link
        to={`/portal/tickets/${ticket.$id}`}
        className="block p-4 space-y-3"
      >
        <h3 className="font-display font-semibold text-charcoal text-sm leading-snug line-clamp-2">
          {snap.experienceName || "Experiencia"}
        </h3>

        {(snap.slotStartDatetime ||
          snap.slotDate ||
          snap.editionDate ||
          snap.slotTime) && (
          <div className="flex items-center gap-3 text-xs text-charcoal-muted">
            {(snap.slotStartDatetime || snap.slotDate || snap.editionDate) && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(
                  snap.slotStartDatetime || snap.slotDate || snap.editionDate,
                )}
              </span>
            )}
            {(snap.slotTime || snap.slotStartDatetime || snap.slotDate) && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {snap.slotTime ||
                  new Date(
                    snap.slotStartDatetime || snap.slotDate,
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
              </span>
            )}
          </div>
        )}

        {snap.tierName && (
          <p className="text-xs text-charcoal-muted">{snap.tierName}</p>
        )}

        {snap.locationName && (
          <p className="text-xs text-charcoal-muted inline-flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {snap.locationName}
            {snap.roomName ? ` · ${snap.roomName}` : ""}
          </p>
        )}

        <div className="flex justify-center pt-1">
          <TicketQR value={ticket.ticketCode} size={100} />
        </div>

        <p className="text-center font-mono text-[11px] text-charcoal-muted tracking-wider">
          {ticket.ticketCode}
        </p>
      </Link>

      {/* Footer: labeled status badge + archive button */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-warm-gray-dark/8 bg-warm-gray/20">
        <span className="text-[11px] text-charcoal-muted font-medium">
          Estado:
        </span>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
        <button
          onClick={(e) => {
            e.preventDefault();
            downloadPass(ticket, snap, language);
          }}
          disabled={downloading}
          title="Guardar Pase"
          className="ml-auto p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-warm-gray transition-colors disabled:opacity-40 cursor-pointer"
        >
          {downloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
        </button>
        {onArchive && (
          <button
            onClick={onArchive}
            disabled={archiving}
            className="p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-warm-gray transition-colors disabled:opacity-40 cursor-pointer"
            title={isArchived ? "Restaurar ticket" : "Archivar ticket"}
          >
            {isArchived ? (
              <RotateCcw className="h-3.5 w-3.5" />
            ) : (
              <Archive className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
