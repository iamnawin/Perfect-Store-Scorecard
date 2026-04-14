import clsx from 'clsx'
import { ArrowRight, Bot, Sparkles, TriangleAlert, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'
import type { TrellisActionIntent, TrellisDetailItem, TrellisMetric, TrellisTone } from '../types'

const toneStyles: Record<TrellisTone, {
  card: string
  badge: string
  icon: string
  accent: string
  row: string
}> = {
  info: {
    card: 'border-[#c9d8ea] bg-[#f7fbff]',
    badge: 'border-[#c9d8ea] bg-[#edf4ff] text-primary',
    icon: 'border-[#c9d8ea] bg-[#edf4ff] text-primary',
    accent: 'text-[#014486]',
    row: 'border-[#dde7f3] bg-white',
  },
  success: {
    card: 'border-[#cde8d3] bg-[#f5fbf6]',
    badge: 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]',
    icon: 'border-[#cde8d3] bg-[#edf7ee] text-[#2e844a]',
    accent: 'text-[#1f5f33]',
    row: 'border-[#d8eadb] bg-white',
  },
  warning: {
    card: 'border-[#ead7b1] bg-[#fdf8ef]',
    badge: 'border-[#ead7b1] bg-[#f9f2e7] text-[#8b5d00]',
    icon: 'border-[#f9d6d0] bg-[#fef1ee] text-[#ba0517]',
    accent: 'text-[#8b5d00]',
    row: 'border-[#f1dfba] bg-white',
  },
}

const actionStyles: Record<TrellisActionIntent, string> = {
  primary: 'bg-primary text-white',
  secondary: 'border border-outline bg-white text-on-surface',
  warning: 'bg-[#8b5d00] text-white',
}

