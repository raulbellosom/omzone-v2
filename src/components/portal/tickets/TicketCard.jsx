import { Link } from "react-router-dom";
import { Badge } from "@/components/common/Badge";
import TicketQR from "@/components/common/TicketQR";
import { Calendar, Clock } from "lucide-react";

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

export default function TicketCard({ ticket }) {
  const snap = ticket.ticketSnapshot
    ? JSON.parse(ticket.ticketSnapshot)
    : {};

  return (
    <Link
      to={`/portal/tickets/${ticket.$id}`}
      className="block bg-white rounded-2xl border border-warm-gray-dark/10 shadow-sm hover:shadow-md transition-shadow p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-semibold text-charcoal text-sm leading-snug line-clamp-2">
          {snap.experienceName || "Experiencia"}
        </h3>
        <Badge variant={STATUS_VARIANT[ticket.status] || "default"}>
          {STATUS_LABEL[ticket.status] || ticket.status}
        </Badge>
      </div>

      {(snap.slotStartDatetime || snap.editionDate || snap.slotTime) && (
        <div className="flex items-center gap-3 text-xs text-charcoal-muted">
          {(snap.slotStartDatetime || snap.editionDate) && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(snap.slotStartDatetime || snap.editionDate)}
            </span>
          )}
          {snap.slotTime && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {snap.slotTime}
            </span>
          )}
        </div>
      )}

      {snap.tierName && (
        <p className="text-xs text-charcoal-muted">{snap.tierName}</p>
      )}

      <div className="flex justify-center pt-1">
        <TicketQR value={ticket.ticketCode} size={100} />
      </div>

      <p className="text-center font-mono text-[11px] text-charcoal-muted tracking-wider">
        {ticket.ticketCode}
      </p>
    </Link>
  );
}
