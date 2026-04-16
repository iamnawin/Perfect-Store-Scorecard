import { useState, type ChangeEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import {
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  CircleEllipsis,
  Copy,
  Edit3,
  Image,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { PhoneShell } from '../components/PhoneShell'
import { TopBar } from '../components/TopBar'
import { TrellisAskButton, TrellisInsightCard } from '../components/TrellisBot'
import { useApp } from '../context/useApp'
import {
  offShelfCategories,
  offShelfLocations,
  offShelfProducts,
  offShelfQuantityOptions,
  store,
} from '../data/mock'
import {
  estimateOffShelfImpact,
  getCurrentSectionNumber,
  getOffShelfIncrementalScore,
  getOffShelfProductById,
  getOffShelfQuantityLabel,
  getPendingFollowUpEntries,
  getPotentialAdditionalGain,
  getRemainingOffShelfRecommendations,
  getVisitTypeLabel,
} from '../lib/scorecard'
import { getOffShelfInsight, getRevisitIntelligence, getTopRecommendation } from '../lib/trellis'
import type { OffShelfClassification, OffShelfEntry } from '../types'

interface DraftState {
  location: string
  category: string
  skuId: string
  quantity: number | string | ''
  classification: OffShelfClassification
  photoCaptured: boolean
  photoName: string
  photoPreviewUrl: string
  caption: string
  notes: string
  searchTerm: string
}

const classificationOptions: Array<{ id: OffShelfClassification; label: string }> = [
  { id: 'base-plan', label: 'Yes' },
  { id: 'incremental', label: 'No' },
  { id: 'not-sure', label: 'Not Sure' },
]

function createEmptyDraft(): DraftState {
  return {
    location: '',
    category: '',
    skuId: '',
    quantity: '',
    classification: 'incremental',
    photoCaptured: false,
    photoName: '',
    photoPreviewUrl: '',
    caption: '',
    notes: '',
    searchTerm: '',
  }
}

export function OffShelfScreen() {
  const navigate = useNavigate()
  const app = useApp()
  const {
    visitType,
    offShelf,
    offShelfConfirmed,
    addOffShelfEntry,
    updateOffShelfEntry,
    duplicateOffShelfEntry,
    removeOffShelfEntry,
    confirmOffShelfReview,
    completionPercent,
    answeredChecks,
    totalChecks,
    totalSections,
    lastSavedAt,
    agentforceEnabled,
  } = app

  const [draft, setDraft] = useState<DraftState>(createEmptyDraft())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showCaptured, setShowCaptured] = useState(true)
  const [trellisOpen, setTrellisOpen] = useState(false)

  const sectionNumber = getCurrentSectionNumber(app)
  const visitTypeLabel = getVisitTypeLabel(visitType)
  const selectedCategory = offShelfCategories.find(item => item.id === draft.category)
  const selectedProduct = draft.skuId ? getOffShelfProductById(draft.skuId) : undefined
  const followUpEntries = offShelf.filter(entry => entry.origin === 'previous-visit')
  const pendingFollowUpEntries = getPendingFollowUpEntries(offShelf)
  const addedEntries = offShelf.filter(entry => entry.status === 'added')
  const removedEntries = offShelf.filter(entry => entry.status === 'removed')
  const retainedEntries = offShelf.filter(entry => entry.status === 'retained' || entry.status === 'updated')

  const filteredProducts = offShelfProducts
    .filter(product => !draft.category || product.categoryId === draft.category)
    .filter(product => {
      const query = draft.searchTerm.trim().toLowerCase()
      if (!query) return true
      return `${product.name} ${product.subtitle}`.toLowerCase().includes(query)
    })
    .sort((left, right) => {
      const leftRecommended = agentforceEnabled && draft.location && left.recommendedLocations.includes(draft.location) ? 1 : 0
      const rightRecommended = agentforceEnabled && draft.location && right.recommendedLocations.includes(draft.location) ? 1 : 0
      if (leftRecommended !== rightRecommended) return rightRecommended - leftRecommended
      return right.basePoints - left.basePoints
    })

  const currentIncremental = getOffShelfIncrementalScore(offShelf)
  const editingEntry = editingId ? offShelf.find(entry => entry.id === editingId) : null
  const editingImpact = editingEntry?.impactPoints ?? 0
  const draftImpact = selectedProduct && draft.location && draft.quantity !== ''
    ? estimateOffShelfImpact({
        product: selectedProduct,
        location: draft.location,
        quantity: draft.quantity,
        classification: draft.classification,
      })
    : null
  const liveIncremental = +(currentIncremental - editingImpact + (draftImpact?.impactPoints ?? editingImpact)).toFixed(1)
  const projectedScore = +(100 + liveIncremental).toFixed(1)
  const potentialAdditionalGain = getPotentialAdditionalGain(offShelf)
  const remainingRecommendations = getRemainingOffShelfRecommendations(offShelf).slice(0, 4)
  const quantityLabel = draft.quantity === '' ? '' : getOffShelfQuantityLabel(draft.quantity)
  const classificationPrompt = draft.location === 'Endcap' || draft.location === 'Garden Door'
    ? 'Suggested: No, this looks incremental for this location.'
    : 'Use this to separate base plan coverage from incremental gain.'
  const trellisRecommendation = getOffShelfInsight({
    state: app,
    location: draft.location,
    quantity: draft.quantity,
    classification: draft.classification,
    product: selectedProduct,
  })
  const topRecommendation = getTopRecommendation(app)
  const revisitIntelligence = visitType === 'follow-up' ? getRevisitIntelligence(app) : null

  const canSaveEntry = Boolean(
    draft.location &&
    draft.category &&
    draft.skuId &&
    draft.quantity !== '' &&
    draftImpact
  )

  const footerHelper = editingId
    ? visitType === 'follow-up'
      ? 'Save the follow-up change, then continue to evidence review.'
      : 'Update this display record, then continue to evidence review.'
    : lastSavedAt
      ? `Draft saved at ${lastSavedAt}`
      : visitType === 'follow-up'
        ? 'Review each previous display, then add only the new placements you still need to capture.'
        : 'Use quick selections to capture incremental displays in under three minutes.'

  function updateDraft<K extends keyof DraftState>(key: K, value: DraftState[K]) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  function resetDraft() {
    setDraft(createEmptyDraft())
    setEditingId(null)
  }

  function handleCategorySelect(categoryId: string) {
    setDraft(prev => ({
      ...prev,
      category: categoryId,
      skuId: '',
      searchTerm: '',
    }))
  }

  function handleLocationSelect(location: string) {
    setDraft(prev => ({
      ...prev,
      location,
      classification: location === 'Endcap' || location === 'Garden Door'
        ? 'incremental'
        : prev.classification,
    }))
  }

  function handleProductSelect(productId: string) {
    setDraft(prev => ({
      ...prev,
      skuId: productId,
      searchTerm: '',
    }))
  }

  function handleSaveEntry(resetAfterSave = true) {
    if (!selectedProduct || !draftImpact || !canSaveEntry) return

    const nextStatus = editingEntry
      ? editingEntry.origin === 'previous-visit' ? 'updated' : editingEntry.status === 'added' ? 'added' : 'saved'
      : visitType === 'follow-up' ? 'added' : 'saved'

    const entry: OffShelfEntry = {
      id: editingId ?? crypto.randomUUID(),
      location: draft.location,
      category: selectedCategory?.label ?? draft.category,
      skuId: selectedProduct.id,
      product: selectedProduct.name,
      quantity: draft.quantity,
      classification: draft.classification,
      photoCaptured: draft.photoCaptured,
      photoName: draft.photoName,
      photoPreviewUrl: draft.photoPreviewUrl,
      caption: draft.caption.trim(),
      notes: draft.notes.trim(),
      estimatedLgor: draftImpact.estimatedLgor,
      impactPoints: draftImpact.impactPoints,
      multiplier: draftImpact.multiplier,
      multiplierLabel: draftImpact.multiplierLabel,
      origin: editingEntry?.origin ?? 'current-visit',
      status: nextStatus,
    }

    if (editingId) {
      updateOffShelfEntry(entry)
    } else {
      addOffShelfEntry(entry)
    }

    if (resetAfterSave) {
      resetDraft()
      return
    }

    setEditingId(entry.id)
  }

  function handleEdit(entry: OffShelfEntry) {
    setEditingId(entry.id)
    setDraft({
      location: entry.location,
      category: resolveCategoryId(entry.category),
      skuId: entry.skuId,
      quantity: entry.quantity,
      classification: entry.classification,
      photoCaptured: entry.photoCaptured,
      photoName: entry.photoName,
      photoPreviewUrl: entry.photoPreviewUrl,
      caption: entry.caption,
      notes: entry.notes,
      searchTerm: '',
    })
  }

  function handleMarkFollowUpEntry(entry: OffShelfEntry, status: OffShelfEntry['status']) {
    updateOffShelfEntry({
      ...entry,
      status,
    })
  }

  function handleAddAdditional(sourceEntry?: OffShelfEntry) {
    if (sourceEntry?.origin === 'previous-visit' && sourceEntry.status === 'pending-review') {
      handleMarkFollowUpEntry(sourceEntry, 'retained')
    }

    if (sourceEntry) {
      setDraft({
        location: sourceEntry.location,
        category: resolveCategoryId(sourceEntry.category),
        skuId: sourceEntry.skuId,
        quantity: sourceEntry.quantity,
        classification: sourceEntry.classification,
        photoCaptured: false,
        photoName: '',
        photoPreviewUrl: '',
        caption: '',
        notes: '',
        searchTerm: '',
      })
      setEditingId(null)
      return
    }

    resetDraft()
  }

  function applyRecommendation(recommendation: (typeof remainingRecommendations)[number]) {
    const product = recommendation.product
    if (!product) return

    setEditingId(null)
    setDraft({
      location: recommendation.location,
      category: product.categoryId,
      skuId: product.id,
      quantity: recommendation.quantity,
      classification: 'incremental',
      photoCaptured: false,
      photoName: '',
      photoPreviewUrl: '',
      caption: '',
      notes: '',
      searchTerm: '',
    })
  }

  function handleDraftPhoto(file: File | null) {
    if (!file) {
      setDraft(prev => ({
        ...prev,
        photoCaptured: false,
        photoName: '',
        photoPreviewUrl: '',
      }))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setDraft(prev => ({
        ...prev,
        photoCaptured: true,
        photoName: file.name,
        photoPreviewUrl: result,
      }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <PhoneShell>
      <div className="flex-1 overflow-y-auto bg-[#f4f6f9] pb-2">
        <TopBar
          title="Off-Shelf Opportunity Capture"
          subtitle={`${store.name} | ${visitTypeLabel} Visit`}
          showBack
          rightSlot={(
            <button
              type="button"
              className="rounded-md border border-outline p-2 text-on-surface-variant active:bg-surface-low"
              aria-label="More actions"
            >
              <CircleEllipsis size={16} />
            </button>
          )}
        />

        <div className="border-b border-outline bg-surface-lowest">
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Progress</p>
                <p className="text-[12px] text-on-surface-variant mt-1">
                  {visitType === 'follow-up'
                    ? `${followUpEntries.length} prior display ${followUpEntries.length === 1 ? 'entry' : 'entries'} loaded | Step ${sectionNumber} of ${totalSections}`
                    : `${answeredChecks} / ${totalChecks} answered | Step ${sectionNumber} of ${totalSections}`}
                </p>
              </div>
              <div className="grid min-w-[174px] grid-cols-3 gap-2">
                <BandMetric label="Done" value={`${completionPercent}%`} />
                <BandMetric label="Score" value={projectedScore.toFixed(1)} />
                <BandMetric label="Lift" value={`+${liveIncremental.toFixed(1)}`} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-on-surface-variant">
                <span>{visitType === 'follow-up' ? 'Revisit Display Review' : 'Off-Shelf Opportunity Capture'}</span>
                <span>{completionPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#dde3ea]">
                <div className="h-full rounded-full bg-primary" style={{ width: `${completionPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 space-y-3">
          {visitType === 'follow-up' && (
            <SectionCard
              title="Previous Visit Review"
              subtitle="Confirm what stayed the same, what changed, what is gone, and any additional displays observed on the follow-up."
              utility={(
                <button
                  type="button"
                  onClick={confirmOffShelfReview}
                  className="rounded-md border border-outline px-2.5 py-1.5 text-[11px] font-semibold text-on-surface-variant"
                >
                  Finish Review
                </button>
              )}
            >
              <div className="grid grid-cols-2 gap-2">
                <ScoreCell label="Prior Displays" value={String(followUpEntries.length)} tone="neutral" />
                <ScoreCell label="Pending" value={String(pendingFollowUpEntries.length)} tone={pendingFollowUpEntries.length > 0 ? 'positive' : 'neutral'} />
                <ScoreCell label="Retained / Updated" value={String(retainedEntries.length)} tone="positive" />
                <ScoreCell label="Removed / Added" value={`${removedEntries.length} / ${addedEntries.length}`} tone="neutral" />
              </div>
              <div className="space-y-2">
                {followUpEntries.map((entry, index) => (
                  <div key={entry.id} className="rounded-lg border border-outline bg-[#f7f9fb] px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Previous display {index + 1}</p>
                        <p className="mt-1 text-[13px] font-semibold text-on-surface">{entry.location} | {entry.product} | {getOffShelfQuantityLabel(entry.quantity)}</p>
                        <p className="mt-1 text-[11px] text-on-surface-variant">{entry.caption || entry.notes || 'Review this display against the current follow-up visit.'}</p>
                      </div>
                      <span className={clsx('rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]', followUpStatusTone(entry.status))}>
                        {formatFollowUpStatus(entry.status)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <FollowUpDecisionButton
                        icon={<Check size={12} />}
                        label="Keep"
                        active={entry.status === 'retained'}
                        onClick={() => handleMarkFollowUpEntry(entry, 'retained')}
                      />
                      <FollowUpDecisionButton
                        icon={<Edit3 size={12} />}
                        label="Update"
                        active={entry.status === 'updated'}
                        onClick={() => handleEdit(entry)}
                      />
                      <FollowUpDecisionButton
                        icon={<Trash2 size={12} />}
                        label="Removed"
                        active={entry.status === 'removed'}
                        destructive
                        onClick={() => handleMarkFollowUpEntry(entry, 'removed')}
                      />
                      <FollowUpDecisionButton
                        icon={<Plus size={12} />}
                        label="Add New"
                        onClick={() => handleAddAdditional(entry)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          <SectionCard title="Score Impact" subtitle="Current score state for this visit.">
            <div className="grid grid-cols-2 gap-2">
              <ScoreCell label="Current Score" value={projectedScore.toFixed(1)} tone="neutral" />
              <ScoreCell label="Base Plan" value="100.0" tone="neutral" />
              <ScoreCell label="Incremental Off-Shelf" value={`+${liveIncremental.toFixed(1)}`} tone="positive" />
              {agentforceEnabled && (
                <InsightCell
                  label="You Can Gain"
                  value={`+${potentialAdditionalGain.toFixed(1)} pts`}
                  lines={remainingRecommendations.slice(0, 3).map(item => `Add ${item.location} display | +${item.potentialPoints.toFixed(1)} pts`)}
                />
              )}
            </div>
          </SectionCard>

          <SectionCard title="Incremental Summary" subtitle="Displays are counted automatically as you add them.">
            <div className="grid grid-cols-2 gap-2">
              <ScoreCell label="Total Displays Added" value={String(offShelf.length)} tone="neutral" />
              <ScoreCell label="Total Incremental Contribution" value={`+${currentIncremental.toFixed(1)} pts`} tone="positive" />
            </div>
          </SectionCard>

          {agentforceEnabled && (
            <>
              <TrellisInsightCard
                title={topRecommendation.title}
                summary={topRecommendation.summary}
                badge="Top Recommendation"
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
              {visitType === 'follow-up' && revisitIntelligence && (
                <TrellisInsightCard
                  title={revisitIntelligence.title}
                  summary={revisitIntelligence.summary}
                  badge="Revisit Intelligence"
                  tone={revisitIntelligence.tone}
                  metrics={[
                    { label: 'Status', value: revisitIntelligence.statusLabel },
                  ]}
                  items={revisitIntelligence.items}
                  footer={revisitIntelligence.footer}
                />
              )}
              <TrellisInsightCard
                title={trellisRecommendation.title}
                summary={trellisRecommendation.supportingText}
                badge="Agentforce Recommendation"
                tone={trellisRecommendation.tone}
                metrics={[
                  { label: 'Impact', value: trellisRecommendation.impactLabel },
                  { label: 'LGOR', value: trellisRecommendation.lgorLabel },
                ]}
                items={[
                  { label: 'Suggested Next Move', value: trellisRecommendation.suggestedNextMove, tone: 'success' },
                ]}
                footer="Agentforce ranks the best next display using mock store history, score upside, and preferred placements."
              />
            </>
          )}

          <SectionCard
            title={editingId
              ? editingEntry?.origin === 'previous-visit' ? 'Update Previous Display' : 'Edit Added Display'
              : visitType === 'follow-up' ? 'Add Additional Display' : 'Add Off-Shelf Display'}
            subtitle={visitType === 'follow-up'
              ? 'Capture only the changed or newly added displays from the follow-up visit.'
              : 'Capture incremental displays above base plan, attach evidence, and score the impact in real time.'}
            utility={(
              <button
                type="button"
                onClick={visitType === 'follow-up' ? () => handleAddAdditional() : confirmOffShelfReview}
                className="rounded-md border border-outline px-2.5 py-1.5 text-[11px] font-semibold text-on-surface-variant"
              >
                {visitType === 'follow-up' ? 'Add Blank Entry' : 'No display today'}
              </button>
            )}
          >
            <FieldLabel label="Display Location" />
            <SegmentGrid
              values={offShelfLocations}
              selectedValue={draft.location}
              onSelect={handleLocationSelect}
              columns="grid-cols-3"
            />

            <FieldLabel label="Product Category" />
            <SegmentGrid
              values={offShelfCategories.map(item => item.label)}
              selectedValue={selectedCategory?.label ?? ''}
              onSelect={value => {
                const match = offShelfCategories.find(item => item.label === value)
                handleCategorySelect(match?.id ?? '')
              }}
              columns="grid-cols-2"
            />

            <FieldLabel label="SKU Selection" />
            <div className="rounded-lg border border-outline bg-[#f7f9fb] px-3 py-2.5">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Search size={14} />
                <input
                  value={draft.searchTerm}
                  onChange={event => updateDraft('searchTerm', event.target.value)}
                  placeholder="Search SKU"
                  className="w-full bg-transparent text-[13px] text-on-surface outline-none placeholder:text-[#7f8b99]"
                />
              </div>
            </div>
            <div className="space-y-2">
              {filteredProducts.slice(0, 4).map(product => {
                const recommended = agentforceEnabled && draft.location && product.recommendedLocations.includes(draft.location)
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductSelect(product.id)}
                    className={clsx(
                      'w-full rounded-lg border px-3 py-2.5 text-left',
                      draft.skuId === product.id
                        ? 'border-[#b7d5f6] bg-[#edf4ff]'
                        : 'border-outline bg-surface-lowest'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-on-surface">{product.name}</p>
                        <p className="mt-1 text-[11px] text-on-surface-variant">{product.subtitle}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {recommended && (
                          <span className="rounded-md border border-[#c9d8ea] bg-[#edf4ff] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                            {product.basePoints >= 9 ? 'High Impact' : 'Recommended'}
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-[#1f5f33]">
                          +{getProductPotential(product, draft.location, draft.quantity).toFixed(1)} pts potential
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <FieldLabel label="Quantity" />
            <SegmentGrid
              values={offShelfQuantityOptions.map(value => formatQuantityOption(value))}
              selectedValue={draft.quantity === '' ? '' : formatQuantityOption(draft.quantity)}
              onSelect={value => updateDraft('quantity', parseQuantityOption(value))}
              columns="grid-cols-3"
            />

            <ImpactPreviewCard
              location={draft.location}
              sku={selectedProduct?.name ?? ''}
              quantity={quantityLabel}
              estimatedLgor={draftImpact?.estimatedLgor ?? null}
              impactPoints={draftImpact?.impactPoints ?? null}
              projectedScore={draftImpact ? projectedScore : null}
            />

            <FieldLabel label="Is this part of base plan?" />
            <SegmentGrid
              values={classificationOptions.map(item => item.label)}
              selectedValue={classificationOptions.find(item => item.id === draft.classification)?.label ?? ''}
              onSelect={value => {
                const match = classificationOptions.find(item => item.label === value)
                updateDraft('classification', match?.id ?? 'incremental')
              }}
              columns="grid-cols-3"
            />
            <p className="text-[11px] text-on-surface-variant">{classificationPrompt}</p>

            <FieldLabel label="Photo Evidence" />
            <div className={clsx(
              'rounded-lg border px-3 py-3',
              draft.photoCaptured ? 'border-[#cde8d3] bg-[#edf7ee]' : 'border-[#f9d6d0] bg-[#fef1ee]'
            )}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={clsx('text-[11px] font-semibold uppercase tracking-[0.14em]', draft.photoCaptured ? 'text-[#1f5f33]' : 'text-[#8e030f]')}>
                    Photo Required
                  </p>
                  <p className={clsx('text-[12px] mt-1', draft.photoCaptured ? 'text-[#1f5f33]' : 'text-[#8e030f]')}>
                    Attach image to verify display. Required before submission.
                  </p>
                </div>
                <span className={clsx(
                  'rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
                  draft.photoCaptured ? 'border-[#cde8d3] bg-white text-[#1f5f33]' : 'border-[#f9d6d0] bg-white text-[#8e030f]'
                )}>
                  {draft.photoCaptured ? 'Uploaded' : 'Missing'}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <label className={clsx(
                  'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md px-3 text-[12px] font-semibold',
                  draft.photoCaptured ? 'border border-[#cde8d3] bg-white text-[#1f5f33]' : 'bg-primary text-white'
                )}>
                  {draft.photoCaptured ? <Image size={14} /> : <Camera size={14} />}
                  {draft.photoCaptured ? 'Retake Photo' : 'Capture Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const file = event.target.files?.[0] ?? null
                      handleDraftPhoto(file)
                      event.target.value = ''
                    }}
                  />
                </label>
                {draft.photoCaptured && (
                  <button
                    type="button"
                    onClick={() => handleDraftPhoto(null)}
                    className="rounded-md border border-[#f9d6d0] bg-white px-3 py-2 text-[12px] font-semibold text-[#8e030f]"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            {draft.photoPreviewUrl && (
              <div className="overflow-hidden rounded-lg border border-outline bg-[#f7f9fb]">
                <img src={draft.photoPreviewUrl} alt="Off-shelf evidence preview" className="h-40 w-full object-cover" />
              </div>
            )}
            {draft.photoName && <p className="text-[11px] text-on-surface-variant">{draft.photoName}</p>}
            <input
              value={draft.caption}
              onChange={event => updateDraft('caption', event.target.value)}
              placeholder="Add caption for evidence"
              className="min-h-10 w-full rounded-lg border border-outline bg-surface-lowest px-3 text-[13px] text-on-surface outline-none placeholder:text-[#7f8b99]"
            />

            <FieldLabel label="Notes" />
            <textarea
              value={draft.notes}
              onChange={event => updateDraft('notes', event.target.value)}
              placeholder="Short observations for the store record"
              rows={3}
              className="w-full rounded-lg border border-outline bg-surface-lowest px-3 py-2.5 text-[13px] text-on-surface outline-none placeholder:text-[#7f8b99]"
            />
          </SectionCard>

          <SectionCard title="Live Impact Panel" subtitle="Real-time score feedback from the current entry.">
            {draftImpact && selectedProduct ? (
              <div className="space-y-2.5">
                <div className="rounded-lg border border-[#c9d8ea] bg-[#edf4ff] px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Impact Preview</p>
                  <div className="mt-3 space-y-2">
                    <PreviewRow label="Location" value={draft.location} />
                    <PreviewRow label="SKU" value={selectedProduct.name} />
                    <PreviewRow label="Quantity" value={quantityLabel || String(draft.quantity)} />
                    <PreviewRow label="LGOR Contribution" value={`+${draftImpact.estimatedLgor}%`} positive />
                    <PreviewRow label="Score Impact" value={`+${draftImpact.impactPoints} pts`} positive />
                    <PreviewRow label="Projected Score" value={projectedScore.toFixed(1)} positive />
                  </div>
                </div>
                <ImpactRow label="Selected SKU + location" value={`${selectedProduct.name} • ${draft.location}`} />
                <ImpactRow label="Quantity" value={`${draft.quantity}`} />
                <ImpactRow label="Estimated LGOR Lift" value={`+${draftImpact.estimatedLgor}%`} positive />
                <ImpactRow label="Points Added" value={`+${draftImpact.impactPoints} pts`} positive />
                <ImpactRow label="Multiplier Applied" value={`${draftImpact.multiplier.toFixed(2)}x • ${draftImpact.multiplierLabel}`} />
                <ImpactRow label="Projected New Score" value={projectedScore.toFixed(1)} positive />
              </div>
            ) : (
              <p className="text-[12px] text-on-surface-variant">
                Select location, category, SKU, quantity, and classification to calculate projected score impact.
              </p>
            )}
          </SectionCard>

          {agentforceEnabled && (
            <SectionCard
              title="Top Opportunities for This Store"
              subtitle={`You can gain +${potentialAdditionalGain.toFixed(1)} points from the best remaining actions.`}
              open={showRecommendations}
              onToggle={() => setShowRecommendations(prev => !prev)}
              utility={(
                <div className="inline-flex items-center gap-1 rounded-md border border-[#c9d8ea] bg-[#edf4ff] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                  <Sparkles size={11} />
                  Agentforce ranked
                </div>
              )}
            >
              <div className="space-y-2">
                {remainingRecommendations.map(item => (
                  <div key={`${item.skuId}:${item.location}`} className="flex items-start justify-between gap-3 rounded-lg border border-outline bg-[#f7f9fb] px-3 py-3">
                    <div>
                      <p className="text-[13px] font-semibold text-on-surface">
                        {item.product?.name} to {item.location}
                      </p>
                      <p className="mt-1 text-[11px] text-on-surface-variant">{item.rationale}</p>
                      <p className="mt-1 text-[11px] font-medium text-[#1f5f33]">Add {item.location} display to gain +{item.potentialPoints.toFixed(1)} pts</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => applyRecommendation(item)}
                      className="rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-white"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          <SectionCard
            title={visitType === 'follow-up' ? 'Revisit Change Log' : 'Added in This Visit'}
            subtitle={offShelf.length > 0
              ? visitType === 'follow-up'
                ? `${retainedEntries.length} retained or updated | ${removedEntries.length} removed | ${addedEntries.length} added during this follow-up.`
                : `${offShelf.length} display records saved for this visit.`
              : offShelfConfirmed
                ? visitType === 'follow-up'
                  ? 'Previous displays were reviewed with no additional displays added.'
                  : 'No incremental off-shelf displays were confirmed for this visit.'
                : 'No display records saved yet.'}
            open={showCaptured}
            onToggle={() => setShowCaptured(prev => !prev)}
          >
            <div className="space-y-2">
              {offShelf.map((entry, index) => (
                <div key={entry.id} className="rounded-lg border border-outline bg-surface-lowest px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Display {index + 1}</p>
                      <p className="text-[13px] font-semibold text-on-surface">{entry.location} | {entry.product} | {getOffShelfQuantityLabel(entry.quantity)}</p>
                      <p className="mt-1 text-[12px] text-on-surface">{entry.product}</p>
                      <p className="mt-1 text-[11px] text-on-surface-variant">
                        Qty {entry.quantity} | {entry.classification === 'incremental' ? 'Incremental' : entry.classification === 'base-plan' ? 'Base Plan' : 'Not Sure'}
                      </p>
                    </div>
                    <span className="rounded-md border border-[#cde8d3] bg-[#edf7ee] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1f5f33]">
                      {formatFollowUpStatus(entry.status)}
                    </span>
                  </div>
                  {entry.photoPreviewUrl && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-outline bg-[#f7f9fb]">
                      <img src={entry.photoPreviewUrl} alt={`${entry.product} evidence`} className="h-28 w-full object-cover" />
                    </div>
                  )}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <MiniMetric label="Impact" value={`+${entry.impactPoints.toFixed(1)} pts`} positive />
                    <MiniMetric label="Photo" value={entry.photoCaptured ? 'Captured' : 'Missing'} positive={entry.photoCaptured} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <InlineAction icon={<Edit3 size={12} />} label="Edit" onClick={() => handleEdit(entry)} />
                    <InlineAction icon={<Copy size={12} />} label={visitType === 'follow-up' ? 'Additional' : 'Duplicate'} onClick={() => visitType === 'follow-up' ? handleAddAdditional(entry) : duplicateOffShelfEntry(entry.id)} />
                    <InlineAction
                      icon={<Trash2 size={12} />}
                      label={visitType === 'follow-up' && entry.origin === 'previous-visit' ? 'Gone' : 'Delete'}
                      onClick={() => visitType === 'follow-up' && entry.origin === 'previous-visit'
                        ? handleMarkFollowUpEntry(entry, 'removed')
                        : removeOffShelfEntry(entry.id)}
                      destructive
                    />
                  </div>
                </div>
              ))}

              {offShelf.length === 0 && (
                <div className="rounded-lg border border-dashed border-outline bg-[#f7f9fb] px-3 py-4 text-[12px] text-on-surface-variant">
                  {visitType === 'follow-up'
                    ? 'Review the loaded displays or add a new one if the follow-up uncovered an additional placement.'
                    : 'Capture a new display or mark that no incremental opportunity was found during this visit.'}
                </div>
              )}
            </div>
          </SectionCard>
          {agentforceEnabled && (
            <TrellisAskButton
              active={trellisOpen}
              onClick={() => setTrellisOpen(prev => !prev)}
              title={trellisRecommendation.title}
              summary={trellisRecommendation.supportingText}
              items={[
                `Impact: ${trellisRecommendation.impactLabel}`,
                `LGOR: ${trellisRecommendation.lgorLabel}`,
                `Next move: ${trellisRecommendation.suggestedNextMove}`,
              ]}
            />
          )}

        </div>
      </div>

      <div className="shrink-0 border-t border-outline bg-surface-lowest px-4 py-3 pb-6">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleSaveEntry(false)}
            disabled={!canSaveEntry}
            className={clsx(
              'min-h-11 rounded-lg px-3 text-[12px] font-semibold',
              canSaveEntry ? 'bg-primary text-white' : 'bg-[#c9d8ea] text-white'
            )}
          >
            {editingId ? 'Save Change' : 'Save Entry'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!canSaveEntry) return
              handleSaveEntry()
            }}
            disabled={!canSaveEntry}
            className={clsx(
              'min-h-11 rounded-lg px-3 text-[12px] font-semibold',
              canSaveEntry ? 'bg-[#014486] text-white' : 'bg-[#c9d8ea] text-white'
            )}
          >
            {visitType === 'follow-up' ? 'Add Another' : 'Add Another'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/photo')}
            className="min-h-11 rounded-lg bg-primary px-3 text-[12px] font-semibold text-white"
          >
            Next: Evidence
          </button>
        </div>
        <p className="mt-2 text-[11px] text-on-surface-variant">{footerHelper}</p>
      </div>
    </PhoneShell>
  )
}

function SectionCard({
  title,
  subtitle,
  utility,
  children,
  open = true,
  onToggle,
}: {
  title: string
  subtitle: string
  utility?: ReactNode
  children: ReactNode
  open?: boolean
  onToggle?: () => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-outline bg-surface-lowest">
      <div className="border-b border-outline px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onToggle}
            className={clsx('flex-1 min-w-0 text-left', onToggle ? 'cursor-pointer' : 'cursor-default')}
          >
            <p className="text-[13px] font-semibold text-on-surface">{title}</p>
            <p className="mt-1 text-[11px] text-on-surface-variant">{subtitle}</p>
          </button>
          <div className="flex items-center gap-2">
            {utility}
            {onToggle && (
              <button
                type="button"
                onClick={onToggle}
                className="rounded-md border border-outline p-1.5 text-on-surface-variant"
                aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
              >
                {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>
      {open && <div className="space-y-3 px-4 py-3">{children}</div>}
    </div>
  )
}

function FieldLabel({ label }: { label: string }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">{label}</p>
}

function SegmentGrid({
  values,
  selectedValue,
  onSelect,
  columns,
}: {
  values: string[]
  selectedValue: string
  onSelect: (value: string) => void
  columns: string
}) {
  return (
    <div className={clsx('grid gap-1 rounded-lg border border-[#d8dde6] bg-[#f7f9fb] p-1', columns)}>
      {values.map(value => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          className={clsx(
            'min-h-10 rounded-md border px-3 text-[12px] font-semibold transition-colors',
            selectedValue === value
              ? 'border-[#014486] bg-[#0176d3] text-white'
              : 'border-transparent bg-white text-[#2e3a47]'
          )}
        >
          {value}
        </button>
      ))}
    </div>
  )
}

function BandMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-[58px] min-w-0 flex-col justify-between rounded-lg border border-outline bg-[#f7f9fb] px-2 py-2 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
      <p className="mt-1 text-[14px] font-semibold text-on-surface leading-tight">{value}</p>
    </div>
  )
}

function ScoreCell({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'neutral' | 'positive'
}) {
  return (
    <div className="rounded-lg border border-outline bg-[#f7f9fb] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
      <p className={clsx('mt-1 text-[15px] font-semibold', tone === 'positive' ? 'text-[#1f5f33]' : 'text-on-surface')}>
        {value}
      </p>
    </div>
  )
}

function InsightCell({
  label,
  value,
  lines,
}: {
  label: string
  value: string
  lines: string[]
}) {
  return (
    <div className="rounded-lg border border-[#c9d8ea] bg-[#edf4ff] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">{label}</p>
      <p className="mt-1 text-[15px] font-semibold text-primary">{value}</p>
      <div className="mt-2 space-y-1">
        {lines.map(line => (
          <p key={line} className="text-[10px] text-[#014486]">{line}</p>
        ))}
      </div>
    </div>
  )
}

function formatQuantityOption(value: number | string) {
  const numeric = typeof value === 'number' ? value : value === '400+' ? 400 : Number(value)

  if (numeric >= 400) return 'Bulk (400+)'
  if (numeric >= 200) return 'Pallet (200)'
  if (numeric >= 120) return 'Large (120)'
  if (numeric >= 80) return 'Medium (80)'
  return 'Small (40)'
}

function resolveCategoryId(category: string) {
  return offShelfCategories.find(item => item.label === category || item.id === category)?.id ?? ''
}

function formatFollowUpStatus(status: OffShelfEntry['status']) {
  return {
    saved: 'Saved',
    'pending-review': 'Pending',
    retained: 'Retained',
    updated: 'Updated',
    removed: 'Removed',
    added: 'Added',
  }[status]
}

function followUpStatusTone(status: OffShelfEntry['status']) {
  return {
    saved: 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]',
    'pending-review': 'border-[#ead7b1] bg-[#f9f2e7] text-[#8b5d00]',
    retained: 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]',
    updated: 'border-[#c9d8ea] bg-[#edf4ff] text-primary',
    removed: 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]',
    added: 'border-[#c9d8ea] bg-[#edf4ff] text-primary',
  }[status]
}

function parseQuantityOption(value: string) {
  return {
    'Small (40)': 40,
    'Medium (80)': 80,
    'Large (120)': 120,
    'Pallet (200)': 200,
    'Bulk (400+)': '400+',
  }[value] ?? 40
}

function getProductPotential(product: NonNullable<ReturnType<typeof getOffShelfProductById>>, location: string, quantity: number | string | '') {
  const fallbackLocation = location || product.recommendedLocations[0] || 'Racetrack'
  const fallbackQuantity = quantity === '' ? 80 : quantity

  return estimateOffShelfImpact({
    product,
    location: fallbackLocation,
    quantity: fallbackQuantity,
    classification: 'incremental',
  }).impactPoints
}

function ImpactPreviewCard({
  location,
  sku,
  quantity,
  estimatedLgor,
  impactPoints,
  projectedScore,
}: {
  location: string
  sku: string
  quantity: string
  estimatedLgor: number | null
  impactPoints: number | null
  projectedScore: number | null
}) {
  return (
    <div className="rounded-lg border border-[#c9d8ea] bg-[#edf4ff] px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Impact Preview</p>
      {impactPoints !== null && projectedScore !== null ? (
        <div className="mt-3 space-y-2">
          <PreviewRow label="Location" value={location} />
          <PreviewRow label="SKU" value={sku} />
          <PreviewRow label="Quantity" value={quantity} />
          <PreviewRow label="LGOR Contribution" value={`+${estimatedLgor?.toFixed(1)}%`} positive />
          <PreviewRow label="Score Impact" value={`+${impactPoints.toFixed(1)} pts`} positive />
          <PreviewRow label="Projected Score" value={projectedScore.toFixed(1)} positive />
        </div>
      ) : (
        <p className="mt-2 text-[12px] text-[#014486]">Select location, SKU, and quantity to see real-time score impact.</p>
      )}
    </div>
  )
}

function PreviewRow({
  label,
  value,
  positive = false,
}: {
  label: string
  value: string
  positive?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[12px] text-[#014486]">{label}</p>
      <p className={clsx('text-[12px] font-semibold', positive ? 'text-[#1f5f33]' : 'text-on-surface')}>{value}</p>
    </div>
  )
}

function ImpactRow({
  label,
  value,
  positive = false,
}: {
  label: string
  value: string
  positive?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-outline/80 pb-2 last:border-b-0 last:pb-0">
      <p className="text-[12px] text-on-surface-variant">{label}</p>
      <p className={clsx('text-[12px] font-semibold', positive ? 'text-[#1f5f33]' : 'text-on-surface')}>{value}</p>
    </div>
  )
}

function MiniMetric({
  label,
  value,
  positive = false,
}: {
  label: string
  value: string
  positive?: boolean
}) {
  return (
    <div className="rounded-md border border-outline bg-[#f7f9fb] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
      <p className={clsx('mt-1 text-[12px] font-semibold', positive ? 'text-[#1f5f33]' : 'text-on-surface')}>
        {value}
      </p>
    </div>
  )
}

function InlineAction({
  icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold',
        destructive
          ? 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]'
          : 'border-outline bg-[#f7f9fb] text-on-surface-variant'
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function FollowUpDecisionButton({
  icon,
  label,
  onClick,
  active = false,
  destructive = false,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
  active?: boolean
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex min-h-9 items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-semibold transition-colors',
        destructive
          ? active
            ? 'border-[#f2a8a0] bg-[#fef1ee] text-[#8e030f]'
            : 'border-[#f9d6d0] bg-white text-[#8e030f]'
          : active
            ? 'border-[#c9d8ea] bg-[#edf4ff] text-primary'
            : 'border-outline bg-white text-on-surface-variant'
      )}
    >
      {icon}
      {label}
    </button>
  )
}
