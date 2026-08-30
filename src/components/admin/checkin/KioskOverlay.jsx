import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import StaffBadge from "@/components/admin/checkin/StaffBadge";

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
  summaryPanel,
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
    <div className="fixed inset-0 z-40 flex min-w-0 max-w-full flex-col overflow-hidden bg-[#F4F1EA]">
      <div className="flex min-w-0 flex-col items-stretch gap-3 border-b border-sand-dark/40 bg-white/70 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
        <span className="font-display text-2xl font-semibold tracking-wide text-charcoal">
          OMZONE
        </span>
        <div className="text-center">
          <div className="font-display text-3xl font-semibold text-charcoal leading-none">
            {clock}
          </div>
          <div className="text-xs text-charcoal-muted mt-1 capitalize">{dateLabel}</div>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:flex sm:items-center sm:gap-3">
          <StaffBadge className="w-full sm:w-auto" />
          <button
            onClick={onExit}
            className="h-11 w-full rounded-xl border border-sand-dark bg-white px-4 text-sm font-semibold text-charcoal transition-colors hover:bg-warm-gray sm:h-14 sm:w-auto sm:px-6 cursor-pointer"
          >
            {t("admin.checkin.kioskExit")}
          </button>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 items-start justify-center overflow-auto p-3 sm:p-6">
        <div className="grid w-full min-w-0 max-w-5xl grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-[3fr_2fr]">
          {scanner}
          <div className="flex min-w-0 max-w-full flex-col gap-6">
            {manualInput}
            <div className="hidden lg:flex lg:flex-col lg:gap-6">{summaryPanel}</div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
