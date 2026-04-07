import { useState, useEffect, useRef } from "react";
import { databases, Query } from "@/lib/appwrite";
import env from "@/config/env";
import { cn } from "@/lib/utils";
import { X, ChevronDown, Check } from "lucide-react";

const DB = env.appwriteDatabaseId;
const COL = env.collectionExperiences;

export default function ExperiencePicker({
  value = [],
  onChange,
  disabled,
  error,
}) {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    databases
      .listDocuments(DB, COL, [
        Query.equal("status", "published"),
        Query.orderAsc("name"),
        Query.limit(100),
      ])
      .then((res) => setExperiences(res.documents))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(id) {
    if (disabled) return;
    const next = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];
    onChange(next);
  }

  function remove(id) {
    if (disabled) return;
    onChange(value.filter((v) => v !== id));
  }

  const selectedExps = experiences.filter((e) => value.includes(e.$id));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          "flex min-h-[44px] w-full items-center rounded-xl border border-sand-dark bg-white px-3 py-2 text-sm text-left",
          "focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20",
          "disabled:opacity-50 disabled:bg-warm-gray",
          error && "border-red-400",
        )}
      >
        <span className="flex-1 truncate text-charcoal-subtle">
          {loading
            ? "Cargando..."
            : value.length === 0
              ? "Todas las experiencias (sin restricción)"
              : `${value.length} experiencia(s) seleccionada(s)`}
        </span>
        <ChevronDown className="h-4 w-4 text-charcoal-muted shrink-0" />
      </button>

      {/* Selected tags */}
      {selectedExps.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedExps.map((exp) => (
            <span
              key={exp.$id}
              className="inline-flex items-center gap-1 rounded-full bg-sage/10 px-2.5 py-1 text-xs text-sage-dark"
            >
              {exp.name}
              <button
                type="button"
                onClick={() => remove(exp.$id)}
                className="hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-sand-dark bg-white shadow-lg">
          {experiences.length === 0 && (
            <p className="px-3 py-2 text-sm text-charcoal-muted">
              Sin experiencias publicadas
            </p>
          )}
          {experiences.map((exp) => {
            const selected = value.includes(exp.$id);
            return (
              <button
                key={exp.$id}
                type="button"
                onClick={() => toggle(exp.$id)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-warm-gray/40 transition-colors",
                  selected && "bg-sage/5",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    selected
                      ? "border-sage bg-sage text-white"
                      : "border-sand-dark",
                  )}
                >
                  {selected && <Check className="h-3 w-3" />}
                </span>
                <span className="truncate">{exp.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
