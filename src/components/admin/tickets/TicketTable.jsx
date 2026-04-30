import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import TicketStatusBadge from "./TicketStatusBadge";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function SkeletonRow() {
  return (
    <tr className="border-b border-sand-dark/40 animate-pulse">
      <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-warm-gray" /></td>
      <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-32 rounded bg-warm-gray" /></td>
      <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-28 rounded bg-warm-gray" /></td>
      <td className="px-4 py-3"><div className="h-5 w-16 rounded-full bg-warm-gray" /></td>
      <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-20 rounded bg-warm-gray" /></td>
    </tr>
  );
}

export default function TicketTable({ tickets, loading }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-xl border border-sand-dark">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-sand-dark bg-warm-gray/60">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">Code</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden sm:table-cell">Participant</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden md:table-cell">Experience</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden lg:table-cell">Date</th>
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

          {!loading && tickets.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-charcoal-subtle">
                No tickets found
              </td>
            </tr>
          )}

          {!loading &&
            tickets.map((ticket) => (
              <tr
                key={ticket.$id}
                className="group border-b border-sand last:border-0 hover:bg-warm-gray/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/tickets/${ticket.$id}`)}
              >
                <td className="px-4 py-3">
                  <Link
                    to={ROUTES.ADMIN_TICKET_DETAIL.replace(":ticketId", ticket.$id)}
                    className="font-mono font-medium text-charcoal text-xs hover:text-sage-dark hover:underline underline-offset-2 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {ticket.ticketCode}
                  </Link>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="min-w-0">
                    <p className="text-charcoal truncate">{ticket.participantName || "—"}</p>
                    <p className="text-xs text-charcoal-subtle truncate">{ticket.participantEmail || ""}</p>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-charcoal truncate max-w-50">
                    {ticket.ticketSnapshot?.experienceName || ticket.experienceId || "—"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <TicketStatusBadge status={ticket.status} />
                </td>
                <td className="px-4 py-3 text-charcoal-subtle hidden lg:table-cell">
                  {formatDate(ticket.$createdAt)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
