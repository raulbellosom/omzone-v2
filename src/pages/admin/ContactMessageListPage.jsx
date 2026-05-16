import { useState } from "react";
import { Link } from "react-router-dom";
import { useContactMessages } from "@/hooks/useContactMessages";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";
import { Card } from "@/components/common/Card";
import Input from "@/components/common/Input";
import AdminSelect from "@/components/common/AdminSelect";
import { Search, Mail, MailOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export default function ContactMessageListPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);

  const { data, total, loading, error } = useContactMessages({
    filter,
    search,
    page,
  });
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters = search || filter !== "all";

  const filterOptions = [
    { value: "all", label: t("admin.contactMessages.filterAll") },
    { value: "unread", label: t("admin.contactMessages.filterUnread") },
    { value: "read", label: t("admin.contactMessages.filterRead") },
  ];

  const clearFilters = () => {
    setSearch("");
    setFilter("all");
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-charcoal">
          {t("admin.contactMessages.title")}
        </h1>
        {!loading && (
          <p className="text-sm text-charcoal-muted mt-1">
            {total === 1
              ? t("admin.contactMessages.countOne")
              : t("admin.contactMessages.countOther").replace("{count}", total)}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder={t("admin.contactMessages.searchPlaceholder")}
            className="pl-9 h-10"
          />
        </div>
        <AdminSelect
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setPage(0);
          }}
          options={filterOptions}
          className="w-40"
        />
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors"
          >
            <X className="h-4 w-4" />
            {t("admin.contactMessages.clearFilters")}
          </button>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-charcoal-muted text-sm">
            {t("admin.contactMessages.loading")}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 text-sm">
            {t("admin.contactMessages.error")}
          </div>
        ) : data.length === 0 ? (
          <div className="p-10 text-center">
            <Mail className="mx-auto h-10 w-10 text-charcoal-subtle mb-3" />
            <p className="text-charcoal-muted text-sm">
              {t("admin.contactMessages.empty")}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sand text-left">
                    <th className="px-5 py-3 font-medium text-charcoal-muted w-6" />
                    <th className="px-5 py-3 font-medium text-charcoal-muted">
                      {t("admin.contactMessages.colName")}
                    </th>
                    <th className="px-5 py-3 font-medium text-charcoal-muted">
                      {t("admin.contactMessages.colSubject")}
                    </th>
                    <th className="px-5 py-3 font-medium text-charcoal-muted hidden lg:table-cell">
                      {t("admin.contactMessages.colDate")}
                    </th>
                    <th className="px-5 py-3 font-medium text-charcoal-muted">
                      {t("admin.contactMessages.colStatus")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((msg) => (
                    <tr
                      key={msg.$id}
                      className={cn(
                        "border-b border-sand last:border-0 hover:bg-sand/40 transition-colors",
                        !msg.isRead && "bg-sage/5",
                      )}
                    >
                      <td className="px-5 py-3.5 text-center">
                        {msg.isRead ? (
                          <MailOpen className="h-4 w-4 text-charcoal-subtle inline-block" />
                        ) : (
                          <Mail className="h-4 w-4 text-sage inline-block" />
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          to={ROUTES.ADMIN_CONTACT_MESSAGE_DETAIL.replace(":id", msg.$id)}
                          className="hover:text-sage transition-colors"
                        >
                          <span
                            className={cn(
                              "block font-medium text-charcoal",
                              !msg.isRead && "font-semibold",
                            )}
                          >
                            {msg.name}
                          </span>
                          <span className="block text-xs text-charcoal-muted">
                            {msg.email}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-charcoal max-w-xs truncate">
                        <Link
                          to={ROUTES.ADMIN_CONTACT_MESSAGE_DETAIL.replace(":id", msg.$id)}
                          className="hover:text-sage transition-colors"
                        >
                          {msg.subject || (
                            <span className="text-charcoal-subtle italic">
                              {t("admin.contactMessages.noSubject")}
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-charcoal-muted hidden lg:table-cell whitespace-nowrap">
                        {formatDate(msg.$createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        {msg.isRead ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-charcoal-subtle bg-sand rounded-full px-2.5 py-0.5">
                            {t("admin.contactMessages.statusRead")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-sage bg-sage/10 rounded-full px-2.5 py-0.5">
                            {t("admin.contactMessages.statusUnread")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-sand">
              {data.map((msg) => (
                <Link
                  key={msg.$id}
                  to={ROUTES.ADMIN_CONTACT_MESSAGE_DETAIL.replace(":id", msg.$id)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-4 hover:bg-sand/40 transition-colors",
                    !msg.isRead && "bg-sage/5",
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {msg.isRead ? (
                      <MailOpen className="h-4 w-4 text-charcoal-subtle" />
                    ) : (
                      <Mail className="h-4 w-4 text-sage" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm text-charcoal truncate", !msg.isRead && "font-semibold")}>
                      {msg.name}
                    </p>
                    <p className="text-xs text-charcoal-muted truncate">{msg.email}</p>
                    <p className="text-xs text-charcoal mt-0.5 truncate">
                      {msg.subject || (
                        <span className="italic text-charcoal-subtle">
                          {t("admin.contactMessages.noSubject")}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-charcoal-subtle mt-1">
                      {formatDate(msg.$createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg border border-sand text-charcoal disabled:opacity-40 hover:bg-sand/60 transition-colors"
          >
            ← {t("admin.contactMessages.prev")}
          </button>
          <span className="text-charcoal-muted">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg border border-sand text-charcoal disabled:opacity-40 hover:bg-sand/60 transition-colors"
          >
            {t("admin.contactMessages.next")} →
          </button>
        </div>
      )}
    </div>
  );
}
