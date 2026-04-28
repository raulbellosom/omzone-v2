import { useState } from "react";
import { useParams } from "react-router-dom";
import EditionForm from "@/components/admin/experiences/EditionForm";
import ExperienceDetailTabs from "@/components/admin/experiences/ExperienceDetailTabs";
import { useExperience } from "@/hooks/useExperiences";
import { useLanguage } from "@/hooks/useLanguage";
import { createEdition } from "@/hooks/useEditions";
import { toast } from "sonner";

export default function EditionCreatePage() {
  const { id } = useParams();
  const { data: experience } = useExperience(id);
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      await createEdition({ ...payload, experienceId: id });
      toast.success(t("admin.common.createdSuccess"));
    } catch (err) {
      setServerError(err.message);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-charcoal">
          {t("admin.editions.createTitle")}
        </h1>
        {experience && (
          <p className="text-sm text-charcoal-subtle mt-0.5 truncate">
            {experience.publicName}
          </p>
        )}
      </div>

      <ExperienceDetailTabs />

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <EditionForm
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={t("admin.editions.createButton")}
      />
    </div>
  );
}
