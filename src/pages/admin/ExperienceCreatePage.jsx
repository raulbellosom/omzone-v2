import { useState } from "react";
import ExperienceForm from "@/components/admin/experiences/ExperienceForm";
import { createExperience } from "@/hooks/useExperiences";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

export default function ExperienceCreatePage() {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      await createExperience(payload);
      toast.success(t("admin.common.createdSuccess"));
    } catch (err) {
      setServerError(err.message);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display font-semibold text-charcoal">
          {t("admin.experiences.createTitle")}
        </h1>
        <p className="text-sm text-charcoal-subtle mt-0.5">
          {t("admin.experiences.createSubtitle")}
        </p>
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <ExperienceForm
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={t("admin.experiences.createButton")}
      />
    </div>
  );
}
