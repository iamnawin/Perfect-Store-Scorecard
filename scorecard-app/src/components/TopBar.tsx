import type { ReactNode } from 'react'
import { ChevronLeft, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useApp } from '../context/useApp'

interface TopBarProps {
  title: string
  subtitle?: string
  showBack?: boolean
  showTrellisToggle?: boolean
  rightSlot?: ReactNode
}

export function TopBar({ title, subtitle, showBack = false, showTrellisToggle = false, rightSlot }: TopBarProps) {
  const navigate = useNavigate()
  const { trellisEnabled, toggleTrellis } = useApp()

  return (
    <div className="bg-surface-lowest border-b border-outline px-4 pt-11 pb-3 shrink-0">
      <div className="flex items-start gap-2">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-1 -ml-1 mt-0.5 p-1 rounded-md border border-transparent text-on-surface-variant active:bg-surface-low"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-[15px] font-semibold leading-tight text-on-surface truncate">{title}</h1>
          {subtitle && <p className="text-[11px] text-on-surface-variant mt-0.5">{subtitle}</p>}
        </div>
        {rightSlot ?? (showTrellisToggle && (
          <button
            type="button"
            onClick={toggleTrellis}
            className={clsx(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-semibold transition-colors',
              trellisEnabled
                ? 'bg-[#edf4ff] border-[#b7d5f6] text-primary'
                : 'bg-surface-lowest border-outline text-on-surface-variant'
            )}
          >
            <Sparkles size={11} />
            Ask Trellis
          </button>
        ))}
      </div>
    </div>
  )
}
