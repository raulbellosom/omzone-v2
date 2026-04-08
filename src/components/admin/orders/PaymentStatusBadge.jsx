import Badge from "@/components/common/Badge";
import { useLanguage } from "@/hooks/useLanguage";

const CONFIG = {
  pending: { variant: "warning", key: "pending" },
  processing: { variant: "sand", key: "processing" },
  succeeded: { variant: "success", key: "succeeded" },
  failed: { variant: "danger", key: "failed" },
  refunded: { variant: "charcoal", key: "refunded" },
};

export default function PaymentStatusBadge({ status }) {
  const { t } = useLanguage();
  const cfg = CONFIG[status] ?? { variant: "warm", key: null };
  const label = cfg.key ? t(`admin.paymentStatus.${cfg.key}`) : status;
  return <Badge variant={cfg.variant}>{label}</Badge>;
}
