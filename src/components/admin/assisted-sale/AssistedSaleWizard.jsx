import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useAssistedSale } from "@/hooks/useAssistedSale";
import { Button } from "@/components/common/Button";
import CustomerSearchStep from "./CustomerSearchStep";
import ExperienceSelectStep from "./ExperienceSelectStep";
import PricingTierStep from "./PricingTierStep";
import SlotSelectStep from "./SlotSelectStep";
import AddonSelectStep from "./AddonSelectStep";
import QuantityStep from "./QuantityStep";
import ReviewConfirmStep from "./ReviewConfirmStep";
import { cn } from "@/lib/utils";

// ─── Step definitions ─────────────────────────────────────────────────────────

function buildSteps(wizard) {
  const steps = [
    { id: "customer",    label: "Cliente" },
    { id: "experience",  label: "Experiencia" },
    { id: "tier",        label: "Precio" },
  ];

  if (wizard.experience?.requiresSchedule) {
    steps.push({ id: "slot", label: "Slot" });
  }

  steps.push(
    { id: "addons",   label: "Addons" },
    { id: "quantity", label: "Cantidad" },
    { id: "review",   label: "Revisión" },
  );

  return steps;
}

// ─── Step progress bar ────────────────────────────────────────────────────────

function StepBar({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <div key={step.id} className="flex items-center shrink-0">
            <div className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              isActive ? "bg-sage text-white" :
              isDone ? "bg-sage/20 text-sage-dark" :
              "bg-warm-gray text-charcoal-subtle"
            )}>
              {isDone ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "h-px w-4 mx-0.5 transition-colors",
                isDone ? "bg-sage/40" : "bg-sand-dark/40"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Validation per step ──────────────────────────────────────────────────────

function canProceed(stepId, wizard) {
  switch (stepId) {
    case "customer":
      if (wizard.isNewCustomer) return !!(wizard.customerName.trim() && wizard.customerEmail.trim());
      return !!(wizard.customer || (wizard.customerName.trim() && wizard.customerEmail.trim()));
    case "experience":
      return !!wizard.experience;
    case "tier":
      return !!wizard.pricingTier;
    case "slot":
      return !!wizard.slot;
    case "addons":
      return true; // addons are optional
    case "quantity":
      return wizard.quantity >= 1;
    case "review":
      return true;
    default:
      return true;
  }
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

export default function AssistedSaleWizard() {
  const { wizard, setWizardField, submitSale, submitting, result, submitError, resetWizard } = useAssistedSale();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = buildSteps(wizard);
  const stepId = steps[currentStep]?.id;
  const isLastStep = currentStep === steps.length - 1;
  const isDone = !!result;

  async function handleNext() {
    if (isLastStep) {
      const ok = await submitSale();
      if (!ok) return; // error displayed in ReviewConfirmStep
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(0, s - 1));
  }

  function handleReset() {
    resetWizard();
    setCurrentStep(0);
  }

  const canGoNext = canProceed(stepId, wizard);

  const StepComponent = {
    customer:    <CustomerSearchStep    wizard={wizard} setWizardField={setWizardField} />,
    experience:  <ExperienceSelectStep wizard={wizard} setWizardField={setWizardField} />,
    tier:        <PricingTierStep      wizard={wizard} setWizardField={setWizardField} />,
    slot:        <SlotSelectStep       wizard={wizard} setWizardField={setWizardField} />,
    addons:      <AddonSelectStep      wizard={wizard} setWizardField={setWizardField} />,
    quantity:    <QuantityStep         wizard={wizard} setWizardField={setWizardField} />,
    review:      (
      <ReviewConfirmStep
        wizard={wizard}
        setWizardField={setWizardField}
        submitting={submitting}
        submitError={submitError}
        result={result}
      />
    ),
  }[stepId];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step progress */}
      {!isDone && <StepBar steps={steps} currentStep={currentStep} />}

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-sand-dark/30 shadow-sm p-6">
        {StepComponent}
      </div>

      {/* Navigation */}
      {!isDone && (
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleBack}
            disabled={currentStep === 0 || submitting}
          >
            <ChevronLeft className="h-4 w-4" />
            Atrás
          </Button>

          <Button
            type="button"
            size="md"
            onClick={handleNext}
            disabled={!canGoNext || submitting}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Procesando...
              </span>
            ) : isLastStep ? (
              <>
                <Check className="h-4 w-4" />
                Confirmar venta
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Post-success actions */}
      {isDone && (
        <div className="flex gap-3 justify-center">
          <Button type="button" variant="outline" size="md" onClick={handleReset}>
            Nueva venta
          </Button>
        </div>
      )}
    </div>
  );
}
