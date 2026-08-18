/**
 * Live notification that a member's loyalty record changed.
 *
 * Points are awarded by the loyalty platform when a till publishes a sale, so
 * the app has no way of knowing it happened. This opens a channel that tells
 * it — and nothing more: the event carries a member id and a kind, never a
 * balance or a name. On receipt the app re-reads its own record through its own
 * token, which is what keeps one member's data out of another's browser.
 *
 * Optional by design. Without Supabase configured the app falls back to asking
 * on an interval, which is slower but correct.
 */
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const realtimeConfigured = Boolean(url && key);

let client = null;
function getClient() {
  if (!realtimeConfigured) return null;
  // Created lazily and once: a second client means a second socket.
  if (!client) client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

/**
 * Call `onChange` whenever the platform records a change for this member.
 * Returns an unsubscribe function, or null when realtime is not configured.
 */
export function subscribeToMemberEvents(memberId, onChange) {
  const supabase = getClient();
  if (!supabase || !memberId) return null;

  const channel = supabase
    .channel(`member:${memberId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'loyalty_events',
        // Filtered server-side: this browser is never sent other members' events.
        filter: `member_id=eq.${memberId}`,
      },
      (payload) => onChange(payload?.new?.kind ?? 'points_changed'),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
