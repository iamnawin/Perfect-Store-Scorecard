import { createContext } from 'react'
import type {
  ChecklistAnswer,
  OffShelfEntry,
  RevisitItem,
  RevisitStatus,
  ScorecardSnapshot,
  ScorecardVisitStatus,
} from '../types'

export interface ToastMessage {
  title: string
  message: string
}

export interface AppContextValue {
  // Visit state
  visitStatus: ScorecardVisitStatus
  quarter: string
  visitDate: string

  // Execution answers and notes
  executionAnswers: Record<string, ChecklistAnswer>
  executionNotes: Record<string, string>
  setExecutionAnswer: (itemId: string, answer: ChecklistAnswer) => void
  setExecutionNote: (itemId: string, note: string) => void

  // Computed scores (derived on each render)
  executionScore: number
  basePlanLgorPoints: number
  incrementalOffShelfPoints: number
  incrementalRawLgorPercent: number
  finalScore: number
  lgorRepPercent: number

  // Off-shelf items
  offShelfItems: OffShelfEntry[]
  addOffShelfItem: (entry: OffShelfEntry) => void
  removeOffShelfItem: (id: string) => void
  confirmOffShelf: () => void

  // Revisit
  revisitRequired: boolean
  revisitItems: RevisitItem[]
  setRevisitRequired: (v: boolean) => void
  addRevisitItem: (item: RevisitItem) => void
  updateRevisitItemStatus: (id: string, status: RevisitStatus) => void

  // Submission
  notes: string
  submitted: boolean
  lastSavedAt: string | null
  snapshots: ScorecardSnapshot[]
  setNotes: (v: string) => void
  submitScorecard: () => void
  saveDraft: () => void

  // UI
  toast: ToastMessage | null
  celebration: boolean
  showToast: (title: string, message: string) => void
}

export const AppContext = createContext<AppContextValue | null>(null)
