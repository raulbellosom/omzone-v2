import { Bell } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useClientNotifications } from "@/hooks/useClientNotifications";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/common/dropdown-menu";

export default function NotificationBell({ transparent = false }) {
  const { t } = useLanguage();
  const { notifications, unreadCount, markAsRead } = useClientNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`relative p-2 rounded-full transition-colors cursor-pointer ${
            transparent ? "text-white hover:text-white/80" : "text-charcoal hover:text-sage"
          }`}
          aria-label={t("notifications.bellLabel")}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{t("notifications.title")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-charcoal-muted">
            {t("notifications.empty")}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((n) => (
              <button
                key={n.$id}
                onClick={() => markAsRead(n.$id)}
                className={`w-full text-left px-3 py-2.5 border-b border-sand-dark/15 last:border-b-0 transition-colors hover:bg-warm-gray/60 cursor-pointer ${
                  n.isRead ? "" : "bg-sage/5"
                }`}
              >
                <div className="text-sm font-semibold text-charcoal">{n.title}</div>
                <div className="text-xs text-charcoal-muted mt-0.5">{n.body}</div>
              </button>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
