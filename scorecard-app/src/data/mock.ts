import type {
  BasePlanItem,
  DisplayCapacityData,
  FlaggedStore,
  LeaderboardEntry,
  OffShelfProduct,
  ScorecardSection,
  SkuProduct,
} from '../types'

// --- New MVP mock data ---

export const store = {
  id: 'hd-1907',
  name: 'Home Depot #1907',
  number: '1907',
  banner: 'Home Depot',
  district: 'Columbus North',
  territory: 'Ohio East',
  quarter: 'Q1 2026',
  visitDate: 'May 25, 2026',
  rep: 'Sarah M.',
}

export const previousScore = {
  score: 142.4,
  lgorRepPercent: 38.7,
  date: 'Mar 12, 2026',
  submittedBy: 'Sarah M.',
}

// Demo value — pending business confirmation
export const demoBasePlanLgorPercent = 26.3

export const basePlanItems: BasePlanItem[] = [
  {
    id: 'plant-food-pog',
    name: 'Plant Food POG',
    type: 'standard',
    location: 'Main Aisle',
    pointsMax: 12.5,
    guidance: 'Verify POG is set correctly with all required SKUs in planogram position.',
  },
  {
    id: 'chemical-pog',
    name: 'Chemical POG',
    type: 'standard',
    location: 'Chemical Aisle',
    pointsMax: 12.5,
    guidance: 'Confirm chemical products are positioned per current planogram.',
  },
  {
    id: 'indoor-soil-pog',
    name: 'Indoor Soil POG',
    type: 'standard',
    location: 'Garden Center',
    pointsMax: 12.5,
    guidance: 'All indoor soil SKUs present and facings set per planogram.',
  },
  {
    id: 'grass-seed-pog',
    name: 'Grass Seed POG',
    type: 'standard',
    location: 'Lawn & Garden',
    pointsMax: 12.5,
    guidance: 'Grass seed planogram fully executed with correct shelf positions.',
  },
  {
    id: 'q1-racetrack',
    name: 'Q1 Racetrack',
    type: 'display',
    location: 'Store Racetrack',
    pointsMax: 12.5,
    guidance: 'Racetrack display set with Q1 priority SKUs. Partial = some SKUs placed but not all positions filled.',
  },
  {
    id: 'q1-garden-door',
    name: 'Q1 Garden Door',
    type: 'display',
    location: 'Garden Door Entrance',
    pointsMax: 12.5,
    guidance: 'Garden door display executing Q1 planogram. Must have recommended depth.',
  },
  {
    id: 'q1-fence-line',
    name: 'Q1 Fence Line',
    type: 'display',
    location: 'Fence Line',
    pointsMax: 12.5,
    guidance: 'Fence line display set per Q1 requirements. Check product assortment and quantity.',
  },
  {
    id: 'q1-endcap',
    name: 'Q1 Endcap',
    type: 'display',
    location: 'Main Endcap',
    pointsMax: 12.5,
    guidance: 'Q1 endcap fully executed. Partial = partially stocked or missing secondary positions.',
  },
]

