import type { ChangeEvent, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Camera, CheckCircle2, FileText, Flag, Image, RotateCcw } from 'lucide-react'
import { BottomActionBar } from '../components/BottomActionBar'
import { PhoneShell } from '../components/PhoneShell'
import { TopBar } from '../components/TopBar'
import { TrellisBot } from '../components/TrellisBot'
import { useApp } from '../context/useApp'
import { evidenceRequirements, scorecardSections, store, trellisContent } from '../data/mock'
import { getLinkedQuestionTitles, getMissingRequiredEvidence } from '../lib/scorecard'

export function PhotoScreen() {
  const navigate = useNavigate()
  const {
    evidence,
    notes,
    setNotes,
    revisitRequired,
    setRevisitRequired,
    shelfResetNeeded,
    setShelfResetNeeded,
    setEvidencePhoto,
    setEvidenceNote,
    completionPercent,
    totalSections,
    lastSavedAt,
    saveDraft,
    trellisEnabled,
  } = useApp()

  const missingEvidence = getMissingRequiredEvidence(evidence)
  const sectionNumber = scorecardSections.findIndex(section => section.id === 'photo-evidence') + 1
  const helperText = lastSavedAt ? `Draft saved at ${lastSavedAt}` : 'Missing required evidence will block submission.'

  return (
    <PhoneShell>
      <div className="flex-1 overflow-y-auto bg-[#f4f6f9]">
        <TopBar title="Photo Evidence" subtitle={`${store.name} | ${store.visitStatus} Visit`} showBack showTrellisToggle />

        <div className="border-b border-outline bg-surface-lowest px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Progress</p>
              <p className="text-[12px] text-on-surface-variant mt-1">Step {sectionNumber} of {totalSections} • {completionPercent}% complete</p>
            </div>
            <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${missingEvidence.length === 0 ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]' : 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]'}`}>
              {missingEvidence.length === 0 ? 'Evidence Ready' : `${missingEvidence.length} Missing`}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#dde3ea] overflow-hidden mt-3">
            <div className="h-full bg-primary rounded-full" style={{ width: `${completionPercent}%` }} />
          </div>
        </div>

        <div className="px-4 py-3 space-y-3">
          {missingEvidence.length > 0 && (
            <div className="border border-[#f9d6d0] bg-[#fef1ee] rounded-lg px-4 py-3 flex gap-2.5">
              <AlertTriangle size={16} className="text-[#ba0517] shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-[#8e030f]">Submission blocked until required evidence is captured.</p>
                <p className="text-[12px] text-[#8e030f] mt-1">
                  Missing: {missingEvidence.map(item => item.title).join(', ')}
                </p>
              </div>
            </div>
          )}

          {trellisEnabled && (
            <TrellisBot
              title={trellisContent.photo.title}
              insight={trellisContent.photo.insight}
              prompts={trellisContent.photo.prompts}
            />
          )}

          {evidenceRequirements.map(requirement => {
            const evidenceItem = evidence[requirement.id]
            const linkedQuestions = getLinkedQuestionTitles(requirement.linkedQuestionIds)
            const captured = evidenceItem?.captured
            const previewUrl = evidenceItem?.photoPreviewUrl
            const photoName = evidenceItem?.photoName

            return (
              <div key={requirement.id} className="border border-outline bg-surface-lowest rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-outline flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">{requirement.required ? 'Required Photo' : 'Optional Photo'}</p>
                    <p className="text-[15px] font-semibold text-on-surface mt-1">{requirement.title}</p>
                    <p className="text-[12px] text-on-surface-variant mt-1">{requirement.relevance}</p>
                  </div>
                  <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${captured ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]' : requirement.required ? 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]' : 'border-[#dde3ea] bg-[#f4f6f9] text-[#52606d]'}`}>
                    {captured ? 'Captured' : requirement.required ? 'Missing' : 'Optional'}
                  </span>
                </div>
                <div className="px-4 py-4">
                  <div className="flex gap-3">
                    <div className={`h-20 w-20 overflow-hidden rounded-lg border flex items-center justify-center ${captured ? 'border-[#cde8d3] bg-[#edf7ee]' : 'border-outline bg-[#f7f9fb]'}`}>
                      {previewUrl ? (
                        <img src={previewUrl} alt={`${requirement.title} evidence`} className="h-full w-full object-cover" />
                      ) : captured ? (
                        <CheckCircle2 size={22} className="text-[#2e844a]" />
                      ) : (
                        <Image size={20} className="text-on-surface-variant" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-on-surface">Linked checklist relevance</p>
                      <p className="text-[12px] text-on-surface-variant mt-1">{linkedQuestions.join(' | ')}</p>
                      {photoName && <p className="mt-1 text-[11px] text-on-surface-variant">{photoName}</p>}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <label className={`inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-[12px] font-semibold ${captured ? 'border border-outline bg-surface-low text-on-surface-variant' : 'bg-primary text-white'}`}>
                          <Camera size={14} />
                          {captured ? 'Retake Photo' : 'Capture Photo'}
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                              const file = event.target.files?.[0] ?? null
                              setEvidencePhoto(requirement.id, file)
                              event.target.value = ''
                            }}
                          />
                        </label>
                        {captured && (
                          <button
                            type="button"
                            onClick={() => setEvidencePhoto(requirement.id, null)}
                            className="rounded-md border border-[#f9d6d0] bg-[#fef1ee] px-3 py-2 text-[12px] font-semibold text-[#8e030f]"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant mb-2">Evidence note</p>
                    <input
                      type="text"
                      value={evidenceItem?.note ?? ''}
                      onChange={(event) => setEvidenceNote(requirement.id, event.target.value)}
                      placeholder="Describe what this photo proves for review."
                      className="w-full rounded-lg border border-outline bg-[#f7f9fb] px-3 py-2.5 text-[13px] text-on-surface outline-none"
                    />
                  </div>
                </div>
              </div>
            )
          })}

          <div className="border border-outline bg-surface-lowest rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-outline">
              <div className="flex items-center gap-1.5">
                <FileText size={14} className="text-primary" />
                <p className="text-[12px] font-semibold text-on-surface">Notes and visit flags</p>
              </div>
            </div>
            <div className="px-4 py-4 space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant mb-2">Manager notes</p>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Document missing placements, recovery actions, or store-specific context."
                  rows={3}
                  className="w-full rounded-lg border border-outline bg-[#f7f9fb] px-3 py-2.5 text-[13px] text-on-surface outline-none resize-none"
                />
              </div>

              <div className="divide-y divide-outline border border-outline rounded-lg overflow-hidden">
                <Toggle
                  icon={<RotateCcw size={15} className="text-[#8b5d00]" />}
                  label="Revisit Required"
                  description="Flag this store for a follow-up visit."
                  value={revisitRequired}
                  onChange={setRevisitRequired}
                />
                <Toggle
                  icon={<Flag size={15} className="text-[#8b5d00]" />}
                  label="Shelf Reset Needed"
                  description="Use when the planogram needs to be reset before the next visit."
                  value={shelfResetNeeded}
                  onChange={setShelfResetNeeded}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomActionBar
        secondaryLabel="Save Draft"
        onSecondary={saveDraft}
        primaryLabel="Review and Submit"
        onPrimary={() => navigate('/summary')}
        helperText={helperText}
      />
    </PhoneShell>
  )
}

function Toggle({
  icon,
  label,
  description,
  value,
  onChange,
}: {
  icon: ReactNode
  label: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-on-surface">{label}</p>
        <p className="text-[12px] text-on-surface-variant mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors shrink-0 relative overflow-hidden ${value ? 'bg-primary' : 'bg-outline'}`}
      >
        <span className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}
