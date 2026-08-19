export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function fmtDate(date) {
  return new Date(date).toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtMoney(n) {
  return `$${Number(n).toFixed(2)}`;
}

export function daysUntil(date) {
  const ms = new Date(date).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function roundPoints(n, rounding) {
  return rounding === 'floor' ? Math.floor(n) : Math.round(n);
}

export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

export function monthKey(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

/**
 * A tier condition in the unit that condition is measured in.
 *
 * Tiers can be qualified on points, on spend or on tenure, and the same number
 * means something different in each — so the attribute the platform reports
 * decides the label rather than the screen assuming "points".
 */
export function formatTierMetric(attribute, value) {
  const n = Math.round(value ?? 0);
  switch (attribute) {
    case 'totalSpending':
      return `$${n.toLocaleString()}`;
    case 'monthsSinceJoiningProgram':
      return `${n} mo`;
    default:
      return `${n.toLocaleString()} pts`;
  }
}
