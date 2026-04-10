import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, TrendingUp, AlertTriangle, Lightbulb, ChevronRight } from 'lucide-react'
import { PhoneShell } from '../components/PhoneShell'
import { TopBar } from '../components/TopBar'
import { TrellisBot } from '../components/TrellisBot'
import { useApp } from '../context/AppContext'
import { store, previousSnapshot, trellisBotInsights } from '../data/mock'

export function EntryScreen() {
  const navigate = useNavigate()
  const { trellisEnabled } = useApp()

  return (
    <PhoneShell>
      <TopBar
        title={store.name}
        subtitle={`${store.banner} · ${store.city}`}
        showTrellisToggle
      />

      <div className="flex-1 overflow-y-auto bg-surface-low">
        {/* Visit context card */}
        <div className="bg-surface-lowest mx-4 mt-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Active Visit</p>
              <p className="text-[16px] font-semibold text-on-surface">{store.scorecard}</p>
            </div>
            <span className="bg-[#e6f5f0] text-[#00735c] text-[11px] font-semibold px-2.5 py-1 rounded-full">Active</span>
          </div>
          <div className="flex items-center gap-4 text-[13px] text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-primary" />
              <span>{store.banner}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-primary" />
              <span>Apr 10, 2026</span>
            </div>
          </div>
        </div>

        {/* Previous snapshot */}
        <div className="bg-surface-lowest mx-4 mt-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-4 py-3 border-b border-outline/50">
            <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Previous Store Snapshot</p>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-primary" />
                <span className="text-[13px] text-on-surface-variant">Last Score</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-on-surface">{previousSnapshot.score}</span>
                <span className="text-[11px] text-[#00735c] font-semibold bg-[#e6f5f0] px-1.5 py-0.5 rounded-full">+18 pts</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-primary" />
                <span className="text-[13px] text-on-surface-variant">Last Submitted</span>
              </div>
              <span className="text-[13px] font-medium text-on-surface">{previousSnapshot.date}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-tertiary" />
                <span className="text-[13px] text-on-surface-variant">Repeated Gap</span>
              </div>
              <span className="text-[13px] font-medium text-on-surface">{previousSnapshot.gap}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb size={15} className="text-[#00857c]" />
                <span className="text-[13px] text-on-surface-variant">Top Opportunity</span>
              </div>
              <span className="text-[13px] font-medium text-on-surface">{previousSnapshot.opportunity}</span>
            </div>
          </div>
        </div>

        {/* Scorecard steps preview */}
        <div className="mx-4 mt-3 mb-4">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2 px-1">Scorecard Steps</p>
          {['Execution Checklist', 'Off-Shelf Capture', 'Photo & Notes', 'Score Summary'].map((step, i) => (
            <div key={step} className="flex items-center gap-3 py-2.5 px-3 bg-surface-lowest rounded-xl mb-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
              <div className="w-6 h-6 rounded-full bg-surface-low flex items-center justify-center text-[11px] font-bold text-on-surface-variant">
                {i + 1}
              </div>
              <span className="text-[13px] text-on-surface flex-1">{step}</span>
              <ChevronRight size={14} className="text-outline" />
            </div>
          ))}
        </div>

        {trellisEnabled && (
          <div className="mb-2">
            <TrellisBot insight={trellisBotInsights.entry} />
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="shrink-0 bg-white/80 backdrop-blur-md border-t border-outline/40 px-4 py-4 pb-8">
        <button
          onClick={() => navigate('/checklist')}
          className="w-full py-4 rounded-xl text-[15px] font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #005da9 0%, #0176d3 100%)' }}
        >
          Start Scorecard
        </button>
        <p className="text-center text-[11px] text-on-surface-variant mt-2">Rep: {store.rep} · {store.scorecard}</p>
      </div>
    </PhoneShell>
  )
}
