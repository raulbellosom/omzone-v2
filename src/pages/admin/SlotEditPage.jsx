import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SlotForm from "@/components/admin/slots/SlotForm";
import SlotResourceSection from "@/components/admin/slots/SlotResourceSection";
import ExperienceDetailTabs from "@/components/admin/experiences/ExperienceDetailTabs";
import { useSlot, updateSlot } from "@/hooks/useSlots";
import { useExperience } from "@/hooks/useExperiences";
import { Card } from "@/components/common/Card";
import { useAuth } from "@/hooks/useAuth";

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

export default function SlotEditPage() {
  const { id, slotId } = useParams();
  const navigate = useNavigate();
  const { data: experience } = useExperience(id);
  const { data: slot, loading, error: loadError } = useSlot(slotId);
  const { isAdmin, isRoot } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const canManageResources = isAdmin || isRoot;

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      // Don't send bookedCount or experienceId in update
      const { bookedCount, experienceId, ...rest } = payload;
      await updateSlot(slotId, rest);
      navigate(`/admin/experiences/${id}/slots`);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSkeleton />;

  if (loadError || !slot) {
    return (
      <div className="max-w-4xl">
        <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">
            {loadError ?? "No se encontró el slot."}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-charcoal">Editar slot</h1>
        {experience && (
          <p className="text-sm text-charcoal-subtle mt-0.5 truncate">
            {experience.publicName}
          </p>
        )}
        {slot.bookedCount > 0 && (
          <p className="text-xs text-amber-600 mt-1">
            Este slot tiene {slot.bookedCount} reserva(s) activa(s)
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
        initialData={slot}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Guardar cambios"
      />

      {/* Resource assignments — admin/root only */}
      {canManageResources && (
        <SlotResourceSection slotId={slotId} />
      )}
    </div>
  );
}
