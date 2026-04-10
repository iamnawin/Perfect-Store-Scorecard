import { ChevronLeft, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import clsx from 'clsx'

interface TopBarProps {
  title: string
  subtitle?: string
  showBack?: boolean
  showTrellisToggle?: boolean
}

export function TopBar({ title, subtitle, showBack = false, showTrellisToggle = false }: TopBarProps) {
  const navigate = useNavigate()
  const { trellisEnabled, toggleTrellis } = useApp()

  return (
    <div className="bg-primary text-white px-4 pt-12 pb-4 shrink-0">
      <div className="flex items-center gap-2 mb-1">
        {showBack && (
          <button onClick={() => navigate(-1)} className="mr-1 -ml-1 p-1 rounded-lg active:bg-white/10">
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-semibold leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-[12px] text-white/70 mt-0.5">{subtitle}</p>}
        </div>
        {showTrellisToggle && (
          <button
            onClick={toggleTrellis}
            className={clsx(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-colors',
              trellisEnabled ? 'bg-white text-primary' : 'bg-white/15 text-white'
            )}
          >
            <Sparkles size={11} />
            Trellis
          </button>
        )}
      </div>
    </div>
  )
}
