import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { generateRecommendations, generateRevisitSuggestions } from '../lib/scorecard'
import type { RevisitStatus } from '../types'

const REVISIT_REASONS = [
  'Peak week demand not supported',
  'High-volume SKU missing off-shelf',
  'Not enough quantity placed',
  'Display capacity too low',
  'Backroom stock available but not displayed',
  'Empty calories taking display space',
  'Missing MAP setup',
  'Store replenishment follow-up needed',
  'Manager approval needed',
  'Other',
]

const STATUS_COLORS: Record<RevisitStatus, string> = {
  'Open': 'bg-red-100 text-red-700',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  'Resolved': 'bg-green-100 text-green-700',
  'Unable to Resolve': 'bg-gray-100 text-gray-600',
}

export function RevisitFollowUpScreen() {
  const navigate = useNavigate()
  const {
    revisitRequired,
    revisitItems,
    setRevisitRequired,
    addRevisitItem,
    updateRevisitItemStatus,
    executionAnswers,
    offShelfItems,
  } = useApp()

  const [showAddForm, setShowAddForm] = useState(false)
  const [reason, setReason] = useState('')
  const [itemNotes, setItemNotes] = useState('')
  const [owner, setOwner] = useState('')
  const [dueDate, setDueDate] = useState('')

  const recommendations = generateRecommendations(executionAnswers, offShelfItems)
  const suggestions = generateRevisitSuggestions(recommendations, offShelfItems)
  const openItems = revisitItems.filter(r => r.status === 'Open' || r.status === 'In Progress')
  const resolvedItems = revisitItems.filter(r => r.status === 'Resolved' || r.status === 'Unable to Resolve')

  function handleAddManual() {
    if (!reason) return
    addRevisitItem({
      reason,
      notes: itemNotes,
      assignedOwner: owner || undefined,
      dueDate: dueDate || undefined,
      status: 'Open',
    })
    setReason('')
    setItemNotes('')
    setOwner('')
    setDueDate('')
    setShowAddForm(false)
    if (!revisitRequired) setRevisitRequired(true)
  }

  function addFromSuggestion(suggestion: (typeof suggestions)[0]) {
    addRevisitItem({
      skuId: suggestion.skuId,
      displayLocation: suggestion.displayLocation,
      reason: suggestion.reason,
      currentQuantity: suggestion.currentQuantity,
      recommendedQuantity: suggestion.recommendedQuantity,
      quantityGap: suggestion.quantityGap,
      peakWeekUnits: suggestion.peakWeekUnits,
      notes: '',
      status: 'Open',
    })
    if (!revisitRequired) setRevisitRequired(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/scorecard/summary')} className="text-blue-600 text-sm font-medium">← Summary</button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Revisit / Follow-Up</h1>
            <p className="text-xs text-gray-400">{openItems.length} open · {resolvedItems.length} resolved</p>
          </div>
        </div>

        {/* Revisit Required Toggle */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Revisit Required</p>
            <p className="text-xs text-gray-400">Flag this store for follow-up execution</p>
          </div>
          <button
            onClick={() => setRevisitRequired(!revisitRequired)}
            className={`w-12 h-6 rounded-full transition-colors ${revisitRequired ? 'bg-orange-500' : 'bg-gray-200'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${revisitRequired ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* MVP Rule note */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-xs text-blue-700">
          Revisit items create visibility and accountability. They do not automatically change the score. DM / Territory Lead can see all open revisit items.
        </div>

        {/* System-suggested items */}
        {suggestions.length > 0 && revisitItems.length === 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">System-Suggested Revisit Items</p>
            <div className="space-y-2">
              {suggestions.slice(0, 4).map((sug, i) => (
                <div key={i} className="bg-white border border-orange-100 rounded-xl p-3">
                  <p className="text-xs text-gray-700">{sug.reason}</p>
                  {sug.quantityGap !== undefined && (
                    <p className="text-xs text-gray-400 mt-0.5">Gap: {sug.quantityGap} units</p>
                  )}
                  <button
                    onClick={() => addFromSuggestion(sug)}
                    className="mt-2 text-xs text-blue-600 font-semibold border border-blue-200 rounded-lg px-3 py-1"
                  >
                    Add to Revisit List
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Open items */}
        {openItems.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Open Items</p>
            <div className="space-y-3">
              {openItems.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{item.reason}</p>
                      {item.displayLocation && <p className="text-xs text-gray-400 mt-0.5">{item.displayLocation}</p>}
                      {item.currentQuantity !== undefined && (
                        <p className="text-xs text-gray-400">Current: {item.currentQuantity} units · Gap: {item.quantityGap ?? '?'} units</p>
                      )}
                      {item.assignedOwner && <p className="text-xs text-gray-400">Owner: {item.assignedOwner}</p>}
                      {item.notes && <p className="text-xs text-gray-500 mt-1">{item.notes}</p>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${STATUS_COLORS[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => updateRevisitItemStatus(item.id, 'In Progress')}
                      className="flex-1 border border-yellow-200 text-yellow-700 rounded-lg py-1.5 text-xs font-semibold"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => updateRevisitItemStatus(item.id, 'Resolved')}
                      className="flex-1 border border-green-200 text-green-700 rounded-lg py-1.5 text-xs font-semibold"
                    >
                      Resolved
                    </button>
                    <button
                      onClick={() => updateRevisitItemStatus(item.id, 'Unable to Resolve')}
                      className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-1.5 text-xs font-semibold"
                    >
                      Unable
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolved items */}
        {resolvedItems.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resolved</p>
            <div className="space-y-2">
              {resolvedItems.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{item.reason}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add manual item */}
        {showAddForm ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <p className="font-semibold text-gray-900 mb-4">Add Revisit Item</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Reason</label>
                <select
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                >
                  <option value="">Select reason…</option>
                  {REVISIT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Assigned Owner (optional)</label>
                <input
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="e.g. Sarah M."
                  value={owner}
                  onChange={e => setOwner(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Due Date (optional)</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-400"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Notes</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:border-blue-400"
                  rows={2}
                  placeholder="Describe the gap or action needed…"
                  value={itemNotes}
                  onChange={e => setItemNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddForm(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 font-medium text-sm">Cancel</button>
                <button onClick={handleAddManual} disabled={!reason} className="flex-1 bg-blue-600 disabled:opacity-50 text-white rounded-xl py-3 font-semibold text-sm">Add Item</button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-white border-2 border-dashed border-gray-200 text-gray-600 rounded-xl py-3.5 font-medium text-sm hover:border-blue-200 transition-colors"
          >
            + Add Revisit Item
          </button>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm"
          >
            Back to Visit →
          </button>
        </div>
      </div>
    </div>
  )
}
