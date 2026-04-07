import { useContext } from "react";
import { LanguageContext } from "@/contexts/LanguageContext";
import useAppVersion from "@/hooks/useAppVersion";

export default function AppUpdateBanner() {
  const { t } = useContext(LanguageContext);
  const { updateAvailable, dismiss } = useAppVersion();

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-9999 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-warm-gray/30 bg-charcoal px-5 py-4 text-white shadow-xl sm:bottom-6">
      <p className="text-sm leading-relaxed">
        {t("common.updateAvailable")}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-white px-4 py-1.5 text-sm font-medium text-charcoal transition-colors hover:bg-warm-gray/20 hover:text-white"
        >
          {t("common.reload")}
        </button>
        <button
          onClick={dismiss}
          className="text-sm text-warm-gray transition-colors hover:text-white"
        >
          {t("common.dismiss")}
        </button>
      </div>
    </div>
  );
}
