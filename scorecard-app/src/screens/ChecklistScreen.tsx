import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { PhoneShell } from '../components/PhoneShell'
import { TopBar } from '../components/TopBar'
import { TrellisBot } from '../components/TrellisBot'
import { useApp } from '../context/AppContext'
import { checklistItems, trellisBotInsights } from '../data/mock'
import type { ChecklistAnswer } from '../types'

const OPTIONS: { value: ChecklistAnswer; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'na', label: 'N/A' },
]

export function ChecklistScreen() {
  const navigate = useNavigate()
  const { checklist, setChecklistAnswer, executionScore, trellisEnabled } = useApp()

  const answered = Object.values(checklist).filter(Boolean).length
  const total = checklistItems.length
  const progress = answered / total

  return (
    <PhoneShell>
      <TopBar title="Execution Checklist" subtitle="Q1 2026 Store Scorecard" showBack showTrellisToggle />

      {/* Progress */}
      <div className="bg-primary px-4 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-white/70">{answered} / {total} items</span>
          <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1">
            <span className="text-[12px] font-bold text-white">{executionScore}%</span>
            <span className="text-[10px] text-white/70">Score</span>
          </div>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%)' }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-surface-low">
        {trellisEnabled && (
          <div className="pt-3">
            <TrellisBot insight={trellisBotInsights.checklist} />
          </div>
        )}

        <div className="px-4 py-3 space-y-2">
          {checklistItems.map((item) => {
            const answer = checklist[item.id] ?? null
            return (
              <div key={item.id} className="bg-surface-lowest rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-on-surface">{item.label}</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{item.weight} pts</p>
                  </div>
                  {answer === 'yes' && (
                    <span className="text-[11px] font-semibold text-[#00735c] bg-[#e6f5f0] px-2 py-0.5 rounded-full shrink-0">+{item.weight}</span>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  {OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setChecklistAnswer(item.id, value)}
                      className={clsx(
                        'flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-colors border',
                        answer === value
                          ? value === 'yes'
                            ? 'bg-[#00735c] text-white border-[#00735c]'
                            : value === 'no'
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-on-surface-variant text-white border-on-surface-variant'
                          : 'bg-surface-low text-on-surface-variant border-outline/50 active:bg-surface'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="h-4" />
      </div>

      <div className="shrink-0 bg-white/80 backdrop-blur-md border-t border-outline/40 px-4 py-4 pb-8">
        <button
          onClick={() => navigate('/off-shelf')}
          className="w-full py-4 rounded-xl text-[15px] font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #005da9 0%, #0176d3 100%)' }}
        >
          Next — Off-Shelf Capture
        </button>
      </div>
    </PhoneShell>
  )
}
