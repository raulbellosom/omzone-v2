import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { Card } from "@/components/common/Card";
import { StatusBadge } from "./BookingRequestTable";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BookingRequestCard({ request }) {
  const navigate = useNavigate();

  return (
    <Card
      className="p-4 space-y-2 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() =>
        navigate(
          ROUTES.ADMIN_BOOKING_REQUEST_DETAIL.replace(":id", request.$id),
        )
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-charcoal truncate">
            {request.contactName}
          </p>
          <p className="text-xs text-charcoal-subtle truncate">
            {request.contactEmail}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <p className="text-sm text-charcoal-muted truncate">
        {request._experience?.publicName || "—"}
      </p>

      <div className="flex items-center justify-between text-xs text-charcoal-subtle">
        <span>
          {request.participants} pax · {formatDate(request.requestedDate)}
        </span>
        <span>{formatDate(request.$createdAt)}</span>
      </div>
    </Card>
  );
}
