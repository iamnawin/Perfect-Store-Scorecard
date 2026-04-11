import clsx from 'clsx'
import type { ReactNode } from 'react'

interface BottomActionBarProps {
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  helperText?: string
  primaryDisabled?: boolean
  primaryIcon?: ReactNode
}

export function BottomActionBar({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  helperText,
  primaryDisabled = false,
  primaryIcon,
}: BottomActionBarProps) {
  return (
    <div className="shrink-0 bg-surface-lowest border-t border-outline px-4 py-3 pb-6">
      <div className="flex gap-2">
        {secondaryLabel && onSecondary && (
          <button
            type="button"
            onClick={onSecondary}
            className="flex-1 min-h-11 rounded-lg border border-outline bg-surface-low px-3 text-[13px] font-semibold text-on-surface-variant flex items-center justify-center gap-2"
          >
            {secondaryLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onPrimary}
          disabled={primaryDisabled}
          className={clsx(
            'min-h-11 rounded-lg px-4 text-[13px] font-semibold flex items-center justify-center gap-2',
            secondaryLabel ? 'flex-[1.25]' : 'w-full',
            primaryDisabled ? 'bg-[#c9d8ea] text-white' : 'bg-primary text-white'
          )}
        >
          {primaryIcon}
          {primaryLabel}
        </button>
      </div>
      {helperText && <p className="text-[11px] text-on-surface-variant mt-2">{helperText}</p>}
    </div>
  )
}
