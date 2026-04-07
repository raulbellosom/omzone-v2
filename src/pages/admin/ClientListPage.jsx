import { useState } from "react";
import { useAdminClients } from "@/hooks/useAdminClients";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Card } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import ClientTable from "@/components/admin/clients/ClientTable";
import ClientCard from "@/components/admin/clients/ClientCard";
import { Search, Users, X } from "lucide-react";

const PAGE_SIZE = 25;

export default function ClientListPage() {
  const { t } = useLanguage();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const offset = page * PAGE_SIZE;
  const { data, total, loading, error } = useAdminClients({
    search,
    limit: PAGE_SIZE,
    offset,
  });
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const hasFilters = !!search;

  const clearFilters = () => {
    setSearch("");
    setPage(0);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">
            {t("admin.clients.title")}
          </h1>
          {!loading && (
            <p className="text-sm text-charcoal-muted mt-1">
              {total === 1
                ? t("admin.clients.countOne")
                : t("admin.clients.countOther").replace("{count}", total)}
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("admin.clients.searchPlaceholder")}
            className="pl-9 h-10"
          />
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-charcoal-muted hover:text-charcoal transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            {t("admin.common.clearFilters")}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && data.length === 0 && (
        <Card className="p-10 text-center">
          <Users className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-charcoal mb-1">
            {t("admin.clients.emptyTitle")}
          </h2>
          <p className="text-sm text-charcoal-muted">
            {hasFilters
              ? t("admin.clients.emptyFiltered")
              : t("admin.clients.emptyDefault")}
          </p>
        </Card>
      )}

      {/* Desktop table */}
      <div className="hidden md:block">
        <ClientTable clients={data} loading={loading} />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-2 animate-pulse">
              <div className="h-4 w-36 rounded bg-warm-gray" />
              <div className="h-3 w-24 rounded bg-warm-gray" />
              <div className="h-3 w-20 rounded bg-warm-gray" />
            </Card>
          ))}

        {!loading &&
          data.map((client) => <ClientCard key={client.$id} client={client} />)}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-charcoal-subtle">
            {t("admin.common.pageOf")
              .replace("{page}", page + 1)
              .replace("{total}", totalPages)}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              {t("admin.common.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              {t("admin.common.next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
