import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronRight, CircleDot, ClipboardCheck, LockKeyhole, TrendingUp } from 'lucide-react'
import { PhoneShell } from '../components/PhoneShell'
import { StandardGuidanceCard } from '../components/StandardGuidanceCard'
import { TopBar } from '../components/TopBar'
import { TrellisInsightCard } from '../components/TrellisBot'
import { useApp } from '../context/useApp'
import { previousSnapshot, store } from '../data/mock'
import { getActiveScorecardSections, getCurrentSection, getCurrentSectionNumber, getStepState, getVisitTypeLabel } from '../lib/scorecard'

export function EntryScreen() {
  const navigate = useNavigate()
  const app = useApp()
  const {
    visitType,
    setVisitType,
    answeredChecks,
    totalChecks,
    totalSections,
    requiredPhotos,
    capturedRequiredPhotos,
    scorecardStatus,
    totalScore,
    submitted,
    agentforceEnabled,
    offShelf,
  } = app

  const currentSection = getCurrentSection(app)
  const currentSectionNumber = getCurrentSectionNumber(app)
  const activeSections = getActiveScorecardSections(visitType)
  const visitTypeLabel = getVisitTypeLabel(visitType)
  const previousEntryCount = offShelf.filter(entry => entry.origin === 'previous-visit').length
  const trendDelta = totalScore - previousSnapshot.score
  const shouldShowProgressCard = scorecardStatus === 'in-progress' || scorecardStatus === 'ready-for-review' || submitted
  const ctaRoute = scorecardStatus === 'ready-for-review' || scorecardStatus === 'completed'
    ? '/summary'
    : currentSection.route

  const statusMeta = (visitType === 'follow-up'
    ? {
        'not-started': {
          label: 'Start Follow-up',
          tone: 'text-[#52606d] bg-[#f4f6f9] border-[#dde3ea]',
          detail: 'Review the previous off-shelf placements first',
          continueFrom: 'Loaded previous visit context so you can confirm what stayed, changed, or was removed.',
        },
        'in-progress': {
          label: 'Continue Follow-up',
          tone: 'text-primary bg-[#edf4ff] border-[#c9d8ea]',
          detail: 'Track retained, removed, and added displays',
          continueFrom: `${previousEntryCount} prior display ${previousEntryCount === 1 ? 'entry' : 'entries'} loaded | Section ${currentSectionNumber} of ${totalSections}.`,
        },
        'ready-for-review': {
          label: 'Review Follow-up',
          tone: 'text-[#1f5f33] bg-[#edf7ee] border-[#cde8d3]',
          detail: 'Evidence is complete and the follow-up is ready',
          continueFrom: `${capturedRequiredPhotos}/${requiredPhotos} required photos captured | Follow-up changes are ready for summary review.`,
        },
        'completed': {
          label: 'Follow-up Completed',
          tone: 'text-[#1f5f33] bg-[#edf7ee] border-[#cde8d3]',
          detail: 'Review the submitted follow-up summary',
          continueFrom: `Final score ${totalScore} | Open the summary to review retained, removed, and added displays.`,
        },
      }
    : {
        'not-started': {
          label: 'Start Initial Visit',
          tone: 'text-[#52606d] bg-[#f4f6f9] border-[#dde3ea]',
          detail: 'Begin with Base Plan validation',
          continueFrom: 'Complete MAP and POG before adding displays.',
        },
        'in-progress': {
          label: 'Continue Initial Visit',
          tone: 'text-primary bg-[#edf4ff] border-[#c9d8ea]',
          detail: 'Resume where you left off',
          continueFrom: `Progress: ${answeredChecks} / ${totalChecks} checks | Section ${currentSectionNumber} of ${totalSections}.`,
        },
        'ready-for-review': {
          label: 'Continue Initial Visit',
          tone: 'text-[#1f5f33] bg-[#edf7ee] border-[#cde8d3]',
          detail: 'Checklist and evidence are ready for review',
          continueFrom: `All checks answered | ${capturedRequiredPhotos}/${requiredPhotos} required photos captured.`,
        },
        'completed': {
          label: 'Initial Visit Completed',
          tone: 'text-[#1f5f33] bg-[#edf7ee] border-[#cde8d3]',
          detail: 'Review the submitted visit summary',
          continueFrom: `Final score ${totalScore} | Return to the summary when needed.`,
        },
      })[scorecardStatus]

  return (
    <PhoneShell>
      <div className="flex-1 overflow-y-auto bg-[#f4f6f9] px-4 py-4 space-y-3">
        <TopBar
          title={store.name}
          subtitle={`${visitTypeLabel} Visit | ${store.city}`}
        />

        <div className="px-1">
          <p className="text-[11px] font-medium text-on-surface-variant">{store.scorecard}</p>
        </div>

        <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
          <div className="px-4 py-3 border-b border-outline">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Scorecard Type / Mode</p>
            <p className="mt-1 text-[13px] text-on-surface-variant">Choose the execution flow before you continue.</p>
          </div>
          <div className="px-4 py-3">
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-[#d8dde6] bg-[#f7f9fb] p-1">
              <VisitTypeButton
                active={visitType === 'initial'}
                label="Initial"
                onClick={() => setVisitType('initial')}
              />
              <VisitTypeButton
                active={visitType === 'follow-up'}
                label="Follow-up"
                onClick={() => setVisitType('follow-up')}
              />
            </div>
          </div>
        </div>

        {agentforceEnabled && (
          <TrellisInsightCard
            badge="Agentforce Insight"
            title={visitType === 'follow-up' ? 'What matters in this follow-up' : 'What matters now'}
            summary={visitType === 'follow-up'
              ? 'Agentforce is using prior visit context and current change tracking to highlight the fastest follow-up decisions.'
              : 'Agentforce is reading prior visit history and current score state to point the rep at the fastest recovery path.'}
            items={visitType === 'follow-up'
              ? [
                  { label: 'Loaded Displays', value: `${previousEntryCount} previous display ${previousEntryCount === 1 ? 'record' : 'records'} ready for review`, tone: 'info' },
                  { label: 'Change Goal', value: 'Confirm retained, removed, and newly added placements', tone: 'success' },
                  { label: 'Suggested Focus', value: 'Review fence line and endcap placements before evidence capture' },
                ]
              : [
                  { label: 'Repeated Gap', value: 'Garden Door missing for 2 visits', tone: 'warning' },
                  { label: 'Top Opportunity', value: 'Scotts Turf Builder 20 lb at Endcap (+12 pts)', tone: 'success' },
                  { label: 'Suggested Focus', value: 'Fix Garden Door first, then add incremental displays' },
                ]}
          />
        )}
        {!agentforceEnabled && (
          <StandardGuidanceCard
            title={visitType === 'follow-up' ? 'Use the previous visit to speed up follow-up execution' : 'Use the visit snapshot to guide execution'}
            summary={visitType === 'follow-up'
              ? 'Follow-up mode keeps scoring and evidence intact while focusing the rep on what changed since the last visit.'
              : 'Use the previous visit snapshot and score breakdown to guide execution.'}
            detail={visitType === 'follow-up'
              ? 'Standard mode works without Agentforce. Review previous displays, mark what changed, then capture only the evidence you still need.'
              : 'Standard mode keeps the same checklist, scoring, evidence, and summary flow without Trellis guidance.'}
          />
        )}

        <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
          <div className="px-4 py-3 border-b border-outline flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Primary Action</p>
              <p className="text-[17px] font-semibold text-on-surface mt-1">{statusMeta.label}</p>
              <p className="text-[12px] text-on-surface-variant mt-1">{statusMeta.detail}</p>
              <p className="text-[12px] text-on-surface-variant mt-1">{statusMeta.continueFrom}</p>
            </div>
            <span className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusMeta.tone}`}>
              {scorecardStatus === 'not-started' ? 'Not Started' : scorecardStatus === 'in-progress' ? 'In Progress' : scorecardStatus === 'ready-for-review' ? 'Ready' : 'Completed'}
            </span>
          </div>
          <div className="px-4 py-3">
            {submitted ? null : (
              <button
                type="button"
                onClick={() => navigate(ctaRoute)}
                className="mt-1 w-full min-h-11 rounded-md bg-primary px-6 text-[13px] font-semibold text-white flex items-center justify-center gap-2"
              >
                {scorecardStatus === 'not-started'
                  ? visitType === 'follow-up' ? 'Start Follow-up' : 'Start Initial Visit'
                  : 'Continue'}
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>

        {shouldShowProgressCard ? (
          <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
            <div className="px-4 py-3 border-b border-outline">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Current Progress</p>
            </div>
            <div className="px-4 py-3 space-y-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {visitType === 'initial' ? (
                  <>
                    <SnapshotField label="Progress" value={`${answeredChecks} / ${totalChecks} checks`} />
                    <SnapshotField label="Section" value={`${currentSectionNumber} of ${totalSections}`} />
                    <SnapshotField label="Score So Far" value={totalScore.toFixed(0)} />
                    <SnapshotField label="Evidence" value={`${capturedRequiredPhotos} / ${requiredPhotos} photos`} />
                  </>
                ) : (
                  <>
                    <SnapshotField label="Prior Displays" value={String(previousEntryCount)} />
                    <SnapshotField label="Section" value={`${currentSectionNumber} of ${totalSections}`} />
                    <SnapshotField label="Score So Far" value={totalScore.toFixed(0)} />
                    <SnapshotField label="Evidence" value={`${capturedRequiredPhotos} / ${requiredPhotos} photos`} />
                  </>
                )}
              </div>
              <div className="rounded-lg border border-outline bg-[#f7f9fb] px-3 py-3">
                <p className="text-[12px] text-on-surface-variant">Resume point</p>
                <p className="mt-1 text-[13px] font-semibold text-on-surface">{currentSection.title}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
            <div className="px-4 py-3 border-b border-outline">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                {visitType === 'follow-up' ? 'Previous Visit Loaded' : 'Last Visit Snapshot'}
              </p>
            </div>
            <div className="px-4 py-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <SnapshotField label="Last Score" value={String(previousSnapshot.score)} />
                <SnapshotField label="Last Submitted" value={previousSnapshot.date} />
                <SnapshotField label="Repeated Gap" value="Garden Doors" />
                <SnapshotField label={visitType === 'follow-up' ? 'Prior Displays' : 'Top Opportunity'} value={visitType === 'follow-up' ? String(previousEntryCount) : 'Weed and Feed Endcap'} />
              </div>
            </div>
          </div>
        )}

        {scorecardStatus !== 'not-started' && (
          <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
            <div className="px-4 py-3 border-b border-outline flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Trend</p>
                <p className="text-[13px] font-semibold text-on-surface mt-1">Score trend</p>
              </div>
              <span className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${trendDelta >= 0 ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]' : 'border-[#dde3ea] bg-[#f4f6f9] text-[#52606d]'}`}>
                {trendDelta >= 0 ? 'Improving' : 'Below Last'}
              </span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[12px] text-on-surface-variant">Last score {previousSnapshot.score}</p>
                <p className="text-[12px] text-on-surface-variant mt-1">Current score {totalScore}</p>
              </div>
              <div className={`inline-flex items-center gap-1 rounded-md border px-3 py-2 text-[12px] font-semibold ${trendDelta >= 0 ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]' : 'border-[#dde3ea] bg-[#f4f6f9] text-[#52606d]'}`}>
                <TrendingUp size={13} />
                {trendDelta >= 0 ? '+' : ''}{trendDelta} pts
              </div>
            </div>
          </div>
        )}

        {scorecardStatus !== 'not-started' && !submitted && (
          <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
            <div className="px-4 py-3 border-b border-outline">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Scorecard Flow</p>
            </div>
            <div className="divide-y divide-outline">
              {activeSections.map((section, index) => {
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
        )}

        {submitted && (
          <div className="border border-[#cde8d3] bg-[#edf7ee] rounded-lg px-4 py-3">
            <p className="text-[12px] font-semibold text-[#1f5f33]">
              {visitType === 'follow-up' ? 'Follow-up submitted from the active visit.' : 'Initial visit submitted from the active visit.'}
            </p>
            <p className="text-[12px] text-[#25523b] mt-1">Open Summary to review manager-facing actions, score snapshot, and post-submit sharing.</p>
          </div>
        )}
      </div>
    </PhoneShell>
  )
}

function VisitTypeButton({
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
        'min-h-11 rounded-md border px-3 text-[12px] font-semibold transition-colors',
        active
          ? 'border-[#014486] bg-[#0176d3] text-white'
          : 'border-transparent bg-white text-[#2e3a47]'
      )}
    >
      {label}
    </button>
  )
}

function SnapshotField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
      <p className="mt-1 text-[14px] font-semibold text-on-surface">{value}</p>
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
