import { useState, useEffect } from "react";
import { User, Phone, Globe, FileText, Check } from "lucide-react";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/common/Textarea";
import { Button } from "@/components/common/Button";
import { isValidPhone } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const BIO_MAX = 1000;

function validate(form, t) {
  const errors = {};
  if (!form.displayName?.trim() && !form.firstName?.trim()) {
    errors.displayName = "Se requiere al menos nombre visible o nombre.";
  }
  if (form.phone?.trim() && !isValidPhone(form.phone)) {
    errors.phone = t("common.phoneError");
  }
  if (form.bio && form.bio.length > BIO_MAX) {
    errors.bio = `Máximo ${BIO_MAX} caracteres.`;
  }
  return errors;
}

export default function ProfileForm({ profile, email, onSave, saving }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    displayName: "",
    firstName: "",
    lastName: "",
    phone: "",
    language: "es",
    bio: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || "",
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        language: profile.language || "es",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSuccess(false);
  }

  function handlePhoneBlur() {
    if (form.phone?.trim() && !isValidPhone(form.phone)) {
      setErrors((prev) => ({ ...prev, phone: t("common.phoneError") }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = {
      displayName: form.displayName.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      language: form.language,
      bio: form.bio.trim(),
    };
    const errs = validate(trimmed, t);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    try {
      await onSave(trimmed);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // parent handles error
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email — read only */}
      <div>
        <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
          Email
        </label>
        <Input
          value={email || ""}
          disabled
          className="bg-warm-gray text-charcoal-muted"
        />
        <p className="text-[11px] text-charcoal-subtle mt-1">
          Para cambiar tu email, contacta a soporte.
        </p>
      </div>

      {/* Display name */}
      <div>
        <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
          Nombre visible
        </label>
        <Input
          icon={User}
          value={form.displayName}
          onChange={(e) => handleChange("displayName", e.target.value)}
          placeholder="Cómo quieres que te llamemos"
        />
        {errors.displayName && (
          <p className="text-xs text-red-600 mt-1">{errors.displayName}</p>
        )}
      </div>

      {/* First / last name — two columns on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
            Nombre
          </label>
          <Input
            value={form.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            placeholder="Nombre"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
            Apellido
          </label>
          <Input
            value={form.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            placeholder="Apellido"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
          Teléfono
        </label>
        <Input
          icon={Phone}
          type="tel"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          onBlur={handlePhoneBlur}
          placeholder="+52 55 1234 5678"
        />
        {errors.phone && (
          <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Language toggle */}
      <div>
        <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
          <Globe className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
          Idioma preferido
        </label>
        <div className="flex gap-2">
          {[
            { value: "es", label: "Español" },
            { value: "en", label: "English" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleChange("language", opt.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                form.language === opt.value
                  ? "bg-sage text-white"
                  : "bg-warm-gray text-charcoal-muted hover:bg-sand"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
          <FileText className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
          Bio
        </label>
        <Textarea
          value={form.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
          placeholder="Cuéntanos un poco sobre ti…"
          rows={4}
          maxLength={BIO_MAX}
        />
        <div className="flex justify-between mt-1">
          {errors.bio ? (
            <p className="text-xs text-red-600">{errors.bio}</p>
          ) : (
            <span />
          )}
          <span
            className={`text-[11px] ${
              form.bio.length > BIO_MAX * 0.9
                ? "text-red-500"
                : "text-charcoal-subtle"
            }`}
          >
            {form.bio.length}/{BIO_MAX}
          </span>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
        {success && (
          <span className="inline-flex items-center gap-1 text-sm text-sage font-medium animate-in fade-in">
            <Check className="w-4 h-4" />
            Perfil actualizado
          </span>
        )}
      </div>
    </form>
  );
}
