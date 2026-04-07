import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicationForm from "@/components/admin/publications/PublicationForm";
import { createPublication } from "@/hooks/usePublications";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";

export default function PublicationCreatePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      const doc = await createPublication(payload);
      // Redirect to sections page so user can start adding content
      navigate(ROUTES.ADMIN_PUBLICATION_SECTIONS.replace(":id", doc.$id));
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-charcoal">
          {t("admin.publications.createTitle")}
        </h1>
        <p className="text-sm text-charcoal-subtle mt-0.5">
          {t("admin.publications.createSubtitle")}
        </p>
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <PublicationForm
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={t("admin.publications.createButton")}
      />
    </div>
  );
}
