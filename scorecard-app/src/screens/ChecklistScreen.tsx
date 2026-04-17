import { useState, type ChangeEvent } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { Camera, ClipboardCheck, FilePenLine, Layers3, ShieldAlert } from 'lucide-react'
import { BottomActionBar } from '../components/BottomActionBar'
import { PhoneShell } from '../components/PhoneShell'
import { StandardGuidanceCard } from '../components/StandardGuidanceCard'
import { TopBar } from '../components/TopBar'
import {
  TrellisAskButton,
  TrellisInsightCard,
  TrellisSuggestionCard,
} from '../components/TrellisBot'
import { useApp } from '../context/useApp'
import { checklistQuestions, evidenceRequirements, scorecardSections, store } from '../data/mock'
import {
  getChecklistBasePlanScore,
  getChecklistDecisionScore,
  getChecklistImpactValue,
  getChecklistSectionProgress,
  getQuestionEvidenceLabel,
  getQuestionStatus,
  getVisitTypeLabel,
} from '../lib/scorecard'
import { answerTrellisChat, getChecklistHeaderInsight, getChecklistSuggestion } from '../lib/trellis'
import type { ChecklistAnswer, ChecklistQuestion } from '../types'

const OPTIONS: { value: ChecklistAnswer; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'na', label: 'N/A' },
]

