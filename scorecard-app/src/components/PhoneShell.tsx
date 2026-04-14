import type { ReactNode } from 'react'
import clsx from 'clsx'
import { useApp } from '../context/useApp'

export function PhoneShell({ children }: { children: ReactNode }) {
  const { agentforceEnabled, setAgentforceEnabled } = useApp()

  return (
    <div className="min-h-[100dvh] w-full bg-[#e7ebf0]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col px-3 py-4 sm:max-w-none sm:items-center sm:px-4 sm:py-6">
        <div className="w-full rounded-[1.5rem] border border-[#d8dde6] bg-[#f7f9fb] p-3 shadow-[0_10px_28px_rgba(15,23,42,0.08)] sm:max-w-[430px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Demo Mode</p>
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-[1.1rem] bg-[#e7ebf0] p-1">
            <ModeButton
              active={!agentforceEnabled}
              label="Agentforce Off"
              description="Core MVP"
              onClick={() => setAgentforceEnabled(false)}
            />
            <ModeButton
              active={agentforceEnabled}
              label="Agentforce On"
              description="Enhanced flow"
              onClick={() => setAgentforceEnabled(true)}
            />
          </div>
          <p className="mt-2 text-[11px] text-on-surface-variant">
            Switch between the non-Agentforce MVP and the Agentforce-enhanced demo without changing any backend behavior.
          </p>
        </div>

        <div className="mt-4 flex flex-1 min-h-0 w-full items-start justify-center">
          <div className="relative flex h-full w-full min-w-0 flex-col overflow-hidden bg-[#f7f9fb] sm:h-[844px] sm:max-w-[390px] sm:rounded-[2.35rem] sm:border sm:border-[#d8dde6] sm:shadow-[0_16px_36px_rgba(15,23,42,0.16)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function ModeButton({
  active,
  label,
  description,
  onClick,
}: {
  active: boolean
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'rounded-[0.95rem] border px-3 py-2.5 text-left transition-colors',
        active
          ? 'border-[#014486] bg-[#0176d3] text-white shadow-[0_10px_24px_rgba(1,118,211,0.28)]'
          : 'border-transparent bg-white text-on-surface'
      )}
    >
      <p className="text-[12px] font-semibold">{label}</p>
      <p className={clsx('mt-1 text-[11px]', active ? 'text-white/88' : 'text-on-surface-variant')}>{description}</p>
    </button>
  )
}
