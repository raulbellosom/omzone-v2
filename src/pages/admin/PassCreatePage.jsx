import { useState } from "react";
import PassForm from "@/components/admin/passes/PassForm";
import { createPass } from "@/hooks/usePasses";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

export default function PassCreatePage() {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      await createPass(payload);
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
          {t("admin.passes.createTitle")}
        </h1>
        <p className="text-sm text-charcoal-subtle mt-0.5">
          {t("admin.passes.createSubtitle")}
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
        submitLabel={t("admin.passes.createButton")}
      />
    </div>
  );
}
