import { Badge } from "@/components/common/Badge";

const CONFIG = {
  draft:     { variant: "warning",  label: "Borrador"  },
  published: { variant: "success",  label: "Publicada" },
  archived:  { variant: "charcoal", label: "Archivada" },
};

export default function StatusBadge({ status }) {
  const { variant, label } = CONFIG[status] ?? { variant: "warm", label: status };
  return <Badge variant={variant}>{label}</Badge>;
}
