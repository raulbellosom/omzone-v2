import { useLanguage } from "@/hooks/useLanguage";

export default function SessionHistoryList({ history }) {
  const { t } = useLanguage();

  if (history.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider">
        {t("admin.checkin.sessionHistory")}
      </h2>
      <div className="space-y-2">
        {history.map((entry, idx) => (
          <div
            key={`${entry.ticketCode}-${idx}`}
            className={`rounded-xl border px-4 py-3 text-sm flex items-center justify-between ${
              entry.outcome === "valid" || entry.outcome === "entered"
                ? "bg-emerald-50/50 border-emerald-200/60 text-emerald-800"
                : "bg-red-50/50 border-red-200/60 text-red-800"
            }`}
          >
            <span className="font-mono text-xs">{entry.ticketCode}</span>
            <span className="text-xs">{entry.outcome}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
