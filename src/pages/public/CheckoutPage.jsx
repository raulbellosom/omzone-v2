import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useCheckout } from "@/hooks/useCheckout";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/common/Button";

import CheckoutStepper from "@/components/public/checkout/CheckoutStepper";
import SelectionStep from "@/components/public/checkout/SelectionStep";
import AddonsStep from "@/components/public/checkout/AddonsStep";
import CustomerInfoStep from "@/components/public/checkout/CustomerInfoStep";
import OrderSummaryStep from "@/components/public/checkout/OrderSummaryStep";
import PaymentStep from "@/components/public/checkout/PaymentStep";
import OrderSummary from "@/components/public/checkout/OrderSummary";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function CheckoutSkeleton() {
  return (
    <div className="min-h-[60vh] bg-cream">
      <div className="container-shell py-10 max-w-4xl animate-pulse space-y-8">
        <div className="h-6 w-48 bg-warm-gray rounded-lg" />
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 h-2 bg-warm-gray rounded-full" />
          ))}
        </div>
        <div className="h-48 bg-warm-gray rounded-2xl" />
        <div className="h-32 bg-warm-gray rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Error / missing params ───────────────────────────────────────────────────

function CheckoutError({ type }) {
  const { t } = useLanguage();
  const messages = {
    missing_params: {
      title: t("checkout.noExperience"),
      desc: t("checkout.noExperienceDesc"),
    },
    not_available: {
      title: t("checkout.unavailable"),
      desc: t("checkout.unavailableDesc"),
    },
  };

  const msg = messages[type] || {
    title: t("checkout.somethingWrong"),
    desc: t("checkout.tryAgainDesc"),
  };

  return (
    <div className="min-h-[50vh] bg-cream flex items-center justify-center">
      <div className="text-center space-y-4 px-6">
        <h2 className="text-xl font-semibold text-charcoal">{msg.title}</h2>
        <p className="text-charcoal-subtle text-sm">{msg.desc}</p>
        <Link to={ROUTES.EXPERIENCES}>
          <Button variant="outline" size="md">
            {t("checkout.exploreExperiences")}
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { t } = useLanguage();
  const checkout = useCheckout();

  const {
    experience,
    pricingTiers,
    slots,
    enrichedAddons,
    loading,
    loadError,
    selectedTierId,
    setSelectedTierId,
    selectedTier,
    selectedSlotId,
    setSelectedSlotId,
    selectedSlot,
    selectedAddonIds,
    toggleAddon,
    selectedAddons,
    quantity,
    setQuantity,
    customerName,
    setCustomerName,
    customerEmail,
    setCustomerEmail,
    customerPhone,
    setCustomerPhone,
    indicativeTotal,
    currency,
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    stepValidation,
    submitting,
    submitError,
    createPaymentIntent,
    clientSecret,
    orderId,
    orderNumber,
  } = checkout;

  if (loading) return <CheckoutSkeleton />;
  if (loadError) return <CheckoutError type={loadError} />;

  const steps = [
    <SelectionStep
      key="selection"
      experience={experience}
      pricingTiers={pricingTiers}
      slots={slots}
      selectedTierId={selectedTierId}
      setSelectedTierId={setSelectedTierId}
      selectedSlotId={selectedSlotId}
      setSelectedSlotId={setSelectedSlotId}
      quantity={quantity}
      setQuantity={setQuantity}
    />,
    <AddonsStep
      key="addons"
      enrichedAddons={enrichedAddons}
      selectedAddonIds={selectedAddonIds}
      toggleAddon={toggleAddon}
      quantity={quantity}
    />,
    <CustomerInfoStep
      key="customer"
      customerName={customerName}
      setCustomerName={setCustomerName}
      customerEmail={customerEmail}
      setCustomerEmail={setCustomerEmail}
      customerPhone={customerPhone}
      setCustomerPhone={setCustomerPhone}
    />,
    <OrderSummaryStep
      key="summary"
      experience={experience}
      selectedTier={selectedTier}
      selectedSlot={selectedSlot}
      selectedAddons={selectedAddons}
      quantity={quantity}
      indicativeTotal={indicativeTotal}
      currency={currency}
    />,
    <PaymentStep
      key="payment"
      clientSecret={clientSecret}
      indicativeTotal={indicativeTotal}
      currency={currency}
      orderId={orderId}
      submitting={submitting}
      submitError={submitError}
    />,
  ];

  return (
    <div className="min-h-screen bg-cream">
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="container-shell py-6 md:py-10">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link
            to={ROUTES.EXPERIENCES}
            className="inline-flex items-center gap-1.5 text-sm text-charcoal-subtle hover:text-charcoal transition-colors group mb-4"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            {t("checkout.back")}
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal font-display">
            {t("checkout.title")}
          </h1>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <CheckoutStepper
            currentStep={currentStep}
            stepValidation={stepValidation}
            goToStep={goToStep}
          />
        </div>

        {/* ── Two-column layout on lg+ ── */}
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-10 lg:items-start">
          {/* Main column */}
          <div className="min-w-0">
            {/* Render current step */}
            <div className="bg-white rounded-2xl border border-warm-gray-dark/15 p-5 md:p-7">
              {steps[currentStep]}
            </div>

            {/* Navigation (not on payment step — it has its own submit) */}
            {currentStep < 4 && (
              <div className="flex justify-between mt-6">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("checkout.back")}
                </Button>
                <Button
                  size="md"
                  onClick={async () => {
                    // On Review → Payment: create PaymentIntent first
                    if (currentStep === 3) {
                      const result = await createPaymentIntent();
                      if (result) nextStep();
                    } else {
                      nextStep();
                    }
                  }}
                  disabled={!stepValidation[currentStep] || (currentStep === 3 && submitting)}
                  className="gap-1.5"
                >
                  {currentStep === 3 && submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("checkout.processing")}
                    </>
                  ) : (
                    <>
                      {t("checkout.next")}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar — desktop only, sticky */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <OrderSummary
                selectedTier={selectedTier}
                selectedAddons={selectedAddons}
                quantity={quantity}
                indicativeTotal={indicativeTotal}
                currency={currency}
              />
            </div>
          </div>
        </div>

        {/* Mobile bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-warm-gray-dark/15 px-4 py-3 lg:hidden z-40">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div>
              <p className="text-xs text-charcoal-subtle uppercase tracking-wider">
                {t("orderSummary.total")}
              </p>
              <p className="text-lg font-bold text-charcoal">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(indicativeTotal)}{" "}
                <span className="text-xs font-normal text-charcoal-subtle">
                  {currency}
                </span>
              </p>
            </div>
            {currentStep < 4 ? (
              <Button
                size="md"
                onClick={async () => {
                  if (currentStep === 3) {
                    const result = await createPaymentIntent();
                    if (result) nextStep();
                  } else {
                    nextStep();
                  }
                }}
                disabled={!stepValidation[currentStep] || (currentStep === 3 && submitting)}
                className="gap-1.5"
              >
                {currentStep === 3 && submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("checkout.processing")}
                  </>
                ) : (
                  <>
                    {t("checkout.next")}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </div>

        {/* Spacer for mobile bottom bar */}
        <div className="h-20 lg:hidden" />
      </div>
    </div>
  );
}
