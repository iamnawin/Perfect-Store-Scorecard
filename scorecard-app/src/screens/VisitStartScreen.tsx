import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { store, previousScore } from '../data/mock'

export function VisitStartScreen() {
  const navigate = useNavigate()
  const { visitStatus, finalScore, lgorRepPercent, revisitItems } = useApp()

  const openRevisits = revisitItems.filter(r => r.status === 'Open' || r.status === 'In Progress')

  const statusColor: Record<string, string> = {
    'Not Started': 'bg-gray-100 text-gray-600',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Submitted': 'bg-green-100 text-green-700',
    'Revisit Required': 'bg-orange-100 text-orange-700',
    'Retake In Progress': 'bg-purple-100 text-purple-700',
    'Resolved': 'bg-green-100 text-green-700',
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-blue-700 text-white px-4 pt-10 pb-6">
          <p className="text-xs text-blue-200 uppercase tracking-wider mb-1">Active Visit</p>
          <h1 className="text-xl font-bold">{store.name}</h1>
          <p className="text-sm text-blue-200 mt-1">Store #{store.number} · {store.banner}</p>
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <span className="bg-blue-600 rounded px-2 py-0.5">{store.district}</span>
            <span className="bg-blue-600 rounded px-2 py-0.5">{store.territory}</span>
            <span className="bg-blue-600 rounded px-2 py-0.5">{store.quarter}</span>
          </div>
          <p className="text-xs text-blue-200 mt-2">Visit: {store.visitDate} · Rep: {store.rep}</p>
        </div>

        <div className="flex-1 px-4 py-4 space-y-4">
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Scorecard Status</span>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[visitStatus] ?? 'bg-gray-100 text-gray-600'}`}>
              {visitStatus}
            </span>
          </div>

          {/* Previous score */}
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Previous Scorecard</p>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{previousScore.score}</p>
                <p className="text-xs text-gray-500">PSS Score</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-700">{previousScore.lgorRepPercent}%</p>
                <p className="text-xs text-gray-500">LGOR Rep %</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{previousScore.date} · {previousScore.submittedBy}</p>
            <p className="text-xs text-amber-600 mt-1 italic">Demo value — pending business confirmation</p>
          </div>

          {/* Current score (shown once started) */}
          {visitStatus !== 'Not Started' && (
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-2">Current Scorecard</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{finalScore.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">PSS Score</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-700">{lgorRepPercent.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">LGOR Rep %</p>
                </div>
              </div>
            </div>
          )}

          {/* Open revisits banner */}
          {openRevisits.length > 0 && (
            <button
              onClick={() => navigate('/scorecard/revisit')}
              className="w-full bg-orange-50 border border-orange-200 rounded-lg p-3 text-left"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-orange-800">Open Revisit Items</p>
                  <p className="text-xs text-orange-600">{openRevisits.length} item{openRevisits.length !== 1 ? 's' : ''} need attention</p>
                </div>
                <span className="text-orange-500 text-lg">›</span>
              </div>
            </button>
          )}

          {/* CTA buttons */}
          <div className="space-y-2 pt-2">
            {visitStatus === 'Not Started' && (
              <button
                onClick={() => navigate('/scorecard')}
                className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm"
              >
                Start Scorecard
              </button>
            )}
            {visitStatus === 'In Progress' && (
              <button
                onClick={() => navigate('/scorecard')}
                className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm"
              >
                Continue Scorecard
              </button>
            )}
            {(visitStatus === 'Submitted' || visitStatus === 'Resolved') && (
              <>
                <button
                  onClick={() => navigate('/scorecard/summary')}
                  className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm"
                >
                  View Submission
                </button>
                <button
                  onClick={() => navigate('/scorecard')}
                  className="w-full border border-blue-700 text-blue-700 py-3 rounded-lg font-semibold text-sm"
                >
                  Retake Scorecard
                </button>
              </>
            )}
            {visitStatus === 'Revisit Required' && (
              <>
                <button
                  onClick={() => navigate('/scorecard/revisit')}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold text-sm"
                >
                  Revisit Follow-Up
                </button>
                <button
                  onClick={() => navigate('/scorecard/summary')}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold text-sm"
                >
                  View Scorecard
                </button>
              </>
            )}
          </div>

          {/* Manager dashboard link */}
          <button
            onClick={() => navigate('/manager')}
            className="w-full border border-gray-200 text-gray-500 py-2 rounded-lg text-xs"
          >
            Manager Dashboard →
          </button>

          {/* Formula note */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700">Score Formula</p>
            <p>Final PSS Score = Execution Score + Base Plan LGOR Points + Incremental Off-Shelf Points</p>
            <p>LGOR Rep % = Base Plan LGOR % + Incremental Raw LGOR %</p>
            <p className="text-amber-600 italic mt-1">Demo values — pending business confirmation</p>
          </div>
        </div>
      </div>
    </div>
  )
}
