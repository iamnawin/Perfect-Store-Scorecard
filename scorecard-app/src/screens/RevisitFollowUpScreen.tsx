import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { generateRevisitSuggestions, generateRecommendations } from '../lib/scorecard'
import type { RevisitStatus } from '../types'

const reasonOptions = [
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

const statusColors: Record<RevisitStatus, string> = {
  Open: 'bg-red-100 text-red-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-green-100 text-green-700',
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

  const [reason, setReason] = useState(reasonOptions[0])
  const [owner, setOwner] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [itemNotes, setItemNotes] = useState('')

  const recommendations = generateRecommendations(executionAnswers, offShelfItems)
  const suggestions = generateRevisitSuggestions(recommendations, offShelfItems)

  const openItems = revisitItems.filter(r => r.status === 'Open' || r.status === 'In Progress')
  const resolvedItems = revisitItems.filter(r => r.status === 'Resolved' || r.status === 'Unable to Resolve')

  function handleAdd() {
    addRevisitItem({
      id: crypto.randomUUID(),
      reason,
      assignedOwner: owner,
      dueDate,
      status: 'Open',
      notes: itemNotes,
    })
    setOwner('')
    setDueDate('')
    setItemNotes('')
  }

  function handleAddSuggestion(suggestion: typeof suggestions[0]) {
    addRevisitItem({
      id: crypto.randomUUID(),
      reason: suggestion.reason,
      sku: suggestion.sku,
      displayLocation: suggestion.displayLocation,
      assignedOwner: '',
      dueDate: '',
      status: 'Open',
      notes: '',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
        <div className="bg-blue-700 text-white px-4 pt-10 pb-4">
          <button onClick={() => navigate('/scorecard/summary')} className="text-blue-200 text-sm mb-3">← Back</button>
          <h1 className="text-lg font-bold">Revisit Follow-Up</h1>
          <p className="text-xs text-blue-200 mt-1">Create accountability for gaps that need follow-up</p>
        </div>

        <div className="flex-1 px-4 py-4 space-y-4">
          {/* Revisit required toggle */}
          <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Revisit Required</p>
              <p className="text-xs text-gray-500">Flag this store for follow-up</p>
            </div>
            <button
              onClick={() => setRevisitRequired(!revisitRequired)}
              className={`w-12 h-6 rounded-full transition-colors ${revisitRequired ? 'bg-orange-500' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${revisitRequired ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          {/* MVP rule */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
            <p className="font-semibold text-gray-700 mb-1">MVP Rule</p>
            <p>Revisit items create visibility and accountability. They do not automatically change the numeric score.</p>
          </div>

          {/* System-suggested items */}
          {suggestions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">System Suggestions</p>
              <div className="space-y-2">
                {suggestions.map((sug, i) => (
                  <div key={i} className="border border-orange-200 bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-orange-800">{sug.reason}</p>
                    {sug.sku && <p className="text-xs text-orange-600 mt-0.5">SKU: {sug.sku}</p>}
                    <button
                      onClick={() => handleAddSuggestion(sug)}
                      className="mt-2 text-xs text-orange-700 border border-orange-400 px-2 py-1 rounded"
                    >
                      Add to Revisit List
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual add form */}
          <div className="border border-gray-200 rounded-lg p-3 space-y-3">
            <p className="text-sm font-semibold text-gray-800">Add Revisit Item</p>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Reason</label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full border border-gray-200 rounded p-2 text-xs"
              >
                {reasonOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Assigned Owner</label>
              <input
                type="text"
                value={owner}
                onChange={e => setOwner(e.target.value)}
                placeholder="Name or role"
                className="w-full border border-gray-200 rounded p-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full border border-gray-200 rounded p-2 text-xs"
              />
            </div>
            <textarea
              value={itemNotes}
              onChange={e => setItemNotes(e.target.value)}
              placeholder="Notes…"
              className="w-full border border-gray-200 rounded p-2 text-xs resize-none h-14"
            />
            <button
              onClick={handleAdd}
              className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold"
            >
              Add Revisit Item
            </button>
          </div>

          {/* Open items */}
          {openItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Open Items ({openItems.length})</p>
              <div className="space-y-2">
                {openItems.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800">{item.reason}</p>
                        {item.sku && <p className="text-xs text-gray-500 mt-0.5">{item.sku}</p>}
                        {item.assignedOwner && <p className="text-xs text-gray-400">Owner: {item.assignedOwner}</p>}
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${statusColors[item.status]}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {(['In Progress', 'Resolved', 'Unable to Resolve'] as RevisitStatus[]).map(s => (
                        <button
                          key={s}
                          onClick={() => updateRevisitItemStatus(item.id, s)}
                          className="text-xs border border-gray-300 text-gray-600 px-2 py-0.5 rounded"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolved items */}
          {resolvedItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Resolved ({resolvedItems.length})</p>
              <div className="space-y-2">
                {resolvedItems.map(item => (
                  <div key={item.id} className="border border-gray-100 bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-gray-500 flex-1">{item.reason}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${statusColors[item.status]}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm"
          >
            Back to Visit
          </button>
        </div>
      </div>
    </div>
  )
}
