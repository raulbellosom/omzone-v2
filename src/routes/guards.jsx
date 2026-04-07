import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

function AuthSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="w-8 h-8 rounded-full border-2 border-sage border-t-transparent animate-spin" />
    </div>
  );
}

/**
 * Blocks unauthenticated users — redirects to /login preserving intended path.
 */
export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthSpinner />;
  if (!user)
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;

  return <Outlet />;
}

/**
 * Requires user to have at least one of the specified labels.
 * Must be nested inside RequireAuth.
 */
export function RequireLabel({ labels: requiredLabels = [] }) {
  const { labels, loading } = useAuth();

  if (loading) return <AuthSpinner />;

  const hasRequired = requiredLabels.some((l) => labels.includes(l));
  if (!hasRequired) return <Navigate to={ROUTES.FORBIDDEN} replace />;

  return <Outlet />;
}

/**
 * Combines RequireAuth + RequireLabel in a single reusable wrapper.
 * Use for routes that need both authentication and specific labels.
 */
export function ProtectedRoute({ labels: requiredLabels = [] }) {
  const { user, labels, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthSpinner />;
  if (!user)
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;

  const hasRequired = requiredLabels.some((l) => labels.includes(l));
  if (!hasRequired) return <Navigate to={ROUTES.FORBIDDEN} replace />;

  return <Outlet />;
}

/**
 * Redirects already-authenticated users away from login/register.
 */
export function RedirectIfAuth() {
  const { user, loading, getLandingRoute } = useAuth();

  if (loading) return <AuthSpinner />;
  if (user) return <Navigate to={getLandingRoute()} replace />;

  return <Outlet />;
}
