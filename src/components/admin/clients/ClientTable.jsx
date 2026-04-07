import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
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
  if (client.displayName) return client.displayName;
  const parts = [client.firstName, client.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "—";
}

function SkeletonRow() {
  return (
    <tr className="border-b border-sand-dark/40 animate-pulse">
      <td className="px-4 py-3"><div className="h-4 w-36 rounded bg-warm-gray" /></td>
      <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-28 rounded bg-warm-gray" /></td>
      <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-12 rounded bg-warm-gray" /></td>
      <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-24 rounded bg-warm-gray" /></td>
    </tr>
  );
}

export default function ClientTable({ clients, loading }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleRowClick = (userId) => {
    navigate(ROUTES.ADMIN_CLIENT_DETAIL.replace(":userId", userId));
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-sand-dark">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-warm-gray/50">
            <th className="px-4 py-3 text-left font-medium text-charcoal">
              {t("admin.clients.name")}
            </th>
            <th className="px-4 py-3 text-left font-medium text-charcoal hidden md:table-cell">
              {t("admin.clients.phone")}
            </th>
            <th className="px-4 py-3 text-left font-medium text-charcoal hidden lg:table-cell">
              {t("admin.clients.language")}
            </th>
            <th className="px-4 py-3 text-left font-medium text-charcoal hidden lg:table-cell">
              {t("admin.clients.registered")}
            </th>
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

          {!loading && clients.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-12 text-center text-sm text-charcoal-subtle">
                {t("admin.clients.emptyDefault")}
              </td>
            </tr>
          )}

          {!loading &&
            clients.map((client) => (
              <tr
                key={client.$id}
                className="border-b border-sand-dark/40 hover:bg-warm-gray/30 transition-colors cursor-pointer"
                onClick={() => handleRowClick(client.$id)}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-charcoal">{getDisplayName(client)}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-charcoal-muted">
                  {client.phone || "—"}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-charcoal-muted uppercase text-xs">
                  {client.language || "—"}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-charcoal-muted">
                  {formatDate(client.$createdAt)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
