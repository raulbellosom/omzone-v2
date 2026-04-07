import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddonForm from "@/components/admin/addons/AddonForm";
import { createAddon } from "@/hooks/useAddons";
import { ROUTES } from "@/constants/routes";

export default function AddonCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      await createAddon(payload);
      navigate(ROUTES.ADMIN_ADDONS);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-charcoal">Nuevo addon</h1>
        <p className="text-sm text-charcoal-subtle mt-0.5">
          Crea un complemento para asignar a experiencias
        </p>
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <AddonForm
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Crear addon"
      />
    </div>
  );
}
