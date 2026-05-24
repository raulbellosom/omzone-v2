import { useState } from "react";
import { Video } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

function parseJsonSafe(str) {
  if (!str) return {};
  try {
    return JSON.parse(str) ?? {};
  } catch {
    return {};
  }
}

function isYoutube(url) {
  return /youtube\.com|youtu\.be/.test(url);
}

function isVimeo(url) {
  return /vimeo\.com/.test(url);
}

function isValidVideoUrl(url, t) {
  if (!url) return null; // null = empty, no error
  try {
    new URL(url);
  } catch {
    return t("admin.sectionBuilders.video.errorInvalidUrl");
  }
  if (!isYoutube(url) && !isVimeo(url)) {
    return t("admin.sectionBuilders.video.errorInvalidHost");
  }
  return null;
}

const inputCls =
  "w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal-subtle focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 disabled:opacity-50 disabled:bg-warm-gray";

export default function VideoMetadataField({ value, onChange, disabled }) {
  const { t } = useLanguage();
  const [url, setUrl] = useState(() => parseJsonSafe(value).url || "");

  const urlError = isValidVideoUrl(url, t);

  function handleChange(e) {
    const next = e.target.value;
    setUrl(next);
    if (!next.trim()) {
      onChange("");
    } else {
      onChange(JSON.stringify({ url: next.trim() }));
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-charcoal-subtle uppercase tracking-wider flex items-center gap-1.5">
        <Video className="h-3.5 w-3.5" />
        {t("admin.sectionBuilders.video.urlLabel")}
      </label>
      <input
        type="url"
        value={url}
        onChange={handleChange}
        placeholder={t("admin.sectionBuilders.video.urlPlaceholder")}
        disabled={disabled}
        className={inputCls}
      />
      {urlError ? (
        <p className="text-xs text-red-500">{urlError}</p>
      ) : (
        <p className="text-xs text-charcoal-subtle">
          {t("admin.sectionBuilders.video.urlHint")}
        </p>
      )}
    </div>
  );
}
