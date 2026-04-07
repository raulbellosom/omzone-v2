import Badge from "@/components/common/Badge";

const CONFIG = {
  valid: { variant: "success", label: "Valid" },
  used: { variant: "default", label: "Used" },
  cancelled: { variant: "danger", label: "Cancelled" },
  expired: { variant: "warm", label: "Expired" },
};

export default function TicketStatusBadge({ status }) {
  const { variant, label } = CONFIG[status] ?? { variant: "warm", label: status };
  return <Badge variant={variant}>{label}</Badge>;
}
