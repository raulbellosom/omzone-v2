import { useState } from "react";
import { Search, CheckCircle2 } from "lucide-react";
import { useExperiences } from "@/hooks/useExperiences";
import WizardStepWrapper from "./WizardStepWrapper";
import { cn } from "@/lib/utils";

const TYPE_LABELS = {
  session: "Sesión",
  immersion: "Inmersión",
  retreat: "Retiro",
  stay: "Estancia",
  private: "Privada",
  package: "Paquete",
};

function ExperienceCard({ experience, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-xl border-2 px-4 py-3 transition-all",
        selected
          ? "border-sage bg-sage/5"
          : "border-sand-dark/40 hover:border-sage/50"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-charcoal truncate">{experience.publicName}</p>
          <p className="text-xs text-charcoal-subtle mt-0.5">
            {TYPE_LABELS[experience.type] ?? experience.type}
            {" · "}
            <span className="capitalize">{experience.saleMode}</span>
          </p>
          {experience.shortDescription && (
            <p className="text-xs text-charcoal-muted mt-1 line-clamp-2">{experience.shortDescription}</p>
          )}
        </div>
        {selected && <CheckCircle2 className="h-5 w-5 text-sage shrink-0 mt-0.5" />}
      </div>
    </button>
  );
}

export default function ExperienceSelectStep({ wizard, setWizardField }) {
  const [search, setSearch] = useState("");
  const { data: experiences, loading } = useExperiences({ search, status: "published", limit: 50 });

  function handleSelect(exp) {
    if (wizard.experience?.$id === exp.$id) return;
    setWizardField("experience", exp);
    // Reset downstream when experience changes
    setWizardField("pricingTier", null);
    setWizardField("slot", null);
    setWizardField("selectedAddonIds", []);
  }

  return (
    <WizardStepWrapper
      title="Experiencia"
      description="Selecciona la experiencia que va a comprar el cliente."
    >
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-subtle pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar experiencia..."
          className={cn(
            "h-10 w-full rounded-xl border border-sand-dark bg-white pl-9 pr-3 text-sm text-charcoal",
            "placeholder:text-charcoal-subtle focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
          )}
        />
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 rounded-full border-2 border-sage border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && experiences.length === 0 && (
        <p className="text-sm text-charcoal-muted text-center py-6">
          {search ? "Sin resultados" : "No hay experiencias publicadas"}
        </p>
      )}

      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
        {experiences.map((exp) => (
          <ExperienceCard
            key={exp.$id}
            experience={exp}
            selected={wizard.experience?.$id === exp.$id}
            onSelect={() => handleSelect(exp)}
          />
        ))}
      </div>
    </WizardStepWrapper>
  );
}
