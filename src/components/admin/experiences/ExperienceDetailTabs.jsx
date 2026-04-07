import { NavLink, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const tabs = [
  { key: "admin.experiences.tabInfo", to: (id) => `/admin/experiences/${id}/edit` },
  { key: "admin.experiences.tabEditions", to: (id) => `/admin/experiences/${id}/editions` },
  { key: "admin.experiences.tabPricing", to: (id) => `/admin/experiences/${id}/pricing` },
  { key: "admin.experiences.tabAddons", to: (id) => `/admin/experiences/${id}/addons` },
  { key: "admin.experiences.tabSlots", to: (id) => `/admin/experiences/${id}/slots` },
];

export default function ExperienceDetailTabs() {
  const { id } = useParams();
  const { t } = useLanguage();

  return (
    <nav className="flex gap-1 border-b border-sand-dark mb-6 -mt-2">
      {tabs.map((tab) => (
        <NavLink
          key={tab.key}
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
          {t(tab.key)}
        </NavLink>
      ))}
    </nav>
  );
}
