import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import ResourceListTab from "@/components/admin/resources/ResourceListTab";
import LocationListTab from "@/components/admin/resources/LocationListTab";
import RoomListTab from "@/components/admin/resources/RoomListTab";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "resources", label: "Recursos" },
  { id: "locations", label: "Locaciones" },
  { id: "rooms",     label: "Cuartos" },
];

export default function ResourcesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "resources";

  function setTab(id) {
    setSearchParams({ tab: id });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-charcoal">Recursos operativos</h1>
        <p className="text-sm text-charcoal-subtle mt-0.5">
          Gestiona instructores, espacios, locaciones y cuartos para las experiencias.
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
                  : "border-transparent text-charcoal-subtle hover:text-charcoal hover:border-sand-dark"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "resources" && <ResourceListTab />}
        {activeTab === "locations" && <LocationListTab />}
        {activeTab === "rooms"     && <RoomListTab />}
      </div>
    </div>
  );
}
