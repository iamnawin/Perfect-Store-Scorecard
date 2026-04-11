export type ChecklistAnswer = 'yes' | 'no' | 'na' | null
export type ScorecardStatus = 'not-started' | 'in-progress' | 'ready-for-review' | 'completed'
export type StepState = 'completed' | 'in-progress' | 'pending' | 'locked'
export type OffShelfClassification = 'base-plan' | 'incremental' | 'not-sure'
export type OffShelfStatus = 'saved'

export interface ChecklistState {
  [itemId: string]: ChecklistAnswer
}

export interface ChecklistQuestion {
  id: string
  sectionId: string
  category: string
  title: string
  guidance: string
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
  caption: string
  notes: string
  estimatedLgor: number
  impactPoints: number
  multiplier: number
  multiplierLabel: string
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
}

export interface EvidenceState {
  [itemId: string]: EvidenceStateItem
}

export interface TrellisPromptSet {
  title: string
  insight: string
  prompts: string[]
}

export interface AppState {
  checklist: ChecklistState
  offShelf: OffShelfEntry[]
  offShelfConfirmed: boolean
  evidence: EvidenceState
  notes: string
  revisitRequired: boolean
  shelfResetNeeded: boolean
  lastSavedAt: string | null
  submitted: boolean
  trellisEnabled: boolean
}
