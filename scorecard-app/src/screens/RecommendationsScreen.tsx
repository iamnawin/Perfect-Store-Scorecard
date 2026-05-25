import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { generateRecommendations } from '../lib/scorecard'
import type { RecommendationType } from '../types'

const typeLabels: Record<RecommendationType, string> = {
  missing: 'Missing SKU',
  'not-enough': 'Not Enough',
  'empty-calories': 'Empty Calories',
  'missing-map': 'Missing MAP',
  'peak-week-gap': 'Peak Week Gap',
  'capacity-gap': 'Capacity Gap',
}

const typeColors: Record<RecommendationType, string> = {
  missing: 'bg-red-100 text-red-700',
  'not-enough': 'bg-orange-100 text-orange-700',
  'empty-calories': 'bg-yellow-100 text-yellow-700',
  'missing-map': 'bg-red-100 text-red-700',
  'peak-week-gap': 'bg-orange-100 text-orange-700',
  'capacity-gap': 'bg-purple-100 text-purple-700',
}

const severityDot: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-orange-400',
  low: 'bg-gray-300',
}

export function RecommendationsScreen() {
  const navigate = useNavigate()
  const { executionAnswers, offShelfItems, addRevisitItem, setRevisitRequired } = useApp()

  const recommendations = generateRecommendations(executionAnswers, offShelfItems)

  function flagForRevisit(message: string, sku?: string, location?: string) {
    setRevisitRequired(true)
    addRevisitItem({
      id: crypto.randomUUID(),
      reason: message,
      sku,
      displayLocation: location,
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
          <button onClick={() => navigate('/scorecard/opportunity')} className="text-blue-200 text-sm mb-3">← Back</button>
          <h1 className="text-lg font-bold">Recommendations</h1>
          <p className="text-xs text-blue-200 mt-1">{recommendations.length} signal{recommendations.length !== 1 ? 's' : ''} detected</p>
        </div>

        <div className="flex-1 px-4 py-4 space-y-4">
          {/* Guidance note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <p className="font-semibold mb-1">Guidance only</p>
            <p>Recommendations do not reduce or change the numeric score unless business confirms penalty values.</p>
          </div>

          {/* Signal type legend */}
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">Signal Types</p>
            <div className="flex flex-wrap gap-1">
              {(Object.keys(typeLabels) as RecommendationType[]).map(type => (
                <span key={type} className={`text-xs px-2 py-0.5 rounded-full ${typeColors[type]}`}>
                  {typeLabels[type]}
                </span>
              ))}
            </div>
          </div>

          {recommendations.length === 0 ? (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm font-semibold text-green-700">No signals detected</p>
              <p className="text-xs text-green-600 mt-1">Store execution looks strong for this visit.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map(rec => (
                <div key={rec.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severityDot[rec.severity]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${typeColors[rec.type]}`}>
                          {typeLabels[rec.type]}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">{rec.severity} severity</span>
                      </div>
                      <p className="text-xs text-gray-800">{rec.message}</p>
                      {rec.currentValue && (
                        <div className="flex gap-4 mt-1 text-xs">
                          <span className="text-gray-500">Now: <span className="font-semibold text-gray-700">{rec.currentValue}</span></span>
                          {rec.recommendedValue && (
                            <span className="text-gray-500">Target: <span className="font-semibold text-blue-700">{rec.recommendedValue}</span></span>
                          )}
                        </div>
                      )}
                      {rec.severity === 'high' && (
                        <button
                          onClick={() => flagForRevisit(rec.message, rec.sku, rec.displayLocation)}
                          className="mt-2 text-xs border border-orange-400 text-orange-600 px-2 py-1 rounded"
                        >
                          Flag for Revisit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => navigate('/scorecard/summary')}
            className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm"
          >
            Next: Score Summary →
          </button>
        </div>
      </div>
    </div>
  )
}
