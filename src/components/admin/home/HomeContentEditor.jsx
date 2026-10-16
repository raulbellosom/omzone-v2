import { useEffect, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import MediaImageField from "@/components/admin/media/MediaImageField";
import { useLanguage } from "@/hooks/useLanguage";
import { HOME_BUCKETS, readHomeContent, saveHomeContent } from "@/hooks/useHomeContent";
import { HOME_FIELDS, normalizeHomeContent, validateHomeContent } from "@/lib/homeContent";
import { auditAction, diffFields } from "@/lib/audit";
import { useSeoAccess } from "@/hooks/useSeoAccess";
import env from "@/config/env";

export default function HomeContentEditor({ children }) {
  const { t } = useLanguage();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError(false);
    readHomeContent().then((data) => { if (active) setRecord(data); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [attempt]);
  if (!record) return (
    <div className="space-y-6">
    <Card className="p-6 space-y-3" role="status">
      <p>{t(error ? "admin.homeContent.loadError" : "admin.homeContent.loading")}</p>
      {error && <Button onClick={() => setAttempt((value) => value + 1)}>{t("admin.homeContent.retry")}</Button>}
    </Card>
    {error && children}
    </div>
  );
  return <Editor record={record} onSaved={setRecord}>{children}</Editor>;
}

function Editor({ record, onSaved, children }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(() => normalizeHomeContent(record));
  const { canEditSeo } = useSeoAccess();
  const [tab, setTab] = useState("content");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [saved, setSaved] = useState(false);
  const savingRef = useRef(false);
  const initial = normalizeHomeContent(record);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const blocker = useBlocker(dirty);
  const tr = (key) => t(`admin.homeContent.${key}`);

  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [dirty]);
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (window.confirm(t("admin.homeContent.leave"))) blocker.proceed();
    else blocker.reset();
  }, [blocker, t]);

  function change(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    setSaved(false);
  }

  async function publish(event) {
    event.preventDefault();
    if (savingRef.current) return;
    const validation = validateHomeContent(form, HOME_BUCKETS);
    setErrors(validation.errors);
    if (!validation.valid) {
      const first = Object.keys(validation.errors)[0];
      setTab(first.startsWith("hero") || !canEditSeo ? "content" : "seo");
      requestAnimationFrame(() => document.getElementById(`home-${first}`)?.focus());
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setFailed(false);
    try {
      const document = await saveHomeContent(validation.data);
      auditAction({ action: "home_content.update", entityType: "home_content", entityId: "home", details: diffFields(initial, validation.data) });
      setForm(validation.data);
      setSaved(true);
      // Keep tabs and success feedback mounted when the stored timestamp changes.
      onSaved({ ...validation.data, $updatedAt: document.$updatedAt });
    } catch {
      setFailed(true);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  // Non-root admins only get the SEO tab when root enabled the flag.
  const tabKeys = canEditSeo ? ["content", "seo"] : ["content"];
  const activeTab = tabKeys.includes(tab) ? tab : "content";
  function tabKeyDown(event, index) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabKeys.length - 1 : (index + 1) % tabKeys.length;
    setTab(tabKeys[next]);
    document.getElementById(`home-tab-${tabKeys[next]}`)?.focus();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-charcoal">{tr("title")}</h1>
        <p className="mt-2 max-w-3xl text-sm text-charcoal-muted">{tr("intro")}</p>
      </div>
      <div role="tablist" aria-label={tr("title")} className="flex gap-1 border-b border-sand-dark">
        {tabKeys.map((key, index) => (
          <button key={key} id={`home-tab-${key}`} role="tab" type="button" aria-selected={activeTab === key}
            aria-controls={`home-panel-${key}`} tabIndex={activeTab === key ? 0 : -1}
            onKeyDown={(event) => tabKeyDown(event, index)} onClick={() => setTab(key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 ${activeTab === key ? "border-sage text-sage" : "border-transparent text-charcoal-muted"}`}>
            {tr(key)}
          </button>
        ))}
      </div>
      <form onSubmit={publish} noValidate className="space-y-5">
        {tabKeys.map((key) => (
          <section key={key} id={`home-panel-${key}`} role="tabpanel" aria-labelledby={`home-tab-${key}`} hidden={activeTab !== key}>
            <div className="grid gap-5 lg:grid-cols-2">
              {["en", "es"].map((locale) => (
                <Card key={locale} className="p-5 space-y-5">
                  <h2 className="font-semibold text-charcoal">{locale === "en" ? "English" : "Español"}</h2>
                  {(key === "content" ? ["heroTitle", "heroDescription"] : ["seoTitle", "seoDescription"]).map((field) => {
                    const name = field + (locale === "es" ? "Es" : "");
                    const multiline = field.endsWith("Description");
                    const Tag = multiline ? "textarea" : "input";
                    return (
                      <div key={name} className="space-y-2">
                        <label htmlFor={`home-${name}`} className="block text-sm font-medium">{tr(field)} *</label>
                        <Tag id={`home-${name}`} lang={locale} value={form[name]} disabled={saving} rows={multiline ? 4 : undefined}
                          maxLength={HOME_FIELDS[name]} onChange={(event) => change(name, event.target.value)}
                          aria-invalid={!!errors[name]} aria-describedby={`home-${name}-hint`}
                          className="w-full rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage/40 disabled:opacity-50" />
                        <p id={`home-${name}-hint`} className={`text-xs ${errors[name] ? "text-red-600" : "text-charcoal-muted"}`}>
                          {errors[name] ? tr(errors[name]) : `${form[name].length}/${HOME_FIELDS[name]}`}
                        </p>
                      </div>
                    );
                  })}
                  {key === "seo" && (
                    <div className="rounded-lg bg-warm-gray/50 p-4 text-sm space-y-2">
                      <p className="font-medium">{tr("preview")}</p>
                      <p className="text-sage break-words">{form[locale === "es" ? "seoTitleEs" : "seoTitle"]} — OMZONE</p>
                      <p className="text-charcoal-muted break-words">{form[locale === "es" ? "seoDescriptionEs" : "seoDescription"]}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
            {key === "seo" && (
              <Card className="mt-5 p-5 space-y-3">
                <h2 className="font-semibold">{tr("image")}</h2>
                <MediaImageField fileId={form.ogImageId} bucketId={form.ogBucketId || env.bucketPublicResources}
                  buckets={env.imageBuckets} aspectRatio="og" disabled={saving}
                  onChange={(fileId, bucketId) => { setForm((previous) => ({ ...previous, ogImageId: fileId, ogBucketId: fileId ? bucketId : "" })); setErrors((previous) => ({ ...previous, ogImageId: undefined })); setSaved(false); }} />
                {!form.ogImageId && <img src="/og-home.jpg" alt={tr("defaultImage")} className="w-48 rounded-lg" />}
                <p className="text-xs text-charcoal-muted">{tr("imageHint")}</p>
                {errors.ogImageId && <p role="alert" className="text-sm text-red-600">{tr("invalidImage")}</p>}
              </Card>
            )}
          </section>
        ))}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" loading={saving} disabled={!dirty}>{tr("publish")}</Button>
          <Button type="button" variant="outline" disabled={saving} onClick={async () => {
            if (dirty && !window.confirm(tr("leave"))) return;
            try { const fresh = await readHomeContent(); setForm(normalizeHomeContent(fresh)); onSaved(fresh); setSaved(false); setErrors({}); setFailed(false); } catch { setFailed(true); }
          }}>{tr("reload")}</Button>
          <a href="/" target="_blank" rel="noreferrer" className="text-sm underline">{tr("view")} EN</a>
          <a href="/es" target="_blank" rel="noreferrer" className="text-sm underline">{tr("view")} ES</a>
        </div>
        <p className="text-xs text-charcoal-muted">{tr("updated")}: {record.$updatedAt ? new Date(record.$updatedAt).toLocaleString() : "—"}</p>
        <div aria-live="polite">
          {dirty && <p className="text-sm text-charcoal-muted">{tr("unsaved")}</p>}
          {saved && <p className="text-sm text-sage">{tr("saved")}</p>}
          {failed && <p role="alert" className="text-sm text-red-600">{tr("saveError")}</p>}
        </div>
      </form>
      <section hidden={activeTab !== "content"} className="border-t border-sand-dark pt-6">
        <p className="mb-4 text-sm text-charcoal-muted">{tr("slidesHint")}</p>
        {children}
      </section>
    </div>
  );
}
