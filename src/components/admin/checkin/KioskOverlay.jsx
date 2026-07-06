import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import SessionHistoryList from "@/components/admin/checkin/SessionHistoryList";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function KioskOverlay({
  onExit,
  scanner,
  manualInput,
  history,
  children,
}) {
  const { t, language } = useLanguage();
  const now = useClock();

  const clock = now.toLocaleTimeString(language === "es" ? "es-MX" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateLabel = now.toLocaleDateString(language === "es" ? "es-MX" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#F4F1EA]">
      <div className="flex items-center justify-between px-8 py-5 border-b border-sand-dark/40 bg-white/70 backdrop-blur">
        <span className="font-display text-2xl font-semibold tracking-wide text-charcoal">
          OMZONE
        </span>
        <div className="text-center">
          <div className="font-display text-3xl font-semibold text-charcoal leading-none">
            {clock}
          </div>
          <div className="text-xs text-charcoal-muted mt-1 capitalize">{dateLabel}</div>
        </div>
        <button
          onClick={onExit}
          className="h-14 px-6 rounded-xl border border-sand-dark bg-white text-sm font-semibold text-charcoal hover:bg-warm-gray transition-colors cursor-pointer"
        >
          {t("admin.checkin.kioskExit")}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">
          {scanner}
          <div className="flex flex-col gap-6">
            {manualInput}
            <div className="hidden lg:block">
              <SessionHistoryList history={history} />
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
