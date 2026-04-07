import { useState, useCallback } from "react";
import { Plus, Layers } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import SortableList from "@/components/common/SortableList";
import SortableItem from "@/components/common/SortableItem";
import SectionCard from "./SectionCard";
import SectionForm from "./SectionForm";
import {
  usePublicationSections,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
} from "@/hooks/usePublicationSections";

export default function SectionManager({ publicationId }) {
  const { data: sections, loading, error, refetch } =
    usePublicationSections(publicationId);

  const [mode, setMode] = useState(null); // null | 'create' | 'edit'
  const [editingSection, setEditingSection] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [reordering, setReordering] = useState(false);

  const openCreate = () => {
    setEditingSection(null);
    setMode("create");
    setActionError(null);
  };

  const openEdit = (section) => {
    setEditingSection(section);
    setMode("edit");
    setActionError(null);
  };

  const closeForm = () => {
    setMode(null);
    setEditingSection(null);
  };

  const handleCreate = useCallback(
    async (payload) => {
      setSubmitting(true);
      setActionError(null);
      try {
        await createSection({
          ...payload,
          publicationId,
          sortOrder: sections.length,
        });
        closeForm();
        refetch();
      } catch (err) {
        setActionError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
    [publicationId, sections.length, refetch],
  );

  const handleUpdate = useCallback(
    async (payload) => {
      if (!editingSection) return;
      setSubmitting(true);
      setActionError(null);
      try {
        await updateSection(editingSection.$id, payload);
        closeForm();
        refetch();
      } catch (err) {
        setActionError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
    [editingSection, refetch],
  );

  const handleDelete = useCallback(
    async (section) => {
      if (!window.confirm(`¿Eliminar la sección "${section.title || section.sectionType}"?`))
        return;
      setActionError(null);
      try {
        await deleteSection(section.$id);
        refetch();
      } catch (err) {
        setActionError(err.message);
      }
    },
    [refetch],
  );

  const handleToggleVisibility = useCallback(
    async (section) => {
      setActionError(null);
      try {
        await updateSection(section.$id, { isVisible: !section.isVisible });
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
        await reorderSections(reordered);
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
    <div className="space-y-4">
      {/* Error */}
      {(error || actionError) && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error || actionError}</p>
        </Card>
      )}

      {/* Section list */}
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

      {!loading && sections.length === 0 && !mode && (
        <Card className="p-8 text-center">
          <Layers className="h-8 w-8 text-charcoal-muted mx-auto mb-2" />
          <p className="text-sm text-charcoal-muted mb-3">
            Esta publicación aún no tiene secciones.
          </p>
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Agregar primera sección
          </Button>
        </Card>
      )}

      {!loading && sections.length > 0 && (
        <SortableList
          items={sections}
          onReorder={handleReorder}
          disabled={reordering || submitting}
          className="space-y-2"
        >
          {sections.map((section) => (
            <SortableItem
              key={section.$id}
              id={section.$id}
              disabled={reordering || submitting}
            >
              {({ listeners, attributes, setNodeRef, style, isDragging }) => (
                <div ref={setNodeRef} style={style} {...attributes}>
                  <SectionCard
                    section={section}
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

      {/* Add section button — visible when there are sections and not in form mode */}
      {!loading && sections.length > 0 && !mode && (
        <Button type="button" variant="outline" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Agregar sección
        </Button>
      )}

      {/* Inline form */}
      {mode === "create" && (
        <SectionForm
          onSubmit={handleCreate}
          onCancel={closeForm}
          submitting={submitting}
        />
      )}
      {mode === "edit" && editingSection && (
        <SectionForm
          initialData={editingSection}
          onSubmit={handleUpdate}
          onCancel={closeForm}
          submitting={submitting}
        />
      )}
    </div>
  );
}
