import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useCheckInSettings } from "@/hooks/useCheckInSettings";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/common/Card";
import { Clock, Loader2 } from "lucide-react";
import { auditAction, captureError } from "@/lib/audit";

const MIN_MINUTES = 0;
const MAX_MINUTES = 1440;

function clampMinutes(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return MIN_MINUTES;
  return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, parsed));
}

export default function CheckInWindowPanel() {
  const { t } = useLanguage();
  const { beforeMinutes, afterMinutes, loading, error, save } =
    useCheckInSettings();

  const [beforeInput, setBeforeInput] = useState(beforeMinutes);
  const [afterInput, setAfterInput] = useState(afterMinutes);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState(null); // "success" | "error" | null

  useEffect(() => {
    setBeforeInput(beforeMinutes);
    setAfterInput(afterMinutes);
  }, [beforeMinutes, afterMinutes]);

  const handleSave = async () => {
    setSaving(true);
    setSaveState(null);
    try {
      const values = {
        beforeMinutes: clampMinutes(beforeInput),
        afterMinutes: clampMinutes(afterInput),
      };
      await save(values);
      auditAction({
        action: "settings.checkin_window_update",
        entityType: "settings",
        entityId: "checkin_window",
        details: values,
      });
      setSaveState("success");
    } catch (err) {
      captureError(err, { source: "admin", context: "checkin_window_save" });
      setSaveState("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-10 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-charcoal-muted" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-charcoal-muted" />
          {t("admin.settings.checkinWindowTitle")}
        </CardTitle>
        <CardDescription>
          {t("admin.settings.checkinWindowSubtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-red-700">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            {t("admin.settings.checkinBeforeMinutesLabel")}
          </label>
          <input
            type="number"
            min={MIN_MINUTES}
            max={MAX_MINUTES}
            value={beforeInput}
            onChange={(e) => setBeforeInput(e.target.value)}
            disabled={saving}
            className="w-full max-w-xs rounded-lg border border-sand-dark px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            {t("admin.settings.checkinAfterMinutesLabel")}
          </label>
          <input
            type="number"
            min={MIN_MINUTES}
            max={MAX_MINUTES}
            value={afterInput}
            onChange={(e) => setAfterInput(e.target.value)}
            disabled={saving}
            className="w-full max-w-xs rounded-lg border border-sand-dark px-3 py-2 text-sm"
          />
        </div>
        {saveState === "success" && (
          <p className="text-sm text-emerald-700">
            {t("admin.settings.checkinSaveSuccess")}
          </p>
        )}
        {saveState === "error" && (
          <p className="text-sm text-red-700">
            {t("admin.settings.checkinSaveError")}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-11 px-6 rounded-xl bg-sage text-white font-semibold hover:bg-sage-dark transition-colors cursor-pointer disabled:opacity-50"
        >
          {saving
            ? t("admin.settings.checkinSaving")
            : t("admin.settings.checkinSaveButton")}
        </button>
      </CardFooter>
    </Card>
  );
}
