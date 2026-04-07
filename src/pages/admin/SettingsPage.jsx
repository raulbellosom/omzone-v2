import { useState } from "react";
import { useNotificationTemplates } from "@/hooks/useNotificationTemplates";
import { useLanguage } from "@/hooks/useLanguage";
import { Card } from "@/components/common/Card";
import TemplateEditor from "@/components/admin/settings/TemplateEditor";
import SystemInfoPanel from "@/components/admin/settings/SystemInfoPanel";
import { Mail, Settings, Bell, Loader2 } from "lucide-react";

const SECTION_TABS = ["templates", "system"];

function TemplateBadge({ type }) {
  const colors = {
    email: "bg-blue-50 text-blue-700",
    sms: "bg-amber-50 text-amber-700",
    push: "bg-purple-50 text-purple-700",
  };
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[type] || "bg-warm-gray text-charcoal"}`}
    >
      {type}
    </span>
  );
}

function ActiveDot({ active }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${active ? "bg-green-500" : "bg-charcoal-muted/40"}`}
      title={active ? "Active" : "Inactive"}
    />
  );
}

export default function SettingsPage() {
  const { t } = useLanguage();
  const { templates, loading, error, updateTemplate } =
    useNotificationTemplates();

  const [activeTab, setActiveTab] = useState("templates");
  const [editingTemplate, setEditingTemplate] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-charcoal">
          {t("admin.settings.title")}
        </h1>
        <p className="text-sm text-charcoal-muted mt-1">
          {t("admin.settings.subtitle")}
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 border-b border-sand-dark/30">
        {SECTION_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? "border-sage text-sage"
                : "border-transparent text-charcoal-muted hover:text-charcoal"
            }`}
          >
            {tab === "templates" ? (
              <Bell className="h-4 w-4" />
            ) : (
              <Settings className="h-4 w-4" />
            )}
            {tab === "templates"
              ? t("admin.settings.notificationTemplates")
              : t("admin.settings.systemInfo")}
          </button>
        ))}
      </div>

      {/* Templates section */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          {error && (
            <Card className="p-4 border-red-200 bg-red-50">
              <p className="text-sm text-red-700">{error}</p>
            </Card>
          )}

          {loading && (
            <Card className="p-10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-charcoal-muted" />
            </Card>
          )}

          {!loading && templates.length === 0 && (
            <Card className="p-10 text-center">
              <Mail className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-charcoal mb-1">
                {t("admin.settings.noTemplates")}
              </h2>
              <p className="text-sm text-charcoal-muted">
                {t("admin.settings.noTemplatesHint")}
              </p>
            </Card>
          )}

          {!loading && templates.length > 0 && (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto rounded-xl border border-sand-dark">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-warm-gray/50">
                        <th className="px-4 py-3 text-left font-medium text-charcoal w-8" />
                        <th className="px-4 py-3 text-left font-medium text-charcoal">
                          {t("admin.settings.templateKey")}
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-charcoal">
                          {t("admin.settings.type")}
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-charcoal">
                          {t("admin.settings.subject")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {templates.map((tpl) => (
                        <tr
                          key={tpl.$id}
                          className="border-b border-sand-dark/40 hover:bg-warm-gray/30 transition-colors cursor-pointer"
                          onClick={() => setEditingTemplate(tpl)}
                        >
                          <td className="px-4 py-3">
                            <ActiveDot active={tpl.isActive} />
                          </td>
                          <td className="px-4 py-3 font-medium text-charcoal font-mono text-xs">
                            {tpl.key}
                          </td>
                          <td className="px-4 py-3">
                            <TemplateBadge type={tpl.type} />
                          </td>
                          <td className="px-4 py-3 text-charcoal-muted truncate max-w-xs">
                            {tpl.subject || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {templates.map((tpl) => (
                  <Card
                    key={tpl.$id}
                    className="p-4 space-y-2 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setEditingTemplate(tpl)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <ActiveDot active={tpl.isActive} />
                        <p className="font-medium text-charcoal font-mono text-xs truncate">
                          {tpl.key}
                        </p>
                      </div>
                      <TemplateBadge type={tpl.type} />
                    </div>
                    <p className="text-xs text-charcoal-muted truncate">
                      {tpl.subject || "—"}
                    </p>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Editor dialog */}
          {editingTemplate && (
            <TemplateEditor
              key={editingTemplate.$id}
              template={editingTemplate}
              open={!!editingTemplate}
              onOpenChange={(open) => {
                if (!open) setEditingTemplate(null);
              }}
              onSave={updateTemplate}
            />
          )}
        </div>
      )}

      {/* System info section */}
      {activeTab === "system" && <SystemInfoPanel />}
    </div>
  );
}
