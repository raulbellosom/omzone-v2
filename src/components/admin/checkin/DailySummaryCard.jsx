import { useLanguage } from "@/hooks/useLanguage";

export default function DailySummaryCard({ stats, loading }) {
  const { t } = useLanguage();

  const tiles = [
    { key: "checkinsToday", label: t("admin.checkin.summaryCheckins"), value: stats?.checkinsToday, accent: false },
    { key: "pendingToday", label: t("admin.checkin.summaryPending"), value: stats?.pendingToday, accent: false },
    { key: "upcomingCount", label: t("admin.checkin.summaryUpcoming"), value: stats?.upcomingCount, accent: false },
    { key: "alertsCount", label: t("admin.checkin.summaryAlerts"), value: stats?.alertsCount, accent: true },
  ];

  return (
    <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted mb-3">
        {t("admin.checkin.summaryTitle")}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <div
            key={tile.key}
            className="bg-sand-dark/5 border border-sand-dark/20 rounded-xl px-4 py-3"
          >
            <div
              className={`font-display text-2xl font-semibold leading-none ${
                tile.accent ? "text-red-600" : "text-charcoal"
              }`}
            >
              {loading ? "—" : (tile.value ?? 0)}
            </div>
            <div className="text-xs text-charcoal-muted mt-1.5">{tile.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
