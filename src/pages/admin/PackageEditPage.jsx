import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PackageForm from "@/components/admin/packages/PackageForm";
import PackagePreview from "@/components/admin/packages/PackagePreview";
import { usePackage, updatePackage } from "@/hooks/usePackages";
import {
  usePackageItems,
  createPackageItem,
  updatePackageItem,
  deletePackageItem,
} from "@/hooks/usePackageItems";
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

export default function PackageEditPage() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const {
    data: pkg,
    loading: loadingPkg,
    error: loadError,
  } = usePackage(packageId);
  const { data: existingItems, loading: loadingItems } =
    usePackageItems(packageId);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(payload, items) {
    setSubmitting(true);
    setServerError(null);
    try {
      await updatePackage(packageId, payload);

      const existingIds = new Set(existingItems.map((it) => it.$id));
      const keptIds = new Set();

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const {
          _tempId,
          $id,
          $createdAt,
          $updatedAt,
          $permissions,
          $databaseId,
          $collectionId,
          ...rest
        } = item;

        if ($id && existingIds.has($id)) {
          await updatePackageItem($id, { ...rest, packageId, sortOrder: i });
          keptIds.add($id);
        } else {
          await createPackageItem({ ...rest, packageId, sortOrder: i });
        }
      }

      for (const existing of existingItems) {
        if (!keptIds.has(existing.$id)) {
          await deletePackageItem(existing.$id);
        }
      }

      navigate(ROUTES.ADMIN_PACKAGES);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingPkg || loadingItems) return <LoadingSkeleton />;

  if (loadError || !pkg) {
    return (
      <div className="max-w-4xl">
        <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">
            {loadError ?? "No se encontró el paquete."}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-charcoal">Editar paquete</h1>
        <p className="text-sm text-charcoal-subtle mt-0.5 truncate">
          {pkg.name}
        </p>
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <PackageForm
        initialData={pkg}
        initialItems={existingItems}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Guardar cambios"
      />

      {/* Preview */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider mb-3">
          Vista previa
        </h2>
        <PackagePreview pkg={pkg} items={existingItems} />
      </div>
    </div>
  );
}
