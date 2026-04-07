import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Archive, Globe, RotateCcw, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/common/Button";
import StatusBadge from "./StatusBadge";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const TYPE_LABELS = {
  session:   "Sesión",
  immersion: "Inmersión",
  retreat:   "Retiro",
  stay:      "Estancia",
  private:   "Privada",
  package:   "Paquete",
};

const SALE_MODE_LABELS = {
  direct:   "Directa",
  request:  "Por solicitud",
  assisted: "Asistida",
  pass:     "Por pase",
};

function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
        <h3 className="text-base font-semibold text-charcoal">{title}</h3>
        <p className="text-sm text-charcoal-subtle">{description}</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button
            type="button"
            variant={danger ? "destructive" : "default"}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ActionsMenu({ experience, onStatusChange, canAdmin }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // { type: "archive"|"publish"|"draft" }
  const navigate = useNavigate();

  const editUrl = ROUTES.ADMIN_EXPERIENCE_EDIT.replace(":id", experience.$id);

  function handleAction(type) {
    setOpen(false);
    setConfirm({ type });
  }

  function handleConfirm() {
    const { type } = confirm;
    setConfirm(null);
    if (type === "archive") onStatusChange(experience.$id, "archived");
    else if (type === "publish") onStatusChange(experience.$id, "published");
    else if (type === "draft") onStatusChange(experience.$id, "draft");
  }

  return (
    <>
      <ConfirmDialog
        open={confirm?.type === "archive"}
        title="Archivar experiencia"
        description="La experiencia dejará de estar visible públicamente. Puedes reactivarla en cualquier momento."
        confirmLabel="Archivar"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.type === "publish"}
        title="Publicar experiencia"
        description="La experiencia será visible públicamente en el catálogo."
        confirmLabel="Publicar"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />

      <div className="relative flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate(editUrl)}
          title="Editar"
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen((p) => !p)}
            title="Más acciones"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border border-sand-dark bg-white shadow-lg py-1">
                {canAdmin && experience.status !== "published" && (
                  <button
                    type="button"
                    onClick={() => handleAction("publish")}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-warm-gray"
                  >
                    <Globe className="h-4 w-4 text-emerald-600" />
                    Publicar
                  </button>
                )}
                {experience.status !== "draft" && (
                  <button
                    type="button"
                    onClick={() => handleAction("draft")}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-warm-gray"
                  >
                    <RotateCcw className="h-4 w-4 text-amber-600" />
                    Volver a borrador
                  </button>
                )}
                {experience.status !== "archived" && (
                  <button
                    type="button"
                    onClick={() => handleAction("archive")}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-warm-gray"
                  >
                    <Archive className="h-4 w-4 text-charcoal-subtle" />
                    Archivar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-sand">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-warm-gray animate-pulse" style={{ width: `${60 + i * 8}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function ExperienceTable({ experiences, loading, onStatusChange, canAdmin }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-sand-dark">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-sand-dark bg-warm-gray/50">
            <th className="px-4 py-3 text-left font-medium text-charcoal-subtle">Nombre</th>
            <th className="px-4 py-3 text-left font-medium text-charcoal-subtle">Tipo</th>
            <th className="px-4 py-3 text-left font-medium text-charcoal-subtle hidden sm:table-cell">Venta</th>
            <th className="px-4 py-3 text-left font-medium text-charcoal-subtle">Estado</th>
            <th className="px-4 py-3 text-right font-medium text-charcoal-subtle">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

          {!loading && experiences.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-charcoal-subtle">
                No hay experiencias. Crea la primera usando el botón "Nueva experiencia".
              </td>
            </tr>
          )}

          {!loading && experiences.map((exp) => (
            <tr key={exp.$id} className="border-b border-sand last:border-0 hover:bg-warm-gray/30 transition-colors">
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-charcoal truncate max-w-50">{exp.publicName}</p>
                  <p className="text-xs text-charcoal-subtle truncate max-w-50">{exp.name}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-charcoal-subtle">
                {TYPE_LABELS[exp.type] ?? exp.type}
              </td>
              <td className="px-4 py-3 text-charcoal-subtle hidden sm:table-cell">
                {SALE_MODE_LABELS[exp.saleMode] ?? exp.saleMode}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={exp.status} />
              </td>
              <td className="px-4 py-3">
                <ActionsMenu
                  experience={exp}
                  onStatusChange={onStatusChange}
                  canAdmin={canAdmin}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
