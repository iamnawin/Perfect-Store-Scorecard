import { Sparkles, X } from 'lucide-react'
import { useState } from 'react'

interface TrellisBotProps {
  insight: string
}

export function TrellisBot({ insight }: TrellisBotProps) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="mx-4 mb-3 bg-[#f0f7ff] border border-[#cde4f8] rounded-xl p-3 flex gap-2.5 items-start">
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles size={13} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-0.5">Trellis Bot</p>
        <p className="text-[13px] text-on-surface leading-snug">{insight}</p>
      </div>
      <button onClick={() => setDismissed(true)} className="text-on-surface-variant shrink-0 mt-0.5">
        <X size={14} />
      </button>
    </div>
  )
}
