/**
 * WizardStepWrapper — consistent layout shell for each wizard step.
 * Provides title, description, content area, and prev/next navigation.
 */
export default function WizardStepWrapper({ title, description, children, footer }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-charcoal">{title}</h2>
        {description && (
          <p className="text-sm text-charcoal-muted mt-0.5">{description}</p>
        )}
      </div>
      <div>{children}</div>
      {footer && <div className="pt-2">{footer}</div>}
    </div>
  );
}
