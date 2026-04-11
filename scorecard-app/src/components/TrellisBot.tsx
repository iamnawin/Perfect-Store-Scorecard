import { Sparkles, X } from 'lucide-react'
import { useState } from 'react'

interface TrellisBotProps {
  title: string
  insight: string
  prompts?: string[]
}

export function TrellisBot({ title, insight, prompts = [] }: TrellisBotProps) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="mx-4 mb-3 border border-[#c9d8ea] bg-surface-lowest rounded-lg px-4 py-3 flex gap-3 items-start">
      <div className="w-8 h-8 rounded-md bg-[#edf4ff] border border-[#c9d8ea] flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles size={14} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.12em]">Trellis Assistant</p>
          <span className="text-[10px] text-on-surface-variant">powered by Agentforce</span>
        </div>
        <p className="text-[13px] font-semibold text-on-surface">{title}</p>
        <p className="text-[12px] text-on-surface-variant leading-snug mt-1">{insight}</p>
        {prompts.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {prompts.map(prompt => (
              <button
                key={prompt}
                type="button"
                className="rounded-md border border-outline bg-surface-low px-2.5 py-1.5 text-[11px] font-medium text-on-surface-variant"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>
      <button type="button" onClick={() => setDismissed(true)} className="text-on-surface-variant shrink-0 mt-0.5">
        <X size={14} />
      </button>
    </div>
  )
}
