import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SlotForm from "@/components/admin/slots/SlotForm";
import ExperienceDetailTabs from "@/components/admin/experiences/ExperienceDetailTabs";
import { createSlot } from "@/hooks/useSlots";
import { useExperience } from "@/hooks/useExperiences";

export default function SlotCreatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: experience } = useExperience(id);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      await createSlot(payload);
      navigate(`/admin/experiences/${id}/slots`);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-charcoal">Nuevo slot</h1>
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
        submitLabel="Crear slot"
      />
    </div>
  );
}