interface TrellisInsightCardProps {
  title: string
  summary?: string
  badge?: string
  tone?: TrellisTone
  metrics?: TrellisMetric[]
  items?: TrellisDetailItem[]
  footer?: string
  actionLabel?: string
  onAction?: () => void
  actionIntent?: TrellisActionIntent
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

interface TrellisSuggestionCardProps {
  title?: string
  issue: string
  impactLabel: string
  suggestedFix: string
  estimatedGainLabel: string
  tone?: TrellisTone
  supportingText?: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

interface TrellisSummaryCardProps {
  title?: string
  summary: string
  highlights: TrellisDetailItem[]
  tone?: TrellisTone
  footer?: string
  actions?: Array<{
    label: string
    onClick: () => void
    intent?: TrellisActionIntent
  }>
}

interface LegacyTrellisBotProps {
  title: string
  insight: string
  prompts?: string[]
}

export function TrellisBot({ title, insight, prompts = [] }: LegacyTrellisBotProps) {
  return (
    <TrellisInsightCard
      title={title}
      summary={insight}
      items={prompts.slice(0, 2).map(prompt => ({ label: 'Prompt', value: prompt }))}
      footer={prompts.length > 2 ? prompts.slice(2).join(' | ') : undefined}
    />
  )
}

export function TrellisInsightCard({
  title,
  summary,
  badge = 'Agentforce Insight',
  tone = 'info',
  metrics = [],
  items = [],
  footer,
  actionLabel,
  onAction,
  actionIntent = 'primary',
  secondaryActionLabel,
  onSecondaryAction,
}: TrellisInsightCardProps) {
  const styles = toneStyles[tone]

  return (
    <div className={clsx('rounded-xl border px-4 py-3 shadow-[0_8px_22px_rgba(15,23,42,0.06)]', styles.card)}>
      <CardHeader badge={badge} tone={tone}>
        <p className="text-[14px] font-semibold text-on-surface">{title}</p>
        {summary && <p className={clsx('mt-1 text-[12px] leading-snug', styles.accent)}>{summary}</p>}
      </CardHeader>

      {metrics.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {metrics.map(metric => (
            <div key={metric.label} className={clsx('rounded-lg border px-3 py-2', styles.row)}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{metric.label}</p>
              <p className="mt-1 text-[15px] font-semibold text-on-surface">{metric.value}</p>
              {metric.detail && <p className="mt-1 text-[10px] text-on-surface-variant">{metric.detail}</p>}
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-3 space-y-2">
          {items.map(item => (
            <DetailRow key={`${item.label}-${item.value}`} item={item} />
          ))}
        </div>
      )}

      {(actionLabel && onAction) || (secondaryActionLabel && onSecondaryAction) ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {actionLabel && onAction && (
            <ActionButton label={actionLabel} onClick={onAction} intent={actionIntent} />
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <ActionButton label={secondaryActionLabel} onClick={onSecondaryAction} intent="secondary" />
          )}
        </div>
      ) : null}

      {footer && <p className="mt-3 text-[11px] text-on-surface-variant">{footer}</p>}
    </div>
  )
}

export function TrellisSuggestionCard({
  title = 'Agentforce Recommendation',
  issue,
  impactLabel,
  suggestedFix,
  estimatedGainLabel,
  tone = 'warning',
  supportingText,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: TrellisSuggestionCardProps) {
  const styles = toneStyles[tone]

  return (
    <div className={clsx('rounded-xl border px-4 py-3 shadow-[0_8px_22px_rgba(15,23,42,0.06)]', styles.card)}>
      <CardHeader badge={title.toUpperCase()} tone={tone} icon={<TriangleAlert size={14} />}>
        <div className="space-y-2">
          <SuggestionRow label="Issue" value={issue} />
          <SuggestionRow label="Impact" value={impactLabel} emphasis={tone === 'warning'} />
          <SuggestionRow label="Suggested Fix" value={suggestedFix} />
          <SuggestionRow label="Estimated Gain" value={estimatedGainLabel} positive />
        </div>
      </CardHeader>

      {supportingText && <p className="mt-3 text-[11px] text-on-surface-variant">{supportingText}</p>}

      {(actionLabel && onAction) || (secondaryActionLabel && onSecondaryAction) ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {actionLabel && onAction && <ActionButton label={actionLabel} onClick={onAction} intent="primary" />}
          {secondaryActionLabel && onSecondaryAction && (
            <ActionButton label={secondaryActionLabel} onClick={onSecondaryAction} intent="secondary" />
          )}
        </div>
      ) : null}
    </div>
  )
}

export function TrellisSummaryCard({
  title = 'Agentforce Summary',
  summary,
  highlights,
  tone = 'info',
  footer,
  actions = [],
}: TrellisSummaryCardProps) {
  const styles = toneStyles[tone]

  return (
    <div className={clsx('rounded-xl border px-4 py-3 shadow-[0_8px_22px_rgba(15,23,42,0.06)]', styles.card)}>
      <CardHeader badge={title} tone={tone} icon={<TrendingUp size={14} />}>
        <p className="text-[13px] leading-snug text-on-surface">{summary}</p>
      </CardHeader>

      <div className="mt-3 space-y-2">
        {highlights.map(item => (
          <DetailRow key={`${item.label}-${item.value}`} item={item} />
        ))}
      </div>

      {actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map(action => (
            <ActionButton
              key={action.label}
              label={action.label}
              onClick={action.onClick}
              intent={action.intent ?? 'secondary'}
            />
          ))}
        </div>
      )}

      {footer && <p className="mt-3 text-[11px] text-on-surface-variant">{footer}</p>}
    </div>
  )
}

export function TrellisAskButton({
  active,
  onClick,
  title,
  summary,
  items = [],
}: {
  active: boolean
  onClick: () => void
  title?: string
  summary?: string
  items?: string[]
}) {
  return (
    <div className="sticky bottom-4 z-20 flex justify-end pr-1">
      <div className="relative">
        {active && (title || summary || items.length > 0) && (
          <div className="absolute bottom-14 right-0 w-[280px] rounded-2xl border border-[#c9d8ea] bg-white p-3 shadow-[0_20px_40px_rgba(15,23,42,0.2)]">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(90deg,#0b5cab,#0176d3)] text-white">
                <Bot size={14} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Agentforce Live</p>
                {title && <p className="text-[13px] font-semibold text-on-surface">{title}</p>}
              </div>
            </div>
            {summary && <p className="mt-2 text-[12px] leading-snug text-on-surface-variant">{summary}</p>}
            {items.length > 0 && (
              <div className="mt-3 space-y-2">
                {items.map(item => (
                  <div key={item} className="rounded-lg border border-outline bg-[#f7f9fb] px-3 py-2 text-[12px] text-on-surface">
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      <button
        type="button"
        onClick={onClick}
        className={clsx(
          'inline-flex min-h-11 items-center gap-2 rounded-[0.95rem] px-4 text-[12px] font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.18)]',
          active
            ? 'bg-[linear-gradient(90deg,#0b5cab,#0176d3)]'
            : 'bg-[linear-gradient(90deg,#1b4fd6,#0176d3)]'
        )}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0b5cab]">
          {active ? <Bot size={13} /> : <Sparkles size={13} />}
        </span>
        {active ? 'Agentforce Active' : 'Ask Agentforce'}
      </button>
      </div>
    </div>
  )
}

function CardHeader({
  badge,
  tone,
  children,
  icon,
}: {
  badge: string
  tone: TrellisTone
  children: ReactNode
  icon?: ReactNode
}) {
  const styles = toneStyles[tone]

  return (
    <div>
      <div className="flex items-start gap-3">
        <div className={clsx('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border', styles.icon)}>
          {icon ?? <Sparkles size={15} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={clsx('rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]', styles.badge)}>
              {badge}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-on-surface-variant">Agentforce</span>
          </div>
          <div className="mt-2">{children}</div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ item }: { item: TrellisDetailItem }) {
  return (
    <div className="rounded-lg border border-outline bg-white px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{item.label}</p>
      <p className={clsx(
        'mt-1 text-[13px] font-semibold',
        item.tone === 'success'
          ? 'text-[#1f5f33]'
          : item.tone === 'warning'
            ? 'text-[#8b5d00]'
            : 'text-on-surface'
      )}>
        {item.value}
      </p>
    </div>
  )
}

function SuggestionRow({
  label,
  value,
  emphasis = false,
  positive = false,
}: {
  label: string
  value: string
  emphasis?: boolean
  positive?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-outline bg-white px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
      <p className={clsx(
        'text-right text-[12px] font-semibold',
        positive ? 'text-[#1f5f33]' : emphasis ? 'text-[#8e030f]' : 'text-on-surface'
      )}>
        {value}
      </p>
    </div>
  )
}

function ActionButton({
  label,
  onClick,
  intent,
}: {
  label: string
  onClick: () => void
  intent: TrellisActionIntent
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold',
        actionStyles[intent]
      )}
    >
      {label}
      <ArrowRight size={13} />
    </button>
  )
}
