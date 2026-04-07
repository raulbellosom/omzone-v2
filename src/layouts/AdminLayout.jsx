import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminTopBar from "@/components/admin/layout/AdminTopBar";
import Breadcrumbs from "@/components/admin/layout/Breadcrumbs";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Prevent external body/html scroll while admin layout is active
  useEffect(() => {
    const html = document.documentElement;
    html.style.overflow = "hidden";
    html.style.height = "100dvh";
    return () => {
      html.style.overflow = "";
      html.style.height = "";
    };
  }, []);

  return (
    <div className="h-dvh flex overflow-hidden bg-warm-gray">
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopBar onToggleSidebar={() => setSidebarOpen((o) => !o)} />

        <div className="px-4 py-2.5 lg:px-6">
          <Breadcrumbs />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
