import { useNavigate } from "react-router-dom";
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
          <tr className="bg-warm-gray/50">
            <th className="px-4 py-3 text-left font-medium text-charcoal">Contact</th>
            <th className="px-4 py-3 text-left font-medium text-charcoal hidden sm:table-cell">Experience</th>
            <th className="px-4 py-3 text-left font-medium text-charcoal hidden md:table-cell">Preferred Date</th>
            <th className="px-4 py-3 text-center font-medium text-charcoal hidden md:table-cell">Pax</th>
            <th className="px-4 py-3 text-left font-medium text-charcoal">Status</th>
            <th className="px-4 py-3 text-left font-medium text-charcoal hidden lg:table-cell">Created</th>
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
                className="border-b border-sand-dark/40 hover:bg-warm-gray/30 transition-colors cursor-pointer"
                onClick={() => handleRowClick(req.$id)}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-charcoal truncate max-w-[160px]">{req.contactName}</p>
                  <p className="text-xs text-charcoal-subtle truncate max-w-[160px]">{req.contactEmail}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <p className="text-charcoal truncate max-w-[200px]">
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
