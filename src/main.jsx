import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AppUpdateBanner from "@/components/common/AppUpdateBanner";
import { captureError } from "@/lib/audit";

import App from "@/App";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LanguageProvider>
            <AuthProvider>
              <App />
              <AppUpdateBanner />
            </AuthProvider>
          </LanguageProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
