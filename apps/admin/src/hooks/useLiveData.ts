import { useEffect } from 'react';

/**
 * Re-run a fetch when the operator comes back to this tab.
 *
 * The console reads data other surfaces write — a member enrols in the member
 * app, a till publishes a sale — and a page that loaded once on mount shows a
 * stale answer with nothing to say it is stale. Returning to the tab is exactly
 * when someone expects to see the result of what they just did.
 *
 * Deliberately not a poll: this is a console, not a live dashboard, and a timer
 * would issue requests all day for a tab nobody is looking at.
 */
export function useRefreshOnFocus(load: () => void): void {
  useEffect(() => {
    function refresh() {
      if (document.visibilityState === 'visible') load();
    }
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [load]);
}
