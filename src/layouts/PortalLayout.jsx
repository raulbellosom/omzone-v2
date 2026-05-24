import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import PortalSidebar from "@/components/portal/layout/PortalSidebar";
import PortalBottomTabs from "@/components/portal/layout/PortalBottomTabs";
import SupportWidget from "@/components/common/SupportWidget";

export default function PortalLayout() {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Shared navbar — handles user avatar, logout, language, back to site */}
      <Navbar />

      {/* Content area below fixed navbar */}
      <div className="flex pt-16 min-h-dvh bg-cream">
        {/* Desktop sidebar — nav only, no user info */}
        <PortalSidebar />

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <main className="flex-1 py-6 pb-24 lg:pb-8">
            <div className="max-w-5xl mx-auto px-4 lg:px-8">
              <Outlet />
            </div>
          </main>

          <footer className="hidden lg:block border-t border-warm-gray-dark/15 bg-white py-5 text-center text-xs text-charcoal-muted">
            &copy; {new Date().getFullYear()} OMZONE &middot; Experiences in
            Puerto Vallarta
          </footer>
        </div>
      </div>

      {/* Mobile bottom tabs */}
      <PortalBottomTabs />

      {/* Support widget */}
      <SupportWidget />
    </>
  );
}
