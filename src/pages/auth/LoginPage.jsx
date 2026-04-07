import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { ROUTES } from "@/constants/routes";

export default function LoginPage() {
  const { login, getLandingRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email.trim() || !form.password) return;

    setError("");
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      const from = location.state?.from?.pathname;
      navigate(from || getLandingRoute(), { replace: true });
    } catch (err) {
      if (err?.type === "email_not_verified") {
        navigate(ROUTES.VERIFY_EMAIL_PENDING, {
          replace: true,
          state: { email: form.email.trim() },
        });
        return;
      }
      setError("Invalid credentials. Please try again.");
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
        <title>Sign In — OMZONE</title>
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
              Welcome back
            </h1>
            <p className="text-sm text-charcoal-muted mt-1">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-sm font-medium text-charcoal"
              >
                Email
              </label>
              <Input
                id="login-email"
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
                htmlFor="login-password"
                className="text-sm font-medium text-charcoal"
              >
                Password
              </label>
              <Input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                icon={Lock}
                rightElement={eyeToggle}
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
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
              {submitting ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-charcoal/10 text-center">
            <p className="text-sm text-charcoal-muted">
              Don&apos;t have an account?{" "}
              <Link
                to={ROUTES.REGISTER}
                className="text-sage-dark font-medium hover:text-sage transition-colors"
              >
                Create one
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
