import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MailCheck } from "lucide-react";
import { account } from "@/lib/appwrite";
import Button from "@/components/common/Button";
import { ROUTES } from "@/constants/routes";

const COOLDOWN_SECONDS = 60;
const VERIFY_URL = `${window.location.origin}/verify-email`;

export default function VerifyEmailPendingPage() {
  const location = useLocation();
  const email = location.state?.email || "";

  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setFeedback("");
    try {
      // Need a temporary session to resend — user provides email but we can't
      // create a session without password. Instead we inform them to check spam.
      // If we already have a session (came from login flow), try directly.
      await account.createVerification(VERIFY_URL);
      setFeedback("Verification email sent! Check your inbox.");
      setCooldown(COOLDOWN_SECONDS);
    } catch {
      setFeedback(
        "Could not resend. Please try signing in again to trigger a new verification email.",
      );
    } finally {
      setResending(false);
    }
  }, [cooldown, resending]);

  return (
    <>
      <Helmet>
        <title>Verify Your Email — OMZONE</title>
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
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl border border-white/40 shadow-premium p-8 sm:p-10 text-center">
          {/* Animated icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sage/10 animate-scale-in">
            <MailCheck size={36} className="text-sage-dark" strokeWidth={1.5} />
          </div>

          <h1 className="font-display text-2xl font-semibold text-charcoal mb-2">
            Check your email
          </h1>

          <p className="text-sm text-charcoal-muted leading-relaxed">
            We&apos;ve sent a verification link
            {email ? (
              <>
                {" "}
                to <span className="font-medium text-charcoal">{email}</span>
              </>
            ) : (
              " to your email address"
            )}
            . Click the link to activate your account.
          </p>

          {/* Spam notice */}
          <div className="mt-5 rounded-xl bg-cream-dark/60 px-4 py-3">
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Don&apos;t see it? Check your{" "}
              <span className="font-medium text-charcoal">spam</span> or{" "}
              <span className="font-medium text-charcoal">promotions</span>{" "}
              folder.
            </p>
          </div>

          {/* Resend */}
          <div className="mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="min-w-[160px]"
            >
              {resending
                ? "Sending…"
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend verification email"}
            </Button>
          </div>

          {feedback && (
            <p className="mt-3 text-xs text-charcoal-muted">{feedback}</p>
          )}

          {/* Back to login */}
          <div className="mt-8 pt-6 border-t border-charcoal/10">
            <Link
              to={ROUTES.LOGIN}
              className="text-sm text-sage-dark font-medium hover:text-sage transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
