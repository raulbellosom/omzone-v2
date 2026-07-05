import { useState } from "react";
import ResourceForm from "@/components/admin/resources/ResourceForm";
import { createResource } from "@/hooks/useResources";
import { useLanguage } from "@/hooks/useLanguage";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";

export default function ResourceCreatePage() {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      await createResource(payload);
      toast.success(t("admin.common.createdSuccess"));
    } catch (err) {
      const msg = getErrorMessage(err, t, "common.errorSaveFailed");
      setServerError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display font-semibold text-charcoal">
          {t("admin.resources.createTitle")}
        </h1>
        <p className="text-sm text-charcoal-subtle mt-0.5">
          {t("admin.resources.createSubtitle")}
        </p>
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <ResourceForm
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={t("admin.resources.createButton")}
      />
    </div>
  );
}
