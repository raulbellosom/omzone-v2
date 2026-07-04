import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketCheckIn } from "@/hooks/useTicketCheckIn";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";
import ScannerCard from "@/components/admin/checkin/ScannerCard";
import CheckInResultModal from "@/components/admin/checkin/CheckInResultModal";
import KioskOverlay from "@/components/admin/checkin/KioskOverlay";
import Button from "@/components/common/Button";
import { ScanLine, Maximize2 } from "lucide-react";

const MAX_HISTORY = 10;

export default function CheckInPage() {
  const { state, checkTicket, confirmEntry, reset } = useTicketCheckIn();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [kioskMode, setKioskMode] = useState(false);
  const [focusToken, setFocusToken] = useState(0);

  const bumpFocus = useCallback(() => setFocusToken((n) => n + 1), []);

  const handleSubmitCode = useCallback(
    (code) => {
      checkTicket(code);
    },
    [checkTicket],
  );

  const handleConfirm = useCallback(
    async (ticketCode) => {
      const method = kioskMode ? "kiosk" : "manual";
      const result = await confirmEntry(ticketCode, method);
      if (result) {
        setHistory((prev) => [result, ...prev].slice(0, MAX_HISTORY));
      }
    },
    [confirmEntry, kioskMode],
  );

  const handleScanAnother = useCallback(() => {
    // Record failed/terminal outcomes in session history too, before resetting.
    if (state.phase === "result" && state.data) {
      setHistory((prev) => [state.data, ...prev].slice(0, MAX_HISTORY));
    }
    reset();
    bumpFocus();
  }, [state, reset, bumpFocus]);

  const handleViewDetails = useCallback(
    (ticketId) => {
      navigate(ROUTES.ADMIN_TICKET_DETAIL.replace(":ticketId", ticketId));
    },
    [navigate],
  );

  const handleSearchClient = useCallback(() => {
    navigate(ROUTES.ADMIN_CLIENTS);
  }, [navigate]);

  const scanner = (
    <ScannerCard
      onSubmitCode={handleSubmitCode}
      disabled={state.phase === "loading" || state.phase === "confirming"}
      focusToken={focusToken}
    />
  );

  const modal = (
    <CheckInResultModal
      state={state}
      onConfirm={handleConfirm}
      onScanAnother={handleScanAnother}
      onViewDetails={handleViewDetails}
      onSearchClient={handleSearchClient}
    />
  );

  if (kioskMode) {
    return (
      <KioskOverlay onExit={() => setKioskMode(false)}>
        {scanner}
        {modal}
      </KioskOverlay>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-sage/10 flex items-center justify-center">
            <ScanLine className="h-5 w-5 text-sage" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-charcoal">
              {t("admin.checkin.title")}
            </h1>
            <p className="text-sm text-charcoal-muted">{t("admin.checkin.subtitle")}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setKioskMode(true)}>
          <Maximize2 className="h-4 w-4 mr-1.5" />
          {t("admin.checkin.kioskEnter")}
        </Button>
      </div>

      {scanner}
      {modal}

      {/* Session history */}
      {history.length > 0 && (
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
      )}
    </div>
  );
}
