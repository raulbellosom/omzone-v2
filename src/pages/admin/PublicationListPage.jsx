import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, X, FileText } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card } from "@/components/common/Card";
import PublicationTable from "@/components/admin/publications/PublicationTable";
import PublicationCard from "@/components/admin/publications/PublicationCard";
import ConfirmHardDeleteModal from "@/components/admin/ConfirmHardDeleteModal";
import { usePublications, updatePublication } from "@/hooks/usePublications";
import { useArchive } from "@/hooks/useArchive";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import AdminSelect from "@/components/common/AdminSelect";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import env from "@/config/env";

const STATUS_OPTIONS = [
  { value: "", i18nKey: "admin.statuses.all" },
  { value: "draft", i18nKey: "admin.statuses.draft" },
  { value: "published", i18nKey: "admin.statuses.published" },
  { value: "__archived__", i18nKey: "admin.archive.archivedTab" },
];

const PAGE_SIZE = 25;

export default function PublicationListPage() {
  const { isAdmin, isRoot } = useAuth();
  const { t } = useLanguage();

  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [actionError, setActionError] = useState(null);
  const [hardDeleteDoc, setHardDeleteDoc] = useState(null);

  const showArchived = status === "__archived__";

  const offset = page * PAGE_SIZE;
  const { data, total, loading, error, refetch } = usePublications({
    search,
    tag: tagFilter,
    status: showArchived ? "" : status,
    onlyArchived: showArchived,
    includeDrafts: true,
    limit: PAGE_SIZE,
    offset,
  });

  const {
    archive,
    restore,
    hardDelete,
    loading: archiving,
  } = useArchive(env.collectionPublications, refetch);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function handleSearchChange(value) {
    setSearch(value);
    setPage(0);
  }
  function handleTagChange(value) {
    setTagFilter(value);
    setPage(0);
  }
  function handleStatusChange(value) {
    setStatus(value);
    setPage(0);
  }

  const handleStatusUpdate = useCallback(
    async (id, newStatus) => {
      setActionError(null);
      try {
        const payload = { status: newStatus };
        if (newStatus === "published")
          payload.publishedAt = new Date().toISOString();
        await updatePublication(id, payload);
        refetch();
      } catch (err) {
        setActionError(err.message);
      }
    },
    [refetch],
  );

  const handleArchive = useCallback(
    (id) => archive({ documentId: id }),
    [archive],
  );

  const handleRestore = useCallback(
    (id) => restore({ documentId: id }),
    [restore],
  );

  const handleHardDeleteConfirm = useCallback(
    async ({ documentId, confirmationId, reason }) => {
      await hardDelete({ documentId, confirmationId, reason });
      setHardDeleteDoc(null);
    },
    [hardDelete],
  );

  const hasFilters = search || tagFilter || status;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-semibold text-charcoal">
            {t("admin.publications.title")}
          </h1>
          {!loading && (
            <p className="text-sm text-charcoal-subtle mt-0.5">
              {total === 1
                ? t("admin.publications.countOne")
                : t("admin.publications.countOther").replace("{count}", total)}
            </p>
          )}
        </div>
        {isAdmin && (
          <Button type="button" size="md" asChild>
            <Link to={ROUTES.ADMIN_PUBLICATION_NEW}>
              <Plus className="h-4 w-4" />
              {t("admin.publications.newPublication")}
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-subtle pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("admin.publications.searchPlaceholder")}
            className="pl-9 h-10"
          />
        </div>
        <div className="relative">
          <Input
            value={tagFilter}
            onChange={(e) => handleTagChange(e.target.value)}
            placeholder={t("admin.publications.filterByTag")}
            className="h-10 w-36"
          />
        </div>
        <AdminSelect
          value={status}
          onChange={handleStatusChange}
          options={STATUS_OPTIONS.map((o) => ({ ...o, label: t(o.i18nKey) }))}
          fullWidth={false}
        />
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setTagFilter("");
              setStatus("");
              setPage(0);
            }}
            className="flex items-center gap-1 text-sm text-charcoal-subtle hover:text-charcoal"
          >
            <X className="h-4 w-4" />
            {t("admin.publications.clearFilters")}
          </button>
        )}
      </div>

      {/* Error states */}
      {(error || actionError) && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error || actionError}</p>
        </Card>
      )}

      {/* Empty state */}
      {!loading && data.length === 0 && (
        <Card className="p-10 text-center">
          <FileText className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-charcoal mb-1">
            {showArchived
              ? t("admin.publications.emptyArchivedTitle")
              : t("admin.publications.emptyTitle")}
          </h2>
          <p className="text-sm text-charcoal-muted mb-4">
            {showArchived
              ? t("admin.publications.emptyArchivedMessage")
              : t("admin.publications.emptyMessage")}
          </p>
          {isAdmin && !showArchived && (
            <Button type="button" size="sm" asChild>
              <Link to={ROUTES.ADMIN_PUBLICATION_NEW}>
                <Plus className="h-4 w-4" />
                {t("admin.publications.emptyButton")}
              </Link>
            </Button>
          )}
        </Card>
      )}

      {/* Desktop table */}
      {!loading && data.length > 0 && (
        <div className="hidden md:block">
          <PublicationTable
            publications={data}
            loading={loading}
            onStatusChange={handleStatusUpdate}
            onArchive={handleArchive}
            onRestore={handleRestore}
            onHardDelete={setHardDeleteDoc}
            canAdmin={isAdmin}
            canHardDelete={isRoot}
          />
        </div>
      )}

      {/* Loading skeleton — desktop */}
      {loading && (
        <div className="hidden md:block">
          <PublicationTable
            publications={[]}
            loading={true}
            onStatusChange={handleStatusUpdate}
            onArchive={handleArchive}
            onRestore={handleRestore}
            onHardDelete={setHardDeleteDoc}
            canAdmin={isAdmin}
            canHardDelete={isRoot}
          />
        </div>
      )}

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-1.5">
                  <div className="h-4 w-40 rounded bg-warm-gray" />
                  <div className="h-3 w-28 rounded bg-warm-gray" />
                </div>
                <div className="h-5 w-20 rounded-full bg-warm-gray" />
              </div>
              <div className="h-3 w-32 rounded bg-warm-gray" />
            </Card>
          ))}

        {!loading &&
          data.map((pub) => (
            <PublicationCard
              key={pub.$id}
              publication={pub}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onHardDelete={setHardDeleteDoc}
              canAdmin={isAdmin}
              canHardDelete={isRoot}
            />
          ))}
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
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              {t("admin.common.previous")}
            </Button>
            <Button
              type="button"
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

      <ConfirmHardDeleteModal
        open={!!hardDeleteDoc}
        document={hardDeleteDoc}
        collectionId={env.collectionPublications}
        loading={archiving}
        onConfirm={handleHardDeleteConfirm}
        onCancel={() => setHardDeleteDoc(null)}
      />
    </div>
  );
}
