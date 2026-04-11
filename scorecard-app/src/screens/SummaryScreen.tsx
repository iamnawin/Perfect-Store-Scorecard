import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, ClipboardCheck, Flag, RotateCcw, Send, TrendingDown, TrendingUp } from 'lucide-react'
import { BottomActionBar } from '../components/BottomActionBar'
import { PhoneShell } from '../components/PhoneShell'
import { TopBar } from '../components/TopBar'
import { TrellisBot } from '../components/TrellisBot'
import { useApp } from '../context/useApp'
import { checklistQuestions, previousSnapshot, scorecardSections, store, trellisContent } from '../data/mock'
import { getMissingRequiredEvidence } from '../lib/scorecard'

export function SummaryScreen() {
  const navigate = useNavigate()
  const {
    checklist,
    offShelf,
    offShelfConfirmed,
    evidence,
    notes,
    revisitRequired,
    shelfResetNeeded,
    trellisEnabled,
    executionScore,
    totalScore,
    lgorPct,
    riskDelta,
    answeredChecks,
    totalChecks,
    completionPercent,
    totalSections,
    lastSavedAt,
    saveDraft,
    submitScorecard,
    submitted,
  } = useApp()

  const scoreDelta = totalScore - previousSnapshot.score
  const lgorDelta = +(lgorPct - 6.8).toFixed(1)
  const yesItems = checklistQuestions.filter(question => checklist[question.id] === 'yes')
  const noItems = checklistQuestions.filter(question => checklist[question.id] === 'no')
  const unanswered = checklistQuestions.filter(question => !checklist[question.id])
  const missingEvidence = getMissingRequiredEvidence(evidence)
  const blockers = [
    ...missingEvidence.map(item => `${item.title} evidence is still missing.`),
    ...unanswered.map(question => `${question.title} has not been answered.`),
    ...(!offShelfConfirmed && offShelf.length === 0 ? ['Off-Shelf Capture has not been reviewed.'] : []),
  ]
  const sectionNumber = scorecardSections.findIndex(section => section.id === 'review-submit') + 1
  const helperText = blockers.length > 0
    ? 'Resolve blockers before submitting from the visit.'
    : lastSavedAt
      ? `Draft saved at ${lastSavedAt}`
      : 'Review score impact and submit from the active visit when ready.'

  if (submitted) {
    return (
      <PhoneShell>
        <TopBar title={store.name} subtitle={`${store.visitStatus} Visit | ${store.scorecard}`} showBack />

        <div className="flex-1 overflow-y-auto bg-[#f4f6f9] px-4 py-4 space-y-3">
          <div className="border border-[#cde8d3] bg-surface-lowest rounded-lg px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-md border border-[#cde8d3] bg-[#edf7ee] text-[#2e844a] flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[16px] font-semibold text-on-surface">Scorecard submitted</p>
                <p className="text-[12px] text-on-surface-variant mt-1">The active visit now contains the final score, evidence set, and follow-up flags.</p>
              </div>
            </div>
          </div>

          <div className="border border-outline bg-surface-lowest rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-outline">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Submission Report</p>
            </div>
            <div className="px-4 py-4 grid grid-cols-2 gap-3">
              <ReportMetric label="Final Score" value={String(totalScore)} />
              <ReportMetric label="Execution" value={`${executionScore}%`} />
              <ReportMetric label="LGOR" value={`${lgorPct.toFixed(1)}%`} />
              <ReportMetric label="Risk Delta" value={`${riskDelta}%`} />
            </div>
          </div>
        </div>

        <BottomActionBar
          primaryLabel="Return to Entry"
          onPrimary={() => navigate('/')}
          helperText="Submitted scorecards should be reviewed with the manager summary before the visit closes."
        />
      </PhoneShell>
    )
  }

  return (
    <PhoneShell>
      <TopBar title={store.name} subtitle={`${store.visitStatus} Visit | ${store.scorecard}`} showBack showTrellisToggle />

      <div className="flex-1 overflow-y-auto bg-[#f4f6f9]">
        <div className="sticky top-0 z-10 border-b border-outline bg-surface-lowest px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Current Section</p>
              <p className="text-[15px] font-semibold text-on-surface mt-1">Score Summary</p>
              <p className="text-[12px] text-on-surface-variant mt-1">Section {sectionNumber} of {totalSections} | {completionPercent}% overall complete</p>
            </div>
            <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${blockers.length === 0 ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]' : 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]'}`}>
              {blockers.length === 0 ? 'Ready to Submit' : `${blockers.length} Blockers`}
            </span>
          </div>
        </div>

        <div className="px-4 py-3 space-y-3">
          {trellisEnabled && (
            <TrellisBot
              title={trellisContent.summary.title}
              insight={trellisContent.summary.insight}
              prompts={trellisContent.summary.prompts}
            />
          )}

          <div className="border border-outline bg-surface-lowest rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-outline">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Operational Score</p>
                  <p className="text-[28px] font-semibold text-on-surface mt-1">{totalScore}</p>
                  <p className="text-[12px] text-on-surface-variant mt-1">vs. {previousSnapshot.date}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[13px] font-semibold ${scoreDelta >= 0 ? 'text-[#1f5f33]' : 'text-[#8e030f]'}`}>
                    {scoreDelta >= 0 ? '+' : ''}{scoreDelta} pts
                  </p>
                  <p className={`text-[12px] font-medium mt-1 ${lgorDelta >= 0 ? 'text-[#1f5f33]' : 'text-[#8e030f]'}`}>
                    {lgorDelta >= 0 ? '+' : ''}{lgorDelta}% LGOR
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 px-4 py-4">
              <ReportMetric label="Drive Standards" value={`${executionScore}%`} />
              <ReportMetric label="Best Practices" value={`${offShelf.length}`} />
              <ReportMetric label="Accountability" value={blockers.length === 0 ? 'Ready' : 'Blocked'} />
            </div>
          </div>

          <div className="border border-outline bg-surface-lowest rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-outline">
              <p className="text-[12px] font-semibold text-on-surface">Score breakdown</p>
            </div>
            <div className="divide-y divide-outline">
              <BreakdownRow
                title="Base plan compliance"
                value={`${yesItems.filter(item => item.sectionId === 'base-plan').length} of 4 checks passed`}
                direction={yesItems.filter(item => item.sectionId === 'base-plan').length >= 3 ? 'up' : 'down'}
              />
              <BreakdownRow
                title="Secondary displays"
                value={`${yesItems.filter(item => item.sectionId === 'secondary-displays').length} of 4 checks passed`}
                direction={yesItems.filter(item => item.sectionId === 'secondary-displays').length >= 2 ? 'up' : 'down'}
              />
              <BreakdownRow
                title="Evidence completeness"
                value={missingEvidence.length === 0 ? 'All required evidence captured' : `${missingEvidence.length} required photos missing`}
                direction={missingEvidence.length === 0 ? 'up' : 'down'}
              />
              <BreakdownRow
                title="Risk delta"
                value={`${riskDelta}% vs. prior period`}
                direction={riskDelta < 0 ? 'up' : 'down'}
              />
            </div>
          </div>

          <div className="border border-outline bg-surface-lowest rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-outline">
              <p className="text-[12px] font-semibold text-on-surface">Key gaps and blockers</p>
            </div>
            <div className="px-4 py-3 space-y-2">
              {noItems.map(item => (
                <ListRow key={item.id} icon={<AlertTriangle size={13} className="text-[#ba0517]" />} text={`${item.title} failed and is reducing score impact.`} />
              ))}
              {blockers.map(blocker => (
                <ListRow key={blocker} icon={<Flag size={13} className="text-[#ba0517]" />} text={blocker} />
              ))}
              {blockers.length === 0 && (
                <ListRow icon={<CheckCircle2 size={13} className="text-[#2e844a]" />} text="No submission blockers remain. This visit is ready for manager review." />
              )}
            </div>
          </div>

          <div className="border border-outline bg-surface-lowest rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-outline">
              <p className="text-[12px] font-semibold text-on-surface">Recommendations and next actions</p>
            </div>
            <div className="px-4 py-3 space-y-2">
              <ListRow icon={<ClipboardCheck size={13} className="text-primary" />} text="Drive standards by closing repeated Garden Doors and endcap misses before the next reset." />
              <ListRow icon={<TrendingUp size={13} className="text-[#2e844a]" />} text="Drive best practices by sustaining high-volume off-shelf placements where store conditions support them." />
              <ListRow icon={<TrendingDown size={13} className="text-[#8b5d00]" />} text="Drive accountability by attaching evidence and calling out repeated gaps in the manager summary." />
              {notes && <ListRow icon={<RotateCcw size={13} className="text-[#8b5d00]" />} text={`Field note: ${notes}`} />}
              {revisitRequired && <ListRow icon={<RotateCcw size={13} className="text-[#8b5d00]" />} text="Revisit Required has been flagged for this store." />}
              {shelfResetNeeded && <ListRow icon={<Flag size={13} className="text-[#8b5d00]" />} text="Shelf Reset Needed has been flagged before the next visit." />}
            </div>
          </div>
        </div>
      </div>

      <BottomActionBar
        secondaryLabel="Save Draft"
        onSecondary={saveDraft}
        primaryLabel={blockers.length === 0 ? 'Submit Audit' : 'Submission Blocked'}
        onPrimary={submitScorecard}
        primaryDisabled={blockers.length > 0 || answeredChecks < totalChecks}
        primaryIcon={<Send size={15} />}
        helperText={helperText}
      />
    </PhoneShell>
  )
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-outline bg-[#f7f9fb] px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
      <p className="text-[15px] font-semibold text-on-surface mt-1">{value}</p>
    </div>
  )
}

function BreakdownRow({
  title,
  value,
  direction,
}: {
  title: string
  value: string
  direction: 'up' | 'down'
}) {
  return (
    <div className="px-4 py-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-[13px] font-semibold text-on-surface">{title}</p>
        <p className="text-[12px] text-on-surface-variant mt-1">{value}</p>
      </div>
      <div className={`h-8 w-8 rounded-md border flex items-center justify-center ${direction === 'up' ? 'border-[#cde8d3] bg-[#edf7ee] text-[#2e844a]' : 'border-[#f9d6d0] bg-[#fef1ee] text-[#ba0517]'}`}>
        {direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      </div>
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
