import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PassForm from "@/components/admin/passes/PassForm";
import { createPass } from "@/hooks/usePasses";
import { ROUTES } from "@/constants/routes";

export default function PassCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      await createPass(payload);
      navigate(ROUTES.ADMIN_PASSES);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-charcoal">Nuevo pase</h1>
        <p className="text-sm text-charcoal-subtle mt-0.5">
          Crea un pase consumible de créditos de experiencias
        </p>
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <PassForm
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Crear pase"
      />
    </div>
  );
}
