import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Loader2 } from "lucide-react";
import { usePortalPasses } from "@/hooks/usePortalPasses";
import PassCard from "@/components/portal/passes/PassCard";
import { Button } from "@/components/common/Button";

const TABS = [
  { key: "", label: "Todos" },
  { key: "active", label: "Activos" },
  { key: "exhausted", label: "Agotados" },
  { key: "expired", label: "Vencidos" },
];

export default function PortalPassesPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data, loading, loadingMore, error, loadMore, hasMore } =
    usePortalPasses({ status: statusFilter });

  // Split into active vs past (exhausted/expired/cancelled)
  const { activePasses, pastPasses } = useMemo(() => {
    const active = [];
    const past = [];
    for (const p of data) {
      if (p.status === "active") active.push(p);
      else past.push(p);
    }
    return { activePasses: active, pastPasses: past };
  }, [data]);

  const showSplit = !statusFilter; // only split when showing "Todos"

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-sage" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 px-6">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-charcoal">
        Mis Pases
      </h1>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              statusFilter === tab.key
                ? "bg-sage text-white"
                : "bg-sage/10 text-charcoal-muted hover:bg-sage/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16 px-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="font-display text-lg font-semibold text-charcoal mb-2">
            {statusFilter
              ? "No tienes pases con este estado"
              : "Aún no tienes pases"}
          </h2>
          <p className="text-sm text-charcoal-muted max-w-sm mx-auto mb-6">
            Descubre nuestras experiencias y adquiere un pase para disfrutarlas
            con créditos flexibles.
          </p>
          <Link
            to="/experiencias"
            className="inline-flex items-center gap-2 text-sm text-sage font-medium hover:underline"
          >
            Explorar experiencias
          </Link>
        </div>
      ) : showSplit ? (
        /* Split view: active + past */
        <div className="space-y-8">
          {activePasses.length > 0 && (
            <section className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activePasses.map((p) => (
                  <PassCard key={p.$id} userPass={p} />
                ))}
              </div>
            </section>
          )}
          {pastPasses.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider">
                Pases anteriores
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pastPasses.map((p) => (
                  <PassCard key={p.$id} userPass={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* Flat grid when a specific filter is active */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => (
            <PassCard key={p.$id} userPass={p} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="text-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Cargar más"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
