import {
  ShieldCheck,
  ShieldOff,
  Settings2,
  UserMinus,
  UserPlus,
  UserX,
  Loader2,
  Mail,
} from "lucide-react";
import { Card } from "@/components/common/Card";
import { useLanguage } from "@/hooks/useLanguage";

const MANAGED_LABELS = ["admin", "operator", "client"];

const ROLE_CONFIG = {
  admin: {
    AddIcon: ShieldCheck,
    RemoveIcon: ShieldOff,
    addCls:
      "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100",
    removeCls:
      "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100",
    badgeCls: "bg-amber-100 text-amber-800 border border-amber-200/80",
    dot: "bg-amber-400",
  },
  operator: {
    AddIcon: Settings2,
    RemoveIcon: UserMinus,
    addCls: "bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100",
    removeCls:
      "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100",
    badgeCls: "bg-sky-100 text-sky-800 border border-sky-200/80",
    dot: "bg-sky-400",
  },
  client: {
    AddIcon: UserPlus,
    RemoveIcon: UserX,
    addCls: "bg-sage/10 text-sage-dark border border-sage/20 hover:bg-sage/20",
    removeCls:
      "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100",
    badgeCls: "bg-sage/15 text-sage-dark border border-sage/25",
    dot: "bg-sage",
  },
};

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function UserCard({ user, onAssign, onRemove, pendingUserId }) {
  const { t } = useLanguage();
  const pending = pendingUserId === user.$id;

  return (
    <Card className="p-4 space-y-3.5">
      {/* User info */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-charcoal/10 text-charcoal flex items-center justify-center text-sm font-semibold shrink-0 select-none">
          {getInitials(user.name)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-charcoal truncate leading-snug">
            {user.name || "—"}
          </p>
          <p className="flex items-center gap-1 text-xs text-charcoal-muted truncate mt-0.5">
            <Mail className="h-3 w-3 shrink-0" />
            {user.email || "—"}
          </p>
        </div>
      </div>

      {/* Current roles */}
      {user.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {user.labels.map((label) => {
            const cfg = ROLE_CONFIG[label];
            return (
              <span
                key={label}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  cfg
                    ? cfg.badgeCls
                    : "bg-warm-gray text-charcoal-muted border border-sand-dark"
                }`}
              >
                {cfg && (
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                )}
                {label.charAt(0).toUpperCase() + label.slice(1)}
              </span>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-3 gap-1.5">
        {MANAGED_LABELS.map((label) => {
          const cfg = ROLE_CONFIG[label];
          const has = user.labels.includes(label);
          const wouldBeLast = has && user.labels.length === 1;
          const capitalized = `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
          const actionKey = has
            ? `admin.userList.remove${capitalized}`
            : `admin.userList.make${capitalized}`;
          const Icon = has ? cfg.RemoveIcon : cfg.AddIcon;
          const cls = has ? cfg.removeCls : cfg.addCls;
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
              className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${cls}`}
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span className="leading-tight text-center">{t(actionKey)}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
