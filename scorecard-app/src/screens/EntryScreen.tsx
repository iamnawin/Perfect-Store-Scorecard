import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronRight, CircleDot, ClipboardCheck, LockKeyhole, TrendingUp } from 'lucide-react'
import { PhoneShell } from '../components/PhoneShell'
import { TopBar } from '../components/TopBar'
import { TrellisInsightCard } from '../components/TrellisBot'
import { useApp } from '../context/useApp'
import { previousSnapshot, store } from '../data/mock'
import { getActiveScorecardSections, getCurrentSection, getCurrentSectionNumber, getPendingFollowUpEntries, getStepState } from '../lib/scorecard'

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
  const activeSections = getActiveScorecardSections(visitType)
  const currentSectionNumber = getCurrentSectionNumber(app)
  const entrySubtitle = visitType === 'follow-up'
    ? `Revisit Scorecard | ${store.city}`
    : `Initial Scorecard | ${store.city}`
  const previousEntryCount = offShelf.filter(entry => entry.origin === 'previous-visit').length
  const pendingFollowUpEntries = getPendingFollowUpEntries(offShelf)
  const reviewedFollowUpEntries = previousEntryCount - pendingFollowUpEntries.length
  const trendDelta = totalScore - previousSnapshot.score
  const ctaRoute = scorecardStatus === 'ready-for-review' || scorecardStatus === 'completed'
    ? '/summary'
    : currentSection.route

  const followUpPrimaryCopy = {
    'not-started': {
      label: 'Start Follow-up',
      badge: 'Loaded',
      detail: 'Previous completed scorecard loaded',
      helper: 'Starting point: Review Prior Displays',
      cta: 'Start Follow-up',
    },
    'in-progress': {
      label: 'Follow-up in Review',
      badge: 'Reviewing',
      detail: 'This is a new scorecard run based on the last completed execution.',
      helper: currentSection.id === 'photo-evidence'
        ? 'Next action: Update Evidence'
        : currentSection.id === 'review-submit'
          ? 'Next action: Review Changes & Submit'
          : 'Starting point: Review Prior Displays',
      cta: 'Open Follow-up',
    },
    'ready-for-review': {
      label: 'Follow-up ready for review',
      badge: 'Ready',
      detail: 'Previous changes have been reviewed and evidence is complete.',
      helper: 'Next action: Review Changes & Submit',
      cta: 'Review Follow-up',
    },
    'completed': {
      label: 'Follow-up completed',
      badge: 'Completed',
      detail: 'This follow-up scorecard has already been submitted.',
      helper: 'Open the summary to review the completed change-tracking result.',
      cta: 'Open Summary',
    },
  }[scorecardStatus]

  const initialPrimaryCopy = {
    'not-started': {
      label: 'Start Scorecard',
      badge: 'Not Started',
      detail: 'Begin with base plan validation before capturing incremental displays.',
      helper: 'Start with MAP and POG checks, then move into off-shelf and evidence.',
      cta: 'Start Scorecard',
    },
    'in-progress': {
      label: 'Initial scorecard underway',
      badge: 'In Progress',
      detail: 'An unfinished scorecard is available for this active visit.',
      helper: `Progress: ${answeredChecks} / ${totalChecks} checks | Section ${currentSectionNumber} of ${totalSections}.`,
      cta: 'Resume Draft',
    },
    'ready-for-review': {
      label: 'Initial scorecard ready for review',
      badge: 'Ready',
      detail: 'Checklist and evidence are complete for this visit.',
      helper: `${capturedRequiredPhotos}/${requiredPhotos} required photos captured | Open the summary to submit.`,
      cta: 'Review & Submit',
    },
    'completed': {
      label: 'Initial scorecard completed',
      badge: 'Completed',
      detail: 'This scorecard has already been submitted for the current visit.',
      helper: 'Open the summary to review the final outcome and next actions.',
      cta: 'Open Summary',
    },
  }[scorecardStatus]

  const primaryCopy = visitType === 'follow-up' ? followUpPrimaryCopy : initialPrimaryCopy

  return (
    <PhoneShell>
      <div className="flex-1 overflow-y-auto bg-[#f4f6f9] px-4 py-4 space-y-3">
        <TopBar
          title={store.name}
          subtitle={entrySubtitle}
        />

        <div className="px-1">
          <p className="text-[11px] font-medium text-on-surface-variant">{store.scorecard}</p>
        </div>

        <div className="rounded-lg border border-outline bg-surface-lowest px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Scorecard Type</p>
            <div className="inline-grid grid-cols-2 gap-1 rounded-md border border-[#d8dde6] bg-[#f7f9fb] p-1">
              <VisitTypeButton active={visitType === 'initial'} label="Initial" onClick={() => setVisitType('initial')} />
              <VisitTypeButton active={visitType === 'follow-up'} label="Follow-up" onClick={() => setVisitType('follow-up')} />
            </div>
          </div>
        </div>

        {visitType === 'follow-up' ? (
          <>
            <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
              <div className="px-4 py-3 border-b border-outline">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Reference</p>
                <p className="mt-1 text-[15px] font-semibold text-on-surface">Previous completed scorecard loaded</p>
              </div>
              <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-3">
                <SnapshotField label="Last Score" value={String(previousSnapshot.score)} />
                <SnapshotField label="Last Completed" value={previousSnapshot.date} />
                <SnapshotField label="Prior Displays" value={String(previousEntryCount)} />
                <SnapshotField label="Current Delta" value={`${trendDelta >= 0 ? '+' : ''}${trendDelta.toFixed(0)} pts`} />
              </div>
            </div>

            <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
              <div className="px-4 py-3 border-b border-outline">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Purpose</p>
              </div>
              <div className="px-4 py-3 space-y-2">
                <p className="text-[13px] text-on-surface">This follow-up checks what changed since the last completed scorecard.</p>
                <p className="text-[13px] text-on-surface-variant">You can keep, edit, remove, or add displays.</p>
              </div>
            </div>
          </>
        ) : (
          <>
            {agentforceEnabled && (
              <TrellisInsightCard
                badge="Agentforce Insight"
                title="What matters now"
                summary="Agentforce is reading prior visit history and current score state to point the rep at the fastest recovery path."
                items={[
                  { label: 'Repeated Gap', value: 'Garden Door missing for 2 visits', tone: 'warning' },
                  { label: 'Top Opportunity', value: 'Scotts Turf Builder 20 lb at Endcap (+12 pts)', tone: 'success' },
                  { label: 'Suggested Focus', value: 'Fix Garden Door first, then add incremental displays' },
                ]}
              />
            )}
          </>
        )}

        {visitType === 'follow-up' && agentforceEnabled && (
          <TrellisInsightCard
            badge="Agentforce Insight"
            title="What matters in this follow-up"
            summary="Agentforce is treating this as a new change-tracking scorecard run based on the last completed visit."
            items={[
              { label: 'Loaded Displays', value: `${previousEntryCount} previous display ${previousEntryCount === 1 ? 'record' : 'records'} ready for review`, tone: 'info' },
              { label: 'Reviewed So Far', value: `${reviewedFollowUpEntries} reviewed | ${pendingFollowUpEntries.length} remaining`, tone: reviewedFollowUpEntries > 0 ? 'success' : 'info' },
              { label: 'Suggested Focus', value: 'Review prior displays first, then update evidence for what changed' },
            ]}
          />
        )}
        <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
          <div className="px-4 py-3 border-b border-outline flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Primary Action</p>
              <p className="text-[17px] font-semibold text-on-surface mt-1">{primaryCopy.label}</p>
              <p className="text-[12px] text-on-surface-variant mt-1">{primaryCopy.detail}</p>
              <p className="text-[12px] text-on-surface-variant mt-1">{primaryCopy.helper}</p>
            </div>
            <span className={clsx(
              'rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
              visitType === 'follow-up'
                ? scorecardStatus === 'completed'
                  ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]'
                  : scorecardStatus === 'ready-for-review'
                    ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]'
                    : scorecardStatus === 'in-progress'
                      ? 'border-[#c9d8ea] bg-[#edf4ff] text-primary'
                      : 'border-[#dde3ea] bg-[#f4f6f9] text-[#52606d]'
                : scorecardStatus === 'in-progress'
                  ? 'border-[#c9d8ea] bg-[#edf4ff] text-primary'
                  : scorecardStatus === 'ready-for-review' || scorecardStatus === 'completed'
                    ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]'
                    : 'border-[#dde3ea] bg-[#f4f6f9] text-[#52606d]'
            )}>
              {primaryCopy.badge}
            </span>
          </div>
          <div className="px-4 py-3">
            {!submitted && (
              <button
                type="button"
                onClick={() => navigate(ctaRoute)}
                className="mt-1 w-full min-h-11 rounded-md bg-primary px-6 text-[13px] font-semibold text-white flex items-center justify-center gap-2"
              >
                {primaryCopy.cta}
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>

        {visitType === 'follow-up' ? (
          <>
            {scorecardStatus !== 'not-started' && (
              <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
                <div className="px-4 py-3 border-b border-outline">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Follow-up Change Review</p>
                </div>
                <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-3">
                  <SnapshotField label="Reviewed" value={String(reviewedFollowUpEntries)} />
                  <SnapshotField label="Remaining" value={String(pendingFollowUpEntries.length)} />
                  <SnapshotField label="Evidence" value={`${capturedRequiredPhotos} / ${requiredPhotos} photos`} />
                  <SnapshotField label="Score So Far" value={totalScore.toFixed(0)} />
                </div>
              </div>
            )}

            <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
              <div className="px-4 py-3 border-b border-outline">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Follow-up Flow</p>
              </div>
              <div className="divide-y divide-outline">
                {activeSections.map((section, index) => (
                  <div key={section.id} className="flex items-start gap-3 px-4 py-3">
                    <div className={`mt-0.5 h-7 w-7 rounded-md border flex items-center justify-center ${followUpIconTone(getStepState(section.id, app))}`}>
                      {stepIcon(getStepState(section.id, app))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[13px] font-semibold text-on-surface">
                          {index + 1}. {followUpStepTitle(section.id)}
                        </p>
                        <span className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${followUpStepTone(getStepState(section.id, app))}`}>
                          {followUpStepLabel(getStepState(section.id, app))}
                        </span>
                      </div>
                      <p className="text-[12px] text-on-surface-variant mt-1">{followUpStepDescription(section.id)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : shouldShowInitialProgress(scorecardStatus, submitted) ? (
          <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
            <div className="px-4 py-3 border-b border-outline">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Current Progress</p>
            </div>
            <div className="px-4 py-3 space-y-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <SnapshotField label="Progress" value={`${answeredChecks} / ${totalChecks} checks`} />
                <SnapshotField label="Section" value={`${currentSectionNumber} of ${totalSections}`} />
                <SnapshotField label="Score So Far" value={totalScore.toFixed(0)} />
                <SnapshotField label="Evidence" value={`${capturedRequiredPhotos} / ${requiredPhotos} photos`} />
              </div>
              <div className="rounded-lg border border-outline bg-[#f7f9fb] px-3 py-3">
                <p className="text-[12px] text-on-surface-variant">Resume Draft</p>
                <p className="mt-1 text-[13px] font-semibold text-on-surface">{currentSection.title}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
            <div className="px-4 py-3 border-b border-outline">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Last Visit Snapshot</p>
            </div>
            <div className="px-4 py-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <SnapshotField label="Last Score" value={String(previousSnapshot.score)} />
                <SnapshotField label="Last Submitted" value={previousSnapshot.date} />
                <SnapshotField label="Repeated Gap" value="Garden Doors" />
                <SnapshotField label="Top Opportunity" value="Weed and Feed Endcap" />
              </div>
            </div>
          </div>
        )}

        {visitType === 'initial' && scorecardStatus !== 'not-started' && (
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

        {visitType === 'initial' && scorecardStatus !== 'not-started' && !submitted && (
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
              {visitType === 'follow-up' ? 'Follow-up scorecard submitted successfully.' : 'Initial scorecard submitted successfully.'}
            </p>
            <p className="text-[12px] text-[#25523b] mt-1">Open the summary to review the execution outcome, next actions, and tracked flags.</p>
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
        'min-h-9 rounded-md border px-3 text-[11px] font-semibold transition-colors',
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

function shouldShowInitialProgress(scorecardStatus: string, submitted: boolean) {
  return scorecardStatus === 'in-progress' || scorecardStatus === 'ready-for-review' || submitted
}

function followUpStepTitle(sectionId: string) {
  return {
    'off-shelf-capture': 'Review Prior Displays',
    'photo-evidence': 'Update Evidence',
    'review-submit': 'Review Changes & Submit',
  }[sectionId] ?? sectionId
}

function followUpStepDescription(sectionId: string) {
  return {
    'off-shelf-capture': 'Validate prior displays and mark each one as same, edited, gone, or additional.',
    'photo-evidence': 'Capture only the proof that is still needed for the updated scorecard.',
    'review-submit': 'Review retained, removed, updated, and added displays before submission.',
  }[sectionId] ?? ''
}

function followUpStepLabel(state: ReturnType<typeof getStepState>) {
  return {
    completed: 'Reviewed',
    'in-progress': 'Current Focus',
    pending: 'Next',
    locked: 'Later',
  }[state]
}

function followUpStepTone(state: ReturnType<typeof getStepState>) {
  return {
    completed: 'text-[#1f5f33] bg-[#edf7ee] border-[#cde8d3]',
    'in-progress': 'text-primary bg-[#edf4ff] border-[#c9d8ea]',
    pending: 'text-[#755400] bg-[#f9f2e7] border-[#ead7b1]',
    locked: 'text-[#52606d] bg-[#f4f6f9] border-[#dde3ea]',
  }[state]
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

function followUpIconTone(state: ReturnType<typeof getStepState>) {
  return iconTone(state)
}

function stepIcon(state: ReturnType<typeof getStepState>) {
  if (state === 'completed') return <CheckCircle2 size={15} />
  if (state === 'in-progress') return <ClipboardCheck size={15} />
  if (state === 'pending') return <CircleDot size={15} />
  return <LockKeyhole size={15} />
}
