export type ChecklistAnswer = 'yes' | 'no' | 'partial' | 'na' | null
export type ScorecardStatus = 'not-started' | 'in-progress' | 'ready-for-review' | 'completed'
export type ScorecardVersionStatus = 'Draft' | 'Submitted' | 'Revisit Draft' | 'Revisit Submitted'
export type PerfectStoreScorecardStatus = 'Draft' | 'Active' | 'Closed' | 'Expired'
export type UserRole = 'ops' | 'admin' | 'sales-manager' | 'rep' | 'field-user'
export type StepState = 'completed' | 'in-progress' | 'pending' | 'locked'
export type OffShelfClassification = 'base-plan' | 'incremental' | 'not-sure'
export type VisitType = 'initial' | 'follow-up'
export type OffShelfStatus = 'saved' | 'pending-review' | 'retained' | 'updated' | 'removed' | 'added'
export type OffShelfOrigin = 'current-visit' | 'previous-visit'
export type RevisitChangeType = 'Improved' | 'Declined' | 'No Change' | 'New' | 'Removed'

export type PriorityTag = 'High' | 'Medium' | 'Low'
export type MultiplierTag = '2x' | '3x' | null
export type PlanType = 'Base Plan' | 'Incremental'
export type RiskLevel = 'High' | 'Medium' | 'Low' | 'None'
export type UploadSource = 'Map' | 'ChecklistPhoto' | 'OffShelfPhoto'
export type ChatterPostStatus = 'Not Posted' | 'Posting' | 'Posted' | 'Failed'

