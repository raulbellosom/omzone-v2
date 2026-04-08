import Badge from "@/components/common/Badge";
import { useLanguage } from "@/hooks/useLanguage";

const CONFIG = {
  valid: { variant: "success", key: "valid" },
  used: { variant: "default", key: "used" },
  cancelled: { variant: "danger", key: "cancelled" },
  expired: { variant: "warm", key: "expired" },
};

export default function TicketStatusBadge({ status }) {
  const { t } = useLanguage();
  const cfg = CONFIG[status] ?? { variant: "warm", key: null };
  const label = cfg.key ? t(`admin.ticketStatus.${cfg.key}`) : status;
  return <Badge variant={cfg.variant}>{label}</Badge>;
}
