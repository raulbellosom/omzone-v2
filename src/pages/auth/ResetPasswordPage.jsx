import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Lock, Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { ROUTES } from "@/constants/routes";

export default function ResetPasswordPage() {
  const { confirmPasswordRecovery } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const eyeToggle = (
    <button
      type="button"
      tabIndex={-1}
      onClick={() => setShowPassword((v) => !v)}
      className="text-charcoal-subtle hover:text-charcoal transition-colors"
      aria-label={
        showPassword
          ? t("auth.login.hidePassword")
          : t("auth.login.showPassword")
      }
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("auth.resetPassword.errorPasswordShort"));
      return;
    }
    if (password !== confirmPw) {
      setError(t("auth.resetPassword.errorMismatch"));
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordRecovery(userId, secret, password);
      setDone(true);
    } catch {
      setError(t("auth.resetPassword.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  // Invalid link
  if (!userId || !secret) {
    return (
      <>
        <Helmet>
          <title>{t("auth.resetPassword.pageTitle")}</title>
        </Helmet>
        <div className="mx-auto max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
            <Link to={ROUTES.HOME} className="inline-block">
              <span className="font-display text-3xl font-bold text-white tracking-widest">
                OMZONE
              </span>
            </Link>
          </div>
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl border border-white/40 shadow-premium p-6 sm:p-8 text-center">
            <h1 className="font-display text-xl font-semibold text-charcoal mb-3">
              {t("auth.resetPassword.invalidLinkHeading")}
            </h1>
            <p className="text-sm text-charcoal-muted mb-6">
              {t("auth.resetPassword.invalidLinkMessage")}
            </p>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-sm text-sage-dark font-medium hover:text-sage transition-colors"
            >
              {t("auth.resetPassword.requestNewLink")}
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t("auth.resetPassword.pageTitle")}</title>
      </Helmet>

      <div className="mx-auto max-w-md animate-fade-in-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-block">
            <span className="font-display text-3xl font-bold text-white tracking-widest">
              OMZONE
            </span>
          </Link>
          <p className="mt-2 text-sm text-white/60 tracking-wide">
            {t("auth.brandTagline")}
          </p>
        </div>

        {/* Glass card */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl border border-white/40 shadow-premium p-6 sm:p-8 md:p-10">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 text-xs text-charcoal-subtle hover:text-charcoal transition-colors mb-5"
          >
            <ArrowLeft size={14} />
            {t("auth.forgotPassword.backToLogin")}
          </Link>

          {done ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-sage/10 text-sage flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6" />
              </div>
              <h1 className="font-display text-2xl font-semibold text-charcoal mb-2">
                {t("auth.resetPassword.doneHeading")}
              </h1>
              <p className="text-sm text-charcoal-muted mb-6">
                {t("auth.resetPassword.doneMessage")}
              </p>
              <Button
                onClick={() => navigate(ROUTES.LOGIN)}
                size="lg"
                className="w-full"
              >
                {t("auth.resetPassword.goToLogin")}
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-display text-2xl font-semibold text-charcoal">
                  {t("auth.resetPassword.heading")}
                </h1>
                <p className="text-sm text-charcoal-muted mt-1">
                  {t("auth.resetPassword.subtitle")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="rp-pass"
                    className="text-sm font-medium text-charcoal"
                  >
                    {t("auth.resetPassword.newPasswordLabel")}
                  </label>
                  <Input
                    id="rp-pass"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
                    icon={Lock}
                    rightElement={eyeToggle}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="rp-confirm"
                    className="text-sm font-medium text-charcoal"
                  >
                    {t("auth.resetPassword.confirmPasswordLabel")}
                  </label>
                  <Input
                    id="rp-confirm"
                    type={showPassword ? "text" : "password"}
                    placeholder={t(
                      "auth.resetPassword.confirmPasswordPlaceholder",
                    )}
                    icon={Lock}
                    value={confirmPw}
                    onChange={(e) => {
                      setConfirmPw(e.target.value);
                      if (error) setError("");
                    }}
                    required
                    autoComplete="new-password"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500" role="alert">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting
                    ? t("auth.resetPassword.submitting")
                    : t("auth.resetPassword.submit")}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
