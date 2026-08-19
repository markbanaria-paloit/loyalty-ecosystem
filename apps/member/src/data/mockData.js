// Mock reference data + admin-configurable rule defaults for the NTUC Club
// Loyalty prototype. In production these would live in an admin console /
// rules engine (per BR-P1-008, BR-P1-013, BR-P1-014 etc.) — every value
// here is deliberately editable at runtime via Demo / Admin Controls to
// prove the "configurable without redevelopment" requirements.

const FAIRPRICE_LOGO = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTISrC252fmnBKvHtTEVoZFjGwY9UKHuSZ4beOQucad4A&s';

export const TENANTS = [
  { id: 't1', name: 'FairPrice', category: 'Supermarket', color: '#ee3224', initials: 'FP', logo: FAIRPRICE_LOGO },
  { id: 't2', name: 'FairPrice Xtra', category: 'Supermarket', color: '#d4231a', initials: 'FX', logo: FAIRPRICE_LOGO },
  { id: 't3', name: 'Unity Pharmacy', category: 'Health & Beauty', color: '#1f7a5c', initials: 'UP', logo: 'https://unity.com.sg/wp-content/uploads/2025/11/og-unity.jpg' },
  { id: 't4', name: 'Kopitiam', category: 'F&B', color: '#c98d1c', initials: 'KT', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKiQCyrQLpR064jR9RBEw6QeyQQcEuz70pd7P9yREpPg&s=10' },
  { id: 't5', name: 'Foodfare', category: 'F&B', color: '#b0651a', initials: 'FF', logo: 'https://cdn.triloker.com/d:300/company/logo/20211223/010559f8fd5c907b65640888f738826025e96cb01640248295.png' },
  { id: 't6', name: 'NTUC Club Chalet', category: 'Leisure', color: '#2b5da8', initials: 'NC', logo: 'https://www.ntucclub.com/images/default-source/default-album/logo.png?sfvrsn=e2abcfc9_2' },
  { id: 't7', name: 'LiveWell Fitness', category: 'Wellness', color: '#3f8f5c', initials: 'LW' },
];

export const REWARDS_CATALOG = [
  { id: 'r1', tenantId: 't1', title: 'FairPrice $5 Voucher', description: 'Redeemable storewide at any FairPrice outlet.', pointsCost: 500, cashValue: 5 },
  { id: 'r2', tenantId: 't1', title: 'FairPrice $10 Voucher', description: 'Redeemable storewide at any FairPrice outlet.', pointsCost: 1900, cashValue: 10 },
  { id: 'r3', tenantId: 't4', title: 'Kopitiam $5 Set Meal Voucher', description: 'Valid for any set meal at Kopitiam.', pointsCost: 1000, cashValue: 5 },
  { id: 'r4', tenantId: 't3', title: 'Unity $8 Wellness Voucher', description: 'Off vitamins, personal care & more.', pointsCost: 1500, cashValue: 8 },
  { id: 'r5', tenantId: 't6', title: 'NTUC Club Chalet $20 Stay Credit', description: 'Off your next chalet booking.', pointsCost: 3600, cashValue: 20 },
  { id: 'r7', tenantId: 't5', title: 'Foodfare $5 Voucher', description: 'Redeemable at any Foodfare foodcourt stall.', pointsCost: 1000, cashValue: 5 },
];

export const PROMOTIONS = [
  {
    id: 'p1',
    title: '3x Points Weekend at Kopitiam',
    body: 'Earn triple points on every qualifying spend at Kopitiam this Sat & Sun.',
    tenantId: 't4',
    audience: 'all',
    tag: 'Bonus Points',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJIsDuHqWj2CaLPJDdX6BigW16yD3fGJaejhmXTN4Gh9VJfQigWjuwpUGc&s=10',
  },
  {
    id: 'p2',
    title: 'Tier 2 Exclusive: Chalet Early Bird',
    body: '15% off chalet stays booked 30 days in advance. Tier 2 members only.',
    tenantId: 't6',
    audience: 'tier2',
    tag: 'Tier 2 Exclusive',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIKwWea-uDar7t8s0M_XABtsc2hn-PhiuQ_8v8MEp4zCyJ47vFgV8mEQk&s=10',
  },
  {
    id: 'p3',
    title: 'Member-Only: $2 Off at Unity',
    body: 'Flash $2 off any purchase above $20 at Unity Pharmacy. Members only.',
    tenantId: 't3',
    audience: 'all',
    tag: 'Members Only',
    image: 'https://unity.com.sg/wp-content/uploads/2025/11/og-unity.jpg',
  },
  {
    id: 'p4',
    title: 'Tier 2 Fitness Perk',
    body: 'One complimentary guest pass at NTUC Fitness every month.',
    tenantId: 't7',
    audience: 'tier2',
    tag: 'Tier 2 Exclusive',
    image: 'https://ntucclubdtecdn.azureedge.net/assets/images/default-source/shop-gallery-/ark-liv.jpg?sfvrsn=a5fed7aa_1',
  },
];

// Admin-configurable programme rules (BR-P1-008, 011, 013, 014, 016, 024, 025)
export const DEFAULT_CONFIG = {
  earnRate: 1, // $1 qualifying spend = this many points
  rounding: 'round', // 'round' | 'floor'
  pointsExpiryMonths: 12,
  voucherExpiryMonths: 12,
  birthdayMultiplier: { tier1: 2, tier2: 3 },
  birthdayTrigger: 'first-transaction-in-month', // vs 'fixed-date' (future option)
  campaign: {
    active: true,
    multiplier: 3,
    label: '3x Points Weekend at Kopitiam',
    tenantId: 't4',
  },
  parkingCapMinutes: { tier1: 60, tier2: 120 },
  tier2Eligibility: 'ntuc-member-auto', // open item O-2: 'ntuc-member-auto' | 'spend-based'
  tier2SpendThreshold: 500, // used only when tier2Eligibility === 'spend-based'
};

/**
 * The two tiers of Phase 1, with the benefits as the programme states them.
 *
 * Scenario 1 of the tier deck: both tiers convert 1,000 points to a $5 voucher
 * and earn 1 point per $1 spent, so what separates them is the benefit list
 * rather than the rate. The deck's Tier 3 is deliberately absent — it is
 * Phase 2, and Phase 1 is a two-tier programme.
 */
export const TIER_INFO = {
  tier1: {
    name: 'Tier 1',
    label: 'Tier 1',
    color: '#8a8f98',
    perks: [
      '1 hour free parking / month',
      'Birthday 2x points',
      'Welcome deal bundle, 30 days',
      '2 Wild Wild Wet day passes / year',
    ],
  },
  tier2: {
    name: 'Tier 2',
    label: 'Tier 2',
    color: 'linear-gradient(135deg, #f5c842 0%, #e8832e 100%)',
    perks: [
      '2 hours free parking / month',
      'Birthday 3x points',
      'Welcome insider pack',
      'Early-bird facility booking',
      '4 Wild Wild Wet day passes / year',
      "Up to 35% off D'Resort rooms",
    ],
  },
};
