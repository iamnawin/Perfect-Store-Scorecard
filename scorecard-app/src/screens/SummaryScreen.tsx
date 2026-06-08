import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import {
  ClipboardCheck,
  Flag,
  Send,
  Share2,
  Bug,
} from 'lucide-react'
import { BottomActionBar } from '../components/BottomActionBar'
import { PhoneShell } from '../components/PhoneShell'
import { RevisitBanner } from '../components/RevisitBanner'
import { StandardGuidanceCard } from '../components/StandardGuidanceCard'
import { TopBar } from '../components/TopBar'
import { TrellisAskButton, TrellisSummaryCard } from '../components/TrellisBot'
import { CalculationTraceView } from '../components/CalculationTrace'
import { useApp } from '../context/useApp'
import { checklistQuestions, previousSnapshot, regionBenchmark, store } from '../data/mock'
import {
  getBasePlanLgorPoints,
  getCurrentSectionNumber,
  getCurrentRiskValue,
  getOffShelfIncrementalScore,
  getOffShelfEntryUnits,
  getIncrementalRawLgorPct,
  getRemainingOffShelfRecommendations,
  getVisitTypeLabel,
  getScoreExplanations,
} from '../lib/scorecard'
import {
  answerTrellisChat,
  getIncrementalOutputRows,
  getLeaderboardPreview,
  getManagerSummaryDraft,
  getOpportunityTable,
  getRegionalOutcomeSummary,
  getRevisitIntelligence,
  getRiskTable,
  getSummaryInsight,
  getTopRecommendation,
} from '../lib/trellis'
import type { RevisitChangeType, ScorecardVersionRecord } from '../types'

