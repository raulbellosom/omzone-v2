import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { databases, Query } from "@/lib/appwrite";
import { useAuth } from "@/hooks/useAuth";
import { useConsumePass } from "@/hooks/useConsumePass";
import { useValidSlots } from "@/hooks/useValidSlots";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import CreditBar from "@/components/portal/passes/CreditBar";
import TicketQR from "@/components/common/TicketQR";
import env from "@/config/env";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Zap,
  AlertCircle,
} from "lucide-react";

const DB = env.appwriteDatabaseId;
const COL_USER_PASSES = env.collectionUserPasses;
const COL_EXPERIENCES = env.collectionExperiences;

function safeParse(str) {
  if (!str) return {};
  try {
    return typeof str === "string" ? JSON.parse(str) : str;
  } catch {
    return {};
  }
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Step indicators ─────────────────────────────────────────────────────────

const STEPS = [
  { key: "experience", label: "Experiencia" },
  { key: "slot", label: "Horario" },
  { key: "confirm", label: "Confirmar" },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((step, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <div key={step.key} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`w-6 h-px ${isDone ? "bg-sage" : "bg-warm-gray-dark/20"}`}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  isDone
                    ? "bg-sage text-white"
                    : isActive
                      ? "bg-sage/20 text-sage ring-2 ring-sage/30"
                      : "bg-warm-gray/30 text-charcoal-muted"
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  isActive ? "text-charcoal" : "text-charcoal-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function UsePassPage() {
  const { userPassId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [userPass, setUserPass] = useState(null);
  const [passLoading, setPassLoading] = useState(true);
  const [passError, setPassError] = useState(null);

  // Step state
  const [step, setStep] = useState(0);
  const [experiences, setExperiences] = useState([]);
  const [expLoading, setExpLoading] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const { data: slots, loading: slotsLoading } = useValidSlots({
    experienceId: selectedExperience?.$id || "",
  });

  const { consume, result, loading: consuming, error: consumeError, reset } =
    useConsumePass();

  // ── Fetch user pass ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userPassId) return;
    setPassLoading(true);
    databases
      .getDocument(DB, COL_USER_PASSES, userPassId)
      .then((doc) => {
        if (doc.userId !== user?.$id) {
          setPassError("Pase no encontrado");
          return;
        }
        if (doc.status !== "active") {
          setPassError("Este pase no está activo");
          return;
        }
        if (doc.totalCredits - doc.usedCredits <= 0) {
          setPassError("No quedan créditos en este pase");
          return;
        }
        setUserPass(doc);
      })
      .catch(() => setPassError("Pase no encontrado"))
      .finally(() => setPassLoading(false));
  }, [userPassId, user?.$id]);

  // ── Fetch valid experiences ────────────────────────────────────────────────
  useEffect(() => {
    if (!userPass) return;

    const snap = safeParse(userPass.passSnapshot);
    const validIdsRaw = snap.validExperienceIds;
    let validIds = [];
    if (typeof validIdsRaw === "string") {
      validIds = safeParse(validIdsRaw) || [];
    } else if (Array.isArray(validIdsRaw)) {
      validIds = validIdsRaw;
    }

    setExpLoading(true);

    (async () => {
      try {
        let docs;
        if (validIds.length > 0) {
          // Fetch only valid experiences
          const res = await databases.listDocuments(DB, COL_EXPERIENCES, [
            Query.equal("$id", validIds),
            Query.equal("status", "published"),
            Query.orderAsc("name"),
            Query.limit(100),
          ]);
          docs = res.documents;
        } else {
          // No restrictions — show all published experiences
          const res = await databases.listDocuments(DB, COL_EXPERIENCES, [
            Query.equal("status", "published"),
            Query.orderAsc("name"),
            Query.limit(100),
          ]);
          docs = res.documents;
        }
        setExperiences(docs);
      } catch {
        setExperiences([]);
      } finally {
        setExpLoading(false);
      }
    })();
  }, [userPass]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleSelectExperience(exp) {
    setSelectedExperience(exp);
    setSelectedSlot(null);
    setStep(1);
  }

  function handleSelectSlot(slot) {
    setSelectedSlot(slot);
    setStep(2);
  }

  async function handleConfirm() {
    const data = await consume({
      userPassId,
      slotId: selectedSlot.$id,
    });

    if (data) {
      // Refresh pass data
      try {
        const fresh = await databases.getDocument(
          DB,
          COL_USER_PASSES,
          userPassId,
        );
        setUserPass(fresh);
      } catch {
        /* */
      }
    }
  }

  function handleBack() {
    if (step === 0) {
      navigate(`/portal/passes/${userPassId}`);
    } else {
      reset();
      if (step === 2) setSelectedSlot(null);
      if (step === 1) {
        setSelectedExperience(null);
        setSelectedSlot(null);
      }
      setStep(step - 1);
    }
  }

  // ── Loading/error states ───────────────────────────────────────────────────

  if (passLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-sage" />
      </div>
    );
  }

  if (passError || !userPass) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-charcoal-muted">
          {passError || "Pase no encontrado"}
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("/portal/passes")}
        >
          Volver a Pases
        </Button>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────

  if (result) {
    const remaining = result.remainingCredits ?? 0;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-warm-gray-dark/10 shadow-sm p-6 md:p-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto">
            <Check className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-display font-bold text-charcoal">
              ¡Crédito consumido!
            </h1>
            <p className="text-sm text-charcoal-muted">
              Tu ticket ha sido generado exitosamente.
            </p>
          </div>

          {result.ticket?.ticketCode && (
            <div className="space-y-2">
              <div className="flex justify-center">
                <TicketQR value={result.ticket.ticketCode} size={200} />
              </div>
              <p className="font-mono text-sm text-charcoal-muted tracking-widest">
                {result.ticket.ticketCode}
              </p>
            </div>
          )}

          <p className="text-sm text-charcoal-muted">
            Créditos restantes:{" "}
            <span className="font-semibold text-charcoal">{remaining}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {result.ticket?.$id && (
              <Link to={`/portal/tickets/${result.ticket.$id}`}>
                <Button size="md">Ver ticket</Button>
              </Link>
            )}
            <Button variant="outline" size="md" asChild>
              <Link to={`/portal/passes/${userPassId}`}>Volver al pase</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Wizard ─────────────────────────────────────────────────────────────────

  const snap = safeParse(userPass.passSnapshot);
  const passName = snap.name || snap.passName || "Pase";
  const remaining = userPass.totalCredits - userPass.usedCredits;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        {step === 0 ? "Volver al pase" : "Atrás"}
      </button>

      {/* Pass summary bar */}
      <div className="bg-white rounded-xl border border-warm-gray-dark/10 p-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-charcoal truncate">
            {passName}
          </p>
          <CreditBar
            total={userPass.totalCredits}
            used={userPass.usedCredits}
            size="sm"
            showLabel={false}
          />
        </div>
        <Badge variant="success">
          {remaining} crédito{remaining !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} />

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-warm-gray-dark/10 shadow-sm p-6">
        {/* Step 0: Select experience */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-charcoal">
              Selecciona una experiencia
            </h2>
            {expLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-sage" />
              </div>
            ) : experiences.length === 0 ? (
              <p className="text-sm text-charcoal-muted text-center py-6">
                No hay experiencias disponibles para este pase.
              </p>
            ) : (
              <ul className="divide-y divide-warm-gray-dark/10">
                {experiences.map((exp) => (
                  <li key={exp.$id}>
                    <button
                      onClick={() => handleSelectExperience(exp)}
                      className="w-full text-left py-3 px-2 hover:bg-cream/50 rounded-lg transition-colors flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-charcoal truncate">
                          {exp.name}
                        </p>
                        {exp.type && (
                          <p className="text-xs text-charcoal-muted capitalize">
                            {exp.type}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-charcoal-muted shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Step 1: Select slot */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-charcoal">
                Selecciona un horario
              </h2>
              <p className="text-xs text-charcoal-muted mt-0.5">
                {selectedExperience?.name}
              </p>
            </div>
            {slotsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-sage" />
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-sm text-charcoal-muted">
                  No hay horarios disponibles para esta experiencia.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedExperience(null);
                    setStep(0);
                  }}
                >
                  Elegir otra experiencia
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {slots.map((slot) => {
                  const spotsLeft = slot.capacity - slot.bookedCount;
                  return (
                    <li key={slot.$id}>
                      <button
                        onClick={() => handleSelectSlot(slot)}
                        className="w-full text-left p-3 border border-warm-gray-dark/10 hover:border-sage/30 hover:bg-cream/50 rounded-xl transition-colors flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3 text-sm">
                            <span className="inline-flex items-center gap-1 font-medium text-charcoal">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(slot.startDatetime)}
                            </span>
                            <span className="inline-flex items-center gap-1 text-charcoal-muted">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTime(slot.startDatetime)}
                            </span>
                          </div>
                          {slot.locationName && (
                            <p className="text-xs text-charcoal-muted inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {slot.locationName}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-xs text-charcoal-muted">
                            {spotsLeft} lugar{spotsLeft !== 1 ? "es" : ""}
                          </span>
                          <ChevronRight className="h-4 w-4 text-charcoal-muted ml-1 inline" />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && selectedExperience && selectedSlot && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-semibold text-charcoal">
              Confirmar consumo
            </h2>

            <div className="bg-cream/50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium text-charcoal">
                {selectedExperience.name}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-muted">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(selectedSlot.startDatetime)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(selectedSlot.startDatetime)}
                </span>
                {selectedSlot.locationName && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {selectedSlot.locationName}
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-charcoal text-center">
              Se usará{" "}
              <span className="font-semibold">1 crédito</span> de tu pase.
              <br />
              <span className="text-charcoal-muted">
                Te quedarán {remaining - 1} crédito
                {remaining - 1 !== 1 ? "s" : ""}.
              </span>
            </p>

            {consumeError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {consumeError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                size="md"
                onClick={handleConfirm}
                disabled={consuming}
                className="inline-flex items-center gap-2"
              >
                {consuming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {consuming ? "Procesando…" : "Confirmar"}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleBack}
                disabled={consuming}
              >
                Atrás
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
