import type {
  BasePlanItem,
  DisplayCapacity,
  FlaggedStore,
  LeaderboardEntry,
  SkuProduct,
  // Legacy types for backward compat
  ChecklistQuestion,
  EvidenceRequirement,
  OffShelfProduct,
  OffShelfRecommendation,
  ScorecardSection,
  TrellisPromptSet,
} from '../types'

// ── Store / Visit Context ─────────────────────────────────────────────────────

export const store = {
  id: 'HD-1907',
  name: 'Home Depot #1907',
  number: '1907',
  banner: 'Home Depot',
  district: 'Columbus North',
  territory: 'Ohio Central',
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

// ── Base Plan LGOR % (demo value — pending business confirmation) ──────────────

export const demoBasePlanLgorPercent = 26.3

// ── Base Plan Items: 8 items × 12.5 pts = 100 pts max ────────────────────────

export const basePlanItems: BasePlanItem[] = [
  {
    id: 'plant-food-pog',
    itemName: 'Plant Food POG',
    itemType: 'standard',
    requiredLocation: 'Lawn & Garden Aisle',
    possiblePoints: 12.5,
    guidance: 'Verify Scotts core plant food facings match the approved shelf set.',
  },
  {
    id: 'chemical-pog',
    itemName: 'Chemical POG',
    itemType: 'standard',
    requiredLocation: 'Controls Aisle',
    possiblePoints: 12.5,
    guidance: 'Confirm approved labels visible; placement follows local safety rules.',
  },
  {
    id: 'indoor-soil-pog',
    itemName: 'Indoor Soil POG',
    itemType: 'standard',
    requiredLocation: 'Indoor Garden',
    possiblePoints: 12.5,
    guidance: 'Confirm indoor soils are blocked correctly with no shelf gaps.',
  },
  {
    id: 'grass-seed-pog',
    itemName: 'Grass Seed POG',
    itemType: 'standard',
    requiredLocation: 'Seed Aisle',
    possiblePoints: 12.5,
    guidance: 'Check key Scotts grass seed SKUs are fronted and easy to shop.',
  },
  {
    id: 'q1-racetrack',
    itemName: 'Q1 Racetrack',
    itemType: 'display',
    requiredLocation: 'Racetrack',
    possiblePoints: 12.5,
    guidance: 'Verify racetrack placement is shoppable, filled, and brand-compliant.',
  },
  {
    id: 'q1-garden-door',
    itemName: 'Q1 Garden Door',
    itemType: 'display',
    requiredLocation: 'Garden Door',
    possiblePoints: 12.5,
    guidance: 'Check outdoor transition placement and seasonal signage.',
  },
  {
    id: 'q1-fence-line',
    itemName: 'Q1 Fence Line',
    itemType: 'display',
    requiredLocation: 'Fence Line',
    possiblePoints: 12.5,
    guidance: 'Confirm signage, packout, and expected Scotts mix at the fenceline.',
  },
  {
    id: 'q1-endcap',
    itemName: 'Q1 Endcap',
    itemType: 'display',
    requiredLocation: 'Endcap',
    possiblePoints: 12.5,
    guidance: 'Validate endcap presence, brand blocking, and promotional readiness.',
  },
]

// ── SKU Data (demo values — pending business confirmation) ────────────────────

export const skuData: SkuProduct[] = [
  {
    id: 'turf-builder-20lb',
    sku: 'SCO-TB20',
    productName: 'Scotts Turf Builder 20 lb',
    category: 'Grass Seed',
    productSize: '20 lb',
    lgorPercent: 7.3,
    quarterlyUnits: 420,
    quarterlyDollarValue: 12600,
    peakWeekUnits: 138,
    rank: 1,
    unitsPerCase: 4,
    casesPerPallet: 20,
    unitsPerPallet: 80,
    isRecommended: true,
  },
  {
    id: 'weed-feed-15m',
    sku: 'SCO-WF15',
    productName: 'Scotts Weed & Feed 15M',
    category: 'Weed & Feed',
    productSize: '15,000 sq ft',
    lgorPercent: 6.1,
    quarterlyUnits: 350,
    quarterlyDollarValue: 10500,
    peakWeekUnits: 110,
    rank: 2,
    unitsPerCase: 2,
    casesPerPallet: 30,
    unitsPerPallet: 60,
    isRecommended: true,
  },
  {
    id: 'shake-n-feed',
    sku: 'MG-SNF',
    productName: 'Miracle-Gro Shake n Feed',
    category: 'Plant Food',
    productSize: '8 lb',
    lgorPercent: 4.8,
    quarterlyUnits: 280,
    quarterlyDollarValue: 5880,
    peakWeekUnits: 75,
    rank: 3,
    unitsPerCase: 6,
    casesPerPallet: 30,
    unitsPerPallet: 180,
    isRecommended: true,
  },
  {
    id: 'potting-mix',
    sku: 'MG-PM2CF',
    productName: 'Miracle-Gro Potting Mix 2 cu ft',
    category: 'Indoor Soil',
    productSize: '2 cu ft',
    lgorPercent: 4.2,
    quarterlyUnits: 240,
    quarterlyDollarValue: 3840,
    peakWeekUnits: 60,
    rank: 4,
    unitsPerCase: 1,
    casesPerPallet: 40,
    unitsPerPallet: 40,
    isRecommended: true,
  },
  {
    id: 'turf-builder-triple',
    sku: 'SCO-TBTA',
    productName: 'Scotts Turf Builder Triple Action',
    category: 'Weed & Feed',
    productSize: '20,000 sq ft',
    lgorPercent: 3.7,
    quarterlyUnits: 210,
    quarterlyDollarValue: 8820,
    peakWeekUnits: 50,
    rank: 5,
    unitsPerCase: 2,
    casesPerPallet: 20,
    unitsPerPallet: 40,
    isRecommended: true,
  },
  {
    id: 'ez-seed-repair',
    sku: 'SCO-EZS',
    productName: 'Scotts EZ Seed Patch & Repair',
    category: 'Grass Seed',
    productSize: '10 lb',
    lgorPercent: 2.9,
    quarterlyUnits: 168,
    quarterlyDollarValue: 3360,
    peakWeekUnits: 40,
    rank: 6,
    unitsPerCase: 6,
    casesPerPallet: 20,
    unitsPerPallet: 120,
    isRecommended: false,
  },
  {
    id: 'garden-soil',
    sku: 'MG-GS1CF',
    productName: 'Miracle-Gro Garden Soil',
    category: 'Outdoor Soil',
    productSize: '1 cu ft',
    lgorPercent: 2.4,
    quarterlyUnits: 138,
    quarterlyDollarValue: 966,
    peakWeekUnits: 30,
    rank: 7,
    unitsPerCase: 1,
    casesPerPallet: 60,
    unitsPerPallet: 60,
    isRecommended: false,
  },
  {
    id: 'roundup-ready',
    sku: 'RND-RTU',
    productName: 'Roundup Ready-To-Use',
    category: 'Chemical',
    productSize: '32 oz',
    lgorPercent: 1.8,
    quarterlyUnits: 100,
    quarterlyDollarValue: 1000,
    peakWeekUnits: 25,
    rank: 8,
    unitsPerCase: 6,
    casesPerPallet: 30,
    unitsPerPallet: 180,
    isRecommended: false,
  },
]

// ── Display Capacity Data (demo values — pending business confirmation) ────────

export const displayCapacity: DisplayCapacity[] = [
  { location: 'Fence Line', capacityUnits: 60, rackingDepth: 3 },
  { location: 'Racetrack', capacityUnits: 40, rackingDepth: 2 },
  { location: 'Endcap', capacityUnits: 80, rackingDepth: 4 },
  { location: 'Garden Door', capacityUnits: 50, rackingDepth: 3 },
  { location: 'Drive Aisle', capacityUnits: 120, rackingDepth: 6 },
  { location: 'Pallet / Stackout', capacityUnits: 240, rackingDepth: 10 },
  { location: 'Other', capacityUnits: 40, rackingDepth: 2 },
]

// ── Display locations list ────────────────────────────────────────────────────

export const displayLocations = [
  'Fence Line',
  'Racetrack',
  'Endcap',
  'Garden Door',
  'Drive Aisle',
  'Pallet / Stackout',
  'Other',
]

// ── Product categories ────────────────────────────────────────────────────────

export const productCategories = [
  { id: 'grass-seed', label: 'Grass Seed' },
  { id: 'plant-food', label: 'Plant Food' },
  { id: 'weed-feed', label: 'Weed & Feed' },
  { id: 'chemical', label: 'Chemical' },
  { id: 'indoor-soil', label: 'Indoor Soil' },
  { id: 'outdoor-soil', label: 'Outdoor Soil' },
]

// ── Manager Dashboard Seed Data ───────────────────────────────────────────────

export const leaderboardSeed: LeaderboardEntry[] = [
  { rank: 1, store: 'Home Depot #1881', rep: 'Marcus T.', score: 178.4, lgorRepPercent: 61.2, delta: 11, openRevisitCount: 0 },
  { rank: 2, store: "Lowe's #441", rep: 'Angela R.', score: 165.2, lgorRepPercent: 54.8, delta: 8, openRevisitCount: 1 },
  { rank: 3, store: 'Menards #225', rep: 'Victor P.', score: 154.7, lgorRepPercent: 48.3, delta: 5, openRevisitCount: 2 },
  { rank: 4, store: 'Ace Hardware #782', rep: 'Diana L.', score: 147.1, lgorRepPercent: 44.1, delta: 3, openRevisitCount: 1 },
  { rank: 5, store: 'Home Depot #1907', rep: 'Sarah M.', score: 142.4, lgorRepPercent: 38.7, delta: -2, openRevisitCount: 3 },
]

export const flaggedStoresSeed: FlaggedStore[] = [
  {
    storeId: 'HD-1907',
    storeName: 'Home Depot #1907',
    score: 142.4,
    lgorRepPercent: 38.7,
    issue: 'Peak week demand gap — Turf Builder 20lb under-inventoried',
    skuId: 'turf-builder-20lb',
    peakWeekUnits: 138,
    currentQuantity: 40,
    gap: 98,
    revisitStatus: 'Open',
    owner: 'Sarah M.',
  },
  {
    storeId: 'MEN-225',
    storeName: 'Menards #225',
    score: 154.7,
    lgorRepPercent: 48.3,
    issue: 'Missing MAP — Q1 Garden Door display not set',
    revisitStatus: 'In Progress',
    owner: 'Victor P.',
  },
]

export const regionBenchmark = {
  name: 'Columbus North',
  averageScore: 157.6,
  averageLgorRepPercent: 49.4,
  openRevisitCount: 7,
  highOpportunityStores: 2,
  peakWeekRiskStores: 3,
}

// ── Legacy mock data (backward compat for existing components) ────────────────

export const scorecardSections: ScorecardSection[] = [
  { id: 'base-plan-execution', title: 'Base Plan Execution', description: 'Verify POG/MAP/Stackout execution.', route: '/scorecard/base-plan', kind: 'execution' },
  { id: 'base-plan-lgor', title: 'Base Plan LGOR Review', description: 'Review base plan LGOR %.', route: '/scorecard/base-plan-lgor', kind: 'lgor' },
  { id: 'incremental-off-shelf', title: 'Incremental / Off-Shelf Capture', description: 'Document off-shelf placements.', route: '/scorecard/incremental', kind: 'incremental' },
  { id: 'opportunity', title: 'Opportunity Layer', description: 'High-value SKUs not yet off-shelf.', route: '/scorecard/opportunity', kind: 'opportunity' },
  { id: 'recommendations', title: 'Demand Signals', description: 'Rule-based guidance flags.', route: '/scorecard/recommendations', kind: 'recommendations' },
  { id: 'score-summary', title: 'Score Summary', description: 'Final PSS Score and LGOR Rep %.', route: '/scorecard/summary', kind: 'summary' },
  { id: 'revisit', title: 'Revisit / Follow-Up', description: 'Flag gaps for follow-up.', route: '/scorecard/revisit', kind: 'revisit' },
]

export const checklistQuestions: ChecklistQuestion[] = [
  { id: 'plant-food-pog', sectionId: 'base-plan', group: 'pog', category: 'Lawn and Garden', title: 'Plant Food POG', guidance: 'Verify core facings match approved shelf set.', businessWhy: 'Drives shelf visibility and conversion.', weight: 12.5, icon: 'shelf' },
  { id: 'chemical-pog', sectionId: 'base-plan', group: 'pog', category: 'Controls', title: 'Chemical POG', guidance: 'Confirm labels and safety placement.', businessWhy: 'Protects compliance and chemical sales.', weight: 12.5, icon: 'alert' },
  { id: 'indoor-soil-pog', sectionId: 'base-plan', group: 'pog', category: 'Soils', title: 'Indoor Soil POG', guidance: 'Check blocking and shelf gaps.', businessWhy: 'Prevents missed attachment sales.', weight: 12.5, icon: 'camera' },
  { id: 'grass-seed-pog', sectionId: 'base-plan', group: 'pog', category: 'Seed', title: 'Grass Seed POG', guidance: 'Check key SKUs fronted and shoppable.', businessWhy: 'Drives LGOR and seed conversion.', weight: 12.5, icon: 'shelf' },
  { id: 'q1-racetrack', sectionId: 'secondary-displays', group: 'display', category: 'Outdoor Care', title: 'Q1 Racetrack', guidance: 'Verify shoppable, filled, brand-compliant.', businessWhy: 'Supports high-traffic conversion.', weight: 12.5, icon: 'display' },
  { id: 'q1-garden-door', sectionId: 'secondary-displays', group: 'display', category: 'Seasonal', title: 'Q1 Garden Door', guidance: 'Check outdoor placement and signage.', businessWhy: 'Drives seasonal traffic capture.', weight: 12.5, icon: 'display' },
  { id: 'q1-fence-line', sectionId: 'secondary-displays', group: 'display', category: 'Outdoor Care', title: 'Q1 Fence Line', guidance: 'Confirm signage and packout.', businessWhy: 'Improves outdoor visibility.', weight: 12.5, icon: 'display' },
  { id: 'q1-endcap', sectionId: 'secondary-displays', group: 'display', category: 'Feature Space', title: 'Q1 Endcap', guidance: 'Validate endcap and brand blocking.', businessWhy: 'High impact on seasonal performance.', weight: 12.5, icon: 'display' },
]

export const evidenceRequirements: EvidenceRequirement[] = [
  { id: 'shelf-view', title: 'Shelf View', required: true, relevance: 'Supports base plan compliance.', linkedQuestionIds: ['plant-food-pog', 'chemical-pog', 'grass-seed-pog', 'indoor-soil-pog'] },
  { id: 'endcap-photo', title: 'Endcap / Display', required: false, relevance: 'Optional supporting evidence for displays.', linkedQuestionIds: ['q1-endcap', 'q1-fence-line', 'q1-racetrack'] },
]

export const offShelfLocations = displayLocations

export const offShelfCategories = productCategories

export const offShelfProducts: OffShelfProduct[] = skuData.map(sku => ({
  id: sku.id,
  categoryId: sku.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
  name: sku.productName,
  subtitle: `${sku.productSize} · ${sku.lgorPercent}% LGOR (demo value — pending business confirmation)`,
  recommendedLocations: ['Endcap', 'Fence Line'],
  basePoints: sku.lgorPercent,
  baseLgor: sku.lgorPercent,
  peakWeekUnits: sku.peakWeekUnits,
}))

export const offShelfQuantityOptions = [20, 40, 80, 120, 200, 240]

export const offShelfRecommendations: OffShelfRecommendation[] = [
  { skuId: 'turf-builder-20lb', location: 'Endcap', quantity: 120, potentialPoints: 21.9, rationale: 'Top-ranked SKU. 120 units = 2x peak week depth.' },
  { skuId: 'weed-feed-15m', location: 'Fence Line', quantity: 80, potentialPoints: 6.1, rationale: 'Fence line is the top repeated gap for this store.' },
  { skuId: 'potting-mix', location: 'Garden Door', quantity: 80, potentialPoints: 8.4, rationale: 'Garden door add-on supports seasonal soil attachment.' },
  { skuId: 'shake-n-feed', location: 'Racetrack', quantity: 80, potentialPoints: 9.6, rationale: 'Racetrack increases plant food visibility during weekend peaks.' },
]

export const previousOffShelfSeed: Array<{
  skuId: string
  location: string
  quantity: number
  classification: 'incremental'
  caption: string
  notes: string
}> = []

export const regionBenchmarkLegacy = {
  name: 'Columbus North',
  averageScore: 157.6,
  averageLgor: 49.4,
  currentRiskValue: 0,
  riskMinimizedValue: 0,
}

export const previousSnapshot = {
  score: 142.4,
  date: 'Mar 12, 2026',
  submittedBy: 'Sarah M.',
  gap: 'Garden Doors display gap repeated two visits in a row.',
  opportunity: 'Weed and Feed endcap with 80+ units remained the top incremental opportunity.',
}

export const leaderboardSeedLegacy = leaderboardSeed.map(e => ({ store: e.store, rep: e.rep, score: e.score, delta: e.delta }))

export const trellisContent: Record<string, TrellisPromptSet> = {
  entry: { title: 'Visit briefing', insight: 'Garden Doors missed last two visits. Weed and Feed endcaps drove the best LGOR lift at nearby stores this quarter.', prompts: ['Review last visit issues', 'Start guided mode', 'Explain scorecard sections'] },
  basePlan: { title: 'Execution guidance', insight: 'POG and display items are the most-missed checks for this banner in Q1. Partial completion still earns partial credit.', prompts: ['Explain this item', 'Why is this required?', 'What failed last time?'] },
  offShelf: { title: 'Capture recommendations', insight: 'Best upside from incremental endcap, fence line, and garden door placements with 2x peak week depth or greater.', prompts: ['Show top opportunities', 'Explain score impact', 'Why this SKU?'] },
  summary: { title: 'Score impact review', insight: 'Score improves meaningfully when repeated display gaps are closed and high-LGOR SKUs are placed with sufficient depth.', prompts: ['Explain score impact', 'List next actions'] },
}

export const accountabilitySeed = [
  { area: 'FST Accountability', owner: 'Sarah M.', lens: 'Field execution across MAP, POG, and incremental support' },
  { area: 'BDT Accountability', owner: 'Columbus North BDT', lens: 'Banner-level follow-through on repeated gaps' },
  { area: 'Base Plan Accountability', owner: 'Store leadership', lens: 'Protect the core set so incremental placement is counted correctly' },
]

export const regionalPerformanceSeed = leaderboardSeed.map(e => ({
  store: e.store,
  score: e.score,
  lgorPct: e.lgorRepPercent,
  riskValue: 0,
  incrementalValue: 0,
}))
