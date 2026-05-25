import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { store, previousScore } from '../data/mock'

const STATUS_COLORS: Record<string, string> = {
  'Not Started': 'bg-gray-100 text-gray-600',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Submitted': 'bg-green-100 text-green-700',
  'Revisit Required': 'bg-orange-100 text-orange-700',
  'Retake In Progress': 'bg-purple-100 text-purple-700',
  'Resolved': 'bg-green-100 text-green-700',
}

export function VisitStartScreen() {
  const navigate = useNavigate()
  const { visitStatus, finalScore, lgorRepPercent, revisitItems, toast, celebration } = useApp()
  const openRevisits = revisitItems.filter(r => r.status === 'Open' || r.status === 'In Progress').length
  const statusColor = STATUS_COLORS[visitStatus] ?? 'bg-gray-100 text-gray-600'
  const isActive = visitStatus !== 'Not Started'

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg max-w-xs w-full mx-4">
          <p className="font-semibold">{toast.title}</p>
          <p className="text-gray-300 text-xs">{toast.message}</p>
        </div>
      )}

      {/* Celebration */}
      {celebration && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg max-w-xs w-full mx-4">
          <p className="font-semibold">{celebration.title}</p>
          <p className="text-green-100 text-xs">{celebration.message}</p>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Perfect Store Scorecard</span>
          <button onClick={() => navigate('/manager')} className="text-xs text-blue-600 font-semibold">
            Manager View →
          </button>
        </div>

        {/* Store Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{store.banner} · Store #{store.number}</p>
        </div>

        {/* Store Context */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">District</p>
              <p className="font-medium text-gray-800">{store.district}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Territory</p>
              <p className="font-medium text-gray-800">{store.territory}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Quarter</p>
              <p className="font-medium text-gray-800">{store.quarter}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Visit Date</p>
              <p className="font-medium text-gray-800">{store.visitDate}</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 mt-4 pt-3">
            <span className="text-xs text-gray-500">Scorecard Status</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>{visitStatus}</span>
          </div>
        </div>

        {/* Previous Score */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Previous Scorecard</p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-800">{previousScore.score.toFixed(1)}</p>
              <p className="text-xs text-gray-400 mt-0.5">Final PSS Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{previousScore.lgorRepPercent}%</p>
              <p className="text-xs text-gray-400 mt-0.5">LGOR Rep %</p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">{previousScore.date} · {previousScore.submittedBy}</p>
        </div>

        {/* Current Score (if in progress) */}
        {isActive && (
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 mb-4">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-3">Current Scorecard</p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-800">{finalScore.toFixed(1)}</p>
                <p className="text-xs text-blue-400 mt-0.5">Final PSS Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{lgorRepPercent.toFixed(1)}%</p>
                <p className="text-xs text-blue-400 mt-0.5">LGOR Rep %</p>
              </div>
            </div>
          </div>
        )}

        {/* Open Revisits Banner */}
        {openRevisits > 0 && (
          <div
            className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-4 flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/scorecard/revisit')}
          >
            <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-orange-600 font-bold">{openRevisits}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-800">Open Revisit Items</p>
              <p className="text-xs text-orange-500">Tap to review →</p>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="space-y-3">
          {visitStatus === 'Not Started' && (
            <button
              onClick={() => navigate('/scorecard')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 font-semibold text-base shadow-sm transition-colors"
            >
              Start Scorecard
            </button>
          )}

          {(visitStatus === 'In Progress' || visitStatus === 'Revisit Required') && (
            <button
              onClick={() => navigate('/scorecard')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 font-semibold text-base shadow-sm transition-colors"
            >
              Continue Scorecard
            </button>
          )}

          {visitStatus === 'Submitted' && (
            <>
              <button
                onClick={() => navigate('/scorecard/summary')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 font-semibold text-base shadow-sm transition-colors"
              >
                View Submission
              </button>
              <button
                onClick={() => navigate('/scorecard')}
                className="w-full bg-white border border-blue-200 text-blue-600 rounded-xl py-4 font-semibold text-base transition-colors"
              >
                Retake Scorecard
              </button>
            </>
          )}

          <button
            onClick={() => navigate('/scorecard/revisit')}
            className="w-full bg-white border border-gray-200 text-gray-700 rounded-xl py-3 font-medium text-sm transition-colors"
          >
            Revisit / Follow-Up
          </button>
        </div>

        {/* Score Formula Note */}
        <div className="mt-6 bg-gray-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 mb-1">Score Formula</p>
          <p className="text-xs text-gray-600">Final PSS Score = Execution Score + Base Plan LGOR Points + Incremental Off-Shelf Points</p>
          <p className="text-xs text-gray-500 mt-1">LGOR Rep % = Base Plan LGOR % + Incremental Raw LGOR %</p>
          <p className="text-xs text-gray-400 italic mt-2">Demo values — pending business confirmation</p>
        </div>
      </div>
    </div>
  )
}
