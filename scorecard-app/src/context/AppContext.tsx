import { useEffect, useState, type ReactNode } from 'react'
import type {
  ChecklistAnswer,
  OffShelfEntry,
  RevisitItem,
  RevisitStatus,
  ScorecardSnapshot,
  ScorecardVisitStatus,
} from '../types'
import { AppContext, type ToastMessage } from './app-context'
import { demoBasePlanLgorPercent, basePlanItems, store } from '../data/mock'
import {
  buildSnapshot,
  calculateBasePlanLgorPoints,
  calculateExecutionScore,
  calculateFinalPssScore,
  calculateIncrementalOffShelfPoints,
  calculateIncrementalRawLgorPercent,
  calculateLgorRepPercent,
} from '../lib/scorecard'

export function AppProvider({ children }: { children: ReactNode }) {
  const [visitStatus, setVisitStatus] = useState<ScorecardVisitStatus>('Not Started')
  const [executionAnswers, setExecutionAnswers] = useState<Record<string, ChecklistAnswer>>({})
  const [executionNotes, setExecutionNotes] = useState<Record<string, string>>({})
  const [offShelfItems, setOffShelfItems] = useState<OffShelfEntry[]>([])
  const [revisitRequired, setRevisitRequiredState] = useState(false)
  const [revisitItems, setRevisitItems] = useState<RevisitItem[]>([])
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [snapshots, setSnapshots] = useState<ScorecardSnapshot[]>([])
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [celebration, setCelebration] = useState(false)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (!celebration) return
    const timer = window.setTimeout(() => setCelebration(false), 2400)
    return () => window.clearTimeout(timer)
  }, [celebration])

  function showToast(title: string, message: string) {
    setToast({ title, message })
  }

  function setExecutionAnswer(itemId: string, answer: ChecklistAnswer) {
    setExecutionAnswers(prev => ({ ...prev, [itemId]: answer }))
    if (visitStatus === 'Not Started') setVisitStatus('In Progress')
  }

  function setExecutionNote(itemId: string, note: string) {
    setExecutionNotes(prev => ({ ...prev, [itemId]: note }))
  }

  function addOffShelfItem(entry: OffShelfEntry) {
    setOffShelfItems(prev => [...prev, entry])
    if (visitStatus === 'Not Started') setVisitStatus('In Progress')
  }

  function removeOffShelfItem(id: string) {
    setOffShelfItems(prev =>
      prev.map(e => e.id === id ? { ...e, status: 'removed' as const } : e)
    )
  }

  function confirmOffShelf() {
    showToast('Off-shelf captured', 'Display entries saved successfully.')
  }

  function setRevisitRequired(v: boolean) {
    setRevisitRequiredState(v)
    if (v) {
      showToast('Revisit flagged', 'This store is marked for follow-up.')
      if (visitStatus === 'Submitted') setVisitStatus('Revisit Required')
    }
  }

  function addRevisitItem(item: RevisitItem) {
    setRevisitItems(prev => [...prev, item])
  }

  function updateRevisitItemStatus(id: string, status: RevisitStatus) {
    setRevisitItems(prev =>
      prev.map(r => r.id === id ? { ...r, status } : r)
    )
  }

  function saveDraft() {
    setLastSavedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
    showToast('Draft saved', 'Your progress has been saved.')
  }

  function submitScorecard() {
    const snapshot = buildSnapshot(executionScore, demoBasePlanLgorPercent, offShelfItems)
    setSnapshots(prev => [...prev, snapshot])
    setSubmitted(true)
    setVisitStatus('Submitted')
    setLastSavedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
    setCelebration(true)
    showToast('Scorecard submitted!', `Final PSS Score: ${snapshot.finalScore}`)
  }

  // Derived scores — computed on each render, no stale state
  const executionScore = calculateExecutionScore(executionAnswers, basePlanItems)
  const basePlanLgorPoints = calculateBasePlanLgorPoints(demoBasePlanLgorPercent)
  const incrementalOffShelfPoints = calculateIncrementalOffShelfPoints(offShelfItems)
  const incrementalRawLgorPercent = calculateIncrementalRawLgorPercent(offShelfItems)
  const finalScore = calculateFinalPssScore(executionScore, basePlanLgorPoints, incrementalOffShelfPoints)
  const lgorRepPercent = calculateLgorRepPercent(demoBasePlanLgorPercent, offShelfItems)

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
      addOffShelfItem,
      removeOffShelfItem,
      confirmOffShelf,
      revisitRequired,
      revisitItems,
      setRevisitRequired,
      addRevisitItem,
      updateRevisitItemStatus,
      notes,
      submitted,
      lastSavedAt,
      snapshots,
      setNotes,
      submitScorecard,
      saveDraft,
      toast,
      celebration,
      showToast,
    }}>
      {children}
    </AppContext.Provider>
  )
}
