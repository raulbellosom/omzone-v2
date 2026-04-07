import { storage } from "@/lib/appwrite";
import env from "@/config/env";

const BUCKET = env.bucketUserAvatars;

/**
 * Reusable avatar component. Shows user photo or initials fallback.
 */
export default function UserAvatar({ name, photoId, size = "md" }) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };

  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (photoId && BUCKET) {
    const url = storage.getFilePreview(BUCKET, photoId, 160, 160);
    return (
      <img
        src={url}
        alt={name || "Avatar"}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-sage/20`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-sage/15 text-sage font-semibold flex items-center justify-center ring-2 ring-sage/10`}
    >
      {initials}
    </div>
  );
}
