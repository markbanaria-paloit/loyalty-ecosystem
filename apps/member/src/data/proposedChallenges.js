/**
 * Challenge concepts, for showing — not for scoring.
 *
 * These are proposals: shapes of challenge the programme could run, written to
 * be looked at and argued with. Nothing here is configured on the loyalty
 * platform, nothing here awards anything, and the app makes no attempt to
 * advance them. The one real challenge a member is in comes from Open Loyalty
 * and appears at the top of the home screen; these sit lower down and are
 * labelled as ideas so the two are never mistaken for each other.
 *
 * The theme is the quiet stretch after the June holidays and before the
 * year-end one — September, when the venues that fill up around a school break
 * have room. Each concept names the venue it is meant to fill and the segment
 * it is aimed at, because "who is this for and what is it moving" is the part
 * worth reviewing.
 */

/** The venues a challenge can be pointed at. */
export const CLUB_VENUES = {
  de: 'Downtown East',
  dresort: "D'Resort",
  www: 'Wild Wild Wet',
  occ: 'Orchid Country Club',
  acc: 'Aranda Country Club',
  mgk: 'My Golf Kaki',
  mice: 'MICE venues',
  clubhouse: 'NTUC Club Clubhouses',
};

/**
 * Reward shapes worth distinguishing.
 *
 * `voucher` is a cash-equivalent to spend on site; `product` is a thing the
 * member claims and collects. The second is what makes a challenge feel like a
 * prize rather than a discount, and is deliberately not golf — the segments
 * these are aimed at are families and first-time visitors.
 */
export const PROPOSED_CHALLENGES = [
  {
    id: 'september-lull',
    theme: 'Seasonal',
    name: 'September Explorer',
    blurb:
      "Visit three different NTUC Club places in September — the quiet month between school holidays.",
    venues: ['de', 'www', 'dresort'],
    segment: 'Everyone',
    milestones: [
      { label: 'Visit Downtown East', goal: 1, current: 1 },
      { label: 'Visit Wild Wild Wet', goal: 1, current: 0 },
      { label: "Stay or dine at D'Resort", goal: 1, current: 0 },
    ],
    reward: { kind: 'voucher', label: '$20 store voucher' },
    accent: 'from-sky-500 to-blue-700',
  },
  {
    id: 'daily-visit-scratch',
    theme: 'Streak',
    name: 'Five Days at the Club',
    blurb:
      'Check in five days running at any clubhouse. The fifth day opens a scratch card.',
    venues: ['clubhouse', 'de'],
    segment: 'Everyone',
    milestones: [{ label: 'Days checked in', goal: 5, current: 4 }],
    reward: { kind: 'scratch', label: 'Scratch card on day five' },
    accent: 'from-amber-500 to-orange-600',
    /** What the card can turn up. Weightings are a programme decision. */
    prizes: [
      '$5 Kopitiam voucher',
      '2 hours free parking',
      '500 bonus points',
      'Wild Wild Wet day pass',
      '10% off your next stay',
    ],
  },
  {
    id: 'app-streak',
    theme: 'Streak',
    name: 'Daily Check-in',
    blurb: 'Open the app five days in a row for 100 points. Repeats every streak.',
    venues: [],
    segment: 'Everyone',
    milestones: [{ label: 'Days in a row', goal: 5, current: 2 }],
    reward: { kind: 'points', label: '100 points per streak' },
    accent: 'from-violet-500 to-purple-700',
  },
  {
    id: 'family-weekender',
    theme: 'Segment · Families',
    name: 'Family Weekender',
    blurb:
      "Two family visits across Wild Wild Wet and D'Resort, and the picnic set is yours.",
    venues: ['www', 'dresort'],
    segment: 'Families with children',
    milestones: [
      { label: 'Family visits', goal: 2, current: 0 },
      { label: 'Spend $80 across the weekend', goal: 80, current: 35 },
    ],
    reward: { kind: 'product', label: 'Claim a family picnic set' },
    accent: 'from-emerald-500 to-teal-700',
  },
  {
    id: 'clubhouse-regular',
    theme: 'Segment · Members near a clubhouse',
    name: 'Your Local Clubhouse',
    blurb:
      'Three visits to Orchid or Aranda this month — dining counts, not just the course.',
    venues: ['occ', 'acc', 'mgk'],
    segment: 'Members within 5km of a clubhouse',
    milestones: [{ label: 'Clubhouse visits', goal: 3, current: 1 }],
    reward: { kind: 'voucher', label: '$30 dining credit' },
    accent: 'from-rose-500 to-red-700',
  },
  {
    id: 'mice-return',
    theme: 'Segment · Corporate',
    name: 'Bring the Team Back',
    blurb: 'Book two meetings at an NTUC Club MICE venue before the year turns.',
    venues: ['mice'],
    segment: 'Corporate bookers',
    milestones: [{ label: 'Bookings confirmed', goal: 2, current: 1 }],
    reward: { kind: 'voucher', label: '$100 catering credit' },
    accent: 'from-slate-600 to-gray-800',
  },
];
