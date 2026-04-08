import { useState } from "react";
import Button from "@/components/common/Button";
import { getAllowedOrderTransitions } from "@/hooks/useOrders";
import { useLanguage } from "@/hooks/useLanguage";

const TRANSITION_KEYS = {
  paid: "markAsPaid",
  confirmed: "confirmOrder",
  cancelled: "cancelOrder",
  refunded: "markAsRefunded",
};

export default function StatusTransitionDropdown({
  currentStatus,
  onTransition,
  disabled,
}) {
  const { t } = useLanguage();
  const [showConfirm, setShowConfirm] = useState(null);

  const allowed = getAllowedOrderTransitions(currentStatus);
  if (!allowed.length) return null;

  const label = (next) =>
    t(`admin.orderTransitions.${TRANSITION_KEYS[next]}`) || next;

  const handleConfirm = () => {
    if (showConfirm) {
      onTransition(showConfirm);
      setShowConfirm(null);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-charcoal">
        {t("admin.orderTransitions.changeStatus")}
      </h3>
      <div className="flex flex-wrap gap-2">
        {allowed.map((next) => (
          <Button
            key={next}
            variant={next === "cancelled" ? "destructive" : "outline"}
            size="sm"
            disabled={disabled}
            onClick={() => setShowConfirm(next)}
          >
            {label(next)}
          </Button>
        ))}
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowConfirm(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-base font-semibold text-charcoal">
              {t("admin.orderTransitions.confirmChange")}
            </h3>
            <p className="text-sm text-charcoal-subtle">
              {t("admin.orderTransitions.changeBody")}{" "}
              <strong>{showConfirm}</strong>
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirm(null)}
              >
                {t("admin.orderTransitions.cancelButton")}
              </Button>
              <Button
                variant={
                  showConfirm === "cancelled" ? "destructive" : "default"
                }
                size="sm"
                onClick={handleConfirm}
              >
                {label(showConfirm)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
