import { useNavigate } from 'react-router-dom'
import { Calendar, CheckCircle2, ChevronRight, CircleDot, ClipboardCheck, LockKeyhole, MapPin } from 'lucide-react'
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
    completionPercent,
    scorecardStatus,
    totalScore,
    submitted,
    trellisEnabled,
  } = app

  const currentSection = getCurrentSection(app)
  const currentSectionNumber = getCurrentSectionNumber(app)
  const ctaLabel = {
    'not-started': 'Start Scorecard',
    'in-progress': 'Continue Scorecard',
    'ready-for-review': 'Review Scorecard',
    'completed': 'View Summary',
  }[scorecardStatus]

  const ctaRoute = scorecardStatus === 'ready-for-review' || scorecardStatus === 'completed'
    ? '/summary'
    : currentSection.route

  const statusMeta = {
    'not-started': {
      label: 'Not Started',
      tone: 'text-[#52606d] bg-[#f4f6f9] border-[#dde3ea]',
      detail: `${totalSections} sections | ${totalChecks} checks | ${requiredPhotos} required photos`,
    },
    'in-progress': {
      label: `${completionPercent}% Complete`,
      tone: 'text-primary bg-[#edf4ff] border-[#c9d8ea]',
      detail: `${answeredChecks} of ${totalChecks} checks answered | Section ${currentSectionNumber} of ${totalSections}`,
    },
    'ready-for-review': {
      label: 'Ready for Review',
      tone: 'text-[#1f5f33] bg-[#edf7ee] border-[#cde8d3]',
      detail: `All ${totalChecks} checks answered | All ${requiredPhotos} required photos captured`,
    },
    'completed': {
      label: 'Completed',
      tone: 'text-[#1f5f33] bg-[#edf7ee] border-[#cde8d3]',
      detail: `Submitted from active visit | Final score ${totalScore}`,
    },
  }[scorecardStatus]

  return (
    <PhoneShell>
      <TopBar
        title={store.name}
        subtitle={`${store.visitStatus} Visit | ${store.banner} | ${store.city}`}
        showTrellisToggle
      />

      <div className="flex-1 overflow-y-auto bg-[#f4f6f9]">
        <div className="px-4 py-3 border-b border-outline bg-surface-lowest">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Visit Context</p>
              <p className="text-[14px] font-semibold text-on-surface mt-1">{store.scorecard}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Rep</p>
              <p className="text-[12px] text-on-surface mt-1">{store.rep}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-on-surface-variant mt-2">
            <span className="flex items-center gap-1.5">
              <MapPin size={12} className="text-primary" />
              {store.city}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-primary" />
              Apr 11, 2026
            </span>
          </div>
        </div>

        <div className="mx-4 mt-4 border border-outline bg-surface-lowest rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-outline">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Scorecard Status</p>
                <p className="text-[16px] font-semibold text-on-surface mt-1">{store.scorecard}</p>
              </div>
              <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${statusMeta.tone}`}>
                {statusMeta.label}
              </span>
            </div>
          </div>
          <div className="px-4 py-4">
            <p className="text-[13px] text-on-surface-variant">{statusMeta.detail}</p>
            <p className="text-[12px] text-on-surface-variant mt-2">{store.motto}</p>

            {scorecardStatus !== 'not-started' && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-[12px] text-on-surface-variant mb-2">
                  <span>Scorecard completion</span>
                  <span>{completionPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#e6ebf1] overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${completionPercent}%` }} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 mt-4">
              <MetricCell label="Sections" value={String(totalSections)} />
              <MetricCell label="Checks" value={String(totalChecks)} />
              <MetricCell label="Required Photos" value={String(requiredPhotos)} />
            </div>

            <button
              type="button"
              onClick={() => navigate(ctaRoute)}
              className="mt-4 w-full min-h-11 rounded-lg bg-primary text-white text-[14px] font-semibold flex items-center justify-center gap-2"
            >
              {ctaLabel}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="mx-4 mt-3 border border-outline bg-surface-lowest rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-outline">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Previous Snapshot</p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3">
            <SnapshotRow label="Last Score" value={String(previousSnapshot.score)} />
            <SnapshotRow label="Last Submitted" value={previousSnapshot.date} />
            <SnapshotRow label="Repeated Gap" value="Garden Doors" />
            <SnapshotRow label="Top Opportunity" value="Weed and Feed Endcap" />
          </div>
          <div className="px-4 pb-3">
            <p className="text-[12px] text-on-surface-variant leading-snug">{previousSnapshot.gap}</p>
            <p className="text-[12px] text-on-surface-variant leading-snug mt-1">{previousSnapshot.opportunity}</p>
          </div>
        </div>

        <div className="mx-4 mt-3 border border-outline bg-surface-lowest rounded-lg overflow-hidden">
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
          <div className="mt-3">
            <TrellisBot
              title={trellisContent.entry.title}
              insight={trellisContent.entry.insight}
              prompts={trellisContent.entry.prompts}
            />
          </div>
        )}

        {submitted && (
          <div className="mx-4 mt-3 mb-4 border border-[#cde8d3] bg-[#edf7ee] rounded-lg px-4 py-3">
            <p className="text-[12px] font-semibold text-[#1f5f33]">Scorecard submitted from active visit.</p>
            <p className="text-[12px] text-[#25523b] mt-1">Use View Summary to review score impact and manager-facing next actions.</p>
          </div>
        )}
      </div>
    </PhoneShell>
  )
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-outline bg-[#f7f9fb] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
      <p className="text-[15px] font-semibold text-on-surface mt-1">{value}</p>
    </div>
  )
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
      <p className="text-[13px] font-semibold text-on-surface mt-1">{value}</p>
    </div>
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
