import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Users,
  AlertTriangle,
  CalendarPlus,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSlots } from "@/hooks/useSlots";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";
import WizardStepWrapper from "./WizardStepWrapper";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";
import { isTierSlotCompatible } from "@/lib/checkoutRules";

function formatDateTime(iso) {
  if (!iso) return "-";
  const date = new Date(iso);
  return (
    date.toLocaleDateString("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    " " +
    date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
  );
}

function SlotCard({ slot, selected, onSelect, t }) {
  const available = Math.max(0, slot.capacity - slot.bookedCount);
  const isFull = available <= 0;
  const isLow = available > 0 && available <= 3;

  return (
    <button
      type="button"
      onClick={() => !isFull && onSelect()}
      disabled={isFull}
      className={cn(
        "w-full text-left rounded-xl border-2 px-4 py-3 transition-all",
        selected
          ? "border-sage bg-sage/5"
          : isFull
            ? "border-sand-dark/30 bg-warm-gray/40 opacity-60 cursor-not-allowed"
            : "border-sand-dark/40 hover:border-sage/50",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-charcoal">
            <Clock className="h-4 w-4 text-charcoal-subtle shrink-0" />
            <span className="truncate">{formatDateTime(slot.startDatetime)}</span>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 mt-1 text-xs",
              isFull
                ? "text-red-500"
                : isLow
                  ? "text-amber-600"
                  : "text-charcoal-muted",
            )}
          >
            {isFull ? (
              <>
                <AlertTriangle className="h-3.5 w-3.5" /> {t("admin.assistedSale.slot.full")}
              </>
            ) : (
              <>
                <Users className="h-3.5 w-3.5" />{" "}
                {t("admin.assistedSale.slot.spotsAvailable").replace(
                  "{count}",
                  String(available),
                )}
              </>
            )}
          </div>
          {slot.notes && (
            <p className="text-xs text-charcoal-muted mt-1 line-clamp-1">
              {slot.notes}
            </p>
          )}
        </div>
        {selected && <CheckCircle2 className="h-5 w-5 text-sage shrink-0" />}
      </div>
    </button>
  );
}

export default function SlotSelectStep({ wizard, setWizardField }) {
  const { t } = useLanguage();
  const [now] = useState(() => new Date().toISOString());
  const { data: slots, loading, error, refetch } = useSlots(wizard.experience?.$id, {
    status: "published",
    dateFrom: now,
  });

  if (!wizard.experience?.requiresSchedule) {
    return (
      <WizardStepWrapper
        title={t("admin.assistedSale.slot.title")}
        description={t("admin.assistedSale.slot.noSlotRequired")}
      >
        <p className="text-sm text-charcoal-muted">
          {t("admin.assistedSale.slot.continueNext")}
        </p>
      </WizardStepWrapper>
    );
  }

  const compatibleSlots = slots.filter((slot) =>
    isTierSlotCompatible(wizard.pricingTier, slot).compatible,
  );

  return (
    <WizardStepWrapper
      title={t("admin.assistedSale.slot.title")}
      description={t("admin.assistedSale.slot.description")}
    >
      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 rounded-full border-2 border-sage border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
          <p className="text-sm text-red-600">{t("admin.assistedSale.slot.loadError")}</p>
          <Button type="button" variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
            {t("admin.assistedSale.slot.retry")}
          </Button>
        </div>
      )}

      {!loading && !error && compatibleSlots.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CalendarPlus className="h-8 w-8 text-charcoal-subtle" />
          <p className="text-sm text-charcoal-muted">
            {t("admin.assistedSale.slot.noCompatibleSlots")}
          </p>
          <p className="text-xs text-charcoal-subtle max-w-sm">
            {t("admin.assistedSale.slot.noSlotsHint")}
          </p>
          <Link
            to={ROUTES.ADMIN_SLOTS}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sage hover:text-sage-dark underline underline-offset-2"
          >
            <CalendarPlus className="h-4 w-4" />
            {t("admin.assistedSale.slot.goToAgenda")}
          </Link>
        </div>
      )}

      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
        {compatibleSlots.map((slot) => (
          <SlotCard
            key={slot.$id}
            slot={slot}
            selected={wizard.slot?.$id === slot.$id}
            onSelect={() => {
              setWizardField("slot", slot);
            }}
            t={t}
          />
        ))}
      </div>
    </WizardStepWrapper>
  );
}
