import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { Camera, CheckCircle2, Circle, ClipboardCheck, FilePenLine, Layers3, ShieldAlert } from 'lucide-react'
import { BottomActionBar } from '../components/BottomActionBar'
import { PhoneShell } from '../components/PhoneShell'
import { TopBar } from '../components/TopBar'
import { TrellisBot } from '../components/TrellisBot'
import { useApp } from '../context/useApp'
import { evidenceRequirements, scorecardSections, store, trellisContent } from '../data/mock'
import {
  getChecklistBasePlanScore,
  getChecklistDecisionScore,
  getChecklistImpactValue,
  getChecklistQuestionsForSection,
  getChecklistSectionProgress,
  getChecklistSectionValue,
  getCurrentSectionNumber,
  getQuestionEvidenceLabel,
  getQuestionStatus,
  getOffShelfIncrementalScore,
  getStepState,
} from '../lib/scorecard'
import type { ChecklistAnswer } from '../types'

const OPTIONS: { value: ChecklistAnswer; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'na', label: 'N/A' },
]

export function ChecklistScreen() {
  const navigate = useNavigate()
  const app = useApp()
  const {
    checklist,
    questionNotes,
    evidence,
    offShelf,
    setChecklistAnswer,
    setQuestionNote,
    setEvidencePhoto,
    executionScore,
    answeredChecks,
    totalChecks,
    completionPercent,
    totalSections,
    lastSavedAt,
    saveDraft,
    trellisEnabled,
  } = app
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({})

  const checklistSections = scorecardSections.filter(section => section.kind === 'checklist')
  const activeSection =
    checklistSections.find(section => !getChecklistSectionProgress(section.id, checklist).complete) ??
    checklistSections[checklistSections.length - 1]
  const activeQuestions = getChecklistQuestionsForSection(activeSection.id)
  const currentSectionNumber = getCurrentSectionNumber(app)
  const sectionProgress = getChecklistSectionProgress(activeSection.id, checklist)
  const currentSectionValue = getChecklistSectionValue(activeSection.id)
  const basePlanScore = getChecklistBasePlanScore(checklist)
  const incrementalScore = getOffShelfIncrementalScore(offShelf)
  const totalDecisionScore = getChecklistDecisionScore(checklist, offShelf)
  const sectionPointsAtStake = activeQuestions.reduce((total, question) => {
    const answer = checklist[question.id] ?? null
    return total + (answer === 'yes' || answer === 'na' ? 0 : question.weight)
  }, 0)
  const helperText = lastSavedAt ? `Draft saved at ${lastSavedAt}` : 'Draft saves automatically inside the active visit.'

  function toggleNote(questionId: string) {
    setOpenNotes(prev => ({ ...prev, [questionId]: !prev[questionId] }))
  }

  return (
    <PhoneShell>
      <div className="flex-1 overflow-y-auto bg-[#f4f6f9]">
        <TopBar title="Checklist Execution" subtitle={`${store.name} | ${store.visitStatus} Visit`} showBack showTrellisToggle />

        <div className="border-b border-outline bg-surface-lowest">
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Progress</p>
                <p className="text-[12px] text-on-surface-variant mt-1">
                  {answeredChecks} / {totalChecks} answered • Step {currentSectionNumber} of {totalSections}
                </p>
              </div>
              <div className="rounded-md border border-[#c9d8ea] bg-[#edf4ff] px-2 py-1 text-right">
                <p className="text-[15px] font-semibold text-primary">{completionPercent}%</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Execution {executionScore}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <ScoreBandMetric label="Base Plan Score" value={basePlanScore.toFixed(1)} />
              <ScoreBandMetric label="Incremental Score" value={`+${incrementalScore.toFixed(1)}`} positive />
              <ScoreBandMetric label="Total Score" value={totalDecisionScore.toFixed(1)} />
            </div>
            <div className="h-2 rounded-full bg-[#e6ebf1] overflow-hidden mt-3">
              <div className="h-full rounded-full bg-primary" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="px-4 py-3 space-y-3">
          <div className="border border-outline bg-surface-lowest rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-outline">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Current Section</p>
                  <p className="text-[15px] font-semibold text-on-surface mt-1">{activeSection.title}</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">{currentSectionValue} pts total</p>
                </div>
                <span className="rounded-md border border-[#c9d8ea] bg-[#edf4ff] px-2 py-1 text-[11px] font-semibold text-primary">
                  {sectionProgress.answered} of {sectionProgress.total} complete
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant mt-2">{activeSection.description}</p>
              <p className="text-[11px] font-medium text-[#8b5d00] mt-2">{sectionPointsAtStake} pts at stake in this section</p>
            </div>
            <div className="divide-y divide-outline">
              {checklistSections.map(section => {
                const state = getStepState(section.id, app)
                const progress = getChecklistSectionProgress(section.id, checklist)
                const sectionValue = getChecklistSectionValue(section.id)
                const sectionAtStake = progress.questions.reduce((total, question) => {
                  const answer = checklist[question.id] ?? null
                  return total + (answer === 'yes' || answer === 'na' ? 0 : question.weight)
                }, 0)
                return (
                  <div key={section.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md border text-[11px] font-semibold ${sectionStateTone(state)}`}>
                        {progress.complete ? <CheckCircle2 size={13} /> : section.id === activeSection.id ? <Layers3 size={13} /> : <Circle size={13} />}
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-on-surface">{section.title} • {sectionValue} pts total</p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">{progress.answered} of {progress.total} complete • {sectionAtStake} pts at stake</p>
                      </div>
                    </div>
                    <span className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${sectionPillTone(state)}`}>
                      {sectionStateLabel(state)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {trellisEnabled && (
            <TrellisBot
              title={trellisContent.checklist.title}
              insight={trellisContent.checklist.insight}
              prompts={trellisContent.checklist.prompts}
            />
          )}

          {activeQuestions.map(question => {
            const answer = checklist[question.id] ?? null
            const status = getQuestionStatus(answer)
            const evidenceLabel = getQuestionEvidenceLabel(question, evidence, offShelf)
            const relatedEvidence = evidenceRequirements.filter(item => item.linkedQuestionIds.includes(question.id))
            const primaryEvidence = relatedEvidence.find(item => item.required) ?? relatedEvidence[0]
            const currentNote = questionNotes[question.id] ?? ''
            const noteOpen = Boolean(openNotes[question.id] || currentNote)
            const currentEvidence = primaryEvidence ? evidence[primaryEvidence.id] : null
            const quickPhotoCaptured = Boolean(currentEvidence?.captured)
            const impactValue = getChecklistImpactValue(question.weight, answer)
            const priority = question.weight >= 15 ? 'HIGH IMPACT' : question.weight >= 10 ? 'MEDIUM IMPACT' : 'LOW IMPACT'
            const impactTone = answer === 'yes' ? 'positive' : answer === 'no' ? 'negative' : 'neutral'
            const scoreFeedback = answer === 'yes'
              ? 'Good execution — contributes to score'
              : answer === 'no'
                ? 'Missed opportunity — reduces score'
                : answer === 'na'
                  ? 'Marked N/A — excluded from score gain'
                  : 'Awaiting response'
            const evidenceMissing = evidenceLabel === 'Photo required before submit'
            const statusLabel = evidenceMissing && answer !== null ? 'Photo Missing' : status.label
            const statusClassName = evidenceMissing && answer !== null
              ? 'text-[#8b5d00] bg-[#f9f2e7] border-[#ead7b1]'
              : status.statusClass

            return (
              <div key={question.id} className="relative overflow-hidden rounded-lg border border-outline bg-surface-lowest">
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
                          <span className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${priorityTone(question.weight)}`}>
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
                        onClick={() => setChecklistAnswer(question.id, value)}
                        className={clsx(
                          'min-h-11 rounded-lg border text-[13px] font-semibold transition-colors',
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
                    <div className={`mt-3 rounded-lg border px-3 py-3 ${impactPanelTone(impactTone)}`}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Impact</p>
                        <p className="text-[12px] font-semibold">{impactValue > 0 ? `+${impactValue} pts added` : impactValue < 0 ? `${impactValue} pts missed` : '0 pts'}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3 mt-2">
                        <p className="text-[12px]">Score now</p>
                        <p className="text-[13px] font-semibold">{totalDecisionScore.toFixed(1)}</p>
                      </div>
                      <p className="text-[12px] mt-2">{scoreFeedback}</p>
                    </div>
                  )}

                  {answer === 'no' && (
                    <div className="mt-3 rounded-lg border border-[#f9d6d0] bg-[#fef1ee] px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8e030f]">Action Required</p>
                      <p className="text-[12px] text-[#8e030f] mt-2">{question.title} missing → -{question.weight} pts</p>
                      <p className="text-[12px] text-[#8e030f] mt-1">Fix before submission to avoid score reduction.</p>
                      {question.sectionId === 'secondary-displays' && (
                        <button
                          type="button"
                          onClick={() => navigate('/off-shelf')}
                          className="mt-3 min-h-10 rounded-md bg-primary px-3 text-[12px] font-semibold text-white"
                        >
                          Add Off-Shelf Display →
                        </button>
                      )}
                    </div>
                  )}

                  {evidenceLabel !== 'No photo required' && (
                    <div className={`mt-3 rounded-lg border px-3 py-3 ${evidenceRequirementTone(evidenceLabel)}`}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                        {evidenceLabel === 'Required photo captured' ? 'Evidence Complete' : 'Required Before Submit'}
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
                      onClick={() => toggleNote(question.id)}
                      className="rounded-md border border-outline bg-surface-low px-2.5 py-1.5 text-[11px] font-medium text-on-surface-variant flex items-center gap-1.5"
                    >
                      <FilePenLine size={12} />
                      {currentNote ? 'Edit Note' : 'Add Note'}
                    </button>
                    {primaryEvidence && evidenceLabel !== 'No photo required' && (
                      <label className={clsx(
                        'rounded-md border px-2.5 py-1.5 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer',
                        quickPhotoCaptured
                          ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]'
                          : 'border-outline bg-surface-low text-on-surface-variant'
                      )}>
                        <Camera size={12} />
                        {quickPhotoCaptured ? 'Retake Photo' : 'Capture Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            const file = event.target.files?.[0] ?? null
                            setEvidencePhoto(primaryEvidence.id, file)
                            event.target.value = ''
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {noteOpen && (
                    <div className="mt-3 rounded-lg border border-outline bg-[#f7f9fb] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant mb-2">Question Note</p>
                      <textarea
                        value={currentNote}
                        onChange={(event) => setQuestionNote(question.id, event.target.value)}
                        placeholder="Add store-level context for this check."
                        rows={3}
                        className="w-full rounded-lg border border-outline bg-surface-lowest px-3 py-2.5 text-[13px] text-on-surface outline-none resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <BottomActionBar
        secondaryLabel="Save Draft"
        onSecondary={saveDraft}
        primaryLabel="Next Section"
        onPrimary={() => navigate('/off-shelf')}
        helperText={helperText}
      />
    </PhoneShell>
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
    <div className="rounded-lg border border-outline bg-[#f7f9fb] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
      <p className={clsx('mt-1 text-[14px] font-semibold', positive ? 'text-[#1f5f33]' : 'text-on-surface')}>{value}</p>
    </div>
  )
}

function priorityTone(weight: number) {
  if (weight >= 15) return 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]'
  if (weight >= 10) return 'border-[#ead7b1] bg-[#f9f2e7] text-[#8b5d00]'
  return 'border-[#c9d8ea] bg-[#edf4ff] text-primary'
}

function impactPanelTone(tone: 'positive' | 'negative' | 'neutral') {
  return {
    positive: 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]',
    negative: 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]',
    neutral: 'border-[#dde3ea] bg-[#f4f6f9] text-[#52606d]',
  }[tone]
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

function sectionStateTone(state: ReturnType<typeof getStepState>) {
  return {
    completed: 'border-[#cde8d3] bg-[#edf7ee] text-[#2e844a]',
    'in-progress': 'border-[#c9d8ea] bg-[#edf4ff] text-primary',
    pending: 'border-[#ead7b1] bg-[#f9f2e7] text-[#8b5d00]',
    locked: 'border-[#dde3ea] bg-[#f4f6f9] text-[#7f8b99]',
  }[state]
}

function sectionPillTone(state: ReturnType<typeof getStepState>) {
  return {
    completed: 'text-[#1f5f33] bg-[#edf7ee] border-[#cde8d3]',
    'in-progress': 'text-primary bg-[#edf4ff] border-[#c9d8ea]',
    pending: 'text-[#755400] bg-[#f9f2e7] border-[#ead7b1]',
    locked: 'text-[#52606d] bg-[#f4f6f9] border-[#dde3ea]',
  }[state]
}

function sectionStateLabel(state: ReturnType<typeof getStepState>) {
  return {
    completed: 'Completed',
    'in-progress': 'In Progress',
    pending: 'Pending',
    locked: 'Locked',
  }[state]
}
