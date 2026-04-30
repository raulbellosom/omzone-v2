import { useState } from "react";
import PackageForm from "@/components/admin/packages/PackageForm";
import { createPackage } from "@/hooks/usePackages";
import { useLanguage } from "@/hooks/useLanguage";
import { createPackageItem } from "@/hooks/usePackageItems";
import { toast } from "sonner";

export default function PackageCreatePage() {
  const { t } = useLanguage();
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
          {t("admin.packages.createTitle")}
        </h1>
        <p className="text-sm text-charcoal-subtle mt-0.5">
          {t("admin.packages.createSubtitle")}
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
        submitLabel={t("admin.packages.createButton")}
      />
    </div>
  );
}
