import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ResourceForm from "@/components/admin/resources/ResourceForm";
import { useResource, updateResource } from "@/hooks/useResources";
import { ROUTES } from "@/constants/routes";
import { Card } from "@/components/common/Card";
import { useLanguage } from "@/hooks/useLanguage";

function LoadingSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl">
      {[1, 2].map((i) => (
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

export default function ResourceEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: resource, loading, error: loadError } = useResource(id);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      await updateResource(id, payload);
      navigate(`${ROUTES.ADMIN_RESOURCES}?tab=resources`);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSkeleton />;

  if (loadError || !resource) {
    return (
      <div className="max-w-4xl">
        <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">
            {loadError ?? t("admin.resources.notFound")}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-charcoal">
          {t("admin.resources.editTitle")}
        </h1>
        <p className="text-sm text-charcoal-subtle mt-0.5 truncate">
          {resource.name}
        </p>
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <ResourceForm
        initialData={resource}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={t("admin.resources.saveChanges")}
      />
    </div>
  );
}
