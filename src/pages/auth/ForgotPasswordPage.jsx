import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Mail, ArrowLeft, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { ROUTES } from "@/constants/routes";

export default function ForgotPasswordPage() {
  const { requestPasswordRecovery } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setSubmitting(true);
    try {
      await requestPasswordRecovery(email.trim());
      setSent(true);
    } catch {
      setError(t("auth.forgotPassword.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>{t("auth.forgotPassword.pageTitle")}</title>
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

          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-sage/10 text-sage flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6" />
              </div>
              <h1 className="font-display text-2xl font-semibold text-charcoal mb-2">
                {t("auth.forgotPassword.sentHeading")}
              </h1>
              <p className="text-sm text-charcoal-muted mb-1">
                {t("auth.forgotPassword.sentMessageTo")}{" "}
                <strong className="text-charcoal">{email}</strong>
              </p>
              <p className="text-sm text-charcoal-muted mb-6">
                {t("auth.forgotPassword.sentMessageAction")}
              </p>
              <Link
                to={ROUTES.LOGIN}
                className="text-sm text-sage-dark font-medium hover:text-sage transition-colors"
              >
                {t("auth.forgotPassword.backToLogin")}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-display text-2xl font-semibold text-charcoal">
                  {t("auth.forgotPassword.heading")}
                </h1>
                <p className="text-sm text-charcoal-muted mt-1">
                  {t("auth.forgotPassword.subtitle")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="fp-email"
                    className="text-sm font-medium text-charcoal"
                  >
                    {t("auth.forgotPassword.emailLabel")}
                  </label>
                  <Input
                    id="fp-email"
                    name="email"
                    type="email"
                    placeholder={t("auth.forgotPassword.emailPlaceholder")}
                    icon={Mail}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    required
                    autoComplete="email"
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
                    ? t("auth.forgotPassword.submitting")
                    : t("auth.forgotPassword.submit")}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-charcoal/10 text-center">
                <p className="text-sm text-charcoal-muted">
                  {t("auth.forgotPassword.rememberPassword")}{" "}
                  <Link
                    to={ROUTES.LOGIN}
                    className="text-sage-dark font-medium hover:text-sage transition-colors"
                  >
                    {t("auth.forgotPassword.signIn")}
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
