import { Menu } from "lucide-react";
import { Button } from "@/components/common/Button";
import UserMenuDropdown from "@/components/common/UserMenuDropdown";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useLanguage } from "@/hooks/useLanguage";

export default function AdminTopBar({ onToggleSidebar }) {
  const { t } = useLanguage();
  return (
    <header className="h-14 shrink-0 flex items-center justify-between gap-4 border-b border-warm-gray-dark/40 bg-white px-4 lg:px-6">
      {/* Left: hamburger (mobile) */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onToggleSidebar}
          aria-label={t("admin.topbar.openMenu")}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Right: language + user dropdown */}
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <UserMenuDropdown />
      </div>
    </header>
  );
}
