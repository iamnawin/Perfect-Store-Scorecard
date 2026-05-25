import { createContext } from 'react'
import type {
  ChecklistAnswer,
  OffShelfEntry,
  QuantityUnit,
  RevisitItem,
  RevisitStatus,
  ScorecardSnapshot,
  ScorecardVisitStatus,
  AppToast,
  AppCelebration,
} from '../types'

export interface AppContextValue {
  // Visit state
  visitStatus: ScorecardVisitStatus
  quarter: string
  visitDate: string

  // Execution (Base Plan)
  executionAnswers: Record<string, ChecklistAnswer>
  executionNotes: Record<string, string>
  setExecutionAnswer: (itemId: string, answer: ChecklistAnswer) => void
  setExecutionNote: (itemId: string, note: string) => void

  // Computed scores
  executionScore: number
  basePlanLgorPoints: number
  incrementalOffShelfPoints: number
  incrementalRawLgorPercent: number
  finalScore: number
  lgorRepPercent: number

  // Off-shelf
  offShelfItems: OffShelfEntry[]
  offShelfConfirmed: boolean
  addOffShelfItem: (skuId: string, displayLocation: string, quantity: number, quantityUnit: QuantityUnit, notes?: string) => void
  removeOffShelfItem: (id: string) => void
  confirmOffShelf: () => void

  // Revisit
  revisitRequired: boolean
  revisitItems: RevisitItem[]
  setRevisitRequired: (value: boolean) => void
  addRevisitItem: (item: Omit<RevisitItem, 'id'>) => void
  updateRevisitItemStatus: (id: string, status: RevisitStatus) => void

  // Submission
  notes: string
  setNotes: (notes: string) => void
  submitted: boolean
  lastSavedAt: string | null
  submitScorecard: () => void
  saveDraft: () => void

  // Snapshots (for retake comparison)
  snapshots: ScorecardSnapshot[]

  // UI
  toast: AppToast | null
  celebration: AppCelebration | null
  showToast: (title: string, message: string) => void
}

export const AppContext = createContext<AppContextValue | null>(null)
