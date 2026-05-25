// ── Execution answer types ───────────────────────────────────────────────────
export type ChecklistAnswer = 'yes' | 'no' | 'partial' | 'na' | null
export type ExecutionItemType = 'standard' | 'display'

// ── Visit / Scorecard status ──────────────────────────────────────────────────
export type ScorecardVisitStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Submitted'
  | 'Revisit Required'
  | 'Retake In Progress'
  | 'Resolved'

// ── Recommendation types ──────────────────────────────────────────────────────
export type RecommendationType =
  | 'missing'
  | 'not-enough'
  | 'empty-calories'
  | 'missing-map'
  | 'peak-week-gap'
  | 'capacity-gap'

export type RecommendationSeverity = 'high' | 'medium' | 'low'

// ── Revisit ───────────────────────────────────────────────────────────────────
export type RevisitStatus = 'Open' | 'In Progress' | 'Resolved' | 'Unable to Resolve'

// ── Quantity units ────────────────────────────────────────────────────────────
export type QuantityUnit = 'eaches' | 'cases' | 'pallets' | 'estimated'

// ── Off-shelf status ──────────────────────────────────────────────────────────
export type OffShelfStatus = 'saved' | 'removed'

// ── Base Plan execution item ──────────────────────────────────────────────────
export interface BasePlanItem {
  id: string
  itemName: string
  itemType: ExecutionItemType
  requiredLocation: string
  requiredSkus?: string[]
  possiblePoints: number
  guidance: string
}

// ── SKU / Product ─────────────────────────────────────────────────────────────
export interface SkuProduct {
  id: string
  sku: string
  productName: string
  category: string
  productSize: string
  lgorPercent: number
  quarterlyUnits: number
  quarterlyDollarValue: number
  peakWeekUnits: number
  rank: number
  unitsPerCase: number
  casesPerPallet: number
  unitsPerPallet: number
  isRecommended: boolean
}

// ── Conversion data ───────────────────────────────────────────────────────────
export interface ConversionData {
  skuId: string
  unitsPerCase: number
  casesPerPallet: number
  unitsPerPallet: number
}

// ── Display capacity ──────────────────────────────────────────────────────────
export interface DisplayCapacity {
  location: string
  capacityUnits: number
  rackingDepth: number
}

// ── Off-shelf entry ───────────────────────────────────────────────────────────
export interface OffShelfEntry {
  id: string
  displayLocation: string
  productCategory: string
  skuId: string
  product: string
  quantity: number
  quantityUnit: QuantityUnit
  calculatedUnits: number
  lgorPercent: number
  peakWeekUnits: number
  peakWeekRatio: number
  peakWeekMultiplier: number
  points: number
  isIncremental: boolean
  notes: string
  photoIds: string[]
  status: OffShelfStatus
}

// ── Opportunity item ──────────────────────────────────────────────────────────
export interface OpportunityItem {
  skuId: string
  productName: string
  rank: number
  lgorPercent: number
  quarterlyUnits: number
  quarterlyDollarValue: number
  peakWeekUnits: number
  recommendedAction: string
}

// ── Recommendation ────────────────────────────────────────────────────────────
export interface RecommendationItem {
  id: string
  type: RecommendationType
  severity: RecommendationSeverity
  skuId?: string
  displayLocation?: string
  message: string
  currentValue?: number
  recommendedValue?: number
  status: 'active' | 'dismissed'
}

// ── Revisit item ──────────────────────────────────────────────────────────────
export interface RevisitItem {
  id: string
  skuId?: string
  displayLocation?: string
  reason: string
  currentQuantity?: number
  recommendedQuantity?: number
  quantityGap?: number
  peakWeekUnits?: number
  displayCapacity?: number
  assignedOwner?: string
  dueDate?: string
  status: RevisitStatus
  notes: string
}

// ── Scorecard snapshot (for retake comparison) ────────────────────────────────
export interface ScorecardSnapshot {
  snapshotId: string
  submittedAt: string
  executionScore: number
  basePlanLgorPercent: number
  basePlanLgorPoints: number
  incrementalRawLgorPercent: number
  incrementalOffShelfPoints: number
  finalScore: number
  lgorRepPercent: number
}

