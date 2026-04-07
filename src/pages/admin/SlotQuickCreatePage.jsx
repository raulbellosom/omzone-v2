import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import AdminSelect from "@/components/common/AdminSelect";
import { Badge } from "@/components/common/Badge";
import ExperienceDetailTabs from "@/components/admin/experiences/ExperienceDetailTabs";
import { useExperience } from "@/hooks/useExperiences";
import { useLocations } from "@/hooks/useLocations";
import { useRooms } from "@/hooks/useRooms";
import { createSlot } from "@/hooks/useSlots";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
];

const TIMEZONE_OPTIONS = [
  { value: "America/Mexico_City", label: "Ciudad de México (CST)" },
  { value: "America/Cancun", label: "Cancún (EST)" },
  { value: "America/Tijuana", label: "Tijuana (PST)" },
  { value: "UTC", label: "UTC" },
];

const MAX_SLOTS = 50;

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

export default function SlotQuickCreatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: experience } = useExperience(id);
  const { data: locations } = useLocations();

  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [timezone, setTimezone] = useState("America/Mexico_City");
  const [capacity, setCapacity] = useState("20");
  const [locationId, setLocationId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [errors, setErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [serverError, setServerError] = useState(null);

  const { data: rooms } = useRooms(locationId);

  function toggleDay(day) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  const generatedSlots = useMemo(() => {
    if (
      !dateFrom ||
      !dateTo ||
      selectedDays.length === 0 ||
      !startTime ||
      !endTime
    )
      return [];

    const slots = [];
    const start = new Date(dateFrom);
    const end = new Date(dateTo);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (selectedDays.includes(dayOfWeek)) {
        const dateStr = d.toISOString().slice(0, 10);
        slots.push({
          date: dateStr,
          startDatetime: `${dateStr}T${startTime}:00`,
          endDatetime: `${dateStr}T${endTime}:00`,
          label: new Date(d).toLocaleDateString("es-MX", {
            weekday: "short",
            day: "numeric",
            month: "short",
          }),
        });
      }
      if (slots.length >= MAX_SLOTS) break;
    }
    return slots;
  }, [dateFrom, dateTo, selectedDays, startTime, endTime]);

  function validate() {
    const errs = {};
    if (selectedDays.length === 0) errs.days = "Selecciona al menos un día";
    if (!startTime) errs.startTime = "Requerido";
    if (!endTime) errs.endTime = "Requerido";
    if (startTime >= endTime) errs.endTime = "Debe ser posterior al inicio";
    if (!dateFrom) errs.dateFrom = "Requerido";
    if (!dateTo) errs.dateTo = "Requerido";
    if (dateFrom && dateTo && dateFrom > dateTo)
      errs.dateTo = "Debe ser posterior al inicio";
    if (!capacity || parseInt(capacity, 10) <= 0)
      errs.capacity = "Debe ser mayor a 0";
    if (generatedSlots.length === 0 && Object.keys(errs).length === 0)
      errs.days = "Sin slots a generar";
    return errs;
  }

  async function handleCreate() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setCreating(true);
    setServerError(null);
    setProgress({ done: 0, total: generatedSlots.length });

    try {
      for (let i = 0; i < generatedSlots.length; i++) {
        const s = generatedSlots[i];
        await createSlot({
          experienceId: id,
          editionId: null,
          slotType: "single_session",
          startDatetime: new Date(s.startDatetime).toISOString(),
          endDatetime: new Date(s.endDatetime).toISOString(),
          timezone,
          capacity: parseInt(capacity, 10),
          locationId: locationId || null,
          roomId: roomId || null,
          status: "draft",
          notes: null,
        });
        setProgress({ done: i + 1, total: generatedSlots.length });
      }
      navigate(`/admin/experiences/${id}/slots`);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setCreating(false);
    }
  }

  const locationOptions = locations.map((l) => ({
    value: l.$id,
    label: l.name,
  }));
  const roomOptions = rooms.map((r) => ({ value: r.$id, label: r.name }));

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-charcoal">
          Crear slots recurrentes
        </h1>
        {experience && (
          <p className="text-sm text-charcoal-subtle mt-0.5 truncate">
            {experience.publicName}
          </p>
        )}
      </div>

      <ExperienceDetailTabs />

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      {/* Day selection */}
      <Card className="p-5 space-y-4">
        <h2 className="text-base font-semibold text-charcoal">
          Días de la semana
        </h2>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium border transition-colors",
                selectedDays.includes(day.value)
                  ? "bg-sage text-white border-sage"
                  : "bg-white text-charcoal-muted border-sand-dark hover:border-sage/50",
              )}
            >
              {day.label}
            </button>
          ))}
        </div>
        {errors.days && <p className="text-xs text-red-600">{errors.days}</p>}
      </Card>

      {/* Time & dates */}
      <Card className="p-5 space-y-4">
        <h2 className="text-base font-semibold text-charcoal">
          Horario y período
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Hora inicio" required error={errors.startTime}>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </Field>
          <Field label="Hora fin" required error={errors.endTime}>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </Field>
          <Field label="Desde" required error={errors.dateFrom}>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </Field>
          <Field label="Hasta" required error={errors.dateTo}>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Zona horaria" required>
            <AdminSelect
              value={timezone}
              onChange={setTimezone}
              options={TIMEZONE_OPTIONS}
            />
          </Field>
          <Field label="Capacidad" required error={errors.capacity}>
            <Input
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Ej: 20"
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
            <AdminSelect
              value={locationId}
              onChange={setLocationId}
              options={locationOptions}
              placeholder="Seleccionar locación"
              disabled={locations.length === 0}
            />
          </Field>
          <Field
            label="Sala / espacio"
            hint={
              !locationId
                ? "Selecciona una locación primero"
                : rooms.length === 0
                  ? "Sin salas"
                  : ""
            }
          >
            <AdminSelect
              value={roomId}
              onChange={setRoomId}
              options={roomOptions}
              placeholder="Seleccionar sala"
              disabled={!locationId || rooms.length === 0}
            />
          </Field>
        </div>
      </Card>

      {/* Preview */}
      {generatedSlots.length > 0 && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-charcoal">
              Preview — {generatedSlots.length} slot
              {generatedSlots.length !== 1 && "s"}
            </h2>
            {generatedSlots.length >= MAX_SLOTS && (
              <Badge variant="warm">Límite de {MAX_SLOTS} alcanzado</Badge>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {generatedSlots.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm px-3 py-1.5 rounded-lg bg-warm-gray/40"
              >
                <span className="text-charcoal font-medium min-w-[120px]">
                  {s.label}
                </span>
                <span className="text-charcoal-muted">
                  {startTime} – {endTime}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Progress */}
      {creating && (
        <Card className="p-5">
          <p className="text-sm text-charcoal mb-2">
            Creando slots... {progress.done}/{progress.total}
          </p>
          <div className="h-2 rounded-full bg-warm-gray overflow-hidden">
            <div
              className="h-full bg-sage rounded-full transition-all"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(`/admin/experiences/${id}/slots`)}
          disabled={creating}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleCreate}
          disabled={creating || generatedSlots.length === 0}
        >
          {creating
            ? `Creando ${progress.done}/${progress.total}...`
            : `Crear ${generatedSlots.length} slot${generatedSlots.length !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  );
}
