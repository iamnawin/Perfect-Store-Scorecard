import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { generateOpportunityItems } from '../lib/scorecard'

export function OpportunityScreen() {
  const navigate = useNavigate()
  const { offShelfItems } = useApp()
  const opportunities = generateOpportunityItems(offShelfItems)

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/scorecard/incremental')} className="text-blue-600 text-sm font-medium">← Off-Shelf</button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Opportunity Layer</h1>
            <p className="text-xs text-gray-400">{opportunities.length} recommended SKU{opportunities.length !== 1 ? 's' : ''} not yet placed</p>
          </div>
        </div>

        {/* Explainer */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 text-xs text-blue-700">
          <p className="font-semibold mb-1">Opportunity = Recommended SKUs − Current Off-Shelf SKUs</p>
          <p>Adding an opportunity SKU off-shelf and retaking the scorecard will increase Incremental Off-Shelf Points.</p>
          <p className="mt-1 font-medium">Opportunities are guidance only — they do not change the current score.</p>
        </div>

        {opportunities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="font-semibold text-green-700">All recommended SKUs are off-shelf!</p>
            <p className="text-xs text-gray-400 mt-1">No opportunity gaps for this visit.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {opportunities.map(opp => (
              <div key={opp.skuId} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">Rank #{opp.rank}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{opp.lgorPercent}% LGOR</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{opp.productName}</p>
                    <p className="text-xs text-gray-400 mt-1">Peak week: {opp.peakWeekUnits} units</p>
                    <p className="text-xs text-gray-400">Quarterly: {opp.quarterlyUnits.toLocaleString()} units · ${opp.quarterlyDollarValue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-3 bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Recommended action:</span> {opp.recommendedAction}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/scorecard/incremental')}
                  className="mt-3 w-full border border-blue-200 text-blue-600 rounded-lg py-2 text-xs font-semibold"
                >
                  Add to Off-Shelf Capture
                </button>
                <p className="text-xs text-gray-400 italic text-center mt-1">Demo values — pending business confirmation</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate('/scorecard/recommendations')}
            className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm"
          >
            Next: Demand Signals →
          </button>
        </div>
      </div>
    </div>
  )
}
