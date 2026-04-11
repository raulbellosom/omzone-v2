import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  User,
  Shield,
  Phone,
  Globe,
  FileText,
  Check,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/hooks/useLanguage";
import AvatarUpload from "@/components/portal/profile/AvatarUpload";
import ChangePasswordForm from "@/components/common/ChangePasswordForm";
import Input from "@/components/common/Input";
import { Textarea } from "@/components/common/Textarea";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

const BIO_MAX = 1000;

export default function PortalProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { profile, loading, error, updateProfile } = useUserProfile();

  const [form, setForm] = useState({
    displayName: "",
    firstName: "",
    lastName: "",
    language: "es",
    bio: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || "",
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
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

  async function handleAvatarUploaded(fileId) {
    setSaveError(null);
    try {
      await updateProfile({ photoId: fileId });
    } catch (err) {
      setSaveError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = {
      displayName: form.displayName.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      language: form.language,
      bio: form.bio.trim(),
    };

    const errs = {};
    if (!trimmed.displayName && !trimmed.firstName) {
      errs.displayName = t("portal.profile.errorDisplayName");
    }
    if (trimmed.bio && trimmed.bio.length > BIO_MAX) {
      errs.bio = `Max ${BIO_MAX}`;
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      await updateProfile(trimmed);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ─── Loading skeleton ───
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warm-gray" />
          <div className="space-y-1.5">
            <div className="h-5 w-32 bg-warm-gray rounded" />
            <div className="h-3 w-48 bg-warm-gray rounded" />
          </div>
        </div>
        <Card className="p-6">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-24 h-24 rounded-full bg-warm-gray" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5 mb-5">
              <div className="h-3 w-24 bg-warm-gray rounded" />
              <div className="h-11 bg-warm-gray rounded-xl" />
            </div>
          ))}
        </Card>
      </div>
    );
  }

  // ─── Error state ───
  if (error) {
    return (
      <div className="text-center py-16 px-6">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  // ─── No profile available (client without doc) ───
  if (!profile && !loading) {
    return (
      <div className="text-center py-16 px-6">
        <User className="w-10 h-10 text-charcoal-subtle mx-auto mb-3" />
        <p className="text-sm text-charcoal-muted">
          {t("portal.profile.noProfileYet")}
        </p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t("portal.profile.pageTitle")}</title>
      </Helmet>

      <div className="space-y-6">
        {/* ─── Page header ─── */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage/10 text-sage flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-charcoal">
              {t("portal.profile.heading")}
            </h1>
            <p className="text-xs text-charcoal-muted">
              {t("portal.profile.subtitle")}
            </p>
          </div>
        </div>

        {saveError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {saveError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left column: Avatar + Quick info ─── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar card */}
            <Card className="p-6">
              <div className="flex flex-col items-center">
                <AvatarUpload
                  name={profile?.displayName || user?.name}
                  photoId={profile?.photoId}
                  onUploaded={handleAvatarUploaded}
                />
              </div>
            </Card>

            {/* Quick info card */}
            <Card className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
                  {t("portal.profile.emailLabel")}
                </label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="bg-warm-gray/50 text-charcoal-muted"
                />
                <p className="text-[11px] text-charcoal-subtle mt-1">
                  {t("portal.profile.emailHelper")}
                </p>
              </div>

              {/* Language toggle */}
              <div>
                <label className="block text-xs font-medium text-charcoal-muted mb-2">
                  <Globe className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                  {t("portal.profile.languageLabel")}
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
                      className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        form.language === opt.value
                          ? "bg-sage text-white shadow-sm"
                          : "bg-warm-gray/50 text-charcoal-muted hover:bg-sand"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* ─── Right column: Form sections ─── */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal info card */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-sage" />
                  <h2 className="text-sm font-semibold text-charcoal uppercase tracking-wider">
                    {t("portal.profile.sectionPersonal")}
                  </h2>
                </div>
                <p className="text-xs text-charcoal-muted mb-5">
                  {t("portal.profile.sectionPersonalDesc")}
                </p>

                <div className="space-y-4">
                  {/* Display name */}
                  <div>
                    <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
                      {t("portal.profile.displayNameLabel")}
                    </label>
                    <Input
                      icon={User}
                      value={form.displayName}
                      onChange={(e) =>
                        handleChange("displayName", e.target.value)
                      }
                      placeholder={t("portal.profile.displayNamePlaceholder")}
                    />
                    {errors.displayName && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.displayName}
                      </p>
                    )}
                  </div>

                  {/* First / Last name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
                        {t("portal.profile.firstNameLabel")}
                      </label>
                      <Input
                        value={form.firstName}
                        onChange={(e) =>
                          handleChange("firstName", e.target.value)
                        }
                        placeholder={t("portal.profile.firstNamePlaceholder")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
                        {t("portal.profile.lastNameLabel")}
                      </label>
                      <Input
                        value={form.lastName}
                        onChange={(e) =>
                          handleChange("lastName", e.target.value)
                        }
                        placeholder={t("portal.profile.lastNamePlaceholder")}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Contact card */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-sage" />
                  <h2 className="text-sm font-semibold text-charcoal uppercase tracking-wider">
                    {t("portal.profile.sectionContact")}
                  </h2>
                </div>
                <p className="text-xs text-charcoal-muted mb-5">
                  {t("portal.profile.sectionContactDesc")}
                </p>

                <div className="space-y-4">
                  {/* Phone (read-only from Auth) */}
                  <div>
                    <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
                      {t("portal.profile.phoneLabel")}
                    </label>
                    <Input
                      icon={Phone}
                      type="tel"
                      value={user?.phone || ""}
                      disabled
                      className="bg-warm-gray/50 text-charcoal-muted"
                    />
                    <p className="text-[11px] text-charcoal-subtle mt-1">
                      {t("portal.profile.phoneHelper") ||
                        "Phone is managed through your account settings."}
                    </p>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-medium text-charcoal-muted mb-1.5">
                      <FileText className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                      {t("portal.profile.bioLabel")}
                    </label>
                    <Textarea
                      value={form.bio}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      placeholder={t("portal.profile.bioPlaceholder")}
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
                </div>
              </Card>

              {/* Save button */}
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving}>
                  {saving
                    ? t("portal.profile.saving")
                    : t("portal.profile.saveButton")}
                </Button>
                {success && (
                  <span className="inline-flex items-center gap-1 text-sm text-sage font-medium animate-in fade-in">
                    <Check className="w-4 h-4" />
                    {t("portal.profile.saved")}
                  </span>
                )}
              </div>
            </form>
            {/* Security card */}{" "}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-sage" />
                <h2 className="text-sm font-semibold text-charcoal uppercase tracking-wider">
                  {t("portal.profile.sectionSecurity")}
                </h2>
              </div>
              <p className="text-xs text-charcoal-muted mb-5">
                {t("portal.profile.sectionSecurityDesc")}
              </p>
              <ChangePasswordForm />
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
