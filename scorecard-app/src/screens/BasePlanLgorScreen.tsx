import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { demoBasePlanLgorPercent, basePlanItems } from '../data/mock'

export function BasePlanLgorScreen() {
  const navigate = useNavigate()
  const { executionScore, basePlanLgorPoints, executionAnswers } = useApp()

  const yesCount = basePlanItems.filter(item => executionAnswers[item.id] === 'yes').length
  const partialCount = basePlanItems.filter(item => executionAnswers[item.id] === 'partial').length
  const noCount = basePlanItems.filter(item => executionAnswers[item.id] === 'no').length
  const naCount = basePlanItems.filter(item => executionAnswers[item.id] === 'na').length

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/scorecard/base-plan')} className="text-blue-600 text-sm font-medium">← Execution</button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Base Plan LGOR</h1>
            <p className="text-xs text-gray-400">Quarterly business coverage from base plan</p>
          </div>
        </div>

        {/* LGOR Points Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Base Plan LGOR Points</p>
          <div className="flex items-end gap-2 mb-2">
            <p className="text-4xl font-bold text-gray-900">{basePlanLgorPoints.toFixed(1)}</p>
            <p className="text-lg text-gray-400 pb-1">pts</p>
          </div>
          <p className="text-sm text-gray-500">
            Base Plan LGOR % of <span className="font-semibold text-gray-800">{demoBasePlanLgorPercent}%</span> converts directly to <span className="font-semibold text-gray-800">{basePlanLgorPoints.toFixed(1)} points</span>
          </p>
          <div className="mt-3 bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-mono text-gray-600">Base Plan LGOR Points = Base Plan LGOR %</p>
            <p className="text-xs font-mono text-gray-600 mt-1">{demoBasePlanLgorPercent}% = {basePlanLgorPoints.toFixed(1)} pts</p>
          </div>
          <p className="text-xs text-gray-400 italic mt-3">Demo value — pending business confirmation</p>
        </div>

        {/* Formula Explainer */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">How Base Plan LGOR % is Calculated</p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Base Plan LGOR % comes from business data, calculated as:</p>
            <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs">
              <p>Business value of base-plan SKUs</p>
              <p>÷ Total quarterly business value</p>
              <p>× 100</p>
            </div>
            <p className="text-xs text-gray-500">Example: $26,300 / $100,000 × 100 = 26.3%</p>
          </div>
          <div className="mt-4 space-y-2 text-xs text-gray-500">
            <p className="font-semibold text-gray-600">Open Questions (pending business confirmation)</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>What is the approved source for LGOR %? (POS, forecast, prior-year?)</li>
              <li>What is the denominator? (Total Scotts quarterly, selected category, MAP-eligible SKUs?)</li>
            </ul>
          </div>
        </div>

        {/* Execution Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Execution Summary</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-green-50 rounded-lg p-2">
              <p className="text-xl font-bold text-green-600">{yesCount}</p>
              <p className="text-xs text-gray-400">Yes</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2">
              <p className="text-xl font-bold text-yellow-500">{partialCount}</p>
              <p className="text-xs text-gray-400">Partial</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2">
              <p className="text-xl font-bold text-red-500">{noCount}</p>
              <p className="text-xs text-gray-400">No</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-xl font-bold text-gray-400">{naCount}</p>
              <p className="text-xs text-gray-400">N/A</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">Execution Score</p>
            <p className="font-bold text-gray-900">{executionScore.toFixed(1)} / 100</p>
          </div>
        </div>

        {/* Key distinction */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-700 mb-2">Score vs LGOR Rep %</p>
          <div className="space-y-1 text-xs text-blue-600">
            <p>● <span className="font-semibold">Final PSS Score</span> = internal competitive score (can exceed 100)</p>
            <p>● <span className="font-semibold">LGOR Rep %</span> = business coverage percentage represented off-shelf</p>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate('/scorecard/incremental')}
            className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm"
          >
            Next: Incremental / Off-Shelf Capture →
          </button>
        </div>
      </div>
    </div>
  )
}
