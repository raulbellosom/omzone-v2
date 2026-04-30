import { useState, useCallback } from "react";
import { Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import SortableList from "@/components/common/SortableList";
import SortableItem from "@/components/common/SortableItem";
import HeroSlideCard from "@/components/admin/heroSlides/HeroSlideCard";
import HeroSlideForm from "@/components/admin/heroSlides/HeroSlideForm";
import {
  useAdminHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
} from "@/hooks/useHeroSlides";
import { useLanguage } from "@/hooks/useLanguage";

export default function HeroSlidesPage() {
  const { t } = useLanguage();
  const { data: slides, loading, error, refetch } = useAdminHeroSlides();

  const [mode, setMode] = useState(null); // null | 'create' | 'edit'
  const [editingSlide, setEditingSlide] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [reordering, setReordering] = useState(false);

  const openCreate = () => {
    setEditingSlide(null);
    setMode("create");
    setActionError(null);
  };

  const openEdit = (slide) => {
    setEditingSlide(slide);
    setMode("edit");
    setActionError(null);
  };

  const closeForm = () => {
    setMode(null);
    setEditingSlide(null);
  };

  const handleCreate = useCallback(
    async (payload) => {
      setSubmitting(true);
      setActionError(null);
      try {
        await createHeroSlide({
          ...payload,
          sortOrder: slides.length,
        });
        closeForm();
        refetch();
      } catch (err) {
        setActionError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
    [slides.length, refetch],
  );

  const handleUpdate = useCallback(
    async (payload) => {
      if (!editingSlide) return;
      setSubmitting(true);
      setActionError(null);
      try {
        await updateHeroSlide(editingSlide.$id, payload);
        closeForm();
        refetch();
      } catch (err) {
        setActionError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
    [editingSlide, refetch],
  );

  const handleDelete = useCallback(
    async (slide) => {
      if (!window.confirm(t("admin.heroSlides.deleteConfirm"))) return;
      setActionError(null);
      try {
        await deleteHeroSlide(slide.$id);
        refetch();
      } catch (err) {
        setActionError(err.message);
      }
    },
    [refetch, t],
  );

  const handleToggleVisibility = useCallback(
    async (slide) => {
      setActionError(null);
      try {
        await updateHeroSlide(slide.$id, { isVisible: !slide.isVisible });
        refetch();
      } catch (err) {
        setActionError(err.message);
      }
    },
    [refetch],
  );

  const handleReorder = useCallback(
    async (reordered) => {
      if (reordering) return;
      setReordering(true);
      try {
        await reorderHeroSlides(reordered);
        refetch();
      } catch (err) {
        setActionError(err.message);
      } finally {
        setReordering(false);
      }
    },
    [reordering, refetch],
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-charcoal">
            {t("admin.heroSlides.pageTitle")}
          </h1>
          <p className="text-sm text-charcoal-subtle max-w-2xl">
            {t("admin.heroSlides.pageDescription")}
          </p>
        </div>
        {!mode && slides.length > 0 && (
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t("admin.heroSlides.addSlide")}
          </Button>
        )}
      </div>

      {/* Error */}
      {(error || actionError) && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error || actionError}</p>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-warm-gray animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && slides.length === 0 && !mode && (
        <Card className="p-8 text-center">
          <ImageIcon className="h-8 w-8 text-charcoal-muted mx-auto mb-2" />
          <p className="text-sm text-charcoal-muted mb-3">
            {t("admin.heroSlides.empty")}
          </p>
          <p className="text-xs text-charcoal-subtle mb-4 max-w-md mx-auto">
            {t("admin.heroSlides.emptyHint")}
          </p>
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t("admin.heroSlides.addFirstSlide")}
          </Button>
        </Card>
      )}

      {/* Sortable list */}
      {!loading && slides.length > 0 && (
        <SortableList
          items={slides}
          onReorder={handleReorder}
          disabled={reordering || submitting}
          className="space-y-2"
        >
          {slides.map((slide) => (
            <SortableItem
              key={slide.$id}
              id={slide.$id}
              disabled={reordering || submitting}
            >
              {({ listeners, attributes, setNodeRef, style, isDragging }) => (
                <div ref={setNodeRef} style={style} {...attributes}>
                  <HeroSlideCard
                    slide={slide}
                    dragListeners={listeners}
                    isDragging={isDragging}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onToggleVisibility={handleToggleVisibility}
                    disabled={reordering || submitting}
                  />
                </div>
              )}
            </SortableItem>
          ))}
        </SortableList>
      )}

      {/* Inline form */}
      {mode === "create" && (
        <HeroSlideForm
          onSubmit={handleCreate}
          onCancel={closeForm}
          submitting={submitting}
        />
      )}
      {mode === "edit" && editingSlide && (
        <HeroSlideForm
          initialData={editingSlide}
          onSubmit={handleUpdate}
          onCancel={closeForm}
          submitting={submitting}
        />
      )}
    </div>
  );
}
