import { Badge } from "@/components/common/Badge";
import { useLanguage } from "@/hooks/useLanguage";

const CONFIG = {
  draft: { variant: "warning", i18nKey: "admin.statusBadge.draft" },
  published: { variant: "success", i18nKey: "admin.statusBadge.published" },
  archived: { variant: "charcoal", i18nKey: "admin.statusBadge.archived" },
};

export default function StatusBadge({ status }) {
  const { t } = useLanguage();
  const { variant, i18nKey } = CONFIG[status] ?? {
    variant: "warm",
    i18nKey: null,
  };
  return <Badge variant={variant}>{i18nKey ? t(i18nKey) : status}</Badge>;
}
