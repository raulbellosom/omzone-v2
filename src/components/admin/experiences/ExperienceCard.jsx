import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Archive, Globe, RotateCcw } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import StatusBadge from "./StatusBadge";
import { ROUTES } from "@/constants/routes";

const TYPE_LABELS = {
  session: "Sesión",
  immersion: "Inmersión",
  retreat: "Retiro",
  stay: "Estancia",
  private: "Privada",
  package: "Paquete",
};

const SALE_MODE_LABELS = {
  direct: "Directa",
  request: "Por solicitud",
  assisted: "Asistida",
  pass: "Por pase",
};

function ConfirmOverlay({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
        <h3 className="text-base font-semibold text-charcoal">{title}</h3>
        <p className="text-sm text-charcoal-subtle">{description}</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ExperienceCard({
  experience,
  onStatusChange,
  canAdmin,
}) {
  const navigate = useNavigate();
  const [confirmAction, setConfirmAction] = useState(null);
  const editUrl = ROUTES.ADMIN_EXPERIENCE_EDIT.replace(":id", experience.$id);

  function handleConfirm() {
    if (confirmAction) onStatusChange(experience.$id, confirmAction);
    setConfirmAction(null);
  }

  return (
    <>
      <ConfirmOverlay
        open={confirmAction === "archived"}
        title="Archivar experiencia"
        description="La experiencia dejará de estar visible públicamente. Puedes reactivarla en cualquier momento."
        confirmLabel="Archivar"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
      <Card className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-charcoal truncate">
              {experience.publicName}
            </p>
            <p className="text-xs text-charcoal-subtle truncate">
              {experience.name}
            </p>
          </div>
          <StatusBadge status={experience.status} />
        </div>

        <div className="flex items-center gap-3 text-xs text-charcoal-subtle">
          <span>{TYPE_LABELS[experience.type] ?? experience.type}</span>
          <span className="text-sand-dark">·</span>
          <span>
            {SALE_MODE_LABELS[experience.saleMode] ?? experience.saleMode}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-sand flex-wrap">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate(editUrl)}
            className="flex-1 min-w-0 justify-center"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>

          {canAdmin && experience.status !== "published" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange(experience.$id, "published")}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            >
              <Globe className="h-3.5 w-3.5" />
              Publicar
            </Button>
          )}

          {experience.status !== "archived" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmAction("archived")}
              className="text-charcoal-subtle"
            >
              <Archive className="h-3.5 w-3.5" />
              Archivar
            </Button>
          )}

          {experience.status !== "draft" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange(experience.$id, "draft")}
              className="text-amber-600 hover:bg-amber-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Borrador
            </Button>
          )}
        </div>
      </Card>
    </>
  );
}
