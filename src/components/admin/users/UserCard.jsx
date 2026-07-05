import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { useLanguage } from "@/hooks/useLanguage";

const MANAGED_LABELS = ["admin", "operator", "client"];

export default function UserCard({ user, onAssign, onRemove, pendingUserId }) {
  const { t } = useLanguage();
  const pending = pendingUserId === user.$id;

  return (
    <Card className="p-4 space-y-3">
      <div className="min-w-0">
        <p className="font-medium text-charcoal truncate">
          {user.name || "—"}
        </p>
        <p className="text-xs text-charcoal-muted truncate">
          {user.email || "—"}
        </p>
      </div>

      {user.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {user.labels.map((label) => (
            <Badge key={label} variant={label === "admin" ? "sage" : "warm"}>
              {t(
                `admin.userList.role${label.charAt(0).toUpperCase()}${label.slice(1)}`,
              )}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
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
              title={
                has && wouldBeLast
                  ? t("admin.userList.lastRoleWarning")
                  : undefined
              }
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
    </Card>
  );
}
