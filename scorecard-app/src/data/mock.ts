import type {
  ChecklistQuestion,
  EvidenceRequirement,
  LeaderboardEntry,
  OffShelfProduct,
  OffShelfRecommendation,
  ScorecardSection,
  TrellisPromptSet,
} from '../types'

export const store = {
  name: 'Home Depot #1907',
  banner: 'Home Depot',
  city: 'Columbus, OH',
  visitStatus: 'Active' as const,
  scorecard: 'Q1 2026 Store Scorecard',
  rep: 'Sarah M.',
  motto: 'Proactive recommendations and iterative scoring informed by prior-year sales, reorders, and load-ins.',
}

export const previousSnapshot = {
  score: 142,
  date: 'Mar 12, 2026',
  submittedBy: 'Sarah M.',
  gap: 'Garden Doors display gap repeated two visits in a row.',
  opportunity: 'Weed and Feed endcap with 80+ units remained the top incremental opportunity.',
}

export const regionBenchmark = {
  name: 'Columbus North',
  averageScore: 151,
}

export const leaderboardSeed: Omit<LeaderboardEntry, 'rank'>[] = [
  { store: 'Home Depot #1881', rep: 'Marcus T.', score: 163, delta: 11 },
  { store: 'Lowe\'s #441', rep: 'Angela R.', score: 157, delta: 8 },
  { store: 'Menards #225', rep: 'Victor P.', score: 149, delta: 5 },
]

export const scorecardSections: ScorecardSection[] = [
  {
    id: 'base-plan',
    title: 'Base Plan Check',
    description: 'Verify core Scotts shelf and POG standards.',
    route: '/checklist',
    kind: 'checklist',
  },
  {
    id: 'secondary-displays',
    title: 'Secondary Display Check',
    description: 'Confirm off-aisle placements and feature space execution.',
    route: '/checklist',
    kind: 'checklist',
  },
  {
    id: 'off-shelf-capture',
    title: 'Off-Shelf Opportunity Capture',
    description: 'Document incremental placements and estimated unit counts.',
    route: '/off-shelf',
    kind: 'capture',
  },
  {
    id: 'photo-evidence',
    title: 'Photo Evidence',
    description: 'Capture required evidence and field notes before review.',
    route: '/photo',
    kind: 'evidence',
  },
  {
    id: 'review-submit',
    title: 'Review and Submit',
    description: 'Review score impact, blockers, and submit from the visit.',
    route: '/summary',
    kind: 'review',
  },
]

export const checklistQuestions: ChecklistQuestion[] = [
  {
    id: 'map-fence-line',
    sectionId: 'base-plan',
    group: 'map',
    category: 'MAP Location',
    title: 'Fence Line set',
    guidance: 'Confirm Fence Line base plan location is set before evaluating incremental performance.',
    businessWhy: 'Base plan must be set first so incremental gains are measured against a stable execution baseline.',
    weight: 10,
    icon: 'display',
  },
  {
    id: 'map-drive-aisle',
    sectionId: 'base-plan',
    group: 'map',
    category: 'MAP Location',
    title: 'Drive Aisle set',
    guidance: 'Confirm Drive Aisle base plan location is set before evaluating incremental performance.',
    businessWhy: 'Missing drive aisle base setup suppresses seasonal visibility and distorts incremental score credit.',
    weight: 10,
    icon: 'display',
  },
  {
    id: 'map-endcap',
    sectionId: 'base-plan',
    group: 'map',
    category: 'MAP Location',
    title: 'Endcap set',
    guidance: 'Confirm Endcap base plan location is set before evaluating incremental performance.',
    businessWhy: 'Endcap base setup anchors promotional conversion and protects high-value display ranking.',
    weight: 10,
    icon: 'display',
  },
  {
    id: 'map-garden-doors',
    sectionId: 'base-plan',
    group: 'map',
    category: 'MAP Location',
    title: 'Garden Doors set',
    guidance: 'Confirm Garden Doors base plan location is set before evaluating incremental performance.',
    businessWhy: 'Garden Doors readiness influences seasonal traffic capture and outdoor conversion.',
    weight: 10,
    icon: 'display',
  },
  {
    id: 'plant-food-pog',
    sectionId: 'base-plan',
    group: 'pog',
    category: 'Lawn and Garden',
    title: 'Plant Food POG compliance',
    guidance: 'Verify Scotts core plant food facings match the approved shelf set.',
    businessWhy: 'High impact on shelf visibility and conversion for core plant food turns.',
    weight: 15,
    icon: 'shelf',
  },
  {
    id: 'chemical-pog',
    sectionId: 'base-plan',
    group: 'pog',
    category: 'Controls',
    title: 'Chemical POG safety labels',
    guidance: 'Confirm approved labels are visible and product placement follows local safety rules.',
    businessWhy: 'Protects compliance risk and keeps chemical sales active without execution blockers.',
    weight: 15,
    icon: 'alert',
  },
  {
    id: 'grass-seed-pog',
    sectionId: 'base-plan',
    group: 'pog',
    category: 'Seed',
    title: 'Grass Seed POG visibility',
    guidance: 'Check key Scotts grass seed SKUs are fronted and easy to shop from the aisle.',
    businessWhy: 'Drives LGOR contribution and seed conversion during peak seasonal demand.',
    weight: 15,
    icon: 'shelf',
  },
  {
    id: 'indoor-soil-pog',
    sectionId: 'base-plan',
    group: 'pog',
    category: 'Soils',
    title: 'Indoor Soil POG arrangement',
    guidance: 'Confirm indoor soils are blocked correctly and shelf gaps are called out immediately.',
    businessWhy: 'Maintains base plan credibility and prevents missed attachment sales in indoor gardening.',
    weight: 10,
    icon: 'camera',
  },
  {
    id: 'endcap',
    sectionId: 'secondary-displays',
    group: 'display',
    category: 'Feature Space',
    title: 'Endcap display execution',
    guidance: 'Validate endcap presence, brand blocking, and promotional readiness.',
    businessWhy: 'High impact on off-shelf visibility and seasonal sales performance.',
    weight: 15,
    icon: 'display',
  },
  {
    id: 'garden-doors',
    sectionId: 'secondary-displays',
    group: 'display',
    category: 'Seasonal',
    title: 'Garden Doors display execution',
    guidance: 'Check outdoor transition placement and note if the feature was missed or undersized.',
    businessWhy: 'Drives seasonal conversion and store ranking during outdoor traffic peaks.',
    weight: 10,
    icon: 'display',
  },
  {
    id: 'fenceline',
    sectionId: 'secondary-displays',
    group: 'display',
    category: 'Outdoor Care',
    title: 'Fenceline feature compliance',
    guidance: 'Confirm signage, packout, and the expected Scotts mix at the fenceline.',
    businessWhy: 'Improves outdoor visibility and supports incremental LGOR contribution from secondary placement.',
    weight: 10,
    icon: 'display',
  },
  {
    id: 'racetrack',
    sectionId: 'secondary-displays',
    group: 'display',
    category: 'Outdoor Care',
    title: 'Racetrack placement quality',
    guidance: 'Verify the racetrack placement is shoppable, filled, and aligned to this visit objective.',
    businessWhy: 'Supports high-traffic conversion and keeps premium feature space productive for the banner.',
    weight: 10,
    icon: 'display',
  },
]

