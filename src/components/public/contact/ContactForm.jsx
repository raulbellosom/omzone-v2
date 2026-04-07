import { useLanguage } from "@/hooks/useLanguage";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function ContactForm({ form, errors, status, handleChange, submit, reset }) {
  const { t } = useLanguage();

  if (status === "success") {
    return (
      <div className="text-center py-12 px-6">
        <CheckCircle className="h-12 w-12 text-sage mx-auto" />
        <h3 className="mt-4 font-display text-2xl font-semibold text-charcoal">
          {t("contact.form.successTitle")}
        </h3>
        <p className="mt-2 text-charcoal-muted leading-relaxed max-w-md mx-auto">
          {t("contact.form.successBody")}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 text-sm font-medium text-sage hover:text-olive transition-colors underline underline-offset-4"
        >
          {t("contact.form.sendAnother")}
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
      className="space-y-6"
    >
      {/* Error banner */}
      {status === "error" && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">
              {t("contact.form.errorTitle")}
            </p>
            <p className="mt-1 text-sm text-red-600">
              {t("contact.form.errorBody")}
            </p>
          </div>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-charcoal mb-1.5">
          {t("contact.form.nameLabel")} <span className="text-red-400">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder={t("contact.form.namePlaceholder")}
          disabled={isSending}
          className={`w-full rounded-lg border px-4 py-3 text-sm bg-white placeholder:text-charcoal-subtle/60 focus:outline-none focus:ring-2 focus:ring-sage/40 transition-colors disabled:opacity-50 ${
            errors.name ? "border-red-400" : "border-sand"
          }`}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-charcoal mb-1.5">
          {t("contact.form.emailLabel")} <span className="text-red-400">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder={t("contact.form.emailPlaceholder")}
          disabled={isSending}
          className={`w-full rounded-lg border px-4 py-3 text-sm bg-white placeholder:text-charcoal-subtle/60 focus:outline-none focus:ring-2 focus:ring-sage/40 transition-colors disabled:opacity-50 ${
            errors.email ? "border-red-400" : "border-sand"
          }`}
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-charcoal mb-1.5">
          {t("contact.form.subjectLabel")}
        </label>
        <input
          id="contact-subject"
          type="text"
          value={form.subject}
          onChange={(e) => handleChange("subject", e.target.value)}
          placeholder={t("contact.form.subjectPlaceholder")}
          disabled={isSending}
          className="w-full rounded-lg border border-sand px-4 py-3 text-sm bg-white placeholder:text-charcoal-subtle/60 focus:outline-none focus:ring-2 focus:ring-sage/40 transition-colors disabled:opacity-50"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-charcoal mb-1.5">
          {t("contact.form.messageLabel")} <span className="text-red-400">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={6}
          value={form.message}
          onChange={(e) => handleChange("message", e.target.value)}
          placeholder={t("contact.form.messagePlaceholder")}
          disabled={isSending}
          className={`w-full rounded-lg border px-4 py-3 text-sm bg-white placeholder:text-charcoal-subtle/60 focus:outline-none focus:ring-2 focus:ring-sage/40 transition-colors resize-y min-h-[120px] disabled:opacity-50 ${
            errors.message ? "border-red-400" : "border-sand"
          }`}
        />
        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
        <p className="mt-1 text-xs text-charcoal-subtle text-right">
          {form.message.length} / 5,000
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSending}
        className="w-full sm:w-auto px-8 py-3 rounded-lg bg-sage text-white text-sm font-semibold tracking-wide hover:bg-olive focus:outline-none focus:ring-2 focus:ring-sage/50 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSending ? t("contact.form.sending") : t("contact.form.send")}
      </button>
    </form>
  );
}
