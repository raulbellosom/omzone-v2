import { Badge } from "@/components/common/Badge";
import { useLanguage } from "@/hooks/useLanguage";

const MANAGED_LABELS = ["admin", "operator", "client"];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function LabelBadges({ labels, t }) {
  if (!labels || labels.length === 0) {
    return <span className="text-charcoal-subtle">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((label) => (
        <Badge key={label} variant={label === "admin" ? "sage" : "warm"}>
          {t(`admin.userList.role${label.charAt(0).toUpperCase()}${label.slice(1)}`)}
        </Badge>
      ))}
    </div>
  );
}

function LabelActions({ user, onAssign, onRemove, pending, t }) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {MANAGED_LABELS.map((label) => {
        const has = user.labels.includes(label);
        const wouldBeLast = has && user.labels.length === 1;
        const capitalized = `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
        const actionKey = has
          ? `admin.userList.remove${capitalized}`
          : `admin.userList.make${capitalized}`;
        return (
          <button
            key={label}
            type="button"
            disabled={pending || (has && wouldBeLast)}
            title={has && wouldBeLast ? t("admin.userList.lastRoleWarning") : undefined}
            onClick={() =>
              has ? onRemove(user.$id, label) : onAssign(user.$id, label)
            }
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              has
                ? "bg-red-50 text-red-700 hover:bg-red-100"
                : "bg-sage/10 text-sage-dark hover:bg-sage/20"
            }`}
          >
            {t(actionKey)}
          </button>
        );
      })}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-sand-dark/40 animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 w-36 rounded bg-warm-gray" />
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <div className="h-4 w-40 rounded bg-warm-gray" />
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="h-4 w-24 rounded bg-warm-gray" />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="h-4 w-32 rounded bg-warm-gray ml-auto" />
      </td>
    </tr>
  );
}

export default function UserTable({
  users,
  loading,
  onAssign,
  onRemove,
  pendingUserId,
}) {
  const { t } = useLanguage();

  return (
    <div className="overflow-x-auto rounded-xl border border-sand-dark">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-sand-dark bg-warm-gray/60">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.userList.name")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden md:table-cell">
              {t("admin.userList.email")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden lg:table-cell">
              {t("admin.userList.roles")}
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.userList.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

          {!loading && users.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-12 text-center text-sm text-charcoal-subtle"
              >
                {t("admin.userList.emptyDefault")}
              </td>
            </tr>
          )}

          {!loading &&
            users.map((user) => (
              <tr
                key={user.$id}
                className="border-b border-sand last:border-0 hover:bg-warm-gray/30 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-charcoal">
                  {user.name || "—"}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-charcoal-muted">
                  {user.email || "—"}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <LabelBadges labels={user.labels} t={t} />
                </td>
                <td className="px-4 py-3">
                  <LabelActions
                    user={user}
                    onAssign={onAssign}
                    onRemove={onRemove}
                    pending={pendingUserId === user.$id}
                    t={t}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export { formatDate };
