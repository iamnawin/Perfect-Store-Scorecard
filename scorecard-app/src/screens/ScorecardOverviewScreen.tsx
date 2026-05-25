import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { basePlanItems, demoBasePlanLgorPercent } from '../data/mock'
import { getAnsweredCount } from '../lib/scorecard'

const SECTIONS = [
  { id: 'base-plan', label: 'Base Plan Execution', sub: 'Yes / No / Partial / N/A per item', route: '/scorecard/base-plan' },
  { id: 'base-plan-lgor', label: 'Base Plan LGOR Review', sub: 'Business coverage from base plan', route: '/scorecard/base-plan-lgor' },
  { id: 'incremental', label: 'Incremental / Off-Shelf Capture', sub: 'SKU, location, quantity, peak week', route: '/scorecard/incremental' },
  { id: 'opportunity', label: 'Opportunity Layer', sub: 'High-LGOR SKUs not yet placed', route: '/scorecard/opportunity' },
  { id: 'recommendations', label: 'Demand Signals', sub: 'Missing, Not Enough, Capacity Gap …', route: '/scorecard/recommendations' },
  { id: 'summary', label: 'Score Summary', sub: 'Final PSS Score + LGOR Rep %', route: '/scorecard/summary' },
  { id: 'revisit', label: 'Revisit / Follow-Up', sub: 'Flag gaps for manager visibility', route: '/scorecard/revisit' },
]

export function ScorecardOverviewScreen() {
  const navigate = useNavigate()
  const { executionAnswers, offShelfItems, finalScore, lgorRepPercent, revisitItems, visitStatus } = useApp()

  const answeredExec = getAnsweredCount(executionAnswers)
  const activeOffShelf = offShelfItems.filter(e => e.status !== 'removed').length
  const openRevisits = revisitItems.filter(r => r.status === 'Open' || r.status === 'In Progress').length

  function getSectionStatus(id: string): { done: boolean; detail: string } {
    if (id === 'base-plan') return { done: answeredExec === basePlanItems.length, detail: `${answeredExec} / ${basePlanItems.length} items answered` }
    if (id === 'base-plan-lgor') return { done: true, detail: `${demoBasePlanLgorPercent}% LGOR (demo value)` }
    if (id === 'incremental') return { done: activeOffShelf > 0, detail: `${activeOffShelf} SKU${activeOffShelf !== 1 ? 's' : ''} captured` }
    if (id === 'opportunity') return { done: false, detail: 'Review recommended SKUs' }
    if (id === 'recommendations') return { done: false, detail: 'View demand signals' }
    if (id === 'summary') return { done: visitStatus === 'Submitted', detail: visitStatus === 'Submitted' ? 'Submitted' : 'Review and submit' }
    if (id === 'revisit') return { done: openRevisits === 0, detail: openRevisits > 0 ? `${openRevisits} open items` : 'No open items' }
    return { done: false, detail: '' }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-blue-600 text-sm font-medium">← Visit</button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Scorecard</h1>
            <p className="text-xs text-gray-400">Q1 2026 · Home Depot #1907</p>
          </div>
        </div>

        {/* Live Score Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 mb-5 text-white">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-2">Live Score</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-bold">{finalScore.toFixed(1)}</p>
              <p className="text-xs text-blue-200 mt-0.5">Final PSS Score</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-300">{lgorRepPercent.toFixed(1)}%</p>
              <p className="text-xs text-blue-200 mt-0.5">LGOR Rep %</p>
            </div>
          </div>
          <p className="text-xs text-blue-300 mt-3 italic">Demo values — pending business confirmation</p>
        </div>

        {/* Sections */}
        <div className="space-y-2">
          {SECTIONS.map((section, i) => {
            const { done, detail } = getSectionStatus(section.id)
            return (
              <button
                key={section.id}
                onClick={() => navigate(section.route)}
                className="w-full bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 text-left shadow-sm hover:border-blue-200 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                  done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {done ? '✓' : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{section.label}</p>
                  <p className="text-xs text-gray-400 truncate">{detail}</p>
                </div>
                <span className="text-gray-300 text-sm">›</span>
              </button>
            )
          })}
        </div>

        {/* Formula reminder */}
        <div className="mt-5 bg-gray-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 mb-1">Score Formula</p>
          <p className="text-xs text-gray-600">Final PSS Score = Execution Score + Base Plan LGOR Points + Incremental Off-Shelf Points</p>
          <p className="text-xs text-gray-500 mt-1">LGOR Rep % = Base Plan LGOR % + Incremental Raw LGOR %</p>
        </div>
      </div>
    </div>
  )
}
