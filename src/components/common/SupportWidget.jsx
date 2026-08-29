import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { functions } from "@/lib/appwrite";
import env from "@/config/env";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";
import {
  MessageCircle,
  X,
  Mail,
  HelpCircle,
  FileText,
  MessageSquare,
  Loader2,
  CheckCircle,
} from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DISMISS_KEY = "omz_support_widget_dismissed";

export default function SupportWidget() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("menu"); // menu | form | success
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  function handleDismiss() {
    setOpen(false);
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = t("contact.validation.nameRequired");
    if (!form.email.trim()) e.email = t("contact.validation.emailRequired");
    else if (!EMAIL_RE.test(form.email.trim()))
      e.email = t("contact.validation.emailInvalid");
    if (!form.message.trim())
      e.message = t("contact.validation.messageRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    try {
      const execution = await functions.createExecution(
        env.functionSubmitContact,
        JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          recaptchaToken: null,
          category: "support",
        }),
        false,
        "/",
        "POST",
      );
      const result = JSON.parse(execution.responseBody);
      if (!result.ok) throw new Error(result.error?.code);
      setView("success");
    } catch {
      setErrors((p) => ({ ...p, submit: t("supportWidget.formErrorBody") }));
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setView("menu");
      setForm({ name: "", email: "", message: "" });
      setErrors({});
    }, 300);
  }

  if (dismissed) return null;

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+6.25rem)] right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* Popover panel */}
      {open && (
        <div className="w-[calc(100vw-2rem)] max-w-80 max-h-[calc(100dvh-9rem)] overflow-y-auto bg-white rounded-2xl shadow-xl border border-sand/60 sm:max-h-[calc(100dvh-6rem)]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-sand/60 bg-charcoal">
            <div>
              <p className="text-sm font-semibold text-cream">
                {t("supportWidget.title")}
              </p>
              <p className="text-xs text-charcoal-muted mt-0.5">
                {t("supportWidget.subtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-charcoal-muted hover:text-cream transition-colors"
              aria-label={t("supportWidget.dismiss")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          {view === "menu" && (
            <div className="p-4 space-y-2">
              <a
                href="mailto:hello@omzone.com"
                className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-sand/40 transition-colors group"
              >
                <Mail className="h-4 w-4 text-sage shrink-0" />
                <span className="text-sm text-charcoal group-hover:text-sage transition-colors">
                  {t("supportWidget.emailAction")}
                </span>
                <span className="ml-auto text-xs text-charcoal-muted">
                  hello@omzone.com
                </span>
              </a>
              <button
                type="button"
                onClick={() => setView("form")}
                className="w-full flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-sand/40 transition-colors group text-left"
              >
                <MessageSquare className="h-4 w-4 text-sage shrink-0" />
                <span className="text-sm text-charcoal group-hover:text-sage transition-colors">
                  {t("supportWidget.formAction")}
                </span>
              </button>
              <Link
                to={ROUTES.HELP}
                onClick={handleClose}
                className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-sand/40 transition-colors group"
              >
                <HelpCircle className="h-4 w-4 text-sage shrink-0" />
                <span className="text-sm text-charcoal group-hover:text-sage transition-colors">
                  {t("supportWidget.faqAction")}
                </span>
              </Link>
              <Link
                to={ROUTES.BILLING_REQUEST}
                onClick={handleClose}
                className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-sand/40 transition-colors group"
              >
                <FileText className="h-4 w-4 text-sage shrink-0" />
                <span className="text-sm text-charcoal group-hover:text-sage transition-colors">
                  {t("supportWidget.invoiceAction")}
                </span>
              </Link>
            </div>
          )}

          {view === "form" && (
            <form onSubmit={handleSend} noValidate className="p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                {t("supportWidget.formTitle")}
              </p>
              {errors.submit && (
                <p className="text-xs text-red-600">{errors.submit}</p>
              )}
              <div>
                <input
                  type="text"
                  placeholder={t("contact.form.namePlaceholder")}
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  disabled={sending}
                  className={`w-full rounded-lg border px-3 py-2 text-sm bg-white placeholder:text-charcoal-subtle/60 focus:outline-none focus:ring-1 focus:ring-sage/40 disabled:opacity-50 ${errors.name ? "border-red-400" : "border-sand"}`}
                />
                {errors.name && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.name}</p>
                )}
              </div>
              <div>
                <input
                  type="email"
                  placeholder={t("contact.form.emailPlaceholder")}
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  disabled={sending}
                  className={`w-full rounded-lg border px-3 py-2 text-sm bg-white placeholder:text-charcoal-subtle/60 focus:outline-none focus:ring-1 focus:ring-sage/40 disabled:opacity-50 ${errors.email ? "border-red-400" : "border-sand"}`}
                />
                {errors.email && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.email}</p>
                )}
              </div>
              <div>
                <textarea
                  placeholder={t("supportWidget.formPlaceholderMessage")}
                  value={form.message}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, message: e.target.value }))
                  }
                  disabled={sending}
                  rows={3}
                  className={`w-full rounded-lg border px-3 py-2 text-sm bg-white placeholder:text-charcoal-subtle/60 focus:outline-none focus:ring-1 focus:ring-sage/40 disabled:opacity-50 resize-none ${errors.message ? "border-red-400" : "border-sand"}`}
                />
                {errors.message && (
                  <p className="mt-0.5 text-xs text-red-500">
                    {errors.message}
                  </p>
                )}
              </div>
              <p className="text-xs text-charcoal-subtle leading-relaxed">
                * No reCAPTCHA en widget rápido — el mensaje se enviará
                igualmente.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setView("menu")}
                  className="min-h-11 flex-1 rounded-lg border border-sand px-3 py-2 text-xs text-charcoal-muted hover:border-charcoal-muted transition-colors"
                  aria-label={t("common.back")}
                >
                  ←
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="min-h-11 flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-charcoal px-4 py-2 text-xs font-medium uppercase tracking-wider text-cream disabled:opacity-60 hover:bg-olive transition-colors"
                >
                  {sending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : null}
                  {sending
                    ? t("supportWidget.formSending")
                    : t("supportWidget.formSend")}
                </button>
              </div>
            </form>
          )}

          {view === "success" && (
            <div className="p-6 text-center">
              <CheckCircle className="h-9 w-9 text-sage mx-auto" />
              <p className="mt-3 text-sm font-semibold text-charcoal">
                {t("supportWidget.formSuccess")}
              </p>
              <p className="mt-1 text-xs text-charcoal-muted">
                {t("supportWidget.formSuccessBody")}
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-4 text-xs font-medium text-sage hover:underline"
              >
                {t("supportWidget.dismiss")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-medium text-cream shadow-lg hover:bg-olive transition-colors focus:outline-none focus:ring-2 focus:ring-sage/60"
        aria-label={t("supportWidget.triggerLabel")}
      >
        {open ? (
          <X className="h-4 w-4" />
        ) : (
          <MessageCircle className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {open ? t("supportWidget.dismiss") : t("supportWidget.triggerLabel")}
        </span>
      </button>
    </div>
  );
}
