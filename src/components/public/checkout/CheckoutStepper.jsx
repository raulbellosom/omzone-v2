import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["Selection", "Add-ons", "Your Info", "Review"];

export default function CheckoutStepper({ currentStep, stepValidation, goToStep }) {
  return (
    <nav aria-label="Checkout steps" className="flex items-center gap-1 sm:gap-2 w-full">
      {STEP_LABELS.map((label, i) => {
        const isDone = i < currentStep;
        const isCurrent = i === currentStep;
        const canNavigate = i < currentStep || (i <= currentStep && stepValidation[currentStep]);

        return (
          <button
            key={label}
            type="button"
            disabled={!canNavigate}
            onClick={() => canNavigate && goToStep(i)}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 flex-1 group transition-colors",
              canNavigate ? "cursor-pointer" : "cursor-default",
            )}
          >
            {/* Circle */}
            <span
              className={cn(
                "flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors",
                isDone && "bg-sage text-white",
                isCurrent && "bg-charcoal text-white",
                !isDone && !isCurrent && "bg-warm-gray text-charcoal-subtle",
              )}
            >
              {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </span>

            {/* Label */}
            <span
              className={cn(
                "text-xs sm:text-sm font-medium hidden sm:inline transition-colors",
                isCurrent && "text-charcoal",
                isDone && "text-sage-dark",
                !isDone && !isCurrent && "text-charcoal-subtle",
              )}
            >
              {label}
            </span>

            {/* Connector line */}
            {i < STEP_LABELS.length - 1 && (
              <span
                className={cn(
                  "flex-1 h-px mx-1",
                  isDone ? "bg-sage" : "bg-warm-gray-dark/20",
                )}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
