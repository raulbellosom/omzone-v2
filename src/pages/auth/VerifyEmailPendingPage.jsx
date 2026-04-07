import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MailCheck } from "lucide-react";
import { account } from "@/lib/appwrite";
import { useLanguage } from "@/hooks/useLanguage";
import Button from "@/components/common/Button";
import { ROUTES } from "@/constants/routes";

const COOLDOWN_SECONDS = 60;
const VERIFY_URL = `${window.location.origin}/verify-email`;

export default function VerifyEmailPendingPage() {
  const location = useLocation();
  const { t } = useLanguage();
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
      await account.createVerification(VERIFY_URL);
      setFeedback(t("auth.verifyPending.resendSuccess"));
      setCooldown(COOLDOWN_SECONDS);
    } catch {
      setFeedback(t("auth.verifyPending.resendError"));
    } finally {
      setResending(false);
    }
  }, [cooldown, resending, t]);

  return (
    <>
      <Helmet>
        <title>{t("auth.verifyPending.pageTitle")}</title>
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
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl border border-white/40 shadow-premium p-8 sm:p-10 text-center">
          {/* Animated icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sage/10 animate-scale-in">
            <MailCheck size={36} className="text-sage-dark" strokeWidth={1.5} />
          </div>

          <h1 className="font-display text-2xl font-semibold text-charcoal mb-2">
            {t("auth.verifyPending.heading")}
          </h1>

          <p className="text-sm text-charcoal-muted leading-relaxed">
            {email ? (
              <>
                {t("auth.verifyPending.messageTo")}{" "}
                <span className="font-medium text-charcoal">{email}</span>
              </>
            ) : (
              t("auth.verifyPending.messageGeneric")
            )}
            {t("auth.verifyPending.messageAction")}
          </p>

          {/* Spam notice */}
          <div className="mt-5 rounded-xl bg-cream-dark/60 px-4 py-3">
            <p className="text-xs text-charcoal-muted leading-relaxed">
              {t("auth.verifyPending.spamNotice")}{" "}
              <span className="font-medium text-charcoal">{t("auth.verifyPending.spam")}</span>{" "}
              {t("auth.verifyPending.orPromotions")}{" "}
              <span className="font-medium text-charcoal">{t("auth.verifyPending.promotions")}</span>{" "}
              {t("auth.verifyPending.folder")}
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
                ? t("auth.verifyPending.resending")
                : cooldown > 0
                  ? t("auth.verifyPending.resendCooldown").replace("{{seconds}}", cooldown)
                  : t("auth.verifyPending.resendButton")}
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
              {t("auth.verifyPending.backToSignIn")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
