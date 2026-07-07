import { useLanguage } from "@/hooks/useLanguage";

export default function UpcomingSessionsCard({ sessions, loading }) {
  const { t } = useLanguage();
  const list = sessions || [];

  if (loading || list.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-3">
        {t("admin.checkin.upcomingTitle")}
      </div>
      <div className="space-y-1">
        {list.map((session) => (
          <div
            key={session.slotId}
            className="flex items-center gap-3 py-2.5 border-t border-sand-dark/15 first:border-t-0"
          >
            <div className="font-display text-sm font-semibold text-sage w-12 shrink-0">
              {session.time}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-charcoal truncate">
                {session.experienceName}
              </div>
              <div className="text-xs text-charcoal-muted truncate">
                {session.roomName} · {session.bookedCount} {t("admin.checkin.people")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
