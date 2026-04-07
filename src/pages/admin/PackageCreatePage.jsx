import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PackageForm from "@/components/admin/packages/PackageForm";
import { createPackage } from "@/hooks/usePackages";
import {
  createPackageItem,
} from "@/hooks/usePackageItems";
import { ROUTES } from "@/constants/routes";

export default function PackageCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(payload, items) {
    setSubmitting(true);
    setServerError(null);
    try {
      const pkg = await createPackage(payload);

      for (let i = 0; i < items.length; i++) {
        const { _tempId, $id, ...rest } = items[i];
        await createPackageItem({
          ...rest,
          packageId: pkg.$id,
          sortOrder: i,
        });
      }

      navigate(ROUTES.ADMIN_PACKAGES);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-charcoal">Nuevo paquete</h1>
        <p className="text-sm text-charcoal-subtle mt-0.5">
          Crea un paquete de experiencias con elementos incluidos
        </p>
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <PackageForm
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Crear paquete"
      />
    </div>
  );
}
