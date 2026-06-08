import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, ChevronRight, CircleDot, ClipboardCheck, LockKeyhole, TrendingUp } from 'lucide-react'
import { PhoneShell } from '../components/PhoneShell'
import { TopBar } from '../components/TopBar'
import { TrellisInsightCard } from '../components/TrellisBot'
import { FileUpload } from '../components/FileUpload'
import { useApp } from '../context/useApp'
import { previousSnapshot, store } from '../data/mock'
import { getActiveScorecardSections, getCurrentSection, getCurrentSectionNumber, getStepState } from '../lib/scorecard'
import { getEntryVisitBriefing, getTopRecommendation } from '../lib/trellis'

export function EntryScreen() {
  const navigate = useNavigate()
  const app = useApp()
  const {
    visitType,
    answeredChecks,
    totalChecks,
    totalSections,
    scorecardStatus,
    totalScore,
    submitted,
    agentforceEnabled,
    activeScorecardResult,
    storePlanMap,
  } = app

  const currentSection = getCurrentSection(app)
  const activeSections = getActiveScorecardSections(visitType)
  const currentSectionNumber = getCurrentSectionNumber(app)
  const entrySubtitle = `Start Visit | ${store.city}`
  const trendDelta = totalScore - previousSnapshot.score
  const ctaRoute = submitted || scorecardStatus === 'ready-for-review' || scorecardStatus === 'completed'
    ? '/summary'
    : currentSection.route
  const topRecommendation = getTopRecommendation(app)
  const briefing = agentforceEnabled ? getEntryVisitBriefing(app) : null
  const activePerfectScorecard = activeScorecardResult.scorecard
  const storePlanMapReady = (activePerfectScorecard?.storePlanMapStatus === 'Published' && Boolean(activePerfectScorecard.storePlanMapId)) || !!storePlanMap

  const primaryCopyByStatus = {
    'not-started': {
      label: 'Start Scorecard',
      badge: 'Not Started',
      detail: 'Begin with base plan validation before capturing incremental displays.',
      helper: 'Start with MAP and POG checks, then move into off-shelf and evidence.',
      cta: 'Start Scorecard',
    },
    'in-progress': {
      label: 'Continue Scorecard',
      badge: 'Draft',
      detail: 'An unfinished scorecard is available for this active visit.',
      helper: `Progress: ${answeredChecks} / ${totalChecks} checks | Section ${currentSectionNumber} of ${totalSections}.`,
      cta: 'Continue Scorecard',
    },
    'ready-for-review': {
      label: 'Continue Scorecard',
      badge: 'Ready',
      detail: 'This draft is ready for review.',
      helper: 'Open the summary to review and submit.',
      cta: 'Review & Submit',
    },
    'completed': {
      label: 'View Submitted Scorecard',
      badge: 'Completed',
      detail: 'This scorecard has already been submitted for the current visit.',
      helper: 'Open the summary to review the final outcome and next actions.',
      cta: 'View Submitted Scorecard',
    },
  }

  const primaryCopy = submitted
    ? primaryCopyByStatus.completed
    : primaryCopyByStatus[scorecardStatus]
  const primaryDisabled = activeScorecardResult.state !== 'active' || !storePlanMapReady

  return (
    <PhoneShell>
      <div data-scroll-to-top="true" className="flex-1 overflow-y-auto bg-[#f4f6f9] px-4 py-4 space-y-3">
        <TopBar
          title={store.name}
          subtitle={entrySubtitle}
        />

        <div className="px-1">
          <p className="text-[11px] font-medium text-on-surface-variant">
            {activePerfectScorecard?.name ?? store.scorecard}
          </p>
        </div>

        {activeScorecardResult.state !== 'active' ? (
          <div className="rounded-lg border border-[#f0caca] bg-[#fff5f5] px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#f0caca] bg-white text-[#ba0517]">
                <AlertTriangle size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#8e030f]">
                  {activeScorecardResult.state === 'data-integrity-error'
                    ? 'Active scorecard data issue'
                    : 'No Active Perfect Store Scorecard Available'}
                </p>
                <p className="mt-1 text-[12px] text-[#8e030f]">{activeScorecardResult.message}</p>
                <p className="mt-2 text-[12px] text-on-surface-variant">
                  Sales Managers can complete submissions only under an Ops/Admin published active cycle.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ActiveScorecardContextCard activeScorecard={activeScorecardResult.scorecard} />
        )}

        {activeScorecardResult.state !== 'active' && (
          <div className="rounded-lg border border-outline bg-surface-lowest px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Auto-Populated Context</p>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
              <SnapshotField label="Sales Manager" value={store.rep} />
              <SnapshotField label="Assigned Store" value={store.name} />
              <SnapshotField label="SAP Number" value={store.sapNumber} />
              <SnapshotField label="Region" value={store.region} />
              <SnapshotField label="District" value={store.district} />
              <SnapshotField label="Banner" value={store.banner} />
            </div>
          </div>
        )}

        {activeScorecardResult.state !== 'active' ? null : (
          <>
            {agentforceEnabled && (
              <TrellisInsightCard
                badge="Agentforce Briefing"
                title={`Suggested focus: ${briefing?.suggestedFocus ?? 'Visit focus'}`}
                summary={briefing?.focusReason ?? 'Agentforce is summarizing the highest-confidence focus for this store based on your current state.'}
                tone="info"
                metrics={[
                  { label: 'Last visit', value: String(briefing?.lastVisitScore ?? previousSnapshot.score) },
                  { label: 'Region avg', value: String(briefing?.regionAverage ?? 0) },
                ]}
                items={[
                  { label: 'Repeated gap', value: briefing?.repeatedGap ?? 'No repeated gap detected', tone: 'warning' },
                  { label: 'Top opportunity', value: briefing?.topOpportunity ?? 'No incremental opportunity detected', tone: 'success' },
                ]}
                footer="Agentforce briefing is mock logic in this prototype; it is designed to demonstrate differentiated guidance across screens."
              />
            )}
        {agentforceEnabled && (
          <TrellisInsightCard
            badge="Top Recommendation"
            title={topRecommendation.title}
            summary={topRecommendation.summary}
            tone={topRecommendation.tone}
            metrics={[
              { label: 'Impact', value: topRecommendation.impactLabel },
            ]}
            items={[
              { label: 'Why this matters', value: topRecommendation.reason, tone: topRecommendation.tone },
            ]}
            actionLabel={topRecommendation.actionLabel}
            onAction={() => navigate(topRecommendation.route)}
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
                disabled={primaryDisabled}
                className={clsx(
                  'mt-1 flex min-h-11 w-full items-center justify-center gap-2 rounded-md px-6 text-[13px] font-semibold',
                  primaryDisabled
                    ? 'bg-[#dde3ea] text-[#52606d]'
                    : 'bg-primary text-white'
                )}
              >
                {primaryDisabled ? 'Store Plan Missing' : primaryCopy.cta}
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>

        {shouldShowInitialProgress(scorecardStatus, submitted) ? (
          <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
            <div className="px-4 py-3 border-b border-outline">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Current Progress</p>
            </div>
            <div className="px-4 py-3 space-y-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <SnapshotField label="Progress" value={`${answeredChecks} / ${totalChecks} checks`} />
                <SnapshotField label="Section" value={`${currentSectionNumber} of ${totalSections}`} />
                <SnapshotField label="Score So Far" value={totalScore.toFixed(0)} />
                <SnapshotField label="Status" value={submitted ? 'Submitted' : 'Draft'} />
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
              Scorecard submitted successfully.
            </p>
            <p className="text-[12px] text-[#25523b] mt-1">Open the summary to review the execution outcome, next actions, and tracked flags.</p>
          </div>
        )}
          </>
        )}
      </div>
    </PhoneShell>
  )
}

function ActiveScorecardContextCard({ activeScorecard }: { activeScorecard: NonNullable<ReturnType<typeof useApp>['activeScorecardResult']['scorecard']> }) {
  const app = useApp()
  return (
    <div className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
      <div className="border-b border-outline px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Active Ops Scorecard</p>
            <p className="mt-1 text-[14px] font-semibold text-on-surface">{activeScorecard.name}</p>
            <p className="mt-1 text-[12px] text-on-surface-variant">
              {activeScorecard.quarter} FY{activeScorecard.fiscalYear} | {activeScorecard.planVersion}
            </p>
          </div>
          <span className="rounded-md border border-[#cde8d3] bg-[#edf7ee] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1f5f33]">
            {activeScorecard.storePlanMapStatus === 'Published' || !!app.storePlanMap ? 'Plan Published' : 'Plan Missing'}
          </span>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <SnapshotField label="Sales Manager" value={store.rep} />
          <SnapshotField label="Assigned Store" value={store.name} />
          <SnapshotField label="SAP Number" value={store.sapNumber} />
          <SnapshotField label="Region" value={store.region} />
          <SnapshotField label="District" value={store.district} />
          <SnapshotField label="Banner" value={store.banner} />
          <SnapshotField label="Store Plan Map" value={app.storePlanMap?.fileName ?? activeScorecard.storePlanMapId} />
          <SnapshotField label="POG Cluster" value={app.storePlanMap ? 'Uploaded' : (activeScorecard.storePlanMapStatus ?? 'Missing')} />
          <SnapshotField label="Published By" value={activeScorecard.publishedBy} />
        </div>
        <div className="mt-3 rounded-lg border border-outline bg-[#f7f9fb] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Ops/Admin Setup Prerequisite</p>
          <p className="mt-1 text-[12px] text-on-surface-variant">
            Upload Store Plan Map / POG Cluster, validate required columns, preview rows, and publish active plan before field scoring starts.
          </p>
          <FileUpload
            label=""
            value={app.storePlanMap}
            onChange={app.uploadStorePlanMap}
            onRemove={app.removeStorePlanMap}
            className="mt-3"
          />
        </div>
      </div>
    </div>
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
