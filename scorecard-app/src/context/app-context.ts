import { createContext } from 'react'
import type { AppState, ChecklistAnswer, OffShelfEntry, ScorecardStatus, VisitType, UploadedFile, ChatterPostStatus } from '../types'

export interface AppContextValue extends AppState {
  setVisitType: (visitType: VisitType) => void
  setChecklistAnswer: (itemId: string, answer: ChecklistAnswer) => void
  setQuestionNote: (itemId: string, note: string) => void
  addOffShelfEntry: (entry: OffShelfEntry) => void
  updateOffShelfEntry: (entry: OffShelfEntry) => void
  duplicateOffShelfEntry: (id: string) => void
  removeOffShelfEntry: (id: string) => void
  setEvidenceCaptured: (itemId: string, captured: boolean) => void
  setEvidencePhoto: (itemId: string, file: File | null) => void
  setEvidenceNote: (itemId: string, note: string) => void
  setSecondaryDisplayImage: (file: File | null) => void
  setAudioNoteFile: (file: File | null) => void
  setNotes: (v: string) => void
  setRevisitReason: (v: string) => void
  setRevisitRequired: (v: boolean) => void
  setShelfResetNeeded: (v: boolean) => void
  createRevisitFromSubmitted: () => void
  saveDraft: () => void
  submitScorecard: () => void
  postScorecardToChatter: () => void
  uploadStorePlanMap: (files: File[]) => void
  removeStorePlanMap: (id: string) => void
  uploadEvidencePhoto: (itemId: string, files: File[]) => void
  removeEvidencePhoto: (itemId: string) => void
  uploadOffShelfPhoto: (entryId: string, files: File[]) => void
  removeOffShelfPhoto: (entryId: string) => void
  setAgentforceEnabled: (value: boolean) => void
  showToast: (title: string, message: string) => void
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
  chatterPostStatus: ChatterPostStatus
  uploadedFiles: UploadedFile[]
}

export const AppContext = createContext<AppContextValue | null>(null)
