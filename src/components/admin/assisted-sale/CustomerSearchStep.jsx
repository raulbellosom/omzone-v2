import { useState, useEffect, useRef, useCallback } from "react";
import { Search, UserPlus, CheckCircle2 } from "lucide-react";
import { useCustomerSearch } from "@/hooks/useCustomerSearch";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import WizardStepWrapper from "./WizardStepWrapper";
import { cn, isValidPhone } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

function CustomerCard({ profile, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-xl border-2 px-4 py-3 transition-all",
        selected
          ? "border-sage bg-sage/5"
          : "border-sand-dark/40 hover:border-sage/50",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-charcoal">
            {profile.displayName ||
              `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
              t("admin.assistedSale.customer.noName")}
          </p>
          <p className="text-xs text-charcoal-muted">{profile.email}</p>
        </div>
        {selected && <CheckCircle2 className="h-5 w-5 text-sage shrink-0" />}
      </div>
    </button>
  );
}

export default function CustomerSearchStep({ wizard, setWizardField }) {
  const { t } = useLanguage();
  const [emailQuery, setEmailQuery] = useState(wizard.customerEmail || "");
  const [showNewForm, setShowNewForm] = useState(wizard.isNewCustomer || false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const { results, loading, search } = useCustomerSearch();
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (emailQuery.trim().length >= 3) search(emailQuery);
    }, 350);
  }, [emailQuery, search]);

  function handleSelectExisting(profile) {
    setWizardField("customer", profile);
    setWizardField(
      "customerName",
      profile.displayName ||
        `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim(),
    );
    setWizardField("customerEmail", profile.email || "");
    setWizardField("isNewCustomer", false);
    setShowNewForm(false);
  }

  function handleNewCustomer() {
    setWizardField("customer", null);
    setWizardField("isNewCustomer", true);
    setShowNewForm(true);
    // Pre-fill email from search query
    if (emailQuery.trim()) setWizardField("customerEmail", emailQuery.trim());
  }

  const hasSelection = !!(
    wizard.customer ||
    (wizard.isNewCustomer && wizard.customerName && wizard.customerEmail)
  );

  return (
    <WizardStepWrapper
      title={t("admin.assistedSale.customer.title")}
      description={t("admin.assistedSale.customer.description")}
    >
      {/* Search input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-subtle pointer-events-none" />
        <input
          type="email"
          value={emailQuery}
          onChange={(e) => {
            setEmailQuery(e.target.value);
            setWizardField("customerEmail", e.target.value);
            if (wizard.customer) {
              setWizardField("customer", null);
              setWizardField("isNewCustomer", false);
            }
          }}
          placeholder={t("admin.assistedSale.customer.searchPlaceholder")}
          className={cn(
            "h-11 w-full rounded-xl border border-sand-dark bg-white pl-9 pr-3 text-sm text-charcoal",
            "placeholder:text-charcoal-subtle focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20",
          )}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-sage border-t-transparent animate-spin" />
        )}
      </div>

      {/* Search results */}
      {results.length > 0 && !showNewForm && (
        <div className="space-y-2 mb-4">
          <p className="text-xs text-charcoal-subtle uppercase tracking-wide font-medium">
            {t("admin.assistedSale.customer.foundResults")}
          </p>
          {results.map((profile) => (
            <CustomerCard
              key={profile.$id}
              profile={profile}
              selected={wizard.customer?.$id === profile.$id}
              onSelect={() => handleSelectExisting(profile)}
            />
          ))}
        </div>
      )}

      {/* No results + email looks valid */}
      {results.length === 0 &&
        emailQuery.trim().length >= 5 &&
        !loading &&
        !showNewForm && (
          <p className="text-sm text-charcoal-muted mb-4">
            {t("admin.assistedSale.customer.notFound")}
          </p>
        )}

      {/* Create new customer button */}
      {!showNewForm && !wizard.customer && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleNewCustomer}
        >
          <UserPlus className="h-4 w-4" />
          {t("admin.assistedSale.customer.createNew")}
        </Button>
      )}

      {/* New customer form */}
      {showNewForm && (
        <div className="space-y-3 rounded-xl border border-sand-dark/40 bg-warm-gray/20 p-4">
          <p className="text-sm font-medium text-charcoal">
            {t("admin.assistedSale.customer.newCustomer")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-charcoal">
                {t("admin.assistedSale.customer.fullName")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                value={wizard.customerName}
                onChange={(e) => setWizardField("customerName", e.target.value)}
                placeholder={t("admin.placeholders.customerName")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-charcoal">
                {t("admin.assistedSale.customer.email")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={wizard.customerEmail}
                onChange={(e) =>
                  setWizardField("customerEmail", e.target.value)
                }
                placeholder={t("admin.placeholders.customerEmail")}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-charcoal">
                {t("admin.assistedSale.customer.phone")}
              </label>
              <Input
                type="tel"
                value={wizard.customerPhone}
                onChange={(e) => {
                  setWizardField("customerPhone", e.target.value);
                  if (!e.target.value.trim()) setPhoneTouched(false);
                }}
                onBlur={() => setPhoneTouched(true)}
                placeholder={t("admin.placeholders.customerPhone")}
              />
              {phoneTouched &&
                wizard.customerPhone?.trim() &&
                !isValidPhone(wizard.customerPhone) && (
                  <p className="text-xs text-red-500 mt-1">
                    {t("common.phoneError")}
                  </p>
                )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowNewForm(false);
              setWizardField("isNewCustomer", false);
              setWizardField("customer", null);
            }}
            className="text-xs text-charcoal-subtle hover:text-charcoal underline"
          >
            {t("admin.assistedSale.customer.cancelSearch")}
          </button>
        </div>
      )}

      {/* Selected customer confirmation */}
      {wizard.customer && !showNewForm && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-sage/10 border border-sage/20 px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-sage shrink-0" />
          <span className="text-sm text-charcoal">
            <strong>
              {wizard.customer.displayName || wizard.customerName}
            </strong>
            {" — "}
            {wizard.customer.email || wizard.customerEmail}
          </span>
        </div>
      )}
    </WizardStepWrapper>
  );
}
