import React from 'react'
import { Info, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../lib/utils'
import type { CalculationTrace } from '../types'

interface CalculationTraceProps {
  title: string
  traces: CalculationTrace[]
  className?: string
  defaultExpanded?: boolean
}

export function CalculationTraceView({
  title,
  traces,
  className,
  defaultExpanded = false,
}: CalculationTraceProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

  if (traces.length === 0) return null

  return (
    <div className={cn('rounded-lg border border-[#c9d8ea] bg-white overflow-hidden', className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 bg-[#f8fbfe] hover:bg-[#edf4ff] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info size={16} className="text-[#0176d3]" />
          <span className="text-[13px] font-bold text-[#014486]">{title}</span>
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div className="divide-y divide-[#c9d8ea]">
          {traces.map((trace, index) => (
            <div key={index} className="px-4 py-3 space-y-1">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[12px] font-semibold text-[#014486]">{trace.label}</span>
                <span className="text-[12px] font-bold text-[#1f5f33]">{trace.value}</span>
              </div>
              <p className="text-[11px] text-[#4b5563] leading-snug">{trace.reason}</p>
              {trace.inputData && Object.keys(trace.inputData).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 rounded bg-[#f3f4f6] px-2 py-1">
                  {Object.entries(trace.inputData).map(([key, val]) => (
                    <span key={key} className="text-[9px] font-medium text-[#4b5563]">
                      <span className="uppercase">{key}:</span> {String(val)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface WhyTooltipProps {
  label: string
  explanation: string
  className?: string
}

export function WhyTooltip({ label, explanation, className }: WhyTooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  const tagColorClass = 
    label === 'High' ? 'border-[#fed7d7] bg-[#fff5f5] text-[#c53030]' :
    label === 'Risk' ? 'border-[#fed7d7] bg-[#fff5f5] text-[#c53030]' :
    label === 'Opportunity' ? 'border-[#c6f6d5] bg-[#f0fff4] text-[#2f855a]' :
    label.includes('x') ? 'border-[#bee3f8] bg-[#ebf8ff] text-[#2b6cb0]' :
    'border-[#c9d8ea] bg-[#f8fbfe] text-[#0176d3]'

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className={cn(
          'flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors',
          tagColorClass
        )}
      >
        {label}
        <HelpCircle size={10} className="opacity-70" />
      </button>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2.5 w-52 -translate-x-1/2 rounded-lg border border-[#c9d8ea] bg-white p-3 shadow-xl animate-in fade-in zoom-in duration-150">
          <p className="text-[11px] font-bold text-[#014486] mb-1">{label}</p>
          <p className="text-[10px] text-[#4b5563] leading-snug">{explanation}</p>
          <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-right border-[#c9d8ea] bg-white shadow-sm" />
        </div>
      )}
    </div>
  )
}
