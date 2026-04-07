import Badge from "@/components/common/Badge";

const CONFIG = {
  pending: { variant: "warning", label: "Pending" },
  processing: { variant: "sand", label: "Processing" },
  succeeded: { variant: "success", label: "Succeeded" },
  failed: { variant: "danger", label: "Failed" },
  refunded: { variant: "charcoal", label: "Refunded" },
};

export default function PaymentStatusBadge({ status }) {
  const { variant, label } = CONFIG[status] ?? { variant: "warm", label: status };
  return <Badge variant={variant}>{label}</Badge>;
}
