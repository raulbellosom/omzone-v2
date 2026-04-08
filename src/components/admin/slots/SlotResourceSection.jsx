import { useState } from "react";
import { Plus, Trash2, UserCircle } from "lucide-react";
import {
  useSlotResources,
  createSlotResource,
  deleteSlotResource,
} from "@/hooks/useSlotResources";
import { useResources } from "@/hooks/useResources";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import AdminSelect from "@/components/common/AdminSelect";
import SearchCombobox from "@/components/common/SearchCombobox";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS = [
  { value: "lead", i18nKey: "admin.slotResource.roles.lead" },
  { value: "assistant", i18nKey: "admin.slotResource.roles.assistant" },
  { value: "support", i18nKey: "admin.slotResource.roles.support" },
  { value: "equipment", i18nKey: "admin.slotResource.roles.equipment" },
];

const ROLE_LABELS = {
  lead: "admin.slotResource.roleLabels.lead",
  assistant: "admin.slotResource.roleLabels.assistant",
  support: "admin.slotResource.roleLabels.support",
  equipment: "admin.slotResource.roleLabels.equipment",
};

export default function SlotResourceSection({ slotId }) {
  const { t } = useLanguage();
  const { data: assignments, loading, refetch } = useSlotResources(slotId);
  const { data: resources } = useResources();
  const [showForm, setShowForm] = useState(false);
  const [resourceId, setResourceId] = useState("");
  const [role, setRole] = useState("lead");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const resourceMap = Object.fromEntries(resources.map((r) => [r.$id, r]));
  const resourceOptions = resources
    .filter((r) => !assignments.some((a) => a.resourceId === r.$id))
    .map((r) => ({ value: r.$id, label: `${r.name} (${r.type})` }));

  async function handleAdd() {
    if (!resourceId) return;
    setSubmitting(true);
    try {
      await createSlotResource({
        slotId,
        resourceId,
        role,
        notes: notes || null,
      });
      setResourceId("");
      setRole("lead");
      setNotes("");
      setShowForm(false);
      refetch();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(assignmentId) {
    if (!window.confirm(t("admin.slotResource.deleteConfirm"))) return;
    setDeleting(assignmentId);
    try {
      await deleteSlotResource(assignmentId);
      refetch();
    } catch {
      // silent
    } finally {
      setDeleting(null);
    }
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-charcoal">
          {t("admin.slotResource.title")}
        </h2>
        {!showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            {t("admin.slotResource.assignResource")}
          </Button>
        )}
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-warm-gray animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && assignments.length === 0 && !showForm && (
        <p className="text-sm text-charcoal-muted py-2">
          {resources.length === 0
            ? t("admin.slotResource.noResources")
            : t("admin.slotResource.noAssignments")}
        </p>
      )}

      {/* Existing assignments */}
      {assignments.length > 0 && (
        <div className="space-y-2">
          {assignments.map((a) => {
            const resource = resourceMap[a.resourceId];
            return (
              <div
                key={a.$id}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-warm-gray/40"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <UserCircle className="h-5 w-5 text-charcoal-muted shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">
                      {resource?.name ?? a.resourceId}
                    </p>
                    {a.notes && (
                      <p className="text-xs text-charcoal-subtle truncate">
                        {a.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="default">
                    {t(ROLE_LABELS[a.role]) || a.role}
                  </Badge>
                  <button
                    onClick={() => handleRemove(a.$id)}
                    disabled={deleting === a.$id}
                    className="p-1 rounded text-charcoal-muted hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    aria-label={t("admin.slotResource.deleteAriaLabel")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="border border-sand-dark rounded-xl p-4 space-y-3 bg-warm-gray/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-charcoal">
                {t("admin.slotResource.resourceLabel")}
              </label>
              <SearchCombobox
                value={resourceId}
                onValueChange={setResourceId}
                options={resourceOptions}
                placeholder={t("admin.slotResource.selectResource")}
                searchPlaceholder={t("admin.slotResource.searchResource")}
                emptyMessage={t("admin.slotResource.noResourcesAvailable")}
                disabled={resourceOptions.length === 0}
              />
              {resourceOptions.length === 0 && (
                <p className="text-xs text-charcoal-subtle">
                  {t("admin.slotResource.allResourcesAssigned")}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-charcoal">
                {t("admin.slotResource.roleLabel")}
              </label>
              <AdminSelect
                value={role}
                onChange={setRole}
                options={ROLE_OPTIONS.map((o) => ({
                  ...o,
                  label: t(o.i18nKey),
                }))}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal">
              {t("admin.slotResource.notesLabel")}
            </label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("admin.slotResource.notesPlaceholder")}
              className="flex h-10 w-full rounded-xl border border-sand-dark bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setResourceId("");
              }}
            >
              {t("admin.slotResource.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={submitting || !resourceId}
            >
              {submitting
                ? t("admin.slotResource.assigning")
                : t("admin.slotResource.assign")}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
