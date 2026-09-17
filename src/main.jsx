import { Fragment, StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppProviders from "@/AppProviders";
import RouteErrorFallback from "@/components/common/RouteErrorFallback";
import env from "@/config/env";
import { captureError } from "@/lib/audit";

import "@/styles/globals.css";

// ── Global error capture ───────────────────────────────────────────────────
// Uncaught errors and unhandled promise rejections are sent to system_event_logs
// (root-only visibility). These listeners are passive and never throw.
if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    if (e.error) {
      captureError(e.error, { type: "uncaught", message: e.message });
    }
  });
  window.addEventListener("unhandledrejection", (e) => {
    captureError(e.reason ?? new Error("Unhandled rejection"), {
      type: "unhandledrejection",
    });
  });
}

const initialData = document.getElementById("omzone-home-data");
const bootstrap = initialData ? JSON.parse(initialData.textContent) : {
  config: {
    siteUrl: window.location.origin,
    appwriteEndpoint: env.appwriteEndpoint,
    appwriteProjectId: env.appwriteProjectId,
    noindex: window.location.origin !== "https://omzone.com",
  },
};
// A data router enables the editor's navigation blocker, including Back/Forward.
// Existing route declarations stay in App; public SSR still uses StaticRouter.
const router = createBrowserRouter([{
  path: "*", element: <AppProviders Router={Fragment} bootstrap={bootstrap} />,
  errorElement: <RouteErrorFallback />,
}]);
const app = (
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
const root = document.getElementById("root");
if (initialData) hydrateRoot(root, app);
else {
  // React 19 owns metadata after mount. Remove the static fallback to avoid
  // duplicate descriptions/canonicals on the Appwrite Sites preview too.
  document.head.querySelectorAll('title, meta[name="description"], meta[name="robots"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], link[rel="alternate"]').forEach((tag) => tag.remove());
  createRoot(root).render(app);
}
