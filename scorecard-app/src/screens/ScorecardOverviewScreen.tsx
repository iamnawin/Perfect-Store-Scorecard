import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'

const sections = [
  { label: 'Base Plan Execution', route: '/scorecard/base-plan', detail: '8 items · 100 pts max' },
  { label: 'Base Plan LGOR Review', route: '/scorecard/base-plan-lgor', detail: '1:1 LGOR % → pts conversion' },
  { label: 'Incremental Off-Shelf', route: '/scorecard/incremental', detail: 'LGOR % × Peak Week Multiplier' },
  { label: 'Opportunity SKUs', route: '/scorecard/opportunity', detail: 'Recommended SKUs not yet placed' },
  { label: 'Recommendations', route: '/scorecard/recommendations', detail: '6 signal types · guidance only' },
  { label: 'Score Summary', route: '/scorecard/summary', detail: 'Full breakdown + submit' },
  { label: 'Revisit Follow-Up', route: '/scorecard/revisit', detail: 'Flag items for accountability' },
]

export function ScorecardOverviewScreen() {
  const navigate = useNavigate()
  const {
    finalScore,
    lgorRepPercent,
    executionScore,
    basePlanLgorPoints,
    incrementalOffShelfPoints,
    executionAnswers,
    offShelfItems,
    revisitItems,
  } = useApp()

  const answeredExecution = Object.keys(executionAnswers).length
  const activeOffShelf = offShelfItems.filter(e => e.status === 'active').length
  const openRevisits = revisitItems.filter(r => r.status === 'Open').length

  const sectionStatus = [
    answeredExecution > 0 ? `${answeredExecution}/8 answered` : 'Not started',
    `${basePlanLgorPoints.toFixed(1)} pts`,
    activeOffShelf > 0 ? `${activeOffShelf} SKU${activeOffShelf !== 1 ? 's' : ''} captured` : 'None added',
    'View',
    'View',
    finalScore > 0 ? `${finalScore.toFixed(1)} pts` : 'Not submitted',
    openRevisits > 0 ? `${openRevisits} open` : 'None',
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
        {/* Score banner */}
        <div className="bg-blue-700 text-white px-4 pt-10 pb-6">
          <button onClick={() => navigate('/')} className="text-blue-200 text-sm mb-3">← Back</button>
          <p className="text-xs text-blue-200 uppercase tracking-wider mb-1">Q1 2026 Scorecard</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-4xl font-bold">{finalScore.toFixed(1)}</p>
              <p className="text-xs text-blue-200 mt-1">Final PSS Score</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{lgorRepPercent.toFixed(1)}%</p>
              <p className="text-xs text-blue-200 mt-1">LGOR Rep %</p>
            </div>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-blue-200">
            <span>Exec: {executionScore.toFixed(1)}</span>
            <span>Base: {basePlanLgorPoints.toFixed(1)}</span>
            <span>Incr: {incrementalOffShelfPoints.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex-1 px-4 py-4 space-y-2">
          {sections.map((section, i) => (
            <button
              key={section.route}
              onClick={() => navigate(section.route)}
              className="w-full flex items-center justify-between border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">{section.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{section.detail}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600">{sectionStatus[i]}</span>
                <span className="text-gray-400">›</span>
              </div>
            </button>
          ))}

          <div className="pt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3 space-y-1">
            <p className="font-semibold text-gray-700">Formula</p>
            <p>Final PSS Score = Execution + Base Plan LGOR + Incremental Off-Shelf</p>
            <p className="text-amber-600 italic">Demo values — pending business confirmation</p>
          </div>
        </div>
      </div>
    </div>
  )
}
