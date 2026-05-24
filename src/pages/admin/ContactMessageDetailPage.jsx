import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  useContactMessage,
  updateContactMessage,
} from "@/hooks/useContactMessages";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";
import { Card } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { getCategoryConfig } from "@/constants/contactCategories";
import {
  ArrowLeft,
  Mail,
  MailOpen,
  User,
  Clock,
  MessageSquare,
  Save,
  CheckCheck,
  Phone,
  FileText,
  Copy,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-charcoal-muted mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-charcoal-muted mb-0.5">{label}</p>
        <p className="text-sm text-charcoal break-all">{value || "—"}</p>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export default function ContactMessageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const { message, loading, error, refetch } = useContactMessage(id);

  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesStatus, setNotesStatus] = useState(null); // "saved" | "error"
  const [togglingRead, setTogglingRead] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pre-fill notes when message loads
  const [notesInitialized, setNotesInitialized] = useState(false);
  if (message && !notesInitialized) {
    setNotes(message.adminNotes || "");
    setNotesInitialized(true);
  }

  const handleToggleRead = async () => {
    if (!message) return;
    setTogglingRead(true);
    try {
      const newIsRead = !message.isRead;
      await updateContactMessage(id, {
        isRead: newIsRead,
        readAt: newIsRead ? new Date().toISOString() : null,
      });
      await refetch();
    } finally {
      setTogglingRead(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setNotesStatus(null);
    try {
      await updateContactMessage(id, { adminNotes: notes });
      setNotesStatus("saved");
      setTimeout(() => setNotesStatus(null), 3000);
    } catch {
      setNotesStatus("error");
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-48 bg-sand rounded animate-pulse" />
        <Card className="p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-sand rounded animate-pulse w-3/4" />
          ))}
        </Card>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="space-y-4">
        <Link
          to={ROUTES.ADMIN_CONTACT_MESSAGES}
          className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("admin.contactMessages.backToList")}
        </Link>
        <Card className="p-8 text-center text-charcoal-muted text-sm">
          {t("admin.contactMessages.notFound")}
        </Card>
      </div>
    );
  }

  // Parse extra category data (support messages carry preferredContact)
  let supportData = null;
  if (message.category === "support" && message.categoryData) {
    try {
      supportData = JSON.parse(message.categoryData);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            to={ROUTES.ADMIN_CONTACT_MESSAGES}
            className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("admin.contactMessages.backToList")}
          </Link>
          <h1 className="text-2xl font-display font-semibold text-charcoal">
            {message.subject || t("admin.contactMessages.noSubject")}
          </h1>
          <p className="text-sm text-charcoal-muted mt-0.5">
            {t("admin.contactMessages.receivedOn").replace(
              "{date}",
              formatDate(message.$createdAt),
            )}
          </p>
        </div>

        {/* Mark read/unread toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleRead}
          disabled={togglingRead}
          className="shrink-0"
        >
          {message.isRead ? (
            <>
              <Mail className="h-4 w-4 mr-1.5" />
              {t("admin.contactMessages.markUnread")}
            </>
          ) : (
            <>
              <CheckCheck className="h-4 w-4 mr-1.5" />
              {t("admin.contactMessages.markRead")}
            </>
          )}
        </Button>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2">
        {message.isRead ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-subtle bg-sand rounded-full px-3 py-1">
            <MailOpen className="h-3.5 w-3.5" />
            {t("admin.contactMessages.statusRead")}
            {message.readAt && (
              <span className="text-charcoal-subtle">
                ·{" "}
                {new Intl.DateTimeFormat("es-MX", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(message.readAt))}
              </span>
            )}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sage bg-sage/10 rounded-full px-3 py-1">
            <Mail className="h-3.5 w-3.5" />
            {t("admin.contactMessages.statusUnread")}
          </span>
        )}
      </div>

      {/* Sender info */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal">
          {t("admin.contactMessages.senderInfo")}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow
            icon={User}
            label={t("admin.contactMessages.labelName")}
            value={message.name}
          />
          <InfoRow
            icon={Mail}
            label={t("admin.contactMessages.labelEmail")}
            value={
              <a
                href={`mailto:${message.email}`}
                className="text-sage hover:underline"
              >
                {message.email}
              </a>
            }
          />
          <InfoRow
            icon={Clock}
            label={t("admin.contactMessages.labelDate")}
            value={formatDate(message.$createdAt)}
          />
          {message.phone && (
            <InfoRow
              icon={Phone}
              label={t("admin.contactMessages.labelPhone")}
              value={
                <a
                  href={`tel:${message.phone}`}
                  className="text-sage hover:underline"
                >
                  {message.phone}
                </a>
              }
            />
          )}
          {supportData?.preferredContact && (
            <InfoRow
              icon={MessageSquare}
              label={t("admin.contactMessages.labelPreferredContact")}
              value={
                {
                  email: t("admin.contactMessages.contactMethodEmail"),
                  call: t("admin.contactMessages.contactMethodCall"),
                  whatsapp: t("admin.contactMessages.contactMethodWhatsapp"),
                }[supportData.preferredContact] ?? supportData.preferredContact
              }
            />
          )}
        </div>

        {/* Category badge + reclassify */}
        <div className="border-t border-sand/60 pt-4 flex flex-wrap items-center gap-3">
          {(() => {
            const cfg = getCategoryConfig(message.category || "contact");
            const catLabel = language === "es" ? cfg.labelEs : cfg.labelEn;
            return (
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 ${cfg.color}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
                {catLabel}
              </span>
            );
          })()}
        </div>
      </Card>

      {/* Invoice data panel — only for invoice_request */}
      {message.category === "invoice_request" &&
        (() => {
          let invoiceData = {};
          try {
            if (message.categoryData)
              invoiceData = JSON.parse(message.categoryData);
          } catch {
            // ignore
          }
          const rows = [
            {
              label: t("admin.contactMessages.labelOrderCode"),
              value: invoiceData.orderCode,
            },
            {
              label: t("admin.contactMessages.labelWhatsapp"),
              value: invoiceData.whatsapp,
            },
            {
              label: t("admin.contactMessages.labelRfc"),
              value: invoiceData.rfc,
            },
            {
              label: t("admin.contactMessages.labelTaxRegime"),
              value: invoiceData.taxRegime,
            },
            {
              label: t("admin.contactMessages.labelCfdiUse"),
              value: invoiceData.cfdiUse,
            },
            {
              label: t("admin.contactMessages.labelFiscalEmail"),
              value: invoiceData.fiscalEmail,
            },
          ].filter((r) => r.value);
          const copyText = rows.map((r) => `${r.label}: ${r.value}`).join("\n");
          function handleCopy() {
            navigator.clipboard.writeText(copyText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
          return (
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-charcoal-muted" />
                  <h2 className="text-sm font-semibold text-charcoal">
                    {t("admin.contactMessages.invoiceDataTitle")}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {invoiceData.orderCode && (
                    <Link
                      to={
                        ROUTES.ADMIN_ORDER_DETAIL?.replace(
                          ":orderId",
                          invoiceData.orderCode,
                        ) || "#"
                      }
                      className="flex items-center gap-1 text-xs text-sage hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {t("admin.contactMessages.viewOrder")}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-charcoal-muted hover:text-charcoal transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied
                      ? t("admin.contactMessages.copiedFiscalData")
                      : t("admin.contactMessages.copyFiscalData")}
                  </button>
                </div>
              </div>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {rows.map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs text-charcoal-muted">{label}</dt>
                    <dd className="mt-0.5 text-sm text-charcoal font-medium">
                      {value}
                    </dd>
                  </div>
                ))}
                {invoiceData.additionalInfo && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-charcoal-muted">
                      {t("admin.contactMessages.labelAdditionalInfo")}
                    </dt>
                    <dd className="mt-0.5 text-sm text-charcoal leading-relaxed">
                      {invoiceData.additionalInfo}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          );
        })()}

      {/* Message content */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-charcoal-muted" />
          <h2 className="text-sm font-semibold text-charcoal">
            {t("admin.contactMessages.messageLabel")}
          </h2>
        </div>
        <p className="text-sm text-charcoal leading-relaxed whitespace-pre-wrap">
          {message.message}
        </p>
      </Card>

      {/* Admin notes */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-charcoal mb-1">
          {t("admin.contactMessages.adminNotesLabel")}
        </h2>
        <p className="text-xs text-charcoal-muted mb-3">
          {t("admin.contactMessages.adminNotesHint")}
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className={cn(
            "w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-sm text-charcoal",
            "placeholder:text-charcoal-subtle focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-sage",
            "resize-none transition-colors",
          )}
          placeholder={t("admin.contactMessages.adminNotesPlaceholder")}
        />
        <div className="flex items-center justify-between mt-3">
          <span
            className={cn(
              "text-xs transition-opacity",
              notesStatus === "saved" ? "text-sage opacity-100" : "opacity-0",
              notesStatus === "error" ? "text-red-500 opacity-100" : "",
            )}
          >
            {notesStatus === "saved"
              ? t("admin.contactMessages.notesSaved")
              : notesStatus === "error"
                ? t("admin.contactMessages.notesError")
                : "·"}
          </span>
          <Button size="sm" onClick={handleSaveNotes} disabled={savingNotes}>
            <Save className="h-4 w-4 mr-1.5" />
            {t("admin.contactMessages.saveNotes")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
