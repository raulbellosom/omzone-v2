import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PortalSidebar from "@/components/portal/layout/PortalSidebar";
import PortalBottomTabs from "@/components/portal/layout/PortalBottomTabs";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { Menu } from "lucide-react";

export default function PortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-cream">
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Desktop sidebar */}
      <PortalSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 border-b border-warm-gray-dark/15 bg-white/85 backdrop-blur-md flex items-center px-4 lg:px-6 gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 rounded-lg hover:bg-warm-gray/20 transition-colors lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5 text-charcoal" />
          </button>

          <Link
            to="/portal"
            className="font-display text-lg font-semibold text-charcoal tracking-wide"
          >
            OMZONE
          </Link>

          <span className="hidden sm:inline text-xs text-charcoal-muted font-medium bg-sage/10 text-sage px-2 py-0.5 rounded-full">
            Mi Portal
          </span>

          <div className="flex-1" />

          <LanguageSwitcher />
        </header>

        {/* Page content */}
        <main className="flex-1 py-6 pb-24 lg:pb-6">
          <div className="max-w-5xl mx-auto px-4 lg:px-8">
            <Outlet />
          </div>
        </main>

        {/* Footer — visible on desktop, hidden on mobile (bottom tabs take the space) */}
        <footer className="hidden lg:block border-t border-warm-gray-dark/15 bg-white py-5 text-center text-xs text-charcoal-muted">
          &copy; {new Date().getFullYear()} OMZONE &middot; Wellness experiences
        </footer>
      </div>

      {/* Mobile bottom tabs */}
      <PortalBottomTabs />
    </div>
  );
}
