import { useState, useRef } from "react";
import { useValidateTicket } from "@/hooks/useValidateTicket";
import { useLanguage } from "@/hooks/useLanguage";
import CheckInResult from "@/components/admin/checkin/CheckInResult";
import Button from "@/components/common/Button";
import { ScanLine, RotateCcw } from "lucide-react";

const MAX_HISTORY = 10;

export default function CheckInPage() {
  const [ticketCode, setTicketCode] = useState("");
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);
  const { validate, result, loading, error, reset } = useValidateTicket();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const entry = await validate(ticketCode);
    if (entry) {
      setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
      setTicketCode("");
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    reset();
    setTicketCode("");
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-sage/10 flex items-center justify-center">
          <ScanLine className="h-5 w-5 text-sage" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-charcoal">
            {t("admin.checkin.title")}
          </h1>
          <p className="text-sm text-charcoal-muted">
            {t("admin.checkin.subtitle")}
          </p>
        </div>
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm p-6 space-y-4"
      >
        <label
          htmlFor="ticket-code-input"
          className="block text-sm font-medium text-charcoal"
        >
          {t("admin.checkin.ticketCode")}
        </label>
        <div className="flex gap-3">
          <input
            ref={inputRef}
            id="ticket-code-input"
            type="text"
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value)}
            placeholder={t("admin.checkin.placeholder")}
            autoFocus
            autoComplete="off"
            className="flex-1 h-12 rounded-xl border border-sand-dark bg-white px-4 text-charcoal font-mono text-sm placeholder:text-charcoal-muted/40 focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
          />
          <Button
            type="submit"
            size="lg"
            disabled={loading || !ticketCode.trim()}
          >
            {loading
              ? t("admin.checkin.validating")
              : t("admin.checkin.validate")}
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {/* Latest result */}
      {result && (
        <div className="space-y-2">
          <CheckInResult result={result} />
          <div className="flex justify-end">
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal cursor-pointer transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t("admin.checkin.clear")}
            </button>
          </div>
        </div>
      )}

      {/* Session history */}
      {history.length > 1 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider">
            {t("admin.checkin.recentCheckins")}
          </h2>
          <div className="space-y-2">
            {history.slice(1).map((entry, idx) => (
              <div
                key={`${entry.ticketCode}-${idx}`}
                className={`rounded-xl border px-4 py-3 text-sm flex items-center justify-between ${
                  entry.success
                    ? "bg-emerald-50/50 border-emerald-200/60 text-emerald-800"
                    : "bg-red-50/50 border-red-200/60 text-red-800"
                }`}
              >
                <span className="font-mono text-xs">{entry.ticketCode}</span>
                <span className="text-xs">
                  {entry.success ? "✓ Valid" : `✗ ${entry.message}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
