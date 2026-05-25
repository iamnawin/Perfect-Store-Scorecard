import { useEffect, useState, type ReactNode } from 'react'
import type {
  AppCelebration,
  AppToast,
  ChecklistAnswer,
  OffShelfEntry,
  QuantityUnit,
  RevisitItem,
  RevisitStatus,
  ScorecardSnapshot,
  ScorecardVisitStatus,
} from '../types'
import { AppContext } from './app-context'
import { store, demoBasePlanLgorPercent } from '../data/mock'
import {
  buildOffShelfEntry,
  buildSnapshot,
  calculateBasePlanLgorPoints,
  calculateExecutionScore,
  calculateFinalPssScore,
  calculateIncrementalOffShelfPoints,
  calculateIncrementalRawLgorPercent,
  calculateLgorRepPercent,
} from '../lib/scorecard'

export function AppProvider({ children }: { children: ReactNode }) {
  const [visitStatus, setVisitStatusState] = useState<ScorecardVisitStatus>('Not Started')
  const [executionAnswers, setExecutionAnswersState] = useState<Record<string, ChecklistAnswer>>({})
  const [executionNotes, setExecutionNotesState] = useState<Record<string, string>>({})
  const [offShelfItems, setOffShelfItems] = useState<OffShelfEntry[]>([])
  const [offShelfConfirmed, setOffShelfConfirmed] = useState(false)
  const [revisitRequired, setRevisitRequiredState] = useState(false)
  const [revisitItems, setRevisitItems] = useState<RevisitItem[]>([])
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [snapshots, setSnapshots] = useState<ScorecardSnapshot[]>([])
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [toast, setToast] = useState<AppToast | null>(null)
  const [celebration, setCelebration] = useState<AppCelebration | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (!celebration) return
    const t = window.setTimeout(() => setCelebration(null), 2400)
    return () => window.clearTimeout(t)
  }, [celebration])

  function showToast(title: string, message: string) {
    setToast({ id: Date.now(), title, message })
  }

  function setExecutionAnswer(itemId: string, answer: ChecklistAnswer) {
    setExecutionAnswersState(prev => ({ ...prev, [itemId]: answer }))
    if (visitStatus === 'Not Started') setVisitStatusState('In Progress')
  }

  function setExecutionNote(itemId: string, note: string) {
    setExecutionNotesState(prev => ({ ...prev, [itemId]: note }))
  }

  function addOffShelfItem(
    skuId: string,
    displayLocation: string,
    quantity: number,
    quantityUnit: QuantityUnit,
    itemNotes?: string,
  ) {
    const entry = buildOffShelfEntry({ skuId, displayLocation, quantity, quantityUnit, notes: itemNotes })
    setOffShelfItems(prev => [...prev, entry])
    setOffShelfConfirmed(true)
    if (visitStatus === 'Not Started') setVisitStatusState('In Progress')
  }

  function removeOffShelfItem(id: string) {
    setOffShelfItems(prev => prev.map(e => e.id === id ? { ...e, status: 'removed' as const } : e))
  }

  function confirmOffShelf() {
    setOffShelfConfirmed(true)
  }

  function setRevisitRequired(value: boolean) {
    setRevisitRequiredState(value)
    if (value) {
      setVisitStatusState('Revisit Required')
      showToast('Revisit flagged', 'This store will be tracked for follow-up execution.')
    }
  }

  function addRevisitItem(item: Omit<RevisitItem, 'id'>) {
    setRevisitItems(prev => [...prev, { ...item, id: crypto.randomUUID() }])
  }

  function updateRevisitItemStatus(id: string, status: RevisitStatus) {
    setRevisitItems(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  function saveDraft() {
    setLastSavedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
  }

  // Derived scores (computed on each render — clean and no stale state)
  const executionScore = calculateExecutionScore(executionAnswers)
  const basePlanLgorPoints = calculateBasePlanLgorPoints(demoBasePlanLgorPercent)
  const incrementalOffShelfPoints = calculateIncrementalOffShelfPoints(offShelfItems)
  const incrementalRawLgorPercent = calculateIncrementalRawLgorPercent(offShelfItems)
  const finalScore = calculateFinalPssScore(executionScore, basePlanLgorPoints, incrementalOffShelfPoints)
  const lgorRepPercent = calculateLgorRepPercent(demoBasePlanLgorPercent, offShelfItems)

  function submitScorecard() {
    const snapshot = buildSnapshot(executionScore, demoBasePlanLgorPercent, offShelfItems)
    setSnapshots(prev => [...prev, snapshot])
    setSubmitted(true)
    setVisitStatusState('Submitted')
    saveDraft()
    setCelebration({
      id: Date.now(),
      title: 'Scorecard submitted!',
      message: `Score: ${finalScore.toFixed(1)}  |  LGOR Rep: ${lgorRepPercent.toFixed(1)}%`,
    })
  }

  return (
    <AppContext.Provider value={{
      visitStatus,
      quarter: store.quarter,
      visitDate: store.visitDate,
      executionAnswers,
      executionNotes,
      setExecutionAnswer,
      setExecutionNote,
      executionScore,
      basePlanLgorPoints,
      incrementalOffShelfPoints,
      incrementalRawLgorPercent,
      finalScore,
      lgorRepPercent,
      offShelfItems,
      offShelfConfirmed,
      addOffShelfItem,
      removeOffShelfItem,
      confirmOffShelf,
      revisitRequired,
      revisitItems,
      setRevisitRequired,
      addRevisitItem,
      updateRevisitItemStatus,
      notes,
      setNotes,
      submitted,
      lastSavedAt,
      submitScorecard,
      saveDraft,
      snapshots,
      toast,
      celebration,
      showToast,
    }}>
      {children}
    </AppContext.Provider>
  )
}
