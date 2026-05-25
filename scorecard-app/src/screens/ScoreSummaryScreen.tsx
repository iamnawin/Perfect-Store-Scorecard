import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { demoBasePlanLgorPercent } from '../data/mock'
import { previousScore } from '../data/mock'

export function ScoreSummaryScreen() {
  const navigate = useNavigate()
  const {
    executionScore,
    basePlanLgorPoints,
    incrementalOffShelfPoints,
    incrementalRawLgorPercent,
    finalScore,
    lgorRepPercent,
    submitted,
    submitScorecard,
    snapshots,
    revisitRequired,
    offShelfItems,
  } = useApp()

  const activeItems = offShelfItems.filter(e => e.status !== 'removed')
  const prevSnapshot = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null
  const scoreDelta = prevSnapshot ? finalScore - prevSnapshot.finalScore : finalScore - previousScore.score
  const lgorDelta = prevSnapshot ? lgorRepPercent - prevSnapshot.lgorRepPercent : lgorRepPercent - previousScore.lgorRepPercent

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/scorecard/recommendations')} className="text-blue-600 text-sm font-medium">← Signals</button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Score Summary</h1>
            <p className="text-xs text-gray-400">{submitted ? 'Submitted' : 'Ready to submit'}</p>
          </div>
        </div>

        {/* Main scores */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 mb-4 text-white">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-4">Final Scores</p>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-4xl font-bold">{finalScore.toFixed(1)}</p>
              <p className="text-sm text-blue-200 mt-1">Final PSS Score</p>
              <p className="text-xs text-blue-300 mt-0.5">Internal competitive score</p>
              {scoreDelta !== 0 && (
                <p className={`text-sm font-semibold mt-1 ${scoreDelta >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {scoreDelta >= 0 ? '+' : ''}{scoreDelta.toFixed(1)} vs previous
                </p>
              )}
            </div>
            <div>
              <p className="text-4xl font-bold text-green-300">{lgorRepPercent.toFixed(1)}%</p>
              <p className="text-sm text-blue-200 mt-1">LGOR Rep %</p>
              <p className="text-xs text-blue-300 mt-0.5">Business coverage %</p>
              {lgorDelta !== 0 && (
                <p className={`text-sm font-semibold mt-1 ${lgorDelta >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {lgorDelta >= 0 ? '+' : ''}{lgorDelta.toFixed(1)}% vs previous
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Score Breakdown</p>

          <div className="space-y-4">
            {/* Execution Score */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-800">Execution Score</p>
                <p className="text-xl font-bold text-gray-900">{executionScore.toFixed(1)}</p>
              </div>
              <p className="text-xs text-gray-400">Required POG / MAP / Stackout execution (max 100)</p>
              <div className="mt-1.5 bg-gray-100 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, executionScore)}%` }} />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-1">+</div>

            {/* Base Plan LGOR Points */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-800">Base Plan LGOR Points</p>
                <p className="text-xl font-bold text-gray-900">{basePlanLgorPoints.toFixed(1)}</p>
              </div>
              <p className="text-xs text-gray-400">Base Plan LGOR % ({demoBasePlanLgorPercent}%) → {basePlanLgorPoints.toFixed(1)} pts</p>
              <p className="text-xs text-gray-400 italic">Demo value — pending business confirmation</p>
            </div>

            <div className="border-t border-gray-100 pt-1">+</div>

            {/* Incremental Off-Shelf Points */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-800">Incremental Off-Shelf Points</p>
                <p className="text-xl font-bold text-gray-900">{incrementalOffShelfPoints.toFixed(1)}</p>
              </div>
              <p className="text-xs text-gray-400">{activeItems.length} incremental SKU{activeItems.length !== 1 ? 's' : ''} × LGOR % × Peak Week Multiplier</p>
              <p className="text-xs text-gray-400 italic">Demo values — pending business confirmation</p>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-900">= Final PSS Score</p>
                <p className="text-2xl font-bold text-blue-700">{finalScore.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* LGOR Rep % Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">LGOR Rep % Breakdown</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Plan LGOR %</span>
              <span className="font-semibold">{demoBasePlanLgorPercent.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">+ Incremental Raw LGOR %</span>
              <span className="font-semibold">{incrementalRawLgorPercent.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2">
              <span className="font-bold text-gray-900">= LGOR Rep %</span>
              <span className="font-bold text-green-600 text-lg">{lgorRepPercent.toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 italic mt-2">Demo values — pending business confirmation</p>
        </div>

        {/* Off-shelf line items */}
        {activeItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Incremental Items</p>
            <div className="space-y-2">
              {activeItems.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-800 text-xs">{item.product}</p>
                    <p className="text-xs text-gray-400">{item.displayLocation} · {item.calculatedUnits}u · {item.lgorPercent}% × {item.peakWeekMultiplier}x</p>
                  </div>
                  <span className="font-bold text-blue-700">{item.points.toFixed(1)} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Retake comparison */}
        {snapshots.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Previous vs Current</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="text-gray-500">Previous</div>
              <div className="text-gray-500">Change</div>
              <div className="text-gray-500">Current</div>
              <div className="font-semibold text-gray-700">{previousScore.score.toFixed(1)}</div>
              <div className={`font-bold ${scoreDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>{scoreDelta >= 0 ? '+' : ''}{scoreDelta.toFixed(1)}</div>
              <div className="font-bold text-blue-700">{finalScore.toFixed(1)}</div>
              <div className="text-gray-500 text-xs">PSS Score</div>
              <div />
              <div className="text-gray-500 text-xs">PSS Score</div>
              <div className="font-semibold text-gray-700">{previousScore.lgorRepPercent.toFixed(1)}%</div>
              <div className={`font-bold ${lgorDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>{lgorDelta >= 0 ? '+' : ''}{lgorDelta.toFixed(1)}%</div>
              <div className="font-bold text-green-600">{lgorRepPercent.toFixed(1)}%</div>
              <div className="text-gray-500 text-xs">LGOR Rep</div>
              <div />
              <div className="text-gray-500 text-xs">LGOR Rep</div>
            </div>
          </div>
        )}

        {revisitRequired && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-4 text-xs text-orange-700">
            Revisit flagged — this store is tracked for follow-up execution.
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto space-y-2">
          {!submitted ? (
            <button
              onClick={submitScorecard}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3.5 font-bold text-sm transition-colors"
            >
              Submit Scorecard
            </button>
          ) : (
            <button
              onClick={() => navigate('/scorecard')}
              className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-bold text-sm"
            >
              Retake / Update Scorecard
            </button>
          )}
          <button
            onClick={() => navigate('/scorecard/revisit')}
            className="w-full bg-white border border-gray-200 text-gray-700 rounded-xl py-3 font-medium text-sm"
          >
            Revisit / Follow-Up
          </button>
        </div>
      </div>
    </div>
  )
}
