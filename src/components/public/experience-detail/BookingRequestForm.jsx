import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createBookingRequest } from "@/hooks/useBookingRequests";
import Input from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Send, CheckCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { isValidPhone } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BookingRequestForm({ experience }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    contactName: user?.name || "",
    contactEmail: user?.email || "",
    contactPhone: "",
    participants: 1,
    requestedDate: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const e = {};
    if (!form.contactName.trim())
      e.contactName = t("bookingRequest.nameRequired");
    if (!form.contactEmail.trim())
      e.contactEmail = t("bookingRequest.emailRequired");
    else if (!EMAIL_RE.test(form.contactEmail.trim()))
      e.contactEmail = t("bookingRequest.emailInvalid");
    if (!form.participants || form.participants < 1)
      e.participants = t("bookingRequest.participantsMin");
    if (form.contactPhone.trim() && !isValidPhone(form.contactPhone))
      e.contactPhone = t("common.phoneError");
    return e;
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    try {
      await createBookingRequest({
        experienceId: experience.$id,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        participants: form.participants,
        requestedDate: form.requestedDate || null,
        message: form.message,
        userId: user?.$id || null,
      });
      setSubmitted(true);
    } catch (err) {
      setErrors({ _form: err.message || t("bookingRequest.error") });
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handlePhoneBlur() {
    if (form.contactPhone.trim() && !isValidPhone(form.contactPhone)) {
      setErrors((prev) => ({ ...prev, contactPhone: t("common.phoneError") }));
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="rounded-2xl border border-sage/30 bg-sage/5 p-6 text-center space-y-3">
        <CheckCircle className="h-10 w-10 text-sage mx-auto" />
        <h3 className="font-display text-lg font-bold text-charcoal">
          {t("bookingRequest.successTitle")}
        </h3>
        <p className="text-sm text-charcoal-muted leading-relaxed">
          {t("bookingRequest.successMessage")}
        </p>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-display text-lg font-bold text-charcoal">
        {t("bookingRequest.formTitle")}
      </h3>
      <p className="text-sm text-charcoal-muted">
        {t("bookingRequest.formSubtitle")}
      </p>

      {errors._form && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {errors._form}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-charcoal mb-1">
          {t("bookingRequest.nameLabel")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <Input
          value={form.contactName}
          onChange={(e) => handleChange("contactName", e.target.value)}
          placeholder={t("bookingRequest.namePlaceholder")}
          className={errors.contactName ? "border-red-400" : ""}
        />
        {errors.contactName && (
          <p className="text-xs text-red-500 mt-1">{errors.contactName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal mb-1">
          {t("bookingRequest.emailLabel")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <Input
          type="email"
          value={form.contactEmail}
          onChange={(e) => handleChange("contactEmail", e.target.value)}
          placeholder={t("bookingRequest.emailPlaceholder")}
          className={errors.contactEmail ? "border-red-400" : ""}
        />
        {errors.contactEmail && (
          <p className="text-xs text-red-500 mt-1">{errors.contactEmail}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal mb-1">
          {t("bookingRequest.phoneLabel")}
        </label>
        <Input
          type="tel"
          value={form.contactPhone}
          onChange={(e) => handleChange("contactPhone", e.target.value)}
          onBlur={handlePhoneBlur}
          placeholder="+52 55 1234 5678"
        />
        {errors.contactPhone && (
          <p className="text-xs text-red-500 mt-1">{errors.contactPhone}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            {t("bookingRequest.participantsLabel")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            min={1}
            value={form.participants}
            onChange={(e) =>
              handleChange("participants", parseInt(e.target.value, 10) || 1)
            }
            className={errors.participants ? "border-red-400" : ""}
          />
          {errors.participants && (
            <p className="text-xs text-red-500 mt-1">{errors.participants}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            {t("bookingRequest.preferredDateLabel")}
          </label>
          <Input
            type="date"
            value={form.requestedDate}
            onChange={(e) => handleChange("requestedDate", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal mb-1">
          {t("bookingRequest.messageLabel")}
        </label>
        <textarea
          value={form.message}
          onChange={(e) => handleChange("message", e.target.value)}
          rows={3}
          placeholder={t("bookingRequest.messagePlaceholder")}
          className="w-full rounded-xl border border-sand-dark bg-white px-4 py-2.5 text-sm text-charcoal placeholder-charcoal-subtle focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 resize-none"
        />
      </div>

      <Button type="submit" size="md" className="w-full" disabled={submitting}>
        {submitting ? (
          t("bookingRequest.sending")
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            {t("bookingRequest.sendRequest")}
          </>
        )}
      </Button>
    </form>
  );
}
