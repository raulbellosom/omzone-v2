import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import Button from "@/components/common/Button";
import UserMenuDropdown from "@/components/common/UserMenuDropdown";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/common/sheet";
import { Menu, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { to: ROUTES.HOME, label: "Home", end: true },
  { to: ROUTES.EXPERIENCES, label: "Experiences" },
  { to: ROUTES.ABOUT, label: "About" },
  { to: ROUTES.CONTACT, label: "Contact" },
];

export default function Navbar() {
  const { user, isAdmin, isClient, isOperator, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    setMobileOpen(false);
    await logout();
    navigate(ROUTES.HOME, { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-warm-gray-dark/40 bg-white/80 backdrop-blur-md flex items-center px-5 sm:px-6">
      {/* Logo */}
      <Link
        to={ROUTES.HOME}
        className="font-display text-lg font-semibold text-charcoal tracking-widest"
      >
        OMZONE
      </Link>

      {/* Desktop navigation links — centered */}
      <nav className="hidden lg:flex items-center gap-1 ml-10">
        {NAV_LINKS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "text-sage bg-sage/8"
                  : "text-charcoal-muted hover:text-charcoal hover:bg-warm-gray/60"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Desktop auth area */}
      {!loading && (
        <div className="hidden lg:flex items-center gap-3">
          {!user ? (
            <>
              <Link
                to={ROUTES.LOGIN}
                className="text-sm font-medium text-charcoal hover:text-sage transition-colors"
              >
                Login
              </Link>
              <Button asChild size="sm">
                <Link to={ROUTES.REGISTER}>Register</Link>
              </Button>
            </>
          ) : (
            <UserMenuDropdown />
          )}
        </div>
      )}

      {/* Mobile hamburger */}
      {!loading && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="lg:hidden p-2 -mr-2 text-charcoal hover:text-sage transition-colors"
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
              {NAV_LINKS.map(({ to, label, end }) => (
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
                  {label}
                </NavLink>
              ))}

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
                      Login
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="w-full justify-center"
                  >
                    <Link
                      to={ROUTES.REGISTER}
                      onClick={() => setMobileOpen(false)}
                    >
                      Register
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
                      Admin Panel
                      <ArrowRight className="h-4 w-4 text-charcoal-subtle" />
                    </Link>
                  )}
                  {isClient && (
                    <Link
                      to={ROUTES.PORTAL}
                      onClick={() => setMobileOpen(false)}
                      className="py-3 px-3 text-sm font-medium text-charcoal hover:bg-warm-gray rounded-xl transition-colors flex items-center justify-between"
                    >
                      Mi Portal
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
                    Logout
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
