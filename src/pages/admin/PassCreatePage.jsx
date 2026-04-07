import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PassForm from "@/components/admin/passes/PassForm";
import { createPass } from "@/hooks/usePasses";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";

export default function PassCreatePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
        <h1 className="text-xl font-semibold text-charcoal">
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
