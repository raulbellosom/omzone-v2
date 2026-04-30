import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import ResourceListTab from "@/components/admin/resources/ResourceListTab";
import LocationListTab from "@/components/admin/resources/LocationListTab";
import RoomListTab from "@/components/admin/resources/RoomListTab";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const TABS = [
  { id: "resources", i18nKey: "admin.resources.tabResources" },
  { id: "locations", i18nKey: "admin.resources.tabLocations" },
  { id: "rooms", i18nKey: "admin.resources.tabRooms" },
];

export default function ResourcesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const activeTab = searchParams.get("tab") ?? "resources";

  function setTab(id) {
    setSearchParams({ tab: id });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-charcoal">
          {t("admin.resources.title")}
        </h1>
        <p className="text-sm text-charcoal-subtle mt-0.5">
          {t("admin.resources.subtitle")}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-sand-dark">
        <nav className="-mb-px flex gap-0" aria-label="Secciones">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={cn(
                "px-5 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-sage text-sage"
                  : "border-transparent text-charcoal-subtle hover:text-charcoal hover:border-sand-dark",
              )}
            >
              {t(tab.i18nKey)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "resources" && <ResourceListTab />}
        {activeTab === "locations" && <LocationListTab />}
        {activeTab === "rooms" && <RoomListTab />}
      </div>
    </div>
  );
}
