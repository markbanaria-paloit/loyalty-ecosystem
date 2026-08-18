/**
 * Tier set builder — three steps: information, conditions (and the threshold
 * each tier needs for them), and a summary.
 *
 * The shape of the thing being edited is what drives the split: conditions are
 * declared once for the whole set, and every tier supplies a value for each
 * one. So changing the condition list invalidates every threshold, which is
 * why step 2 warns before it resets them.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  api,
  CONDITION_ATTRIBUTES,
  CONDITION_HINTS,
  CONDITION_LABELS,
  type TierConditionAttribute,
  type TierSet,
} from '../api/client';
import {
  Callout,
  Field,
  SelectField,
  Stepper,
  SummaryRows,
  WizardFooter,
  WizardSection,
  WizardShell,
  type StepDefinition,
} from '../components/wizard';

const STEPS: StepDefinition[] = [
  { title: 'Tier set information', subtitle: 'Define tier set name, description and status' },
  { title: 'Define conditions', subtitle: 'Choose metrics to determine tier qualification' },
  { title: 'Summary', subtitle: 'Review the configuration' },
];

/** The console caps a set at eight conditions. */
const MAX_CONDITIONS = 8;

/**
 * A condition in the editor. `serverId` is set only once the condition exists
 * on the server — sending it back is what preserves the thresholds already
 * recorded against it.
 */
interface DraftCondition {
  key: string;
  serverId?: string;
  attribute: TierConditionAttribute;
}

interface DraftTier {
  key: string;
  levelId?: string;
  name: string;
  /** Threshold per condition `key`. */
  values: Record<string, number>;
}

let localKeySeed = 0;
const nextKey = () => `draft-${(localKeySeed += 1)}`;

function emptyTier(name: string, conditions: DraftCondition[]): DraftTier {
  return {
    key: nextKey(),
    name,
    values: Object.fromEntries(conditions.map((c) => [c.key, 0])),
  };
}

