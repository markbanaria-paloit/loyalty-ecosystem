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
 *
 * Blurbs are written as the member would read them — sell the outing, never
 * the occupancy problem behind it. The ops rationale ("fill September") lives
 * in `theme`, `venues` and `segment`, which is where reviewers look.
 */

import goldenHourPark from '../assets/1024x682_147e6d56d-aacc-428a-8f7e-9d0a713ea3b2.jpg';
import kopitiamHall from '../assets/images.jpeg';
import confettiNight from '../assets/checkin-confetti.jpg';
import krakenRacers from '../assets/kraken-racers-2a.jpg';
import golfClubhouse from '../assets/golf-clubhouse.jpg';
import sgMiceTwilight from '../assets/sg-mice-twilight.jpg';
import socialSelfie from '../assets/social-selfie.jpg';

/**
 * The hero image for the section's collapsed banner — the most cinematic shot
 * we have, cropped dark so the headline carries it.
 */
export const THIRD_HOME_HERO = goldenHourPark;

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
      'Three adventures, one September. Hit Downtown East, Wild Wild Wet and D\'Resort while the crowds stay home — the voucher\'s yours.',
    venues: ['de', 'www', 'dresort'],
    segment: 'Everyone',
    milestones: [
      { label: 'Visit Downtown East', goal: 1, current: 1 },
      { label: 'Visit Wild Wild Wet', goal: 1, current: 0 },
      { label: "Stay or dine at D'Resort", goal: 1, current: 0 },
    ],
    reward: { kind: 'voucher', label: '$20 store voucher' },
    accent: 'from-sky-500 to-blue-700',
    image: goldenHourPark,
  },
  {
    id: 'daily-visit-scratch',
    theme: 'Streak',
    name: 'Five Days at the Club',
    blurb:
      'Make the Club your daily habit — five days straight and day five hands you a scratch card with real prizes.',
    venues: ['clubhouse', 'de'],
    segment: 'Everyone',
    milestones: [{ label: 'Days checked in', goal: 5, current: 4 }],
    reward: { kind: 'scratch', label: 'Scratch card on day five' },
    accent: 'from-amber-500 to-orange-600',
    image: kopitiamHall,
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
    id: 'social-share',
    theme: 'Social',
    name: 'Share Your Third Home',
    blurb:
      'Caught a great moment at the Club? Tag #MyThirdHome and watch the points roll in — the best posts get featured.',
    venues: ['de', 'www', 'dresort'],
    segment: 'Everyone',
    milestones: [{ label: 'Posts tagged #MyThirdHome', goal: 3, current: 1 }],
    reward: { kind: 'points', label: '250 points per featured post' },
    accent: 'from-fuchsia-500 to-pink-600',
    image: socialSelfie,
  },
  {
    id: 'app-streak',
    theme: 'Streak',
    name: 'Daily Check-in',
    blurb:
      'The easiest points in the Club: open the app five days running, pocket 100 points. Then do it again.',
    venues: [],
    segment: 'Everyone',
    milestones: [{ label: 'Days in a row', goal: 5, current: 2 }],
    reward: { kind: 'points', label: '100 points per streak' },
    accent: 'from-violet-500 to-purple-700',
    image: confettiNight,
  },
  {
    id: 'family-weekender',
    theme: 'Leaderboard · Families',
    name: 'Family Face-Off',
    blurb:
      "Bring the whole crew. Every full-family visit to Wild Wild Wet or D'Resort climbs the board — September's top family takes the grand prize.",
    venues: ['www', 'dresort'],
    segment: 'Families with children',
    milestones: [],
    /**
     * Competitive rather than personal: the platform's achievements can rank
     * members, and this concept rides that. Standings here are illustrative —
     * a live board would come from the engine, not this file.
     */
    leaderboard: {
      metric: 'Full-family visits',
      entries: [
        { rank: 1, name: 'The Tan Family', value: 6 },
        { rank: 2, name: 'The Rahman Family', value: 5 },
        { rank: 3, name: 'The Nair Family', value: 4 },
      ],
      you: { rank: 7, name: 'Your family', value: 2 },
    },
    reward: { kind: 'product', label: "Top family wins a D'Resort staycation" },
    accent: 'from-emerald-500 to-teal-700',
    image: krakenRacers,
  },
  {
    id: 'clubhouse-regular',
    theme: 'Segment · Members near a clubhouse',
    name: 'Your Local Clubhouse',
    blurb:
      'Your clubhouse is closer than you think. Three visits to Orchid or Aranda this month — dinner counts too — and the dining credit is on us.',
    venues: ['occ', 'acc', 'mgk'],
    segment: 'Members within 5km of a clubhouse',
    milestones: [{ label: 'Clubhouse visits', goal: 3, current: 1 }],
    reward: { kind: 'voucher', label: '$30 dining credit' },
    accent: 'from-rose-500 to-red-700',
    image: golfClubhouse,
  },
  {
    id: 'mice-return',
    theme: 'Segment · Corporate',
    name: 'Bring the Team Back',
    blurb:
      'Plan the off-site your team will actually talk about. Two bookings before the year ends puts catering on us.',
    venues: ['mice'],
    segment: 'Corporate bookers',
    milestones: [{ label: 'Bookings confirmed', goal: 2, current: 1 }],
    reward: { kind: 'voucher', label: '$100 catering credit' },
    accent: 'from-slate-600 to-gray-800',
    image: sgMiceTwilight,
  },
];
