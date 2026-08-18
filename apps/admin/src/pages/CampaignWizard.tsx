/**
 * Campaign builder — five steps: trigger, info, rules & effects, limitation &
 * budget, summary.
 *
 * The trigger is chosen first and everything after it adapts, because it
 * decides what a rule can even mean: a purchase campaign filters transaction
 * lines, an enrolment campaign has no transaction to filter. It is also
 * immutable once saved, which is why editing starts on step 2.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  api,
  type Campaign,
  type CampaignDraft,
  type CampaignTimeStrategy,
  type CampaignTrigger,
  type Simulation,
  type Tier,
} from '../api/client';
import {
  Callout,
  Field,
  RadioCard,
  SelectField,
  Stepper,
  SummaryRows,
  WizardFooter,
  WizardSection,
  WizardShell,
  type StepDefinition,
} from '../components/wizard';

const STEPS: StepDefinition[] = [
  { title: 'Campaign trigger', subtitle: 'Select event that starts campaign' },
  { title: 'Campaign info', subtitle: 'Basic settings' },
  { title: 'Rules & Effects', subtitle: 'Define the rules & effects' },
  { title: 'Limitation & Budget', subtitle: 'Define the limitation' },
  { title: 'Summary', subtitle: 'Review the configuration' },
];

const TRIGGERS: Array<{
  value: CampaignTrigger;
  title: string;
  description: string;
}> = [
  {
    value: 'transaction',
    title: 'Purchase transaction',
    description: 'Runs whenever a purchase is registered against a member.',
  },
  {
    value: 'internal_event',
    title: 'Member enrolment',
    description: 'Runs once when a member joins the programme — welcome points.',
  },
  {
    value: 'time',
    title: 'Time-based automation',
    description: 'Runs on a schedule: birthdays, anniversaries or a fixed cadence.',
  },
];

const TIME_STRATEGIES: Array<{
  value: CampaignTimeStrategy;
  title: string;
  description: string;
}> = [
  { value: 'daily', title: 'Daily', description: 'Automation campaign triggered once every day' },
  {
    value: 'weekly',
    title: 'Weekly',
    description: 'Automation campaign triggered every week on selected days',
  },
  {
    value: 'monthly',
    title: 'Monthly',
    description: 'Automation campaign triggered every month on selected days',
  },
  {
    value: 'birthday',
    title: 'Member’s birthday',
    description: 'Automation campaign triggered on a member’s birthday',
  },
  {
    value: 'registration_anniversary',
    title: 'Membership anniversary',
    description: 'Automation campaign triggered annually on the member’s registration date',
  },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** `<input type="datetime-local">` wants `YYYY-MM-DDTHH:mm`, ISO wants a Z. */
function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 16);
}
function fromLocalInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

