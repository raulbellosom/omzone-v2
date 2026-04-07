import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ExperienceForm from "@/components/admin/experiences/ExperienceForm";
import ExperienceDetailTabs from "@/components/admin/experiences/ExperienceDetailTabs";
import { useExperience, updateExperience } from "@/hooks/useExperiences";
import { ROUTES } from "@/constants/routes";
import { Card } from "@/components/common/Card";

function LoadingSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl">
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
  const navigate = useNavigate();
  const { data: experience, loading, error: loadError } = useExperience(id);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      await updateExperience(id, payload);
      navigate(ROUTES.ADMIN_EXPERIENCES);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSkeleton />;

  if (loadError || !experience) {
    return (
      <div className="max-w-4xl">
        <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">
            {loadError ?? "No se encontró la experiencia."}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-charcoal">
          Editar experiencia
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
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
