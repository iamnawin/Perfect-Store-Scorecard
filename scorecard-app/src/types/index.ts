// --- New MVP types ---

export type ChecklistAnswer = 'yes' | 'no' | 'partial' | 'na' | null

export type ScorecardVisitStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Submitted'
  | 'Revisit Required'
  | 'Retake In Progress'
  | 'Resolved'

export type RevisitStatus = 'Open' | 'In Progress' | 'Resolved' | 'Unable to Resolve'

export type RecommendationType =
  | 'missing'
  | 'not-enough'
  | 'empty-calories'
  | 'missing-map'
  | 'peak-week-gap'
  | 'capacity-gap'

export type QuantityUnit = 'eaches' | 'cases' | 'pallets' | 'estimated'

export type OffShelfItemStatus = 'active' | 'removed'

export interface BasePlanItem {
  id: string
  name: string
  type: 'standard' | 'display'
  location: string
  pointsMax: number
  guidance: string
}

export interface SkuProduct {
  id: string
  name: string
  category: string
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

export interface ConversionData {
  skuId: string
  unitsPerCase: number
  casesPerPallet: number
  unitsPerPallet: number
}

export interface DisplayCapacityData {
  location: string
  capacityUnits: number
}

export interface OffShelfEntry {
  id: string
  skuId: string
  productName: string
  location: string
  quantity: number
  unit: QuantityUnit
  calculatedUnits: number
  lgorPercent: number
  peakWeekUnits: number
  peakWeekRatio: number
  peakWeekMultiplier: number
  itemPoints: number
  notes: string
  status: OffShelfItemStatus
}

export interface OpportunityItem {
  skuId: string
  productName: string
  rank: number
  lgorPercent: number
  quarterlyUnits: number
  quarterlyDollarValue: number
  peakWeekUnits: number
  reason: string
}

export interface RecommendationItem {
  id: string
  type: RecommendationType
  severity: 'high' | 'medium' | 'low'
  sku?: string
  displayLocation?: string
  message: string
  currentValue?: string
  recommendedValue?: string
}

export interface RevisitItem {
  id: string
  reason: string
  sku?: string
  displayLocation?: string
  currentQuantity?: number
  recommendedQuantity?: number
  quantityGap?: number
  peakWeekUnits?: number
  displayCapacity?: number
  assignedOwner: string
  dueDate: string
  status: RevisitStatus
  notes: string
}

export interface ScorecardSnapshot {
  id: string
  takenAt: string
  submittedBy: string
  executionScore: number
  basePlanLgorPercent: number
  basePlanLgorPoints: number
  incrementalRawLgorPercent: number
  incrementalOffShelfPoints: number
  finalScore: number
  lgorRepPercent: number
  offShelfItemCount: number
}

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
  store: string
  rep: string
  issue: string
  sku: string
  peakWeekUnits: number
  currentQuantity: number
  gap: number
  revisitStatus: RevisitStatus
  owner: string
}

// --- Legacy types kept for backward compat with remaining components ---

export type ScorecardStatus = 'not-started' | 'in-progress' | 'ready-for-review' | 'completed'
export type StepState = 'completed' | 'in-progress' | 'pending' | 'locked'
export type OffShelfClassification = 'base-plan' | 'incremental' | 'not-sure'
export type VisitType = 'initial' | 'follow-up'
export type OffShelfOrigin = 'current-visit' | 'previous-visit'
export type OffShelfStatus = 'saved' | 'pending-review' | 'retained' | 'updated' | 'removed' | 'added'

export type AgentforceConfidence = 'high' | 'medium' | 'low'
export type AgentforceQuantityEstimate = 'small' | 'medium' | 'large' | 'unknown'
export type AgentforceSuggestionStatus = 'suggested' | 'needs_review'
export type AgentforceDisplayType = 'endcap' | 'stack' | 'shelf' | 'unknown'

export interface AgentforceSecondaryDisplayAnalysis {
  analysisStatus: 'success' | 'error'
  displayType: { value: AgentforceDisplayType; confidence: AgentforceConfidence }
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

export interface ChecklistState {
  [itemId: string]: ChecklistAnswer
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

export interface ScorecardSection {
  id: string
  title: string
  description: string
  route: string
  kind: 'checklist' | 'capture' | 'evidence' | 'review'
}

export interface LegacyOffShelfEntry {
  id: string
  location: string
  category: string
  skuId: string
  product: string
  quantity: number | string
  classification: OffShelfClassification
  photoCaptured: boolean
  photoName: string
  photoPreviewUrl: string
  caption: string
  notes: string
  estimatedLgor: number
  impactPoints: number
  multiplier: number
  multiplierLabel: string
  origin: OffShelfOrigin
  status: OffShelfStatus
}

export interface OffShelfProduct {
  id: string
  categoryId: string
  name: string
  subtitle: string
  size: string
  lgorPct: number
  isPriority: boolean
  impactScore: number
  imagePlaceholder: string
}

export interface EvidenceStateItem {
  captured: boolean
  note: string
  photoName: string
  photoPreviewUrl: string
}

export interface EvidenceState {
  [requirementId: string]: EvidenceStateItem
}

export interface EvidenceRequirement {
  id: string
  sectionId: string
  label: string
  guidance: string
  required: boolean
  group: 'map' | 'display' | 'promo'
}

export interface AppState {
  visitType: VisitType
  checklist: ChecklistState
  offShelf: LegacyOffShelfEntry[]
  evidence: EvidenceState
  notes: string
  submitted: boolean
  lastSavedAt: string | null
  agentforceEnabled: boolean
  secondaryDisplayImage: string | null
  agentforceAnalysis: AgentforceSecondaryDisplayAnalysis | null
}

// --- Trellis types kept for TrellisBot component ---

export type TrellisTone = 'info' | 'success' | 'warning' | 'critical'
export type TrellisActionIntent = 'primary' | 'secondary' | 'warning'

export interface TrellisMetric {
  label: string
  value: string | number
  delta?: string
  highlight?: boolean
  detail?: string
}

export interface TrellisDetailItem {
  label: string
  value: string
  badge?: string
  tone?: TrellisTone
}