const COMPACT_OPTIONS: { value: Exclude<ChecklistAnswer, 'na' | null>; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

const CHECKLIST_GROUPS = [
  {
    id: 'map',
    sectionLabel: 'Base Plan Setup',
    title: 'MAP Locations',
    helper: 'Confirm required MAP locations are present and set to plan.',
  },
  {
    id: 'pog',
    sectionLabel: 'Base Plan Setup',
    title: 'POG Compliance',
    helper: 'Confirm core product categories are stocked and aligned to planogram.',
  },
  {
    id: 'display',
    sectionLabel: 'Feature Space',
    title: 'Display Execution',
    helper: 'Validate feature space before incremental off-shelf capture.',
  },
] as const

const CHECKLIST_SECTION_ORDER = scorecardSections.filter(section => section.kind === 'checklist')

export function ChecklistScreen() {
  const navigate = useNavigate()
  const { sectionId } = useParams<{ sectionId: string }>()
  const app = useApp()
  const {
    visitType,
    checklist,
    questionNotes,
    evidence,
    offShelf,
    setChecklistAnswer,
    setQuestionNote,
    setEvidencePhoto,
    saveDraft,
    lastSavedAt,
    agentforceEnabled,
  } = app

  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({})
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({})
  const [openEvidence, setOpenEvidence] = useState<Record<string, boolean>>({})
  const [trellisOpen, setTrellisOpen] = useState(false)

  const activeSection = CHECKLIST_SECTION_ORDER.find(section => section.id === sectionId)
  if (!activeSection) {
    return <Navigate to="/checklist/base-plan" replace />
  }

  const activeSectionIndex = CHECKLIST_SECTION_ORDER.findIndex(section => section.id === activeSection.id)
  const nextChecklistSection = CHECKLIST_SECTION_ORDER[activeSectionIndex + 1]
  const sectionProgress = getChecklistSectionProgress(activeSection.id, checklist)
  const checklistCompletionPercent = Math.round((sectionProgress.answered / Math.max(1, sectionProgress.total)) * 100)
  const visitTypeLabel = getVisitTypeLabel(visitType)
  const basePlanScore = getChecklistBasePlanScore(checklist)
  const projectedTotalScore = getChecklistDecisionScore(checklist, offShelf)
  const trellisInsight = getChecklistHeaderInsight(app)
  const groups = CHECKLIST_GROUPS
    .map(group => {
      const questions = checklistQuestions.filter(
        question => question.sectionId === activeSection.id && question.group === group.id
      )
      if (questions.length === 0) return null

      const answered = questions.filter(question => checklist[question.id]).length
      const totalValue = questions.reduce((total, question) => total + question.weight, 0)
      return {
        ...group,
        questions,
        answered,
        total: questions.length,
        totalValue,
      }
    })
    .filter(Boolean) as Array<{
    id: string
    sectionLabel: string
    title: string
    helper: string
    questions: typeof checklistQuestions
    answered: number
    total: number
    totalValue: number
  }>

  const helperText = lastSavedAt
    ? `Draft saved at ${lastSavedAt}`
    : nextChecklistSection
      ? `Shorter checklist flow: finish ${activeSection.title.toLowerCase()} and continue to ${nextChecklistSection.title.toLowerCase()}.`
      : 'Finish the final checklist step, then move into off-shelf capture.'
  const standardSummary = activeSection.id === 'base-plan'
    ? 'Confirm MAP and POG first so the store has a stable baseline before any incremental capture.'
    : 'Confirm feature-space execution before off-shelf capture.'
  const standardDetail = activeSection.id === 'base-plan'
    ? 'Suggested action: finish this baseline step, then review secondary display quality on the next page.'
    : 'Finish this step, then move to off-shelf capture.'
  const primaryLabel = nextChecklistSection ? `Next: ${nextChecklistSection.title}` : 'Next: Off-Shelf'
  const primaryRoute = nextChecklistSection?.route ?? '/off-shelf'
  const sectionBadge = activeSection.id === 'base-plan' ? 'Base Plan' : 'Feature Space'
  const headerTitle = activeSection.id === 'base-plan' ? activeSection.title : 'Feature Display Check'
  const guidanceTitle = activeSection.id === 'base-plan' ? activeSection.title : 'Feature Space Check'

  function toggleNote(questionId: string) {
    setOpenNotes(prev => {
      const next = !prev[questionId]
      if (next) {
        setNoteDrafts(drafts => ({ ...drafts, [questionId]: questionNotes[questionId] ?? '' }))
      }
      return { ...prev, [questionId]: next }
    })
  }

  function toggleEvidence(questionId: string) {
    setOpenEvidence(prev => ({ ...prev, [questionId]: !prev[questionId] }))
  }

  function handleNoteDraftChange(questionId: string, value: string) {
    setNoteDrafts(prev => ({ ...prev, [questionId]: value }))
  }

  function handleSaveQuestionNote(questionId: string) {
    setQuestionNote(questionId, noteDrafts[questionId] ?? '')
    saveDraft()
    setOpenNotes(prev => ({ ...prev, [questionId]: false }))
  }

  return (
    <PhoneShell>
      <div className="flex-1 overflow-y-auto bg-[#f4f6f9]">
        <TopBar
          title={store.name}
          subtitle={`${visitTypeLabel} Visit | ${store.scorecard}`}
          showBack
        />

        <div className="border-b border-outline bg-surface-lowest px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">{headerTitle}</p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] text-on-surface-variant">
                {sectionProgress.answered} of {sectionProgress.total} answered | Checklist step {activeSectionIndex + 1} of {CHECKLIST_SECTION_ORDER.length}
              </p>
              <p className="text-[12px] text-on-surface-variant mt-1">{checklistCompletionPercent}% complete in this step</p>
            </div>
            <span className="rounded-md border border-[#c9d8ea] bg-[#edf4ff] px-2 py-1 text-[11px] font-semibold text-primary">
              {sectionBadge}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#e6ebf1] overflow-hidden mt-3">
            <div className="h-full rounded-full bg-primary" style={{ width: `${checklistCompletionPercent}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <ScoreBandMetric label="Step Checks" value={`${sectionProgress.answered}/${sectionProgress.total}`} />
            <ScoreBandMetric label="Base Plan Score" value={basePlanScore.toFixed(1)} />
            <ScoreBandMetric label="Projected Total" value={projectedTotalScore.toFixed(1)} />
          </div>
        </div>

        <div className="px-4 py-3 space-y-3">
          {agentforceEnabled && (
            <>
              <TrellisInsightCard
                badge="Agentforce Guidance"
                title={trellisInsight.title}
                summary={trellisInsight.summary}
                tone={trellisInsight.tone}
                items={trellisInsight.items}
                footer="Agentforce translates live checklist answers into the most useful recovery focus for the current aisle."
              />
            </>
          )}
          {!agentforceEnabled && (
            activeSection.id === 'base-plan' ? (
              <StandardGuidanceCard
                title={guidanceTitle}
                summary={standardSummary}
                detail={standardDetail}
              />
            ) : null
          )}

          {groups.map(group => (
            <div key={group.id} className="rounded-lg border border-outline bg-surface-lowest overflow-hidden">
              <div className="px-4 py-3 border-b border-outline">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">{group.sectionLabel}</p>
                    <p className="text-[15px] font-semibold text-on-surface mt-1">{group.title}</p>
                    <p className="text-[12px] text-on-surface-variant mt-1">{group.helper}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-on-surface">{group.totalValue} pts total</p>
                    <p className="text-[11px] text-on-surface-variant mt-1">{group.answered} of {group.total} complete</p>
                  </div>
                </div>
              </div>
              {activeSection.id === 'base-plan' ? (
                <div className="px-4 py-3 space-y-2">
                  {group.questions.map(question => (
                    <CompactQuestionRow
                      key={question.id}
                      question={question}
                      answer={checklist[question.id] ?? null}
                      onAnswer={(value) => setChecklistAnswer(question.id, value)}
                    />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-outline">
                  {group.questions.map(question => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      answer={checklist[question.id] ?? null}
                      currentNote={questionNotes[question.id] ?? ''}
                      noteDraft={noteDrafts[question.id] ?? questionNotes[question.id] ?? ''}
                      noteOpen={Boolean(openNotes[question.id])}
                      evidenceOpen={Boolean(openEvidence[question.id])}
                      evidence={evidence}
                      offShelfCount={offShelf.length}
                      projectedTotalScore={projectedTotalScore}
                      agentforceEnabled={agentforceEnabled}
                      onAnswer={(value) => setChecklistAnswer(question.id, value)}
                      onToggleNote={() => toggleNote(question.id)}
                      onToggleEvidence={() => toggleEvidence(question.id)}
                      onNoteDraftChange={(value) => handleNoteDraftChange(question.id, value)}
                      onSaveNote={() => handleSaveQuestionNote(question.id)}
                      onCancelNote={() => {
                        setNoteDrafts(prev => ({ ...prev, [question.id]: questionNotes[question.id] ?? '' }))
                        setOpenNotes(prev => ({ ...prev, [question.id]: false }))
                      }}
                      onCapturePhoto={(file) => {
                        const relatedEvidence = evidenceRequirements.filter(item => item.linkedQuestionIds.includes(question.id))
                        const primaryEvidence = relatedEvidence.find(item => item.required) ?? relatedEvidence[0]
                        if (!primaryEvidence) return
                        setEvidencePhoto(primaryEvidence.id, file)
                        if (file) {
                          setOpenEvidence(prev => ({ ...prev, [question.id]: false }))
                        }
                      }}
                      onFollowSuggestion={(route) => navigate(route)}
                      onOpenPhoto={() => navigate('/photo')}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {agentforceEnabled && (
            <TrellisAskButton
              active={trellisOpen}
              onClick={() => setTrellisOpen(prev => !prev)}
              mode="chat"
              title={trellisInsight.title}
              summary={trellisInsight.summary}
              items={trellisInsight.items.map(item => `${item.label}: ${item.value}`)}
              suggestions={[
                'What should I do next?',
                'Explain my score breakdown.',
                'Coach my visit comment.',
                'Which miss is highest impact?',
                'What photo proof is still missing?',
              ]}
              onAsk={(message) => answerTrellisChat({ state: app, screen: 'checklist', message })}
            />
          )}
        </div>
      </div>

      <BottomActionBar
        secondaryLabel="Save Draft"
        onSecondary={saveDraft}
        primaryLabel={primaryLabel}
        onPrimary={() => navigate(primaryRoute)}
        helperText={helperText}
      />
    </PhoneShell>
  )
}

function QuestionCard({
  question,
  answer,
  currentNote,
  noteDraft,
  noteOpen,
  evidenceOpen,
  evidence,
  offShelfCount,
  projectedTotalScore,
  agentforceEnabled,
  onAnswer,
  onToggleNote,
  onToggleEvidence,
  onNoteDraftChange,
  onSaveNote,
  onCancelNote,
  onCapturePhoto,
  onFollowSuggestion,
  onOpenPhoto,
}: {
  question: ChecklistQuestion
  answer: ChecklistAnswer
  currentNote: string
  noteDraft: string
  noteOpen: boolean
  evidenceOpen: boolean
  evidence: Record<string, { captured: boolean; note: string; photoName: string; photoPreviewUrl: string }>
  offShelfCount: number
  projectedTotalScore: number
  agentforceEnabled: boolean
  onAnswer: (value: ChecklistAnswer) => void
  onToggleNote: () => void
  onToggleEvidence: () => void
  onNoteDraftChange: (value: string) => void
  onSaveNote: () => void
  onCancelNote: () => void
  onCapturePhoto: (file: File | null) => void
  onFollowSuggestion: (route: string) => void
  onOpenPhoto: () => void
}) {
  const status = getQuestionStatus(answer)
  const evidenceLabel = getQuestionEvidenceLabel(question, evidence, [])
  const relatedEvidence = evidenceRequirements.filter(item => item.linkedQuestionIds.includes(question.id))
  const primaryEvidence = relatedEvidence.find(item => item.required) ?? relatedEvidence[0]
  const quickPhotoCaptured = Boolean(primaryEvidence && evidence[primaryEvidence.id]?.captured)
  const impactValue = getChecklistImpactValue(question.weight, answer)
  const priority = question.weight >= 15 ? 'High' : 'Med'
  const evidenceMissing = evidenceLabel === 'Photo required before submit'
  const statusLabel = evidenceMissing && answer !== null ? 'Photo Missing' : status.label
  const statusClassName = evidenceMissing && answer !== null
    ? 'text-[#8b5d00] bg-[#f9f2e7] border-[#ead7b1]'
    : status.statusClass
  const scoreFeedback = answer === 'yes'
    ? 'Good execution | contributes to score'
    : answer === 'no'
      ? 'Missed opportunity | reduces score'
      : answer === 'na'
        ? 'Marked N/A | excluded from score impact'
        : 'Awaiting response'
  const trellisSuggestion = agentforceEnabled ? getChecklistSuggestion(question, answer) : null

  return (
    <div className="relative overflow-hidden bg-surface-lowest">
      <div className={`absolute left-0 top-0 h-full w-1 ${status.stripClass}`} />
      <div className="px-4 py-4 pl-5">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border ${status.statusClass}`}>
            {questionIcon(question.icon)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">{question.category}</p>
                <p className="text-[15px] font-semibold text-on-surface mt-1">{question.title}</p>
              </div>
              <div className="text-right">
                <span className={`whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${priorityTone(question.weight)}`}>
                  {priority}
                </span>
                <p className="text-[11px] font-semibold text-on-surface mt-1">{question.weight} pts</p>
              </div>
            </div>
            <p className="text-[12px] text-on-surface-variant mt-2 leading-snug">{question.guidance}</p>
            <p className="text-[12px] text-[#52606d] mt-2 leading-snug">{question.businessWhy}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onAnswer(value)}
              className={clsx(
                'min-h-11 rounded-md border text-[13px] font-semibold transition-colors',
                answer === value
                  ? value === 'yes'
                    ? 'border-[#2e844a] bg-[#edf7ee] text-[#1f5f33]'
                    : value === 'no'
                      ? 'border-[#ba0517] bg-[#fef1ee] text-[#8e030f]'
                      : 'border-[#8b939d] bg-[#f4f6f9] text-[#39414a]'
                  : 'border-outline bg-[#f7f9fb] text-on-surface-variant'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 mt-3">
          <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${statusClassName}`}>
            {statusLabel}
          </span>
          <span className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${evidenceTone(evidenceLabel)}`}>
            {evidenceBadgeLabel(evidenceLabel)}
          </span>
        </div>

        {answer !== null && (
          <div className={`mt-3 rounded-lg border px-3 py-3 ${impactPanelTone(answer)}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Impact</p>
              <p className="text-[12px] font-semibold">{impactValue > 0 ? `+${impactValue} pts added` : impactValue < 0 ? `${impactValue} pts` : '0 pts'}</p>
            </div>
            <div className="flex items-center justify-between gap-3 mt-2">
              <p className="text-[12px]">Score now</p>
              <p className="text-[13px] font-semibold">{projectedTotalScore.toFixed(1)}</p>
            </div>
            <p className="text-[12px] mt-2">{scoreFeedback}</p>
          </div>
        )}

        {trellisSuggestion && (
          <div className="mt-3">
            <TrellisSuggestionCard
              title="Agentforce Recommendation"
              issue={trellisSuggestion.issue}
              impactLabel={trellisSuggestion.impactLabel}
              suggestedFix={trellisSuggestion.suggestedFix}
              estimatedGainLabel={trellisSuggestion.estimatedGainLabel}
              supportingText={trellisSuggestion.supportingText}
              actionLabel={trellisSuggestion.action.label}
              onAction={() => onFollowSuggestion(trellisSuggestion.route)}
              secondaryActionLabel={question.group === 'display' ? 'Capture Evidence' : undefined}
              onSecondaryAction={question.group === 'display' ? onOpenPhoto : undefined}
            />
          </div>
        )}

        {evidenceLabel !== 'No photo required' && (
          <div className={`mt-3 rounded-lg border px-3 py-3 ${evidenceRequirementTone(evidenceLabel)}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
              {evidenceLabel === 'Required photo captured' ? 'Photo Complete' : 'Required Before Submit'}
            </p>
            <p className="text-[12px] mt-1">
              {evidenceLabel === 'Required photo captured'
                ? 'Photo captured. Evidence will support this answer in review.'
                : 'Missing photo will block submission.'}
            </p>
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={onToggleNote}
            className="rounded-md border border-outline bg-surface-low px-2.5 py-1.5 text-[11px] font-medium text-on-surface-variant flex items-center gap-1.5"
          >
            <FilePenLine size={12} />
            {currentNote ? 'Edit Note' : 'Add Note'}
          </button>
          {primaryEvidence && (
            <button
              type="button"
              onClick={onToggleEvidence}
              className={clsx(
                'rounded-md border px-2.5 py-1.5 text-[11px] font-medium flex items-center gap-1.5',
                quickPhotoCaptured
                  ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]'
                  : 'border-outline bg-surface-low text-on-surface-variant'
              )}
            >
              <Camera size={12} />
              {quickPhotoCaptured ? 'Retake Photo' : 'Capture Photo'}
            </button>
          )}
        </div>

        {noteOpen && (
          <div className="mt-3 rounded-lg border border-outline bg-[#f7f9fb] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant mb-2">Question Note</p>
            <textarea
              value={noteDraft}
              onChange={(event) => onNoteDraftChange(event.target.value)}
              placeholder="Add store-level context for this check."
              rows={3}
              className="w-full rounded-lg border border-outline bg-surface-lowest px-3 py-2.5 text-[13px] text-on-surface outline-none resize-none"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancelNote}
                className="min-h-9 rounded-md border border-outline bg-surface-low px-3 text-[12px] font-semibold text-on-surface-variant"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSaveNote}
                className="min-h-9 rounded-md bg-primary px-3 text-[12px] font-semibold text-white"
              >
                Save Note
              </button>
            </div>
          </div>
        )}

        {!noteOpen && currentNote && (
          <div className="mt-3 rounded-lg border border-outline bg-[#f7f9fb] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Saved Note</p>
            <p className="mt-2 text-[12px] text-on-surface leading-snug whitespace-pre-wrap">{currentNote}</p>
          </div>
        )}

        {primaryEvidence && evidenceOpen && (
          <div className="mt-3 rounded-lg border border-outline bg-[#f7f9fb] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant mb-2">Photo Evidence</p>
            <div className="flex items-center gap-2 flex-wrap">
              <label className={clsx(
                'inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md px-3 text-[12px] font-semibold',
                quickPhotoCaptured
                  ? 'border border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]'
                  : 'bg-primary text-white'
              )}>
                <Camera size={13} />
                {quickPhotoCaptured ? 'Retake Photo' : 'Capture Photo'}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const file = event.target.files?.[0] ?? null
                    onCapturePhoto(file)
                    event.target.value = ''
                  }}
                />
              </label>
              <button
                type="button"
                onClick={onToggleEvidence}
                className="min-h-10 rounded-md border border-outline bg-surface-low px-3 text-[12px] font-semibold text-on-surface-variant"
              >
                Close
              </button>
            </div>
            {quickPhotoCaptured && (
              <p className="mt-2 text-[11px] text-[#1f5f33]">Photo captured for this check.</p>
            )}
          </div>
        )}

        {question.group === 'display' && offShelfCount > 0 && answer === 'no' && (
          <p className="mt-3 text-[11px] text-on-surface-variant">Existing off-shelf entries: {offShelfCount}</p>
        )}
      </div>
    </div>
  )
}

