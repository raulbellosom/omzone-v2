import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useLanguage } from "@/hooks/useLanguage";

export default function CreditAdjustForm({ userPass, onSubmit, onClose }) {
  const { t } = useLanguage();
  const [credits, setCredits] = useState(1);
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState("consume"); // consume | restore
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const remaining = userPass.totalCredits - userPass.usedCredits;
  const maxConsume = remaining;
  const maxRestore = userPass.usedCredits;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const val = parseInt(credits, 10);
    if (!val || val < 1) {
      setError(t("admin.creditAdjust.errorMinCredit"));
      return;
    }
    if (mode === "consume" && val > maxConsume) {
      setError(
        t("admin.creditAdjust.errorMaxConsume").replace("{max}", maxConsume),
      );
      return;
    }
    if (mode === "restore" && val > maxRestore) {
      setError(
        t("admin.creditAdjust.errorMaxRestore").replace("{max}", maxRestore),
      );
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        credits: val,
        mode,
        notes: notes.trim(),
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <Card className="w-full max-w-md p-5 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-warm-gray transition-colors"
          aria-label={t("admin.creditAdjust.cancel")}
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-lg font-semibold text-charcoal">
            {t("admin.creditAdjust.title")}
          </h2>
          <p className="text-sm text-charcoal-muted mt-0.5">
            {t("admin.creditAdjust.subtitle")
              .replace("{remaining}", remaining)
              .replace("{total}", userPass.totalCredits)}
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("consume")}
              className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-colors ${
                mode === "consume"
                  ? "border-sage bg-sage/10 text-sage"
                  : "border-sand-dark bg-white text-charcoal-muted hover:bg-warm-gray/30"
              }`}
            >
              {t("admin.creditAdjust.consume")}
            </button>
            <button
              type="button"
              onClick={() => setMode("restore")}
              className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-colors ${
                mode === "restore"
                  ? "border-sage bg-sage/10 text-sage"
                  : "border-sand-dark bg-white text-charcoal-muted hover:bg-warm-gray/30"
              }`}
            >
              {t("admin.creditAdjust.restore")}
            </button>
          </div>

          {/* Credits input */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              {t("admin.creditAdjust.credits")}
            </label>
            <input
              type="number"
              min={1}
              max={mode === "consume" ? maxConsume : maxRestore}
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="h-11 w-full rounded-xl border border-sand-dark bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              {t("admin.creditAdjust.notes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={2}
              className="w-full rounded-xl border border-sand-dark bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 resize-none"
              placeholder={t("admin.creditAdjust.notesPlaceholder")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={submitting}
            >
              {t("admin.creditAdjust.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting
                ? t("admin.common.saving")
                : mode === "consume"
                  ? t("admin.creditAdjust.consumeButton")
                  : t("admin.creditAdjust.restoreButton")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
