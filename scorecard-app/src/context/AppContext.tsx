import { useState, type ReactNode } from 'react'
import type { AppState, ChecklistAnswer, OffShelfEntry } from '../types'
import { AppContext } from './app-context'

export function AppProvider({ children }: { children: ReactNode }) {
  const [checklist, setChecklist] = useState<AppState['checklist']>({})
  const [offShelf, setOffShelf] = useState<OffShelfEntry[]>([])
  const [photoCaption, setPhotoCaption] = useState('')
  const [notes, setNotes] = useState('')
  const [revisitRequired, setRevisitRequired] = useState(false)
  const [shelfResetNeeded, setShelfResetNeeded] = useState(false)
  const [trellisEnabled, setTrellisEnabled] = useState(false)

  function setChecklistAnswer(itemId: string, answer: ChecklistAnswer) {
    setChecklist(prev => ({ ...prev, [itemId]: answer }))
  }

  function addOffShelfEntry(entry: OffShelfEntry) {
    setOffShelf(prev => [...prev, entry])
  }

  function removeOffShelfEntry(id: string) {
    setOffShelf(prev => prev.filter(e => e.id !== id))
  }

  function toggleTrellis() {
    setTrellisEnabled(prev => !prev)
  }

  // Scoring
  const yesCount = Object.values(checklist).filter(v => v === 'yes').length
  const totalItems = 8
  const executionScore = Math.round((yesCount / totalItems) * 100)
  const aboveAndBeyondBonus = offShelf.reduce((acc, e) => {
    const qty = typeof e.quantity === 'string' ? 320 : e.quantity
    return acc + (qty >= 120 ? 10 : qty >= 80 ? 6 : 3)
  }, 0)
  const totalScore = 124 + Math.round(executionScore * 0.6) + Math.min(aboveAndBeyondBonus, 40)
  const lgorPct = 12.4 + offShelf.length * 1.2
  const riskDelta = -14 - offShelf.length * 2

  return (
    <AppContext.Provider value={{
      checklist, offShelf, photoCaption, notes,
      revisitRequired, shelfResetNeeded, trellisEnabled,
      setChecklistAnswer, addOffShelfEntry, removeOffShelfEntry,
      setPhotoCaption, setNotes, setRevisitRequired, setShelfResetNeeded,
      toggleTrellis,
      executionScore, totalScore, lgorPct, riskDelta,
    }}>
      {children}
    </AppContext.Provider>
  )
}