export function SummaryScreen() {
  const navigate = useNavigate()
  const app = useApp()
  const [trellisOpen, setTrellisOpen] = useState(false)
  const [showCalculationDetails, setShowCalculationDetails] = useState(false)
  const {
    visitType,
    checklist,
    offShelf,
    notes,
    setNotes,
    revisitReason,
    setRevisitReason,
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
    scorecardVersion,
    sourceScorecard,
    versionHistory,
    revisitComparison,
  } = app

  const scoreExplanations = getScoreExplanations(app)
  const basePlanLgorPoints = getBasePlanLgorPoints(checklist)
  const incrementalScore = getOffShelfIncrementalScore(offShelf)
  const incrementalRawLgorPct = getIncrementalRawLgorPct(offShelf)
  const sectionNumber = getCurrentSectionNumber(app)
  const visitTypeLabel = getVisitTypeLabel(visitType)
  const noChangeCount = offShelf.filter(entry => entry.origin === 'previous-visit' && entry.status === 'saved').length
  const updatedCount = offShelf.filter(entry => entry.status === 'updated').length
  const removedCount = offShelf.filter(entry => entry.status === 'removed').length
  const addedCount = offShelf.filter(entry => entry.status === 'added').length
  const scoreDelta = +(totalScore - previousSnapshot.score).toFixed(1)
  const mapMisses = checklistQuestions.filter(question => question.group === 'map' && checklist[question.id] !== 'yes').length
  const missingTopItems = checklistQuestions.filter(question => question.group === 'pog' && checklist[question.id] !== 'yes').length
  const displayMisses = checklistQuestions.filter(question => question.group === 'display' && checklist[question.id] === 'no').length
  const lightDisplays = offShelf.filter(entry => getOffShelfEntryUnits(entry) < 80).length
  const notEnough = displayMisses + lightDisplays
  const emptyCalories = offShelf.filter(entry => entry.classification !== 'incremental').length
  const riskValue = getCurrentRiskValue(app)
  const previousLgorPct = +(Math.max(0, lgorPct - 1.3)).toFixed(1)
  const previousRiskValue = Math.max(0, riskValue + (scoreDelta >= 0 ? 420 : -260))
  const lgorDelta = +(lgorPct - previousLgorPct).toFixed(1)
  const riskDelta = riskValue - previousRiskValue
  const comparisonRepeatedGap = mapMisses > 0
    ? `${mapMisses} MAP location${mapMisses > 1 ? 's' : ''} still unresolved`
    : previousSnapshot.gap
  const remainingRecommendations = getRemainingOffShelfRecommendations(offShelf)
  const summaryInsight = getSummaryInsight(app)
  const regionalOutcome = getRegionalOutcomeSummary(app)
  const incrementalOutputRows = getIncrementalOutputRows(app)
  const opportunityRows = getOpportunityTable(app)
  const riskRows = getRiskTable(app)
  const leaderboardPreview = getLeaderboardPreview(totalScore)
  const topRecommendation = getTopRecommendation(app)
  const revisitIntelligence = visitType === 'follow-up' ? getRevisitIntelligence(app) : null
  const managerSummaryDraft = getManagerSummaryDraft(app)
  const showBusinessOutputBlocks = visitType === 'follow-up'
  const helperText = lastSavedAt
      ? `Draft saved at ${lastSavedAt}`
      : 'Review the visit summary and submit when ready.'
  const primarySubmitLabel = visitType === 'follow-up' ? 'Submit Revisit' : 'Submit Visit'

  function handlePrimaryAction() {
    if (submitted) {
      navigate('/')
      return
    }

    if (visitType === 'follow-up') {
      const confirmed = window.confirm(
        'Submit this revisit as a new linked scorecard version? The original submitted scorecard will not be changed.'
      )
      if (!confirmed) return
    }

    submitScorecard()
  }

  return (
    <PhoneShell>
      <div data-scroll-to-top="true" className="flex-1 overflow-y-auto bg-[#f4f6f9]">
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
                : 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]'
            }`}>
              {submitted ? 'Submitted' : 'Ready to Submit'}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#dde3ea] overflow-hidden mt-3">
            <div className="h-full bg-primary rounded-full" style={{ width: `${completionPercent}%` }} />
          </div>
        </div>

        <div className="px-4 py-3 space-y-3">
          <RevisitBanner sourceScorecard={sourceScorecard} activeScorecard={scorecardVersion} />

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
                <p className="text-[14px] font-semibold mt-1">{submitted ? 'Closed' : 'Ready'}</p>
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-outline bg-surface-lowest px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">How this scores</p>
              <p className="mt-1 text-[12px] text-on-surface-variant">
                Final Score = Execution Score + Base Plan LGOR Points + Incremental Off-Shelf Points. Display location is tracked for reporting; peak-week quantity depth drives the incremental multiplier.
              </p>
            </div>
          </div>

          <InfoBlock title="Calculation Traceability" subtitle="Detailed breakdown of how every score component was derived.">
            <div className="space-y-3">
              <CalculationTraceView title="Execution Score Trace" traces={scoreExplanations.execution} />
              <CalculationTraceView title="Base Plan Score Trace" traces={scoreExplanations.basePlan} />
              <CalculationTraceView title="Incremental Score Trace" traces={scoreExplanations.incremental} />
              <CalculationTraceView title="Final Score Trace" traces={scoreExplanations.total} defaultExpanded />
            </div>
          </InfoBlock>

          {agentforceEnabled && (
            <>
              <TrellisSummaryCard
                title="Execution Summary"
                summary={summaryInsight.narrative}
                highlights={[
                  { label: 'Main positive driver', value: summaryInsight.mainPositiveDriver, tone: 'success' },
                  { label: 'Top missed opportunity', value: summaryInsight.biggestMissedOpportunity, tone: 'warning' },
                  { label: 'Next best action', value: buildNextBestAction(remainingRecommendations[0], summaryInsight.nextVisitFocus) },
                ]}
                footer="Agentforce adds mock interpretation and next-step guidance on top of the same core scorecard summary."
              />
              <TrellisSummaryCard
                title={managerSummaryDraft.title}
                summary={managerSummaryDraft.narrative}
                highlights={managerSummaryDraft.highlights}
                footer={managerSummaryDraft.summary}
              />
              <TrellisSummaryCard
                title="Top Recommendation"
                summary={topRecommendation.summary}
                highlights={[
                  { label: 'Impact', value: topRecommendation.impactLabel, tone: topRecommendation.tone },
                  { label: 'Why this matters', value: topRecommendation.reason, tone: topRecommendation.tone },
                ]}
                footer="Agentforce keeps one clear next move in front of the rep and manager."
                actions={[{
                  label: topRecommendation.actionLabel,
                  onClick: () => navigate(topRecommendation.route),
                  intent: 'primary',
                }]}
              />
            </>
          )}
          {!agentforceEnabled && (
            <StandardGuidanceCard
              title="Visit Outcome & Next Actions"
              summary={visitType === 'follow-up'
                ? 'This summary stays focused on edits, removals, additions, and unchanged prefilled values without the AI interpretation layer.'
                : 'Review completed actions, missed items, and required follow-ups.'}
              detail={`Suggested action: ${buildNextBestAction(remainingRecommendations[0], summaryInsight.nextVisitFocus)}`}
            />
          )}

          {visitType === 'follow-up' && (
            <InfoBlock title="Execution Summary" subtitle="Track exactly what changed since the previous completed scorecard.">
              <div className="grid grid-cols-2 gap-2">
                <MetricTile label="No Change" value={`${noChangeCount}`} />
                <MetricTile label="Updated" value={`${updatedCount}`} tone="success" />
                <MetricTile label="Removed" value={`${removedCount}`} tone={removedCount > 0 ? 'warning' : 'neutral'} />
                <MetricTile label="Added" value={`${addedCount}`} tone="success" />
                <MetricTile label="Net Score Impact" value={`${scoreDelta >= 0 ? '+' : ''}${scoreDelta.toFixed(1)} pts`} tone={scoreDelta >= 0 ? 'success' : 'warning'} />
              </div>
              <div className="mt-3 rounded-lg border border-outline bg-[#f7f9fb] px-3 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Previous summary</p>
                <p className="mt-1 text-[13px] font-semibold text-on-surface">{previousSnapshot.opportunity}</p>
                <p className="mt-2 text-[12px] text-on-surface-variant">Last submitted {previousSnapshot.date} by {previousSnapshot.submittedBy}</p>
              </div>
            </InfoBlock>
          )}
          {visitType === 'follow-up' && !submitted && (
            <InfoBlock title="Revisit Notes" subtitle="Capture why this linked version is being submitted.">
              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Reason</p>
                  <input
                    value={revisitReason}
                    onChange={event => setRevisitReason(event.target.value)}
                    className="min-h-10 w-full rounded-lg border border-outline bg-surface-lowest px-3 text-[13px] text-on-surface outline-none"
                    placeholder="Same quarter / same season check-in"
                  />
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Notes before submit</p>
                  <textarea
                    value={notes}
                    onChange={event => setNotes(event.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-outline bg-surface-lowest px-3 py-2.5 text-[13px] text-on-surface outline-none resize-none"
                    placeholder="Summarize what changed during this revisit."
                  />
                </div>
              </div>
            </InfoBlock>
          )}
          {visitType === 'follow-up' && submitted && revisitComparison && (
            <InfoBlock title="Revisit Comparison" subtitle="Mobile-first previous/current/change cards for the submitted linked version.">
              <div className="grid grid-cols-2 gap-2">
                <MetricTile label="Previous Score" value={revisitComparison.previousCombinedScore.toFixed(1)} />
                <MetricTile label="Current Score" value={revisitComparison.currentCombinedScore.toFixed(1)} />
                <MetricTile label="Score Delta" value={`${revisitComparison.scoreDelta >= 0 ? '+' : ''}${revisitComparison.scoreDelta.toFixed(1)}`} tone={revisitComparison.scoreDelta >= 0 ? 'success' : 'warning'} />
                <MetricTile label="Execution Delta" value={`${revisitComparison.executionScoreDelta >= 0 ? '+' : ''}${revisitComparison.executionScoreDelta.toFixed(1)}`} tone={revisitComparison.executionScoreDelta >= 0 ? 'success' : 'warning'} />
                <MetricTile label="Base Plan Delta" value={`${revisitComparison.basePlanScoreDelta >= 0 ? '+' : ''}${revisitComparison.basePlanScoreDelta.toFixed(1)}`} tone={revisitComparison.basePlanScoreDelta >= 0 ? 'success' : 'warning'} />
                <MetricTile label="Incremental Delta" value={`${revisitComparison.incrementalScoreDelta >= 0 ? '+' : ''}${revisitComparison.incrementalScoreDelta.toFixed(1)}`} tone={revisitComparison.incrementalScoreDelta >= 0 ? 'success' : 'warning'} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MetricTile label="Improved" value={String(revisitComparison.improvedItems.length)} tone="success" />
                <MetricTile label="Declined" value={String(revisitComparison.declinedItems.length)} tone={revisitComparison.declinedItems.length > 0 ? 'warning' : 'neutral'} />
                <MetricTile label="No Change" value={String(revisitComparison.noChangeItems.length)} />
                <MetricTile label="New / Removed" value={`${revisitComparison.newItems.length} / ${revisitComparison.removedItems.length}`} tone={revisitComparison.newItems.length > 0 ? 'success' : revisitComparison.removedItems.length > 0 ? 'warning' : 'neutral'} />
              </div>
              <div className="mt-3 space-y-2">
                {revisitComparison.cards.map(card => (
                  <ComparisonCard
                    key={card.id}
                    label={card.label}
                    previous={card.previous}
                    current={card.current}
                    change={card.change}
                  />
                ))}
              </div>
              {(revisitComparison.notes || revisitComparison.submittedAt) && (
                <div className="mt-3 rounded-lg border border-outline bg-[#f7f9fb] px-3 py-3">
                  {revisitComparison.notes && (
                    <>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Revisit Notes</p>
                      <p className="mt-1 text-[12px] text-on-surface">{revisitComparison.notes}</p>
                    </>
                  )}
                  {revisitComparison.submittedAt && (
                    <p className="mt-2 text-[11px] text-on-surface-variant">Submitted {formatDateTime(revisitComparison.submittedAt)}</p>
                  )}
                </div>
              )}
            </InfoBlock>
          )}
          {visitType === 'follow-up' && (
            <InfoBlock title="Version History" subtitle="Linked scorecard snapshots remain separate for trend tracking.">
              <div className="space-y-2">
                {versionHistory.map(version => (
                  <VersionHistoryRow key={version.id} version={version} />
                ))}
              </div>
            </InfoBlock>
          )}
          {visitType === 'follow-up' && agentforceEnabled && revisitIntelligence && (
            <TrellisSummaryCard
              title="Revisit Intelligence"
              summary={revisitIntelligence.summary}
              highlights={revisitIntelligence.items}
              tone={revisitIntelligence.tone}
              footer={revisitIntelligence.footer}
            />
          )}

          {visitType === 'initial' && (
          <InfoBlock title="Score Breakdown" subtitle="Lightning-style summary of this visit outcome.">
            <div className="grid grid-cols-2 gap-2">
              <MetricTile label="Execution" value={`${executionScore}%`} />
              <MetricTile label="Base LGOR Points" value={basePlanLgorPoints.toFixed(1)} />
              <MetricTile label="Incremental Points" value={`+${incrementalScore.toFixed(1)}`} tone="success" />
              <MetricTile label="LGOR Rep %" value={`${lgorPct.toFixed(1)}%`} />
              <MetricTile label="Raw Inc LGOR" value={`${incrementalRawLgorPct.toFixed(1)}%`} />
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

          {showBusinessOutputBlocks && (
            <>
          <InfoBlock title={`${store.name} vs ${regionBenchmark.name}`} subtitle="What this visit produces beyond capture: rank context, risk context, and region comparison.">
            <div className="grid grid-cols-2 gap-2">
              <MetricTile label="Score Rank" value={regionalOutcome.scoreRankLabel} tone={regionalOutcome.scoreGap >= 0 ? 'success' : 'warning'} />
              <MetricTile label="LGOR Rank" value={regionalOutcome.lgorRankLabel} tone={regionalOutcome.lgorGap >= 0 ? 'success' : 'warning'} />
              <MetricTile label="Risk Rank" value={regionalOutcome.riskRankLabel} tone={regionalOutcome.currentRiskValue <= regionBenchmark.currentRiskValue ? 'success' : 'warning'} />
              <MetricTile label="Risk Minimized" value={formatCurrency(regionalOutcome.riskMinimizedValue)} tone={regionalOutcome.riskMinimizedValue > 0 ? 'success' : 'warning'} />
              <MetricTile label="Score vs Region" value={`${regionalOutcome.scoreGap >= 0 ? '+' : ''}${regionalOutcome.scoreGap.toFixed(1)}`} tone={regionalOutcome.scoreGap >= 0 ? 'success' : 'warning'} />
              <MetricTile label="Current Risk" value={formatCurrency(regionalOutcome.currentRiskValue)} tone={regionalOutcome.currentRiskValue <= regionBenchmark.currentRiskValue ? 'success' : 'warning'} />
            </div>
            <div className="mt-3 rounded-lg border border-outline bg-[#f7f9fb] px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Region lens</p>
              <p className="mt-1 text-[13px] font-semibold text-on-surface">
                {store.name} is {regionalOutcome.scoreGap >= 0 ? 'outperforming' : 'trailing'} the region on score and {regionalOutcome.lgorGap >= 0 ? 'holding' : 'giving back'} LGOR Rep coverage.
              </p>
              <p className="mt-2 text-[12px] text-on-surface-variant">
                Region average score {regionalOutcome.regionAverageScore} | Region average LGOR {regionalOutcome.regionAverageLgor.toFixed(1)}%
              </p>
            </div>
          </InfoBlock>

          <InfoBlock title="Incremental, Opportunity & Risk" subtitle="The deck’s business-output layer translated into a mobile review surface.">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Incremental</p>
                <div className="mt-2 space-y-2">
                  {incrementalOutputRows.map(row => (
                    <SignalRow key={`${row.label}-${row.value}`} title={row.label} detail={row.detail} value={row.value} tone={row.tone} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Opportunity</p>
                <div className="mt-2 space-y-2">
                  {opportunityRows.map(row => (
                    <SignalRow key={`${row.label}-${row.value}`} title={row.label} detail={row.detail} value={row.value} tone={row.tone} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Risk</p>
                <div className="mt-2 space-y-2">
                  {riskRows.map(row => (
                    <SignalRow key={`${row.label}-${row.value}`} title={row.label} detail={row.detail} value={row.value} tone={row.tone} />
                  ))}
                </div>
              </div>
            </div>
          </InfoBlock>

          <InfoBlock title="Leaderboard Preview" subtitle="Show who is leading and where this store ranks.">
            <div className="space-y-2">
              {leaderboardPreview.map(entry => (
                <LeaderboardRow
                  key={entry.store}
                  rank={entry.rank}
                  storeName={entry.store}
                  owner={entry.rep}
                  score={entry.score}
                  delta={entry.delta}
                  highlighted={entry.store === store.name}
                />
              ))}
            </div>
          </InfoBlock>

          <InfoBlock title="Compared to Last Completed Scorecard" subtitle="Historical business comparison without implying backend delivery.">
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
            </>
          )}

          {(notes || revisitRequired || shelfResetNeeded) && (
            <InfoBlock title="Visit Outcome & Next Actions" subtitle="Field notes and tracked next-step flags captured during this visit.">
              <div className="space-y-2">
                {notes && <ListRow icon={<ClipboardCheck size={13} className="text-primary" />} text={`Field note: ${notes}`} />}
                {revisitRequired && <ListRow icon={<Flag size={13} className="text-[#8b5d00]" />} text="Revisit Required is flagged for this store." />}
                {shelfResetNeeded && <ListRow icon={<Flag size={13} className="text-[#8b5d00]" />} text="Shelf Reset Needed is flagged before the next visit." />}
              </div>
            </InfoBlock>
          )}

          {submitted && (
            <InfoBlock title="Scorecard Submitted Successfully" subtitle={`${store.name} | ${scorecardVersion.quarter} FY${scorecardVersion.fiscalYear}`}>
              <div className="rounded-lg border border-[#cde8d3] bg-[#edf7ee] px-4 py-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#1f5f33] shadow-sm">
                    <ClipboardCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#1f5f33]">Final Score: {totalScore.toFixed(1)}</p>
                    <p className="text-[12px] text-[#25523b]">Submitted at {formatDateTime(scorecardVersion.submittedAt || new Date().toISOString())}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => app.postScorecardToChatter()}
                  disabled={app.chatterPostStatus === 'Posting' || app.chatterPostStatus === 'Posted'}
                  className={clsx(
                    'flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg px-6 text-[14px] font-bold transition-all shadow-sm',
                    app.chatterPostStatus === 'Posted'
                      ? 'bg-[#edf7ee] text-[#1f5f33] border border-[#cde8d3]'
                      : 'bg-[#0176d3] text-white hover:bg-[#014486] active:scale-[0.98]'
                  )}
                >
                  <Share2 size={18} />
                  {app.chatterPostStatus === 'Posting' ? 'Posting...' : 
                   app.chatterPostStatus === 'Posted' ? 'Posted to Chatter' : 
                   'Post to Chatter'}
                </button>
              </div>
            </InfoBlock>
          )}

          {!submitted && (
            <InfoBlock title="Submit Readiness" subtitle="Photos are optional documentation for MVP and do not block submit.">
              <div className="rounded-lg border border-[#cde8d3] bg-[#edf7ee] px-3 py-3">
                <p className="text-[12px] font-semibold text-[#1f5f33]">Ready for final submission.</p>
                <p className="mt-1 text-[12px] text-[#1f5f33]">Review scores, notes, and recommendations, then submit.</p>
              </div>
            </InfoBlock>
          )}

          <div className="pt-2">
            <button
              onClick={() => setShowCalculationDetails(!showCalculationDetails)}
              className="flex items-center gap-2 text-[11px] font-bold text-[#4b5563] hover:text-primary transition-colors"
            >
              <Bug size={14} />
              {showCalculationDetails ? 'Hide' : 'Show'} Calculation Details (QA/Dev)
            </button>
            
            {showCalculationDetails && (
              <div className="mt-3 space-y-3">
                <CalculationTraceView title="Execution Score Logic" traces={scoreExplanations.execution} />
                <CalculationTraceView title="Base Plan Score Logic" traces={scoreExplanations.basePlan} />
                <CalculationTraceView title="Incremental Score Logic" traces={scoreExplanations.incremental} />
                <CalculationTraceView title="Final Score Logic" traces={scoreExplanations.total} defaultExpanded />
              </div>
            )}
          </div>

          {agentforceEnabled && (
            <TrellisAskButton
              active={trellisOpen}
              onClick={() => setTrellisOpen(prev => !prev)}
              mode="chat"
              title="Visit summary"
              summary={summaryInsight.narrative}
              items={[
                `Main driver: ${summaryInsight.mainPositiveDriver}`,
                `Top missed opportunity: ${summaryInsight.biggestMissedOpportunity}`,
                `Next best action: ${buildNextBestAction(remainingRecommendations[0], summaryInsight.nextVisitFocus)}`,
              ]}
              suggestions={[
                'What should I do next?',
                'Explain my score breakdown.',
                'Give me a talk track for my manager.',
                'Why is this the next best action?',
                'Summarize this for my manager.',
              ]}
              onAsk={(message) => answerTrellisChat({ state: app, screen: 'summary', message })}
            />
          )}
        </div>
      </div>

      <BottomActionBar
        secondaryLabel={submitted ? undefined : 'Save Draft'}
        onSecondary={submitted ? undefined : saveDraft}
        primaryLabel={submitted ? 'Done' : primarySubmitLabel}
        onPrimary={handlePrimaryAction}
        primaryIcon={submitted ? undefined : <Send size={15} />}
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

function ComparisonCard({
  label,
  previous,
  current,
  change,
}: {
  label: string
  previous: string
  current: string
  change: RevisitChangeType
}) {
  return (
    <div className="rounded-lg border border-outline bg-[#f7f9fb] px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-semibold text-on-surface">{label}</p>
        <span className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${changeTone(change)}`}>
          {change}
        </span>
      </div>
      <div className="mt-3 space-y-1.5">
        <ComparisonLine label="Previous" value={previous} />
        <ComparisonLine label="Current" value={current} />
        <ComparisonLine label="Change" value={change} />
      </div>
    </div>
  )
}

function ComparisonLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12px]">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-semibold text-on-surface">{value}</span>
    </div>
  )
}

function VersionHistoryRow({ version }: { version: ScorecardVersionRecord }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-outline bg-[#f7f9fb] px-3 py-3">
      <div>
        <p className="text-[12px] font-semibold text-on-surface">
          V{version.versionNumber} - {version.isRevisit ? 'Revisit' : 'Initial Visit'}
        </p>
        <p className="mt-1 text-[11px] text-on-surface-variant">
          {version.submittedAt ? `Submitted ${formatDateTime(version.submittedAt)}` : `Draft created ${formatDateTime(version.createdAt)}`}
        </p>
        {version.sourceScorecardId && (
          <p className="mt-1 text-[11px] text-on-surface-variant">Linked to {version.sourceScorecardId}</p>
        )}
      </div>
      <span className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        version.scorecardStatus.includes('Submitted')
          ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]'
          : 'border-[#c9d8ea] bg-[#edf4ff] text-primary'
      }`}>
        {version.scorecardStatus}
      </span>
    </div>
  )
}

function changeTone(change: RevisitChangeType) {
  if (change === 'Improved' || change === 'New') return 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]'
  if (change === 'Declined' || change === 'Removed') return 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]'
  return 'border-[#dde3ea] bg-white text-[#52606d]'
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
      <span className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
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

function SignalRow({
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
      <span className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        tone === 'success'
          ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]'
          : 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]'
      }`}>
        {value}
      </span>
    </div>
  )
}

function LeaderboardRow({
  rank,
  storeName,
  owner,
  score,
  delta,
  highlighted,
}: {
  rank: number
  storeName: string
  owner: string
  score: number
  delta: number
  highlighted?: boolean
}) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-3 ${
      highlighted
        ? 'border-[#c9d8ea] bg-[#edf4ff]'
        : 'border-outline bg-[#f7f9fb]'
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-low text-[11px] font-semibold text-on-surface">
          {rank}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold text-on-surface">{storeName}</p>
          <p className="truncate text-[11px] text-on-surface-variant">{owner}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[13px] font-semibold text-on-surface">{score}</p>
        <p className={`text-[11px] ${delta >= 0 ? 'text-[#1f5f33]' : 'text-[#8e030f]'}`}>
          {delta >= 0 ? '+' : ''}{delta}
        </p>
      </div>
    </div>
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}
