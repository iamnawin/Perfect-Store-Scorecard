import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { Camera, CheckCircle2, Circle, ClipboardCheck, FilePenLine, Layers3, ShieldAlert } from 'lucide-react'
import { BottomActionBar } from '../components/BottomActionBar'
import { PhoneShell } from '../components/PhoneShell'
import { TopBar } from '../components/TopBar'
import { TrellisBot } from '../components/TrellisBot'
import { useApp } from '../context/useApp'
import { scorecardSections, store, trellisContent } from '../data/mock'
import {
  getChecklistQuestionsForSection,
  getChecklistSectionProgress,
  getCurrentSectionNumber,
  getQuestionEvidenceLabel,
  getQuestionStatus,
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
    evidence,
    setChecklistAnswer,
    executionScore,
    answeredChecks,
    totalChecks,
    completionPercent,
    totalSections,
    lastSavedAt,
    saveDraft,
    trellisEnabled,
  } = app

  const checklistSections = scorecardSections.filter(section => section.kind === 'checklist')
  const activeSection =
    checklistSections.find(section => !getChecklistSectionProgress(section.id, checklist).complete) ??
    checklistSections[checklistSections.length - 1]
  const activeQuestions = getChecklistQuestionsForSection(activeSection.id)
  const currentSectionNumber = getCurrentSectionNumber(app)
  const sectionProgress = getChecklistSectionProgress(activeSection.id, checklist)
  const helperText = lastSavedAt ? `Draft saved at ${lastSavedAt}` : 'Draft saves automatically inside the active visit.'

  return (
    <PhoneShell>
      <div className="flex-1 overflow-y-auto bg-[#f4f6f9]">
        <TopBar title="Base Plan Check" subtitle={`${store.name} | ${store.visitStatus} Visit`} showBack showTrellisToggle />

        <div className="border-b border-outline bg-surface-lowest">
          <div className="px-4 py-3">
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
                </div>
                <span className="rounded-md border border-[#c9d8ea] bg-[#edf4ff] px-2 py-1 text-[11px] font-semibold text-primary">
                  {sectionProgress.answered} of {sectionProgress.total} complete
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant mt-2">{activeSection.description}</p>
            </div>
            <div className="divide-y divide-outline">
              {checklistSections.map(section => {
                const state = getStepState(section.id, app)
                const progress = getChecklistSectionProgress(section.id, checklist)
                return (
                  <div key={section.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md border text-[11px] font-semibold ${sectionStateTone(state)}`}>
                        {progress.complete ? <CheckCircle2 size={13} /> : section.id === activeSection.id ? <Layers3 size={13} /> : <Circle size={13} />}
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-on-surface">{section.title}</p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">{progress.answered} of {progress.total} checks answered</p>
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
            const evidenceLabel = getQuestionEvidenceLabel(question, evidence)

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
                        <span className="rounded-md border border-outline bg-[#f7f9fb] px-2 py-1 text-[11px] font-semibold text-on-surface-variant">
                          {question.weight} pts
                        </span>
                      </div>
                      <p className="text-[12px] text-on-surface-variant mt-2 leading-snug">{question.guidance}</p>
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
                    <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${status.statusClass}`}>
                      {status.label}
                    </span>
                    <span className="text-[11px] font-medium text-on-surface-variant">{evidenceLabel}</span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button type="button" className="rounded-md border border-outline bg-surface-low px-2.5 py-1.5 text-[11px] font-medium text-on-surface-variant flex items-center gap-1.5">
                      <FilePenLine size={12} />
                      Add Note
                    </button>
                    {evidenceLabel !== 'No photo required' && (
                      <button type="button" className="rounded-md border border-outline bg-surface-low px-2.5 py-1.5 text-[11px] font-medium text-on-surface-variant flex items-center gap-1.5">
                        <Camera size={12} />
                        Capture Photo
                      </button>
                    )}
                  </div>
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
