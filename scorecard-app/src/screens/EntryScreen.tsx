import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Image,
  Layers3,
  LockKeyhole,
  MapPin,
  TrendingUp,
} from 'lucide-react'
import { PhoneShell } from '../components/PhoneShell'
import { TopBar } from '../components/TopBar'
import { TrellisAskButton, TrellisInsightCard } from '../components/TrellisBot'
import { useApp } from '../context/useApp'
import { previousSnapshot, scorecardSections, store } from '../data/mock'
import { getCurrentSection, getCurrentSectionNumber, getStepState } from '../lib/scorecard'
import { getEntryVisitBriefing } from '../lib/trellis'

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
    toggleTrellis,
  } = app

  const currentSection = getCurrentSection(app)
  const currentSectionNumber = getCurrentSectionNumber(app)
  const trendDelta = totalScore - previousSnapshot.score
  const briefing = getEntryVisitBriefing(app)

  const ctaLabel = {
    'not-started': 'Start Scorecard',
    'in-progress': 'Resume Scorecard',
    'ready-for-review': 'Review Scorecard',
    completed: 'Scorecard Completed',
  }[scorecardStatus]

  const ctaRoute = scorecardStatus === 'ready-for-review' || scorecardStatus === 'completed'
    ? '/summary'
    : currentSection.route

  const statusMeta = {
    'not-started': {
      label: 'Not Started',
      tone: 'text-[#52606d] bg-[#f4f6f9] border-[#dde3ea]',
      detail: `${totalSections} sections | ${totalChecks} checks | ${requiredPhotos} required photos`,
      continueFrom: `Starts with ${currentSection.title}.`,
    },
    'in-progress': {
      label: `${completionPercent}% Complete`,
      tone: 'text-primary bg-[#edf4ff] border-[#c9d8ea]',
      detail: `${answeredChecks} of ${totalChecks} checks answered`,
      continueFrom: `Continue from ${currentSection.title} | Section ${currentSectionNumber} of ${totalSections}.`,
    },
    'ready-for-review': {
      label: 'Ready for Review',
      tone: 'text-[#1f5f33] bg-[#edf7ee] border-[#cde8d3]',
      detail: `All checks answered | ${capturedRequiredPhotos}/${requiredPhotos} required photos captured`,
      continueFrom: 'Continue to Review and Submit.',
    },
    completed: {
      label: 'Completed',
      tone: 'text-[#1f5f33] bg-[#edf7ee] border-[#cde8d3]',
      detail: `Submitted from active visit | Final score ${totalScore}`,
      continueFrom: 'Review the summary or return to the visit context.',
    },
  }[scorecardStatus]

  return (
    <PhoneShell>
      <div className="flex-1 overflow-y-auto bg-[#f4f6f9] px-4 py-4 space-y-3">
        <TopBar
          title={store.name}
          subtitle={`${store.visitStatus} Visit | ${store.city}`}
        />

        <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
          <div className="px-4 py-3 border-b border-outline flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Visit Context</p>
              <p className="text-[13px] font-semibold text-on-surface mt-1">{store.scorecard}</p>
              <p className="text-[11px] text-on-surface-variant mt-1">{store.banner} | Rep {store.rep}</p>
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
          <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-[#f7f9fb]">
            <ReadinessCell label="Sections" value={String(totalSections)} />
            <ReadinessCell label="Checks" value={String(totalChecks)} />
            <ReadinessCell label="Status" value={scorecardStatus === 'not-started' ? 'Ready' : `${completionPercent}%`} />
          </div>
        </div>

        {trellisEnabled && (
          <TrellisInsightCard
            title="Visit briefing for this store"
            summary={briefing.focusReason}
            metrics={[
              { label: 'Last Visit Score', value: String(briefing.lastVisitScore) },
              { label: 'Region Average', value: String(briefing.regionAverage) },
            ]}
            items={[
              { label: 'Repeated Gap', value: briefing.repeatedGap, tone: 'warning' },
              { label: 'Top Opportunity', value: briefing.topOpportunity, tone: 'success' },
              { label: 'Suggested Focus', value: briefing.suggestedFocus },
            ]}
            actionLabel={ctaLabel}
            onAction={() => navigate(ctaRoute)}
            secondaryActionLabel="View Summary"
            onSecondaryAction={() => navigate('/summary')}
            footer="Trellis is prioritizing repeated execution gaps and the fastest point recovery path before the visit begins."
          />
        )}

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
          <div className="px-4 py-3">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-on-surface">{statusMeta.detail}</p>
              <p className="text-[11px] text-on-surface-variant mt-1">{store.motto}</p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="rounded-md border border-outline bg-[#f7f9fb] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Progress</p>
                <p className="text-[13px] font-semibold text-on-surface mt-1">
                  {scorecardStatus === 'not-started' ? 'Not Started' : `${completionPercent}% Complete`}
                </p>
              </div>
              <div className={`inline-flex items-center gap-1 rounded-md border px-3 py-2 text-[12px] font-semibold ${trendDelta >= 0 ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]' : 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]'}`}>
                <TrendingUp size={13} />
                {trendDelta >= 0 ? '+' : ''}{trendDelta} pts vs last
              </div>
            </div>
            {!submitted && (
              <button
                type="button"
                onClick={() => navigate(ctaRoute)}
                className="mt-4 mx-auto min-h-11 rounded-md bg-primary px-6 text-[13px] font-semibold text-white flex items-center justify-center gap-2"
              >
                {ctaLabel}
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricCell label="Last Visit" value={`${previousSnapshot.score} pts`} />
          <MetricCell label="Current Score" value={`${totalScore} pts`} tone={trendDelta >= 0 ? 'success' : 'warning'} />
          <MetricCell label="Priority Section" value={currentSection.title} />
          <MetricCell label="Evidence" value={`${capturedRequiredPhotos}/${requiredPhotos} photos`} />
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

        <TrellisAskButton active={trellisEnabled} onClick={toggleTrellis} />
      </div>
    </PhoneShell>
  )
}

function MetricCell({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'neutral' | 'success' | 'warning'
}) {
  return (
    <div className="rounded-lg border border-outline bg-surface-lowest px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
      <p className={`mt-1 text-[14px] font-semibold ${
        tone === 'success'
          ? 'text-[#1f5f33]'
          : tone === 'warning'
            ? 'text-[#8e030f]'
            : 'text-on-surface'
      }`}>
        {value}
      </p>
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
