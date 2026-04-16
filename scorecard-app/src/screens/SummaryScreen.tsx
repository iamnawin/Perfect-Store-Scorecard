import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Flag,
  Mail,
  Send,
  Share2,
} from 'lucide-react'
import { BottomActionBar } from '../components/BottomActionBar'
import { PhoneShell } from '../components/PhoneShell'
import { StandardGuidanceCard } from '../components/StandardGuidanceCard'
import { TopBar } from '../components/TopBar'
import { TrellisAskButton, TrellisSummaryCard } from '../components/TrellisBot'
import { useApp } from '../context/useApp'
import { checklistQuestions, previousSnapshot, store } from '../data/mock'
import {
  getChecklistBasePlanScore,
  getCurrentSectionNumber,
  getMissingRequiredEvidence,
  getOffShelfIncrementalScore,
  getPendingFollowUpEntries,
  getRemainingOffShelfRecommendations,
  getVisitTypeLabel,
  parseOffShelfQuantity,
} from '../lib/scorecard'
import { getSummaryInsight } from '../lib/trellis'

export function SummaryScreen() {
  const navigate = useNavigate()
  const app = useApp()
  const [trellisOpen, setTrellisOpen] = useState(false)
  const {
    visitType,
    checklist,
    offShelf,
    offShelfConfirmed,
    evidence,
    notes,
    revisitRequired,
    shelfResetNeeded,
    agentforceEnabled,
    totalScore,
    executionScore,
    lgorPct,
    completionPercent,
    totalSections,
    lastSavedAt,
    saveDraft,
    submitScorecard,
    submitted,
  } = app

  const basePlanScore = getChecklistBasePlanScore(checklist)
  const incrementalScore = getOffShelfIncrementalScore(offShelf)
  const missingEvidence = getMissingRequiredEvidence(evidence, offShelf)
  const pendingFollowUpEntries = getPendingFollowUpEntries(offShelf)
  const unansweredCount = checklistQuestions.filter(question => !checklist[question.id]).length
  const sectionNumber = getCurrentSectionNumber(app)
  const visitTypeLabel = getVisitTypeLabel(visitType)
  const retainedCount = offShelf.filter(entry => entry.status === 'retained' || entry.status === 'updated').length
  const removedCount = offShelf.filter(entry => entry.status === 'removed').length
  const addedCount = offShelf.filter(entry => entry.status === 'added').length
  const scoreDelta = +(totalScore - previousSnapshot.score).toFixed(1)
  const mapMisses = checklistQuestions.filter(question => question.group === 'map' && checklist[question.id] !== 'yes').length
  const missingTopItems = checklistQuestions.filter(question => question.group === 'pog' && checklist[question.id] !== 'yes').length
  const displayMisses = checklistQuestions.filter(question => question.group === 'display' && checklist[question.id] === 'no').length
  const lightDisplays = offShelf.filter(entry => parseOffShelfQuantity(entry.quantity) < 80).length
  const notEnough = displayMisses + lightDisplays
  const emptyCalories = offShelf.filter(entry => entry.classification !== 'incremental').length
  const riskValue = calculateRiskValue({
    mapMisses,
    missingTopItems,
    notEnough,
    emptyCalories,
    missingEvidenceCount: missingEvidence.length,
  })
  const previousLgorPct = +(Math.max(0, lgorPct - 1.3)).toFixed(1)
  const previousRiskValue = Math.max(0, riskValue + (scoreDelta >= 0 ? 420 : -260))
  const lgorDelta = +(lgorPct - previousLgorPct).toFixed(1)
  const riskDelta = riskValue - previousRiskValue
  const comparisonRepeatedGap = mapMisses > 0
    ? `${mapMisses} MAP location${mapMisses > 1 ? 's' : ''} still unresolved`
    : previousSnapshot.gap
  const remainingRecommendations = getRemainingOffShelfRecommendations(offShelf)
  const summaryInsight = getSummaryInsight(app)
  const blockerCards = [
    ...(missingEvidence.length > 0
      ? [{
          key: 'missing-evidence',
          title: `${missingEvidence.length} required photo${missingEvidence.length > 1 ? 's' : ''} missing`,
          detail: 'Capture required proof before the visit summary can be submitted.',
          route: '/photo',
          actionLabel: 'Open Photo Evidence',
        }]
      : []),
    ...(visitType === 'initial' && unansweredCount > 0
      ? [{
          key: 'unanswered-checks',
          title: `${unansweredCount} checklist question${unansweredCount > 1 ? 's' : ''} still unanswered`,
          detail: 'Finish the checklist so the score summary reflects the full visit.',
          route: '/checklist',
          actionLabel: 'Return to Checklist',
        }]
      : []),
    ...(visitType === 'follow-up' && pendingFollowUpEntries.length > 0
      ? [{
          key: 'follow-up-review',
          title: `${pendingFollowUpEntries.length} prior display${pendingFollowUpEntries.length > 1 ? 's' : ''} still need a follow-up decision`,
          detail: 'Mark each previous display as Same, Edit, or Gone before you submit the follow-up.',
          route: '/off-shelf',
          actionLabel: 'Finish Follow-up Review',
        }]
      : []),
    ...(!offShelfConfirmed && offShelf.length === 0
      ? [{
          key: 'off-shelf-review',
          title: 'Off-shelf capture is not reviewed yet',
          detail: 'Save at least one display or confirm that no incremental opportunity was found.',
          route: '/off-shelf',
          actionLabel: 'Open Off-Shelf',
        }]
      : []),
  ]
  const helperText = blockerCards.length > 0
    ? `Next required action: ${blockerCards[0]?.actionLabel}`
    : lastSavedAt
      ? `Draft saved at ${lastSavedAt}`
      : 'Review the visit summary and submit when ready.'

  function openEmailSnapshot() {
    const subject = encodeURIComponent(`Store Scorecard Snapshot - ${store.name}`)
    const body = encodeURIComponent(buildShareText({
      agentforceEnabled,
      totalScore,
      executionScore,
      basePlanScore,
      incrementalScore,
      lgorPct,
      riskValue,
      mapMisses,
      missingTopItems,
      notEnough,
      emptyCalories,
      scoreDelta,
      lgorDelta,
      riskDelta,
      comparisonRepeatedGap,
      notes,
      revisitRequired,
      shelfResetNeeded,
      summaryInsight,
      nextBestAction: buildNextBestAction(remainingRecommendations[0], summaryInsight.nextVisitFocus),
    }))

    window.open(`mailto:?subject=${subject}&body=${body}`, '_self')
  }

  async function shareToTeamFeed() {
    const shareText = buildShareText({
      agentforceEnabled,
      totalScore,
      executionScore,
      basePlanScore,
      incrementalScore,
      lgorPct,
      riskValue,
      mapMisses,
      missingTopItems,
      notEnough,
      emptyCalories,
      scoreDelta,
      lgorDelta,
      riskDelta,
      comparisonRepeatedGap,
      notes,
      revisitRequired,
      shelfResetNeeded,
      summaryInsight,
      nextBestAction: buildNextBestAction(remainingRecommendations[0], summaryInsight.nextVisitFocus),
    })

    if (navigator.share) {
      await navigator.share({
        title: `Store Scorecard Snapshot - ${store.name}`,
        text: shareText,
      })
      return
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText)
      window.alert('Visit snapshot copied. Paste it into Chatter.')
      return
    }

    window.alert(shareText)
  }

  return (
    <PhoneShell>
      <div className="flex-1 overflow-y-auto bg-[#f4f6f9]">
        <TopBar
          title={submitted ? 'Visit Submitted' : 'Visit Summary'}
          subtitle={`${store.name} | ${visitTypeLabel} Visit`}
          showBack
        />

        <div className="border-b border-outline bg-surface-lowest px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Progress</p>
              <p className="text-[12px] text-on-surface-variant mt-1">Step {sectionNumber} of {totalSections} | {completionPercent}% complete</p>
            </div>
            <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${
              submitted
                ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]'
                : blockerCards.length === 0
                  ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]'
                  : 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]'
            }`}>
              {submitted ? 'Submitted' : blockerCards.length === 0 ? 'Ready to Submit' : `${blockerCards.length} Blockers`}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#dde3ea] overflow-hidden mt-3">
            <div className="h-full bg-primary rounded-full" style={{ width: `${completionPercent}%` }} />
          </div>
        </div>

        <div className="px-4 py-3 space-y-3">
          <div className="rounded-xl border border-[#c9d8ea] bg-[#f7fbff] px-4 py-4 shadow-[0_8px_22px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Total Score</p>
                <p className="text-[26px] font-semibold text-on-surface mt-1">{totalScore.toFixed(1)}</p>
                <p className="text-[12px] text-on-surface-variant mt-1">
                  {scoreDelta >= 0 ? '+' : ''}{scoreDelta.toFixed(1)} pts vs last submission
                </p>
              </div>
              <div className={`rounded-lg border px-3 py-2 text-right ${
                scoreDelta >= 0 ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]' : 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]'
              }`}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em]">Status</p>
                <p className="text-[14px] font-semibold mt-1">{submitted ? 'Closed' : blockerCards.length === 0 ? 'Ready' : 'Action Needed'}</p>
              </div>
            </div>
          </div>

          {agentforceEnabled && (
            <TrellisSummaryCard
              title="Agentforce Summary"
              summary={summaryInsight.narrative}
              highlights={[
                { label: 'Main positive driver', value: summaryInsight.mainPositiveDriver, tone: 'success' },
                { label: 'Top missed opportunity', value: summaryInsight.biggestMissedOpportunity, tone: 'warning' },
                { label: 'Next best action', value: buildNextBestAction(remainingRecommendations[0], summaryInsight.nextVisitFocus) },
              ]}
              footer="Agentforce adds mock interpretation and next-step guidance on top of the same core scorecard summary."
            />
          )}
          {!agentforceEnabled && (
            <StandardGuidanceCard
              title={visitType === 'follow-up' ? 'Review follow-up changes and required next steps' : 'Review completed actions and follow-ups'}
              summary={visitType === 'follow-up'
                ? 'Standard mode keeps this summary focused on retained, removed, and added displays without Agentforce interpretation.'
                : 'Review completed actions, missed items, and required follow-ups.'}
              detail={`Suggested action: ${blockerCards.length > 0 ? blockerCards[0].actionLabel : buildNextBestAction(remainingRecommendations[0], summaryInsight.nextVisitFocus)}`}
            />
          )}

          {visitType === 'follow-up' && (
            <InfoBlock title="Follow-up Change Summary" subtitle="Track exactly what changed since the previous visit.">
              <div className="grid grid-cols-2 gap-2">
                <MetricTile label="Retained / Updated" value={`${retainedCount}`} tone="success" />
                <MetricTile label="Removed" value={`${removedCount}`} tone={removedCount > 0 ? 'warning' : 'neutral'} />
                <MetricTile label="Added" value={`${addedCount}`} tone="success" />
                <MetricTile label="Pending Review" value={`${pendingFollowUpEntries.length}`} tone={pendingFollowUpEntries.length > 0 ? 'warning' : 'neutral'} />
              </div>
              <div className="mt-3 rounded-lg border border-outline bg-[#f7f9fb] px-3 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Previous summary</p>
                <p className="mt-1 text-[13px] font-semibold text-on-surface">{previousSnapshot.opportunity}</p>
                <p className="mt-2 text-[12px] text-on-surface-variant">Last submitted {previousSnapshot.date} by {previousSnapshot.submittedBy}</p>
              </div>
            </InfoBlock>
          )}

          {visitType === 'initial' && (
          <InfoBlock title="Score Breakdown" subtitle="Lightning-style summary of this visit outcome.">
            <div className="grid grid-cols-2 gap-2">
              <MetricTile label="Execution" value={`${executionScore}%`} />
              <MetricTile label="Base Plan" value={basePlanScore.toFixed(1)} />
              <MetricTile label="Above & Beyond" value={`+${incrementalScore.toFixed(1)}`} tone="success" />
              <MetricTile label="LGOR %" value={`${lgorPct.toFixed(1)}%`} />
              <MetricTile label="Risk $" value={formatCurrency(riskValue)} tone={riskValue > previousRiskValue ? 'warning' : 'neutral'} />
            </div>
          </InfoBlock>
          )}

          {visitType === 'initial' && (
          <InfoBlock title="Current Gaps" subtitle="Business risks that still need attention from the field or next visit.">
            <div className="space-y-2">
              <GapRow
                title="Missing MAP"
                detail={mapMisses > 0 ? `${mapMisses} base plan location${mapMisses > 1 ? 's' : ''} not fully set.` : 'No MAP locations are currently missing.'}
                value={mapMisses > 0 ? `${mapMisses} open` : 'Clear'}
                tone={mapMisses > 0 ? 'warning' : 'success'}
              />
              <GapRow
                title="Missing Top Items"
                detail={missingTopItems > 0 ? `${missingTopItems} top-item or POG standard${missingTopItems > 1 ? 's are' : ' is'} still unresolved.` : 'Top item coverage is currently in place.'}
                value={missingTopItems > 0 ? `${missingTopItems} open` : 'Clear'}
                tone={missingTopItems > 0 ? 'warning' : 'success'}
              />
              <GapRow
                title="Not Enough"
                detail={notEnough > 0 ? `${notEnough} display or quantity signal${notEnough > 1 ? 's' : ''} still looks underbuilt.` : 'Display quantity looks healthy for this visit.'}
                value={notEnough > 0 ? `${notEnough} flags` : 'Clear'}
                tone={notEnough > 0 ? 'warning' : 'success'}
              />
              <GapRow
                title="Empty Calories"
                detail={emptyCalories > 0 ? `${emptyCalories} captured display${emptyCalories > 1 ? 's are' : ' is'} not counted as true incremental lift.` : 'All captured displays are contributing as incremental value.'}
                value={emptyCalories > 0 ? `${emptyCalories} flagged` : 'Clear'}
                tone={emptyCalories > 0 ? 'warning' : 'success'}
              />
            </div>
          </InfoBlock>
          )}

          <InfoBlock title="Compared to Last Submission" subtitle="Historical business comparison without AI interpretation.">
            <div className="grid grid-cols-2 gap-2">
              <MetricTile label="Last Score" value={String(previousSnapshot.score)} />
              <MetricTile label="Score Trend" value={`${scoreDelta >= 0 ? '+' : ''}${scoreDelta.toFixed(1)} pts`} tone={scoreDelta >= 0 ? 'success' : 'warning'} />
              <MetricTile label="LGOR Trend" value={`${lgorDelta >= 0 ? '+' : ''}${lgorDelta.toFixed(1)}%`} tone={lgorDelta >= 0 ? 'success' : 'warning'} />
              <MetricTile label="Risk Trend" value={formatCurrencyDelta(riskDelta)} tone={riskDelta <= 0 ? 'success' : 'warning'} />
            </div>
            <div className="mt-3 rounded-lg border border-outline bg-[#f7f9fb] px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Repeated Gap</p>
              <p className="mt-1 text-[13px] font-semibold text-on-surface">{comparisonRepeatedGap}</p>
              <p className="mt-2 text-[12px] text-on-surface-variant">Last submitted {previousSnapshot.date} by {previousSnapshot.submittedBy}</p>
            </div>
          </InfoBlock>

          {(notes || revisitRequired || shelfResetNeeded) && (
            <InfoBlock title="Visit Flags" subtitle="Field notes and follow-up markers captured during this visit.">
              <div className="space-y-2">
                {notes && <ListRow icon={<ClipboardCheck size={13} className="text-primary" />} text={`Field note: ${notes}`} />}
                {revisitRequired && <ListRow icon={<Flag size={13} className="text-[#8b5d00]" />} text="Follow-up Required is flagged for this store." />}
                {shelfResetNeeded && <ListRow icon={<Flag size={13} className="text-[#8b5d00]" />} text="Shelf Reset Needed is flagged before the next visit." />}
              </div>
            </InfoBlock>
          )}

          <InfoBlock title="Submission Actions" subtitle="Share or submit the visit summary from the field.">
            <div className="grid grid-cols-1 gap-2">
              <ActionButton label="Email Snapshot" icon={<Mail size={14} />} tone="secondary" onClick={openEmailSnapshot} />
              <ActionButton label="Post to Chatter" icon={<Share2 size={14} />} tone="secondary" onClick={() => { void shareToTeamFeed() }} />
              <ActionButton
                label={submitted ? 'Visit Submitted' : blockerCards.length === 0 ? 'Submit Visit' : blockerCards[0]?.actionLabel ?? 'Resolve Blocker'}
                icon={submitted ? <CheckCircle2 size={14} /> : blockerCards.length === 0 ? <Send size={14} /> : <AlertTriangle size={14} />}
                onClick={submitted ? () => navigate('/') : blockerCards.length === 0 ? submitScorecard : () => navigate(blockerCards[0].route)}
              />
            </div>
          </InfoBlock>

          <InfoBlock title="Required Before Submit" subtitle="Resolve these blockers before the visit can be closed.">
            <div className="space-y-2">
              {blockerCards.length > 0 ? blockerCards.map(blocker => (
                <div key={blocker.key} className="rounded-lg border border-[#f9d6d0] bg-[#fef1ee] px-3 py-3">
                  <p className="text-[12px] font-semibold text-[#8e030f]">{blocker.title}</p>
                  <p className="text-[12px] text-[#8e030f] mt-1">{blocker.detail}</p>
                  <button
                    type="button"
                    onClick={() => navigate(blocker.route)}
                    className="mt-3 min-h-10 rounded-md bg-primary px-3 text-[12px] font-semibold text-white"
                  >
                    {blocker.actionLabel}
                  </button>
                </div>
              )) : (
                <div className="rounded-lg border border-[#cde8d3] bg-[#edf7ee] px-3 py-3">
                  <p className="text-[12px] font-semibold text-[#1f5f33]">No submission blockers remain.</p>
                  <p className="text-[12px] text-[#1f5f33] mt-1">This visit is ready for review and final submission.</p>
                </div>
              )}
            </div>
          </InfoBlock>
          {agentforceEnabled && (
            <TrellisAskButton
              active={trellisOpen}
              onClick={() => setTrellisOpen(prev => !prev)}
              title="Visit summary"
              summary={summaryInsight.narrative}
              items={[
                `Main driver: ${summaryInsight.mainPositiveDriver}`,
                `Top missed opportunity: ${summaryInsight.biggestMissedOpportunity}`,
                `Next best action: ${buildNextBestAction(remainingRecommendations[0], summaryInsight.nextVisitFocus)}`,
              ]}
            />
          )}
        </div>
      </div>

      <BottomActionBar
        secondaryLabel={submitted ? undefined : 'Save Draft'}
        onSecondary={submitted ? undefined : saveDraft}
        primaryLabel={submitted ? 'Done' : blockerCards.length === 0 ? 'Submit Visit' : blockerCards[0]?.actionLabel ?? 'Resolve Blocker'}
        onPrimary={submitted ? () => navigate('/') : blockerCards.length === 0 ? submitScorecard : () => navigate(blockerCards[0].route)}
        primaryIcon={submitted ? undefined : blockerCards.length === 0 ? <Send size={15} /> : undefined}
        helperText={helperText}
      />
    </PhoneShell>
  )
}

function InfoBlock({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-outline bg-surface-lowest">
      <div className="border-b border-outline px-4 py-3">
        <p className="text-[13px] font-semibold text-on-surface">{title}</p>
        <p className="mt-1 text-[11px] text-on-surface-variant">{subtitle}</p>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  )
}

function MetricTile({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'neutral' | 'success' | 'warning'
}) {
  return (
    <div className="rounded-lg border border-outline bg-[#f7f9fb] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
      <p className={`mt-1 text-[15px] font-semibold ${
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

function GapRow({
  title,
  detail,
  value,
  tone,
}: {
  title: string
  detail: string
  value: string
  tone: 'success' | 'warning'
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-outline bg-[#f7f9fb] px-3 py-3">
      <div>
        <p className="text-[12px] font-semibold text-on-surface">{title}</p>
        <p className="mt-1 text-[12px] text-on-surface-variant">{detail}</p>
      </div>
      <span className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        tone === 'success'
          ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]'
          : 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]'
      }`}>
        {value}
      </span>
    </div>
  )
}

function ListRow({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p className="text-[12px] text-on-surface-variant leading-snug">{text}</p>
    </div>
  )
}

function ActionButton({
  label,
  icon,
  tone = 'primary',
  onClick,
}: {
  label: string
  icon?: ReactNode
  tone?: 'primary' | 'secondary'
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-md px-3 text-[12px] font-semibold flex items-center justify-center gap-2 ${
        tone === 'primary'
          ? 'bg-primary text-white'
          : 'border border-[#c9d8ea] bg-[#edf4ff] text-primary'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function calculateRiskValue({
  mapMisses,
  missingTopItems,
  notEnough,
  emptyCalories,
  missingEvidenceCount,
}: {
  mapMisses: number
  missingTopItems: number
  notEnough: number
  emptyCalories: number
  missingEvidenceCount: number
}) {
  return (
    mapMisses * 180 +
    missingTopItems * 140 +
    notEnough * 120 +
    emptyCalories * 90 +
    missingEvidenceCount * 160
  )
}

function buildNextBestAction(
  topOpportunity: ReturnType<typeof getRemainingOffShelfRecommendations>[number] | undefined,
  fallback: string,
) {
  if (!topOpportunity?.product) {
    return fallback
  }

  return `Expand ${topOpportunity.location} placement for ${topOpportunity.product.name}.`
}

function buildShareText({
  agentforceEnabled,
  totalScore,
  executionScore,
  basePlanScore,
  incrementalScore,
  lgorPct,
  riskValue,
  mapMisses,
  missingTopItems,
  notEnough,
  emptyCalories,
  scoreDelta,
  lgorDelta,
  riskDelta,
  comparisonRepeatedGap,
  notes,
  revisitRequired,
  shelfResetNeeded,
  summaryInsight,
  nextBestAction,
}: {
  agentforceEnabled: boolean
  totalScore: number
  executionScore: number
  basePlanScore: number
  incrementalScore: number
  lgorPct: number
  riskValue: number
  mapMisses: number
  missingTopItems: number
  notEnough: number
  emptyCalories: number
  scoreDelta: number
  lgorDelta: number
  riskDelta: number
  comparisonRepeatedGap: string
  notes: string
  revisitRequired: boolean
  shelfResetNeeded: boolean
  summaryInsight: ReturnType<typeof getSummaryInsight>
  nextBestAction: string
}) {
  const lines = [
    `Store Scorecard Snapshot - ${store.name}`,
    '',
    `Total Score: ${totalScore.toFixed(1)}`,
    `Execution: ${executionScore}%`,
    `Base Plan: ${basePlanScore.toFixed(1)}`,
    `Above & Beyond: +${incrementalScore.toFixed(1)}`,
    `LGOR %: ${lgorPct.toFixed(1)}%`,
    `Risk $: ${formatCurrency(riskValue)}`,
    '',
    `Missing MAP: ${mapMisses}`,
    `Missing Top Items: ${missingTopItems}`,
    `Not Enough: ${notEnough}`,
    `Empty Calories: ${emptyCalories}`,
    '',
    `Score Trend: ${scoreDelta >= 0 ? '+' : ''}${scoreDelta.toFixed(1)} pts`,
    `LGOR Trend: ${lgorDelta >= 0 ? '+' : ''}${lgorDelta.toFixed(1)}%`,
    `Risk Trend: ${formatCurrencyDelta(riskDelta)}`,
    `Repeated Gap: ${comparisonRepeatedGap}`,
  ]

  if (agentforceEnabled) {
    lines.push('', `Agentforce Summary: ${summaryInsight.narrative}`, `Next Best Action: ${nextBestAction}`)
  }

  if (notes.trim()) {
    lines.push('', `Field Note: ${notes.trim()}`)
  }

  lines.push(
    '',
    `Follow-up Required: ${revisitRequired ? 'On' : 'Off'}`,
    `Shelf Reset Needed: ${shelfResetNeeded ? 'On' : 'Off'}`
  )

  return lines.join('\n')
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCurrencyDelta(value: number) {
  const formatted = formatCurrency(Math.abs(value))
  if (value > 0) return `+${formatted}`
  if (value < 0) return `-${formatted}`
  return formatted
}
