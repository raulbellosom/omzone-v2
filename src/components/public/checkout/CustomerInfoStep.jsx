import { Input } from "@/components/common/Input";

export default function CustomerInfoStep({
  customerName,
  setCustomerName,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
}) {
  const emailValid =
    !customerEmail.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);

  return (
    <div className="space-y-5">
      <p className="text-sm text-charcoal-subtle">
        We&apos;ll use this to send your order confirmation and tickets.
      </p>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="checkout-name"
            className="block text-sm font-medium text-charcoal mb-1.5"
          >
            Full name <span className="text-red-500">*</span>
          </label>
          <Input
            id="checkout-name"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>

        <div>
          <label
            htmlFor="checkout-email"
            className="block text-sm font-medium text-charcoal mb-1.5"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            id="checkout-email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="you@email.com"
            required
          />
          {!emailValid && (
            <p className="text-xs text-red-500 mt-1">
              Please enter a valid email address.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="checkout-phone"
            className="block text-sm font-medium text-charcoal mb-1.5"
          >
            Phone{" "}
            <span className="text-charcoal-subtle font-normal">(optional)</span>
          </label>
          <Input
            id="checkout-phone"
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="+52 55 1234 5678"
          />
        </div>
      </div>
    </div>
  );
}
