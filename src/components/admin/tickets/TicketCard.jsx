import Card from "../../common/Card";
import TicketStatusBadge from "./TicketStatusBadge";
import { Link } from "react-router-dom";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TicketCard({ ticket }) {
  return (
    <Link to={`/admin/tickets/${ticket.$id}`} className="block">
      <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs font-medium text-charcoal">{ticket.ticketCode}</p>
          <p className="text-sm text-charcoal mt-1 truncate">{ticket.participantName || "—"}</p>
          {ticket.participantEmail && (
            <p className="text-xs text-charcoal-subtle truncate">{ticket.participantEmail}</p>
          )}
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-sand-dark/40">
        <p className="text-xs text-charcoal-subtle truncate max-w-[60%]">
          {ticket.ticketSnapshot?.experienceName || ticket.experienceId || "—"}
        </p>
        <p className="text-xs text-charcoal-subtle">{formatDate(ticket.$createdAt)}</p>
      </div>
      </Card>
    </Link>
  );
}