// ── UI feedback ───────────────────────────────────────────────────────────────
export interface AppToast {
  id: number
  title: string
  message: string
}

export interface AppCelebration {
  id: number
  title: string
  message: string
}

// ── Leaderboard / Manager ─────────────────────────────────────────────────────
export interface LeaderboardEntry {
  rank: number
  store: string
  rep: string
  score: number
  lgorRepPercent: number
  delta: number
  openRevisitCount: number
}

export interface FlaggedStore {
  storeId: string
  storeName: string
  score: number
  lgorRepPercent: number
  issue: string
  skuId?: string
  peakWeekUnits?: number
  currentQuantity?: number
  gap?: number
  revisitStatus: RevisitStatus
  owner?: string
}

// ── Legacy types kept for backward compat ────────────────────────────────────
export type ChecklistState = Record<string, ChecklistAnswer>
export type StepState = 'completed' | 'in-progress' | 'pending' | 'locked'
export type ScorecardStatus = 'not-started' | 'in-progress' | 'ready-for-review' | 'completed'
export type VisitType = 'initial' | 'follow-up'
export type OffShelfClassification = 'base-plan' | 'incremental' | 'not-sure'
export type OffShelfOrigin = 'current-visit' | 'previous-visit'

export interface OffShelfProduct {
  id: string
  categoryId: string
  name: string
  subtitle: string
  recommendedLocations: string[]
  basePoints: number
  baseLgor: number
  peakWeekUnits: number
}

export interface EvidenceStateItem {
  captured: boolean
  note: string
  photoName: string
  photoPreviewUrl: string
}

export interface EvidenceState {
  [itemId: string]: EvidenceStateItem
}

export interface EvidenceRequirement {
  id: string
  title: string
  required: boolean
  relevance: string
  linkedQuestionIds: string[]
}

export interface ScorecardSection {
  id: string
  title: string
  description: string
  route: string
  kind: string
}

export interface ChecklistQuestion {
  id: string
  sectionId: string
  group: 'map' | 'pog' | 'display'
  category: string
  title: string
  guidance: string
  businessWhy: string
  weight: number
  icon: 'shelf' | 'alert' | 'display' | 'camera'
}

export interface QuestionNotesState {
  [itemId: string]: string
}

export interface TrellisPromptSet {
  title: string
  insight: string
  prompts: string[]
}

export type TrellisTone = 'info' | 'success' | 'warning'
export type TrellisActionIntent = 'primary' | 'secondary' | 'warning'

export interface OffShelfRecommendation {
  skuId: string
  location: string
  quantity: number | string
  potentialPoints: number
  rationale: string
}

export type AgentforceConfidence = 'high' | 'medium' | 'low'
export type AgentforceQuantityEstimate = 'small' | 'medium' | 'large' | 'unknown'
export type AgentforceSuggestionStatus = 'suggested' | 'needs_review'
export type AgentforceDisplayType = 'endcap' | 'stack' | 'shelf' | 'unknown'

export interface AgentforceSecondaryDisplayAnalysis {
  analysisStatus: 'success' | 'error'
  displayType: {
    value: AgentforceDisplayType
    confidence: AgentforceConfidence
  }
  products: Array<{
    productName: string
    brand: string
    matchedCatalog: boolean
    confidence: AgentforceConfidence
    quantityEstimate: AgentforceQuantityEstimate
    status: AgentforceSuggestionStatus
  }>
  notes: string[]
}

export interface AppState {
  visitType: VisitType
  checklist: ChecklistState
  questionNotes: QuestionNotesState
  offShelf: OffShelfEntry[]
  offShelfConfirmed: boolean
  evidence: EvidenceState
  secondaryDisplayImage: File | null
  audioNoteFile: File | null
  notes: string
  revisitRequired: boolean
  shelfResetNeeded: boolean
  lastSavedAt: string | null
  submitted: boolean
  agentforceEnabled: boolean
  toast: AppToast | null
  celebration: AppCelebration | null
}

export interface TrellisMetric {
  label: string
  value: string
  detail?: string
}

export interface TrellisDetailItem {
  label: string
  value: string
  tone?: TrellisTone
}

export interface TrellisAction {
  label: string
  intent?: TrellisActionIntent
}
