import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AddonForm from "@/components/admin/addons/AddonForm";
import { useAddon, updateAddon } from "@/hooks/useAddons";
import { Card } from "@/components/common/Card";
import { ROUTES } from "@/constants/routes";

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

export default function AddonEditPage() {
  const { addonId } = useParams();
  const navigate = useNavigate();
  const { data: addon, loading, error: loadError } = useAddon(addonId);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      await updateAddon(addonId, payload);
      navigate(ROUTES.ADMIN_ADDONS);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSkeleton />;

  if (loadError || !addon) {
    return (
      <div className="max-w-4xl">
        <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">
            {loadError ?? "No se encontró el addon."}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-charcoal">Editar addon</h1>
        <p className="text-sm text-charcoal-subtle mt-0.5 truncate">
          {addon.name}
        </p>
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <AddonForm
        initialData={addon}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
