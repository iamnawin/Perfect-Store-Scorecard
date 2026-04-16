import { useState, type ReactNode } from 'react'
import type { AppState, ChecklistAnswer, OffShelfEntry, VisitType } from '../types'
import { AppContext } from './app-context'
import { previousOffShelfSeed } from '../data/mock'
import {
  estimateOffShelfImpact,
  createInitialEvidenceState,
  getAnsweredChecks,
  getCapturedRequiredPhotos,
  getCompletionPercent,
  getExecutionScore,
  getLgorPct,
  getOffShelfProductById,
  getRequiredPhotoCount,
  getRiskDelta,
  getScorecardStatus,
  getTotalChecks,
  getTotalScore,
  getTotalSections,
} from '../lib/scorecard'

function createFollowUpSeedEntries(): OffShelfEntry[] {
  return previousOffShelfSeed.flatMap(seed => {
    const product = getOffShelfProductById(seed.skuId)
    if (!product) return []
    const categoryLabel = {
      'grass-seed': 'Grass Seed',
      'plant-food': 'Plant Food',
      'weed-feed': 'Weed & Feed',
      chemical: 'Chemical',
      'indoor-soil': 'Indoor Soil',
      'outdoor-soil': 'Outdoor Soil',
    }[product.categoryId] ?? product.categoryId

    const impact = estimateOffShelfImpact({
      product,
      location: seed.location,
      quantity: seed.quantity,
      classification: seed.classification,
    })

    return [{
      id: crypto.randomUUID(),
      location: seed.location,
      category: categoryLabel,
      skuId: product.id,
      product: product.name,
      quantity: seed.quantity,
      classification: seed.classification,
      photoCaptured: false,
      photoName: '',
      photoPreviewUrl: '',
      caption: seed.caption,
      notes: seed.notes,
      estimatedLgor: impact.estimatedLgor,
      impactPoints: impact.impactPoints,
      multiplier: impact.multiplier,
      multiplierLabel: impact.multiplierLabel,
      origin: 'previous-visit',
      status: 'pending-review',
    }]
  })
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [visitType, setVisitTypeState] = useState<VisitType>('initial')
  const [checklist, setChecklist] = useState<AppState['checklist']>({})
  const [questionNotes, setQuestionNotes] = useState<AppState['questionNotes']>({})
  const [offShelf, setOffShelf] = useState<OffShelfEntry[]>([])
  const [offShelfConfirmed, setOffShelfConfirmed] = useState(false)
  const [evidence, setEvidence] = useState<AppState['evidence']>(() => createInitialEvidenceState())
  const [notes, setNotes] = useState('')
  const [revisitRequired, setRevisitRequired] = useState(false)
  const [shelfResetNeeded, setShelfResetNeeded] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [agentforceEnabled, setAgentforceEnabled] = useState(false)

  function setVisitType(nextVisitType: VisitType) {
    setVisitTypeState(nextVisitType)
    setChecklist({})
    setQuestionNotes({})
    setOffShelf(nextVisitType === 'follow-up' ? createFollowUpSeedEntries() : [])
    setOffShelfConfirmed(false)
    setEvidence(createInitialEvidenceState())
    setNotes('')
    setRevisitRequired(false)
    setShelfResetNeeded(false)
    setLastSavedAt(null)
    setSubmitted(false)
  }

  function setChecklistAnswer(itemId: string, answer: ChecklistAnswer) {
    setChecklist(prev => ({ ...prev, [itemId]: answer }))
  }

  function setQuestionNote(itemId: string, note: string) {
    setQuestionNotes(prev => ({ ...prev, [itemId]: note }))
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
          origin: 'current-visit',
          status: visitType === 'follow-up' ? 'added' : 'saved',
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
    if (!file) {
      setEvidence(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          captured: false,
          note: prev[itemId]?.note ?? '',
          photoName: '',
          photoPreviewUrl: '',
        },
      }))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setEvidence(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          captured: true,
          note: prev[itemId]?.note || `Captured during active visit: ${file.name}`,
          photoName: file.name,
          photoPreviewUrl: result,
        },
      }))
    }
    reader.readAsDataURL(file)
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

  const appState: AppState = {
    visitType,
    checklist,
    questionNotes,
    offShelf,
    offShelfConfirmed,
    evidence,
    notes,
    revisitRequired,
    shelfResetNeeded,
    lastSavedAt,
    submitted,
    agentforceEnabled,
  }

  const answeredChecks = getAnsweredChecks(checklist)
  const totalChecks = getTotalChecks()
  const totalSections = getTotalSections(visitType)
  const requiredPhotos = getRequiredPhotoCount()
  const capturedRequiredPhotos = getCapturedRequiredPhotos(evidence, offShelf)
  const completionPercent = getCompletionPercent(appState)
  const scorecardStatus = getScorecardStatus(appState)
  const executionScore = getExecutionScore(checklist)
  const totalScore = getTotalScore(appState)
  const lgorPct = getLgorPct(appState)
  const riskDelta = getRiskDelta(appState)

  return (
    <AppContext.Provider value={{
      visitType,
      checklist,
      questionNotes,
      offShelf,
      offShelfConfirmed,
      evidence,
      notes,
      revisitRequired,
      shelfResetNeeded,
      lastSavedAt,
      submitted,
      agentforceEnabled,
      setVisitType,
      setChecklistAnswer,
      setQuestionNote,
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
      setAgentforceEnabled,
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
