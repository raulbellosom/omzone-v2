import { Outlet } from "react-router-dom";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

export default function AuthLayout() {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Full-bleed background — fixed to viewport so the Ken Burns transform
          never overflows the document and creates extra scroll. */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Background image with Ken Burns effect */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-ken-burns will-change-transform"
          style={{ backgroundImage: "url('/images/auth-bg.jpg')" }}
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-charcoal/55" />

        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-transparent to-charcoal/40" />
      </div>

      {/* Language switcher — top right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <LanguageSwitcher transparent className="backdrop-blur-md" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-5 py-10 sm:py-16">
        <Outlet />
      </div>
    </div>
  );
}
