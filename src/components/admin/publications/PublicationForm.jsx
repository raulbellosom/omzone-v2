import { useState, useEffect } from "react";
import { Copy, Info, Tag } from "lucide-react";
import { Input } from "@/components/common/Input";
import AdminFormLayout from "@/components/admin/AdminFormLayout";
import { Card } from "@/components/common/Card";
import SlugInput from "@/components/admin/experiences/SlugInput";
import MediaImageField from "@/components/admin/media/MediaImageField";
import env from "@/config/env";
import { slugify, checkSlugAvailable } from "@/hooks/usePublications";
import { useExperiences } from "@/hooks/useExperiences";
import AdminSelect from "@/components/common/AdminSelect";
import SearchCombobox from "@/components/common/SearchCombobox";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const STATUS_OPTIONS = [
  { value: "draft", i18nKey: "admin.statuses.draft" },
  { value: "published", i18nKey: "admin.statuses.published" },
];

const EMPTY = {
  title: "",
  titleEs: "",
  slug: "",
  subtitle: "",
  subtitleEs: "",
  excerpt: "",
  excerptEs: "",
  tags: [],
  suggestedExperienceId: "",
  heroImageId: "",
  heroBucketId: "",
  status: "draft",
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
  ogImageId: "",
  ogBucketId: "",
};

function HelpBadge({ text }) {
  return (
    <span className="group relative ml-1 inline-flex items-center cursor-help">
      <Info className="h-3.5 w-3.5 text-charcoal-subtle group-hover:text-sage transition-colors" />
      <span className="pointer-events-none absolute left-5 top-0 z-20 hidden group-hover:flex bg-charcoal text-cream text-xs rounded-lg px-3 py-2 w-56 shadow-lg leading-snug">
        {text}
      </span>
    </span>
  );
}

/* Simple chip-style tag input */
function TagsInput({ value = [], onChange, disabled, placeholder }) {
  const [draft, setDraft] = useState("");

  function addTag(raw) {
    const tag = raw
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setDraft("");
  }

  function removeTag(tag) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e) {
    if ((e.key === "Enter" || e.key === ",") && draft.trim()) {
      e.preventDefault();
      addTag(draft);
    }
    if (e.key === "Backspace" && !draft && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 min-h-[42px] w-full rounded-xl border border-sand-dark bg-white px-3 py-2 text-sm",
        "focus-within:border-sage focus-within:ring-2 focus-within:ring-sage/20",
        disabled && "opacity-50 pointer-events-none",
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sage/10 text-sage text-xs font-medium"
        >
          <Tag className="h-3 w-3" />
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-sage/60 hover:text-sage ml-0.5 leading-none"
            >
              &times;
            </button>
          )}
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => draft.trim() && addTag(draft)}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] outline-none bg-transparent text-sm text-charcoal placeholder:text-charcoal-subtle"
        disabled={disabled}
      />
    </div>
  );
}

/* ---------- sub-components ---------- */

function Field({ label, required, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-charcoal">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-charcoal-subtle">{hint}</p>}
    </div>
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  disabled,
  rows = 3,
  maxLength,
  error,
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      maxLength={maxLength}
      className={cn(
        "flex w-full rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-subtle",
        "focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 resize-vertical",
        "disabled:opacity-50 disabled:bg-warm-gray",
        error && "border-red-400",
      )}
    />
  );
}

/* ---------- main form ---------- */

