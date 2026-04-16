import { CheckCircle2, Flag, Sparkles } from 'lucide-react'
import { useApp } from '../context/useApp'

const confettiPieces = Array.from({ length: 18 }, (_, index) => index)

export function FeedbackLayer() {
  const { toast, celebration } = useApp()

  if (!toast && !celebration) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {toast && (
        <div className="absolute inset-x-4 top-4">
          <div className="codex-toast-enter rounded-xl border border-[#cde8d3] bg-white/96 px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.16)] backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#edf7ee] text-[#2e844a]">
                <Flag size={14} />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-on-surface">{toast.title}</p>
                <p className="mt-1 text-[12px] leading-snug text-on-surface-variant">{toast.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {celebration && (
        <>
          <div className="absolute inset-x-6 top-20">
            <div className="codex-toast-enter rounded-2xl border border-[#cde8d3] bg-white/98 px-5 py-4 text-center shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#edf7ee] text-[#2e844a]">
                <CheckCircle2 size={20} />
              </div>
              <p className="mt-3 text-[16px] font-semibold text-on-surface">{celebration.title}</p>
              <p className="mt-1 text-[13px] leading-snug text-on-surface-variant">{celebration.message}</p>
            </div>
          </div>
          <div className="absolute inset-x-0 top-14 flex justify-center">
            <div className="relative h-36 w-64">
              {confettiPieces.map(piece => (
                <span
                  key={piece}
                  className="codex-confetti absolute top-12 h-3 w-2 rounded-full"
                  style={{
                    left: `${12 + (piece % 9) * 9}%`,
                    background: ['#0176d3', '#2e844a', '#f2cf5b', '#ba0517'][piece % 4],
                    animationDelay: `${piece * 40}ms`,
                    transform: `rotate(${piece * 19}deg)`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="absolute inset-x-0 top-10 flex justify-center text-[#0176d3]">
            <Sparkles size={18} />
          </div>
        </>
      )}
    </div>
  )
}
