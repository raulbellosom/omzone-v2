import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";
import Button from "@/components/common/Button";
import UserMenuDropdown from "@/components/common/UserMenuDropdown";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/common/sheet";
import { Menu, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { to: ROUTES.HOME, key: "nav.home", end: true },
  { to: ROUTES.EXPERIENCES, key: "nav.experiences" },
  { to: ROUTES.ABOUT, key: "nav.about" },
  { to: ROUTES.CONTACT, key: "nav.contact" },
];

export default function Navbar() {
  const { user, isAdmin, isClient, isOperator, loading, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    setMobileOpen(false);
    await logout();
    navigate(ROUTES.HOME, { replace: true });
  }

  return (
    <header
      className={`fixed top-0 left-0 w-full z-40 h-16 flex items-center px-4 sm:px-5 md:px-6 transition-all duration-300 ${
        isTransparent
          ? "bg-transparent border-b border-transparent"
          : "bg-white/80 backdrop-blur-md border-b border-warm-gray-dark/40"
      }`}
    >
      {/* Logo */}
      <Link
        to={ROUTES.HOME}
        className={`font-display text-lg font-semibold tracking-widest transition-colors duration-300 ${
          isTransparent ? "text-white" : "text-charcoal"
        }`}
      >
        OMZONE
      </Link>

      {/* Desktop navigation links — centered */}
      <nav className="hidden lg:flex items-center gap-1 ml-10">
        {NAV_LINKS.map(({ to, key, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isTransparent
                  ? isActive
                    ? "text-white bg-white/15"
                    : "text-white/75 hover:text-white hover:bg-white/10"
                  : isActive
                    ? "text-sage bg-sage/8"
                    : "text-charcoal-muted hover:text-charcoal hover:bg-warm-gray/60"
              }`
            }
          >
            {t(key)}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Desktop auth area */}
      {!loading && (
        <div className="hidden lg:flex items-center gap-3">
          <LanguageSwitcher transparent={isTransparent} />
          {!user ? (
            <>
              <Link
                to={ROUTES.LOGIN}
                className={`text-sm font-medium transition-colors ${
                  isTransparent
                    ? "text-white/85 hover:text-white"
                    : "text-charcoal hover:text-sage"
                }`}
              >
                {t("nav.login")}
              </Link>
              <Button asChild size="sm">
                <Link to={ROUTES.REGISTER}>{t("nav.register")}</Link>
              </Button>
            </>
          ) : (
            <UserMenuDropdown transparent={isTransparent} />
          )}
        </div>
      )}

      {/* Mobile hamburger */}
      {!loading && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className={`lg:hidden p-2 -mr-2 transition-colors ${
                isTransparent
                  ? "text-white hover:text-white/80"
                  : "text-charcoal hover:text-sage"
              }`}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="font-display tracking-widest">
                OMZONE
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-5 mt-4">
              {/* Navigation links */}
              {NAV_LINKS.map(({ to, key, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `py-3 px-3 text-sm font-medium rounded-xl transition-colors ${
                      isActive
                        ? "text-sage bg-sage/8"
                        : "text-charcoal hover:bg-warm-gray"
                    }`
                  }
                >
                  {t(key)}
                </NavLink>
              ))}

              {/* Language switcher — mobile */}
              <div className="px-3 pt-1">
                <LanguageSwitcher />
              </div>

              <div className="my-2 border-t border-warm-gray-dark/40" />

              {/* Auth section */}
              {!user ? (
                <div className="flex flex-col gap-2 px-3 pt-1">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full justify-center"
                  >
                    <Link
                      to={ROUTES.LOGIN}
                      onClick={() => setMobileOpen(false)}
                    >
                      {t("nav.login")}
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="w-full justify-center">
                    <Link
                      to={ROUTES.REGISTER}
                      onClick={() => setMobileOpen(false)}
                    >
                      {t("nav.register")}
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  {(isAdmin || isOperator) && (
                    <Link
                      to={ROUTES.ADMIN}
                      onClick={() => setMobileOpen(false)}
                      className="py-3 px-3 text-sm font-medium text-charcoal hover:bg-warm-gray rounded-xl transition-colors flex items-center justify-between"
                    >
                      {t("nav.adminPanel")}
                      <ArrowRight className="h-4 w-4 text-charcoal-subtle" />
                    </Link>
                  )}
                  {isClient && (
                    <Link
                      to={ROUTES.PORTAL}
                      onClick={() => setMobileOpen(false)}
                      className="py-3 px-3 text-sm font-medium text-charcoal hover:bg-warm-gray rounded-xl transition-colors flex items-center justify-between"
                    >
                      {t("nav.myPortal")}
                      <ArrowRight className="h-4 w-4 text-charcoal-subtle" />
                    </Link>
                  )}

                  <div className="my-2 border-t border-warm-gray-dark/40" />
                  <div className="px-3 py-2 text-xs text-charcoal-muted">
                    {user.name || user.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="py-3 px-3 text-sm font-medium text-left text-charcoal hover:bg-warm-gray rounded-xl transition-colors cursor-pointer"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      )}
    </header>
  );
}
