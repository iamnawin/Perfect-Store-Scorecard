import { useState, type ReactNode } from 'react'
import type { AppState, ChecklistAnswer, OffShelfEntry } from '../types'
import { AppContext } from './app-context'
import {
  createInitialEvidenceState,
  getAnsweredChecks,
  getCapturedRequiredPhotos,
  getCompletionPercent,
  getExecutionScore,
  getLgorPct,
  getRequiredPhotoCount,
  getRiskDelta,
  getScorecardStatus,
  getTotalChecks,
  getTotalScore,
  getTotalSections,
} from '../lib/scorecard'

export function AppProvider({ children }: { children: ReactNode }) {
  const [checklist, setChecklist] = useState<AppState['checklist']>({})
  const [offShelf, setOffShelf] = useState<OffShelfEntry[]>([])
  const [offShelfConfirmed, setOffShelfConfirmed] = useState(false)
  const [evidence, setEvidence] = useState<AppState['evidence']>(() => createInitialEvidenceState())
  const [notes, setNotes] = useState('')
  const [revisitRequired, setRevisitRequired] = useState(false)
  const [shelfResetNeeded, setShelfResetNeeded] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [trellisEnabled, setTrellisEnabled] = useState(false)

  function setChecklistAnswer(itemId: string, answer: ChecklistAnswer) {
    setChecklist(prev => ({ ...prev, [itemId]: answer }))
  }

  function addOffShelfEntry(entry: OffShelfEntry) {
    setOffShelfConfirmed(true)
    setOffShelf(prev => [...prev, entry])
  }

  function updateOffShelfEntry(entry: OffShelfEntry) {
    setOffShelfConfirmed(true)
    setOffShelf(prev => prev.map(existing => existing.id === entry.id ? entry : existing))
  }

  function duplicateOffShelfEntry(id: string) {
    setOffShelfConfirmed(true)
    setOffShelf(prev => {
      const target = prev.find(entry => entry.id === id)
      if (!target) return prev

      return [
        ...prev,
        {
          ...target,
          id: crypto.randomUUID(),
        },
      ]
    })
  }

  function removeOffShelfEntry(id: string) {
    setOffShelf(prev => prev.filter(entry => entry.id !== id))
  }

  function confirmOffShelfReview() {
    setOffShelfConfirmed(true)
  }

  function setEvidenceCaptured(itemId: string, captured: boolean) {
    setEvidence(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        captured,
        note: captured && !prev[itemId]?.note ? 'Captured during active visit.' : prev[itemId]?.note ?? '',
        photoName: captured ? prev[itemId]?.photoName ?? '' : '',
        photoPreviewUrl: captured ? prev[itemId]?.photoPreviewUrl ?? '' : '',
      },
    }))
  }

  function setEvidencePhoto(itemId: string, file: File | null) {
    setEvidence(prev => {
      const current = prev[itemId]

      if (current?.photoPreviewUrl) {
        URL.revokeObjectURL(current.photoPreviewUrl)
      }

      if (!file) {
        return {
          ...prev,
          [itemId]: {
            ...current,
            captured: false,
            note: current?.note ?? '',
            photoName: '',
            photoPreviewUrl: '',
          },
        }
      }

      return {
        ...prev,
        [itemId]: {
          ...current,
          captured: true,
          note: current?.note || `Captured during active visit: ${file.name}`,
          photoName: file.name,
          photoPreviewUrl: URL.createObjectURL(file),
        },
      }
    })
  }

  function setEvidenceNote(itemId: string, note: string) {
    setEvidence(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        note,
      },
    }))
  }

  function saveDraft() {
    setLastSavedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
  }

  function submitScorecard() {
    setSubmitted(true)
    saveDraft()
  }

  function toggleTrellis() {
    setTrellisEnabled(prev => !prev)
  }

  const appState: AppState = {
    checklist,
    offShelf,
    offShelfConfirmed,
    evidence,
    notes,
    revisitRequired,
    shelfResetNeeded,
    lastSavedAt,
    submitted,
    trellisEnabled,
  }

  const answeredChecks = getAnsweredChecks(checklist)
  const totalChecks = getTotalChecks()
  const totalSections = getTotalSections()
  const requiredPhotos = getRequiredPhotoCount()
  const capturedRequiredPhotos = getCapturedRequiredPhotos(evidence)
  const completionPercent = getCompletionPercent(appState)
  const scorecardStatus = getScorecardStatus(appState)
  const executionScore = getExecutionScore(checklist)
  const totalScore = getTotalScore(appState)
  const lgorPct = getLgorPct(appState)
  const riskDelta = getRiskDelta(appState)

  return (
    <AppContext.Provider value={{
      checklist,
      offShelf,
      offShelfConfirmed,
      evidence,
      notes,
      revisitRequired,
      shelfResetNeeded,
      lastSavedAt,
      submitted,
      trellisEnabled,
      setChecklistAnswer,
      addOffShelfEntry,
      updateOffShelfEntry,
      duplicateOffShelfEntry,
      removeOffShelfEntry,
      confirmOffShelfReview,
      setEvidenceCaptured,
      setEvidencePhoto,
      setEvidenceNote,
      setNotes,
      setRevisitRequired,
      setShelfResetNeeded,
      saveDraft,
      submitScorecard,
      toggleTrellis,
      answeredChecks,
      totalChecks,
      totalSections,
      requiredPhotos,
      capturedRequiredPhotos,
      completionPercent,
      scorecardStatus,
      executionScore,
      totalScore,
      lgorPct,
      riskDelta,
    }}>
      {children}
    </AppContext.Provider>
  )
}
