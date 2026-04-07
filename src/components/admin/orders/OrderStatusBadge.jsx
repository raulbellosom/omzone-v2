import Badge from "@/components/common/Badge";

const CONFIG = {
  pending: { variant: "warning", label: "Pending" },
  paid: { variant: "success", label: "Paid" },
  confirmed: { variant: "default", label: "Confirmed" },
  cancelled: { variant: "danger", label: "Cancelled" },
  refunded: { variant: "charcoal", label: "Refunded" },
};

export default function OrderStatusBadge({ status }) {
  const { variant, label } = CONFIG[status] ?? { variant: "warm", label: status };
  return <Badge variant={variant}>{label}</Badge>;
}
