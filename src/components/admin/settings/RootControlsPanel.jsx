import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useSeoAccess } from "@/hooks/useSeoAccess";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/common/Card";
import { ShieldCheck, Loader2 } from "lucide-react";
import { auditAction, captureError } from "@/lib/audit";

export default function RootControlsPanel() {
  const { t } = useLanguage();
  const { enabled, loading, save } = useSeoAccess();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const toggle = async () => {
    setSaving(true);
    setError(false);
    try {
      await save(!enabled);
      auditAction({
        action: "settings.home_seo_admin_access",
        entityType: "settings",
        entityId: "home_seo_admin_enabled",
        details: { enabled: !enabled },
      });
    } catch (err) {
      captureError(err, { source: "admin", context: "home_seo_admin_access" });
      setError(true);
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
          <ShieldCheck className="h-4 w-4 text-charcoal-muted" />
          {t("admin.settings.rootSeoTitle")}
        </CardTitle>
        <CardDescription>{t("admin.settings.rootSeoSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="flex items-center gap-3 min-h-11 cursor-pointer">
          <input
            type="checkbox"
            role="switch"
            checked={enabled}
            disabled={saving}
            onChange={toggle}
            className="h-5 w-5 accent-sage"
          />
          <span className="text-sm font-medium text-charcoal">
            {t("admin.settings.rootSeoToggle")}
          </span>
        </label>
        <p className="text-sm text-charcoal-muted">
          {enabled
            ? t("admin.settings.rootSeoOn")
            : t("admin.settings.rootSeoOff")}
        </p>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {t("admin.settings.rootSeoError")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
