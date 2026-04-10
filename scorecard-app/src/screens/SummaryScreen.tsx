import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, CheckCircle, Send, Mail, MessageSquare, RotateCcw, Flag, ChevronRight } from 'lucide-react'
import { PhoneShell } from '../components/PhoneShell'
import { TopBar } from '../components/TopBar'
import { TrellisBot } from '../components/TrellisBot'
import { useApp } from '../context/useApp'
import { checklistItems, previousSnapshot, store, trellisBotInsights } from '../data/mock'

export function SummaryScreen() {
  const navigate = useNavigate()
  const {
    checklist, offShelf, photoCaption, notes,
    revisitRequired, shelfResetNeeded,
    trellisEnabled, executionScore, totalScore, lgorPct, riskDelta,
  } = useApp()
  const [submitted, setSubmitted] = useState(false)

  const scoreDelta = totalScore - previousSnapshot.score
  const lgorDelta = +(lgorPct - 6.8).toFixed(1)

  const yesItems = checklistItems.filter(i => checklist[i.id] === 'yes')
  const noItems = checklistItems.filter(i => checklist[i.id] === 'no')

  if (submitted) {
    return (
      <PhoneShell>
        <div className="flex-1 flex flex-col items-center justify-center bg-surface-low px-6 text-center gap-5">
          <div className="w-20 h-20 rounded-full bg-[#e6f5f0] flex items-center justify-center">
            <CheckCircle size={40} className="text-[#00735c]" />
          </div>
          <div>
            <p className="text-[20px] font-bold text-on-surface">Scorecard Submitted</p>
            <p className="text-[13px] text-on-surface-variant mt-1">Q1 2026 · Home Depot #1907</p>
          </div>
          <div className="bg-surface-lowest rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-5 py-4 w-full">
            <p className="text-[13px] text-on-surface-variant mb-1">Total Score</p>
            <p className="text-[32px] font-bold text-on-surface">{totalScore}</p>
            <p className="text-[12px] text-[#00735c] font-semibold mt-0.5">
              {scoreDelta >= 0 ? '+' : ''}{scoreDelta} pts vs. last visit
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-xl text-[15px] font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #005da9 0%, #0176d3 100%)' }}
          >
            Return to Home
          </button>
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell>
      <TopBar title="Score Summary" subtitle={store.scorecard} showBack showTrellisToggle />

      <div className="flex-1 overflow-y-auto bg-surface-low">
        {trellisEnabled && (
          <div className="pt-3">
            <TrellisBot insight={trellisBotInsights.summary} />
          </div>
        )}

        {/* Score hero */}
        <div className="mx-4 mt-3">
          <div className="bg-primary rounded-xl p-5 text-white">
            <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-1">Total Score</p>
            <div className="flex items-end gap-3">
              <span className="text-[44px] font-bold leading-none">{totalScore}</span>
              <div className="mb-1">
                <span className={`text-[13px] font-semibold ${scoreDelta >= 0 ? 'text-[#66e0b8]' : 'text-red-300'}`}>
                  {scoreDelta >= 0 ? '+' : ''}{scoreDelta} pts
                </span>
                <p className="text-[11px] text-white/50">vs. {previousSnapshot.date}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metric cards */}
        <div className="mx-4 mt-3 grid grid-cols-2 gap-2">
          <MetricCard
            label="Execution Score"
            value={`${executionScore}%`}
            delta={`${executionScore - 72}%`}
            positive={executionScore >= 72}
            sub={`${yesItems.length} of ${checklistItems.length} items`}
          />
          <MetricCard
            label="LGOR %"
            value={`${lgorPct.toFixed(1)}%`}
            delta={`${lgorDelta >= 0 ? '+' : ''}${lgorDelta}%`}
            positive={lgorDelta >= 0}
            sub={`${offShelf.length} off-shelf entry`}
          />
          <MetricCard
            label="Risk Delta"
            value={`${riskDelta}%`}
            delta={`${riskDelta}%`}
            positive={riskDelta < 0}
            sub="vs. prior period"
            wide
          />
        </div>

        {/* Checklist breakdown */}
        <div className="bg-surface-lowest mx-4 mt-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-4 py-3 border-b border-outline/50">
            <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Execution Detail</p>
          </div>
          <div className="divide-y divide-outline/40">
            {yesItems.map(item => (
              <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-[13px] text-on-surface">{item.label}</span>
                <span className="text-[11px] font-semibold text-[#00735c] bg-[#e6f5f0] px-2 py-0.5 rounded-full">+{item.weight}</span>
              </div>
            ))}
            {noItems.map(item => (
              <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-[13px] text-on-surface-variant line-through">{item.label}</span>
                <span className="text-[11px] font-semibold text-red-400 bg-red-50 px-2 py-0.5 rounded-full">Miss</span>
              </div>
            ))}
            {checklistItems.filter(i => !checklist[i.id]).map(item => (
              <div key={item.id} className="flex items-center justify-between px-4 py-2.5 opacity-40">
                <span className="text-[13px] text-on-surface-variant">{item.label}</span>
                <span className="text-[11px] text-on-surface-variant">—</span>
              </div>
            ))}
          </div>
        </div>

        {/* Off-shelf entries */}
        {offShelf.length > 0 && (
          <div className="bg-surface-lowest mx-4 mt-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-4 py-3 border-b border-outline/50">
              <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Off-Shelf Captures ({offShelf.length})</p>
            </div>
            {offShelf.map(entry => (
              <div key={entry.id} className="flex items-center justify-between px-4 py-2.5 border-b border-outline/40 last:border-0">
                <div>
                  <p className="text-[13px] font-medium text-on-surface">{entry.product}</p>
                  <p className="text-[11px] text-on-surface-variant">{entry.location} · {entry.quantity} units</p>
                </div>
                <ChevronRight size={13} className="text-outline" />
              </div>
            ))}
          </div>
        )}

        {/* Flags */}
        {(revisitRequired || shelfResetNeeded || photoCaption || notes) && (
          <div className="bg-surface-lowest mx-4 mt-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-4 py-3 border-b border-outline/50">
              <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Flags & Notes</p>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              {revisitRequired && (
                <div className="flex items-center gap-2">
                  <RotateCcw size={13} className="text-tertiary" />
                  <span className="text-[13px] text-on-surface">Revisit Required</span>
                </div>
              )}
              {shelfResetNeeded && (
                <div className="flex items-center gap-2">
                  <Flag size={13} className="text-tertiary" />
                  <span className="text-[13px] text-on-surface">Shelf Reset Needed</span>
                </div>
              )}
              {photoCaption && (
                <p className="text-[12px] text-on-surface-variant">Photo: {photoCaption}</p>
              )}
              {notes && (
                <p className="text-[12px] text-on-surface-variant">Notes: {notes}</p>
              )}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>

      {/* Actions */}
      <div className="shrink-0 bg-white/80 backdrop-blur-md border-t border-outline/40 px-4 py-4 pb-8 space-y-2">
        <button
          onClick={() => setSubmitted(true)}
          className="w-full py-4 rounded-xl text-[15px] font-semibold text-white flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #005da9 0%, #0176d3 100%)' }}
        >
          <Send size={16} />
          Submit Scorecard
        </button>
        <div className="flex gap-2">
          <button className="flex-1 py-3 rounded-xl text-[13px] font-semibold text-on-surface-variant bg-surface-low border border-outline/50 flex items-center justify-center gap-1.5">
            <Mail size={14} />
            Email PDF
          </button>
          <button className="flex-1 py-3 rounded-xl text-[13px] font-semibold text-on-surface-variant bg-surface-low border border-outline/50 flex items-center justify-center gap-1.5">
            <MessageSquare size={14} />
            Post to Chatter
          </button>
        </div>
      </div>
    </PhoneShell>
  )
}

function MetricCard({
  label, value, delta, positive, sub, wide,
}: {
  label: string
  value: string
  delta: string
  positive: boolean
  sub: string
  wide?: boolean
}) {
  return (
    <div className={`bg-surface-lowest rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-3.5 ${wide ? 'col-span-2' : ''}`}>
      <p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold mb-1">{label}</p>
      <p className="text-[22px] font-bold text-on-surface leading-tight">{value}</p>
      <div className="flex items-center gap-1 mt-0.5">
        {positive
          ? <TrendingUp size={11} className="text-[#00735c]" />
          : <TrendingDown size={11} className="text-red-500" />}
        <span className={`text-[11px] font-semibold ${positive ? 'text-[#00735c]' : 'text-red-500'}`}>{delta}</span>
      </div>
      <p className="text-[10px] text-on-surface-variant mt-1">{sub}</p>
    </div>
  )
}
