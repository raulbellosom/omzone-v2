import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from "@/components/common/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CheckCircle, XCircle, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const STATE_STYLES = {
  valid: { accent: "text-emerald-700", bg: "bg-emerald-50", ring: "border-emerald-200" },
  used: { accent: "text-amber-700", bg: "bg-amber-50", ring: "border-amber-200" },
  invalid: { accent: "text-red-700", bg: "bg-red-50", ring: "border-red-200" },
  schedule: { accent: "text-blue-700", bg: "bg-blue-50", ring: "border-blue-200" },
  entered: { accent: "text-emerald-700", bg: "bg-emerald-50", ring: "border-emerald-200" },
};

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function outcomeGroup(outcome) {
  if (outcome === "valid") return "valid";
  if (outcome === "used") return "used";
  if (outcome === "schedule") return "schedule";
  if (outcome === "entered") return "entered";
  return "invalid"; // invalid_not_found | invalid_cancelled | invalid_expired
}

function invalidReasonKey(outcome) {
  if (outcome === "invalid_cancelled") return "reasonCancelled";
  if (outcome === "invalid_expired") return "reasonExpired";
  return "reasonNotFound";
}

export default function CheckInResultModal({
  state,
  onConfirm,
  onScanAnother,
  onViewDetails,
  onSearchClient,
}) {
  const { t } = useLanguage();
  const open = state.phase !== "idle";
  const { phase, data } = state;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onScanAnother(); }}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onEscapeKeyDown={(e) => { if (phase === "loading" || phase === "confirming") e.preventDefault(); }}
          onPointerDownOutside={(e) => { if (phase === "loading" || phase === "confirming") e.preventDefault(); }}
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[min(560px,95vw)] max-h-[92vh] overflow-auto rounded-3xl bg-white shadow-2xl"
        >
          <DialogPrimitive.Title className="sr-only">
            {t("admin.checkin.title")}
          </DialogPrimitive.Title>

          {(phase === "loading" || phase === "confirming") && (
            <div className="p-14 text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-6 text-sage animate-spin" />
              <p className="font-display text-xl text-charcoal">
                {phase === "confirming" ? t("admin.checkin.confirming") : t("admin.checkin.validating")}
              </p>
              <p className="text-xs tracking-wider text-charcoal-muted mt-2 font-mono">
                {data?.ticketCode}
              </p>
            </div>
          )}

          {phase === "entered" && (
            <>
              <div className="bg-emerald-50 p-9 text-center">
                <div className="h-16 w-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <p className="font-display text-2xl font-semibold text-emerald-800">
                  {t("admin.checkin.resultEnteredTitle")}
                </p>
              </div>
              <div className="p-7 space-y-4">
                <div className="text-center">
                  <p className="font-display text-xl text-charcoal">
                    {data.ticket.participantName || data.ticketCode}
                  </p>
                  <p className="text-sm text-charcoal-muted mt-1">
                    {t("admin.checkin.enteredSubtitle")
                      .replace("{room}", data.ticket.roomName || "—")
                      .replace("{time}", formatDateTime(new Date().toISOString()))}
                  </p>
                </div>
                <button
                  onClick={onScanAnother}
                  className="w-full h-14 rounded-xl bg-sage text-white font-semibold hover:bg-sage-dark transition-colors cursor-pointer"
                >
                  {t("admin.checkin.scanAnother")}
                </button>
              </div>
            </>
          )}

          {phase === "result" && data && (() => {
            const group = outcomeGroup(data.outcome);
            const styles = STATE_STYLES[group];
            return (
              <>
                <div className={cn("p-9 text-center", styles.bg)}>
                  <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-white",
                    group === "valid" && "bg-emerald-600",
                    group === "used" && "bg-amber-600",
                    group === "invalid" && "bg-red-600",
                    group === "schedule" && "bg-blue-600",
                  )}>
                    {group === "valid" && <CheckCircle className="h-8 w-8" />}
                    {group === "used" && <AlertTriangle className="h-7 w-7" />}
                    {group === "invalid" && <XCircle className="h-7 w-7" />}
                    {group === "schedule" && <Clock className="h-7 w-7" />}
                  </div>
                  <p className={cn("font-display text-2xl font-semibold", styles.accent)}>
                    {t(`admin.checkin.result${group.charAt(0).toUpperCase()}${group.slice(1)}Title`)}
                  </p>
                  {data.message && group !== "valid" && (
                    <p className="text-sm text-charcoal-muted mt-2">{data.message}</p>
                  )}
                </div>

                <div className="p-7 space-y-4">
                  {data.ticket && (group === "valid" || group === "used" || group === "schedule") && (
                    <div className="space-y-2 border-t border-sand-dark/30 pt-4">
                      {data.ticket.participantName && (
                        <div className="flex justify-between text-sm">
                          <span className="text-charcoal-muted">{t("admin.checkin.participant")}</span>
                          <span className="font-medium text-charcoal">{data.ticket.participantName}</span>
                        </div>
                      )}
                      {data.ticket.experienceName && (
                        <div className="flex justify-between text-sm">
                          <span className="text-charcoal-muted">{t("admin.checkin.experience")}</span>
                          <span className="font-medium text-charcoal text-right">{data.ticket.experienceName}</span>
                        </div>
                      )}
                      {data.ticket.roomName && (
                        <div className="flex justify-between text-sm">
                          <span className="text-charcoal-muted">{t("admin.checkin.room")}</span>
                          <span className="text-charcoal">{data.ticket.roomName}</span>
                        </div>
                      )}
                      {group === "used" && data.usedAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-charcoal-muted">{t("admin.checkin.previouslyCheckedIn").replace("{date}", "")}</span>
                          <span className="text-charcoal">{formatDateTime(data.usedAt)}</span>
                        </div>
                      )}
                      {group === "schedule" && data.schedule && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-charcoal-muted">{t("admin.checkin.validFrom")}</span>
                            <span className="text-charcoal">{formatDateTime(data.schedule.validFrom)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-charcoal-muted">{t("admin.checkin.validUntil")}</span>
                            <span className="text-charcoal">{formatDateTime(data.schedule.validUntil)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-charcoal-muted">{t("admin.checkin.currentTime")}</span>
                            <span className="text-charcoal">{formatDateTime(data.schedule.now)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {group === "invalid" && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                      {t(`admin.checkin.${invalidReasonKey(data.outcome)}`)}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-2">
                    {group === "valid" && (
                      <button
                        onClick={() => onConfirm(data.ticketCode)}
                        className="w-full h-14 rounded-xl bg-sage text-white font-semibold hover:bg-sage-dark transition-colors cursor-pointer"
                      >
                        {t("admin.checkin.confirmEntry")}
                      </button>
                    )}
                    <div className="flex gap-3">
                      {group === "valid" && data.ticket?.ticketId && (
                        <button
                          onClick={() => onViewDetails(data.ticket.ticketId)}
                          className="flex-1 h-14 rounded-xl border border-sand-dark text-charcoal font-medium hover:bg-warm-gray transition-colors cursor-pointer"
                        >
                          {t("admin.checkin.viewDetails")}
                        </button>
                      )}
                      {group === "invalid" && (
                        <button
                          onClick={onSearchClient}
                          className="flex-1 h-14 rounded-xl border border-sand-dark text-charcoal font-medium hover:bg-warm-gray transition-colors cursor-pointer"
                        >
                          {t("admin.checkin.searchClient")}
                        </button>
                      )}
                      <button
                        onClick={onScanAnother}
                        className="flex-1 h-14 rounded-xl border border-sand-dark text-charcoal font-medium hover:bg-warm-gray transition-colors cursor-pointer"
                      >
                        {t("admin.checkin.scanAnother")}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