export const evidenceRequirements: EvidenceRequirement[] = [
  {
    id: 'shelf-view',
    title: 'Shelf View',
    required: true,
    relevance: 'Supports base plan compliance and visible shelf conditions.',
    linkedQuestionIds: ['plant-food-pog', 'chemical-pog', 'grass-seed-pog', 'indoor-soil-pog'],
  },
  {
    id: 'endcap-photo',
    title: 'Endcap',
    required: true,
    relevance: 'Required when secondary display compliance is reviewed.',
    linkedQuestionIds: ['endcap', 'fenceline', 'racetrack'],
  },
  {
    id: 'promo-signage',
    title: 'Promo Signage',
    required: false,
    relevance: 'Optional supporting evidence for promotional signage and price messaging.',
    linkedQuestionIds: ['garden-doors', 'endcap'],
  },
]

export const offShelfLocations = ['Fence Line', 'Racetrack', 'Endcap', 'Garden Door', 'Drive Aisle', 'Other']

export const offShelfCategories = [
  { id: 'grass-seed', label: 'Grass Seed' },
  { id: 'plant-food', label: 'Plant Food' },
  { id: 'weed-feed', label: 'Weed & Feed' },
  { id: 'chemical', label: 'Chemical' },
  { id: 'indoor-soil', label: 'Indoor Soil' },
  { id: 'outdoor-soil', label: 'Outdoor Soil' },
]

