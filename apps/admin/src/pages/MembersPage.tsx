import { useEffect, useMemo, useState } from 'react';
import { api, type Member } from '../api/client';

export function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Member | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api
      .members()
      .then((r) => {
        setMembers(r.items);
        // Keep the open drawer in sync after an adjustment.
        setSelected((cur) =>
          cur ? (r.items.find((m) => m.customerId === cur.customerId) ?? null) : null,
        );
      })
      .catch((e) => setError(e.message));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(q),
    );
  }, [members, query]);

  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Members</h1>
          <p className="muted sm">{members.length} total</p>
        </div>
        <input
          className="search"
          placeholder="Search name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      <div className="card table-card">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Tier</th>
              <th className="num">Balance</th>
              <th className="num">Earned</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.customerId}>
                <td>
                  <strong>
                    {m.firstName} {m.lastName}
                  </strong>
                  <p className="muted xs">{m.email}</p>
                </td>
                <td>
                  <span className="chip">{m.levelName ?? '—'}</span>
                </td>
                <td className="num strong">{m.activePoints.toLocaleString()}</td>
                <td className="num muted">{m.earnedPoints.toLocaleString()}</td>
                <td>
                  <span className={m.active ? 'dot ok' : 'dot off'} />
                  {m.active ? 'Active' : 'Inactive'}
                </td>
                <td className="num">
                  <button className="btn sm" onClick={() => setSelected(m)}>
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="muted center-cell">
                  No members match “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <MemberDrawer
          member={selected}
          onClose={() => setSelected(null)}
          onChanged={load}
        />
      )}
    </>
  );
}

function MemberDrawer({
  member,
  onClose,
  onChanged,
}: {
  member: Member;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [points, setPoints] = useState('100');
  const [comment, setComment] = useState('Manual adjustment');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function adjust(direction: 'add' | 'spend') {
    const value = Number(points);
    if (!Number.isFinite(value) || value <= 0) {
      setMsg('Enter a positive number of points.');
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      if (direction === 'add') {
        await api.addPoints(member.customerId, value, comment);
      } else {
        await api.spendPoints(member.customerId, value, comment);
      }
      setMsg(`${direction === 'add' ? 'Added' : 'Deducted'} ${value} points.`);
      onChanged();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Adjustment failed');
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive() {
    setBusy(true);
    setMsg(null);
    try {
      await api.setMemberActive(member.customerId, !member.active);
      onChanged();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not update status');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <header className="drawer-head">
          <div>
            <h2>
              {member.firstName} {member.lastName}
            </h2>
            <p className="muted xs">{member.email}</p>
          </div>
          <button className="btn ghost" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="drawer-stats">
          <div>
            <p className="muted xs">Balance</p>
            <strong>{member.activePoints.toLocaleString()}</strong>
          </div>
          <div>
            <p className="muted xs">Earned</p>
            <strong>{member.earnedPoints.toLocaleString()}</strong>
          </div>
          <div>
            <p className="muted xs">Spent</p>
            <strong>{member.spentPoints.toLocaleString()}</strong>
          </div>
          <div>
            <p className="muted xs">Tier</p>
            <strong>{member.levelName ?? '—'}</strong>
          </div>
        </div>

        <section className="drawer-section">
          <h3>Adjust points</h3>
          <label>
            Points
            <input value={points} onChange={(e) => setPoints(e.target.value)} />
          </label>
          <label>
            Comment
            <input value={comment} onChange={(e) => setComment(e.target.value)} />
          </label>
          <div className="row">
            <button
              className="btn primary"
              disabled={busy}
              onClick={() => adjust('add')}
            >
              Add points
            </button>
            <button className="btn" disabled={busy} onClick={() => adjust('spend')}>
              Deduct points
            </button>
          </div>
        </section>

        <section className="drawer-section">
          <h3>Account</h3>
          <button className="btn" disabled={busy} onClick={toggleActive}>
            {member.active ? 'Deactivate member' : 'Activate member'}
          </button>
        </section>

        {msg && <div className="toast">{msg}</div>}
        <p className="muted xs mono">{member.customerId}</p>
      </aside>
    </div>
  );
}
