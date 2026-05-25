import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { previousScore, demoBasePlanLgorPercent } from '../data/mock'

export function ScoreSummaryScreen() {
  const navigate = useNavigate()
  const {
    finalScore,
    lgorRepPercent,
    executionScore,
    basePlanLgorPoints,
    incrementalOffShelfPoints,
    incrementalRawLgorPercent,
    offShelfItems,
    submitted,
    snapshots,
    submitScorecard,
  } = useApp()

  const activeItems = offShelfItems.filter(e => e.status === 'active')
  const scoreDelta = Math.round((finalScore - previousScore.score) * 10) / 10
  const lgorDelta = Math.round((lgorRepPercent - previousScore.lgorRepPercent) * 10) / 10

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
        {/* Banner */}
        <div className="bg-blue-700 text-white px-4 pt-10 pb-6">
          <button onClick={() => navigate('/scorecard/recommendations')} className="text-blue-200 text-sm mb-3">← Back</button>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-blue-200 uppercase tracking-wider mb-1">Final PSS Score</p>
              <p className="text-5xl font-bold">{finalScore.toFixed(1)}</p>
              <p className={`text-sm mt-1 ${scoreDelta >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {scoreDelta >= 0 ? '+' : ''}{scoreDelta} vs previous
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-200 uppercase tracking-wider mb-1">LGOR Rep %</p>
              <p className="text-3xl font-bold">{lgorRepPercent.toFixed(1)}%</p>
              <p className={`text-sm mt-1 ${lgorDelta >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {lgorDelta >= 0 ? '+' : ''}{lgorDelta}% vs previous
              </p>
            </div>
          </div>
          <p className="text-xs text-blue-200 italic mt-2">Demo values — pending business confirmation</p>
        </div>

        <div className="flex-1 px-4 py-4 space-y-4">
          {/* Score breakdown */}
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">Score Breakdown</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Execution Score</span>
                <span className="font-bold">{executionScore.toFixed(1)} pts</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Plan LGOR Points</span>
                <span className="font-bold">{basePlanLgorPoints.toFixed(1)} pts</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Incremental Off-Shelf Points</span>
                <span className="font-bold">{incrementalOffShelfPoints.toFixed(1)} pts</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2">
                <span>Final PSS Score</span>
                <span className="text-blue-700">{finalScore.toFixed(1)} pts</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-mono">
              {executionScore.toFixed(1)} + {basePlanLgorPoints.toFixed(1)} + {incrementalOffShelfPoints.toFixed(1)} = {finalScore.toFixed(1)}
            </p>
          </div>

          {/* LGOR Rep % breakdown */}
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">LGOR Rep % Breakdown</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Plan LGOR %</span>
                <span className="font-bold">{demoBasePlanLgorPercent}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Incremental Raw LGOR %</span>
                <span className="font-bold">{incrementalRawLgorPercent.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2">
                <span>LGOR Rep %</span>
                <span className="text-blue-700">{lgorRepPercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Off-shelf line items */}
          {activeItems.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">Off-Shelf Line Items</p>
              <div className="space-y-2">
                {activeItems.map(e => (
                  <div key={e.id} className="flex justify-between text-xs">
                    <span className="text-gray-600 truncate flex-1 mr-2">{e.productName} · {e.location}</span>
                    <span className="font-semibold">{e.itemPoints.toFixed(1)} pts ({e.peakWeekMultiplier}×)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comparison table */}
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">Comparison</p>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div className="text-gray-400">Metric</div>
              <div className="text-gray-400">Previous</div>
              <div className="text-gray-400">Current</div>
              <div className="text-gray-700 text-left">PSS Score</div>
              <div className="font-semibold">{previousScore.score}</div>
              <div className="font-bold text-blue-700">{finalScore.toFixed(1)}</div>
              <div className="text-gray-700 text-left">LGOR Rep %</div>
              <div className="font-semibold">{previousScore.lgorRepPercent}%</div>
              <div className="font-bold text-blue-700">{lgorRepPercent.toFixed(1)}%</div>
            </div>
            <p className="text-xs text-amber-600 italic mt-2">Demo values — pending business confirmation</p>
          </div>

          {/* Snapshots */}
          {snapshots.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">Submission History</p>
              {snapshots.map((snap, i) => (
                <div key={snap.id} className="flex justify-between text-xs border-b last:border-0 py-1">
                  <span className="text-gray-500">Submission {i + 1}</span>
                  <span className="font-semibold">{snap.finalScore.toFixed(1)} pts · {snap.lgorRepPercent.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 pt-2">
            {!submitted ? (
              <button
                onClick={submitScorecard}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-sm"
              >
                Submit Scorecard
              </button>
            ) : (
              <div className="border border-green-200 bg-green-50 rounded-lg p-3 text-center">
                <p className="text-sm font-semibold text-green-700">Scorecard Submitted</p>
                <p className="text-xs text-green-600 mt-1">Score: {finalScore.toFixed(1)} · LGOR Rep: {lgorRepPercent.toFixed(1)}%</p>
              </div>
            )}
            <button
              onClick={() => navigate('/scorecard/revisit')}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold text-sm"
            >
              Revisit Follow-Up
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full border border-gray-200 text-gray-500 py-2 rounded-lg text-sm"
            >
              Back to Visit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
