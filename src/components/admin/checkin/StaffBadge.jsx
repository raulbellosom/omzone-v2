import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { UserCircle2 } from "lucide-react";

export default function StaffBadge({ className = "" }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-sand-dark bg-white px-3 py-1.5 text-xs font-medium text-charcoal ${className}`}
    >
      <UserCircle2 className="h-4 w-4 text-sage" />
      <span className="truncate max-w-40">
        {t("admin.checkin.operatedBy").replace("{name}", user.name || user.email)}
      </span>
    </div>
  );
}
