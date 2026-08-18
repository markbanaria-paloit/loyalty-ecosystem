/**
 * Wizard chrome shared by the tier-set and campaign builders.
 *
 * Both follow the OpenLoyalty console pattern: a stepper across the top, a
 * two-thirds form column of numbered collapsible sections, and a contextual
 * help card down the right that explains the step you are on.
 */
import type { ReactNode } from 'react';

export interface StepDefinition {
  title: string;
  subtitle: string;
}

/**
 * Progress across the wizard. Steps before the current one are marked done and
 * are clickable; steps after it are inert until you get there.
 */
export function Stepper({
  steps,
  current,
  onJump,
}: {
  steps: StepDefinition[];
  current: number;
  onJump?: (index: number) => void;
}) {
  return (
    <ol className="stepper">
      {steps.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'upcoming';
        const clickable = state === 'done' && Boolean(onJump);
        return (
          <li key={step.title} className={`step ${state}`}>
            {i > 0 && <span className="step-line" aria-hidden />}
            <button
              type="button"
              className="step-button"
              disabled={!clickable}
              onClick={clickable ? () => onJump?.(i) : undefined}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className="step-marker" aria-hidden>
                {state === 'done' ? '✓' : state === 'current' ? '' : i + 1}
              </span>
              <span className="step-text">
                <strong>{step.title}</strong>
                <span className="step-sub">{step.subtitle}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** Form column plus the help column beside it. */
export function WizardShell({ children, aside }: { children: ReactNode; aside: ReactNode }) {
  return (
    <div className="wizard-body">
      <div className="wizard-form">{children}</div>
      <aside className="wizard-aside">{aside}</aside>
    </div>
  );
}

/**
 * A numbered, collapsible form section. The console opens one at a time and
 * moves you on with a button in the section footer, so `open` is controlled.
 */
export function WizardSection({
  index,
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  index: number;
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className={`wizard-section ${open ? 'open' : ''}`}>
      <button type="button" className="section-head" onClick={onToggle} aria-expanded={open}>
        <span className="section-title">
          <strong>
            {index}. {title}
          </strong>
          {subtitle && <span className="section-sub">{subtitle}</span>}
        </span>
        <span className="section-chevron" aria-hidden>
          {open ? '⌃' : '⌄'}
        </span>
      </button>
      {open && <div className="section-body">{children}</div>}
    </section>
  );
}

/** Inline notice. `warning` is the amber band the console uses for resets. */
export function Callout({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'warning' | 'danger';
  children: ReactNode;
}) {
  return (
    <div className={`callout ${tone}`}>
      <span className="callout-icon" aria-hidden>
        {tone === 'info' ? 'ℹ' : '⚠'}
      </span>
      <div>{children}</div>
    </div>
  );
}

/** A selectable card in a radio group. Locked cards show why they are locked. */
export function RadioCard({
  title,
  description,
  selected,
  disabled,
  locked,
  onSelect,
}: {
  title: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
  locked?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`radio-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className="radio-card-head">
        <strong>{title}</strong>
        <span className="radio-dot" aria-hidden />
      </span>
      <span className="radio-card-desc">
        {locked && <span className="lock" aria-hidden>🔒 </span>}
        {description}
      </span>
    </button>
  );
}

/** Text/number input carrying its label in the border, console-style. */
export function Field({
  label,
  required,
  hint,
  error,
  ...input
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label className="field-label">
        <span className="field-legend">
          {label}
          {required && '*'}
        </span>
        <input {...input} />
      </label>
      {error ? <p className="field-error">{error}</p> : hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

/** Select with the same chrome as `Field`. */
export function SelectField({
  label,
  required,
  hint,
  children,
  ...select
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="field">
      <label className="field-label">
        <span className="field-legend">
          {label}
          {required && '*'}
        </span>
        <select {...select}>{children}</select>
      </label>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

/** Step navigation: a text button back, a filled button on. */
export function WizardFooter({
  onBack,
  backLabel = 'Previous step',
  onNext,
  nextLabel,
  nextDisabled,
  children,
}: {
  onBack?: () => void;
  backLabel?: string;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="wizard-footer">
      {children}
      {onBack && (
        <button type="button" className="btn ghost step-back" onClick={onBack}>
          {backLabel}
        </button>
      )}
      <button type="button" className="btn primary" onClick={onNext} disabled={nextDisabled}>
        {nextLabel}
      </button>
    </div>
  );
}

/** Read-only key/value rows for the Summary step. */
export function SummaryRows({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <dl className="summary-rows">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
