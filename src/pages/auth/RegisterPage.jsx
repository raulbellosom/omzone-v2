import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { User, Mail, Lock, Phone, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import PasswordStrengthMeter from "@/components/common/PasswordStrengthMeter";
import { ROUTES } from "@/constants/routes";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim() || !form.password) return;

    const fullName = [form.firstName.trim(), form.lastName.trim()]
      .filter(Boolean)
      .join(" ");

    setError("");
    setSubmitting(true);
    try {
      await register(
        fullName,
        form.email.trim(),
        form.password,
        form.phone.trim() || undefined,
      );
      navigate(ROUTES.VERIFY_EMAIL_PENDING, { replace: true });
    } catch (err) {
      const msg = err?.message ?? "";
      if (
        msg.includes("already") ||
        msg.includes("exists") ||
        err?.code === 409
      ) {
        setError("An account with this email already exists.");
      } else if (msg.includes("password") || err?.code === 400) {
        setError("Password must be at least 8 characters.");
      } else {
        setError("Something went wrong. Please try again.");
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
      className="text-charcoal-subtle hover:text-charcoal transition-colors"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  return (
    <>
      <Helmet>
        <title>Create Account — OMZONE</title>
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
            Wellness Experiences
          </p>
        </div>

        {/* Glass card */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl border border-white/40 shadow-premium p-8 sm:p-10">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-semibold text-charcoal">
              Create your account
            </h1>
            <p className="text-sm text-charcoal-muted mt-1">
              Begin your wellness journey
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
                  First name
                </label>
                <Input
                  id="register-firstName"
                  name="firstName"
                  type="text"
                  placeholder="First name"
                  icon={User}
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="register-lastName"
                  className="text-sm font-medium text-charcoal"
                >
                  Last name
                </label>
                <Input
                  id="register-lastName"
                  name="lastName"
                  type="text"
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-email"
                className="text-sm font-medium text-charcoal"
              >
                Email
              </label>
              <Input
                id="register-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-phone"
                className="text-sm font-medium text-charcoal"
              >
                Phone{" "}
                <span className="text-charcoal-subtle font-normal">
                  (optional)
                </span>
              </label>
              <Input
                id="register-phone"
                name="phone"
                type="tel"
                placeholder="+52 55 1234 5678"
                icon={Phone}
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-password"
                className="text-sm font-medium text-charcoal"
              >
                Password
              </label>
              <Input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                icon={Lock}
                rightElement={eyeToggle}
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <PasswordStrengthMeter password={form.password} />
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
              {submitting ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-charcoal/10 text-center">
            <p className="text-sm text-charcoal-muted">
              Already have an account?{" "}
              <Link
                to={ROUTES.LOGIN}
                className="text-sage-dark font-medium hover:text-sage transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link
            to={ROUTES.HOME}
            className="text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            &larr; Back to OMZONE
          </Link>
        </div>
      </div>
    </>
  );
}
