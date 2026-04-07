import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

export default function CreditAdjustForm({ userPass, onSubmit, onClose }) {
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
      setError("Ingresa al menos 1 crédito.");
      return;
    }
    if (mode === "consume" && val > maxConsume) {
      setError(`Máximo ${maxConsume} créditos disponibles para consumir.`);
      return;
    }
    if (mode === "restore" && val > maxRestore) {
      setError(`Máximo ${maxRestore} créditos disponibles para restaurar.`);
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
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-lg font-semibold text-charcoal">
            Ajustar créditos
          </h2>
          <p className="text-sm text-charcoal-muted mt-0.5">
            Disponibles: {remaining} / {userPass.totalCredits}
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
              Consumir
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
              Restaurar
            </button>
          </div>

          {/* Credits input */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Créditos
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
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={2}
              className="w-full rounded-xl border border-sand-dark bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 resize-none"
              placeholder="Motivo del ajuste manual..."
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
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting
                ? "Guardando..."
                : mode === "consume"
                  ? "Consumir créditos"
                  : "Restaurar créditos"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