export function CampaignWizard() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(campaignId);

  // Editing starts past the trigger step — the trigger cannot be changed.
  const [step, setStep] = useState(isEdit ? 1 : 0);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [simulating, setSimulating] = useState(false);

  const [trigger, setTrigger] = useState<CampaignTrigger>('transaction');
  const [timeStrategy, setTimeStrategy] = useState<CampaignTimeStrategy>('birthday');
  const [dayOfWeek, setDayOfWeek] = useState<number[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState<string>('1');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [visibilityTiers, setVisibilityTiers] = useState<string[]>([]);
  const [effectType, setEffectType] = useState<'multiplier' | 'bonus_points'>('bonus_points');
  const [effectValue, setEffectValue] = useState('500');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [minTransactionValue, setMinTransactionValue] = useState('0');
  const [audienceTiers, setAudienceTiers] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [pointsPerMember, setPointsPerMember] = useState('');
  const [executionsPerMember, setExecutionsPerMember] = useState('1');
  const [openSection, setOpenSection] = useState(1);

  useEffect(() => {
    api.tiers().then((res) => setTiers(res.items)).catch(() => {});
    // Categories are not exposed as their own endpoint; the campaigns already
    // configured are the honest source for what a store actually sells.
    api
      .campaigns()
      .then((res) =>
        setCategories([...new Set(res.items.flatMap((c) => c.condition.categories))].sort()),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!campaignId) return;
    api
      .campaign(campaignId)
      .then((c: Campaign) => {
        setTrigger(c.trigger);
        if (c.triggerStrategy) {
          setTimeStrategy(c.triggerStrategy.type);
          setDayOfWeek(c.triggerStrategy.executionSchedule?.dayOfWeek ?? []);
          setDayOfMonth(String(c.triggerStrategy.executionSchedule?.dayOfMonth?.[0] ?? '1'));
        }
        setName(c.name);
        setDescription(c.description);
        setDisplayOrder(String(c.displayOrder));
        setStartsAt(toLocalInput(c.activity.startsAt));
        setEndsAt(toLocalInput(c.activity.endsAt));
        setVisibilityTiers(c.visibility.tiers);
        setEffectType(c.effect.type);
        setEffectValue(String(c.effect.value));
        setCategoryFilter(c.condition.categories);
        setMinTransactionValue(String(c.condition.minTransactionValue));
        setAudienceTiers(c.condition.tierIds);
        setBudget(c.limits.points ? String(c.limits.points.value) : '');
        setPointsPerMember(
          c.limits.pointsPerMember ? String(c.limits.pointsPerMember.value) : '',
        );
        setExecutionsPerMember(
          c.limits.executionsPerMember ? String(c.limits.executionsPerMember.value) : '',
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [campaignId]);

  // Only purchase campaigns can scale a transaction; the others award a flat
  // amount, so the effect is forced when the trigger changes.
  useEffect(() => {
    if (trigger !== 'transaction') setEffectType('bonus_points');
  }, [trigger]);

  const isPurchase = trigger === 'transaction';

  const draft: CampaignDraft = useMemo(
    () => ({
      name: name.trim(),
      description,
      trigger,
      event: trigger === 'internal_event' ? 'CustomerRegistered' : null,
      triggerStrategy:
        trigger === 'time'
          ? {
              type: timeStrategy,
              executionSchedule: {
                dayOfWeek: timeStrategy === 'weekly' ? dayOfWeek : [],
                dayOfMonth:
                  timeStrategy === 'monthly'
                    ? [dayOfMonth === 'L' ? 'L' : Number(dayOfMonth)]
                    : [],
              },
            }
          : null,
      displayOrder: Number(displayOrder) || 0,
      activity: { startsAt: fromLocalInput(startsAt), endsAt: fromLocalInput(endsAt) },
      condition: {
        categories: isPurchase ? categoryFilter : [],
        tierIds: isPurchase ? audienceTiers : [],
        minTransactionValue: isPurchase ? Number(minTransactionValue) || 0 : 0,
      },
      effect: { type: effectType, value: Number(effectValue) || 0 },
      limits: {
        points: budget === '' ? null : { value: Number(budget) },
        pointsPerMember: pointsPerMember === '' ? null : { value: Number(pointsPerMember) },
        executionsPerMember:
          executionsPerMember === '' ? null : { value: Number(executionsPerMember) },
      },
      visibility: {
        target: visibilityTiers.length > 0 ? 'tier' : 'none',
        tiers: visibilityTiers,
      },
    }),
    [
      name, description, trigger, timeStrategy, dayOfWeek, dayOfMonth, displayOrder,
      isPurchase, categoryFilter, audienceTiers, minTransactionValue, startsAt, endsAt,
      effectType, effectValue, budget, pointsPerMember, executionsPerMember, visibilityTiers,
    ],
  );

  const effectError = useMemo(() => {
    const value = Number(effectValue);
    if (!Number.isFinite(value) || value <= 0) return 'Enter a value above zero.';
    if (effectType === 'multiplier' && value < 1) return 'A multiplier below 1 would reduce earning.';
    return undefined;
  }, [effectValue, effectType]);

  const datesError =
    startsAt && endsAt && new Date(endsAt) < new Date(startsAt)
      ? 'The end date must be after the start date.'
      : undefined;

  function toggle(list: string[], value: string, set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function runSimulation() {
    setSimulating(true);
    setError(null);
    try {
      const res = await api.simulateCampaign(draft);
      setSimulation(res.simulation);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      if (campaignId) await api.updateCampaign(campaignId, draft);
      else await api.createCampaign(draft);
      navigate('/campaigns?saved=1');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the campaign');
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Loading campaign…</p>;

  const triggerLabel = TRIGGERS.find((t) => t.value === trigger)!.title;

  return (
    <div className="wizard">
      <div className="page-head">
        <div>
          <h1>{isEdit ? 'Edit campaign' : 'Create campaign'}</h1>
          <p className="muted sm">
            A trigger fires, its conditions are assessed, and matching members receive the
            effect.
          </p>
        </div>
        <button className="btn" onClick={() => navigate('/campaigns')}>
          Cancel
        </button>
      </div>

      <Stepper steps={STEPS} current={step} onJump={(i) => setStep(isEdit ? Math.max(1, i) : i)} />
      {error && <div className="error">{error}</div>}

      {step === 0 && (
        <WizardShell
          aside={
            <div className="help-card">
              <h3>Campaign overview</h3>
              <p>
                Campaigns are structured around a sequence of triggers, conditions, and
                effects. Upon the occurrence of a trigger, its attributes are assessed against
                predefined conditions. If these conditions are fulfilled, an effect is applied.
              </p>
              <p>
                The trigger decides what the rest of the campaign can express — and it cannot
                be changed once the campaign exists.
              </p>
            </div>
          }
        >
          <WizardSection
            index={1}
            title="Select campaign trigger"
            subtitle="What starts this campaign."
            open
            onToggle={() => {}}
          >
            <div className="radio-grid" role="radiogroup" aria-label="Campaign trigger">
              {TRIGGERS.map((t) => (
                <RadioCard
                  key={t.value}
                  title={t.title}
                  description={t.description}
                  selected={trigger === t.value}
                  onSelect={() => setTrigger(t.value)}
                />
              ))}
            </div>
          </WizardSection>

          {trigger === 'time' && (
            <WizardSection
              index={2}
              title="Select automation campaign trigger"
              subtitle="How often the automation runs."
              open
              onToggle={() => {}}
            >
              <div className="radio-grid" role="radiogroup" aria-label="Automation schedule">
                {TIME_STRATEGIES.map((s) => (
                  <RadioCard
                    key={s.value}
                    title={s.title}
                    description={s.description}
                    selected={timeStrategy === s.value}
                    onSelect={() => setTimeStrategy(s.value)}
                  />
                ))}
              </div>

              {timeStrategy === 'weekly' && (
                <div className="field-row">
                  {WEEKDAYS.map((label, i) => (
                    <label className="check" key={label}>
                      <input
                        type="checkbox"
                        checked={dayOfWeek.includes(i)}
                        onChange={() =>
                          setDayOfWeek(
                            dayOfWeek.includes(i)
                              ? dayOfWeek.filter((d) => d !== i)
                              : [...dayOfWeek, i],
                          )
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              )}

              {timeStrategy === 'monthly' && (
                <SelectField
                  label="Day of month"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                >
                  {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                  <option value="L">Last day of the month</option>
                </SelectField>
              )}

              <Callout tone="warning">
                Scheduled automations are stored and shown here, but this environment runs no
                scheduler — they will not fire on their own.
              </Callout>
            </WizardSection>
          )}

          <WizardFooter onNext={() => setStep(1)} nextLabel="Next step: Campaign info" />
        </WizardShell>
      )}

      {step === 1 && (
        <WizardShell
          aside={
            <div className="help-card">
              <h3>Campaign overview</h3>
              <p>
                Campaigns are structured around a sequence of triggers, conditions, and
                effects. Upon the occurrence of a trigger, its attributes are assessed against
                predefined conditions. If these conditions are fulfilled, an effect is applied.
                This mechanism enables rewarding customers who satisfy the criteria outlined in
                a campaign.
              </p>
              {isEdit && (
                <Callout tone="warning">
                  You can’t change the trigger in an existing campaign.
                </Callout>
              )}
            </div>
          }
        >
          <p className="muted sm">
            Campaign info <span className="pill trigger">{triggerLabel}</span>
          </p>

          <WizardSection
            index={1}
            title="Title and description"
            open={openSection === 1}
            onToggle={() => setOpenSection(openSection === 1 ? 0 : 1)}
          >
            <div className="field-row">
              <Field
                label="Campaign name (en)"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Welcome bonus"
              />
              <Field
                label="Campaign description (en)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Field
              label="Campaign display order"
              type="number"
              value={displayOrder}
              hint="Lower numbers are evaluated and listed first."
              onChange={(e) => setDisplayOrder(e.target.value)}
            />
            <div className="wizard-footer">
              <button type="button" className="btn primary" onClick={() => setOpenSection(2)}>
                Next: Start &amp; end campaign date
              </button>
            </div>
          </WizardSection>

          <WizardSection
            index={2}
            title="Start & end campaign date"
            subtitle="Set campaign start and end dates."
            open={openSection === 2}
            onToggle={() => setOpenSection(openSection === 2 ? 0 : 2)}
          >
            <div className="field-row">
              <Field
                label="Start date"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
              <Field
                label="End date"
                type="datetime-local"
                value={endsAt}
                error={datesError}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
            <p className="field-hint">
              Leave both empty to run the campaign open-endedly from the moment it is created.
            </p>
          </WizardSection>

          <WizardSection
            index={3}
            title="Campaign visibility"
            subtitle="Which members see and receive this campaign. Leave empty to target everyone."
            open={openSection === 3}
            onToggle={() => setOpenSection(openSection === 3 ? 0 : 3)}
          >
            <fieldset className="tier-picker">
              <legend>Visible to tiers</legend>
              {tiers.map((t) => (
                <label className="check" key={t.levelId}>
                  <input
                    type="checkbox"
                    checked={visibilityTiers.includes(t.levelId)}
                    onChange={() => toggle(visibilityTiers, t.levelId, setVisibilityTiers)}
                  />
                  {t.name}
                </label>
              ))}
            </fieldset>
            {trigger === 'internal_event' && visibilityTiers.length > 0 && (
              <Callout tone="warning">
                A new member is on the entry tier at the moment they enrol. Restricting a
                welcome campaign to a higher tier means it will never pay out.
              </Callout>
            )}
          </WizardSection>

          <WizardFooter
            onBack={isEdit ? undefined : () => setStep(0)}
            onNext={() => setStep(2)}
            nextLabel="Next step: Rules & Effects"
            nextDisabled={!name.trim() || Boolean(datesError)}
          />
        </WizardShell>
      )}

      {step === 2 && (
        <WizardShell
          aside={
            <div className="help-card">
              <h3>Rules &amp; effects</h3>
              <p>
                Conditions narrow down which triggers qualify; the effect is what the member
                receives when they do.
              </p>
              {isPurchase ? (
                <p>
                  A <strong>multiplier</strong> scales the points earned on matching lines. A{' '}
                  <strong>bonus</strong> pays a flat amount once per qualifying transaction.
                </p>
              ) : (
                <p>
                  There is no transaction to scale here, so the effect is a flat award of
                  points to the member.
                </p>
              )}
            </div>
          }
        >
          <WizardSection index={1} title="Effect" subtitle="What the member receives." open onToggle={() => {}}>
            <div className="radio-grid" role="radiogroup" aria-label="Effect">
              <RadioCard
                title="Give points"
                description="A flat award of points."
                selected={effectType === 'bonus_points'}
                onSelect={() => setEffectType('bonus_points')}
              />
              <RadioCard
                title="Points multiplier"
                description={
                  isPurchase
                    ? 'Scale the points earned on matching transaction lines.'
                    : 'Only available on purchase-triggered campaigns.'
                }
                locked={!isPurchase}
                disabled={!isPurchase}
                selected={effectType === 'multiplier'}
                onSelect={() => setEffectType('multiplier')}
              />
            </div>
            <Field
              label={effectType === 'multiplier' ? 'Multiplier' : 'Points'}
              required
              type="number"
              min={0}
              step={effectType === 'multiplier' ? 0.5 : 50}
              value={effectValue}
              error={effectError}
              hint={
                effectType === 'multiplier'
                  ? '2 means double points on the lines this campaign matches.'
                  : 'Awarded in full each time the campaign runs for a member.'
              }
              onChange={(e) => setEffectValue(e.target.value)}
            />
          </WizardSection>

          {isPurchase && (
            <WizardSection
              index={2}
              title="Conditions"
              subtitle="Narrow down which transactions qualify."
              open
              onToggle={() => {}}
            >
              {categories.length > 0 && (
                <fieldset className="tier-picker">
                  <legend>Product categories — leave empty for all</legend>
                  {categories.map((c) => (
                    <label className="check" key={c}>
                      <input
                        type="checkbox"
                        checked={categoryFilter.includes(c)}
                        onChange={() => toggle(categoryFilter, c, setCategoryFilter)}
                      />
                      {c}
                    </label>
                  ))}
                </fieldset>
              )}
              <fieldset className="tier-picker">
                <legend>Qualifying tiers — leave empty for all</legend>
                {tiers.map((t) => (
                  <label className="check" key={t.levelId}>
                    <input
                      type="checkbox"
                      checked={audienceTiers.includes(t.levelId)}
                      onChange={() => toggle(audienceTiers, t.levelId, setAudienceTiers)}
                    />
                    {t.name}
                  </label>
                ))}
              </fieldset>
              <Field
                label="Minimum transaction value"
                type="number"
                min={0}
                value={minTransactionValue}
                hint="0 means no floor."
                onChange={(e) => setMinTransactionValue(e.target.value)}
              />
            </WizardSection>
          )}

          <WizardFooter
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            nextLabel="Next step: Limitation & Budget"
            nextDisabled={Boolean(effectError)}
          />
        </WizardShell>
      )}

      {step === 3 && (
        <WizardShell
          aside={
            <div className="help-card">
              <h3>Limitation &amp; budget</h3>
              <p>
                Limits are checked before every payout and enforced by the loyalty engine. A
                campaign that has hit a limit stops awarding rather than failing.
              </p>
              <p>
                For a welcome campaign, leave <strong>executions per member</strong> at 1 so
                nobody is paid twice.
              </p>
              <p className="xs">
                Leave a field empty for no limit.
              </p>
            </div>
          }
        >
          <WizardSection
            index={1}
            title="Limits"
            subtitle="Ceilings on what this campaign can award."
            open
            onToggle={() => {}}
          >
            <Field
              label="Total campaign budget (points)"
              type="number"
              min={0}
              value={budget}
              hint="Across all members, for the campaign's whole life."
              onChange={(e) => setBudget(e.target.value)}
            />
            <div className="field-row">
              <Field
                label="Points per member"
                type="number"
                min={0}
                value={pointsPerMember}
                onChange={(e) => setPointsPerMember(e.target.value)}
              />
              <Field
                label="Executions per member"
                type="number"
                min={0}
                value={executionsPerMember}
                onChange={(e) => setExecutionsPerMember(e.target.value)}
              />
            </div>
            {trigger === 'internal_event' && executionsPerMember !== '1' && (
              <Callout tone="warning">
                Enrolment only happens once per member, so anything other than 1 execution per
                member has no practical effect.
              </Callout>
            )}
          </WizardSection>

          <WizardFooter
            onBack={() => setStep(2)}
            onNext={() => {
              setStep(4);
              void runSimulation();
            }}
            nextLabel="Next step: Summary"
          />
        </WizardShell>
      )}

      {step === 4 && (
        <WizardShell
          aside={
            <div className="help-card">
              <h3>Projected impact</h3>
              {simulating && <p>Simulating…</p>}
              {!simulating && simulation && (
                <>
                  <p>
                    {isPurchase
                      ? `Replayed ${simulation.transactionsEvaluated} historical transactions.`
                      : 'Projected across the members who would qualify today.'}
                  </p>
                  <div className="sim-grid">
                    <div className="sim-cell">
                      <span className="muted xs">Members affected</span>
                      <strong>{simulation.membersAffected}</strong>
                    </div>
                    <div className="sim-cell">
                      <span className="muted xs">Extra points</span>
                      <strong>{simulation.additionalPoints.toLocaleString()}</strong>
                    </div>
                    {isPurchase && (
                      <div className="sim-cell">
                        <span className="muted xs">Uplift</span>
                        <strong>{simulation.upliftPercent}%</strong>
                      </div>
                    )}
                  </div>
                  {simulation.upliftPercent > 50 && (
                    <Callout tone="warning">
                      This campaign lifts points issued by more than half. Worth a second look
                      at the budget before it goes live.
                    </Callout>
                  )}
                </>
              )}
              {!simulating && !simulation && <p>No projection available.</p>}
            </div>
          }
        >
          <WizardSection index={1} title="Campaign" open onToggle={() => {}}>
            <SummaryRows
              rows={[
                ['Name', name],
                ['Description', description || '—'],
                ['Trigger', triggerLabel],
                ...(trigger === 'time'
                  ? ([[
                      'Schedule',
                      TIME_STRATEGIES.find((s) => s.value === timeStrategy)!.title,
                    ]] as Array<[string, string]>)
                  : []),
                [
                  'Effect',
                  effectType === 'multiplier'
                    ? `${effectValue}× points on matching lines`
                    : `${effectValue} points`,
                ],
                [
                  'Runs',
                  startsAt || endsAt
                    ? `${startsAt ? new Date(startsAt).toLocaleString() : 'immediately'} → ${
                        endsAt ? new Date(endsAt).toLocaleString() : 'open-ended'
                      }`
                    : 'Open-ended',
                ],
                [
                  'Visible to',
                  visibilityTiers.length === 0
                    ? 'All members'
                    : tiers
                        .filter((t) => visibilityTiers.includes(t.levelId))
                        .map((t) => t.name)
                        .join(', '),
                ],
              ]}
            />
          </WizardSection>

          {isPurchase && (
            <WizardSection index={2} title="Conditions" open onToggle={() => {}}>
              <SummaryRows
                rows={[
                  ['Categories', categoryFilter.length ? categoryFilter.join(', ') : 'All'],
                  [
                    'Qualifying tiers',
                    audienceTiers.length
                      ? tiers
                          .filter((t) => audienceTiers.includes(t.levelId))
                          .map((t) => t.name)
                          .join(', ')
                      : 'All',
                  ],
                  ['Minimum transaction', minTransactionValue || '0'],
                ]}
              />
            </WizardSection>
          )}

          <WizardSection index={isPurchase ? 3 : 2} title="Limitation & budget" open onToggle={() => {}}>
            <SummaryRows
              rows={[
                ['Total budget', budget === '' ? 'No limit' : `${budget} points`],
                [
                  'Points per member',
                  pointsPerMember === '' ? 'No limit' : `${pointsPerMember} points`,
                ],
                [
                  'Executions per member',
                  executionsPerMember === '' ? 'No limit' : executionsPerMember,
                ],
              ]}
            />
          </WizardSection>

          <WizardFooter
            onBack={() => setStep(3)}
            onNext={save}
            nextLabel={saving ? 'Saving…' : isEdit ? 'Save campaign' : 'Create campaign'}
            nextDisabled={saving || !name.trim() || Boolean(effectError)}
          >
            <button type="button" className="btn footer-note" onClick={runSimulation} disabled={simulating}>
              {simulating ? 'Simulating…' : 'Re-run simulation'}
            </button>
          </WizardFooter>
        </WizardShell>
      )}
    </div>
  );
}
