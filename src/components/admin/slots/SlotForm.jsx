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
import { useLanguage } from "@/hooks/useLanguage";

const SLOT_TYPE_OPTIONS = [
  { value: "single_session", i18nKey: "admin.slotForm.typeSingle" },
  { value: "multi_day", i18nKey: "admin.slotForm.typeMultiDay" },
  { value: "retreat_day", i18nKey: "admin.slotForm.typeRetreatDay" },
  { value: "private", i18nKey: "admin.slotForm.typePrivate" },
];

const STATUS_OPTIONS = [
  { value: "draft", i18nKey: "admin.statuses.draft" },
  { value: "published", i18nKey: "admin.statuses.published" },
];

const TIMEZONE_OPTIONS = [
  {
    value: "America/Mexico_City",
    i18nKey: "admin.slotQuickCreate.timezoneMexico",
  },
  { value: "America/Cancun", i18nKey: "admin.slotQuickCreate.timezoneCancun" },
  {
    value: "America/Tijuana",
    i18nKey: "admin.slotQuickCreate.timezoneTijuana",
  },
  { value: "America/Los_Angeles", label: "Los Angeles (PST)" },
  { value: "America/New_York", label: "New York (EST)" },
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
  submitLabel = "Create slot",
}) {
  const { t } = useLanguage();
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
    if (!form.startDatetime)
      errs.startDatetime = t("admin.slotQuickCreate.required");
    if (!form.endDatetime)
      errs.endDatetime = t("admin.slotQuickCreate.required");
    if (
      form.startDatetime &&
      form.endDatetime &&
      new Date(form.startDatetime) >= new Date(form.endDatetime)
    ) {
      errs.endDatetime = t("admin.slotForm.endDateError");
    }
    if (!form.capacity || parseInt(form.capacity, 10) <= 0) {
      errs.capacity = t("admin.slotForm.capacityError");
    }
    if (!form.timezone) errs.timezone = t("admin.slotQuickCreate.required");
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
          {t("admin.slotForm.sectionBasicInfo")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t("admin.slotForm.slotType")} required>
            <AdminSelect
              value={form.slotType}
              onChange={(v) => set("slotType", v)}
              options={SLOT_TYPE_OPTIONS.map((o) => ({
                ...o,
                label: t(o.i18nKey),
              }))}
            />
          </Field>
          <Field
            label={t("admin.slotForm.edition")}
            hint={t("admin.slotForm.editionHint")}
          >
            <SearchCombobox
              value={form.editionId}
              onValueChange={(v) => set("editionId", v)}
              options={editionOptions}
              placeholder={t("admin.slotForm.noEdition")}
              searchPlaceholder={t("admin.slotForm.searchEdition")}
              emptyMessage={t("admin.common.noResults")}
            />
          </Field>
        </div>
      </Card>

      {/* Date & time */}
      <Card className="p-5 space-y-4">
        <h2 className="text-base font-semibold text-charcoal">
          {t("admin.slotForm.sectionDateTime")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label={t("admin.slotForm.startDate")}
            required
            error={errors.startDatetime}
          >
            <Input
              type="datetime-local"
              value={form.startDatetime}
              onChange={(e) => set("startDatetime", e.target.value)}
              className={errors.startDatetime ? "border-red-400" : ""}
            />
          </Field>
          <Field
            label={t("admin.slotForm.endDate")}
            required
            error={errors.endDatetime}
          >
            <Input
              type="datetime-local"
              value={form.endDatetime}
              onChange={(e) => set("endDatetime", e.target.value)}
              className={errors.endDatetime ? "border-red-400" : ""}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label={t("admin.slotForm.timezone")}
            required
            error={errors.timezone}
          >
            <AdminSelect
              value={form.timezone}
              onChange={(v) => set("timezone", v)}
              options={TIMEZONE_OPTIONS.map((o) => ({
                ...o,
                label: o.i18nKey ? t(o.i18nKey) : o.label,
              }))}
              error={!!errors.timezone}
            />
          </Field>
          <Field
            label={t("admin.slotForm.capacity")}
            required
            error={errors.capacity}
          >
            <Input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              placeholder={t("admin.slotForm.capacityPlaceholder")}
              className={errors.capacity ? "border-red-400" : ""}
            />
          </Field>
        </div>
      </Card>

      {/* Location */}
      <Card className="p-5 space-y-4">
        <h2 className="text-base font-semibold text-charcoal">
          {t("admin.slotForm.sectionLocation")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label={t("admin.slotForm.locationLabel")}
            hint={locations.length === 0 ? t("admin.slotForm.noLocations") : ""}
          >
            <SearchCombobox
              value={form.locationId}
              onValueChange={(v) => set("locationId", v)}
              options={locationOptions}
              placeholder={t("admin.slotForm.selectLocation")}
              searchPlaceholder={t("admin.slotForm.searchLocation")}
              emptyMessage={t("admin.common.noResults")}
              disabled={locations.length === 0}
            />
          </Field>
          <Field
            label={t("admin.slotForm.room")}
            hint={
              !form.locationId
                ? t("admin.slotForm.selectLocationFirst")
                : rooms.length === 0
                  ? t("admin.slotForm.noLocations")
                  : ""
            }
          >
            <SearchCombobox
              value={form.roomId}
              onValueChange={(v) => set("roomId", v)}
              options={roomOptions}
              placeholder={t("admin.slotForm.selectRoom")}
              searchPlaceholder={t("admin.slotForm.searchRoom")}
              emptyMessage={t("admin.common.noResults")}
              disabled={!form.locationId || rooms.length === 0}
            />
          </Field>
        </div>
      </Card>

      {/* Status & notes */}
      <Card className="p-5 space-y-4">
        <h2 className="text-base font-semibold text-charcoal">
          {t("admin.slotForm.sectionStatusNotes")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t("admin.slotForm.status")}>
            <AdminSelect
              value={form.status}
              onChange={(v) => set("status", v)}
              options={STATUS_OPTIONS.map((o) => ({
                ...o,
                label: t(o.i18nKey),
              }))}
            />
          </Field>
        </div>
        <Field
          label={t("admin.slotForm.internalNotes")}
          hint={t("admin.slotForm.internalNotesHint")}
        >
          <Textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            placeholder={t("admin.slotForm.notesPlaceholder")}
          />
        </Field>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? t("admin.common.saving") : submitLabel}
        </Button>
      </div>
    </form>
  );
}
