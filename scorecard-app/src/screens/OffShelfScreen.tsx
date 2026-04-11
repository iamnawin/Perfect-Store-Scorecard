import { useState, type ChangeEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import {
  Camera,
  CircleEllipsis,
  Copy,
  Edit3,
  Image,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { PhoneShell } from '../components/PhoneShell'
import { TopBar } from '../components/TopBar'
import { TrellisBot } from '../components/TrellisBot'
import { useApp } from '../context/useApp'
import {
  offShelfCategories,
  offShelfLocations,
  offShelfProducts,
  offShelfQuantityOptions,
  scorecardSections,
  store,
  trellisContent,
} from '../data/mock'
import {
  estimateOffShelfImpact,
  getOffShelfOpportunityScore,
  getOffShelfIncrementalScore,
  getOffShelfProductById,
  getPotentialAdditionalGain,
  getRemainingOffShelfRecommendations,
} from '../lib/scorecard'
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
  { id: 'base-plan', label: 'Base Plan' },
  { id: 'incremental', label: 'Incremental' },
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
  const {
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
    saveDraft,
    lastSavedAt,
    trellisEnabled,
  } = useApp()

  const [draft, setDraft] = useState<DraftState>(createEmptyDraft())
  const [editingId, setEditingId] = useState<string | null>(null)

  const sectionNumber = scorecardSections.findIndex(section => section.id === 'off-shelf-capture') + 1
  const selectedCategory = offShelfCategories.find(item => item.id === draft.category)
  const selectedProduct = draft.skuId ? getOffShelfProductById(draft.skuId) : undefined

  const filteredProducts = offShelfProducts
    .filter(product => !draft.category || product.categoryId === draft.category)
    .filter(product => {
      const query = draft.searchTerm.trim().toLowerCase()
      if (!query) return true
      return `${product.name} ${product.subtitle}`.toLowerCase().includes(query)
    })
    .sort((left, right) => {
      const leftRecommended = draft.location && left.recommendedLocations.includes(draft.location) ? 1 : 0
      const rightRecommended = draft.location && right.recommendedLocations.includes(draft.location) ? 1 : 0
      if (leftRecommended !== rightRecommended) return rightRecommended - leftRecommended
      return right.basePoints - left.basePoints
    })

  const currentIncremental = getOffShelfIncrementalScore(offShelf)
  const currentOpportunityScore = getOffShelfOpportunityScore(offShelf)
  const potentialAdditionalGain = getPotentialAdditionalGain(offShelf)
  const remainingRecommendations = getRemainingOffShelfRecommendations(offShelf).slice(0, 4)

  const draftImpact = selectedProduct && draft.location && draft.quantity !== ''
    ? estimateOffShelfImpact({
        product: selectedProduct,
        location: draft.location,
        quantity: draft.quantity,
        classification: draft.classification,
      })
    : null

  const canSaveEntry = Boolean(
    draft.location &&
    draft.category &&
    draft.skuId &&
    draft.quantity !== '' &&
    draftImpact
  )

  const footerHelper = editingId
    ? 'Update this display record, then continue to evidence review.'
    : lastSavedAt
      ? `Draft saved at ${lastSavedAt}`
      : 'Use quick selections to capture incremental displays in under three minutes.'

  function updateDraft<K extends keyof DraftState>(key: K, value: DraftState[K]) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  function resetDraft() {
    if (draft.photoPreviewUrl) {
      URL.revokeObjectURL(draft.photoPreviewUrl)
    }
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

  function handleProductSelect(productId: string) {
    setDraft(prev => ({
      ...prev,
      skuId: productId,
      searchTerm: '',
    }))
  }

  function handleSaveEntry() {
    if (!selectedProduct || !draftImpact || !canSaveEntry) return

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
      status: 'saved',
    }

    if (editingId) {
      updateOffShelfEntry(entry)
    } else {
      addOffShelfEntry(entry)
    }

    resetDraft()
  }

  function handleEdit(entry: OffShelfEntry) {
    if (draft.photoPreviewUrl && draft.photoPreviewUrl !== entry.photoPreviewUrl) {
      URL.revokeObjectURL(draft.photoPreviewUrl)
    }
    setEditingId(entry.id)
    setDraft({
      location: entry.location,
      category: offShelfCategories.find(item => item.label === entry.category)?.id ?? '',
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

  function applyRecommendation(recommendation: (typeof remainingRecommendations)[number]) {
    const product = recommendation.product
    if (!product) return

    if (draft.photoPreviewUrl) {
      URL.revokeObjectURL(draft.photoPreviewUrl)
    }

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
    setDraft(prev => {
      if (prev.photoPreviewUrl) {
        URL.revokeObjectURL(prev.photoPreviewUrl)
      }

      if (!file) {
        return {
          ...prev,
          photoCaptured: false,
          photoName: '',
          photoPreviewUrl: '',
        }
      }

      return {
        ...prev,
        photoCaptured: true,
        photoName: file.name,
        photoPreviewUrl: URL.createObjectURL(file),
      }
    })
  }

  return (
    <PhoneShell>
      <TopBar
        title="Off-Shelf Opportunity Capture"
        subtitle={`${store.name} | ${store.visitStatus} Visit`}
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

      <div className="flex-1 overflow-y-auto bg-[#f4f6f9] pb-2">
        <div className="sticky top-0 z-10 border-b border-outline bg-surface-lowest">
          <div className="px-4 py-3 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <BandMetric label="Complete" value={`${completionPercent}%`} />
              <BandMetric label="Answered" value={`${answeredChecks} / ${totalChecks}`} />
              <BandMetric label="Step" value={`${sectionNumber} of ${totalSections}`} />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-on-surface-variant">
                <span>Step {sectionNumber} of {totalSections}: Off-Shelf Opportunity Capture</span>
                <span>{completionPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#dde3ea]">
                <div className="h-full rounded-full bg-primary" style={{ width: `${completionPercent}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-outline pt-3">
              <ScoreCell label="Current Score" value={currentOpportunityScore.toFixed(1)} tone="neutral" />
              <ScoreCell label="Base Plan" value="100.0" tone="neutral" />
              <ScoreCell label="Incremental Off-Shelf" value={`+${currentIncremental.toFixed(1)}`} tone="positive" />
              <ScoreCell label="Potential Additional Gain" value={`+${potentialAdditionalGain.toFixed(1)}`} tone="positive" />
            </div>
          </div>
        </div>

        <div className="px-4 py-3 space-y-3">
          {trellisEnabled && (
            <TrellisBot
              title={trellisContent.offShelf.title}
              insight={trellisContent.offShelf.insight}
              prompts={trellisContent.offShelf.prompts}
            />
          )}

          <SectionCard
            title={editingId ? 'Edit Off-Shelf Display' : 'Add Off-Shelf Display'}
            subtitle="Capture incremental displays above base plan, attach evidence, and score the impact in real time."
            utility={(
              <button
                type="button"
                onClick={confirmOffShelfReview}
                className="rounded-md border border-outline px-2.5 py-1.5 text-[11px] font-semibold text-on-surface-variant"
              >
                No display today
              </button>
            )}
          >
            <FieldLabel label="Display Location" />
            <SegmentGrid
              values={offShelfLocations}
              selectedValue={draft.location}
              onSelect={value => updateDraft('location', value)}
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
                const recommended = draft.location && product.recommendedLocations.includes(draft.location)
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
                      {recommended && (
                        <span className="rounded-md border border-[#cde8d3] bg-[#edf7ee] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1f5f33]">
                          Recommended
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <FieldLabel label="Quantity" />
            <SegmentGrid
              values={offShelfQuantityOptions.map(value => String(value))}
              selectedValue={draft.quantity === '' ? '' : String(draft.quantity)}
              onSelect={value => updateDraft('quantity', value === '400+' ? value : Number(value))}
              columns="grid-cols-3"
            />

            <FieldLabel label="Classification" />
            <SegmentGrid
              values={classificationOptions.map(item => item.label)}
              selectedValue={classificationOptions.find(item => item.id === draft.classification)?.label ?? ''}
              onSelect={value => {
                const match = classificationOptions.find(item => item.label === value)
                updateDraft('classification', match?.id ?? 'incremental')
              }}
              columns="grid-cols-3"
            />

            <FieldLabel label="Photo Evidence" />
            <div className="flex items-center gap-2 flex-wrap">
              <label className={clsx(
                'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-[12px] font-semibold',
                draft.photoCaptured ? 'bg-[#edf7ee] text-[#1f5f33]' : 'bg-primary text-white'
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
                  className="rounded-md border border-[#f9d6d0] bg-[#fef1ee] px-3 py-2 text-[12px] font-semibold text-[#8e030f]"
                >
                  Remove
                </button>
              )}
              <span className={clsx(
                'rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
                draft.photoCaptured ? 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]' : 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]'
              )}>
                {draft.photoCaptured ? 'Captured' : 'Required'}
              </span>
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

          <SectionCard title="Live Impact" subtitle="Real-time score feedback from the current entry.">
            {draftImpact && selectedProduct ? (
              <div className="space-y-2.5">
                <ImpactRow label="Selected SKU + location" value={`${selectedProduct.name} • ${draft.location}`} />
                <ImpactRow label="Quantity" value={`${draft.quantity}`} />
                <ImpactRow label="Estimated LGOR Lift" value={`+${draftImpact.estimatedLgor}%`} positive />
                <ImpactRow label="Points Added" value={`+${draftImpact.impactPoints} pts`} positive />
                <ImpactRow label="Multiplier Applied" value={`${draftImpact.multiplier.toFixed(2)}x • ${draftImpact.multiplierLabel}`} />
                <ImpactRow label="Projected New Score" value={(currentOpportunityScore + draftImpact.impactPoints).toFixed(1)} positive />
              </div>
            ) : (
              <p className="text-[12px] text-on-surface-variant">
                Select location, category, SKU, quantity, and classification to calculate projected score impact.
              </p>
            )}
          </SectionCard>

          <SectionCard
            title="Top Opportunities for This Store"
            subtitle={store.motto}
            utility={(
              <div className="inline-flex items-center gap-1 rounded-md border border-[#c9d8ea] bg-[#edf4ff] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                <Sparkles size={11} />
                Prior-year informed
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
                    <p className="mt-1 text-[11px] font-medium text-[#1f5f33]">Potential gain +{item.potentialPoints.toFixed(1)} pts</p>
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

          <SectionCard
            title="Captured Off-Shelf Displays"
            subtitle={offShelf.length > 0
              ? `${offShelf.length} display records saved for this visit.`
              : offShelfConfirmed
                ? 'No incremental off-shelf displays were confirmed for this visit.'
                : 'No display records saved yet.'}
          >
            <div className="space-y-2">
              {offShelf.map(entry => (
                <div key={entry.id} className="rounded-lg border border-outline bg-surface-lowest px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-semibold text-on-surface">{entry.location} • {entry.category}</p>
                      <p className="mt-1 text-[12px] text-on-surface">{entry.product}</p>
                      <p className="mt-1 text-[11px] text-on-surface-variant">
                        Qty {entry.quantity} • {entry.classification === 'incremental' ? 'Incremental' : entry.classification === 'base-plan' ? 'Base Plan' : 'Not Sure'}
                      </p>
                    </div>
                    <span className="rounded-md border border-[#cde8d3] bg-[#edf7ee] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1f5f33]">
                      {entry.status}
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
                    <InlineAction icon={<Copy size={12} />} label="Duplicate" onClick={() => duplicateOffShelfEntry(entry.id)} />
                    <InlineAction icon={<Trash2 size={12} />} label="Delete" onClick={() => removeOffShelfEntry(entry.id)} destructive />
                  </div>
                </div>
              ))}

              {offShelf.length === 0 && (
                <div className="rounded-lg border border-dashed border-outline bg-[#f7f9fb] px-3 py-4 text-[12px] text-on-surface-variant">
                  Capture a new display or mark that no incremental opportunity was found during this visit.
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="shrink-0 border-t border-outline bg-surface-lowest px-4 py-3 pb-6">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={editingId ? resetDraft : saveDraft}
            className="min-h-11 rounded-lg border border-outline bg-surface-low px-3 text-[12px] font-semibold text-on-surface-variant"
          >
            {editingId ? 'Cancel' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={handleSaveEntry}
            disabled={!canSaveEntry}
            className={clsx(
              'min-h-11 rounded-lg px-3 text-[12px] font-semibold',
              canSaveEntry ? 'bg-[#0176d3] text-white' : 'bg-[#c9d8ea] text-white'
            )}
          >
            {editingId ? 'Save Entry' : 'Add Another'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/summary')}
            className="min-h-11 rounded-lg bg-primary px-3 text-[12px] font-semibold text-white"
          >
            {editingId ? 'Next' : 'Review Score →'}
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
}: {
  title: string
  subtitle: string
  utility?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-outline bg-surface-lowest">
      <div className="border-b border-outline px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-on-surface">{title}</p>
            <p className="mt-1 text-[11px] text-on-surface-variant">{subtitle}</p>
          </div>
          {utility}
        </div>
      </div>
      <div className="space-y-3 px-4 py-3">{children}</div>
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
    <div className={clsx('grid gap-2', columns)}>
      {values.map(value => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          className={clsx(
            'min-h-10 rounded-lg border px-3 text-[12px] font-semibold',
            selectedValue === value
              ? 'border-[#b7d5f6] bg-[#edf4ff] text-primary'
              : 'border-outline bg-[#f7f9fb] text-on-surface-variant'
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
    <div className="rounded-lg border border-outline bg-[#f7f9fb] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
      <p className="mt-1 text-[15px] font-semibold text-on-surface">{value}</p>
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