export function TierSetWizard() {
  const { tierSetId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(tierSetId);

  const [step, setStep] = useState(params.get('step') === 'conditions' ? 1 : 0);
  const [open, setOpen] = useState<string | null>('conditions');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [conditions, setConditions] = useState<DraftCondition[]>([
    { key: nextKey(), attribute: 'totalEarnedUnits' },
  ]);
  const [tiers, setTiers] = useState<DraftTier[]>([]);

  /** Conditions as they were loaded, so we can tell whether they changed. */
  const [originalAttributes, setOriginalAttributes] = useState<string[]>([]);

  useEffect(() => {
    if (!tierSetId) {
      // A new set starts with the two tiers the programme's entry ladder needs;
      // the effect below fills in a value for each condition.
      setTiers((cur) => (cur.length > 0 ? cur : [emptyTier('Tier 1', []), emptyTier('Tier 2', [])]));
      return;
    }
    api
      .tierSet(tierSetId)
      .then((set: TierSet) => {
        const drafted: DraftCondition[] = set.conditions.map((c) => ({
          key: c.id,
          serverId: c.id,
          attribute: c.attribute,
        }));
        setName(set.name);
        setDescription(set.description);
        setActive(set.active);
        setConditions(drafted.length > 0 ? drafted : [{ key: nextKey(), attribute: 'totalEarnedUnits' }]);
        setOriginalAttributes(set.conditions.map((c) => c.attribute));
        setTiers(
          set.tiers.map((t) => ({
            key: t.levelId,
            levelId: t.levelId,
            name: t.name,
            values: Object.fromEntries(
              drafted.map((c) => [
                c.key,
                t.conditions.find((tc) => tc.conditionId === c.serverId)?.value ?? 0,
              ]),
            ),
          })),
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tierSetId]);

  // Keep every tier carrying exactly one value per condition. A condition that
  // has just been swapped starts at 0 — the reset the warning promises.
  useEffect(() => {
    setTiers((cur) =>
      cur.map((t) => ({
        ...t,
        values: Object.fromEntries(conditions.map((c) => [c.key, t.values[c.key] ?? 0])),
      })),
    );
  }, [conditions]);

  const conditionsChanged = useMemo(() => {
    if (!isEdit) return false;
    const now = conditions.map((c) => c.attribute);
    return now.length !== originalAttributes.length
      || now.some((a, i) => a !== originalAttributes[i]);
  }, [conditions, originalAttributes, isEdit]);

  const usedAttributes = new Set(conditions.map((c) => c.attribute));
  const available = CONDITION_ATTRIBUTES.filter((a) => !usedAttributes.has(a));

  function addCondition() {
    const next = available[0];
    if (!next || conditions.length >= MAX_CONDITIONS) return;
    setConditions((cur) => [...cur, { key: nextKey(), attribute: next }]);
  }

  function setConditionAttribute(key: string, attribute: TierConditionAttribute) {
    setConditions((cur) =>
      cur.map((c) =>
        c.key === key
          // Swapping the metric makes this a different condition, so it loses
          // its server identity — and with it the thresholds recorded for it.
          ? { key: nextKey(), attribute }
          : c,
      ),
    );
  }

  function removeCondition(key: string) {
    if (conditions.length <= 1) return;
    setConditions((cur) => cur.filter((c) => c.key !== key));
  }

  function setTierValue(tierKey: string, conditionKey: string, raw: string) {
    const value = raw === '' ? 0 : Number(raw);
    if (!Number.isFinite(value)) return;
    setTiers((cur) =>
      cur.map((t) =>
        t.key === tierKey ? { ...t, values: { ...t.values, [conditionKey]: value } } : t,
      ),
    );
  }

  /** Thresholds must not fall as you climb the ladder — the server rejects it. */
  const ladderError = useMemo(() => {
    for (let i = 1; i < tiers.length; i++) {
      for (const c of conditions) {
        const below = tiers[i - 1]!.values[c.key] ?? 0;
        const here = tiers[i]!.values[c.key] ?? 0;
        if (here < below) {
          return `${tiers[i]!.name || `Tier ${i + 1}`} has a lower ${CONDITION_LABELS[
            c.attribute
          ].toLowerCase()} (${here}) than the tier below it (${below}).`;
        }
      }
    }
    if (tiers.some((t) => !t.name.trim())) return 'Every tier needs a name.';
    if (tiers.length < 2) return 'A tier set needs at least two tiers.';
    return null;
  }, [tiers, conditions]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        description,
        active,
        conditions: conditions.map((c) => ({
          ...(c.serverId ? { id: c.serverId } : {}),
          attribute: c.attribute,
        })),
      };

      const set = tierSetId
        ? await api.updateTierSet(tierSetId, payload)
        : await api.createTierSet(payload);

      // The server echoes conditions in the order they were sent, so position
      // is what links a saved condition back to the draft it came from.
      const idByKey = new Map(conditions.map((c, i) => [c.key, set.conditions[i]!.id]));

      const result = await api.saveTierSetTiers(
        set.tierSetId,
        tiers.map((t) => ({
          ...(t.levelId ? { levelId: t.levelId } : {}),
          name: t.name.trim(),
          conditions: conditions.map((c) => ({
            conditionId: idByKey.get(c.key)!,
            value: t.values[c.key] ?? 0,
          })),
        })),
      );

      navigate(`/tiers?recalculated=${result.membersRecalculated}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the tier set');
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Loading tier set…</p>;

  return (
    <div className="wizard">
      <div className="page-head">
        <div>
          <h1>{isEdit ? 'Edit tier set' : 'Create tier set'}</h1>
          <p className="muted sm">
            Tiers move members automatically as they meet the set’s conditions.
          </p>
        </div>
        <button className="btn" onClick={() => navigate('/tiers')}>
          Cancel
        </button>
      </div>

      <Stepper steps={STEPS} current={step} onJump={setStep} />
      {error && <div className="error">{error}</div>}

      {step === 0 && (
        <WizardShell
          aside={
            <div className="help-card">
              <h3>Tier set information</h3>
              <p>
                A tier set groups the membership levels a member can move between and the
                metrics they are measured on. This store uses a single set.
              </p>
              <p>
                An <strong>inactive</strong> set stops moving members between tiers; everyone
                keeps the tier they are on.
              </p>
            </div>
          }
        >
          <WizardSection
            index={1}
            title="Name and description"
            subtitle="How the tier set is identified in the console."
            open
            onToggle={() => {}}
          >
            <div className="field-row">
              <Field
                label="Tier set name (en)"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Membership Levels"
              />
              <Field
                label="Tier set description (en)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </WizardSection>

          <WizardSection
            index={2}
            title="Status"
            subtitle="Whether the set qualifies members right now."
            open
            onToggle={() => {}}
          >
            <div className="radio-grid">
              <button
                type="button"
                className={`radio-card ${active ? 'selected' : ''}`}
                onClick={() => setActive(true)}
              >
                <span className="radio-card-head">
                  <strong>Active</strong>
                  <span className="radio-dot" aria-hidden />
                </span>
                <span className="radio-card-desc">
                  Members are qualified and re-qualified against these conditions.
                </span>
              </button>
              <button
                type="button"
                className={`radio-card ${!active ? 'selected' : ''}`}
                onClick={() => setActive(false)}
              >
                <span className="radio-card-head">
                  <strong>Inactive</strong>
                  <span className="radio-dot" aria-hidden />
                </span>
                <span className="radio-card-desc">
                  The set is saved but no member is moved between tiers.
                </span>
              </button>
            </div>
          </WizardSection>

          <WizardFooter
            onNext={() => setStep(1)}
            nextLabel="Next step: Define conditions"
            nextDisabled={!name.trim()}
          />
        </WizardShell>
      )}

      {step === 1 && (
        <WizardShell
          aside={
            <>
              <div className="help-card">
                <h3>Tier set conditions</h3>
                <p>
                  Conditions determine how members move between tiers within a tier set. You
                  can select up to <strong>{MAX_CONDITIONS} conditions per tier set</strong> —
                  such as Active units, Total spending, or Months since joining — and combine
                  them as needed.
                </p>
                <p>
                  Threshold values for each condition and tier are defined during the tier
                  creation step.
                </p>
                <Callout tone="warning">
                  <strong>Important!</strong> All selected conditions will apply to every tier
                  in this tier set — a member must meet all of them to qualify.
                </Callout>
              </div>

              <div className="help-card">
                <h3>Example</h3>
                <div className="tier-preview">
                  <div className="tier-preview-head">
                    <span className="tier-preview-badge" aria-hidden>♛</span>
                    <div>
                      <strong>{name || 'Tier set'}</strong>
                      <p className="muted xs">{tiers.length} tiers</p>
                    </div>
                  </div>
                  {tiers.map((t, i) => (
                    <div className="tier-preview-row" key={t.key}>
                      <span className="tier-preview-badge" aria-hidden>
                        ♟
                      </span>
                      <div>
                        <strong>{t.name || `Tier ${i + 1}`}</strong>
                        <div className="tier-preview-conditions">
                          {conditions.map((c) => (
                            <span key={c.key}>
                              {CONDITION_LABELS[c.attribute]}: {t.values[c.key] ?? 0}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          }
        >
          {conditionsChanged && (
            <Callout tone="warning">
              You’ve changed the conditions. Any condition you swapped or added starts at a
              threshold of 0 on every tier — set new values for it below before saving.
              Conditions you left alone keep the thresholds they already had.
            </Callout>
          )}

          <WizardSection
            index={1}
            title="Conditions"
            subtitle="Select the metrics that determine tier qualification. These criteria apply to all tiers within the tier set."
            open={open !== 'values'}
            onToggle={() => setOpen(open === 'values' ? 'conditions' : 'values')}
          >
            {conditions.map((c) => (
              <div className="field-row" key={c.key}>
                <SelectField
                  label="Condition"
                  required
                  value={c.attribute}
                  hint={CONDITION_HINTS[c.attribute]}
                  onChange={(e) =>
                    setConditionAttribute(c.key, e.target.value as TierConditionAttribute)
                  }
                >
                  {CONDITION_ATTRIBUTES.filter(
                    (a) => a === c.attribute || !usedAttributes.has(a),
                  ).map((a) => (
                    <option key={a} value={a}>
                      {CONDITION_LABELS[a]}
                    </option>
                  ))}
                </SelectField>
                <button
                  type="button"
                  className="btn ghost"
                  aria-label={`Remove ${CONDITION_LABELS[c.attribute]}`}
                  disabled={conditions.length <= 1}
                  onClick={() => removeCondition(c.key)}
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="wizard-footer">
              <button
                type="button"
                className="btn"
                onClick={addCondition}
                disabled={available.length === 0 || conditions.length >= MAX_CONDITIONS}
              >
                + Add conditions
              </button>
            </div>
          </WizardSection>

          <WizardSection
            index={2}
            title="Tiers conditions value"
            subtitle="Define specific threshold values for each tier."
            open={open === 'values'}
            onToggle={() => setOpen(open === 'values' ? 'conditions' : 'values')}
          >
            <Callout tone="info">
              In the case of editing any of the conditions, the progress of each member will
              be recalculated individually for the new events and activities.
            </Callout>

            <div className="tier-values">
              {tiers.map((t, i) => (
                <div className="tier-value-block" key={t.key}>
                  <div className="tier-value-head">
                    <h4>
                      Tier {i + 1}
                      {i === 0 && <span className="tier-rank"> — entry tier</span>}
                      {i === tiers.length - 1 && i > 0 && (
                        <span className="tier-rank"> — high value</span>
                      )}
                    </h4>
                    <button
                      type="button"
                      className="btn ghost sm"
                      disabled={tiers.length <= 2}
                      onClick={() => setTiers((cur) => cur.filter((x) => x.key !== t.key))}
                    >
                      Remove
                    </button>
                  </div>
                  <Field
                    label="Tier name"
                    required
                    value={t.name}
                    onChange={(e) =>
                      setTiers((cur) =>
                        cur.map((x) => (x.key === t.key ? { ...x, name: e.target.value } : x)),
                      )
                    }
                  />
                  <div className="field-row">
                    {conditions.map((c) => (
                      <Field
                        key={c.key}
                        label={CONDITION_LABELS[c.attribute]}
                        required
                        type="number"
                        min={0}
                        value={String(t.values[c.key] ?? 0)}
                        onChange={(e) => setTierValue(t.key, c.key, e.target.value)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="wizard-footer">
              <button
                type="button"
                className="btn"
                onClick={() =>
                  setTiers((cur) => [...cur, emptyTier(`Tier ${cur.length + 1}`, conditions)])
                }
              >
                + Add tier
              </button>
            </div>
          </WizardSection>

          {ladderError && <Callout tone="danger">{ladderError}</Callout>}

          <WizardFooter
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextLabel="Next step: Summary"
            nextDisabled={Boolean(ladderError)}
          />
        </WizardShell>
      )}

      {step === 2 && (
        <WizardShell
          aside={
            <div className="help-card">
              <h3>Before you save</h3>
              <p>
                Saving re-qualifies every member against these conditions. A member who
                already meets a higher tier’s thresholds moves up immediately.
              </p>
              <p>
                Members are never left on a tier that no longer exists — removing a tier moves
                everyone on it to the highest tier they still qualify for.
              </p>
            </div>
          }
        >
          <WizardSection index={1} title="Tier set" open onToggle={() => {}}>
            <SummaryRows
              rows={[
                ['Name', name],
                ['Description', description || '—'],
                ['Status', active ? 'Active' : 'Inactive'],
                [
                  'Conditions',
                  conditions.map((c) => CONDITION_LABELS[c.attribute]).join(', '),
                ],
              ]}
            />
          </WizardSection>

          <WizardSection index={2} title="Tiers" open onToggle={() => {}}>
            <div className="table-card card">
              <table>
                <thead>
                  <tr>
                    <th>Tier</th>
                    {conditions.map((c) => (
                      <th key={c.key} className="num">
                        {CONDITION_LABELS[c.attribute]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((t, i) => (
                    <tr key={t.key}>
                      <td>
                        <strong>{t.name}</strong>
                        {i === 0 && <span className="tier-rank"> · entry</span>}
                      </td>
                      {conditions.map((c) => (
                        <td key={c.key} className="num">
                          {t.values[c.key] ?? 0}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </WizardSection>

          <WizardFooter
            onBack={() => setStep(1)}
            onNext={save}
            nextLabel={saving ? 'Saving…' : isEdit ? 'Save tier set' : 'Create tier set'}
            nextDisabled={saving || Boolean(ladderError) || !name.trim()}
          >
            <span className="footer-note">
              Every member will be recalculated against the new configuration.
            </span>
          </WizardFooter>
        </WizardShell>
      )}
    </div>
  );
}
