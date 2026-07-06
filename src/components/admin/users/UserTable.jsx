import {
  ShieldCheck,
  ShieldOff,
  Settings2,
  UserMinus,
  UserPlus,
  UserX,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const MANAGED_LABELS = ["admin", "operator", "client"];

const ROLE_CONFIG = {
  admin: {
    AddIcon: ShieldCheck,
    RemoveIcon: ShieldOff,
    addCls:
      "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 hover:border-amber-300",
    removeCls:
      "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300",
    badgeCls: "bg-amber-100 text-amber-800 border border-amber-200/80",
    dot: "bg-amber-400",
  },
  operator: {
    AddIcon: Settings2,
    RemoveIcon: UserMinus,
    addCls:
      "bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 hover:border-sky-300",
    removeCls:
      "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300",
    badgeCls: "bg-sky-100 text-sky-800 border border-sky-200/80",
    dot: "bg-sky-400",
  },
  client: {
    AddIcon: UserPlus,
    RemoveIcon: UserX,
    addCls:
      "bg-sage/10 text-sage-dark border border-sage/20 hover:bg-sage/20 hover:border-sage/30",
    removeCls:
      "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300",
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

function Avatar({ name }) {
  return (
    <div className="h-8 w-8 rounded-full bg-charcoal/10 text-charcoal flex items-center justify-center text-xs font-semibold shrink-0 select-none">
      {getInitials(name)}
    </div>
  );
}

function LabelBadges({ labels }) {
  if (!labels || labels.length === 0)
    return <span className="text-charcoal-subtle text-xs">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((label) => {
        const cfg = ROLE_CONFIG[label];
        return (
          <span
            key={label}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              cfg
                ? cfg.badgeCls
                : "bg-warm-gray text-charcoal-muted border border-sand-dark"
            }`}
          >
            {cfg && <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />}
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </span>
        );
      })}
    </div>
  );
}

function LabelActions({ user, onAssign, onRemove, pending, t }) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
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
                : t(actionKey)
            }
            onClick={() =>
              has ? onRemove(user.$id, label) : onAssign(user.$id, label)
            }
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${cls}`}
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            ) : (
              <Icon className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>{t(actionKey)}</span>
          </button>
        );
      })}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-sand-dark/40 animate-pulse">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-warm-gray shrink-0" />
          <div className="h-4 w-32 rounded bg-warm-gray" />
        </div>
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell">
        <div className="h-4 w-44 rounded bg-warm-gray" />
      </td>
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <div className="h-5 w-20 rounded-full bg-warm-gray" />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex justify-end gap-1.5">
          <div className="h-7 w-24 rounded-lg bg-warm-gray" />
          <div className="h-7 w-24 rounded-lg bg-warm-gray" />
          <div className="h-7 w-24 rounded-lg bg-warm-gray" />
        </div>
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
    <div className="overflow-x-auto rounded-xl border border-sand-dark shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-sand-dark bg-warm-gray/70">
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
                className="border-b border-sand last:border-0 hover:bg-warm-gray/40 transition-colors"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={user.name} />
                    <span className="font-medium text-charcoal">
                      {user.name || "—"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5 hidden md:table-cell text-charcoal-muted">
                  {user.email || "—"}
                </td>
                <td className="px-4 py-3.5 hidden lg:table-cell">
                  <LabelBadges labels={user.labels} />
                </td>
                <td className="px-4 py-3.5">
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
