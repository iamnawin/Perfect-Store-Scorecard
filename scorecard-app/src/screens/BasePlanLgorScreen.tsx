import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { demoBasePlanLgorPercent } from '../data/mock'

export function BasePlanLgorScreen() {
  const navigate = useNavigate()
  const { executionScore, basePlanLgorPoints, finalScore, lgorRepPercent, executionAnswers } = useApp()

  const yesCount = Object.values(executionAnswers).filter(a => a === 'yes').length
  const partialCount = Object.values(executionAnswers).filter(a => a === 'partial').length
  const noCount = Object.values(executionAnswers).filter(a => a === 'no').length
  const naCount = Object.values(executionAnswers).filter(a => a === 'na').length

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
        <div className="bg-blue-700 text-white px-4 pt-10 pb-4">
          <button onClick={() => navigate('/scorecard/base-plan')} className="text-blue-200 text-sm mb-3">← Back</button>
          <h1 className="text-lg font-bold">Base Plan LGOR Review</h1>
          <p className="text-xs text-blue-200 mt-1">Business coverage from base plan setup</p>
        </div>

        <div className="flex-1 px-4 py-4 space-y-4">
          {/* Base Plan LGOR Points */}
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-2">Base Plan LGOR Points</p>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold text-blue-700">{basePlanLgorPoints.toFixed(1)}</p>
              <p className="text-sm text-gray-500 mb-1">pts</p>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Base Plan LGOR % ({demoBasePlanLgorPercent}%) → {basePlanLgorPoints.toFixed(1)} pts
            </p>
            <p className="text-xs text-gray-500 mt-1">Direct 1:1 conversion</p>
            <p className="text-xs text-amber-600 italic mt-1">Demo value — pending business confirmation</p>
          </div>

          {/* Formula explainer */}
          <div className="border border-gray-200 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-700">How this is calculated</p>
            <p className="text-xs text-gray-600">
              Base Plan LGOR % represents the quarterly business value of SKUs that are
              supported by the base plan setup, as a percentage of total selected quarterly business.
            </p>
            <div className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-700 space-y-1">
              <p>Base Plan LGOR % = Base Plan SKU Business</p>
              <p className="pl-4">/ Total Quarterly Business × 100</p>
              <p className="mt-1">= $26,300 / $100,000 × 100 = 26.3%</p>
            </div>
            <p className="text-xs text-amber-600 italic">Demo values — pending business confirmation</p>
          </div>

          {/* Open questions */}
          <div className="border border-orange-200 bg-orange-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-orange-800 mb-1">Open Business Questions</p>
            <ul className="text-xs text-orange-700 space-y-1 list-disc list-inside">
              <li>LGOR source: Dollars? Units? POS? Forecast?</li>
              <li>Denominator: Total Scotts business? Category? MAP-eligible set?</li>
              <li>Banner / store / quarter-specific adjustments?</li>
            </ul>
          </div>

          {/* Execution summary */}
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">Execution Summary</p>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <p className="text-lg font-bold text-green-600">{yesCount}</p>
                <p className="text-gray-500">Yes</p>
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-500">{partialCount}</p>
                <p className="text-gray-500">Partial</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-500">{noCount}</p>
                <p className="text-gray-500">No</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-400">{naCount}</p>
                <p className="text-gray-500">N/A</p>
              </div>
            </div>
            <div className="border-t border-gray-100 mt-3 pt-2 flex justify-between text-xs">
              <span className="text-gray-500">Execution Score</span>
              <span className="font-bold text-gray-900">{executionScore.toFixed(1)} pts</span>
            </div>
          </div>

          {/* Key distinction */}
          <div className="border border-gray-200 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-700">Final Score vs LGOR Rep %</p>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Final PSS Score</span>
              <span className="font-bold text-gray-900">{finalScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">LGOR Rep %</span>
              <span className="font-bold text-blue-700">{lgorRepPercent.toFixed(1)}%</span>
            </div>
            <p className="text-xs text-gray-500 italic">
              Score = internal competitive metric · LGOR Rep % = business coverage percentage
            </p>
          </div>

          <button
            onClick={() => navigate('/scorecard/incremental')}
            className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm"
          >
            Next: Incremental Off-Shelf →
          </button>
        </div>
      </div>
    </div>
  )
}
