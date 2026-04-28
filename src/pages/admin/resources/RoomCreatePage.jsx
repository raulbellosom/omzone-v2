import { useState } from "react";
import RoomForm from "@/components/admin/resources/RoomForm";
import { createRoom } from "@/hooks/useRooms";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

export default function RoomCreatePage() {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setServerError(null);
    try {
      await createRoom(payload);
      toast.success(t("admin.common.createdSuccess"));
    } catch (err) {
      setServerError(err.message);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-charcoal">
          {t("admin.resources.roomCreateTitle")}
        </h1>
        <p className="text-sm text-charcoal-subtle mt-0.5">
          {t("admin.resources.roomCreateSubtitle")}
        </p>
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <RoomForm
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={t("admin.resources.roomCreateButton")}
      />
    </div>
  );
}
