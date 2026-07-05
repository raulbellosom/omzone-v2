import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Card } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import UserTable from "@/components/admin/users/UserTable";
import UserCard from "@/components/admin/users/UserCard";
import { Search, ShieldCheck } from "lucide-react";

export default function UserListPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [pendingUserId, setPendingUserId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    assignLabel,
    removeLabel,
  } = useAdminUsers({ search });

  async function handleAssign(userId, label) {
    setActionError(null);
    setPendingUserId(userId);
    try {
      await assignLabel(userId, label);
    } catch (err) {
      setActionError(err.message || t("admin.userList.errorGeneric"));
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleRemove(userId, label) {
    setActionError(null);
    setPendingUserId(userId);
    try {
      await removeLabel(userId, label);
    } catch (err) {
      setActionError(err.message || t("admin.userList.errorGeneric"));
    } finally {
      setPendingUserId(null);
    }
  }

  const hasFilters = !!search;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-charcoal">
          {t("admin.userList.title")}
        </h1>
        <p className="text-sm text-charcoal-muted mt-1">
          {t("admin.userList.subtitle")}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.userList.searchPlaceholder")}
          className="pl-9 h-10"
        />
      </div>

      {/* Errors */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}
      {actionError && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{actionError}</p>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && data.length === 0 && (
        <Card className="p-10 text-center">
          <ShieldCheck className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-charcoal mb-1">
            {t("admin.userList.emptyTitle")}
          </h2>
          <p className="text-sm text-charcoal-muted">
            {hasFilters
              ? t("admin.userList.emptyFiltered")
              : t("admin.userList.emptyDefault")}
          </p>
        </Card>
      )}

      {/* Desktop table */}
      <div className="hidden md:block">
        <UserTable
          users={data}
          loading={loading}
          onAssign={handleAssign}
          onRemove={handleRemove}
          pendingUserId={pendingUserId}
        />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-2 animate-pulse">
              <div className="h-4 w-36 rounded bg-warm-gray" />
              <div className="h-3 w-24 rounded bg-warm-gray" />
            </Card>
          ))}

        {!loading &&
          data.map((user) => (
            <UserCard
              key={user.$id}
              user={user}
              onAssign={handleAssign}
              onRemove={handleRemove}
              pendingUserId={pendingUserId}
            />
          ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={loadMore} loading={loadingMore}>
            {t("admin.userList.loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
