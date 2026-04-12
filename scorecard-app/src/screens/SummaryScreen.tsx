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
  Trophy,
} from 'lucide-react'
import { BottomActionBar } from '../components/BottomActionBar'
import { PhoneShell } from '../components/PhoneShell'
import { TopBar } from '../components/TopBar'
import {
  TrellisAskButton,
  TrellisSummaryCard,
} from '../components/TrellisBot'
import { useApp } from '../context/useApp'
import { previousSnapshot, scorecardSections, store } from '../data/mock'
import {
  getChecklistBasePlanScore,
  getMissingRequiredEvidence,
  getOffShelfIncrementalScore,
  getRemainingOffShelfRecommendations,
} from '../lib/scorecard'
import {
  getLeaderboardPreview,
  getSummaryInsight,
  getSummaryKpis,
  getSummaryOpportunities,
  getSummaryRisks,
} from '../lib/trellis'

export function SummaryScreen() {
  const navigate = useNavigate()
  const app = useApp()
  const {
    checklist,
    offShelf,
    offShelfConfirmed,
    evidence,
    notes,
    revisitRequired,
    shelfResetNeeded,
    trellisEnabled,
    toggleTrellis,
    totalScore,
    lgorPct,
    completionPercent,
    totalSections,
    lastSavedAt,
    saveDraft,
    submitScorecard,
    submitted,
  } = app
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const basePlanScore = getChecklistBasePlanScore(checklist)
  const incrementalScore = getOffShelfIncrementalScore(offShelf)
  const scoreDelta = totalScore - previousSnapshot.score
  const summaryInsight = getSummaryInsight(app)
  const kpis = getSummaryKpis(app)
  const riskItems = getSummaryRisks(app)
  const opportunityItems = getSummaryOpportunities(app)
  const missingEvidence = getMissingRequiredEvidence(evidence, offShelf)
  const unansweredCount = Object.values(checklist).filter(answer => !answer).length
  const sectionNumber = scorecardSections.findIndex(section => section.id === 'review-submit') + 1
  const leaderboard = getLeaderboardPreview(totalScore)
  const remainingOpportunity = getRemainingOffShelfRecommendations(offShelf)[0]
  const blockerCards = [
    ...(missingEvidence.length > 0
      ? [{
          key: 'missing-evidence',
          title: `${missingEvidence.length} required photo${missingEvidence.length > 1 ? 's' : ''} missing`,
          detail: 'Capture required proof before the summary can be sent to a manager.',
          route: '/photo',
          actionLabel: 'Open Photo Evidence',
        }]
      : []),
    ...(unansweredCount > 0
      ? [{
          key: 'unanswered-checks',
          title: `${unansweredCount} checklist question${unansweredCount > 1 ? 's' : ''} still unanswered`,
          detail: 'Finish the checklist so Trellis can explain score movement with confidence.',
          route: '/checklist',
          actionLabel: 'Return to Checklist',
        }]
      : []),
    ...(!offShelfConfirmed && offShelf.length === 0
      ? [{
          key: 'off-shelf-review',
          title: 'Off-Shelf Capture is not reviewed yet',
          detail: 'Save at least one display or confirm there was no incremental opportunity.',
          route: '/off-shelf',
          actionLabel: 'Open Off-Shelf',
        }]
      : []),
  ]
  const helperText = blockerCards.length > 0
    ? `Next required action: ${blockerCards[0]?.actionLabel}`
    : lastSavedAt
      ? `Draft saved at ${lastSavedAt}`
      : 'Review Trellis outputs, then submit the visit when ready.'

  function openEmailSnapshot() {
    const subject = encodeURIComponent(`Trellis Visit Summary - ${store.name}`)
    const body = encodeURIComponent(buildShareText({
      totalScore,
      scoreDelta,
      summaryInsight,
      remainingOpportunity: remainingOpportunity?.product?.name ?? 'Fence Line display',
    }))
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  async function shareToTeamFeed() {
    const shareText = buildShareText({
      totalScore,
      scoreDelta,
      summaryInsight,
      remainingOpportunity: remainingOpportunity?.product?.name ?? 'Fence Line display',
    })

    if (navigator.share) {
      await navigator.share({
        title: 'Trellis Visit Summary',
        text: shareText,
      })
      return
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText)
      window.alert('Visit summary copied. Paste it into Team Feed.')
      return
    }

    window.alert(shareText)
  }

  return (
    <PhoneShell>
      <div className="flex-1 overflow-y-auto bg-[#f4f6f9]">
        <TopBar
          title={submitted ? 'Visit Submitted' : 'Visit Summary'}
          subtitle={`${store.name} | ${store.visitStatus} Visit`}
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">KPI Insight</p>
                <p className="text-[22px] font-semibold text-on-surface mt-1">{totalScore}</p>
                <p className="text-[12px] text-on-surface-variant mt-1">{scoreDelta >= 0 ? '+' : ''}{scoreDelta} pts vs last visit | {lgorPct.toFixed(1)}% LGOR</p>
              </div>
              <div className={`rounded-lg border px-3 py-2 text-right ${
                scoreDelta >= 0 ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]' : 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]'
              }`}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em]">Status</p>
                <p className="text-[14px] font-semibold mt-1">{submitted ? 'Closed' : blockerCards.length === 0 ? 'Ready' : 'Action Needed'}</p>
              </div>
            </div>
            <p className="mt-3 text-[12px] text-[#014486]">
              Trellis is converting this visit into KPI insight, accountability, and next-step actions instead of a raw score dump.
            </p>
          </div>

          {trellisEnabled && (
            <TrellisSummaryCard
              summary={summaryInsight.narrative}
              highlights={[
                { label: 'Main positive driver', value: summaryInsight.mainPositiveDriver, tone: 'success' },
                { label: 'Biggest missed opportunity', value: summaryInsight.biggestMissedOpportunity, tone: 'warning' },
                { label: 'Next visit focus', value: summaryInsight.nextVisitFocus },
              ]}
              footer="Trellis explains why the score changed, what still needs to be fixed, and where the next points will come from."
            />
          )}

          <InfoBlock title="Final Score Block" subtitle="Final score, component scores, and improvement against last visit.">
            <div className="grid grid-cols-2 gap-2">
              <SummaryMetric label="Base Plan Score" value={basePlanScore.toFixed(1)} />
              <SummaryMetric label="Incremental Score" value={`+${incrementalScore.toFixed(1)}`} tone="success" />
              <SummaryMetric label="Final Score" value={totalScore.toFixed(1)} tone={scoreDelta >= 0 ? 'success' : 'warning'} />
              <SummaryMetric label="Improvement vs Last" value={`${scoreDelta >= 0 ? '+' : ''}${scoreDelta} pts`} tone={scoreDelta >= 0 ? 'success' : 'warning'} />
            </div>
          </InfoBlock>

          <InfoBlock title="KPI Block" subtitle="Compact score breakdown aligned to the business view on slide 9.">
            <div className="grid grid-cols-2 gap-2">
              {kpis.map(item => (
                <SummaryMetric key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </InfoBlock>

          <InfoBlock title="What Changed" subtitle="Why the score improved or declined on this visit.">
            <div className="space-y-2">
              <ListRow icon={<ClipboardCheck size={13} className="text-primary" />} text={`Score improvement: ${scoreDelta >= 0 ? '+' : ''}${scoreDelta} pts vs ${previousSnapshot.date}.`} />
              <ListRow icon={<CheckCircle2 size={13} className="text-[#2e844a]" />} text={`Main positive driver: ${summaryInsight.mainPositiveDriver}.`} />
              <ListRow icon={<AlertTriangle size={13} className="text-[#8b5d00]" />} text={`Biggest missed opportunity: ${summaryInsight.biggestMissedOpportunity}.`} />
            </div>
          </InfoBlock>

          <InfoBlock title="Risk / Gap Block" subtitle="Accountability view of repeated gaps and unresolved execution issues.">
            <div className="space-y-2">
              {riskItems.map(item => (
                <RiskRow key={item.label} label={item.label} value={item.value} tone={item.tone ?? 'info'} />
              ))}
            </div>
          </InfoBlock>

          <InfoBlock title="Opportunity Block" subtitle="Where the next points can still come from.">
            <div className="space-y-2">
              {opportunityItems.length > 0 ? opportunityItems.map(item => (
                <OpportunityRow key={item.label} label={item.label} value={item.value} />
              )) : (
                <OpportunityRow label="Opportunity captured" value="No major Trellis opportunities remain after this visit." />
              )}
            </div>
          </InfoBlock>

          <InfoBlock title="Output Actions" subtitle="Manager handoff, team visibility, and leaderboard context from the visit summary.">
            <div className="grid grid-cols-1 gap-2">
              <ActionButton label="Send Summary to Manager" icon={<Mail size={14} />} onClick={openEmailSnapshot} />
              <ActionButton label="Share to Team Feed" icon={<Share2 size={14} />} tone="secondary" onClick={() => { void shareToTeamFeed() }} />
              <ActionButton
                label="View Leaderboard"
                icon={<Trophy size={14} />}
                tone="secondary"
                onClick={() => setShowLeaderboard(prev => !prev)}
              />
            </div>
          </InfoBlock>

          {showLeaderboard && (
            <InfoBlock title="Leaderboard" subtitle="Mock district ranking with this visit injected into the current board.">
              <div className="space-y-2">
                {leaderboard.map(item => (
                  <div key={`${item.rank}-${item.store}`} className="rounded-lg border border-outline bg-[#f7f9fb] px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Rank {item.rank}</p>
                        <p className="text-[13px] font-semibold text-on-surface mt-1">{item.store}</p>
                        <p className="text-[11px] text-on-surface-variant mt-1">{item.rep}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[15px] font-semibold text-on-surface">{item.score}</p>
                        <p className={`text-[11px] font-semibold mt-1 ${item.delta >= 0 ? 'text-[#1f5f33]' : 'text-[#8e030f]'}`}>
                          {item.delta >= 0 ? '+' : ''}{item.delta} pts
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </InfoBlock>
          )}

          {(notes || revisitRequired || shelfResetNeeded) && (
            <InfoBlock title="Visit Flags" subtitle="Field context Trellis will include in the handoff narrative.">
              <div className="space-y-2">
                {notes && <ListRow icon={<ClipboardCheck size={13} className="text-primary" />} text={`Field note: ${notes}`} />}
                {revisitRequired && <ListRow icon={<Flag size={13} className="text-[#8b5d00]" />} text="Revisit Required is flagged for this store." />}
                {shelfResetNeeded && <ListRow icon={<Flag size={13} className="text-[#8b5d00]" />} text="Shelf Reset Needed is flagged before the next visit." />}
              </div>
            </InfoBlock>
          )}

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
                  <p className="text-[12px] font-semibold text-[#1f5f33]">No Trellis blockers remain.</p>
                  <p className="text-[12px] text-[#1f5f33] mt-1">This visit is ready for manager review and submission.</p>
                </div>
              )}
            </div>
          </InfoBlock>

          <TrellisAskButton active={trellisEnabled} onClick={toggleTrellis} />
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

function SummaryMetric({
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

function RiskRow({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'info' | 'success' | 'warning'
}) {
  return (
    <div className={`rounded-lg border px-3 py-3 ${
      tone === 'success'
        ? 'border-[#cde8d3] bg-[#edf7ee]'
        : tone === 'warning'
          ? 'border-[#ead7b1] bg-[#f9f2e7]'
          : 'border-outline bg-[#f7f9fb]'
    }`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
      <p className="mt-1 text-[13px] font-semibold text-on-surface">{value}</p>
    </div>
  )
}

function OpportunityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#cde8d3] bg-[#edf7ee] px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1f5f33]">{label}</p>
      <p className="mt-1 text-[13px] font-semibold text-[#1f5f33]">{value}</p>
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

function buildShareText({
  totalScore,
  scoreDelta,
  summaryInsight,
  remainingOpportunity,
}: {
  totalScore: number
  scoreDelta: number
  summaryInsight: ReturnType<typeof getSummaryInsight>
  remainingOpportunity: string
}) {
  return [
    `Trellis Summary for ${store.name}`,
    `Final score: ${totalScore} (${scoreDelta >= 0 ? '+' : ''}${scoreDelta} vs last visit)`,
    `Main driver: ${summaryInsight.mainPositiveDriver}`,
    `Missed opportunity: ${summaryInsight.biggestMissedOpportunity}`,
    `Next visit focus: ${summaryInsight.nextVisitFocus}`,
    `Remaining opportunity: ${remainingOpportunity}`,
  ].join('\n')
}
