import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { basePlanItems } from '../data/mock'
import type { ChecklistAnswer } from '../types'

const ANSWER_OPTIONS: { value: ChecklistAnswer; label: string; color: string }[] = [
  { value: 'yes', label: 'Yes', color: 'bg-green-500 text-white border-green-500' },
  { value: 'partial', label: 'Partial', color: 'bg-yellow-400 text-white border-yellow-400' },
  { value: 'no', label: 'No', color: 'bg-red-500 text-white border-red-500' },
  { value: 'na', label: 'N/A', color: 'bg-gray-300 text-gray-700 border-gray-300' },
]

const STANDARD_OPTIONS: ChecklistAnswer[] = ['yes', 'no', 'na']
const DISPLAY_OPTIONS: ChecklistAnswer[] = ['yes', 'partial', 'no', 'na']

export function BasePlanExecutionScreen() {
  const navigate = useNavigate()
  const { executionAnswers, executionNotes, setExecutionAnswer, setExecutionNote, executionScore } = useApp()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const answered = basePlanItems.filter(item => executionAnswers[item.id] !== null && executionAnswers[item.id] !== undefined).length
  const total = basePlanItems.length

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/scorecard')} className="text-blue-600 text-sm font-medium">← Overview</button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Base Plan Execution</h1>
            <p className="text-xs text-gray-400">{answered} / {total} items answered</p>
          </div>
        </div>

        {/* Execution Score Chip */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Execution Score</p>
            <p className="text-2xl font-bold text-gray-900">{executionScore.toFixed(1)}<span className="text-sm text-gray-400 font-normal"> / 100</span></p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Items 8 × 12.5 pts</p>
            <p className="text-xs text-gray-400">Partial = 50% credit (demo)</p>
          </div>
        </div>

        {/* Item Type Guide */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-xs text-blue-700">
          <p className="font-semibold mb-1">Response options by item type</p>
          <p>● Standard items (POG): <span className="font-medium">Yes / No / N/A</span></p>
          <p className="mt-0.5">● Display/product sets: <span className="font-medium">Yes / No / Partial / N/A</span></p>
        </div>

        {/* Checklist Items */}
        <div className="space-y-3">
          {basePlanItems.map(item => {
            const answer = executionAnswers[item.id] ?? null
            const isExpanded = expandedId === item.id
            const options = item.itemType === 'display' ? DISPLAY_OPTIONS : STANDARD_OPTIONS
            const answerObj = ANSWER_OPTIONS.find(o => o.value === answer)
            const hasAnswer = answer !== null

            return (
              <div key={item.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                answer === 'yes' ? 'border-green-200' :
                answer === 'no' ? 'border-red-200' :
                answer === 'partial' ? 'border-yellow-200' :
                answer === 'na' ? 'border-gray-200' : 'border-gray-100'
              }`}>
                {/* Left accent bar */}
                <div className="flex">
                  <div className={`w-1 shrink-0 ${
                    answer === 'yes' ? 'bg-green-400' :
                    answer === 'no' ? 'bg-red-400' :
                    answer === 'partial' ? 'bg-yellow-400' :
                    answer === 'na' ? 'bg-gray-300' : 'bg-gray-100'
                  }`} />
                  <div className="flex-1 p-4">
                    {/* Item header */}
                    <div
                      className="flex items-start justify-between gap-2 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            item.itemType === 'display' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.itemType === 'display' ? 'Display' : 'Standard'}
                          </span>
                          {hasAnswer && (
                            <span className={`text-xs px-2 py-0.5 rounded font-semibold border ${answerObj?.color ?? ''}`}>
                              {answerObj?.label}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900 text-sm mt-1.5">{item.itemName}</p>
                        <p className="text-xs text-gray-400">{item.requiredLocation} · {item.possiblePoints} pts</p>
                      </div>
                      <span className={`text-gray-400 text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>›</span>
                    </div>

                    {/* Answer buttons */}
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {options.map(opt => {
                        const optObj = ANSWER_OPTIONS.find(o => o.value === opt)!
                        const isSelected = answer === opt
                        return (
                          <button
                            key={opt}
                            onClick={() => setExecutionAnswer(item.id, opt)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                              isSelected
                                ? optObj.color
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                            }`}
                          >
                            {optObj.label}
                          </button>
                        )
                      })}
                    </div>

                    {/* Expanded guidance + notes */}
                    {isExpanded && (
                      <div className="mt-3 space-y-3">
                        <p className="text-xs text-gray-500">{item.guidance}</p>
                        {(answer === 'no' || answer === 'partial') && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">Notes / Missing SKUs</label>
                            <textarea
                              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:border-blue-400"
                              rows={2}
                              placeholder="Describe what is missing or incomplete…"
                              value={executionNotes[item.id] ?? ''}
                              onChange={e => setExecutionNote(item.id, e.target.value)}
                            />
                          </div>
                        )}
                        <p className="text-xs text-gray-400 italic">Partial scoring = 50% credit (demo value — pending business confirmation)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate('/scorecard/base-plan-lgor')}
            className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm"
          >
            Next: Base Plan LGOR Review →
          </button>
        </div>
      </div>
    </div>
  )
}
