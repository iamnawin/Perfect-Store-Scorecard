import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, CheckCircle2, ChevronRight, CircleDot, ClipboardCheck, Image, Layers3, LockKeyhole, MapPin } from 'lucide-react'
import { PhoneShell } from '../components/PhoneShell'
import { TopBar } from '../components/TopBar'
import { TrellisBot } from '../components/TrellisBot'
import { useApp } from '../context/useApp'
import { previousSnapshot, scorecardSections, store, trellisContent } from '../data/mock'
import { getCurrentSection, getCurrentSectionNumber, getStepState } from '../lib/scorecard'

export function EntryScreen() {
  const navigate = useNavigate()
  const app = useApp()
  const {
    answeredChecks,
    totalChecks,
    totalSections,
    requiredPhotos,
    capturedRequiredPhotos,
    completionPercent,
    scorecardStatus,
    totalScore,
    submitted,
    trellisEnabled,
  } = app

  const currentSection = getCurrentSection(app)
  const currentSectionNumber = getCurrentSectionNumber(app)
  const estimatedTime = Math.max(6, Math.ceil(totalChecks * 1.2))
  const trendDelta = totalScore - previousSnapshot.score
  const prioritySection = scorecardStatus === 'completed' ? 'Review and Submit' : currentSection.title

  const ctaLabel = {
    'not-started': 'Start Scorecard',
    'in-progress': 'Resume Scorecard',
    'ready-for-review': 'Review Scorecard',
    'completed': 'View Summary',
  }[scorecardStatus]

  const ctaRoute = scorecardStatus === 'ready-for-review' || scorecardStatus === 'completed'
    ? '/summary'
    : currentSection.route

  const readinessItems = [
    { label: 'Sections', value: String(totalSections) },
    { label: 'Checks', value: String(totalChecks) },
    { label: 'Photos', value: `${capturedRequiredPhotos}/${requiredPhotos}` },
    { label: 'Est. Time', value: `${estimatedTime} min` },
    { label: 'Progress', value: scorecardStatus === 'not-started' ? 'Not Started' : `${completionPercent}%` },
  ]

  const statusMeta = {
    'not-started': {
      label: 'Not Started',
      tone: 'text-[#52606d] bg-[#f4f6f9] border-[#dde3ea]',
      detail: `${totalSections} sections • ${totalChecks} checks • ${requiredPhotos} required photos`,
      continueFrom: `Starts with ${currentSection.title}.`,
    },
    'in-progress': {
      label: `${completionPercent}% Complete`,
      tone: 'text-primary bg-[#edf4ff] border-[#c9d8ea]',
      detail: `${answeredChecks} of ${totalChecks} checks answered`,
      continueFrom: `Continue from ${currentSection.title} • Section ${currentSectionNumber} of ${totalSections}.`,
    },
    'ready-for-review': {
      label: 'Ready for Review',
      tone: 'text-[#1f5f33] bg-[#edf7ee] border-[#cde8d3]',
      detail: `All checks answered • ${capturedRequiredPhotos}/${requiredPhotos} required photos captured`,
      continueFrom: 'Continue to Review and Submit.',
    },
    'completed': {
      label: 'Completed',
      tone: 'text-[#1f5f33] bg-[#edf7ee] border-[#cde8d3]',
      detail: `Submitted from active visit • Final score ${totalScore}`,
      continueFrom: 'Open the submitted summary and post-visit actions.',
    },
  }[scorecardStatus]

  return (
    <PhoneShell>
      <div className="flex-1 overflow-y-auto bg-[#f4f6f9] px-4 py-4 space-y-3">
        <TopBar
          title={store.name}
          subtitle={`${store.visitStatus} Visit • ${store.city}`}
          showTrellisToggle
        />

        <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
          <div className="px-4 py-3 border-b border-outline flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Visit Context</p>
              <p className="text-[13px] font-semibold text-on-surface mt-1">{store.scorecard}</p>
              <p className="text-[11px] text-on-surface-variant mt-1">{store.banner} • Rep {store.rep}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="rounded-md border border-[#cde8d3] bg-[#edf7ee] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1f5f33]">
                {store.visitStatus}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
                <MapPin size={12} className="text-primary" />
                {store.city}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2 px-4 py-3 bg-[#f7f9fb]">
            {readinessItems.map(item => (
              <ReadinessCell key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
          <div className="px-4 py-3 border-b border-outline flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Launch</p>
              <p className="text-[15px] font-semibold text-on-surface mt-1">{ctaLabel}</p>
              <p className="text-[12px] text-on-surface-variant mt-1">{statusMeta.continueFrom}</p>
            </div>
            <span className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusMeta.tone}`}>
              {statusMeta.label}
            </span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-on-surface">{statusMeta.detail}</p>
              <p className="text-[11px] text-on-surface-variant mt-1">{store.motto}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(ctaRoute)}
              className="min-h-11 rounded-md bg-primary px-4 text-[13px] font-semibold text-white flex items-center gap-2 shrink-0"
            >
              {ctaLabel}
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <CompactPanel
            label="Today’s Focus"
            title="Visit priorities"
            lines={[
              `Repeated gap: ${previousSnapshot.gap}`,
              `Top opportunity: ${previousSnapshot.opportunity}`,
              `Priority section: ${prioritySection}`,
            ]}
          />
          <CompactPanel
            label="Trend"
            title="Score trend"
            lines={[
              `Last score: ${previousSnapshot.score}`,
              `Current score: ${totalScore}`,
              `Trend vs last visit: ${trendDelta >= 0 ? '+' : ''}${trendDelta} pts`,
            ]}
            accent={trendDelta >= 0 ? 'positive' : 'neutral'}
          />
        </div>

        <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
          <div className="px-4 py-3 border-b border-outline">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Quick Navigation</p>
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-2">
            <QuickChip icon={<ClipboardCheck size={13} />} label="Checklist" onClick={() => navigate('/checklist')} />
            <QuickChip icon={<Layers3 size={13} />} label="Off-Shelf" onClick={() => navigate('/off-shelf')} />
            <QuickChip icon={<Image size={13} />} label="Photos" onClick={() => navigate('/photo')} />
            <QuickChip icon={<BarChart3 size={13} />} label="Summary" onClick={() => navigate('/summary')} />
          </div>
        </div>

        <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
          <div className="px-4 py-3 border-b border-outline">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Previous Snapshot</p>
          </div>
          <div className="grid grid-cols-2 gap-2 px-4 py-3">
            <MetricCell label="Last Score" value={String(previousSnapshot.score)} compact />
            <MetricCell label="Submitted" value={previousSnapshot.date} compact />
            <MetricCell label="Repeated Gap" value="Garden Doors" compact />
            <MetricCell label="Top Opportunity" value="Weed & Feed Endcap" compact />
          </div>
          <div className="px-4 pb-4">
            <p className="text-[12px] text-on-surface-variant leading-snug">{previousSnapshot.gap}</p>
            <p className="text-[12px] text-on-surface-variant leading-snug mt-1">{previousSnapshot.opportunity}</p>
            <p className="text-[12px] font-medium text-[#52606d] mt-2">Insight: close the repeated Garden Doors gap first, then push the best off-shelf opportunity to recover score fastest.</p>
          </div>
        </div>

        <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
          <div className="px-4 py-3 border-b border-outline">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Scorecard Flow</p>
          </div>
          <div className="divide-y divide-outline">
            {scorecardSections.map((section, index) => {
              const state = getStepState(section.id, app)
              return (
                <div key={section.id} className="flex items-start gap-3 px-4 py-3">
                  <div className={`mt-0.5 h-7 w-7 rounded-md border flex items-center justify-center ${iconTone(state)}`}>
                    {stepIcon(state)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] font-semibold text-on-surface">
                        {index + 1}. {section.title}
                      </p>
                      <span className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${stepTone(state)}`}>
                        {stepLabel(state)}
                      </span>
                    </div>
                    <p className="text-[12px] text-on-surface-variant mt-1">{section.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {trellisEnabled && (
          <TrellisBot
            title={trellisContent.entry.title}
            insight={trellisContent.entry.insight}
            prompts={trellisContent.entry.prompts}
          />
        )}

        {submitted && (
          <div className="border border-[#cde8d3] bg-[#edf7ee] rounded-lg px-4 py-3">
            <p className="text-[12px] font-semibold text-[#1f5f33]">Scorecard submitted from active visit.</p>
            <p className="text-[12px] text-[#25523b] mt-1">Open Summary to review manager-facing actions, score snapshot, and post-submit sharing.</p>
          </div>
        )}
      </div>
    </PhoneShell>
  )
}

function MetricCell({
  label,
  value,
  compact = false,
}: {
  label: string
  value: string
  compact?: boolean
}) {
  return (
    <div className="rounded-lg border border-outline bg-[#f7f9fb] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
      <p className={`${compact ? 'text-[13px]' : 'text-[15px]'} font-semibold text-on-surface mt-1`}>{value}</p>
    </div>
  )
}

function ReadinessCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-outline bg-white px-2 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
      <p className="text-[12px] font-semibold text-on-surface mt-1">{value}</p>
    </div>
  )
}

function CompactPanel({
  label,
  title,
  lines,
  accent = 'neutral',
}: {
  label: string
  title: string
  lines: string[]
  accent?: 'neutral' | 'positive'
}) {
  return (
    <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
      <div className="px-4 py-3 border-b border-outline">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">{label}</p>
        <p className="text-[13px] font-semibold text-on-surface mt-1">{title}</p>
      </div>
      <div className="px-4 py-3 space-y-2">
        {lines.map(line => (
          <p key={line} className={`text-[12px] leading-snug ${accent === 'positive' ? 'text-[#1f5f33]' : 'text-on-surface-variant'}`}>{line}</p>
        ))}
      </div>
    </div>
  )
}

function QuickChip({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-outline bg-[#f7f9fb] px-3 py-2 text-[12px] font-semibold text-on-surface"
    >
      {icon}
      {label}
    </button>
  )
}

function stepLabel(state: ReturnType<typeof getStepState>) {
  return {
    completed: 'Completed',
    'in-progress': 'In Progress',
    pending: 'Pending',
    locked: 'Locked',
  }[state]
}

function stepTone(state: ReturnType<typeof getStepState>) {
  return {
    completed: 'text-[#1f5f33] bg-[#edf7ee] border-[#cde8d3]',
    'in-progress': 'text-primary bg-[#edf4ff] border-[#c9d8ea]',
    pending: 'text-[#755400] bg-[#f9f2e7] border-[#ead7b1]',
    locked: 'text-[#52606d] bg-[#f4f6f9] border-[#dde3ea]',
  }[state]
}

function iconTone(state: ReturnType<typeof getStepState>) {
  return {
    completed: 'border-[#cde8d3] bg-[#edf7ee] text-[#2e844a]',
    'in-progress': 'border-[#c9d8ea] bg-[#edf4ff] text-primary',
    pending: 'border-[#ead7b1] bg-[#f9f2e7] text-[#8b5d00]',
    locked: 'border-[#dde3ea] bg-[#f4f6f9] text-[#7f8b99]',
  }[state]
}

function stepIcon(state: ReturnType<typeof getStepState>) {
  if (state === 'completed') return <CheckCircle2 size={15} />
  if (state === 'in-progress') return <ClipboardCheck size={15} />
  if (state === 'pending') return <CircleDot size={15} />
  return <LockKeyhole size={15} />
}
