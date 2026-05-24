import { useState, useEffect } from "react";
import { Link2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

function parseJsonSafe(str) {
  if (!str) return {};
  try {
    return JSON.parse(str) ?? {};
  } catch {
    return {};
  }
}

function init(value) {
  const v = parseJsonSafe(value);
  return {
    link: v.link || v.ctaLink || "",
    labelEn: v.buttonLabel || v.ctaText || "",
    labelEs: v.buttonLabelEs || v.ctaTextEs || "",
  };
}

const inputCls =
  "w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal-subtle focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 disabled:opacity-50 disabled:bg-warm-gray";

export default function CtaMetadataField({ value, onChange, disabled }) {
  const { t } = useLanguage();
  const [fields, setFields] = useState(() => init(value));

  function update(patch) {
    const next = { ...fields, ...patch };
    setFields(next);
    const { link, labelEn, labelEs } = next;
    if (!link && !labelEn && !labelEs) {
      onChange("");
    } else {
      onChange(
        JSON.stringify({
          link: link.trim(),
          buttonLabel: labelEn.trim(),
          buttonLabelEs: labelEs.trim(),
        }),
      );
    }
  }

  return (
    <div className="space-y-3">
      {/* Link */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-charcoal-subtle uppercase tracking-wider flex items-center gap-1.5">
          <Link2 className="h-3.5 w-3.5" />
          {t("admin.sectionBuilders.cta.linkLabel")}
        </label>
        <input
          type="text"
          value={fields.link}
          onChange={(e) => update({ link: e.target.value })}
          placeholder={t("admin.sectionBuilders.cta.placeholderLink")}
          disabled={disabled}
          className={inputCls}
        />
        <p className="text-xs text-charcoal-subtle">
          {t("admin.sectionBuilders.cta.linkHint")}
        </p>
      </div>

      {/* Button labels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-sage uppercase tracking-wider">
            {t("admin.sectionBuilders.cta.buttonLabelEN")}
          </label>
          <input
            type="text"
            value={fields.labelEn}
            onChange={(e) => update({ labelEn: e.target.value })}
            placeholder={t("admin.sectionBuilders.cta.placeholderLabelEN")}
            disabled={disabled}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider">
            {t("admin.sectionBuilders.cta.buttonLabelES")}
          </label>
          <input
            type="text"
            value={fields.labelEs}
            onChange={(e) => update({ labelEs: e.target.value })}
            placeholder={t("admin.sectionBuilders.cta.placeholderLabelES")}
            disabled={disabled}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}
