import { useState, useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/common/dialog";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { Eye, Code, Save, Loader2 } from "lucide-react";

const LANG_TABS = ["en", "es"];

export default function TemplateEditor({
  template,
  open,
  onOpenChange,
  onSave,
}) {
  const { t } = useLanguage();
  const iframeRef = useRef(null);

  const [subject, setSubject] = useState(template?.subject ?? "");
  const [subjectEs, setSubjectEs] = useState(template?.subjectEs ?? "");
  const [body, setBody] = useState(template?.body ?? "");
  const [bodyEs, setBodyEs] = useState(template?.bodyEs ?? "");
  const [isActive, setIsActive] = useState(template?.isActive ?? true);

  const [langTab, setLangTab] = useState("en");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentSubject = langTab === "en" ? subject : subjectEs;
  const currentBody = langTab === "en" ? body : bodyEs;

  const handleSubjectChange = (value) => {
    if (langTab === "en") setSubject(value);
    else setSubjectEs(value);
  };

  const handleBodyChange = (value) => {
    if (langTab === "en") setBody(value);
    else setBodyEs(value);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(template.$id, {
        subject,
        subjectEs,
        body,
        bodyEs,
        isActive,
      });
      onOpenChange(false);
    } catch {
      /* error handled by parent */
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("admin.settings.editTemplate")}: {template?.key}
          </DialogTitle>
        </DialogHeader>

        {/* Active toggle */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-charcoal-muted">
            {t("admin.settings.active")}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isActive ? "bg-sage" : "bg-warm-gray"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Language tabs */}
        <div className="flex gap-1 mb-4 border-b border-sand-dark/30">
          {LANG_TABS.map((lang) => (
            <button
              key={lang}
              onClick={() => setLangTab(lang)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                langTab === lang
                  ? "border-sage text-sage"
                  : "border-transparent text-charcoal-muted hover:text-charcoal"
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Subject */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-charcoal mb-1">
            {t("admin.settings.subject")}
          </label>
          <Input
            value={currentSubject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            placeholder={t("admin.settings.subjectPlaceholder")}
          />
        </div>

        {/* Body / Preview toggle */}
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium text-charcoal flex-1">
            {t("admin.settings.body")}
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 text-xs text-charcoal-muted hover:text-charcoal transition-colors"
          >
            {showPreview ? (
              <>
                <Code className="h-3.5 w-3.5" /> {t("admin.settings.viewCode")}
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />{" "}
                {t("admin.settings.viewPreview")}
              </>
            )}
          </button>
        </div>

        {showPreview ? (
          <iframe
            ref={iframeRef}
            title={t("admin.templatePreviewTitle")}
            srcDoc={currentBody}
            sandbox=""
            className="w-full h-80 border border-sand-dark rounded-lg bg-white"
          />
        ) : (
          <textarea
            value={currentBody}
            onChange={(e) => handleBodyChange(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-charcoal font-mono resize-y focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
          />
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("admin.common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="ml-1.5">
              {saving ? t("admin.common.saving") : t("admin.common.save")}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
