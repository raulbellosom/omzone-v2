import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

export default function SnapshotViewer({ snapshot }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  let parsed;
  try {
    parsed = typeof snapshot === "string" ? JSON.parse(snapshot) : snapshot;
  } catch {
    parsed = snapshot;
  }

  const formatted =
    typeof parsed === "object"
      ? JSON.stringify(parsed, null, 2)
      : String(parsed || "—");

  const isLong = formatted.length > 500;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-charcoal">
          {t("admin.snapshot.title")}
        </h3>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-sage hover:text-sage-darker transition-colors"
          >
            {expanded
              ? t("admin.snapshot.collapse")
              : t("admin.snapshot.expand")}
          </button>
        )}
      </div>
      <pre
        className={`text-xs bg-warm-gray/40 rounded-xl p-4 overflow-x-auto text-charcoal-subtle whitespace-pre-wrap break-words ${
          !expanded && isLong ? "max-h-64 overflow-y-auto" : ""
        }`}
      >
        {formatted}
      </pre>
    </div>
  );
}