export const offShelfProducts: OffShelfProduct[] = [
  {
    id: 'turf-builder-20lb',
    categoryId: 'grass-seed',
    name: 'Scotts Turf Builder 20 lb',
    subtitle: 'Sun & Shade mix | prior-year reorder leader',
    recommendedLocations: ['Endcap', 'Fence Line'],
    basePoints: 10.4,
    baseLgor: 2.1,
  },
  {
    id: 'ez-seed-repair',
    categoryId: 'grass-seed',
    name: 'Scotts EZ Seed Patch & Repair',
    subtitle: 'High attach item for seasonal fix-up sets',
    recommendedLocations: ['Drive Aisle', 'Garden Door'],
    basePoints: 8.2,
    baseLgor: 1.7,
  },
  {
    id: 'shake-n-feed',
    categoryId: 'plant-food',
    name: 'Miracle-Gro Shake n Feed',
    subtitle: 'Top-turn plant food during spring load-ins',
    recommendedLocations: ['Endcap', 'Racetrack'],
    basePoints: 9.1,
    baseLgor: 1.9,
  },
  {
    id: 'water-soluble',
    categoryId: 'plant-food',
    name: 'Miracle-Gro Water Soluble Plant Food',
    subtitle: 'Conversion SKU for promo-driven sidecaps',
    recommendedLocations: ['Racetrack', 'Endcap'],
    basePoints: 7.8,
    baseLgor: 1.5,
  },
  {
    id: 'weed-feed-15m',
    categoryId: 'weed-feed',
    name: 'Scotts Weed & Feed 15M',
    subtitle: 'Strong spring feature candidate in this banner',
    recommendedLocations: ['Fence Line', 'Endcap'],
    basePoints: 9.8,
    baseLgor: 2.0,
  },
  {
    id: 'turf-builder-triple',
    categoryId: 'weed-feed',
    name: 'Scotts Turf Builder Triple Action',
    subtitle: 'Recommended where prior-year load-ins cleared quickly',
    recommendedLocations: ['Fence Line', 'Drive Aisle'],
    basePoints: 8.6,
    baseLgor: 1.8,
  },
  {
    id: 'roundup-ready',
    categoryId: 'chemical',
    name: 'Roundup Ready-To-Use',
    subtitle: 'Impulse pick-up on drive aisle displays',
    recommendedLocations: ['Drive Aisle', 'Garden Door'],
    basePoints: 6.7,
    baseLgor: 1.2,
  },
  {
    id: 'home-defense',
    categoryId: 'chemical',
    name: 'Ortho Home Defense',
    subtitle: 'Works best on racetrack seasonal features',
    recommendedLocations: ['Racetrack', 'Endcap'],
    basePoints: 6.9,
    baseLgor: 1.3,
  },
  {
    id: 'potting-mix',
    categoryId: 'indoor-soil',
    name: 'Miracle-Gro Potting Mix 2 cu ft',
    subtitle: 'Supports cross-merchandising at garden doors',
    recommendedLocations: ['Garden Door', 'Racetrack'],
    basePoints: 7.4,
    baseLgor: 1.4,
  },
  {
    id: 'garden-soil',
    categoryId: 'outdoor-soil',
    name: 'Miracle-Gro Garden Soil',
    subtitle: 'Best used for seasonal pallet build-outs',
    recommendedLocations: ['Garden Door', 'Fence Line'],
    basePoints: 7.1,
    baseLgor: 1.3,
  },
]

export const offShelfQuantityOptions = [40, 80, 120, 200, 320, '400+']

export const offShelfRecommendations: OffShelfRecommendation[] = [
  {
    skuId: 'turf-builder-20lb',
    location: 'Endcap',
    quantity: 120,
    potentialPoints: 12.4,
    rationale: 'Prior-year spring turns support a 120-unit endcap load-in.',
  },
  {
    skuId: 'weed-feed-15m',
    location: 'Fence Line',
    quantity: 80,
    potentialPoints: 9.1,
    rationale: 'Fence line secondary placement remains the top repeated gap for this store.',
  },
  {
    skuId: 'potting-mix',
    location: 'Garden Door',
    quantity: 80,
    potentialPoints: 7.3,
    rationale: 'Garden door add-on supports seasonal conversion and soil attachment.',
  },
  {
    skuId: 'shake-n-feed',
    location: 'Racetrack',
    quantity: 40,
    potentialPoints: 5.8,
    rationale: 'Racetrack placement increases plant food visibility during weekend peaks.',
  },
]

export const previousOffShelfSeed = [
  {
    skuId: 'weed-feed-15m',
    location: 'Fence Line',
    quantity: 80,
    classification: 'incremental' as const,
    caption: 'Previous visit fence line placement with promotional signage.',
    notes: 'Loaded during the last visit and expected to be reviewed on the follow-up.',
  },
  {
    skuId: 'turf-builder-20lb',
    location: 'Endcap',
    quantity: 120,
    classification: 'incremental' as const,
    caption: 'Previous visit endcap build tied to spring seed demand.',
    notes: 'High-impact endcap placement from the last submission.',
  },
]

export const trellisContent: Record<'entry' | 'checklist' | 'offShelf' | 'photo' | 'summary', TrellisPromptSet> = {
  entry: {
    title: 'Review last visit issues',
    insight: 'Garden Doors missed last two visits. Weed and Feed endcaps drove the best LGOR lift at nearby Home Depot stores this quarter.',
    prompts: ['Review last visit issues', 'Start guided mode', 'Explain scorecard sections'],
  },
  checklist: {
    title: 'Checklist guidance',
    insight: 'Grass Seed POG and secondary displays are the most-missed checks for this banner in Q1. Evidence is expected for failed display checks.',
    prompts: ['Explain this question', 'Why is this required?', 'Show compliant example', 'What failed last time?'],
  },
  offShelf: {
    title: 'Capture recommendations',
    insight: 'Prior-year sales and recent load-ins indicate the best upside comes from incremental endcap, fence line, and garden door placements with visible evidence.',
    prompts: ['Show top opportunities', 'Explain score impact', 'Why this SKU?', 'What failed last time?'],
  },
  photo: {
    title: 'Evidence review',
    insight: 'Required photos with visible SKU labels and clear feature framing are approved faster by compliance reviewers.',
    prompts: ['Which photos are still required?', 'Explain missing evidence', 'Show approved example'],
  },
  summary: {
    title: 'Score impact review',
    insight: 'The score improves meaningfully when repeated display gaps are closed and required evidence is complete before submit.',
    prompts: ['Explain score impact', 'Draft manager summary', 'List next actions'],
  },
}
