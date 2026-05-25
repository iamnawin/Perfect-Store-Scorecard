import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { generateOpportunityItems } from '../lib/scorecard'

export function OpportunityScreen() {
  const navigate = useNavigate()
  const { offShelfItems } = useApp()

  const opportunities = generateOpportunityItems(offShelfItems)

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
        <div className="bg-blue-700 text-white px-4 pt-10 pb-4">
          <button onClick={() => navigate('/scorecard/incremental')} className="text-blue-200 text-sm mb-3">← Back</button>
          <h1 className="text-lg font-bold">Opportunity SKUs</h1>
          <p className="text-xs text-blue-200 mt-1">Recommended SKUs not yet off-shelf</p>
        </div>

        <div className="flex-1 px-4 py-4 space-y-4">
          {/* Guidance note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <p className="font-semibold mb-1">Guidance only</p>
            <p>These SKUs will not change your current score. Add them via Incremental Off-Shelf to earn points.</p>
          </div>

          {opportunities.length === 0 ? (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm font-semibold text-green-700">All recommended SKUs are off-shelf!</p>
              <p className="text-xs text-green-600 mt-1">Great coverage on priority products.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {opportunities.map(opp => (
                <div key={opp.skuId} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-700 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                          #{opp.rank}
                        </span>
                        <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                          {opp.lgorPercent}% LGOR
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{opp.productName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-600">
                    <div>
                      <p className="text-gray-400">Peak Week</p>
                      <p className="font-semibold">{opp.peakWeekUnits} ea</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Quarterly</p>
                      <p className="font-semibold">{opp.quarterlyUnits} units</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Value</p>
                      <p className="font-semibold">${(opp.quarterlyDollarValue / 1000).toFixed(1)}K</p>
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 italic mt-1">Demo values — pending business confirmation</p>
                  <button
                    onClick={() => navigate('/scorecard/incremental')}
                    className="mt-2 w-full border border-blue-700 text-blue-700 text-xs py-1.5 rounded"
                  >
                    Add to Off-Shelf Capture →
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => navigate('/scorecard/recommendations')}
            className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm"
          >
            Next: Recommendations →
          </button>
        </div>
      </div>
    </div>
  )
}
