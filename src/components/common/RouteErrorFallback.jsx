import { useEffect } from "react";
import { useRouteError } from "react-router-dom";
import { captureError } from "@/lib/audit";

// Lives outside app providers, so recovery must not depend on their contexts.
export default function RouteErrorFallback() {
  const error = useRouteError();
  const spanish = document.documentElement.lang === "es";
  useEffect(() => { captureError(error, { type: "route-render" }); }, [error]);
  return (
    <main role="alert" className="min-h-screen grid place-content-center gap-4 bg-cream p-8 text-center text-charcoal">
      <h1 className="text-2xl font-display">{spanish ? "No se pudo cargar la página" : "This page could not be loaded"}</h1>
      <a className="text-sage underline" href={spanish ? "/es" : "/"}>{spanish ? "Volver al inicio" : "Return home"}</a>
    </main>
  );
}
