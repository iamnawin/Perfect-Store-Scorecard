import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { generateRecommendations } from '../lib/scorecard'
import type { RecommendationType } from '../types'

const TYPE_CONFIG: Record<RecommendationType, { label: string; color: string; bg: string }> = {
  'missing': { label: 'Missing', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  'not-enough': { label: 'Not Enough', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  'empty-calories': { label: 'Empty Calories', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
  'missing-map': { label: 'Missing MAP', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  'peak-week-gap': { label: 'Peak Week Gap', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  'capacity-gap': { label: 'Capacity Gap', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
}

const SEVERITY_DOT: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-orange-400',
  low: 'bg-gray-400',
}

export function RecommendationsScreen() {
  const navigate = useNavigate()
  const { executionAnswers, offShelfItems } = useApp()
  const recommendations = generateRecommendations(executionAnswers, offShelfItems)
  const highCount = recommendations.filter(r => r.severity === 'high').length
  const activeRecs = recommendations.filter(r => r.status === 'active')

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/scorecard/opportunity')} className="text-blue-600 text-sm font-medium">← Opportunity</button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Demand Signals</h1>
            <p className="text-xs text-gray-400">{activeRecs.length} signal{activeRecs.length !== 1 ? 's' : ''} · {highCount} high priority</p>
          </div>
        </div>

        {/* Explainer */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 text-xs text-blue-700">
          <p className="font-semibold mb-1">Rule-Based Guidance</p>
          <p>These signals are calculated from your captured data. They are <span className="font-semibold">guidance only</span> and do not automatically change the numeric score.</p>
        </div>

        {/* Signal type legend */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Signal Types</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
              <div key={type} className={`rounded-lg px-2 py-1.5 border ${cfg.bg}`}>
                <span className={`font-semibold ${cfg.color}`}>{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {activeRecs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="font-semibold text-green-700">No signals flagged</p>
            <p className="text-xs text-gray-400 mt-1">All captured items look good based on available data.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeRecs.map(rec => {
              const cfg = TYPE_CONFIG[rec.type]
              return (
                <div key={rec.id} className={`rounded-xl border p-4 ${cfg.bg}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${SEVERITY_DOT[rec.severity]}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          rec.severity === 'high' ? 'bg-red-100 text-red-600' :
                          rec.severity === 'medium' ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>{rec.severity}</span>
                      </div>
                      <p className="text-sm text-gray-800">{rec.message}</p>
                      {rec.currentValue !== undefined && rec.recommendedValue !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">
                          Current: {rec.currentValue} units · Target: {rec.recommendedValue} units
                        </p>
                      )}
                      {rec.displayLocation && (
                        <p className="text-xs text-gray-400 mt-0.5">Location: {rec.displayLocation}</p>
                      )}
                    </div>
                  </div>
                  {rec.severity === 'high' && (
                    <button
                      onClick={() => navigate('/scorecard/revisit')}
                      className="mt-3 w-full border border-current border-opacity-30 rounded-lg py-2 text-xs font-semibold text-gray-600"
                    >
                      Flag for Revisit
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <p className="text-xs text-gray-400 italic text-center mt-4">Recommendations are guidance only — they do not reduce score unless business confirms penalty values</p>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate('/scorecard/summary')}
            className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm"
          >
            Next: Score Summary →
          </button>
        </div>
      </div>
    </div>
  )
}
