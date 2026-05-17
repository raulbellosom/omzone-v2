import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { isValidPhone, sanitizePhone } from "@/lib/utils";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import PhoneInput from "@/components/common/PhoneInput";
import PasswordStrengthMeter from "@/components/common/PasswordStrengthMeter";
import { ROUTES } from "@/constants/routes";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [termsError, setTermsError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
    if (e.target.name === "phone") setPhoneError("");
  }

  function handlePhoneBlur() {
    if (form.phone.trim() && !isValidPhone(form.phone)) {
      setPhoneError(t("common.phoneError"));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim() || !form.password) return;

    if (form.phone.trim() && !isValidPhone(form.phone)) {
      setPhoneError(t("common.phoneError"));
      return;
    }

    if (!termsAccepted) {
      setTermsError(t("auth.register.termsError"));
      return;
    }
    setTermsError("");

    const fullName = [form.firstName.trim(), form.lastName.trim()]
      .filter(Boolean)
      .join(" ");

    setError("");
    setSubmitting(true);
    try {
      const result = await register(
        fullName,
        form.email.trim(),
        form.password,
        sanitizePhone(form.phone) || undefined,
      );
      navigate(ROUTES.VERIFY_EMAIL_PENDING, {
        replace: true,
        state: {
          email: form.email.trim(),
          _vp: form.password,
          verificationFailed: !result?.verificationSent,
        },
      });
      return;
    } catch (err) {
      const msg = err?.message ?? "";
      if (
        msg.includes("already") ||
        msg.includes("exists") ||
        err?.code === 409
      ) {
        setError(t("auth.register.errorAlreadyExists"));
      } else if (msg.includes("password") || err?.code === 400) {
        setError(t("auth.register.errorPasswordShort"));
      } else {
        setError(t("auth.register.errorGeneric"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  const eyeToggle = (
    <button
      type="button"
      tabIndex={-1}
      onClick={() => setShowPassword((v) => !v)}
      disabled={submitting}
      className="text-charcoal-subtle hover:text-charcoal transition-colors disabled:opacity-40 disabled:pointer-events-none"
      aria-label={
        showPassword
          ? t("auth.register.hidePassword")
          : t("auth.register.showPassword")
      }
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  return (
    <>
      <Helmet>
        <title>{t("auth.register.pageTitle")}</title>
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
          {/* Back to home — inside card */}
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-1.5 text-xs text-charcoal-subtle hover:text-charcoal transition-colors mb-5"
          >
            <ArrowLeft size={14} />
            {t("auth.backToOmzone")}
          </Link>

          <div className="mb-6">
            <h1 className="font-display text-2xl font-semibold text-charcoal">
              {t("auth.register.heading")}
            </h1>
            <p className="text-sm text-charcoal-muted mt-1">
              {t("auth.register.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First name / Last name — side by side on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="register-firstName"
                  className="text-sm font-medium text-charcoal"
                >
                  {t("auth.register.firstNameLabel")}
                </label>
                <Input
                  id="register-firstName"
                  name="firstName"
                  type="text"
                  placeholder={t("auth.register.firstNamePlaceholder")}
                  icon={User}
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                  disabled={submitting}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="register-lastName"
                  className="text-sm font-medium text-charcoal"
                >
                  {t("auth.register.lastNameLabel")}
                </label>
                <Input
                  id="register-lastName"
                  name="lastName"
                  type="text"
                  placeholder={t("auth.register.lastNamePlaceholder")}
                  value={form.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-email"
                className="text-sm font-medium text-charcoal"
              >
                {t("auth.register.emailLabel")}
              </label>
              <Input
                id="register-email"
                name="email"
                type="email"
                placeholder={t("auth.register.emailPlaceholder")}
                icon={Mail}
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-phone"
                className="text-sm font-medium text-charcoal"
              >
                {t("auth.register.phoneLabel")}{" "}
                <span className="text-charcoal-subtle font-normal">
                  {t("auth.register.phoneOptional")}
                </span>
              </label>
              <PhoneInput
                id="register-phone"
                value={form.phone}
                onChange={(val) => {
                  setForm((prev) => ({ ...prev, phone: val }));
                  setPhoneError("");
                }}
                onBlur={handlePhoneBlur}
                disabled={submitting}
              />
              {phoneError && (
                <p className="text-xs text-red-500 mt-1">{phoneError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-password"
                className="text-sm font-medium text-charcoal"
              >
                {t("auth.register.passwordLabel")}
              </label>
              <Input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.register.passwordPlaceholder")}
                icon={Lock}
                rightElement={eyeToggle}
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
                disabled={submitting}
              />
              <PasswordStrengthMeter password={form.password} />
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  id="register-terms"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) setTermsError("");
                  }}
                  disabled={submitting}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-charcoal/30 text-sage accent-sage disabled:opacity-40 cursor-pointer"
                />
                <span className="text-sm text-charcoal-muted leading-snug">
                  {t("auth.register.termsPrefix")}{" "}
                  <Link
                    to={ROUTES.TERMS}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sage-dark font-medium hover:text-sage underline underline-offset-2 transition-colors"
                    tabIndex={submitting ? -1 : undefined}
                  >
                    {t("auth.register.termsLink")}
                  </Link>{" "}
                  {t("auth.register.termsAnd")}{" "}
                  <Link
                    to={ROUTES.PRIVACY}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sage-dark font-medium hover:text-sage underline underline-offset-2 transition-colors"
                    tabIndex={submitting ? -1 : undefined}
                  >
                    {t("auth.register.privacyLink")}
                  </Link>{" "}
                  {t("auth.register.termsSuffix")}
                </span>
              </label>
              {termsError && (
                <p className="text-xs text-red-500 pl-7" role="alert">
                  {termsError}
                </p>
              )}
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
              loading={submitting}
            >
              {submitting
                ? t("auth.register.submitting")
                : t("auth.register.submit")}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-charcoal/10 text-center">
            <p className="text-sm text-charcoal-muted">
              {t("auth.register.hasAccount")}{" "}
              <Link
                to={ROUTES.LOGIN}
                className="text-sage-dark font-medium hover:text-sage transition-colors"
              >
                {t("auth.register.signIn")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
