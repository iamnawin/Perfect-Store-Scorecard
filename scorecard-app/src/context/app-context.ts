import { createContext } from 'react'
import type { AppState, ChecklistAnswer, OffShelfEntry, ScorecardStatus } from '../types'

export interface AppContextValue extends AppState {
  setChecklistAnswer: (itemId: string, answer: ChecklistAnswer) => void
  setQuestionNote: (itemId: string, note: string) => void
  addOffShelfEntry: (entry: OffShelfEntry) => void
  updateOffShelfEntry: (entry: OffShelfEntry) => void
  duplicateOffShelfEntry: (id: string) => void
  removeOffShelfEntry: (id: string) => void
  confirmOffShelfReview: () => void
  setEvidenceCaptured: (itemId: string, captured: boolean) => void
  setEvidencePhoto: (itemId: string, file: File | null) => void
  setEvidenceNote: (itemId: string, note: string) => void
  setNotes: (v: string) => void
  setRevisitRequired: (v: boolean) => void
  setShelfResetNeeded: (v: boolean) => void
  saveDraft: () => void
  submitScorecard: () => void
  toggleTrellis: () => void
  answeredChecks: number
  totalChecks: number
  totalSections: number
  requiredPhotos: number
  capturedRequiredPhotos: number
  completionPercent: number
  scorecardStatus: ScorecardStatus
  executionScore: number
  totalScore: number
  lgorPct: number
  riskDelta: number
}

export const AppContext = createContext<AppContextValue | null>(null)
