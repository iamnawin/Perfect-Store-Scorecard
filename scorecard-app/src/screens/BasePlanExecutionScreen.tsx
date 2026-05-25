import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { basePlanItems } from '../data/mock'
import type { ChecklistAnswer } from '../types'

const answerColors: Record<string, string> = {
  yes: 'bg-green-500',
  no: 'bg-red-500',
  partial: 'bg-yellow-400',
  na: 'bg-gray-300',
}

const btnBase = 'px-3 py-1.5 rounded text-xs font-semibold border transition-all'

function answerBtn(current: ChecklistAnswer, value: ChecklistAnswer, label: string) {
  const selected = current === value
  const colors: Record<string, string> = {
    yes: selected ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 text-gray-600',
    no: selected ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 text-gray-600',
    partial: selected ? 'bg-yellow-500 text-white border-yellow-500' : 'border-gray-300 text-gray-600',
    na: selected ? 'bg-gray-400 text-white border-gray-400' : 'border-gray-300 text-gray-600',
  }
  return { label, value, className: `${btnBase} ${colors[value!] ?? ''}` }
}

export function BasePlanExecutionScreen() {
  const navigate = useNavigate()
  const { executionAnswers, executionNotes, setExecutionAnswer, setExecutionNote, executionScore } = useApp()
  const [expanded, setExpanded] = useState<string | null>(null)

  const standardItems = basePlanItems.filter(i => i.type === 'standard')
  const displayItems = basePlanItems.filter(i => i.type === 'display')

  function renderItem(item: typeof basePlanItems[0]) {
    const answer = executionAnswers[item.id] ?? null
    const note = executionNotes[item.id] ?? ''
    const isExpanded = expanded === item.id
    const accentColor = answer ? answerColors[answer] : 'bg-gray-200'
    const buttons = item.type === 'display'
      ? [answerBtn(answer, 'yes', 'Yes'), answerBtn(answer, 'no', 'No'), answerBtn(answer, 'partial', 'Partial'), answerBtn(answer, 'na', 'N/A')]
      : [answerBtn(answer, 'yes', 'Yes'), answerBtn(answer, 'no', 'No'), answerBtn(answer, 'na', 'N/A')]

    return (
      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex">
          <div className={`w-1 flex-shrink-0 ${accentColor}`} />
          <div className="flex-1 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.location} · {item.pointsMax} pts</p>
              </div>
              <button
                onClick={() => setExpanded(isExpanded ? null : item.id)}
                className="text-xs text-blue-600 flex-shrink-0"
              >
                {isExpanded ? 'Less' : 'More'}
              </button>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {buttons.map(btn => (
                <button
                  key={btn.value}
                  className={btn.className}
                  onClick={() => setExecutionAnswer(item.id, btn.value as ChecklistAnswer)}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            {isExpanded && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-600">{item.guidance}</p>
                {item.type === 'display' && (
                  <p className="text-xs text-amber-600 italic">
                    Partial = 50% credit (demo value — pending business confirmation)
                  </p>
                )}
                <textarea
                  value={note}
                  onChange={e => setExecutionNote(item.id, e.target.value)}
                  placeholder="Add note…"
                  className="w-full border border-gray-200 rounded p-2 text-xs resize-none h-16"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const answered = Object.keys(executionAnswers).filter(k => executionAnswers[k] !== null).length

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
        <div className="bg-blue-700 text-white px-4 pt-10 pb-4">
          <button onClick={() => navigate('/scorecard')} className="text-blue-200 text-sm mb-3">← Back</button>
          <h1 className="text-lg font-bold">Base Plan Execution</h1>
          <p className="text-xs text-blue-200 mt-1">8 items · 12.5 pts each · max 100 pts</p>
          <div className="flex justify-between mt-3">
            <span className="text-xs text-blue-200">{answered}/8 answered</span>
            <span className="bg-white text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
              {executionScore.toFixed(1)} pts
            </span>
          </div>
        </div>

        <div className="flex-1 px-4 py-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Standard Items · Yes / No / N/A</p>
            <div className="space-y-2">
              {standardItems.map(renderItem)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Display Items · Yes / No / Partial / N/A</p>
            <div className="space-y-2">
              {displayItems.map(renderItem)}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700">Scoring rules (demo)</p>
            <p>Yes = full points · No = 0 pts · Partial = 50% (display items only)</p>
            <p>N/A = excluded from denominator</p>
            <p className="text-amber-600 italic">Demo values — pending business confirmation</p>
          </div>

          <button
            onClick={() => navigate('/scorecard/base-plan-lgor')}
            className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm"
          >
            Next: Base Plan LGOR →
          </button>
        </div>
      </div>
    </div>
  )
}
