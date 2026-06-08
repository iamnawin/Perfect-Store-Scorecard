import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import {
  Camera,
  ChevronDown,
  ChevronUp,
  CircleEllipsis,
  Copy,
  Edit3,
  Image,
  Search,
  ScanLine,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { PhoneShell } from '../components/PhoneShell'
import { RevisitBanner } from '../components/RevisitBanner'
import { TopBar } from '../components/TopBar'
import { TrellisAskButton, TrellisInsightCard } from '../components/TrellisBot'
import { useApp } from '../context/useApp'
import {
  offShelfCategories,
  offShelfLocations,
  offShelfProducts,
  store,
} from '../data/mock'
import { analyzeSecondaryDisplay } from '../lib/agentforce/secondaryDisplayClient'
import {
  calculateOffShelfUnits,
  estimateOffShelfImpact,
  getBasePlanLgorPoints,
  getChecklistBasePlanScore,
  getCurrentSectionNumber,
  getOffShelfIncrementalScore,
  getOffShelfProductById,
  getOffShelfEntryUnits,
  parseOffShelfQuantity,
  getPotentialAdditionalGain,
  getRemainingOffShelfRecommendations,
  getVisitTypeLabel,
} from '../lib/scorecard'
import { answerTrellisChat, getOffShelfInsight, getRevisitIntelligence } from '../lib/trellis'
import type { AgentforceSecondaryDisplayAnalysis, OffShelfClassification, OffShelfEntry, ScorecardVersionItem } from '../types'

interface DraftState {
  location: string
  category: string
  skuId: string
  quantity: number | string | ''
  quantityUnit: NonNullable<OffShelfEntry['quantityUnit']>
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
    quantityUnit: 'eaches',
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
    checklist,
    offShelf,
    offShelfConfirmed,
    addOffShelfEntry,
    updateOffShelfEntry,
    duplicateOffShelfEntry,
    removeOffShelfEntry,
    completionPercent,
    answeredChecks,
    totalChecks,
    totalSections,
    lastSavedAt,
    agentforceEnabled,
    secondaryDisplayImage,
    audioNoteFile,
    setSecondaryDisplayImage,
    setAudioNoteFile,
    showToast,
    scorecardVersion,
    sourceScorecard,
  } = app

  const [draft, setDraft] = useState<DraftState>(createEmptyDraft())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showCaptured, setShowCaptured] = useState(true)
  const [trellisOpen, setTrellisOpen] = useState(false)
  const [agentforcePrefillStatus, setAgentforcePrefillStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [agentforcePrefill, setAgentforcePrefill] = useState<AgentforceSecondaryDisplayAnalysis | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannedSkuIds, setScannedSkuIds] = useState<string[]>([])
  const editorRef = useRef<HTMLDivElement | null>(null)

  const sectionNumber = getCurrentSectionNumber(app)
  const visitTypeLabel = getVisitTypeLabel(visitType)
  const selectedCategory = offShelfCategories.find(item => item.id === draft.category)
  const selectedProduct = draft.skuId ? getOffShelfProductById(draft.skuId) : undefined
  const addedEntries = offShelf.filter(entry => entry.status === 'added')
  const removedEntries = offShelf.filter(entry => entry.status === 'removed')
  const updatedEntries = offShelf.filter(entry => entry.status === 'updated')
  const previousEntries = offShelf.filter(entry => entry.origin === 'previous-visit')

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
  const basePlanScore = getChecklistBasePlanScore(checklist)
  const basePlanLgorPoints = getBasePlanLgorPoints(checklist)
  const editingEntry = editingId ? offShelf.find(entry => entry.id === editingId) : null
  const editingImpact = editingEntry?.impactPoints ?? 0
  const draftImpact = selectedProduct && draft.location && draft.quantity !== ''
    ? estimateOffShelfImpact({
        product: selectedProduct,
        location: draft.location,
        quantity: draft.quantity,
        quantityUnit: draft.quantityUnit,
        classification: draft.classification,
      })
    : null
  const liveIncremental = +(currentIncremental - editingImpact + (draftImpact?.impactPoints ?? editingImpact)).toFixed(1)
  const projectedScore = +(basePlanScore + basePlanLgorPoints + liveIncremental).toFixed(1)
  const potentialAdditionalGain = getPotentialAdditionalGain(offShelf)
  const remainingRecommendations = getRemainingOffShelfRecommendations(offShelf).slice(0, 4)
  const calculatedDraftUnits = selectedProduct && draft.quantity !== ''
    ? calculateOffShelfUnits({ product: selectedProduct, quantity: draft.quantity, unit: draft.quantityUnit })
    : 0
  const quantityLabel = draft.quantity === ''
    ? ''
    : `${draft.quantity} ${formatQuantityUnit(draft.quantityUnit)} (${calculatedDraftUnits} eaches)`
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

  useEffect(() => {
    if (!editingId) return
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [editingId])

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

  function handleMockScan(productId: string) {
    setScannedSkuIds(prev => prev.includes(productId) ? prev : [...prev, productId])
    handleProductSelect(productId)
    setScannerOpen(false)
    showToast('Product scanned.', 'Mock scanner added the SKU to the selected list.')
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
      quantityUnit: draft.quantityUnit,
      calculatedOffShelfUnits: draftImpact.normalizedQuantity,
      quantityEstimate: draft.quantityUnit === 'lot-bulk',
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
    if (visitType === 'follow-up' && entry.origin === 'previous-visit') {
      handleMarkFollowUpEntry(entry, 'updated')
    }

    setEditingId(entry.id)
    setDraft({
      location: entry.location,
      category: resolveCategoryId(entry.category),
      skuId: entry.skuId,
      quantity: entry.quantity,
      quantityUnit: entry.quantityUnit ?? 'eaches',
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

  function handleAddAdditional() {
    resetDraft()
    queueMicrotask(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
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
      quantityUnit: 'eaches',
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

  async function handleGenerateAgentforcePrefill() {
    if (!agentforceEnabled || !secondaryDisplayImage) return

    setAgentforcePrefillStatus('running')
    const allowedCatalog = offShelfProducts.map(product => product.name)

    try {
      const analysis = await analyzeSecondaryDisplay({
        visitType,
        retailerOrBanner: store.banner,
        businessUnit: 'PSS MVP',
        allowedCatalog,
        imageFile: secondaryDisplayImage,
        audioFile: audioNoteFile,
      })

      setAgentforcePrefill(analysis)
      setAgentforcePrefillStatus(analysis.analysisStatus === 'success' ? 'success' : 'error')
      if (analysis.analysisStatus === 'success') {
        showToast('Agentforce draft ready.', 'Review the suggested products and tap one to prefill.')
      } else {
        showToast('Agentforce draft failed.', 'Continue with manual entry.')
      }
    } catch {
      setAgentforcePrefill(null)
      setAgentforcePrefillStatus('error')
      showToast('Agentforce draft failed.', 'Continue with manual entry.')
    }
  }

  function handleUseAgentforceSuggestion(productName: string) {
    const product = offShelfProducts.find(item => item.name === productName)
    if (!product) {
      showToast('Suggestion needs review.', 'This item does not match the allowed catalog.')
      return
    }

    setDraft(prev => ({
      ...prev,
      category: product.categoryId,
      skuId: product.id,
      searchTerm: '',
      location: prev.location || product.recommendedLocations[0] || '',
      classification: 'incremental',
    }))
    showToast('Draft updated.', 'Finish location and quantity, then save the entry.')
  }

  return (
    <PhoneShell>
      <div data-scroll-to-top="true" className="flex-1 overflow-y-auto bg-[#f4f6f9] pb-2">
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
                    ? `${previousEntries.length} previously submitted ${previousEntries.length === 1 ? 'display' : 'displays'} prefilled | Step ${sectionNumber} of ${totalSections}`
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
          <RevisitBanner sourceScorecard={sourceScorecard} activeScorecard={scorecardVersion} />

          {agentforceEnabled && (
            <SectionCard
              title="Agentforce Prefill (MVP)"
              subtitle="Capture a secondary display photo (and optional voice note) to generate a draft incremental product list for review."
            >
              <div className="space-y-3">
                <div className="rounded-lg border border-outline bg-[#f7f9fb] px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Secondary display image</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 rounded-md border border-outline bg-surface-lowest px-3 py-2 text-[12px] font-semibold text-on-surface-variant">
                      <Camera size={14} />
                      {secondaryDisplayImage ? 'Retake photo' : 'Capture photo'}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const file = event.target.files?.[0] ?? null
                          setSecondaryDisplayImage(file)
                          event.target.value = ''
                        }}
                      />
                    </label>
                    {secondaryDisplayImage && (
                      <button
                        type="button"
                        onClick={() => setSecondaryDisplayImage(null)}
                        className="rounded-md border border-[#f9d6d0] bg-[#fef1ee] px-3 py-2 text-[12px] font-semibold text-[#8e030f]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {secondaryDisplayImage && (
                    <p className="mt-2 text-[12px] text-on-surface-variant">Selected: {secondaryDisplayImage.name}</p>
                  )}
                </div>

                <div className="rounded-lg border border-outline bg-[#f7f9fb] px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Voice note (optional)</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 rounded-md border border-outline bg-surface-lowest px-3 py-2 text-[12px] font-semibold text-on-surface-variant">
                      <Sparkles size={14} />
                      {audioNoteFile ? 'Replace audio' : 'Upload audio'}
                      <input
                        type="file"
                        accept="audio/*,.mp3"
                        className="hidden"
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const file = event.target.files?.[0] ?? null
                          setAudioNoteFile(file)
                          event.target.value = ''
                        }}
                      />
                    </label>
                    {audioNoteFile && (
                      <button
                        type="button"
                        onClick={() => setAudioNoteFile(null)}
                        className="rounded-md border border-[#f9d6d0] bg-[#fef1ee] px-3 py-2 text-[12px] font-semibold text-[#8e030f]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {audioNoteFile && (
                    <p className="mt-2 text-[12px] text-on-surface-variant">Selected: {audioNoteFile.name}</p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={!secondaryDisplayImage || agentforcePrefillStatus === 'running'}
                    onClick={handleGenerateAgentforcePrefill}
                    className={clsx(
                      'inline-flex items-center justify-center rounded-md px-3 py-2 text-[12px] font-semibold',
                      !secondaryDisplayImage || agentforcePrefillStatus === 'running'
                        ? 'bg-[#dde3ea] text-[#52606d]'
                        : 'bg-primary text-white'
                    )}
                  >
                    {agentforcePrefillStatus === 'running' ? 'Generating…' : 'Generate draft list'}
                  </button>
                  <span className="text-[12px] text-on-surface-variant">
                    {agentforcePrefillStatus === 'success'
                      ? 'Draft ready'
                      : agentforcePrefillStatus === 'error'
                        ? 'Draft failed (manual entry available)'
                        : 'Optional'}
                  </span>
                </div>

                {agentforcePrefill?.analysisStatus === 'success' && agentforcePrefill.products.length > 0 && (
                  <div className="rounded-lg border border-outline bg-surface-lowest px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Suggested products</p>
                    <div className="mt-2 space-y-2">
                      {agentforcePrefill.products.map((product) => (
                        <div key={product.productName} className="flex items-center justify-between gap-3 rounded-md border border-outline bg-[#f7f9fb] px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-on-surface truncate">{product.productName}</p>
                            <p className="text-[11px] text-on-surface-variant mt-0.5">
                              {product.brand ? `${product.brand} • ` : ''}{product.confidence.toUpperCase()} • {product.quantityEstimate}
                              {product.status === 'needs_review' ? ' • needs review' : ''}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={!product.matchedCatalog}
                            onClick={() => handleUseAgentforceSuggestion(product.productName)}
                            className={clsx(
                              'shrink-0 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold',
                              product.matchedCatalog
                                ? 'border-[#c9d8ea] bg-[#edf4ff] text-primary'
                                : 'border-[#dde3ea] bg-[#f4f6f9] text-[#52606d]'
                            )}
                          >
                            Use
                          </button>
                        </div>
                      ))}
                    </div>
                    {agentforcePrefill.notes.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {agentforcePrefill.notes.map((note) => (
                          <p key={note} className="text-[11px] text-on-surface-variant">{note}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          <SectionCard title="Score Impact" subtitle="Current score state for this visit.">
            <div className="grid grid-cols-2 gap-2">
              <ScoreCell label="Current Score" value={projectedScore.toFixed(1)} tone="neutral" />
              <ScoreCell label="Execution" value={basePlanScore.toFixed(1)} tone="neutral" />
              <ScoreCell label="Base LGOR" value={basePlanLgorPoints.toFixed(1)} tone="neutral" />
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

          <div ref={editorRef}>
            <SectionCard
              title={editingId
                ? editingEntry?.origin === 'previous-visit' ? 'Update Previous Display' : 'Edit Added Display'
                : visitType === 'follow-up' ? 'Add Display' : 'Add Incremental Display'}
              subtitle={visitType === 'follow-up'
                ? 'Use the same display form. Previous values are prefilled; edit only what changed.'
                : 'Capture Above & Beyond displays and score the incremental impact.'}
              utility={visitType === 'follow-up' ? (
                <button
                  type="button"
                  onClick={() => handleAddAdditional()}
                  className="rounded-md border border-outline px-2.5 py-1.5 text-[11px] font-semibold text-on-surface-variant"
                >
                  Clear Form
                </button>
              ) : undefined}
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

            <FieldLabel label="Scanner / Manual SKU Selection" />
            <div className="rounded-lg border border-outline bg-surface-lowest px-3 py-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setScannerOpen(prev => !prev)}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 text-[12px] font-semibold text-white"
                >
                  <ScanLine size={14} />
                  Scan Products
                </button>
                <button
                  type="button"
                  onClick={() => setScannerOpen(false)}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md border border-outline bg-white px-3 text-[12px] font-semibold text-on-surface"
                >
                  <Search size={14} />
                  Manual SKU Search
                </button>
              </div>
              {scannerOpen && (
                <div className="mt-3 rounded-lg border border-[#c9d8ea] bg-[#edf4ff] p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Mock Scanner</p>
                  <div className="mt-2 space-y-2">
                    {filteredProducts.slice(0, 3).map(product => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleMockScan(product.id)}
                        className="w-full rounded-md border border-[#c9d8ea] bg-white px-3 py-2 text-left"
                      >
                        <p className="text-[12px] font-semibold text-on-surface">{product.name}</p>
                        <p className="mt-0.5 text-[11px] text-on-surface-variant">{product.skuNumber ?? product.id}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {scannedSkuIds.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Selected / Scanned Products</p>
                  {scannedSkuIds.map(productId => {
                    const product = getOffShelfProductById(productId)
                    if (!product) return null
                    return (
                      <div key={productId} className="flex items-center justify-between gap-2 rounded-md border border-outline bg-[#f7f9fb] px-3 py-2">
                        <button
                          type="button"
                          onClick={() => handleProductSelect(product.id)}
                          className="min-w-0 text-left"
                        >
                          <p className="truncate text-[12px] font-semibold text-on-surface">{product.name}</p>
                          <p className="text-[11px] text-on-surface-variant">{product.skuNumber ?? product.id}</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setScannedSkuIds(prev => prev.filter(id => id !== productId))}
                          className="rounded-md border border-outline bg-white px-2 py-1 text-[11px] font-semibold text-on-surface-variant"
                        >
                          Remove
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <FieldLabel label="Manual SKU Search" />
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
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                type="number"
                min="0"
                value={draft.quantity}
                onChange={event => updateDraft('quantity', event.target.value === '' ? '' : Number(event.target.value))}
                placeholder="Enter quantity"
                className="min-h-10 rounded-lg border border-outline bg-surface-lowest px-3 text-[13px] text-on-surface outline-none placeholder:text-[#7f8b99]"
              />
              <select
                value={draft.quantityUnit}
                onChange={event => updateDraft('quantityUnit', event.target.value as DraftState['quantityUnit'])}
                className="min-h-10 rounded-lg border border-outline bg-surface-lowest px-2 text-[12px] font-semibold text-on-surface outline-none"
              >
                <option value="eaches">Eaches</option>
                <option value="cases">Cases</option>
                <option value="pallets">Pallets</option>
                <option value="lot-bulk">Lot / Bulk</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['eaches', 'cases', 'pallets', 'lot-bulk'] as const).map(unit => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => updateDraft('quantityUnit', unit)}
                  className={clsx(
                    'rounded-md border px-2.5 py-1.5 text-[11px] font-semibold',
                    draft.quantityUnit === unit
                      ? 'border-[#b7d5f6] bg-[#edf4ff] text-primary'
                      : 'border-outline bg-white text-on-surface-variant'
                  )}
                >
                  {formatQuantityUnit(unit)}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Calculated off-shelf units: {selectedProduct && draft.quantity !== '' ? calculatedDraftUnits : 0} eaches
              {draft.quantityUnit === 'lot-bulk' ? ' (estimate)' : ''}
            </p>

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

            <FieldLabel label="Optional Photo" />
            <div className={clsx(
              'rounded-lg border px-3 py-3',
              draft.photoCaptured ? 'border-[#cde8d3] bg-[#edf7ee]' : 'border-outline bg-[#f7f9fb]'
            )}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={clsx('text-[11px] font-semibold uppercase tracking-[0.14em]', draft.photoCaptured ? 'text-[#1f5f33]' : 'text-on-surface-variant')}>
                    Optional Documentation
                  </p>
                  <p className={clsx('text-[12px] mt-1', draft.photoCaptured ? 'text-[#1f5f33]' : 'text-on-surface-variant')}>
                    Attach an image when useful for manager review. Photos do not block submit.
                  </p>
                </div>
                <span className={clsx(
                  'rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
                  draft.photoCaptured ? 'border-[#cde8d3] bg-white text-[#1f5f33]' : 'border-outline bg-white text-on-surface-variant'
                )}>
                  {draft.photoCaptured ? 'Uploaded' : 'Optional'}
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
          </div>

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
                    <PreviewRow label="Peak Week Ratio" value={`${draftImpact.peakWeekRatio.toFixed(2)}x`} />
                    <PreviewRow label="Projected Score" value={projectedScore.toFixed(1)} positive />
                  </div>
                </div>
                <ImpactRow label="Selected SKU + location" value={`${selectedProduct.name} • ${draft.location}`} />
                <ImpactRow label="Quantity" value={`${draft.quantity}`} />
                <ImpactRow label="Estimated LGOR Lift" value={`+${draftImpact.estimatedLgor}%`} positive />
                <ImpactRow label="Points Added" value={`+${draftImpact.impactPoints} pts`} positive />
                <ImpactRow label="Peak Week Units" value={`${draftImpact.peakWeekUnits}`} />
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
            title={visitType === 'follow-up' ? 'Displays' : 'Added in This Visit'}
            subtitle={offShelf.length > 0
              ? visitType === 'follow-up'
                ? `${previousEntries.length} previously submitted prefilled | ${updatedEntries.length} edited | ${removedEntries.length} removed | ${addedEntries.length} added.`
                : `${offShelf.length} display records saved for this visit.`
              : offShelfConfirmed
                ? visitType === 'follow-up'
                  ? 'No displays are currently saved in this revisit.'
                  : 'No incremental off-shelf displays were confirmed for this visit.'
                : 'No display records saved yet.'}
            open={showCaptured}
            onToggle={() => setShowCaptured(prev => !prev)}
          >
            <div className="space-y-2">
              {offShelf.map((entry, index) => (
                <SkuCalculationCard
                  key={entry.id}
                  entry={entry}
                  index={index}
                  revisitMode={visitType === 'follow-up'}
                  previousItem={findPreviousVersionItem(entry, sourceScorecard.items)}
                  onEdit={() => handleEdit(entry)}
                  onDuplicate={() => duplicateOffShelfEntry(entry.id)}
                  onRemove={() => visitType === 'follow-up' && entry.origin === 'previous-visit'
                    ? handleMarkFollowUpEntry(entry, 'removed')
                    : removeOffShelfEntry(entry.id)}
                />
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
              mode="chat"
              title={trellisRecommendation.title}
              summary={trellisRecommendation.supportingText}
              items={[
                `Impact: ${trellisRecommendation.impactLabel}`,
                `LGOR: ${trellisRecommendation.lgorLabel}`,
                `Next move: ${trellisRecommendation.suggestedNextMove}`,
              ]}
              suggestions={[
                'What should I do next?',
                'Explain my score breakdown.',
                'Give me a talk track for the store manager.',
                'Why did you rank this display first?',
                'Summarize this recommendation.',
              ]}
              onAsk={(message) => answerTrellisChat({ state: app, screen: 'off-shelf', message })}
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

function SkuCalculationCard({
  entry,
  index,
  revisitMode,
  previousItem,
  onEdit,
  onDuplicate,
  onRemove,
}: {
  entry: OffShelfEntry
  index: number
  revisitMode: boolean
  previousItem?: ScorecardVersionItem
  onEdit: () => void
  onDuplicate: () => void
  onRemove: () => void
}) {
  const product = getOffShelfProductById(entry.skuId)
  const calculatedUnits = getOffShelfEntryUnits(entry)
  const peakWeekUnits = product?.peakWeekUnits ?? 0
  const peakWeekRatio = peakWeekUnits > 0 ? +(calculatedUnits / peakWeekUnits).toFixed(2) : 0
  const peakWeekMultiplier = Math.round(entry.multiplier)
  const planType = getPlanTypeLabel(entry)
  const recommendation = getRecommendationStatus(entry, product, calculatedUnits)
  const previousQuantity = previousItem?.quantityPrevious ?? (entry.origin === 'previous-visit' ? entry.quantity : null)
  const previousImpact = previousItem?.scorePrevious ?? (entry.origin === 'previous-visit' ? entry.impactPoints : 0)
  const previousMultiplier = getPreviousMultiplier(previousItem, product, entry)
  const currentImpact = entry.status === 'removed' ? 0 : entry.impactPoints
  const currentQuantity = entry.status === 'removed' ? null : entry.quantity
  const quantityUnit = formatQuantityUnit(entry.quantityUnit)
  const scoreDelta = +(currentImpact - previousImpact).toFixed(1)

  return (
    <div className="rounded-lg border border-outline bg-surface-lowest px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Display {index + 1}</p>
          <p className="mt-1 text-[13px] font-semibold leading-snug text-on-surface">SKU: {entry.product}</p>
          <p className="mt-1 text-[12px] text-on-surface-variant">
            {product?.skuNumber ? `${product.skuNumber} | ` : ''}Location: {entry.location}
          </p>
        </div>
        <StatusBadge label={formatDisplayStatus(entry)} tone={entry.status === 'removed' ? 'danger' : 'success'} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <StatusBadge label={planType} tone={entry.classification === 'incremental' ? 'info' : 'neutral'} />
        <StatusBadge label={`${peakWeekMultiplier}x Peak Week`} tone={peakWeekMultiplier > 0 ? 'success' : 'warning'} />
        <StatusBadge label={recommendation.status} tone={recommendation.tone} />
        {revisitMode && (
          <StatusBadge label={getChangeBadge(scoreDelta, entry.status)} tone={scoreDelta > 0 ? 'success' : scoreDelta < 0 || entry.status === 'removed' ? 'danger' : 'neutral'} />
        )}
      </div>

      {entry.photoPreviewUrl && (
        <div className="mt-3 overflow-hidden rounded-lg border border-outline bg-[#f7f9fb]">
          <img src={entry.photoPreviewUrl} alt={`${entry.product} evidence`} className="h-28 w-full object-cover" />
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniMetric label="Quarterly Value" value={formatCurrencyShort(product?.quarterlySalesValue)} positive={Boolean(product?.quarterlySalesValue)} />
        <MiniMetric label="LGOR %" value={`${entry.estimatedLgor.toFixed(1)}%`} positive={entry.estimatedLgor > 0} />
        <MiniMetric label="Peak Week Units" value={peakWeekUnits ? String(peakWeekUnits) : 'N/A'} />
        <MiniMetric label="Entered Quantity" value={`${entry.quantity} ${quantityUnit}`} />
        <MiniMetric label="Quantity UOM" value={quantityUnit} />
        <MiniMetric label="Calculated Units" value={String(calculatedUnits)} />
        <MiniMetric label="Peak Week Ratio" value={`${peakWeekRatio.toFixed(2)}x`} />
        <MiniMetric label="Incremental Points" value={entry.classification === 'incremental' ? `${entry.impactPoints.toFixed(1)} pts` : 'N/A'} positive={entry.impactPoints > 0} />
        <MiniMetric label="Photo" value={entry.photoCaptured ? 'Captured' : 'Optional'} positive={entry.photoCaptured} />
      </div>

      <div className="mt-3 rounded-lg border border-[#c9d8ea] bg-[#edf4ff] px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Calculation</p>
        <p className="mt-1 text-[12px] font-semibold text-[#014486]">{getCalculationLine(entry, peakWeekMultiplier)}</p>
        <p className="mt-1 text-[11px] text-[#014486]">{recommendation.message}</p>
      </div>

      {revisitMode && (
        <div className="mt-3 rounded-lg border border-outline bg-[#f7f9fb] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Revisit Comparison</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <MiniMetric label="Previous Quantity" value={previousQuantity === null ? 'None' : String(previousQuantity)} />
            <MiniMetric label="Current Quantity" value={currentQuantity === null ? 'Removed' : String(currentQuantity)} />
            <MiniMetric label="Change" value={formatQuantityChange(previousQuantity, currentQuantity)} positive={scoreDelta > 0} />
            <MiniMetric label="Score Change" value={formatSignedPoints(scoreDelta)} positive={scoreDelta > 0} />
            <MiniMetric label="Previous Multiplier" value={`${previousMultiplier}x`} />
            <MiniMetric label="Current Multiplier" value={`${entry.status === 'removed' ? 0 : peakWeekMultiplier}x`} positive={peakWeekMultiplier > previousMultiplier && entry.status !== 'removed'} />
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <InlineAction icon={<Edit3 size={12} />} label="Edit" onClick={onEdit} />
        <InlineAction icon={<Copy size={12} />} label="Duplicate" onClick={onDuplicate} />
        <InlineAction
          icon={<Trash2 size={12} />}
          label={revisitMode && entry.origin === 'previous-visit' ? 'Remove' : 'Delete'}
          onClick={onRemove}
          destructive
        />
      </div>
    </div>
  )
}

function findPreviousVersionItem(entry: OffShelfEntry, items: ScorecardVersionItem[]) {
  return items.find(item => item.skuId === entry.skuId && item.executionPrevious === 'Completed')
}

function getPlanTypeLabel(entry: OffShelfEntry) {
  if (entry.classification === 'base-plan') return 'Base Plan'
  if (entry.classification === 'incremental') return 'Incremental'
  return 'Other'
}

function getRecommendationStatus(
  entry: OffShelfEntry,
  product: ReturnType<typeof getOffShelfProductById>,
  calculatedUnits: number,
): { status: string; message: string; tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral' } {
  if (entry.status === 'removed') {
    return {
      status: 'Missing',
      message: 'Recommended SKU not added off-shelf. Score Impact: 0 for MVP.',
      tone: 'danger',
    }
  }

  if (entry.classification !== 'incremental') {
    return {
      status: 'Empty Calories',
      message: 'This SKU is not part of the recommended plan for this store/cluster. Score Impact: 0 for MVP.',
      tone: 'warning',
    }
  }

  if (product && calculatedUnits < product.peakWeekUnits) {
    return {
      status: 'Not Enough',
      message: 'Quantity is below recommended / below Peak Week threshold. Score Impact: 0 or configurable.',
      tone: 'warning',
    }
  }

  if (entry.impactPoints > 0) {
    return {
      status: 'Completed',
      message: `Points earned: ${entry.impactPoints.toFixed(1)}.`,
      tone: 'success',
    }
  }

  return {
    status: 'Opportunity',
    message: 'Recommended high-value SKU for this store plan.',
    tone: 'info',
  }
}

function getCalculationLine(entry: OffShelfEntry, peakWeekMultiplier: number) {
  if (entry.classification === 'incremental') {
    return `${entry.estimatedLgor.toFixed(1)} LGOR x ${peakWeekMultiplier}x Peak Week = ${entry.impactPoints.toFixed(1)} points`
  }

  if (entry.classification === 'base-plan') {
    return `Base Plan LGOR contribution: ${entry.estimatedLgor.toFixed(1)}. Peak Week multiplier not applied.`
  }

  return 'Score Impact: 0 pending plan classification.'
}

function getPreviousMultiplier(
  previousItem: ScorecardVersionItem | undefined,
  product: ReturnType<typeof getOffShelfProductById>,
  entry: OffShelfEntry,
) {
  if (!previousItem?.quantityPrevious || !product) return entry.origin === 'previous-visit' ? Math.round(entry.multiplier) : 0
  const previousUnits = parseOffShelfQuantity(previousItem.quantityPrevious)
  if (product.peakWeekUnits <= 0) return 0
  if (previousUnits / product.peakWeekUnits >= 3) return 3
  if (previousUnits / product.peakWeekUnits >= 2) return 2
  if (previousUnits / product.peakWeekUnits >= 1) return 1
  return 0
}

function formatQuantityUnit(unit: OffShelfEntry['quantityUnit']) {
  if (unit === 'cases') return 'Cases'
  if (unit === 'pallets') return 'Pallets'
  if (unit === 'lot-bulk') return 'Lot / Bulk'
  return 'Eaches'
}

function formatCurrencyShort(value?: number) {
  if (!value) return 'N/A'
  if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`
  return `$${value.toLocaleString()}`
}

function formatQuantityChange(previous: number | string | null, current: number | string | null) {
  if (previous === null && current === null) return 'No Change'
  if (previous === null) return `+${parseOffShelfQuantity(current ?? 0)} units`
  if (current === null) return `-${parseOffShelfQuantity(previous)} units`

  const delta = parseOffShelfQuantity(current) - parseOffShelfQuantity(previous)
  if (delta > 0) return `+${delta} units`
  if (delta < 0) return `${delta} units`
  return 'No Change'
}

function formatSignedPoints(value: number) {
  if (value > 0) return `+${value.toFixed(1)} points`
  if (value < 0) return `${value.toFixed(1)} points`
  return 'No Change'
}

function getChangeBadge(scoreDelta: number, status: OffShelfEntry['status']) {
  if (status === 'removed' || scoreDelta < 0) return 'Declined'
  if (scoreDelta > 0) return 'Improved'
  return 'No Change'
}

function StatusBadge({
  label,
  tone,
}: {
  label: string
  tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}) {
  return (
    <span className={clsx(
      'inline-flex min-h-6 items-center rounded-md border px-2 py-1 text-[10px] font-semibold uppercase leading-none tracking-[0.08em]',
      tone === 'success' && 'border-[#cde8d3] bg-[#edf7ee] text-[#1f5f33]',
      tone === 'warning' && 'border-[#f5d78a] bg-[#fdf5e4] text-[#7a4800]',
      tone === 'danger' && 'border-[#f9d6d0] bg-[#fef1ee] text-[#8e030f]',
      tone === 'info' && 'border-[#c9d8ea] bg-[#edf4ff] text-primary',
      tone === 'neutral' && 'border-outline bg-[#f7f9fb] text-on-surface-variant',
    )}>
      {label}
    </span>
  )
}

function resolveCategoryId(category: string) {
  return offShelfCategories.find(item => item.label === category || item.id === category)?.id ?? ''
}

function formatDisplayStatus(entry: OffShelfEntry) {
  if (entry.status === 'removed') return 'Removed'
  if (entry.status === 'updated') return 'Edited'
  if (entry.status === 'added') return 'New'
  if (entry.origin === 'previous-visit') return 'Previously Submitted'
  return 'Saved'
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

