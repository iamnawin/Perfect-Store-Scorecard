import { useApp } from '../context/useApp'

export function DemoModeToggle() {
  const { agentforceEnabled, setAgentforceEnabled } = useApp()

  return (
    <button
      type="button"
      onClick={() => setAgentforceEnabled(!agentforceEnabled)}
      className="inline-flex items-center gap-2 rounded-full border border-[#c9d8ea] bg-[#f7f9fb] px-2.5 py-1"
      aria-pressed={agentforceEnabled}
      aria-label={`Trellis AI ${agentforceEnabled ? 'enabled' : 'disabled'}`}
    >
      <span className="text-[10px] font-semibold text-[#6b2db5]">Trellis AI</span>
      <span
        className={`relative h-4 w-7 rounded-full transition-colors ${
          agentforceEnabled ? 'bg-[#6b2db5]' : 'bg-[#c9d2dc]'
        }`}
      >
        <span
          className={`absolute top-[2px] h-3 w-3 rounded-full bg-white transition-transform ${
            agentforceEnabled ? 'translate-x-[13px]' : 'translate-x-[2px]'
          }`}
        />
      </span>
    </button>
  )
}
