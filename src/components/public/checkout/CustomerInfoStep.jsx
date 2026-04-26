import { useState } from "react";
import { Input } from "@/components/common/Input";
import PhoneInput from "@/components/common/PhoneInput";
import { useLanguage } from "@/hooks/useLanguage";
import { isValidPhone } from "@/lib/utils";

export default function CustomerInfoStep({
  customerName,
  setCustomerName,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
}) {
  const { t } = useLanguage();
  const emailValid =
    !customerEmail.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneValid = isValidPhone(customerPhone);

  function handlePhoneBlur() {
    setPhoneTouched(true);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-charcoal-subtle">{t("customerInfo.intro")}</p>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="checkout-name"
            className="block text-sm font-medium text-charcoal mb-1.5"
          >
            {t("customerInfo.nameLabel")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <Input
            id="checkout-name"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder={t("customerInfo.namePlaceholder")}
            required
          />
        </div>

        <div>
          <label
            htmlFor="checkout-email"
            className="block text-sm font-medium text-charcoal mb-1.5"
          >
            {t("customerInfo.emailLabel")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <Input
            id="checkout-email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder={t("customerInfo.emailPlaceholder")}
            required
          />
          {!emailValid && (
            <p className="text-xs text-red-500 mt-1">
              {t("customerInfo.emailError")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="checkout-phone"
            className="block text-sm font-medium text-charcoal mb-1.5"
          >
            {t("customerInfo.phoneLabel")}{" "}
            <span className="text-charcoal-subtle font-normal">
              {t("customerInfo.phoneOptional")}
            </span>
          </label>
          <PhoneInput
            id="checkout-phone"
            value={customerPhone}
            onChange={(val) => {
              setCustomerPhone(val);
              if (!val.trim()) setPhoneTouched(false);
            }}
            onBlur={handlePhoneBlur}
          />
          {phoneTouched && !phoneValid && (
            <p className="text-xs text-red-500 mt-1">
              {t("common.phoneError")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
