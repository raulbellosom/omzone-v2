import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Full-bleed background image with Ken Burns effect */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-ken-burns will-change-transform"
        style={{ backgroundImage: "url('/images/auth-bg.jpg')" }}
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-charcoal/55" />

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-transparent to-charcoal/40" />

      {/* Content */}
      <div className="relative z-10 w-full px-5 py-10 sm:py-16">
        <Outlet />
      </div>
    </div>
  );
}
