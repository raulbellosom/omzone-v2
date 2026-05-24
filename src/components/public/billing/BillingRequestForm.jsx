import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { functions } from "@/lib/appwrite";
import env from "@/config/env";
import { useLanguage } from "@/hooks/useLanguage";
import { CheckCircle, AlertCircle, Loader2, FileText, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  orderCode: "",
  rfc: "",
  taxRegime: "",
  cfdiUse: "",
  fiscalEmail: "",
  additionalInfo: "",
};

function useBillingRequestForm(t, prefillOrderCode) {
  const [form, setForm] = useState({ ...INITIAL_FORM, orderCode: prefillOrderCode || "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [captchaToken, setCaptchaToken] = useState(null);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = t("billing.validation.nameRequired");
    if (!form.email.trim()) e.email = t("billing.validation.emailRequired");
    else if (!EMAIL_RE.test(form.email.trim())) e.email = t("billing.validation.emailInvalid");
    if (!form.phone.trim()) e.phone = t("billing.validation.phoneRequired");
    if (!form.orderCode.trim()) e.orderCode = t("billing.validation.orderCodeRequired");
    if (!form.rfc.trim()) e.rfc = t("billing.validation.rfcRequired");
    if (!captchaToken) e.captcha = t("billing.validation.captchaRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setStatus("sending");
    try {
      const categoryData = {
        orderCode: form.orderCode.trim(),
        whatsapp: form.phone.trim(),
        rfc: form.rfc.trim(),
        taxRegime: form.taxRegime.trim() || undefined,
        cfdiUse: form.cfdiUse.trim() || undefined,
        fiscalEmail: form.fiscalEmail.trim() || undefined,
        additionalInfo: form.additionalInfo.trim() || undefined,
      };
      // Remove undefined keys
      Object.keys(categoryData).forEach((k) => categoryData[k] === undefined && delete categoryData[k]);

      const execution = await functions.createExecution(
        env.functionSubmitContact,
        JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: `Invoice Request — ${form.orderCode.trim()}`,
          message: `Invoice request for order ${form.orderCode.trim()}. RFC: ${form.rfc.trim()}`,
          recaptchaToken: captchaToken,
          category: "invoice_request",
          categoryData,
        }),
        false,
        "/",
        "POST",
      );

      const result = JSON.parse(execution.responseBody);
      if (!result.ok) throw new Error(result.error?.code || "submission_failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setForm({ ...INITIAL_FORM, orderCode: prefillOrderCode || "" });
    setErrors({});
    setStatus("idle");
    setCaptchaToken(null);
  }

  return { form, errors, status, captchaToken, setCaptchaToken, handleChange, submit, reset };
}

function FormField({ id, label, required, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-charcoal mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function FormInput({ id, type = "text", value, onChange, placeholder, disabled, error, ...props }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full rounded-lg border px-4 py-3 text-sm bg-white placeholder:text-charcoal-subtle/60 focus:outline-none focus:ring-2 focus:ring-sage/40 transition-colors disabled:opacity-50 ${
        error ? "border-red-400" : "border-sand"
      }`}
      {...props}
    />
  );
}

export default function BillingRequestForm() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const prefillOrderCode = searchParams.get("orderCode") || "";
  const captchaRef = useRef(null);

  const { form, errors, status, captchaToken, setCaptchaToken, handleChange, submit, reset } =
    useBillingRequestForm(t, prefillOrderCode);

  useEffect(() => {
    if (status === "idle") captchaRef.current?.reset();
  }, [status]);

  if (status === "success") {
    return (
      <div className="text-center py-12 px-6">
        <CheckCircle className="h-12 w-12 text-sage mx-auto" />
        <h3 className="mt-4 font-display text-2xl font-semibold text-charcoal">
          {t("billing.form.successTitle")}
        </h3>
        <p className="mt-2 text-charcoal-muted leading-relaxed max-w-md mx-auto">
          {t("billing.form.successBody")}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 text-sm font-medium text-sage hover:text-olive transition-colors underline underline-offset-4"
        >
          {t("billing.form.sendAnother")}
        </button>
      </div>
    );
  }

  const isSending = status === "sending";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate
      className="space-y-5"
    >
      {status === "error" && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">{t("billing.form.errorTitle")}</p>
            <p className="mt-1 text-sm text-red-600">{t("billing.form.errorBody")}</p>
          </div>
        </div>
      )}

      {/* Name + Email */}
      <div className="grid sm:grid-cols-2 gap-5">
        <FormField id="billing-name" label={t("billing.form.nameLabel")} required error={errors.name}>
          <FormInput
            id="billing-name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder={t("billing.form.namePlaceholder")}
            disabled={isSending}
            error={errors.name}
          />
        </FormField>
        <FormField id="billing-email" label={t("billing.form.emailLabel")} required error={errors.email}>
          <FormInput
            id="billing-email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder={t("billing.form.emailPlaceholder")}
            disabled={isSending}
            error={errors.email}
          />
        </FormField>
      </div>

      {/* WhatsApp + OrderCode */}
      <div className="grid sm:grid-cols-2 gap-5">
        <FormField id="billing-phone" label={t("billing.form.phoneLabel")} required error={errors.phone}>
          <FormInput
            id="billing-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder={t("billing.form.phonePlaceholder")}
            disabled={isSending}
            error={errors.phone}
          />
        </FormField>
        <FormField id="billing-ordercode" label={t("billing.form.orderCodeLabel")} required error={errors.orderCode}>
          <FormInput
            id="billing-ordercode"
            value={form.orderCode}
            onChange={(e) => handleChange("orderCode", e.target.value)}
            placeholder={t("billing.form.orderCodePlaceholder")}
            disabled={isSending}
            error={errors.orderCode}
          />
        </FormField>
      </div>

      {/* RFC + Tax Regime */}
      <div className="grid sm:grid-cols-2 gap-5">
        <FormField id="billing-rfc" label={t("billing.form.rfcLabel")} required error={errors.rfc}>
          <FormInput
            id="billing-rfc"
            value={form.rfc}
            onChange={(e) => handleChange("rfc", e.target.value.toUpperCase())}
            placeholder={t("billing.form.rfcPlaceholder")}
            disabled={isSending}
            error={errors.rfc}
            maxLength={13}
          />
        </FormField>
        <FormField id="billing-taxregime" label={t("billing.form.taxRegimeLabel")} error={errors.taxRegime}>
          <FormInput
            id="billing-taxregime"
            value={form.taxRegime}
            onChange={(e) => handleChange("taxRegime", e.target.value)}
            placeholder={t("billing.form.taxRegimePlaceholder")}
            disabled={isSending}
            error={errors.taxRegime}
          />
        </FormField>
      </div>

      {/* CFDI Use + Fiscal Email */}
      <div className="grid sm:grid-cols-2 gap-5">
        <FormField id="billing-cfdi" label={t("billing.form.cfdiUseLabel")} error={errors.cfdiUse}>
          <FormInput
            id="billing-cfdi"
            value={form.cfdiUse}
            onChange={(e) => handleChange("cfdiUse", e.target.value)}
            placeholder={t("billing.form.cfdiUsePlaceholder")}
            disabled={isSending}
            error={errors.cfdiUse}
          />
        </FormField>
        <FormField id="billing-fiscalemail" label={t("billing.form.fiscalEmailLabel")} error={errors.fiscalEmail}>
          <FormInput
            id="billing-fiscalemail"
            type="email"
            value={form.fiscalEmail}
            onChange={(e) => handleChange("fiscalEmail", e.target.value)}
            placeholder={t("billing.form.fiscalEmailPlaceholder")}
            disabled={isSending}
            error={errors.fiscalEmail}
          />
        </FormField>
      </div>

      {/* Additional Info */}
      <FormField id="billing-info" label={t("billing.form.additionalInfoLabel")} error={errors.additionalInfo}>
        <textarea
          id="billing-info"
          value={form.additionalInfo}
          onChange={(e) => handleChange("additionalInfo", e.target.value)}
          placeholder={t("billing.form.additionalInfoPlaceholder")}
          disabled={isSending}
          rows={3}
          className={`w-full rounded-lg border px-4 py-3 text-sm bg-white placeholder:text-charcoal-subtle/60 focus:outline-none focus:ring-2 focus:ring-sage/40 transition-colors disabled:opacity-50 resize-none ${
            errors.additionalInfo ? "border-red-400" : "border-sand"
          }`}
        />
      </FormField>

      {/* reCAPTCHA */}
      <div>
        <ReCAPTCHA
          ref={captchaRef}
          sitekey={env.recaptchaSiteKey}
          onChange={(token) => setCaptchaToken(token)}
          onExpired={() => setCaptchaToken(null)}
        />
        {errors.captcha && <p className="mt-1 text-xs text-red-500">{errors.captcha}</p>}
      </div>

      <button
        type="submit"
        disabled={isSending}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-charcoal px-6 py-3.5 text-sm font-medium tracking-widest uppercase text-cream disabled:opacity-60 hover:bg-olive transition-colors"
      >
        {isSending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("billing.form.sending")}
          </>
        ) : (
          t("billing.form.send")
        )}
      </button>

      <p className="text-xs text-charcoal-muted text-center leading-relaxed">
        {t("billing.notice.help")}{" "}
        <a href="mailto:hello@omzone.com" className="text-sage hover:underline">
          hello@omzone.com
        </a>
      </p>
    </form>
  );
}
