import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketCheckIn } from "@/hooks/useTicketCheckIn";
import { useCheckInSummary } from "@/hooks/useCheckInSummary";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";
import ScannerCard from "@/components/admin/checkin/ScannerCard";
import ManualCodeInput from "@/components/admin/checkin/ManualCodeInput";
import DailySummaryCard from "@/components/admin/checkin/DailySummaryCard";
import UpcomingSessionsCard from "@/components/admin/checkin/UpcomingSessionsCard";
import AlertsCard from "@/components/admin/checkin/AlertsCard";
import RecentActivityList from "@/components/admin/checkin/RecentActivityList";
import CheckInResultModal from "@/components/admin/checkin/CheckInResultModal";
import KioskOverlay from "@/components/admin/checkin/KioskOverlay";
import StaffBadge from "@/components/admin/checkin/StaffBadge";
import Button from "@/components/common/Button";
import { ScanLine, Maximize2 } from "lucide-react";

export default function CheckInPage() {
  const { state, checkTicket, confirmEntry, reset } = useTicketCheckIn();
  const { data: summary, loading: summaryLoading, refetch: refetchSummary } =
    useCheckInSummary();
  const { t } = useLanguage();
  const navigate = useNavigate();

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
        refetchSummary();
      }
    },
    [confirmEntry, kioskMode, refetchSummary],
  );

  const handleScanAnother = useCallback(() => {
    reset();
    bumpFocus();
  }, [reset, bumpFocus]);

  const handleViewDetails = useCallback(
    (ticketId) => {
      navigate(ROUTES.ADMIN_TICKET_DETAIL.replace(":ticketId", ticketId));
    },
    [navigate],
  );

  const handleSearchClient = useCallback(() => {
    navigate(ROUTES.ADMIN_CLIENTS);
  }, [navigate]);

  const disabled = state.phase === "loading" || state.phase === "confirming";

  const scanner = <ScannerCard onSubmitCode={handleSubmitCode} />;

  const manualInput = (
    <ManualCodeInput
      onSubmitCode={handleSubmitCode}
      disabled={disabled}
      focusToken={focusToken}
    />
  );

  const summaryPanel = (
    <>
      <DailySummaryCard stats={summary?.stats} loading={summaryLoading} />
      <UpcomingSessionsCard sessions={summary?.upcomingSessions} loading={summaryLoading} />
      <AlertsCard alerts={summary?.alerts} loading={summaryLoading} />
      <RecentActivityList activity={summary?.recentActivity} loading={summaryLoading} />
    </>
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
      <KioskOverlay
        onExit={() => setKioskMode(false)}
        scanner={scanner}
        manualInput={manualInput}
        summaryPanel={summaryPanel}
      >
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
        <div className="flex items-center gap-3">
          <StaffBadge />
          <Button variant="outline" size="sm" onClick={() => setKioskMode(true)}>
            <Maximize2 className="h-4 w-4 mr-1.5" />
            {t("admin.checkin.kioskEnter")}
          </Button>
        </div>
      </div>

      {/* Camera on top under lg, side-by-side with manual input + summary at lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">
        {scanner}
        <div className="flex flex-col gap-6">
          {manualInput}
          {summaryPanel}
        </div>
      </div>

      {modal}
    </div>
  );
}
