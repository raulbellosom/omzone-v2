import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useContactMessage, updateContactMessage } from "@/hooks/useContactMessages";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";
import { Card } from "@/components/common/Card";
import Button from "@/components/common/Button";
import {
  ArrowLeft,
  Mail,
  MailOpen,
  User,
  Clock,
  MessageSquare,
  Save,
  CheckCheck,
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
  const { t } = useLanguage();

  const { message, loading, error, refetch } = useContactMessage(id);

  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesStatus, setNotesStatus] = useState(null); // "saved" | "error"
  const [togglingRead, setTogglingRead] = useState(false);

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
                · {new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(message.readAt))}
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
          <InfoRow icon={User} label={t("admin.contactMessages.labelName")} value={message.name} />
          <InfoRow
            icon={Mail}
            label={t("admin.contactMessages.labelEmail")}
            value={
              <a href={`mailto:${message.email}`} className="text-sage hover:underline">
                {message.email}
              </a>
            }
          />
          <InfoRow
            icon={Clock}
            label={t("admin.contactMessages.labelDate")}
            value={formatDate(message.$createdAt)}
          />
        </div>
      </Card>

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
          <Button
            size="sm"
            onClick={handleSaveNotes}
            disabled={savingNotes}
          >
            <Save className="h-4 w-4 mr-1.5" />
            {t("admin.contactMessages.saveNotes")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
