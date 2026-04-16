import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DemoModeToggle } from './DemoModeToggle'
import { store } from '../data/mock'

interface TopBarProps {
  title: string
  subtitle?: string
  showBack?: boolean
  rightSlot?: ReactNode
}

export function TopBar({ title, subtitle, showBack = false, rightSlot }: TopBarProps) {
  const navigate = useNavigate()

  return (
    <div className="bg-surface-lowest border-b border-outline px-4 pt-5 pb-3 shrink-0">
      <div className="flex items-start gap-2">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-1 -ml-1 mt-1 p-1 rounded-md border border-transparent text-on-surface-variant active:bg-surface-low"
          >
          <ChevronLeft size={18} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold leading-none text-[#2e844a] truncate">{store.banner}</p>
              <h1 className="mt-1 text-[15px] font-semibold leading-tight text-primary truncate">{title}</h1>
            </div>
            <span className="shrink-0 rounded-full border border-[#c9d8ea] bg-[#edf4ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
              {store.visitStatus}
            </span>
          </div>
          {subtitle && <p className="text-[11px] text-on-surface-variant mt-1">{subtitle}</p>}
          <div className="mt-2 flex items-center justify-end gap-2">
            {rightSlot}
            <DemoModeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}