export interface UploadedFile {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  localPreviewUrl: string
  uploadedAt: string
  source: UploadSource
  fileObject?: File
  remoteUrl?: string
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

export interface CalculationTrace {
  label: string
  value: string | number
  reason: string
  inputData?: Record<string, any>
}

export interface OffShelfEntry {
  id: string
  location: string
  category: string
  skuId: string
  product: string
  quantity: number | string
  quantityUnit?: 'eaches' | 'cases' | 'pallets' | 'lot-bulk'
  calculatedOffShelfUnits?: number
  quantityEstimate?: boolean
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
  priorityTag?: PriorityTag
  multiplierTag?: MultiplierTag
  planType?: PlanType
  riskLevel?: RiskLevel
  opportunityTag?: boolean
  peakWeekTag?: boolean
  clusterMatch?: boolean
  tags?: string[]
  tagExplanations?: Record<string, string>
  multiplierExplanation?: string
  riskExplanation?: string
  opportunityExplanation?: string
  scoreImpactExplanation?: string
  calculationTraces?: CalculationTrace[]
  displayFactor?: number
  quantityFactor?: number
  baseImpact?: number
}

export interface RecalculatedScorecard {
  executionScore: number
  basePlanScore: number
  incrementalScore: number
  combinedScore: number
  opportunityScore: number
  riskSummary: RiskLevel
  offShelfItemsWithScoreImpact: OffShelfEntry[]
  calculationTrace: {
    execution: CalculationTrace[]
    basePlan: CalculationTrace[]
    incremental: CalculationTrace[]
    total: CalculationTrace[]
  }
}

export interface UserContext {
  id: string
  name: string
  role: UserRole
}

export interface PerfectStoreScorecard {
  id: string
  name: string
  quarter: string
  fiscalYear: number
  season: string
  status: PerfectStoreScorecardStatus
  activeFlag: boolean
  publishedBy: string
  publishedDate: string | null
  effectiveStartDate: string
  effectiveEndDate: string
  storePlanMapId: string
  storePlanMapStatus?: 'Missing' | 'Uploaded' | 'Validated' | 'Published'
  planVersion: string
  createdByOps: boolean
  lockedForFieldUsers: boolean
}

export type ActivePerfectStoreScorecardResult =
  | {
      state: 'active'
      scorecard: PerfectStoreScorecard
      message: string
    }
  | {
      state: 'no-active-scorecard' | 'data-integrity-error'
      scorecard: null
      message: string
    }

export interface ScorecardVersionItem {
  id: string
  scorecardId: string
  skuId: string
  skuName: string
  category: string
  previousValue: string | number | boolean | null
  currentValue: string | number | boolean | null
  changed: boolean
  changeType: RevisitChangeType
  quantityPrevious: number | string | null
  quantityCurrent: number | string | null
  offShelfPrevious: boolean
  offShelfCurrent: boolean
  executionPrevious: string | null
  executionCurrent: string | null
  recommendationPrevious: string
  recommendationCurrent: string
  scorePrevious: number
  scoreCurrent: number
}

export interface ScorecardVersionRecord {
  id: string
  storeId: string
  storeName: string
  quarter: string
  fiscalYear: number
  season: string
  scorecardStatus: ScorecardVersionStatus
  versionNumber: number
  parentScorecardId?: string
  sourceScorecardId?: string
  isRevisit: boolean
  createdAt: string
  submittedAt: string | null
  submittedBy: string
  previousScore: number | null
  currentScore: number
  scoreDelta: number
  executionScore: number
  basePlanScore: number
  incrementalScore: number
  combinedScore: number
  revisitNotes: string
  revisitReason: string
  changedFieldsSummary: string[]
  items: ScorecardVersionItem[]
  chatterPostStatus: ChatterPostStatus
  chatterPostId?: string
  mapUpload?: UploadedFile | null
  photos?: UploadedFile[]
  scoreExplanations?: {
    execution: CalculationTrace[]
    basePlan: CalculationTrace[]
    incremental: CalculationTrace[]
    total: CalculationTrace[]
  }
}

export interface RevisitComparisonCard {
  id: string
  label: string
  previous: string
  current: string
  change: RevisitChangeType
}

export interface RevisitComparisonSummary {
  previousCombinedScore: number
  currentCombinedScore: number
  scoreDelta: number
  executionScoreDelta: number
  basePlanScoreDelta: number
  incrementalScoreDelta: number
  improvedItems: ScorecardVersionItem[]
  declinedItems: ScorecardVersionItem[]
  noChangeItems: ScorecardVersionItem[]
  newItems: ScorecardVersionItem[]
  removedItems: ScorecardVersionItem[]
  notes: string
  submittedAt: string | null
  cards: RevisitComparisonCard[]
}

export type RecommendationType = 'missing' | 'not-enough' | 'empty-calories' | 'missing-map' | 'demand-gap'

export interface Recommendation {
  type: RecommendationType
  severity: 'high' | 'medium' | 'low'
  message: string
  skuId?: string
  displayLocation?: string
}

export interface OffShelfProduct {
  id: string
  skuNumber?: string
  categoryId: string
  name: string
  subtitle: string
  quarterlySalesValue?: number
  recommendedLocations: string[]
  basePoints: number
  baseLgor: number
  peakWeekUnits: number
  unitsPerCase?: number
  unitsPerPallet?: number
  casesPerPallet?: number
}

export interface OffShelfRecommendation {
  skuId: string
  location: string
  quantity: number | string
  potentialPoints: number
  rationale: string
}

export interface EvidenceRequirement {
  id: string
  title: string
  required: boolean
  relevance: string
  linkedQuestionIds: string[]
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

export interface AppToast {
  id: number
  title: string
  message: string
}

export interface SubmissionCelebration {
  id: number
  title: string
  message: string
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

export interface TrellisVisitBriefing {
  lastVisitScore: number
  regionAverage: number
  repeatedGap: string
  topOpportunity: string
  suggestedFocus: string
  focusReason: string
}

export interface TrellisChecklistSuggestion {
  issue: string
  impactLabel: string
  suggestedFix: string
  estimatedGainLabel: string
  action: TrellisAction
  route: string
  supportingText?: string
}

export interface TrellisOffShelfInsight {
  title: string
  impactLabel: string
  lgorLabel: string
  suggestedNextMove: string
  supportingText: string
  tone: TrellisTone
}

export interface TrellisTopRecommendation {
  title: string
  summary: string
  impactLabel: string
  reason: string
  actionLabel: string
  route: string
  tone: TrellisTone
}

export interface TrellisRevisitIntelligence {
  title: string
  summary: string
  statusLabel: string
  tone: TrellisTone
  items: TrellisDetailItem[]
  footer: string
}

export interface TrellisManagerSummaryDraft {
  title: string
  summary: string
  narrative: string
  highlights: TrellisDetailItem[]
}

export interface TrellisSummaryInsight {
  scoreDelta: number
  mainPositiveDriver: string
  biggestMissedOpportunity: string
  nextVisitFocus: string
  narrative: string
}

export interface LeaderboardEntry {
  rank: number
  store: string
  rep: string
  score: number
  delta: number
}

export interface CsvUploadSummary {
  fileName: string
  rowsLoaded: number
  currentStoreMatch: {
    found: boolean
    matchedStoreCode: string
    matchedStoreName: string
    matchedCluster: string
    matchingSkusCount: number
  }
  dataAvailability: {
    basePlanSkus: boolean
    incrementalSkus: boolean
    lgorData: boolean
    peakWeekData: boolean
    multiplierData: boolean
  }
  debugDetails: {
    totalStores: number
    totalSkus: number
    totalRows: number
  }
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
  revisitReason: string
  revisitRequired: boolean
  shelfResetNeeded: boolean
  lastSavedAt: string | null
  submitted: boolean
  agentforceEnabled: boolean
  toast: AppToast | null
  celebration: SubmissionCelebration | null
  scorecardVersion: ScorecardVersionRecord
  sourceScorecard: ScorecardVersionRecord
  versionHistory: ScorecardVersionRecord[]
  revisitComparison: RevisitComparisonSummary | null
  activeScorecardResult: ActivePerfectStoreScorecardResult
  storePlanMap: UploadedFile | null
  csvSummary: CsvUploadSummary | null
}
