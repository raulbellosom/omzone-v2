import { useLanguage } from "@/hooks/useLanguage";

function formatTime(iso, language) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString(language === "es" ? "es-MX" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RecentActivityList({ activity, loading }) {
  const { t, language } = useLanguage();
  const list = activity || [];

  if (loading || list.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-3">
        {t("admin.checkin.recentActivityTitle")}
      </div>
      <div className="space-y-1">
        {list.map((entry, idx) => (
          <div
            key={`${entry.ticketCode}-${idx}`}
            className="flex items-center gap-3 py-2.5 border-t border-sand-dark/15 first:border-t-0"
          >
            <div className="text-xs font-semibold text-charcoal-muted w-14 shrink-0">
              {formatTime(entry.redeemedAt, language)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-charcoal truncate">
                {entry.participantName}
              </div>
              <div className="text-xs text-charcoal-muted truncate">
                {entry.experienceName} · {entry.redeemedByName}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