export default function PublicationForm({
  initialData,
  onSubmit,
  submitting,
  submitLabel,
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState(() => {
    const initial = initialData ?? {};
    return {
      ...EMPTY,
      ...Object.fromEntries(
        Object.entries(initial).map(([k, v]) => [
          k,
          v === null && typeof EMPTY[k] === "string" ? "" : v,
        ]),
      ),
      // Migrate legacy experienceId → suggestedExperienceId
      suggestedExperienceId:
        initial.suggestedExperienceId || initial.experienceId || "",
      tags: Array.isArray(initial.tags) ? initial.tags : [],
    };
  });
  const [errors, setErrors] = useState({});
  const [slugAutoGenerated, setSlugAutoGenerated] = useState(
    !initialData?.slug,
  );

  // Load experiences for the optional link
  const { data: experiences } = useExperiences({
    status: "published",
    limit: 100,
    offset: 0,
  });

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const e = { ...prev };
        delete e[field];
        return e;
      });
  }

  function handleTitle(value) {
    set("title", value);
    if (slugAutoGenerated) {
      set("slug", slugify(value));
    }
  }

  function handleSlugChange(value) {
    setSlugAutoGenerated(false);
    set("slug", value);
  }

  async function validate() {
    const e = {};
    if (!form.title.trim()) e.title = t("admin.publicationForm.titleRequired");
    if (!form.slug.trim()) {
      e.slug = t("admin.publicationForm.slugRequired");
    } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug)) {
      e.slug = t("admin.publicationForm.slugInvalid");
    } else {
      const available = await checkSlugAvailable(form.slug, initialData?.$id);
      if (!available) e.slug = t("admin.publicationForm.slugTaken");
    }
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = await validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      title: form.title.trim(),
      titleEs: form.titleEs.trim() || null,
      slug: form.slug.trim(),
      subtitle: form.subtitle.trim() || null,
      subtitleEs: form.subtitleEs.trim() || null,
      excerpt: form.excerpt.trim() || null,
      excerptEs: form.excerptEs.trim() || null,
      category: "blog",
      tags: form.tags.length > 0 ? form.tags : null,
      suggestedExperienceId: form.suggestedExperienceId || null,
      heroImageId: form.heroImageId || null,
      heroBucketId: form.heroBucketId || null,
      status: form.status,
      publishedAt:
        form.status === "published" && !form.publishedAt
          ? new Date().toISOString()
          : form.publishedAt || null,
      seoTitle: form.seoTitle.trim() || null,
      seoDescription: form.seoDescription.trim() || null,
      ogImageId: form.ogImageId || null,
      ogBucketId: form.ogBucketId || null,
    };

    await onSubmit(payload);
  }

  const isDisabled = submitting;
  const isEditMode = Boolean(initialData?.$id);

  const asideContent = (
    <>
      <div className="rounded-2xl border border-sand-dark/40 bg-white p-4 shadow-sm space-y-4">
        <p className="text-xs font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.formSections.publication")}
        </p>
        <Field label={t("admin.publicationForm.status")} required>
          <AdminSelect
            value={form.status}
            onChange={(v) => set("status", v)}
            options={STATUS_OPTIONS.map((o) => ({ ...o, label: t(o.i18nKey) }))}
            disabled={isDisabled}
          />
        </Field>
        {form.status === "published" && (
          <Field
            label={t("admin.publicationForm.publishDate")}
            hint={t("admin.publicationForm.publishDateHint")}
          >
            <Input
              type="datetime-local"
              value={form.publishedAt ? form.publishedAt.slice(0, 16) : ""}
              onChange={(e) =>
                set(
                  "publishedAt",
                  e.target.value ? new Date(e.target.value).toISOString() : "",
                )
              }
              disabled={isDisabled}
            />
          </Field>
        )}
      </div>

      {isEditMode && (
        <div className="rounded-2xl border border-sand-dark/40 bg-white p-4 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-charcoal-subtle uppercase tracking-wider">
            {t("admin.common.quickInfo") || "Quick Info"}
          </p>
          <div className="space-y-2.5 text-sm">
            <div>
              <p className="text-xs text-charcoal-subtle mb-1">Slug</p>
              <div className="flex items-center gap-1.5">
                <code className="text-xs text-charcoal bg-warm-gray rounded-lg px-2 py-1 font-mono truncate flex-1 border border-sand-dark/40">
                  {form.slug || "—"}
                </code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(form.slug)}
                  className="p-1.5 rounded-lg hover:bg-warm-gray text-charcoal-subtle hover:text-charcoal transition-colors"
                  title="Copy slug"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {initialData?.$createdAt && (
              <div>
                <p className="text-xs text-charcoal-subtle">Created</p>
                <p className="text-xs text-charcoal">
                  {new Date(initialData.$createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {initialData?.$updatedAt && (
              <div>
                <p className="text-xs text-charcoal-subtle">Last updated</p>
                <p className="text-xs text-charcoal">
                  {new Date(initialData.$updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <AdminFormLayout
      onSubmit={handleSubmit}
      submitting={submitting}
      disabled={isDisabled}
      submitLabel={submitLabel || t("admin.common.save")}
      asideChildren={asideContent}
    >
      {/* Blog-only info banner */}
      <div className="flex items-start gap-3 rounded-xl bg-sage/10 border border-sage/20 px-4 py-3 text-sm text-sage">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          {t("admin.publicationForm.blogInfoPart1")}{" "}
          <strong>{t("admin.publicationForm.blogInfoBold1")}</strong>
          {t("admin.publicationForm.blogInfoPart2")}{" "}
          <strong>{t("admin.publicationForm.blogInfoBold2")}</strong>{" "}
          {t("admin.publicationForm.blogInfoPart3")}{" "}
          <strong>{t("admin.publicationForm.blogInfoBold3")}</strong>{" "}
          {t("admin.publicationForm.blogInfoPart4")}
        </p>
      </div>

      {/* Identidad */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.publicationForm.sectionIdentity")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={t("admin.publicationForm.titleEn")}
            required
            error={errors.title}
          >
            <Input
              value={form.title}
              onChange={(e) => handleTitle(e.target.value)}
              placeholder={t("admin.publicationForm.placeholderTitleEn")}
              disabled={isDisabled}
              className={errors.title ? "border-red-400" : ""}
            />
          </Field>
          <Field label={t("admin.publicationForm.titleEs")}>
            <Input
              value={form.titleEs}
              onChange={(e) => set("titleEs", e.target.value)}
              placeholder={t("admin.publicationForm.placeholderTitleEs")}
              disabled={isDisabled}
            />
          </Field>
          <Field
            label={
              <span className="inline-flex items-center">
                {t("admin.publicationForm.slug")}
                <HelpBadge text="The URL-friendly identifier. Auto-generated from the title. Must be unique. Example: the-art-of-stillness" />
              </span>
            }
            required
            error={errors.slug}
          >
            <SlugInput
              value={form.slug}
              onChange={handleSlugChange}
              error={errors.slug}
              disabled={isDisabled}
            />
          </Field>
          <Field
            label={
              <span className="inline-flex items-center">
                Tags
                <HelpBadge text="Comma-separated labels to organize posts in the blog. Example: wellness, retreat, featured. Press Enter or comma to add a tag." />
              </span>
            }
            hint="Press Enter or comma to add each tag"
          >
            <TagsInput
              value={form.tags}
              onChange={(v) => set("tags", v)}
              disabled={isDisabled}
              placeholder="wellness, retreat, featured…"
            />
          </Field>
        </div>
      </Card>

      {/* Subtítulos y extracto */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.publicationForm.sectionSubtitleExcerpt")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={t("admin.publicationForm.subtitleEn")}
            hint={t("admin.publicationForm.maxChars500")}
          >
            <Input
              value={form.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              placeholder={t("admin.publicationForm.placeholderSubtitleEn")}
              disabled={isDisabled}
              maxLength={500}
            />
          </Field>
          <Field label={t("admin.publicationForm.subtitleEs")}>
            <Input
              value={form.subtitleEs}
              onChange={(e) => set("subtitleEs", e.target.value)}
              placeholder={t("admin.publicationForm.placeholderSubtitleEs")}
              disabled={isDisabled}
              maxLength={500}
            />
          </Field>
          <Field
            label={t("admin.publicationForm.excerptEn")}
            hint={t("admin.publicationForm.excerptHint")}
          >
            <Textarea
              value={form.excerpt}
              onChange={(v) => set("excerpt", v)}
              placeholder={t("admin.publicationForm.placeholderExcerptEn")}
              disabled={isDisabled}
              rows={3}
            />
          </Field>
          <Field label={t("admin.publicationForm.excerptEs")}>
            <Textarea
              value={form.excerptEs}
              onChange={(v) => set("excerptEs", v)}
              placeholder={t("admin.publicationForm.placeholderExcerptEs")}
              disabled={isDisabled}
              rows={3}
            />
          </Field>
        </div>
      </Card>

      {/* Experiencia sugerida */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          Suggested Experience
          <HelpBadge text="Optional. When set, a CTA card linking to this experience is shown at the bottom of the blog post. The post does NOT appear on the experience page." />
        </h2>
        <Field
          label="Experience"
          hint="The reader will see a 'Continue your journey' CTA card at the end of the post"
        >
          <SearchCombobox
            value={form.suggestedExperienceId}
            onValueChange={(v) => set("suggestedExperienceId", v)}
            options={(experiences || []).map((exp) => ({
              value: exp.$id,
              label: exp.publicName || exp.name,
            }))}
            disabled={isDisabled}
            placeholder={t("admin.publicationForm.noExperience")}
            searchPlaceholder={t("admin.publicationForm.searchExperience")}
            emptyMessage={t("admin.publicationForm.noExperiences")}
          />
        </Field>
      </Card>

      {/* Imagen de portada */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.publicationForm.sectionCoverImage")}
        </h2>
        <MediaImageField
          fileId={form.heroImageId}
          bucketId={form.heroBucketId || env.bucketExperienceMedia}
          buckets={env.imageBuckets}
          onChange={(fileId, bucketId) => {
            set("heroImageId", fileId);
            set("heroBucketId", bucketId || env.bucketExperienceMedia);
          }}
          disabled={isDisabled}
        />
      </Card>

      {/* SEO */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.publicationForm.sectionSEO")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={t("admin.publicationForm.seoTitle")}
            hint={t("admin.publicationForm.maxChars255")}
          >
            <Input
              value={form.seoTitle}
              onChange={(e) => set("seoTitle", e.target.value)}
              placeholder={t("admin.publicationForm.placeholderSeoTitle")}
              disabled={isDisabled}
              maxLength={255}
            />
          </Field>
          <Field
            label={t("admin.publicationForm.seoDescription")}
            hint={t("admin.publicationForm.maxChars500")}
          >
            <Textarea
              value={form.seoDescription}
              onChange={(v) => set("seoDescription", v)}
              placeholder={t("admin.publicationForm.placeholderSeoDescription")}
              disabled={isDisabled}
              maxLength={500}
              rows={2}
            />
          </Field>
        </div>
        <Field
          label={t("admin.publicationForm.ogImage")}
          hint={t("admin.publicationForm.ogImageHint")}
        >
          <MediaImageField
            fileId={form.ogImageId}
            bucketId={form.ogBucketId || env.bucketExperienceMedia}
            buckets={env.imageBuckets}
            onChange={(fileId, bucketId) => {
              set("ogImageId", fileId);
              set("ogBucketId", bucketId || env.bucketExperienceMedia);
            }}
            disabled={isDisabled}
            aspectRatio="og"
          />
        </Field>
      </Card>
    </AdminFormLayout>
  );
}
