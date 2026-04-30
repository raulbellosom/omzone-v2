import { useState } from "react";
import { useParams } from "react-router-dom";
import SlotForm from "@/components/admin/slots/SlotForm";
import ExperienceDetailTabs from "@/components/admin/experiences/ExperienceDetailTabs";
import { createSlot } from "@/hooks/useSlots";
import { useExperience } from "@/hooks/useExperiences";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

export default function SlotCreatePage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { data: experience } = useExperience(id);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      await createSlot(payload);
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
          {t("admin.slots.createTitle")}
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

      <SlotForm
        experienceId={id}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={t("admin.slots.createButton")}
      />
    </div>
  );
}
