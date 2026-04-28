import { useState } from "react";
import { Lock, Eye, EyeOff, Check, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import Input from "@/components/common/Input";
import { Button } from "@/components/common/Button";

export default function ChangePasswordForm() {
  const { changePassword, requestPasswordRecovery, user } = useAuth();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [recoverySending, setRecoverySending] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState(null); // "sent" | "error" | null

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess(false);
  }

  async function handleSendRecovery() {
    if (!user?.email) return;
    setRecoverySending(true);
    setRecoveryStatus(null);
    try {
      await requestPasswordRecovery(user.email);
      setRecoveryStatus("sent");
    } catch {
      setRecoveryStatus("error");
    } finally {
      setRecoverySending(false);
    }
  }

  const eyeToggle = (
    <button
      type="button"
      tabIndex={-1}
      onClick={() => setShowPasswords((v) => !v)}
      className="text-charcoal-subtle hover:text-charcoal transition-colors"
      aria-label={
        showPasswords
          ? t("auth.login.hidePassword")
          : t("auth.login.showPassword")
      }
    >
      {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.currentPassword) {
      setError(t("auth.changePassword.errorCurrentRequired"));
      return;
    }
    if (form.newPassword.length < 8) {
      setError(t("auth.changePassword.errorPasswordShort"));
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError(t("auth.changePassword.errorMismatch"));
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(form.currentPassword, form.newPassword);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      if (err?.code === 401) {
        setError(t("auth.changePassword.errorWrongPassword"));
      } else {
        setError(t("auth.changePassword.errorGeneric"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
          {t("auth.changePassword.currentLabel")}
        </label>
        <Input
          type={showPasswords ? "text" : "password"}
          icon={Lock}
          rightElement={eyeToggle}
          value={form.currentPassword}
          onChange={(e) => handleChange("currentPassword", e.target.value)}
          placeholder={t("auth.changePassword.currentPlaceholder")}
          autoComplete="current-password"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
          {t("auth.changePassword.newLabel")}
        </label>
        <Input
          type={showPasswords ? "text" : "password"}
          icon={Lock}
          rightElement={eyeToggle}
          value={form.newPassword}
          onChange={(e) => handleChange("newPassword", e.target.value)}
          placeholder={t("auth.changePassword.newPlaceholder")}
          autoComplete="new-password"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
          {t("auth.changePassword.confirmLabel")}
        </label>
        <Input
          type={showPasswords ? "text" : "password"}
          icon={Lock}
          rightElement={eyeToggle}
          value={form.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          placeholder={t("auth.changePassword.confirmPlaceholder")}
          autoComplete="new-password"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? t("auth.changePassword.submitting")
            : t("auth.changePassword.submit")}
        </Button>
        {success && (
          <span className="inline-flex items-center gap-1 text-sm text-sage font-medium animate-in fade-in">
            <Check className="w-4 h-4" />
            {t("auth.changePassword.success")}
          </span>
        )}
      </div>

      {/* Recovery via email */}
      <div className="pt-3 mt-1 border-t border-warm-gray/50">
        <p className="text-xs text-charcoal-muted mb-2.5">
          {t("auth.changePassword.sendRecoveryHelper")}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={recoverySending}
            onClick={handleSendRecovery}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-muted hover:text-charcoal border border-warm-gray rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
          >
            <Mail size={14} />
            {recoverySending
              ? t("auth.changePassword.sendRecoverySending")
              : t("auth.changePassword.sendRecoveryButton")}
          </button>
          {recoveryStatus === "sent" && (
            <span className="inline-flex items-center gap-1 text-xs text-sage font-medium animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              {t("auth.changePassword.sendRecoverySent")}
            </span>
          )}
          {recoveryStatus === "error" && (
            <span className="text-xs text-red-500">
              {t("auth.changePassword.sendRecoveryError")}
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