export const skuData: SkuProduct[] = [
  {
    id: 'turf-builder-20lb',
    name: 'Scotts Turf Builder 20lb',
    category: 'Grass Seed',
    lgorPercent: 7.3,
    quarterlyUnits: 840,
    quarterlyDollarValue: 29400,
    peakWeekUnits: 138,
    rank: 1,
    unitsPerCase: 4,
    casesPerPallet: 20,
    unitsPerPallet: 80,
    isRecommended: true,
  },
  {
    id: 'weed-feed-15m',
    name: 'Scotts Weed & Feed 15M',
    category: 'Weed & Feed',
    lgorPercent: 6.1,
    quarterlyUnits: 720,
    quarterlyDollarValue: 25200,
    peakWeekUnits: 110,
    rank: 2,
    unitsPerCase: 4,
    casesPerPallet: 20,
    unitsPerPallet: 80,
    isRecommended: true,
  },
  {
    id: 'shake-n-feed',
    name: "Miracle-Gro Shake 'N Feed",
    category: 'Plant Food',
    lgorPercent: 4.8,
    quarterlyUnits: 600,
    quarterlyDollarValue: 18000,
    peakWeekUnits: 75,
    rank: 3,
    unitsPerCase: 6,
    casesPerPallet: 16,
    unitsPerPallet: 96,
    isRecommended: true,
  },
  {
    id: 'potting-mix',
    name: 'Miracle-Gro Potting Mix 2 cu ft',
    category: 'Indoor Soil',
    lgorPercent: 4.2,
    quarterlyUnits: 480,
    quarterlyDollarValue: 14400,
    peakWeekUnits: 60,
    rank: 4,
    unitsPerCase: 1,
    casesPerPallet: 40,
    unitsPerPallet: 40,
    isRecommended: true,
  },
  {
    id: 'turf-builder-triple',
    name: 'Scotts Turf Builder Triple Action',
    category: 'Weed & Feed',
    lgorPercent: 3.7,
    quarterlyUnits: 360,
    quarterlyDollarValue: 12600,
    peakWeekUnits: 50,
    rank: 5,
    unitsPerCase: 4,
    casesPerPallet: 20,
    unitsPerPallet: 80,
    isRecommended: true,
  },
  {
    id: 'garden-soil',
    name: 'Miracle-Gro Garden Soil 1 cu ft',
    category: 'Outdoor Soil',
    lgorPercent: 2.9,
    quarterlyUnits: 300,
    quarterlyDollarValue: 8700,
    peakWeekUnits: 40,
    rank: 6,
    unitsPerCase: 1,
    casesPerPallet: 60,
    unitsPerPallet: 60,
    isRecommended: false,
  },
  {
    id: 'weed-killer-32oz',
    name: 'Roundup Weed Killer 32oz',
    category: 'Chemical',
    lgorPercent: 2.4,
    quarterlyUnits: 240,
    quarterlyDollarValue: 7200,
    peakWeekUnits: 35,
    rank: 7,
    unitsPerCase: 6,
    casesPerPallet: 24,
    unitsPerPallet: 144,
    isRecommended: false,
  },
  {
    id: 'all-purpose-plant-food',
    name: 'Miracle-Gro All Purpose Plant Food',
    category: 'Plant Food',
    lgorPercent: 1.8,
    quarterlyUnits: 180,
    quarterlyDollarValue: 4500,
    peakWeekUnits: 25,
    rank: 8,
    unitsPerCase: 6,
    casesPerPallet: 30,
    unitsPerPallet: 180,
    isRecommended: false,
  },
]

// Demo value — pending business confirmation
export const displayCapacity: DisplayCapacityData[] = [
  { location: 'Fence Line', capacityUnits: 60 },
  { location: 'Racetrack', capacityUnits: 40 },
  { location: 'Endcap', capacityUnits: 80 },
  { location: 'Garden Door', capacityUnits: 50 },
  { location: 'Drive Aisle', capacityUnits: 120 },
  { location: 'Pallet / Stackout', capacityUnits: 240 },
  { location: 'Other', capacityUnits: 30 },
]

export const leaderboardSeed: LeaderboardEntry[] = [
  { rank: 1, store: 'Home Depot #1881', rep: 'Marcus T.', score: 183.6, lgorRepPercent: 58.4, delta: 11, openRevisitCount: 0 },
  { rank: 2, store: "Lowe's #441", rep: 'Angela R.', score: 171.2, lgorRepPercent: 52.1, delta: 8, openRevisitCount: 1 },
  { rank: 3, store: 'Menards #225', rep: 'Victor P.', score: 164.8, lgorRepPercent: 49.7, delta: 5, openRevisitCount: 2 },
  { rank: 4, store: 'Home Depot #1907', rep: 'Sarah M.', score: 142.4, lgorRepPercent: 38.7, delta: -3, openRevisitCount: 3 },
  { rank: 5, store: 'Ace Hardware #782', rep: 'Diane K.', score: 138.1, lgorRepPercent: 35.2, delta: 2, openRevisitCount: 1 },
]

export const flaggedStoresSeed: FlaggedStore[] = [
  {
    store: 'Home Depot #1907',
    rep: 'Sarah M.',
    issue: 'High-LGOR SKU missing off-shelf during peak week',
    sku: 'Scotts Turf Builder 20lb',
    peakWeekUnits: 138,
    currentQuantity: 40,
    gap: 98,
    revisitStatus: 'Open',
    owner: 'Sarah M.',
  },
  {
    store: 'Ace Hardware #782',
    rep: 'Diane K.',
    issue: 'Endcap quantity below peak week threshold',
    sku: 'Scotts Weed & Feed 15M',
    peakWeekUnits: 110,
    currentQuantity: 60,
    gap: 50,
    revisitStatus: 'In Progress',
    owner: 'Diane K.',
  },
]

export const regionBenchmark = {
  averageScore: 157.6,
  averageLgorRepPercent: 49.4,
  openRevisitCount: 7,
  peakWeekRiskStoreCount: 2,
}

// --- Legacy mock data kept for backward compat with remaining components ---

export const scorecardSections: ScorecardSection[] = []
export const checklistQuestions: never[] = []
export const evidenceRequirements: never[] = []
export const offShelfProducts: OffShelfProduct[] = []
export const offShelfRecommendations: never[] = []
export const previousOffShelfSeed: never[] = []
