import Badge from "@/components/common/Badge";
import { useLanguage } from "@/hooks/useLanguage";

const CONFIG = {
  pending: { variant: "warning", i18nKey: "admin.orderStatusBadge.pending" },
  paid: { variant: "success", i18nKey: "admin.orderStatusBadge.paid" },
  confirmed: {
    variant: "default",
    i18nKey: "admin.orderStatusBadge.confirmed",
  },
  cancelled: { variant: "danger", i18nKey: "admin.orderStatusBadge.cancelled" },
  refunded: { variant: "charcoal", i18nKey: "admin.orderStatusBadge.refunded" },
};

export default function OrderStatusBadge({ status }) {
  const { t } = useLanguage();
  const { variant, i18nKey } = CONFIG[status] ?? {
    variant: "warm",
    i18nKey: null,
  };
  return <Badge variant={variant}>{i18nKey ? t(i18nKey) : status}</Badge>;
}
