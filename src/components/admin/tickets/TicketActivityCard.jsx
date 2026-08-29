import { Card } from "@/components/common/Card";
import { useLanguage } from "@/hooks/useLanguage";
import { useTicketActivity } from "@/hooks/useTicketActivity";
import { displayRoleName } from "@/constants/roles";
import { UserCheck, History } from "lucide-react";

const ACTION_LABEL_KEYS = {
  "checkin.scan_valid": "actionScanValid",
  "checkin.scan_cancelled": "actionScanCancelled",
  "checkin.scan_expired": "actionScanExpired",
  "checkin.duplicate_scan_attempt": "actionScanDuplicate",
  "checkin.confirmed": "actionConfirmed",
  "ticket.invalidate": "actionInvalidate",
};

const METHOD_LABEL_KEYS = {
  qr_scan: "methodQrScan",
  manual: "methodManual",
  kiosk: "methodKiosk",
  system: "methodSystem",
};

function formatDateTime(iso, language) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(language === "es" ? "es-MX" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function actorDisplayName(profile, fallbackId) {
  if (!profile) return fallbackId;
  const full = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  return full || profile.email || fallbackId;
}

export default function TicketActivityCard({ ticketId }) {
  const { t, language } = useLanguage();
  const { redemption, activity, actors, loading } = useTicketActivity(ticketId);

  if (loading) {
    return (
      <Card className="p-5 space-y-3 animate-pulse">
        <div className="h-4 w-32 rounded bg-warm-gray" />
        <div className="h-4 w-full rounded bg-warm-gray" />
        <div className="h-4 w-full rounded bg-warm-gray" />
      </Card>
    );
  }

  // Best-effort role lookup: the matching checkin.confirmed activity entry
  // (if present) carries an actorRoleSnapshot; the redemption record itself
  // does not store a role.
  const confirmEntry = redemption
    ? activity.find(
        (e) => e.action === "checkin.confirmed" && e.userId === redemption.redeemedBy,
      )
    : null;

  return (
    <Card className="p-5 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-charcoal mb-3 flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-charcoal-muted" />
          {t("admin.ticketDetail.confirmedBy")}
        </h2>
        {redemption ? (
          <div className="space-y-1 text-sm">
            <p className="font-medium text-charcoal">
              {actorDisplayName(actors[redemption.redeemedBy], redemption.redeemedBy)}
              {confirmEntry?.actorRoleSnapshot && (
                <span className="ml-2 text-xs font-normal text-charcoal-muted">
                  {displayRoleName(confirmEntry.actorRoleSnapshot)}
                </span>
              )}
            </p>
            <p className="text-charcoal-muted">
              {formatDateTime(redemption.redeemedAt, language)}
            </p>
            <p className="text-charcoal-muted">
              {t("admin.ticketDetail.method")}:{" "}
              {t(`admin.ticketDetail.${METHOD_LABEL_KEYS[redemption.method] || "methodManual"}`)}
            </p>
            {redemption.notes && (
              <p className="text-xs text-charcoal-subtle mt-1">{redemption.notes}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-charcoal-subtle">
            {t("admin.ticketDetail.noRedemption")}
          </p>
        )}
      </div>

      <div>
        <h2 className="text-base font-semibold text-charcoal mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-charcoal-muted" />
          {t("admin.ticketDetail.scanHistory")}
        </h2>
        {activity.length === 0 ? (
          <p className="text-sm text-charcoal-subtle">
            {t("admin.ticketDetail.noActivity")}
          </p>
        ) : (
          <ul className="space-y-3">
            {activity.map((entry) => {
              const labelKey = ACTION_LABEL_KEYS[entry.action];
              return (
                <li
                  key={entry.$id}
                  className="text-sm border-b border-sand-dark/30 last:border-0 pb-2 last:pb-0"
                >
                  <p className="text-charcoal">
                    {labelKey ? t(`admin.ticketDetail.${labelKey}`) : entry.action}
                  </p>
                  <p className="text-xs text-charcoal-muted">
                    {formatDateTime(entry.$createdAt, language)}
                    {" · "}
                    {actorDisplayName(actors[entry.userId], entry.userId)}
                    {entry.actorRoleSnapshot &&
                      ` (${displayRoleName(entry.actorRoleSnapshot)})`}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
