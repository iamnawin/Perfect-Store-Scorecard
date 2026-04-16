export type ChecklistAnswer = 'yes' | 'no' | 'na' | null
export type ScorecardStatus = 'not-started' | 'in-progress' | 'ready-for-review' | 'completed'
export type StepState = 'completed' | 'in-progress' | 'pending' | 'locked'
export type OffShelfClassification = 'base-plan' | 'incremental' | 'not-sure'
export type VisitType = 'initial' | 'follow-up'
export type OffShelfStatus = 'saved' | 'pending-review' | 'retained' | 'updated' | 'removed' | 'added'
export type OffShelfOrigin = 'current-visit' | 'previous-visit'

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

export interface OffShelfEntry {
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
  recommendedLocations: string[]
  basePoints: number
  baseLgor: number
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

export interface AppState {
  visitType: VisitType
  checklist: ChecklistState
  questionNotes: QuestionNotesState
  offShelf: OffShelfEntry[]
  offShelfConfirmed: boolean
  evidence: EvidenceState
  notes: string
  revisitRequired: boolean
  shelfResetNeeded: boolean
  lastSavedAt: string | null
  submitted: boolean
  agentforceEnabled: boolean
  toast: AppToast | null
  celebration: SubmissionCelebration | null
}
