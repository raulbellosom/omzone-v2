import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck } from "lucide-react";
import { getStripe } from "@/lib/stripe";
import { Button } from "@/components/common/Button";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";

// ─── Stripe appearance matching OMZONE theme ─────────────────────────────────

const appearance = {
  theme: "stripe",
  variables: {
    fontFamily: '"Inter", sans-serif',
    fontSizeBase: "14px",
    colorPrimary: "#7c8c6e",
    colorBackground: "#ffffff",
    colorText: "#2c2c2c",
    colorTextSecondary: "#6b6b6b",
    colorTextPlaceholder: "#9b9b9b",
    colorDanger: "#dc2626",
    borderRadius: "10px",
    spacingUnit: "4px",
    spacingGridRow: "16px",
  },
  rules: {
    ".Input": {
      border: "1px solid #d6cfc5",
      boxShadow: "none",
      padding: "10px 12px",
    },
    ".Input:focus": {
      border: "1px solid #7c8c6e",
      boxShadow: "0 0 0 1px #7c8c6e",
    },
    ".Label": {
      fontWeight: "500",
      fontSize: "13px",
      marginBottom: "6px",
    },
  },
};

// ─── Inner form (must be inside <Elements>) ──────────────────────────────────

function PaymentForm({ indicativeTotal, currency, orderId, submitting: externalSubmitting }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [consentChecked, setConsentChecked] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [elementReady, setElementReady] = useState(false);

  const formattedAmount = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(indicativeTotal);
  }, [indicativeTotal, currency]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!stripe || !elements) return;

    if (!consentChecked) {
      setError(t("paymentStep.consentRequired"));
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${ROUTES.CHECKOUT_SUCCESS}?order_id=${orderId}`,
      },
    });

    // If we get here, there was an error (successful redirects don't return)
    if (stripeError) {
      if (stripeError.type === "card_error" || stripeError.type === "validation_error") {
        setError(stripeError.message);
      } else {
        setError(t("paymentStep.errorGeneric"));
      }
    }

    setProcessing(false);
  }

  const isSubmitDisabled = !stripe || !elements || processing || externalSubmitting || !elementReady;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="min-h-50">
        {!elementReady && (
          <div className="flex items-center justify-center py-10 text-charcoal-subtle text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("paymentStep.initializing")}
          </div>
        )}
        <PaymentElement
          onReady={() => setElementReady(true)}
          options={{ layout: "tabs" }}
        />
      </div>

      {/* Consent checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={(e) => {
            setConsentChecked(e.target.checked);
            if (e.target.checked && error === t("paymentStep.consentRequired")) {
              setError(null);
            }
          }}
          className="mt-0.5 h-4 w-4 rounded border-warm-gray-dark text-sage focus:ring-sage shrink-0"
        />
        <span className="text-xs text-charcoal-muted leading-relaxed">
          <ConsentText t={t} />
        </span>
      </label>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitDisabled}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("paymentStep.processing")}
          </span>
        ) : (
          t("paymentStep.payButton", { amount: `${formattedAmount} ${currency}` })
        )}
      </Button>

      {/* Stripe disclosure */}
      <div className="flex items-center justify-center gap-2 text-xs text-charcoal-subtle">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        <span>{t("paymentStep.stripeDisclosure")}</span>
      </div>
    </form>
  );
}

// ─── Consent text with embedded links ────────────────────────────────────────

function ConsentText({ t }) {
  const { language } = useLanguage();

  if (language === "es") {
    return (
      <>
        Acepto los{" "}
        <Link to={ROUTES.TERMS} className="underline text-sage-dark hover:text-sage" target="_blank">
          Términos de Servicio
        </Link>
        , el{" "}
        <Link to={ROUTES.PRIVACY} className="underline text-sage-dark hover:text-sage" target="_blank">
          Aviso de Privacidad
        </Link>
        {" "}y la{" "}
        <Link to={ROUTES.REFUND_POLICY} className="underline text-sage-dark hover:text-sage" target="_blank">
          Política de Reembolso
        </Link>
      </>
    );
  }

  return (
    <>
      I accept the{" "}
      <Link to={ROUTES.TERMS} className="underline text-sage-dark hover:text-sage" target="_blank">
        Terms of Service
      </Link>
      , the{" "}
      <Link to={ROUTES.PRIVACY} className="underline text-sage-dark hover:text-sage" target="_blank">
        Privacy Policy
      </Link>
      {" "}and the{" "}
      <Link to={ROUTES.REFUND_POLICY} className="underline text-sage-dark hover:text-sage" target="_blank">
        Refund Policy
      </Link>
    </>
  );
}

// ─── Wrapper (provides Elements context) ─────────────────────────────────────

export default function PaymentStep({
  clientSecret,
  indicativeTotal,
  currency,
  orderId,
  submitting,
  submitError,
}) {
  const { t } = useLanguage();
  const stripePromise = useMemo(() => getStripe(), []);

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3">
        {submitError ? (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 w-full">
            {submitError}
          </div>
        ) : (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-charcoal-subtle" />
            <p className="text-sm text-charcoal-subtle">
              {t("paymentStep.initializing")}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance }}
    >
      <PaymentForm
        indicativeTotal={indicativeTotal}
        currency={currency}
        orderId={orderId}
        submitting={submitting}
      />
    </Elements>
  );
}
