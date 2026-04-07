import { CreditCard, Banknote, User, Calendar, Tag, Users, ShoppingBag, CheckCircle2, ExternalLink } from "lucide-react";
import WizardStepWrapper from "./WizardStepWrapper";
import { cn } from "@/lib/utils";

function formatPrice(amount, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function ReviewRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-charcoal-subtle shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-charcoal-subtle">{label}</p>
        <p className="text-sm font-medium text-charcoal">{value || "—"}</p>
      </div>
    </div>
  );
}

function PaymentOption({ id, icon: Icon, title, subtitle, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-xl border-2 px-4 py-3.5 transition-all flex items-center gap-3",
        selected ? "border-sage bg-sage/5" : "border-sand-dark/40 hover:border-sage/50"
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", selected ? "text-sage" : "text-charcoal-subtle")} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", selected ? "text-sage-dark" : "text-charcoal")}>{title}</p>
        <p className="text-xs text-charcoal-muted">{subtitle}</p>
      </div>
      <div className={cn("w-5 h-5 rounded-full border-2 shrink-0", selected ? "bg-sage border-sage" : "border-sand-dark")}>
        {selected && (
          <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </button>
  );
}

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessView({ result }) {
  if (!result) return null;

  if (result.paid) {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="w-16 h-16 rounded-full bg-sage/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-sage" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-charcoal">Venta confirmada</h3>
          <p className="text-sm text-charcoal-muted mt-1">Orden <strong>{result.orderNumber}</strong> creada y marcada como pagada.</p>
          <p className="text-sm text-charcoal-muted">Total: <strong>{formatPrice(result.totalAmount, result.currency)}</strong></p>
        </div>
        <p className="text-xs text-charcoal-subtle">Los tickets se generarán automáticamente.</p>
      </div>
    );
  }

  if (result.paymentLink) {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
          <ExternalLink className="h-8 w-8 text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-charcoal">Link de pago generado</h3>
          <p className="text-sm text-charcoal-muted mt-1">Orden <strong>{result.orderNumber}</strong> creada. Envía el link al cliente.</p>
        </div>
        <a
          href={result.paymentLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-sage text-white px-6 py-3 text-sm font-semibold hover:bg-sage-dark transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir link de pago
        </a>
        <p className="text-xs text-charcoal-subtle break-all">{result.paymentLink}</p>
      </div>
    );
  }

  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReviewConfirmStep({ wizard, setWizardField, submitting, submitError, result }) {
  const { experience, pricingTier, slot, quantity, selectedAddonIds, paymentMethod } = wizard;
  const currency = pricingTier?.currency || "MXN";
  const baseTotal = pricingTier ? pricingTier.basePrice * quantity : 0;

  if (result) {
    return (
      <WizardStepWrapper title="Confirmación">
        <SuccessView result={result} />
      </WizardStepWrapper>
    );
  }

  const customerName = wizard.customer
    ? (wizard.customer.displayName || wizard.customerName)
    : wizard.customerName;
  const customerEmail = wizard.customer?.email || wizard.customerEmail;

  return (
    <WizardStepWrapper
      title="Revisión y confirmación"
      description="Verifica todos los datos antes de procesar la venta."
    >
      {/* Order summary */}
      <div className="rounded-xl border border-sand-dark/40 bg-warm-gray/20 divide-y divide-sand-dark/20 mb-5">
        <ReviewRow icon={User} label="Cliente" value={`${customerName} — ${customerEmail}`} />
        <ReviewRow icon={ShoppingBag} label="Experiencia" value={experience?.publicName} />
        <ReviewRow icon={Tag} label="Tier de precio" value={pricingTier ? `${pricingTier.name} — ${formatPrice(pricingTier.basePrice, currency)}` : "—"} />
        {experience?.requiresSchedule && (
          <ReviewRow
            icon={Calendar}
            label="Slot / Fecha"
            value={slot ? formatDateTime(slot.startDatetime) : "Sin seleccionar"}
          />
        )}
        <ReviewRow icon={Users} label="Cantidad" value={`${quantity} participante${quantity !== 1 ? "s" : ""}`} />
        {selectedAddonIds.length > 0 && (
          <ReviewRow icon={Tag} label="Complementos" value={`${selectedAddonIds.length} seleccionado${selectedAddonIds.length > 1 ? "s" : ""}`} />
        )}
        <div className="flex justify-between items-center py-2.5 px-0 font-bold text-charcoal">
          <span className="text-sm">Total estimado</span>
          <span>{formatPrice(baseTotal, currency)}</span>
        </div>
      </div>

      {/* Payment method */}
      <p className="text-sm font-medium text-charcoal mb-3">Método de pago</p>
      <div className="space-y-2 mb-5">
        <PaymentOption
          id="manual"
          icon={Banknote}
          title="Marcar como pagado"
          subtitle="La orden se crea inmediatamente con status pagado y se generan los tickets."
          selected={paymentMethod === "manual"}
          onSelect={() => setWizardField("paymentMethod", "manual")}
        />
        <PaymentOption
          id="stripe"
          icon={CreditCard}
          title="Generar link de pago Stripe"
          subtitle="Se crea un link que puedes enviar al cliente para que pague en línea."
          selected={paymentMethod === "stripe"}
          onSelect={() => setWizardField("paymentMethod", "stripe")}
        />
      </div>

      {/* Error */}
      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          {submitError}
        </div>
      )}

      {/* Confirm button rendered by AssistedSaleWizard via the footer slot */}
    </WizardStepWrapper>
  );
}
