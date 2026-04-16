import clsx from 'clsx'
import { useApp } from '../context/useApp'

export function DemoModeToggle() {
  const { agentforceEnabled, setAgentforceEnabled } = useApp()

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-outline bg-[#f7f9fb] px-2 py-1">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
        Demo Mode
      </p>
      <div className="inline-grid grid-cols-2 gap-1 rounded-full bg-[#eef2f6] p-0.5">
        <ModePill
          active={!agentforceEnabled}
          label="Standard"
          onClick={() => setAgentforceEnabled(false)}
        />
        <ModePill
          active={agentforceEnabled}
          label="Agentforce"
          onClick={() => setAgentforceEnabled(true)}
        />
      </div>
    </div>
  )
}

function ModePill({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'min-h-6 rounded-full px-2.5 text-[10px] font-semibold leading-none transition-colors',
        active
          ? 'bg-primary text-white'
          : 'bg-transparent text-on-surface-variant'
      )}
    >
      {label}
    </button>
  )
}
