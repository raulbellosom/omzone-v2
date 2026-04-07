import { NavLink, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Info", to: (id) => `/admin/experiences/${id}/edit` },
  { label: "Ediciones", to: (id) => `/admin/experiences/${id}/editions` },
  { label: "Precios", to: (id) => `/admin/experiences/${id}/pricing` },
  { label: "Addons", to: (id) => `/admin/experiences/${id}/addons` },
  { label: "Slots", to: (id) => `/admin/experiences/${id}/slots` },
];

export default function ExperienceDetailTabs() {
  const { id } = useParams();

  return (
    <nav className="flex gap-1 border-b border-sand-dark mb-6 -mt-2">
      {tabs.map((tab) => (
        <NavLink
          key={tab.label}
          to={tab.to(id)}
          end
          className={({ isActive }) =>
            cn(
              "px-4 py-2.5 text-sm font-medium transition-colors relative",
              isActive
                ? "text-charcoal after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-sage"
                : "text-charcoal-subtle hover:text-charcoal",
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
