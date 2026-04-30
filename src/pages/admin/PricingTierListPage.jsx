import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Plus, DollarSign } from "lucide-react";
import {
  usePricingTiers,
  createPricingTier,
  updatePricingTier,
  reorderTiers,
} from "@/hooks/usePricingTiers";
import { useEditions } from "@/hooks/useEditions";
import { useExperience } from "@/hooks/useExperiences";
import ExperienceDetailTabs from "@/components/admin/experiences/ExperienceDetailTabs";
import { useLanguage } from "@/hooks/useLanguage";
import PricingTierTable from "@/components/admin/pricing/PricingTierTable";
import PricingTierForm from "@/components/admin/pricing/PricingTierForm";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

function TableSkeleton() {
  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-warm-gray/60 text-left text-charcoal-muted">
            <th className="px-3 py-3 font-medium w-10" />
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium text-right">Precio</th>
            <th className="px-4 py-3 font-medium text-center">Badge</th>
            <th className="px-4 py-3 font-medium text-center">Activo</th>
            <th className="px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-dark">
          {[1, 2, 3].map((i) => (
            <tr key={i}>
              {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                <td key={j} className="px-4 py-3">
                  <div
                    className="h-4 rounded bg-warm-gray animate-pulse"
                    style={{ width: `${40 + j * 7}%` }}
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
            <div className="h-3 w-16 rounded bg-warm-gray" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ onAdd, t }) {
  return (
    <Card className="p-10 text-center">
      <DollarSign className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
      <h2 className="text-lg font-semibold text-charcoal mb-1">
        {t("admin.pricingTiers.emptyTitle")}
      </h2>
      <p className="text-sm text-charcoal-muted mb-4">
        {t("admin.pricingTiers.emptyMessage")}
      </p>
      <Button size="sm" onClick={onAdd}>
        <Plus className="h-4 w-4" />
        {t("admin.pricingTiers.emptyButton")}
      </Button>
    </Card>
  );
}

export default function PricingTierListPage() {
  const { id } = useParams();
  const { data: experience, loading: expLoading } = useExperience(id);
  const { data: tiers, loading, error, refetch } = usePricingTiers(id);
  const { data: editions } = useEditions(id);
  const { t } = useLanguage();

  const [showForm, setShowForm] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [serverError, setServerError] = useState(null);

  function openCreate() {
    setEditingTier(null);
    setShowForm(true);
    setServerError(null);
  }

  function openEdit(tier) {
    setEditingTier(tier);
    setShowForm(true);
    setServerError(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditingTier(null);
    setServerError(null);
  }

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      if (editingTier) {
        await updatePricingTier(editingTier.$id, payload);
      } else {
        await createPricingTier({ ...payload, experienceId: id });
      }
      closeForm();
      refetch();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(tierId, isActive) {
    try {
      await updatePricingTier(tierId, { isActive });
      refetch();
    } catch {
      // silent — toggle reverts visually on next refetch
    }
  }

  const handleReorder = useCallback(
    async (reordered) => {
      setSwapping(true);
      try {
        await reorderTiers(reordered);
        refetch();
      } catch {
        // silent
      } finally {
        setSwapping(false);
      }
    },
    [refetch],
  );

  const isLoading = loading || expLoading;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-charcoal">
            {t("admin.pricingTiers.title")}
          </h1>
          {experience && (
            <p className="text-sm text-charcoal-subtle mt-0.5 truncate">
              {experience.publicName}
            </p>
          )}
        </div>
        {!showForm && tiers.length > 0 && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t("admin.pricingTiers.newTier")}
            </span>
          </Button>
        )}
      </div>

      <ExperienceDetailTabs />

      {(error || serverError) && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error || serverError}</p>
        </div>
      )}

      {/* Form (inline) */}
      {showForm && (
        <Card className="p-5 border-sage/30">
          <h2 className="text-base font-semibold text-charcoal mb-4">
            {editingTier
              ? t("admin.pricingTiers.editTitle")
              : t("admin.pricingTiers.createTitle")}
          </h2>
          <PricingTierForm
            initialData={editingTier}
            editions={editions}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel={
              editingTier
                ? t("admin.pricingTiers.saveChanges")
                : t("admin.pricingTiers.createButton")
            }
            onCancel={closeForm}
          />
        </Card>
      )}

      {/* Empty */}
      {!showForm && !isLoading && !error && tiers.length === 0 && (
        <EmptyState onAdd={openCreate} t={t} />
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <>
          <TableSkeleton />
          <CardSkeleton />
        </>
      )}

      {/* Table */}
      {!isLoading && tiers.length > 0 && (
        <PricingTierTable
          tiers={tiers}
          onToggleActive={handleToggleActive}
          onReorder={handleReorder}
          onEdit={openEdit}
          swapping={swapping}
        />
      )}
    </div>
  );
}
