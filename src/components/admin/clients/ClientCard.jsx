import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { Card } from "@/components/common/Card";
import { useLanguage } from "@/hooks/useLanguage";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDisplayName(client) {
  const parts = [client.firstName, client.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "—";
}

export default function ClientCard({ client }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Card
      className="p-4 space-y-2 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() =>
        navigate(ROUTES.ADMIN_CLIENT_DETAIL.replace(":userId", client.$id))
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-charcoal truncate">
            {getDisplayName(client)}
          </p>
          {client.phone && (
            <p className="text-xs text-charcoal-muted truncate">
              {client.phone}
            </p>
          )}
        </div>
        {client.language && (
          <span className="shrink-0 text-xs font-medium uppercase text-charcoal-muted bg-warm-gray rounded px-2 py-0.5">
            {client.language}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-charcoal-muted">
        <span>{formatDate(client.$createdAt)}</span>
      </div>
    </Card>
  );
}
