import { useApp } from '../context/useApp'

export function DemoModeToggle() {
  const { agentforceEnabled, setAgentforceEnabled } = useApp()

  return (
    <button
      type="button"
      onClick={() => setAgentforceEnabled(!agentforceEnabled)}
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-1 ${
        agentforceEnabled
          ? 'border-[#8fd19e] bg-[#edf7ee]'
          : 'border-[#c9d8ea] bg-[#f7f9fb]'
      }`}
      aria-pressed={agentforceEnabled}
      aria-label={`Trellis AI ${agentforceEnabled ? 'enabled' : 'disabled'}`}
    >
      <span className={`text-[9px] font-semibold ${
        agentforceEnabled ? 'text-[#1f5f33]' : 'text-[#52606d]'
      }`}>
        Trellis AI
      </span>
      <span
        className={`relative h-4 w-7 rounded-full overflow-hidden transition-colors ${
          agentforceEnabled ? 'bg-[#2e844a]' : 'bg-[#c9d2dc]'
        }`}
      >
        <span
          className={`absolute left-[2px] top-[2px] h-3 w-3 rounded-full bg-white transition-transform ${
            agentforceEnabled ? 'translate-x-[12px]' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}
