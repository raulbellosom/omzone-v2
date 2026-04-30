import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { getStatusBadgeClass, getStatusLabel } from "@/hooks/useBookingRequests";
import { cn } from "@/lib/utils";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        getStatusBadgeClass(status),
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-sand-dark/40 animate-pulse">
      <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-warm-gray" /></td>
      <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-32 rounded bg-warm-gray" /></td>
      <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-20 rounded bg-warm-gray" /></td>
      <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-10 rounded bg-warm-gray" /></td>
      <td className="px-4 py-3"><div className="h-5 w-16 rounded-full bg-warm-gray" /></td>
      <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-20 rounded bg-warm-gray" /></td>
    </tr>
  );
}

export default function BookingRequestTable({ requests, loading }) {
  const navigate = useNavigate();

  const handleRowClick = (id) => {
    navigate(ROUTES.ADMIN_BOOKING_REQUEST_DETAIL.replace(":id", id));
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-sand-dark">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-sand-dark bg-warm-gray/60">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">Contact</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden sm:table-cell">Experience</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden md:table-cell">Preferred Date</th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden md:table-cell">Pax</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden lg:table-cell">Created</th>
          </tr>
        </thead>
        <tbody>
          {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

          {!loading && requests.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-charcoal-subtle">
                No booking requests found
              </td>
            </tr>
          )}

          {!loading &&
            requests.map((req) => (
              <tr
                key={req.$id}
                className="group border-b border-sand last:border-0 hover:bg-warm-gray/30 transition-colors cursor-pointer"
                onClick={() => handleRowClick(req.$id)}
              >
                <td className="px-4 py-3">
                  <Link
                    to={ROUTES.ADMIN_BOOKING_REQUEST_DETAIL.replace(":id", req.$id)}
                    className="font-medium text-charcoal hover:text-sage-dark hover:underline underline-offset-2 transition-colors truncate max-w-40 block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {req.contactName}
                  </Link>
                  <p className="text-xs text-charcoal-subtle truncate max-w-40">{req.contactEmail}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <p className="text-charcoal truncate max-w-50">
                    {req._experience?.publicName || req.experienceId}
                  </p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-charcoal-muted">
                  {formatDate(req.requestedDate)}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-center text-charcoal-muted">
                  {req.participants}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={req.status} />
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-charcoal-muted">
                  {formatDate(req.$createdAt)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export { StatusBadge };
