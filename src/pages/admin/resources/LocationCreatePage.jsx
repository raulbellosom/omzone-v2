import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationForm from "@/components/admin/resources/LocationForm";
import { createLocation } from "@/hooks/useLocations";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";

export default function LocationCreatePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      await createLocation(payload);
      navigate(`${ROUTES.ADMIN_RESOURCES}?tab=locations`);
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
          {t("admin.resources.locationCreateTitle")}
        </h1>
        <p className="text-sm text-charcoal-subtle mt-0.5">
          {t("admin.resources.locationCreateSubtitle")}
        </p>
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <LocationForm
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={t("admin.resources.locationCreateButton")}
      />
    </div>
  );
}
