import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  api,
  type Campaign,
  type ChatTurn,
  type Simulation,
  type StudioContext,
  type ToolActivity,
} from './api/client';
import { ImpactPanel } from './components/ImpactPanel';
import { CampaignList } from './components/CampaignList';
import { ActivityTrail } from './components/ActivityTrail';

interface Bubble extends ChatTurn {
  activity?: ToolActivity[];
}

const SUGGESTIONS = [
  'Double points on coffee for Gold members this month',
  'What would 500 bonus points on orders over $50 cost me?',
  'Show me the campaigns running right now',
];

/** Strip the offline planner's draft payload out of what the user sees. */
function visibleText(content: string): string {
  return content.replace(/__DRAFT__.*?__END__/s, '').trim();
}

export function App() {
  const [context, setContext] = useState<StudioContext | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [draftName, setDraftName] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .context()
      .then((c) => {
        setContext(c);
        setCampaigns(c.campaigns);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [bubbles, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const history: ChatTurn[] = [
      ...bubbles.map((b) => ({ role: b.role, content: b.content })),
      { role: 'user' as const, content: trimmed },
    ];
    setBubbles((cur) => [...cur, { role: 'user', content: trimmed }]);
    setInput('');
    setBusy(true);
    setError(null);

    try {
      const res = await api.chat(history);
      setBubbles((cur) => [
        ...cur,
        { role: 'assistant', content: res.reply, activity: res.activity },
      ]);
      if (res.simulation) {
        setSimulation(res.simulation.result);
        setDraftName(res.simulation.draft.name);
      }
      if (res.createdCampaignId) {
        setSimulation(null);
        setDraftName(null);
      }
      // Refresh the campaign list — the agent may have changed it.
      api.campaigns().then((c) => setCampaigns(c.campaigns)).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <div className="studio">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">◈</span>
          <div>
            <strong>Campaign Studio</strong>
            <p className="muted xs">
              {context ? `store: ${context.storeCode}` : 'connecting…'}
            </p>
          </div>
        </div>
        {context && (
          <span className={`mode-pill ${context.mode}`}>
            {context.mode === 'claude' ? `${context.model}` : 'offline planner'}
          </span>
        )}
      </header>

      {context?.mode === 'offline' && (
        <div className="banner">
          Running the <strong>deterministic offline planner</strong> — it handles simple
          phrasings like “double points on coffee”. Set <code>ANTHROPIC_API_KEY</code> on the
          backend for the full conversational agent.
        </div>
      )}

      <div className="layout">
        <section className="chat-pane">
          <div className="messages" ref={scrollRef}>
            {bubbles.length === 0 && (
              <div className="empty">
                <h2>Describe a campaign</h2>
                <p className="muted sm">
                  Say what you want in plain language. Every campaign is simulated against
                  real transaction history before anything goes live.
                </p>
                <div className="suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="suggestion" onClick={() => void send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {bubbles.map((b, i) => (
              <div key={i} className={`bubble ${b.role}`}>
                {b.activity && b.activity.length > 0 && <ActivityTrail activity={b.activity} />}
                <div className="bubble-text">{visibleText(b.content)}</div>
              </div>
            ))}

            {busy && (
              <div className="bubble assistant">
                <div className="thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            {error && <div className="error">{error}</div>}
          </div>

          <form className="composer" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. triple points on food for Silver and Gold members"
              disabled={busy}
            />
            <button className="btn primary" disabled={busy || !input.trim()}>
              Send
            </button>
          </form>
        </section>

        <aside className="side-pane">
          <ImpactPanel simulation={simulation} draftName={draftName} />
          <CampaignList campaigns={campaigns} tiers={context?.tiers ?? []} />
          {context && context.categories.length > 0 && (
            <section className="card">
              <h3>Categories in history</h3>
              <div className="chips">
                {context.categories.map((c) => (
                  <span key={c.category} className="chip">
                    {c.category}
                    <span className="muted xs"> ${c.grossValue.toFixed(0)}</span>
                  </span>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
