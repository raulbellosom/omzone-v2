import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CheckInResult({ result }) {
  if (!result) return null;

  const isSuccess = result.success;
  const ticket = result.ticket;

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 space-y-4 transition-all",
        isSuccess
          ? "bg-emerald-50 border-emerald-200"
          : "bg-red-50 border-red-200",
      )}
    >
      {/* Icon + status */}
      <div className="flex items-center gap-3">
        {isSuccess ? (
          <CheckCircle className="h-8 w-8 text-emerald-600 shrink-0" />
        ) : result.status === "used" ? (
          <AlertTriangle className="h-8 w-8 text-red-500 shrink-0" />
        ) : (
          <XCircle className="h-8 w-8 text-red-500 shrink-0" />
        )}
        <div>
          <p
            className={cn(
              "font-semibold text-base",
              isSuccess ? "text-emerald-800" : "text-red-800",
            )}
          >
            {isSuccess ? "Check-in Successful" : "Check-in Failed"}
          </p>
          <p
            className={cn(
              "text-sm",
              isSuccess ? "text-emerald-700" : "text-red-700",
            )}
          >
            {result.message}
          </p>
        </div>
      </div>

      {/* Ticket details for successful check-in */}
      {isSuccess && ticket && (
        <div className="bg-white/70 rounded-xl p-4 space-y-2 text-sm">
          {ticket.experienceName && (
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Experience</span>
              <span className="font-medium text-charcoal">
                {ticket.experienceName}
              </span>
            </div>
          )}
          {ticket.editionDate && (
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Date</span>
              <span className="text-charcoal">{ticket.editionDate}</span>
            </div>
          )}
          {ticket.tierName && (
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Tier</span>
              <span className="text-charcoal">{ticket.tierName}</span>
            </div>
          )}
          {ticket.holderName && (
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Participant</span>
              <span className="text-charcoal">{ticket.holderName}</span>
            </div>
          )}
        </div>
      )}

      {/* Used at info for already-used tickets */}
      {!isSuccess && result.usedAt && (
        <p className="text-sm text-red-700">
          Previously checked in: {formatDateTime(result.usedAt)}
        </p>
      )}

      <p className="text-xs text-charcoal-muted/60">
        Code: {result.ticketCode} &middot; {formatDateTime(result.timestamp)}
      </p>
    </div>
  );
}
