import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, FileText, RotateCcw, Flag } from 'lucide-react'
import { PhoneShell } from '../components/PhoneShell'
import { TopBar } from '../components/TopBar'
import { TrellisBot } from '../components/TrellisBot'
import { useApp } from '../context/useApp'
import { trellisBotInsights } from '../data/mock'

export function PhotoScreen() {
  const navigate = useNavigate()
  const { photoCaption, setPhotoCaption, notes, setNotes, revisitRequired, setRevisitRequired, shelfResetNeeded, setShelfResetNeeded, trellisEnabled } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <PhoneShell>
      <TopBar title="Photo & Notes" subtitle="Proof of execution" showBack showTrellisToggle />

      <div className="flex-1 overflow-y-auto bg-surface-low">
        {trellisEnabled && (
          <div className="pt-3">
            <TrellisBot insight={trellisBotInsights.photo} />
          </div>
        )}

        {/* Photo upload */}
        <div className="bg-surface-lowest mx-4 mt-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-4 py-3 border-b border-outline/50">
            <div className="flex items-center gap-1.5">
              <Camera size={14} className="text-primary" />
              <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Photo Proof</p>
            </div>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-3 py-10 bg-surface-low active:bg-surface transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera size={24} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-on-surface">Upload Photo</p>
              <p className="text-[12px] text-on-surface-variant mt-0.5">Tap to select from library or camera</p>
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" />

          {/* Caption */}
          <div className="px-4 py-3 border-t border-outline/50">
            <p className="text-[12px] font-semibold text-on-surface-variant mb-2">Caption <span className="text-on-surface-variant font-normal">(required)</span></p>
            <input
              type="text"
              value={photoCaption}
              onChange={e => setPhotoCaption(e.target.value)}
              placeholder="e.g. Endcap set — Weed & Feed 80 units"
              className="w-full text-[14px] text-on-surface bg-surface-low rounded-lg px-3 py-2.5 outline-none border border-outline/40 focus:border-primary transition-colors placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="bg-surface-lowest mx-4 mt-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-4 py-3 border-b border-outline/50">
            <div className="flex items-center gap-1.5">
              <FileText size={14} className="text-primary" />
              <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Notes <span className="font-normal normal-case">(optional)</span></p>
            </div>
          </div>
          <div className="px-4 py-3">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional context for the manager or compliance team..."
              rows={3}
              className="w-full text-[14px] text-on-surface bg-surface-low rounded-lg px-3 py-2.5 outline-none border border-outline/40 focus:border-primary transition-colors resize-none placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-surface-lowest mx-4 mt-3 mb-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] divide-y divide-outline/40">
          <Toggle
            icon={<RotateCcw size={15} className="text-tertiary" />}
            label="Revisit Required"
            description="Flag this store for a follow-up visit"
            value={revisitRequired}
            onChange={setRevisitRequired}
          />
          <Toggle
            icon={<Flag size={15} className="text-tertiary" />}
            label="Shelf Reset Needed"
            description="Planogram needs to be re-set before next visit"
            value={shelfResetNeeded}
            onChange={setShelfResetNeeded}
          />
        </div>
      </div>

      <div className="shrink-0 bg-white/80 backdrop-blur-md border-t border-outline/40 px-4 py-4 pb-8">
        <button
          onClick={() => navigate('/summary')}
          className="w-full py-4 rounded-xl text-[15px] font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #005da9 0%, #0176d3 100%)' }}
        >
          Next — Score Summary
        </button>
      </div>
    </PhoneShell>
  )
}

function Toggle({ icon, label, description, value, onChange }: {
  icon: React.ReactNode
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-on-surface">{label}</p>
        <p className="text-[12px] text-on-surface-variant mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors shrink-0 relative ${value ? 'bg-primary' : 'bg-outline'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}
