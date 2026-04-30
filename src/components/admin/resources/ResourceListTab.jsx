import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { useResources, updateResource } from "@/hooks/useResources";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import AdminSelect from "@/components/common/AdminSelect";
import { cn } from "@/lib/utils";

const TYPE_OPTION_KEYS = [
  { value: "", key: "allTypes" },
  { value: "instructor", key: "instructor" },
  { value: "facilitator", key: "facilitator" },
  { value: "therapist", key: "therapist" },
  { value: "equipment", key: "equipment" },
];

const TYPE_LABEL_KEYS = ["instructor", "facilitator", "therapist", "equipment"];

const RESOURCE_NEW_ROUTE = "/admin/resources/new";
const RESOURCE_EDIT_ROUTE = "/admin/resources/:id/edit";

function ActiveToggle({ isActive, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      onClick={() => onChange(!isActive)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-sage/40",
        isActive ? "bg-sage" : "bg-sand-dark",
        "disabled:opacity-40 disabled:cursor-not-allowed",
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          isActive ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-sand">
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-4 rounded bg-warm-gray animate-pulse"
            style={{ width: `${50 + i * 10}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// Mobile card
function ResourceCard({
  resource,
  onToggle,
  canAdmin,
  navigate,
  t,
  typeLabel,
}) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-charcoal truncate">{resource.name}</p>
          <p className="text-xs text-charcoal-subtle mt-0.5">{typeLabel}</p>
        </div>
        <Badge variant={resource.isActive ? "success" : "warm"}>
          {resource.isActive
            ? t("admin.resourceLists.active")
            : t("admin.resourceLists.inactive")}
        </Badge>
      </div>
      {resource.contactInfo && (
        <p className="text-xs text-charcoal-subtle truncate">
          {resource.contactInfo}
        </p>
      )}
      <div className="flex items-center gap-2 pt-1 border-t border-sand flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            navigate(RESOURCE_EDIT_ROUTE.replace(":id", resource.$id))
          }
          className="flex-1 justify-center"
        >
          <Pencil className="h-3.5 w-3.5" /> {t("admin.resourceLists.edit")}
        </Button>
        {canAdmin && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-charcoal-subtle">
              {resource.isActive
                ? t("admin.resourceLists.active")
                : t("admin.resourceLists.inactive")}
            </span>
            <ActiveToggle
              isActive={resource.isActive}
              onChange={(v) => onToggle(resource.$id, v)}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

export default function ResourceListTab() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [actionError, setActionError] = useState(null);

  const TYPE_OPTIONS = TYPE_OPTION_KEYS.map((o) => ({
    value: o.value,
    label:
      o.key === "allTypes"
        ? t("admin.resourceLists.allTypes")
        : t(`admin.resourceLists.resourceTypes.${o.key}`),
  }));

  const getTypeLabel = (typeVal) =>
    t(`admin.resourceLists.resourceTypes.${typeVal}`) || typeVal;

  const { data, total, loading, error, refetch } = useResources({
    search,
    type,
  });

  const handleToggle = useCallback(
    async (id, newValue) => {
      setActionError(null);
      try {
        await updateResource(id, { isActive: newValue });
        refetch();
      } catch (err) {
        setActionError(err.message);
      }
    },
    [refetch],
  );

  const hasFilters = search || type;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-subtle pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.resourceLists.searchResource")}
            className="pl-9 h-10"
          />
        </div>
        <AdminSelect
          value={type}
          onChange={setType}
          options={TYPE_OPTIONS}
          fullWidth={false}
        />
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setType("");
            }}
            className="flex items-center gap-1 text-sm text-charcoal-subtle hover:text-charcoal"
          >
            <X className="h-4 w-4" /> {t("admin.resourceLists.clear")}
          </button>
        )}
        <div className="ml-auto">
          {isAdmin && (
            <Button
              type="button"
              size="sm"
              onClick={() => navigate(RESOURCE_NEW_ROUTE)}
            >
              <Plus className="h-4 w-4" />{" "}
              {t("admin.resourceLists.createResource")}
            </Button>
          )}
        </div>
      </div>

      {(error || actionError) && (
        <Card className="p-3 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error || actionError}</p>
        </Card>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-sand-dark bg-warm-gray/60">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                {t("admin.resourceLists.name")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                {t("admin.resourceLists.type")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden sm:table-cell">
                {t("admin.resourceLists.contact")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                {t("admin.resourceLists.active")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                {t("admin.resourceLists.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && data.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-charcoal-subtle"
                >
                  {hasFilters
                    ? t("admin.resourceLists.noResourcesFiltered")
                    : t("admin.resourceLists.noResourcesYet")}
                </td>
              </tr>
            )}

            {!loading &&
              data.map((r) => {
                const editUrl = RESOURCE_EDIT_ROUTE.replace(":id", r.$id);
                return (
                  <tr
                    key={r.$id}
                    className="group border-b border-sand last:border-0 hover:bg-warm-gray/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={editUrl}
                        className="font-medium text-charcoal hover:text-sage-dark hover:underline underline-offset-2 transition-colors truncate max-w-48 block"
                      >
                        {r.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-charcoal-subtle">
                      {getTypeLabel(r.type)}
                    </td>
                    <td className="px-4 py-3 text-charcoal-subtle hidden sm:table-cell truncate max-w-48">
                      {r.contactInfo ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isAdmin ? (
                        <ActiveToggle
                          isActive={r.isActive}
                          onChange={(v) => handleToggle(r.$id, v)}
                        />
                      ) : (
                        <Badge variant={r.isActive ? "success" : "warm"}>
                          {r.isActive
                            ? t("admin.resourceLists.active")
                            : t("admin.resourceLists.inactive")}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <Link
                        to={editUrl}
                        className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-charcoal-subtle hover:text-sage hover:bg-sage/10 transition-colors"
                        title={t("admin.resourceLists.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-1.5">
                  <div className="h-4 w-36 rounded bg-warm-gray" />
                  <div className="h-3 w-24 rounded bg-warm-gray" />
                </div>
                <div className="h-5 w-16 rounded-full bg-warm-gray" />
              </div>
            </Card>
          ))}
        {!loading && data.length === 0 && (
          <Card className="p-8 text-center space-y-4">
            <p className="text-sm text-charcoal-subtle">
              {t("admin.resourceLists.noResourcesMobile")}
            </p>
            {isAdmin && (
              <Button
                type="button"
                size="sm"
                onClick={() => navigate(RESOURCE_NEW_ROUTE)}
              >
                <Plus className="h-4 w-4" />{" "}
                {t("admin.resourceLists.createFirstResource")}
              </Button>
            )}
          </Card>
        )}
        {!loading &&
          data.map((r) => (
            <ResourceCard
              key={r.$id}
              resource={r}
              onToggle={handleToggle}
              canAdmin={isAdmin}
              navigate={navigate}
              t={t}
              typeLabel={getTypeLabel(r.type)}
            />
          ))}
      </div>

      {!loading && total > 0 && (
        <p className="text-xs text-charcoal-subtle text-right">
          {total}{" "}
          {t("admin.resourceLists.resourceCount").replace("{count}", "").trim()}
        </p>
      )}
    </div>
  );
}
