import { useState } from "react";
import { User, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import AvatarUpload from "@/components/portal/profile/AvatarUpload";
import ProfileForm from "@/components/portal/profile/ProfileForm";

export default function PortalProfilePage() {
  const { user } = useAuth();
  const { profile, loading, error, updateProfile } = useUserProfile();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  async function handleAvatarUploaded(fileId) {
    setSaveError(null);
    try {
      await updateProfile({ photoId: fileId });
    } catch (err) {
      setSaveError(err.message);
    }
  }

  async function handleSave(data) {
    setSaving(true);
    setSaveError(null);
    try {
      await updateProfile(data);
    } catch (err) {
      setSaveError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 space-y-6 animate-pulse">
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full bg-warm-gray" />
          <div className="h-3 w-20 bg-warm-gray rounded" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-24 bg-warm-gray rounded" />
            <div className="h-11 bg-warm-gray rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 px-6">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-sage/10 text-sage flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-charcoal">
            Mi Perfil
          </h1>
          <p className="text-xs text-charcoal-muted">
            Edita tu información personal
          </p>
        </div>
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-8">
        <AvatarUpload
          name={profile?.displayName || user?.name}
          photoId={profile?.photoId}
          onUploaded={handleAvatarUploaded}
        />
      </div>

      {/* Save error */}
      {saveError && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {saveError}
        </div>
      )}

      {/* Form */}
      <ProfileForm
        profile={profile}
        email={user?.email}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
