import { useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { HomeContentContext } from "@/contexts/HomeContentContext";
import AppUpdateBanner from "@/components/common/AppUpdateBanner";
import App from "@/App";

export default function AppProviders({ Router, routerProps, bootstrap, helmetContext }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false, retry: 1 } },
  }));
  return (
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <Router {...routerProps}>
          <HomeContentContext.Provider value={bootstrap}>
            <LanguageProvider>
              <AuthProvider>
                <App />
                <AppUpdateBanner />
              </AuthProvider>
            </LanguageProvider>
          </HomeContentContext.Provider>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
