import clsx from 'clsx'
import { useApp } from '../context/useApp'

export function DemoModeToggle() {
  const { agentforceEnabled, setAgentforceEnabled } = useApp()

  return (
    <div className="flex flex-col items-end gap-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
        Demo Mode
      </p>
      <div className="inline-grid grid-cols-2 gap-1 rounded-full border border-outline bg-[#f4f6f9] p-1">
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
        'min-h-8 rounded-full px-3 text-[11px] font-semibold transition-colors',
        active
          ? 'bg-primary text-white'
          : 'bg-transparent text-on-surface-variant'
      )}
    >
      {label}
    </button>
  )
}
