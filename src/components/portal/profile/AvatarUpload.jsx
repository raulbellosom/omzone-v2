import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import UserAvatar from "@/components/common/UserAvatar";

export default function AvatarUpload({ name, photoId, onUploaded }) {
  const { upload, getPreviewUrl, uploading, error } = useAvatarUpload();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      const fileId = await upload(file);
      onUploaded(fileId);
    } catch {
      // error shown via hook state
      setPreview(null);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
    e.target.value = "";
  }

  const avatarUrl = preview || getPreviewUrl(photoId, { width: 200, height: 200 });

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
        disabled={uploading}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative group cursor-pointer disabled:cursor-not-allowed"
        aria-label="Cambiar foto de perfil"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name || "Avatar"}
            className="w-24 h-24 rounded-full object-cover ring-2 ring-sage/20"
          />
        ) : (
          <UserAvatar name={name} photoId={null} size="xl" />
        )}

        <div className="absolute inset-0 rounded-full bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-6 h-6 text-white" />
        </div>

        {uploading && (
          <div className="absolute inset-0 rounded-full bg-cream/60 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-sage border-t-transparent animate-spin" />
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs text-sage font-medium hover:underline disabled:opacity-50"
      >
        {uploading ? "Subiendo…" : "Cambiar foto"}
      </button>

      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
      <p className="text-[11px] text-charcoal-subtle">JPG, PNG o WebP · máx. 2 MB</p>
    </div>
  );
}
