import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, XCircle } from "lucide-react";
import { account } from "@/lib/appwrite";
import Button from "@/components/common/Button";
import { ROUTES } from "@/constants/routes";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");

    if (!userId || !secret) {
      setStatus("error");
      return;
    }

    account
      .updateVerification(userId, secret)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [searchParams]);

  return (
    <>
      <Helmet>
        <title>
          {status === "success" ? "Email Verified" : "Verify Email"} — OMZONE
        </title>
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
          {status === "loading" && (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                <div className="h-10 w-10 rounded-full border-2 border-sage border-t-transparent animate-spin" />
              </div>
              <h1 className="font-display text-2xl font-semibold text-charcoal">
                Verifying your email…
              </h1>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sage/10 animate-scale-in">
                <CheckCircle2
                  size={36}
                  className="text-sage-dark"
                  strokeWidth={1.5}
                />
              </div>
              <h1 className="font-display text-2xl font-semibold text-charcoal mb-2">
                Email verified!
              </h1>
              <p className="text-sm text-charcoal-muted leading-relaxed">
                Your account is now active. Sign in to begin your wellness
                journey.
              </p>
              <div className="mt-6">
                <Link to={ROUTES.LOGIN}>
                  <Button size="lg" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 animate-scale-in">
                <XCircle
                  size={36}
                  className="text-red-400"
                  strokeWidth={1.5}
                />
              </div>
              <h1 className="font-display text-2xl font-semibold text-charcoal mb-2">
                Verification failed
              </h1>
              <p className="text-sm text-charcoal-muted leading-relaxed">
                The verification link may be expired or invalid. Please try
                signing in to receive a new verification email.
              </p>
              <div className="mt-6">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="outline" size="lg" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
