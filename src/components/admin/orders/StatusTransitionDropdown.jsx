import { useState } from "react";
import Button from "@/components/common/Button";
import { getAllowedOrderTransitions } from "@/hooks/useOrders";

const TRANSITION_LABELS = {
  paid: "Mark as Paid",
  confirmed: "Confirm",
  cancelled: "Cancel",
  refunded: "Mark as Refunded",
};

export default function StatusTransitionDropdown({ currentStatus, onTransition, disabled }) {
  const [showConfirm, setShowConfirm] = useState(null);

  const allowed = getAllowedOrderTransitions(currentStatus);
  if (!allowed.length) return null;

  const handleConfirm = () => {
    if (showConfirm) {
      onTransition(showConfirm);
      setShowConfirm(null);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-charcoal">Change status</h3>
      <div className="flex flex-wrap gap-2">
        {allowed.map((next) => (
          <Button
            key={next}
            variant={next === "cancelled" ? "destructive" : "outline"}
            size="sm"
            disabled={disabled}
            onClick={() => setShowConfirm(next)}
          >
            {TRANSITION_LABELS[next] || next}
          </Button>
        ))}
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-base font-semibold text-charcoal">Confirm status change</h3>
            <p className="text-sm text-charcoal-subtle">
              Change order status from <strong>{currentStatus}</strong> to{" "}
              <strong>{showConfirm}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setShowConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant={showConfirm === "cancelled" ? "destructive" : "default"}
                size="sm"
                onClick={handleConfirm}
              >
                {TRANSITION_LABELS[showConfirm] || showConfirm}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
