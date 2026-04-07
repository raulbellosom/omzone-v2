import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Plus, Package } from "lucide-react";
import {
  useAddonAssignments,
  createAddonAssignment,
  updateAddonAssignment,
  deleteAddonAssignment,
} from "@/hooks/useAddonAssignments";
import { useAddons } from "@/hooks/useAddons";
import { useExperience } from "@/hooks/useExperiences";
import ExperienceDetailTabs from "@/components/admin/experiences/ExperienceDetailTabs";
import AddonAssignmentTable from "@/components/admin/addons/AddonAssignmentTable";
import AddonAssignmentForm from "@/components/admin/addons/AddonAssignmentForm";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useLanguage } from "@/hooks/useLanguage";

function TableSkeleton() {
  const { t } = useLanguage();
  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-warm-gray/60 text-left text-charcoal-muted">
            <th className="px-4 py-3 font-medium">
              {t("admin.addonAssignments.addon")}
            </th>
            <th className="px-4 py-3 font-medium text-center">
              {t("admin.addonAssignments.required")}
            </th>
            <th className="px-4 py-3 font-medium text-center">
              {t("admin.addonAssignments.default")}
            </th>
            <th className="px-4 py-3 font-medium">
              {t("admin.addonAssignments.priceOverride")}
            </th>
            <th className="px-4 py-3 font-medium text-center">
              {t("admin.addonAssignments.order")}
            </th>
            <th className="px-4 py-3 font-medium text-right">
              {t("admin.addonAssignments.actions")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-dark">
          {[1, 2, 3].map((i) => (
            <tr key={i}>
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <td key={j} className="px-4 py-3">
                  <div
                    className="h-4 rounded bg-warm-gray animate-pulse"
                    style={{ width: `${45 + j * 8}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="md:hidden space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4 animate-pulse space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-warm-gray" />
            <div className="h-5 w-16 rounded-full bg-warm-gray" />
          </div>
          <div className="flex gap-4">
            <div className="h-3 w-20 rounded bg-warm-gray" />
            <div className="h-3 w-24 rounded bg-warm-gray" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function AddonAssignmentListPage() {
  const { id } = useParams();
  const { data: experience, loading: expLoading } = useExperience(id);
  const {
    data: assignments,
    loading,
    error,
    refetch,
  } = useAddonAssignments(id);
  const { data: allAddons, loading: addonsLoading } = useAddons({
    status: "active",
    limit: 200,
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [serverError, setServerError] = useState(null);

  const addonsMap = useMemo(() => {
    const map = {};
    allAddons.forEach((a) => {
      map[a.$id] = a;
    });
    return map;
  }, [allAddons]);

  const existingAddonIds = useMemo(
    () => assignments.map((a) => a.addonId),
    [assignments],
  );

  async function handleCreate(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      await createAddonAssignment({ ...payload, experienceId: id });
      setShowForm(false);
      refetch();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      await updateAddonAssignment(editing.$id, payload);
      setEditing(null);
      refetch();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(assignmentId) {
    setDeleting(assignmentId);
    try {
      await deleteAddonAssignment(assignmentId);
      refetch();
    } catch {
      // silent
    } finally {
      setDeleting(null);
    }
  }

  function handleEdit(assignment) {
    setEditing(assignment);
    setShowForm(false);
  }

  function handleCancel() {
    setShowForm(false);
    setEditing(null);
    setServerError(null);
  }

  const isLoading = loading || expLoading || addonsLoading;
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-charcoal">
            {t("admin.addonAssignments.title")}
          </h1>
          {experience && (
            <p className="text-sm text-charcoal-subtle mt-0.5 truncate">
              {experience.publicName}
            </p>
          )}
        </div>
        {!showForm && !editing && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t("admin.addonAssignments.assignAddon")}
            </span>
          </Button>
        )}
      </div>

      <ExperienceDetailTabs />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <AddonAssignmentForm
          availableAddons={allAddons}
          existingAddonIds={existingAddonIds}
          onSubmit={handleCreate}
          onCancel={handleCancel}
          submitting={submitting}
        />
      )}

      {/* Edit form */}
      {editing && (
        <AddonAssignmentForm
          availableAddons={allAddons}
          existingAddonIds={existingAddonIds}
          initialData={editing}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
          submitting={submitting}
        />
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <>
          <TableSkeleton />
          <CardSkeleton />
        </>
      )}

      {/* Empty state */}
      {!isLoading && !error && assignments.length === 0 && !showForm && (
        <Card className="p-10 text-center">
          <Package className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-charcoal mb-1">
            {t("admin.addonAssignments.emptyTitle")}
          </h2>
          <p className="text-sm text-charcoal-muted mb-4">
            {t("admin.addonAssignments.emptyMessage")}
          </p>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            {t("admin.addonAssignments.emptyButton")}
          </Button>
        </Card>
      )}

      {/* Assignments list */}
      {!isLoading && assignments.length > 0 && (
        <AddonAssignmentTable
          assignments={assignments}
          addonsMap={addonsMap}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