function CompactQuestionRow({
  question,
  answer,
  onAnswer,
}: {
  question: ChecklistQuestion
  answer: ChecklistAnswer
  onAnswer: (value: ChecklistAnswer) => void
}) {
  const status = getQuestionStatus(answer)

  return (
    <div className="rounded-lg border border-outline bg-[#f7f9fb] px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-on-surface">{question.title}</p>
          <p className="mt-1 text-[11px] text-on-surface-variant">{question.category}</p>
        </div>
        <span className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold ${status.statusClass}`}>
          {status.label}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {COMPACT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onAnswer(value)}
            className={clsx(
              'min-h-10 rounded-md border text-[12px] font-semibold transition-colors',
              answer === value
                ? value === 'yes'
                  ? 'border-[#2e844a] bg-[#edf7ee] text-[#1f5f33]'
                  : 'border-[#ba0517] bg-[#fef1ee] text-[#8e030f]'
                : 'border-outline bg-white text-on-surface-variant'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function questionIcon(icon: string) {
  if (icon === 'alert') return <ShieldAlert size={16} />
  if (icon === 'display') return <Layers3 size={16} />
  if (icon === 'camera') return <Camera size={16} />
  return <ClipboardCheck size={16} />
}

function ScoreBandMetric({
  label,
  value,
  positive = false,
}: {
  label: string
  value: string
  positive?: boolean
}) {
  return (
    <div className="flex min-h-[58px] min-w-0 flex-col justify-between rounded-lg border border-outline bg-[#f7f9fb] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
      <p className={clsx('mt-1 text-[14px] font-semibold leading-tight', positive ? 'text-[#1f5f33]' : 'text-on-surface')}>{value}</p>
    </div>
  )
}

function priorityTone(weight: number) {
  if (weight >= 15) return 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]'
  return 'border-[#ead7b1] bg-[#f9f2e7] text-[#8b5d00]'
}

function impactPanelTone(answer: ChecklistAnswer) {
  if (answer === 'yes') return 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]'
  if (answer === 'no') return 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]'
  return 'border-[#dde3ea] bg-[#f4f6f9] text-[#52606d]'
}

function evidenceTone(label: string) {
  if (label === 'Required photo captured') return 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]'
  if (label === 'Photo required before submit') return 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]'
  return 'border-[#dde3ea] bg-[#f4f6f9] text-[#52606d]'
}

function evidenceBadgeLabel(label: string) {
  if (label === 'Required photo captured') return 'Photo Complete'
  if (label === 'Photo required before submit') return 'Required Before Submit'
  return 'No Photo Required'
}

function evidenceRequirementTone(label: string) {
  if (label === 'Required photo captured') return 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]'
  return 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]'
}
