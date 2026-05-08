import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Loader2, Archive, RotateCcw } from "lucide-react";
import { usePortalPasses } from "@/hooks/usePortalPasses";
import { useArchive } from "@/hooks/useArchive";
import { useLanguage } from "@/hooks/useLanguage";
import PassCard from "@/components/portal/passes/PassCard";
import { Button } from "@/components/common/Button";
import env from "@/config/env";

function PassCardWithArchive({
  userPass,
  onArchive,
  onRestore,
  archiving,
  isArchived,
}) {
  const { t } = useLanguage();
  return (
    <div className="relative group">
      <PassCard userPass={userPass} />
      <button
        onClick={() =>
          isArchived
            ? onRestore?.({ documentId: userPass.$id })
            : onArchive?.({ documentId: userPass.$id })
        }
        disabled={archiving}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-white/80 text-charcoal-muted hover:bg-warm-gray"
        title={
          isArchived
            ? t("portal.passes.restoreTitle")
            : t("portal.passes.archiveTitle")
        }
      >
        {isArchived ? (
          <RotateCcw className="h-3.5 w-3.5" />
        ) : (
          <Archive className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

export default function PortalPassesPage() {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState("");
  const showArchived = statusFilter === "__archived__";
  const activeStatus = showArchived ? "" : statusFilter;

  const TABS = [
    { key: "", label: t("portal.passes.tabAll") },
    { key: "active", label: t("portal.passes.tabActive") },
    { key: "exhausted", label: t("portal.passes.tabExhausted") },
    { key: "expired", label: t("portal.passes.tabExpired") },
    { key: "__archived__", label: t("portal.passes.tabArchived") },
  ];

  const { data, loading, loadingMore, error, loadMore, hasMore, refetch } =
    usePortalPasses({
      status: activeStatus,
      includePersonalArchived: showArchived,
    });

  const {
    archiveOwn,
    restoreOwn,
    loading: archiving,
  } = useArchive(env.collectionUserPasses, refetch);

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

  const showSplit = !statusFilter && !showArchived; // only split when showing "Todos"

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
        {t("portal.passes.heading")}
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
              ? t("portal.passes.emptyFilter")
              : t("portal.passes.emptyAll")}
          </h2>
          <p className="text-sm text-charcoal-muted max-w-sm mx-auto mb-6">
            {t("portal.passes.emptyDesc")}
          </p>
          <Link
            to="/experiencias"
            className="inline-flex items-center gap-2 text-sm text-sage font-medium hover:underline"
          >
            {t("portal.passes.exploreLink")}
          </Link>
        </div>
      ) : showSplit ? (
        /* Split view: active + past */
        <div className="space-y-8">
          {activePasses.length > 0 && (
            <section className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activePasses.map((p) => (
                  <PassCardWithArchive
                    key={p.$id}
                    userPass={p}
                    onArchive={archiveOwn}
                    archiving={archiving}
                  />
                ))}
              </div>
            </section>
          )}
          {pastPasses.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider">
                {t("portal.passes.pastPasses")}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pastPasses.map((p) => (
                  <PassCardWithArchive
                    key={p.$id}
                    userPass={p}
                    onArchive={archiveOwn}
                    archiving={archiving}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : showArchived ? (
        /* Archived passes */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => (
            <PassCardWithArchive
              key={p.$id}
              userPass={p}
              onRestore={restoreOwn}
              archiving={archiving}
              isArchived
            />
          ))}
        </div>
      ) : (
        /* Flat grid when a specific filter is active */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => (
            <PassCardWithArchive
              key={p.$id}
              userPass={p}
              onArchive={archiveOwn}
              archiving={archiving}
            />
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
              t("portal.passes.loadMore")
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
