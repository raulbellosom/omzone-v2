import { useState, useRef, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Link } from "react-router-dom";
import SEOHead from "@/components/common/SEOHead";
import StructuredData from "@/components/common/StructuredData";
import env from "@/config/env";
import { useLanguage, localizedField } from "@/hooks/useLanguage";
import { usePublications } from "@/hooks/usePublications";
import { functions } from "@/lib/appwrite";
import { ROUTES } from "@/constants/routes";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  FileText,
  LayoutDashboard,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Phone,
} from "lucide-react";

// ─── FAQ Accordion item ────────────────────────────────────────────────────────
function FaqItem({ title, body, href }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-sand last:border-0">
      <button
        type="button"
        className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-sage transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-charcoal leading-snug">
          {title}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-charcoal-muted shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-charcoal-muted shrink-0" />
        )}
      </button>
      {open && (
        <div className="pb-5 space-y-2">
          {body && (
            <p className="text-sm text-charcoal-muted leading-relaxed">
              {body}
            </p>
          )}
          {href && (
            <Link
              to={href}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sage hover:text-olive transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {/* t passed from parent */}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Quick contact form ────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_METHODS = ["email", "call", "whatsapp"];

function QuickContactForm({ t }) {
  const captchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "",
    phone: "",
    message: "",
    preferredContact: "email",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  function setField(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
    // Clear the error for this field as soon as the user changes it
    if (errors[key])
      setErrors((e) => {
        const n = { ...e };
        delete n[key];
        return n;
      });
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = t("contact.validation.nameRequired");
    if (!form.email.trim()) e.email = t("contact.validation.emailRequired");
    else if (!EMAIL_RE.test(form.email.trim()))
      e.email = t("contact.validation.emailInvalid");
    if (!form.message.trim())
      e.message = t("contact.validation.messageRequired");
    if (!captchaToken) e.captcha = t("contact.validation.captchaRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    try {
      const execution = await functions.createExecution(
        env.functionSubmitContact,
        JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          message: form.message.trim(),
          recaptchaToken: captchaToken,
          subject: form.topic.trim() || undefined,
          category: "support",
          categoryData: { preferredContact: form.preferredContact },
        }),
        false,
        "/",
        "POST",
      );
      const result = JSON.parse(execution.responseBody);
      if (!result.ok) throw new Error(result.error?.code);
      setStatus("success");
    } catch {
      setStatus("error");
      captchaRef.current?.reset();
      setCaptchaToken(null);
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-10 w-10 text-sage mx-auto" />
        <p className="mt-3 font-display text-lg font-semibold text-charcoal">
          {t("help.contactSection.successTitle")}
        </p>
        <p className="mt-1 text-sm text-charcoal-muted">
          {t("help.contactSection.successBody")}
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setForm({
              name: "",
              email: "",
              topic: "",
              phone: "",
              message: "",
              preferredContact: "email",
            });
            setErrors({});
          }}
          className="mt-4 text-xs font-medium text-sage hover:underline"
        >
          {t("contact.form.sendAnother")}
        </button>
      </div>
    );
  }

  const sending = status === "sending";
  const viaLabel = {
    email: t("help.contactSection.viaEmail"),
    call: t("help.contactSection.viaCall"),
    whatsapp: t("help.contactSection.viaWhatsapp"),
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {status === "error" && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {t("contact.form.errorBody")}
        </div>
      )}

      {/* Name + email */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
            {t("help.contactSection.labelName")}
            <span className="text-red-400 ml-0.5">*</span>
          </label>
          <input
            type="text"
            placeholder={t("contact.form.namePlaceholder")}
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            disabled={sending}
            className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-white placeholder:text-charcoal-subtle/60 focus:outline-none focus:ring-2 focus:ring-sage/40 disabled:opacity-50 ${errors.name ? "border-red-400" : "border-sand"}`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
            {t("help.contactSection.labelEmail")}
            <span className="text-red-400 ml-0.5">*</span>
          </label>
          <input
            type="email"
            placeholder={t("contact.form.emailPlaceholder")}
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            disabled={sending}
            className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-white placeholder:text-charcoal-subtle/60 focus:outline-none focus:ring-2 focus:ring-sage/40 disabled:opacity-50 ${errors.email ? "border-red-400" : "border-sand"}`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
          {t("help.contactSection.labelPhone")}
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted pointer-events-none" />
          <input
            type="tel"
            placeholder="+52 33 1234 5678"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            disabled={sending}
            className="w-full rounded-lg border border-sand pl-9 pr-4 py-2.5 text-sm bg-white placeholder:text-charcoal-subtle/60 focus:outline-none focus:ring-2 focus:ring-sage/40 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Preferred contact method */}
      <div>
        <p className="text-xs font-medium text-charcoal-muted mb-2">
          {t("help.contactSection.labelPreferredContact")}
        </p>
        <div className="flex gap-2 flex-wrap">
          {CONTACT_METHODS.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setField("preferredContact", method)}
              disabled={sending}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                form.preferredContact === method
                  ? "bg-charcoal text-cream border-charcoal"
                  : "bg-white text-charcoal-muted border-sand hover:border-charcoal-muted"
              }`}
            >
              {viaLabel[method]}
            </button>
          ))}
        </div>
      </div>

      {/* Topic / Subject */}
      <div>
        <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
          {t("help.contactSection.labelTopic")}
        </label>
        <input
          type="text"
          placeholder={t("help.contactSection.topicPlaceholder")}
          value={form.topic}
          onChange={(e) => setField("topic", e.target.value)}
          disabled={sending}
          className="w-full rounded-lg border border-sand px-4 py-2.5 text-sm bg-white placeholder:text-charcoal-subtle/60 focus:outline-none focus:ring-2 focus:ring-sage/40 disabled:opacity-50"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
          {t("help.contactSection.labelMessage")}
          <span className="text-red-400 ml-0.5">*</span>
        </label>
        <textarea
          placeholder={t("contact.form.messagePlaceholder")}
          value={form.message}
          onChange={(e) => setField("message", e.target.value)}
          disabled={sending}
          rows={4}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-white placeholder:text-charcoal-subtle/60 focus:outline-none focus:ring-2 focus:ring-sage/40 disabled:opacity-50 resize-none ${errors.message ? "border-red-400" : "border-sand"}`}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-500">{errors.message}</p>
        )}
      </div>

      {/* reCAPTCHA */}
      <div>
        <ReCAPTCHA
          ref={captchaRef}
          sitekey={env.recaptchaSiteKey}
          onChange={(token) => {
            setCaptchaToken(token);
            if (errors.captcha)
              setErrors((e) => {
                const n = { ...e };
                delete n.captcha;
                return n;
              });
          }}
          onExpired={() => setCaptchaToken(null)}
          theme="light"
        />
        {errors.captcha && (
          <p className="mt-1 text-xs text-red-500">{errors.captcha}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={sending}
        className="flex items-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-sm font-medium tracking-widest uppercase text-cream disabled:opacity-60 hover:bg-olive transition-colors"
      >
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageSquare className="h-4 w-4" />
        )}
        {sending ? t("contact.form.sending") : t("contact.form.send")}
      </button>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HelpPage() {
  const { t, language } = useLanguage();
  const {
    data: faqs,
    loading,
    error,
  } = usePublications({
    category: "faq",
    status: "published",
    limit: 30,
  });

  // Build FAQ structured data from publications
  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((pub) => ({
            "@type": "Question",
            name: localizedField(pub, "title", language),
            acceptedAnswer: {
              "@type": "Answer",
              text:
                localizedField(pub, "excerpt", language) ||
                localizedField(pub, "title", language),
            },
          })),
        }
      : null;

  return (
    <>
      <SEOHead
        title={t("help.seoTitle")}
        description={t("help.seoDescription")}
        canonical={`${env.siteUrl}/help`}
      />
      {faqSchema && <StructuredData data={faqSchema} />}

      {/* Hero */}
      <section className="bg-charcoal pt-24 pb-16">
        <div className="container-shell text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-sage mb-3">
            {t("help.hero.eyebrow")}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-cream leading-tight">
            {t("help.hero.title")}
          </h1>
          <p className="mt-4 text-charcoal-muted leading-relaxed">
            {t("help.hero.subtitle")}
          </p>
        </div>
      </section>

      <div className="bg-cream py-16 md:py-24">
        <div className="container-shell max-w-5xl mx-auto space-y-20">
          {/* FAQ section */}
          <section id="faq">
            <div className="mb-8">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-charcoal">
                {t("help.faqSection.title")}
              </h2>
              <p className="mt-2 text-charcoal-muted">
                {t("help.faqSection.subtitle")}
              </p>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-charcoal-muted" />
              </div>
            ) : error ? (
              <p className="text-sm text-charcoal-muted py-8">
                {t("help.faqSection.errorLoading")}
              </p>
            ) : faqs.length === 0 ? (
              <p className="text-sm text-charcoal-muted py-8">
                {t("help.faqSection.noFaqs")}
              </p>
            ) : (
              <div className="bg-white rounded-2xl border border-sand/60 shadow-sm divide-y divide-sand px-6">
                {faqs.map((pub) => (
                  <FaqItem
                    key={pub.$id}
                    title={localizedField(pub, "title", language)}
                    body={localizedField(pub, "excerpt", language)}
                    href={`/p/${pub.slug}`}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Contact + Resources grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Quick contact */}
            <section>
              <div className="mb-6">
                <h2 className="font-display text-xl font-semibold text-charcoal">
                  {t("help.contactSection.title")}
                </h2>
                <p className="mt-1 text-sm text-charcoal-muted">
                  {t("help.contactSection.subtitle")}
                </p>
                <p className="mt-2 text-sm text-charcoal-muted">
                  {t("help.contactSection.emailCta")}{" "}
                  <a
                    href="mailto:hello@omzone.com"
                    className="text-sage hover:underline font-medium"
                  >
                    hello@omzone.com
                  </a>
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-sand/60 shadow-sm p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-4">
                  {t("help.contactSection.formTitle")}
                </p>
                <QuickContactForm t={t} />
              </div>
            </section>

            {/* Resources */}
            <section>
              <div className="mb-6">
                <h2 className="font-display text-xl font-semibold text-charcoal">
                  {t("help.resources.title")}
                </h2>
              </div>
              <div className="space-y-3">
                {[
                  {
                    icon: Mail,
                    label: t("help.resources.contact"),
                    to: ROUTES.CONTACT,
                    desc: "hello@omzone.com",
                  },
                  {
                    icon: FileText,
                    label: t("help.resources.invoice"),
                    to: ROUTES.BILLING_REQUEST,
                    desc: t("billing.hero.subtitle").substring(0, 80) + "…",
                  },
                  {
                    icon: LayoutDashboard,
                    label: t("help.resources.portal"),
                    to: ROUTES.PORTAL,
                    desc: "",
                  },
                ].map(({ icon: Icon, label, to, desc }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-start gap-4 rounded-xl bg-white border border-sand/60 shadow-sm p-4 hover:border-sage/40 transition-colors group"
                  >
                    <span className="shrink-0 h-9 w-9 rounded-full bg-sage/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-sage" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-charcoal group-hover:text-sage transition-colors">
                        {label}
                      </p>
                      {desc && (
                        <p className="mt-0.5 text-xs text-charcoal-muted leading-snug truncate">
                          {desc}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
