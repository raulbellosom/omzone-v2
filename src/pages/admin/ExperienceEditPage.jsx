import { useState } from "react";
import { useParams } from "react-router-dom";
import ExperienceForm from "@/components/admin/experiences/ExperienceForm";
import ExperienceDetailTabs from "@/components/admin/experiences/ExperienceDetailTabs";
import { useExperience, updateExperience } from "@/hooks/useExperiences";
import { useLanguage } from "@/hooks/useLanguage";
import { Card } from "@/components/common/Card";
import { toast } from "sonner";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-5 space-y-4 animate-pulse">
          <div className="h-4 w-32 rounded bg-warm-gray" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-11 rounded-xl bg-warm-gray" />
            <div className="h-11 rounded-xl bg-warm-gray" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function ExperienceEditPage() {
  const { id } = useParams();
  const { data: experience, loading, error: loadError } = useExperience(id);
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      await updateExperience(id, payload);
      toast.success(t("admin.common.savedSuccess"));
    } catch (err) {
      setServerError(err.message);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSkeleton />;

  if (loadError || !experience) {
    return (
      <div>
        <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">
            {loadError ?? t("admin.experiences.notFound")}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display font-semibold text-charcoal">
          {t("admin.experiences.editTitle")}
        </h1>
        <p className="text-sm text-charcoal-subtle mt-0.5 truncate">
          {experience.publicName}
        </p>
      </div>

      <ExperienceDetailTabs />

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <ExperienceForm
        initialData={experience}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={t("admin.experiences.saveChanges")}
      />
    </div>
  );
}
