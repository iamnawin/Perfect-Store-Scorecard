import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DemoModeToggle } from './DemoModeToggle'

interface TopBarProps {
  title: string
  subtitle?: string
  showBack?: boolean
  rightSlot?: ReactNode
}

export function TopBar({ title, subtitle, showBack = false, rightSlot }: TopBarProps) {
  const navigate = useNavigate()

  return (
    <div className="bg-surface-lowest border-b border-outline px-4 pt-8 pb-3 shrink-0">
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
          <h1 className="text-[14px] font-semibold leading-tight text-on-surface truncate">{title}</h1>
          {subtitle && <p className="text-[10px] text-on-surface-variant mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-start gap-2">
          {rightSlot}
          <DemoModeToggle />
        </div>
      </div>
    </div>
  )
}
