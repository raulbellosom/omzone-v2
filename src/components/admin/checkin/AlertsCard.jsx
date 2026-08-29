import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";

const DOT_COLOR = {
  unpaid_order: "bg-red-500",
  duplicate_scan: "bg-amber-500",
};

const TITLE_KEY = {
  unpaid_order: "admin.checkin.alertTypeUnpaidOrder",
  duplicate_scan: "admin.checkin.alertTypeDuplicateScan",
};

export default function AlertsCard({ alerts, loading }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const list = alerts || [];

  if (loading || list.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">
          {t("admin.checkin.alertsTitle")}
        </div>
        {user && (
          <div className="text-[11px] text-charcoal-muted">
            {t("admin.checkin.operatedBy").replace("{name}", user.name || user.email)}
          </div>
        )}
      </div>
      <div className="space-y-1">
        {list.map((alert, idx) => (
          <div
            key={`${alert.type}-${alert.ticketId}-${idx}`}
            className="flex items-start gap-3 py-2.5 border-t border-sand-dark/15 first:border-t-0"
          >
            <span
              className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${DOT_COLOR[alert.type] || "bg-charcoal-muted"}`}
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-charcoal">
                {t(TITLE_KEY[alert.type] || "admin.checkin.alertsTitle")}
              </div>
              <div className="text-xs text-charcoal-muted truncate">{alert.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
