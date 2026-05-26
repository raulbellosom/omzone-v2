import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import env from "@/config/env";
import { displayRoleName } from "@/constants/roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/select";
import {
  Search,
  Shield,
  AlertTriangle,
  Info,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const DB = env.appwriteDatabaseId;
const COL_ACTIVITY = env.collectionAdminActivityLogs;
const COL_SYSTEM = env.collectionSystemEventLogs;
const PAGE_SIZE = 25;

// ── Entity resolution config ────────────────────────────────────────────────
// Maps entityType string → { col, labelFn } to resolve human-readable names.

function joinFields(doc, keys) {
  return keys.map((k) => doc[k]).filter(Boolean).join(" ") || null;
}

const ENTITY_CONFIG = {
  experience:            { col: env.collectionExperiences,          labelFn: (d) => d.publicName || d.name },
  edition:               { col: env.collectionEditions,             labelFn: (d) => d.name },
  pricing_tier:          { col: env.collectionPricingTiers,         labelFn: (d) => d.name },
  pricing_tiers:         { col: env.collectionPricingTiers,         labelFn: (d) => d.name },
  pricing_rule:          { col: env.collectionPricingOptions,       labelFn: (d) => d.ruleType },
  pricing_rules:         { col: env.collectionPricingOptions,       labelFn: (d) => d.ruleType },
  addon:                 { col: env.collectionAddons,               labelFn: (d) => d.name },
  addons:                { col: env.collectionAddons,               labelFn: (d) => d.name },
  package:               { col: env.collectionPackages,             labelFn: (d) => d.name },
  packages:              { col: env.collectionPackages,             labelFn: (d) => d.name },
  pass:                  { col: env.collectionPasses,               labelFn: (d) => d.name },
  passes:                { col: env.collectionPasses,               labelFn: (d) => d.name },
  user_pass:             { col: env.collectionUserPasses,           labelFn: (d) => d.passId },
  user_passes:           { col: env.collectionUserPasses,           labelFn: (d) => d.passId },
  location:              { col: env.collectionLocations,            labelFn: (d) => d.name },
  locations:             { col: env.collectionLocations,            labelFn: (d) => d.name },
  room:                  { col: env.collectionRooms,                labelFn: (d) => d.name },
  rooms:                 { col: env.collectionRooms,                labelFn: (d) => d.name },
  resource:              { col: env.collectionResources,            labelFn: (d) => d.name },
  resources:             { col: env.collectionResources,            labelFn: (d) => d.name },
  slot:                  { col: env.collectionSlots,                labelFn: (d) => d.startDatetime ? new Date(d.startDatetime).toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : null },
  slots:                 { col: env.collectionSlots,                labelFn: (d) => d.startDatetime ? new Date(d.startDatetime).toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : null },
  order:                 { col: env.collectionOrders,               labelFn: (d) => d.orderNumber },
  orders:                { col: env.collectionOrders,               labelFn: (d) => d.orderNumber },
  ticket:                { col: env.collectionTickets,              labelFn: (d) => d.ticketCode },
  tickets:               { col: env.collectionTickets,              labelFn: (d) => d.ticketCode },
  user_profile:          { col: env.collectionUserProfiles,         labelFn: (d) => joinFields(d, ["firstName", "lastName"]) || d.email },
  user_profiles:         { col: env.collectionUserProfiles,         labelFn: (d) => joinFields(d, ["firstName", "lastName"]) || d.email },
  booking_request:       { col: env.collectionBookingRequests,      labelFn: (d) => d.contactName || d.contactEmail },
  booking_requests:      { col: env.collectionBookingRequests,      labelFn: (d) => d.contactName || d.contactEmail },
  contact_message:       { col: env.collectionContactMessages,      labelFn: (d) => d.subject || d.name },
  contact_messages:      { col: env.collectionContactMessages,      labelFn: (d) => d.subject || d.name },
  publication:           { col: env.collectionPublications,         labelFn: (d) => d.title },
  publications:          { col: env.collectionPublications,         labelFn: (d) => d.title },
  section:               { col: env.collectionSections,             labelFn: (d) => d.title },
  sections:              { col: env.collectionSections,             labelFn: (d) => d.title },
  tag:                   { col: env.collectionTags,                 labelFn: (d) => d.name },
  tags:                  { col: env.collectionTags,                 labelFn: (d) => d.name },
  notification_template: { col: env.collectionNotificationTemplates, labelFn: (d) => d.key },
  notification_templates:{ col: env.collectionNotificationTemplates, labelFn: (d) => d.key },
};

// Hook: resolves a single entity label from Appwrite
function useEntityLabel(entityType, entityId) {
  const key = entityType?.toLowerCase().replace(/-/g, "_");
  const config = ENTITY_CONFIG[key];
  return useQuery({
    queryKey: ["entity-label", key, entityId],
    queryFn: async () => {
      const doc = await databases.getDocument(DB, config.col, entityId);
      return config.labelFn(doc) ?? null;
    },
    enabled: !!(config && entityId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

function severityClass(v) {
  if (v === "critical") return "bg-red-600 text-white";
  if (v === "error") return "bg-red-100 text-red-700";
  if (v === "warn") return "bg-amber-100 text-amber-700";
  return "bg-sky-100 text-sky-700"; // info
}

function sourceClass(v) {
  if (v === "admin") return "bg-violet-100 text-violet-700";
  if (v === "function") return "bg-orange-100 text-orange-700";
  if (v === "portal") return "bg-teal-100 text-teal-700";
  return "bg-slate-100 text-slate-600"; // system
}

function resultClass(v) {
  if (v === "error") return "bg-red-100 text-red-700";
  return "bg-green-100 text-green-700"; // ok
}

// ── Helpers ────────────────────────────────────────────────────────────────

function Badge({ label, className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function JsonBlock({ value }) {
  let parsed;
  try {
    parsed = typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    parsed = value;
  }
  return (
    <pre className="text-xs bg-warm-gray text-charcoal-muted rounded-lg p-3 overflow-auto max-h-64 whitespace-pre-wrap break-all border border-sand-dark">
      {JSON.stringify(parsed, null, 2)}
    </pre>
  );
}

function FieldRow({ label, children }) {
  return (
    <div className="py-3 border-b border-sand-dark/30 last:border-0 space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-subtle">
        {label}
      </p>
      <div className="text-sm text-charcoal">{children}</div>
    </div>
  );
}

// Resolves and renders a human-readable entity label alongside its ID
function EntityLabel({ entityType, entityId, inline = false }) {
  const key = entityType?.toLowerCase().replace(/-/g, "_");
  const config = ENTITY_CONFIG[key];
  const { data: label, isLoading } = useEntityLabel(entityType, entityId);
  const shortId = entityId ? entityId.slice(0, 8) + "…" : "—";

  if (!entityId) return <span className="text-charcoal-subtle">—</span>;

  if (inline) {
    // Compact single-line version for table cells
    return (
      <span className="flex items-baseline gap-1.5 min-w-0">
        {isLoading && config ? (
          <span className="h-3 w-16 rounded bg-warm-gray animate-pulse inline-block shrink-0" />
        ) : label ? (
          <span className="font-medium text-charcoal truncate max-w-45" title={label}>{label}</span>
        ) : null}
        <span className="font-mono text-xs text-charcoal-subtle shrink-0">{shortId}</span>
      </span>
    );
  }

  // Full version for drawers
  return (
    <div className="space-y-0.5">
      {isLoading && config ? (
        <div className="h-4 w-32 rounded bg-warm-gray animate-pulse" />
      ) : label ? (
        <p className="font-medium text-charcoal">{label}</p>
      ) : null}
      <p className="font-mono text-xs text-charcoal-muted break-all">{entityId}</p>
    </div>
  );
}

// ── Drawer ─────────────────────────────────────────────────────────────────

function DetailDrawer({ doc, onClose, isSystemEvent = false }) {
  if (!doc) return null;
  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <div
        className="flex-1 bg-charcoal/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="w-full max-w-lg bg-white border-l border-sand-dark overflow-y-auto shadow-2xl flex flex-col">
        <div className="sticky top-0 bg-white border-b border-sand-dark px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-semibold text-charcoal">
            {isSystemEvent ? "System Error" : "Activity Detail"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-warm-gray transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-charcoal-muted" />
          </button>
        </div>
        <div className="p-6 flex-1">
          <div className="flex flex-wrap gap-2 mb-4">
            {doc.severity && (
              <Badge
                label={doc.severity}
                className={severityClass(doc.severity)}
              />
            )}
            {doc.source && (
              <Badge label={doc.source} className={sourceClass(doc.source)} />
            )}
            {doc.result && (
              <Badge label={doc.result} className={resultClass(doc.result)} />
            )}
            {doc.level && (
              <Badge
                label={doc.level}
                className={
                  doc.level === "critical"
                    ? "bg-red-600 text-white"
                    : "bg-red-100 text-red-700"
                }
              />
            )}
          </div>

          <FieldRow label="Timestamp">{formatDate(doc.$createdAt)}</FieldRow>

          {doc.action && (
            <FieldRow label="Action">
              <span className="font-mono">{doc.action}</span>
            </FieldRow>
          )}
          {(doc.entityType || doc.entityId) && (
            <FieldRow label="Entity">
              {doc.entityType && (
                <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-subtle mb-1">
                  {doc.entityType}
                </p>
              )}
              <EntityLabel entityType={doc.entityType} entityId={doc.entityId} />
            </FieldRow>
          )}
          {doc.userId && (
            <FieldRow label="Actor">
              <EntityLabel entityType="user_profile" entityId={doc.userId} />
              {doc.actorRoleSnapshot && (
                <p className="text-xs text-charcoal-subtle mt-1">
                  {displayRoleName(doc.actorRoleSnapshot)}
                </p>
              )}
            </FieldRow>
          )}
          {doc.route && (
            <FieldRow label="Route">
              <span className="font-mono text-xs text-charcoal-muted break-all">
                {doc.route}
              </span>
            </FieldRow>
          )}
          {doc.ipAddress && (
            <FieldRow label="IP Address">
              <span className="font-mono text-xs text-charcoal-muted">
                {doc.ipAddress}
              </span>
            </FieldRow>
          )}
          {doc.requestId && (
            <FieldRow label="Request ID">
              <span className="font-mono text-xs text-charcoal-muted">
                {doc.requestId}
              </span>
            </FieldRow>
          )}
          {doc.errorName && (
            <FieldRow label="Error">
              <p className="font-mono text-red-700 font-medium">
                {doc.errorName}
              </p>
              {doc.errorMessage && (
                <p className="text-xs text-charcoal-muted mt-0.5">
                  {doc.errorMessage}
                </p>
              )}
            </FieldRow>
          )}
          {doc.errorStack && (
            <FieldRow label="Stack Trace">
              <pre className="text-xs bg-warm-gray text-charcoal-muted rounded-lg p-3 overflow-auto max-h-64 whitespace-pre-wrap break-all border border-sand-dark mt-1">
                {doc.errorStack}
              </pre>
            </FieldRow>
          )}
          {(doc.details || doc.context) && (
            <FieldRow label={isSystemEvent ? "Context" : "Details"}>
              <div className="mt-1">
                <JsonBlock value={doc.details ?? doc.context} />
              </div>
            </FieldRow>
          )}
        </div>
      </aside>
    </div>
  );
}

// ── Filter select ──────────────────────────────────────────────────────────
// Uses the Radix-based Select component from @/components/common/select
// so the dropdown matches the rest of the admin design system.

// ── Pagination ──────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between">
      <button
        disabled={page === 0}
        onClick={onPrev}
        className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-sand-dark bg-white hover:bg-warm-gray disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-charcoal"
      >
        <ChevronLeft className="w-4 h-4" /> Previous
      </button>
      <span className="text-sm text-charcoal-muted">
        Page {page + 1} of {totalPages}
      </span>
      <button
        disabled={page >= totalPages - 1}
        onClick={onNext}
        className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-sand-dark bg-white hover:bg-warm-gray disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-charcoal"
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Activity Log Tab ────────────────────────────────────────────────────────

function ActivityLogTab() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);

  const queries = [
    Query.orderDesc("$createdAt"),
    Query.limit(PAGE_SIZE),
    Query.offset(page * PAGE_SIZE),
  ];
  if (severity) queries.push(Query.equal("severity", severity));
  if (source) queries.push(Query.equal("source", source));
  if (search) queries.push(Query.search("action", search));

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["audit.activity", page, severity, source, search],
    queryFn: () => databases.listDocuments(DB, COL_ACTIVITY, queries),
    keepPreviousData: true,
    staleTime: 0,
  });

  const docs = data?.documents ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters = severity || source || search;

  const clearFilters = () => {
    setSeverity("");
    setSource("");
    setSearch("");
    setPage(0);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted pointer-events-none" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Filter by action…"
            className="w-full pl-9 pr-3 h-10 text-sm bg-white border border-sand-dark rounded-lg text-charcoal placeholder:text-charcoal-subtle focus:outline-none focus:ring-2 focus:ring-sage/40"
          />
        </div>
        <Select
          value={severity}
          onValueChange={(v) => {
            setSeverity(v === "all" ? "" : v);
            setPage(0);
          }}
        >
          <SelectTrigger className="h-10 w-40">
            <SelectValue placeholder="All severities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warn">Warn</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={source}
          onValueChange={(v) => {
            setSource(v === "all" ? "" : v);
            setPage(0);
          }}
        >
          <SelectTrigger className="h-10 w-36">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="function">Function</SelectItem>
            <SelectItem value="portal">Portal</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-charcoal-muted hover:text-charcoal transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-sand-dark bg-white hover:bg-warm-gray disabled:opacity-50 transition-colors text-charcoal"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {!isLoading && (
        <p className="text-sm text-charcoal-muted">
          {total} {total === 1 ? "event" : "events"}
        </p>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-sand-dark bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-sand-dark bg-warm-gray/60">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden md:table-cell">
                Entity
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden lg:table-cell">
                Severity
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden lg:table-cell">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-sand last:border-0 animate-pulse"
                >
                  <td className="px-4 py-3">
                    <div className="h-4 w-36 rounded bg-warm-gray" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 rounded bg-warm-gray" />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="h-4 w-20 rounded bg-warm-gray" />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="h-4 w-14 rounded bg-warm-gray" />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="h-4 w-16 rounded bg-warm-gray" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-10 rounded bg-warm-gray" />
                  </td>
                </tr>
              ))}
            {isError && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-sm text-red-600"
                >
                  Failed to load events.
                </td>
              </tr>
            )}
            {!isLoading && !isError && docs.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-sm text-charcoal-subtle"
                >
                  No events found.
                </td>
              </tr>
            )}
            {!isLoading &&
              docs.map((doc) => (
                <tr
                  key={doc.$id}
                  className="border-b border-sand last:border-0 hover:bg-warm-gray/30 transition-colors cursor-pointer"
                  onClick={() => setSelected(doc)}
                >
                  <td className="px-4 py-3 text-charcoal-muted whitespace-nowrap text-xs">
                    {formatDate(doc.$createdAt)}
                  </td>
                  <td className="px-4 py-3 font-mono text-charcoal font-medium">
                    {doc.action}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {doc.entityType || doc.entityId ? (
                      <div className="flex flex-col gap-0.5">
                        {doc.entityType && (
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-subtle">
                            {doc.entityType}
                          </span>
                        )}
                        <EntityLabel
                          entityType={doc.entityType}
                          entityId={doc.entityId}
                          inline
                        />
                      </div>
                    ) : (
                      <span className="text-charcoal-subtle text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Badge
                      label={doc.severity ?? "info"}
                      className={severityClass(doc.severity ?? "info")}
                    />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Badge
                      label={doc.source ?? "admin"}
                      className={sourceClass(doc.source ?? "admin")}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={doc.result ?? "ok"}
                      className={resultClass(doc.result ?? "ok")}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => setPage((p) => p + 1)}
      />
      <DetailDrawer doc={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

// ── System Errors Tab (root-only) ──────────────────────────────────────────

function SystemErrorsTab() {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["audit.system", page],
    queryFn: () =>
      databases.listDocuments(DB, COL_SYSTEM, [
        Query.orderDesc("$createdAt"),
        Query.limit(PAGE_SIZE),
        Query.offset(page * PAGE_SIZE),
      ]),
    keepPreviousData: true,
    staleTime: 0,
  });

  const docs = data?.documents ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {!isLoading && (
        <p className="text-sm text-charcoal-muted">
          {total} {total === 1 ? "error" : "errors"} logged
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-red-200 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-red-100 bg-red-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                Error
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden md:table-cell">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden lg:table-cell">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                Level
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-red-50 last:border-0 animate-pulse"
                >
                  <td className="px-4 py-3">
                    <div className="h-4 w-36 rounded bg-warm-gray" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-48 rounded bg-warm-gray" />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="h-4 w-16 rounded bg-warm-gray" />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="h-4 w-24 rounded bg-warm-gray" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-12 rounded bg-warm-gray" />
                  </td>
                </tr>
              ))}
            {isError && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <p className="text-sm font-medium text-red-600 mb-1">
                    Failed to load system errors.
                  </p>
                  <p className="text-xs text-charcoal-subtle font-mono">
                    {error?.message ??
                      "Collection may not be deployed. Run: appwrite deploy collections"}
                  </p>
                </td>
              </tr>
            )}
            {!isLoading && !isError && docs.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-charcoal-subtle"
                >
                  No system errors recorded.
                </td>
              </tr>
            )}
            {!isLoading &&
              docs.map((doc) => (
                <tr
                  key={doc.$id}
                  className="border-b border-red-50 last:border-0 hover:bg-red-50/60 transition-colors cursor-pointer"
                  onClick={() => setSelected(doc)}
                >
                  <td className="px-4 py-3 text-charcoal-muted whitespace-nowrap text-xs">
                    {formatDate(doc.$createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-medium text-red-700">
                      {doc.errorName ?? "Error"}
                    </span>
                    {doc.errorMessage && (
                      <span className="text-charcoal-muted text-xs ml-2 truncate max-w-xs inline-block align-middle">
                        {doc.errorMessage.slice(0, 80)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge
                      label={doc.source ?? "admin"}
                      className={sourceClass(doc.source ?? "admin")}
                    />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {doc.userId ? (
                      <EntityLabel entityType="user_profile" entityId={doc.userId} inline />
                    ) : (
                      <span className="text-charcoal-subtle text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={doc.level ?? "error"}
                      className={
                        doc.level === "critical"
                          ? "bg-red-600 text-white"
                          : "bg-red-100 text-red-700"
                      }
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => setPage((p) => p + 1)}
      />
      <DetailDrawer
        doc={selected}
        onClose={() => setSelected(null)}
        isSystemEvent
      />
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

const TABS = [
  { id: "activity", label: "Activity Log", icon: Info },
  { id: "errors", label: "System Errors", icon: AlertTriangle },
];

export default function AuditLogPage() {
  const { isRoot } = useAuth();
  const [tab, setTab] = useState("activity");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-charcoal-muted" />
          <h1 className="text-2xl font-display font-semibold text-charcoal">
            Audit Log
          </h1>
        </div>
        <p className="text-sm text-charcoal-muted mt-1">
          Track admin activity and system errors. Visible to root only.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-sand-dark">
        <nav className="flex gap-1 -mb-px">
          {TABS.map(({ id, label, icon: Icon }) => {
            if (id === "errors" && !isRoot) return null;
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={[
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  active
                    ? "border-sage text-sage-dark"
                    : "border-transparent text-charcoal-muted hover:text-charcoal hover:border-sand-dark",
                ].join(" ")}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {tab === "activity" && <ActivityLogTab />}
      {tab === "errors" && isRoot && <SystemErrorsTab />}
    </div>
  );
}
