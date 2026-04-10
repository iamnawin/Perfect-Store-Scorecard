import { createContext } from 'react'
import type { AppState, ChecklistAnswer, OffShelfEntry } from '../types'

export interface AppContextValue extends AppState {
  setChecklistAnswer: (itemId: string, answer: ChecklistAnswer) => void
  addOffShelfEntry: (entry: OffShelfEntry) => void
  removeOffShelfEntry: (id: string) => void
  setPhotoCaption: (v: string) => void
  setNotes: (v: string) => void
  setRevisitRequired: (v: boolean) => void
  setShelfResetNeeded: (v: boolean) => void
  toggleTrellis: () => void
  executionScore: number
  totalScore: number
  lgorPct: number
  riskDelta: number
}

export const AppContext = createContext<AppContextValue | null>(null)
