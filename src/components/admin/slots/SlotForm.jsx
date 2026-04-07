import { useState, useEffect } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Textarea } from "@/components/common/Textarea";
import { useLocations } from "@/hooks/useLocations";
import { useRooms } from "@/hooks/useRooms";
import { useEditions } from "@/hooks/useEditions";
import AdminSelect from "@/components/common/AdminSelect";
import SearchCombobox from "@/components/common/SearchCombobox";
import { cn } from "@/lib/utils";

const SLOT_TYPE_OPTIONS = [
  { value: "single_session", label: "Sesión única" },
  { value: "multi_day", label: "Multi-día" },
  { value: "retreat_day", label: "Día de retiro" },
  { value: "private", label: "Privada" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicado" },
];

const TIMEZONE_OPTIONS = [
  { value: "America/Mexico_City", label: "Ciudad de México (CST)" },
  { value: "America/Cancun", label: "Cancún (EST)" },
  { value: "America/Tijuana", label: "Tijuana (PST)" },
  { value: "America/Los_Angeles", label: "Los Ángeles (PST)" },
  { value: "America/New_York", label: "Nueva York (EST)" },
  { value: "UTC", label: "UTC" },
];

const EMPTY = {
  editionId: "",
  slotType: "single_session",
  startDatetime: "",
  endDatetime: "",
  timezone: "America/Mexico_City",
  capacity: "",
  locationId: "",
  roomId: "",
  status: "draft",
  notes: "",
};

function Field({ label, required, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-charcoal">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-charcoal-subtle">{hint}</p>}
    </div>
  );
}

function toLocalDatetimeString(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SlotForm({
  experienceId,
  initialData = null,
  onSubmit,
  submitting = false,
  submitLabel = "Crear slot",
}) {
  const isEdit = !!initialData;
  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        editionId: initialData.editionId ?? "",
        slotType: initialData.slotType ?? "single_session",
        startDatetime: toLocalDatetimeString(initialData.startDatetime),
        endDatetime: toLocalDatetimeString(initialData.endDatetime),
        timezone: initialData.timezone ?? "America/Mexico_City",
        capacity: initialData.capacity?.toString() ?? "",
        locationId: initialData.locationId ?? "",
        roomId: initialData.roomId ?? "",
        status: initialData.status ?? "draft",
        notes: initialData.notes ?? "",
      };
    }
    return { ...EMPTY };
  });
  const [errors, setErrors] = useState({});

  const { data: locations } = useLocations();
  const { data: rooms } = useRooms(form.locationId);
  const { data: editions } = useEditions(experienceId);

  // Reset roomId when locationId changes
  useEffect(() => {
    if (!initialData || form.locationId !== (initialData.locationId ?? "")) {
      setForm((f) => ({ ...f, roomId: "" }));
    }
  }, [form.locationId]);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  }

  function validate() {
    const errs = {};
    if (!form.startDatetime) errs.startDatetime = "Requerido";
    if (!form.endDatetime) errs.endDatetime = "Requerido";
    if (
      form.startDatetime &&
      form.endDatetime &&
      new Date(form.startDatetime) >= new Date(form.endDatetime)
    ) {
      errs.endDatetime = "Debe ser posterior a la fecha de inicio";
    }
    if (!form.capacity || parseInt(form.capacity, 10) <= 0) {
      errs.capacity = "Debe ser mayor a 0";
    }
    if (!form.timezone) errs.timezone = "Requerido";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      experienceId,
      editionId: form.editionId || null,
      slotType: form.slotType,
      startDatetime: new Date(form.startDatetime).toISOString(),
      endDatetime: new Date(form.endDatetime).toISOString(),
      timezone: form.timezone,
      capacity: parseInt(form.capacity, 10),
      locationId: form.locationId || null,
      roomId: form.roomId || null,
      status: form.status,
      notes: form.notes || null,
    };

    onSubmit(payload);
  }

  const locationOptions = locations.map((l) => ({
    value: l.$id,
    label: l.name,
  }));
  const roomOptions = rooms.map((r) => ({ value: r.$id, label: r.name }));
  const editionOptions = editions.map((e) => ({ value: e.$id, label: e.name }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <Card className="p-5 space-y-4">
        <h2 className="text-base font-semibold text-charcoal">
          Información básica
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tipo de slot" required>
            <AdminSelect
              value={form.slotType}
              onChange={(v) => set("slotType", v)}
              options={SLOT_TYPE_OPTIONS}
            />
          </Field>
          <Field
            label="Edición"
            hint="Opcional — vincular a una edición específica"
          >
            <SearchCombobox
              value={form.editionId}
              onValueChange={(v) => set("editionId", v)}
              options={editionOptions}
              placeholder="Sin edición"
              searchPlaceholder="Buscar edición"
              emptyMessage="No se encontraron ediciones."
            />
          </Field>
        </div>
      </Card>

      {/* Date & time */}
      <Card className="p-5 space-y-4">
        <h2 className="text-base font-semibold text-charcoal">
          Fecha y horario
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Inicio" required error={errors.startDatetime}>
            <Input
              type="datetime-local"
              value={form.startDatetime}
              onChange={(e) => set("startDatetime", e.target.value)}
              className={errors.startDatetime ? "border-red-400" : ""}
            />
          </Field>
          <Field label="Fin" required error={errors.endDatetime}>
            <Input
              type="datetime-local"
              value={form.endDatetime}
              onChange={(e) => set("endDatetime", e.target.value)}
              className={errors.endDatetime ? "border-red-400" : ""}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Zona horaria" required error={errors.timezone}>
            <AdminSelect
              value={form.timezone}
              onChange={(v) => set("timezone", v)}
              options={TIMEZONE_OPTIONS}
              error={!!errors.timezone}
            />
          </Field>
          <Field label="Capacidad" required error={errors.capacity}>
            <Input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              placeholder="Ej: 20"
              className={errors.capacity ? "border-red-400" : ""}
            />
          </Field>
        </div>
      </Card>

      {/* Location */}
      <Card className="p-5 space-y-4">
        <h2 className="text-base font-semibold text-charcoal">Ubicación</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Locación"
            hint={locations.length === 0 ? "No hay locaciones registradas" : ""}
          >
            <SearchCombobox
              value={form.locationId}
              onValueChange={(v) => set("locationId", v)}
              options={locationOptions}
              placeholder="Seleccionar locación"
              searchPlaceholder="Buscar locación"
              emptyMessage="No hay locaciones."
              disabled={locations.length === 0}
            />
          </Field>
          <Field
            label="Sala / espacio"
            hint={
              !form.locationId
                ? "Selecciona una locación primero"
                : rooms.length === 0
                  ? "No hay salas en esta locación"
                  : ""
            }
          >
            <SearchCombobox
              value={form.roomId}
              onValueChange={(v) => set("roomId", v)}
              options={roomOptions}
              placeholder="Seleccionar sala"
              searchPlaceholder="Buscar sala"
              emptyMessage="No hay salas."
              disabled={!form.locationId || rooms.length === 0}
            />
          </Field>
        </div>
      </Card>

      {/* Status & notes */}
      <Card className="p-5 space-y-4">
        <h2 className="text-base font-semibold text-charcoal">
          Estado y notas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Estado">
            <AdminSelect
              value={form.status}
              onChange={(v) => set("status", v)}
              options={STATUS_OPTIONS}
            />
          </Field>
        </div>
        <Field label="Notas internas" hint="Solo visibles para el equipo">
          <Textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            placeholder="Notas opcionales..."
          />
        </Field>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
