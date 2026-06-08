import { useEffect, useState, useMemo, type ReactNode } from 'react'
import type { AppState, ChecklistAnswer, ChecklistState, OffShelfEntry, OffShelfProduct, PerfectStoreScorecard, ScorecardVersionItem, ScorecardVersionRecord, VisitType, UploadedFile, ChatterPostStatus, CsvUploadSummary, CsvSkuContext } from '../types'
import { AppContext } from './app-context'
import { checklistQuestions, offShelfProducts, perfectStoreScorecards, previousOffShelfSeed, previousSnapshot, store } from '../data/mock'

import {
  buildRevisitComparison,
  createRevisitFromScorecard,
  submitRevisit,
} from '../lib/scorecardVersioning'
import { findActivePerfectScorecard } from '../lib/perfectStoreScorecard'
import {
  estimateOffShelfImpact,
  createInitialEvidenceState,
  getAnsweredChecks,
  getCapturedRequiredPhotos,
  getCompletionPercent,
  getMissingRequiredEvidence,
  getOffShelfProductById,
  getRequiredPhotoCount,
  getScorecardStatus,
  getTotalChecks,
  getTotalSections,
  generateSkuTags,
  generateRecommendations,
  recalculateScorecard,
} from '../lib/scorecard'

function generateCsvSummary(file: File, activeScorecard?: PerfectStoreScorecard): CsvUploadSummary {
  const isMatch = file.name.toLowerCase().includes('q1') || file.name.toLowerCase().includes('2026')
  
  // In a real app, we would parse the CSV file here.
  // For the MVP, we simulate matching based on the store context.
  const matchedSkus: Record<string, CsvSkuContext> = {}
  
  // Simulate some matched SKUs if the file name matches the context
  if (isMatch) {
    offShelfProducts.slice(0, 10).forEach((product: OffShelfProduct, index: number) => {
      matchedSkus[product.id] = {
        sku: product.id,
        skuName: product.name,
        cluster: 'Midwest Core',
        planType: index % 4 === 0 ? 'Base Plan' : 'Incremental',
        lgor: product.baseLgor,
        pyPos: product.baseLgor * 1000,
        peakWeekUnits: product.peakWeekUnits,
        recommendedDisplay: product.recommendedLocations[0] || 'Endcap',
        multiplier: index % 5 === 0 ? 3 : 1,
        priority: product.baseLgor > 5 ? 'High' : 'Medium',
        isClusterMatch: true,
        isBasePlan: index % 4 === 0,
        isIncremental: index % 4 !== 0,
      }
    })
  }

  return {
    fileName: file.name,
    uploadedAt: new Date().toISOString(),
    rowsLoaded: isMatch ? 248 : 0,
    currentStoreCode: store.sapNumber,
    currentStoreName: store.name,
    quarter: activeScorecard?.quarter ?? 'Q1',
    fiscalYear: activeScorecard?.fiscalYear ?? 2026,
    currentStoreMatch: {
      found: isMatch,
      matchedStoreCode: isMatch ? store.sapNumber : 'NO_MATCH',
      matchedStoreName: isMatch ? store.name : 'Unknown',
      matchedCluster: isMatch ? 'Midwest Core' : 'None',
      matchingSkusCount: Object.keys(matchedSkus).length,
    },
    dataAvailability: {
      basePlanSkus: isMatch,
      incrementalSkus: isMatch,
      lgorData: isMatch,
      peakWeekData: isMatch,
      multiplierData: isMatch,
    },
    debugDetails: {
      totalStores: isMatch ? 42 : 0,
      totalSkus: isMatch ? 156 : 0,
      totalRows: isMatch ? 248 : 0,
    },
    matchedRows: isMatch ? [{ store: store.sapNumber, cluster: 'Midwest Core' }] : [],
    matchedSkus,
  }
}

function createOffShelfEntryWithTags(entry: OffShelfEntry): OffShelfEntry {
  const product = getOffShelfProductById(entry.skuId)
  const { tags, explanations } = generateSkuTags(entry, product)
  
  return {
    ...entry,
    tags,
    tagExplanations: explanations,
    priorityTag: tags.includes('High') ? 'High' : tags.includes('Medium') ? 'Medium' : tags.includes('Low') ? 'Low' : undefined,
    multiplierTag: tags.includes('3x') ? '3x' : tags.includes('2x') ? '2x' : null,
    planType: entry.classification === 'incremental' ? 'Incremental' : 'Base Plan',
    riskLevel: tags.includes('Risk') ? 'High' : 'None',
    opportunityTag: tags.includes('Opportunity'),
    peakWeekTag: tags.includes('Peak Week'),
    clusterMatch: tags.includes('Cluster Match'),
  }
}

function createPreviousChecklistState(): ChecklistState {
  return checklistQuestions.reduce<ChecklistState>((acc, question) => {
    acc[question.id] = question.id === 'garden-doors' ? 'no' : 'yes'
    return acc
  }, {})
}

function createFollowUpSeedEntries(): OffShelfEntry[] {
  return previousOffShelfSeed.flatMap(seed => {
    const product = getOffShelfProductById(seed.skuId)
    if (!product) return []
    const categoryLabel = {
      'turf-builder': 'Turf Builder',
      'ez-seed': 'EZ Seed',
      'thickr-lawn': "Thick'R Lawn",
      'rapid-grass': 'Rapid Grass',
      'classic': 'Classic',
      'om-scotts': 'O.M. Scott & Sons',
    }[product.categoryId] ?? product.categoryId

    const impact = estimateOffShelfImpact({
      product,
      location: seed.location,
      quantity: seed.quantity,
      quantityUnit: 'eaches',
      classification: seed.classification,
    })

    return [createOffShelfEntryWithTags({
      id: crypto.randomUUID(),
      location: seed.location,
      category: categoryLabel,
      skuId: product.id,
      product: product.name,
      quantity: seed.quantity,
      quantityUnit: 'eaches',
      calculatedOffShelfUnits: impact.normalizedQuantity,
      classification: seed.classification,
      photoCaptured: false,
      photoName: '',
      photoPreviewUrl: '',
      caption: seed.caption,
      notes: seed.notes,
      estimatedLgor: impact.estimatedLgor,
      impactPoints: impact.impactPoints,
      multiplier: impact.multiplier,
      multiplierLabel: impact.multiplierLabel,
      origin: 'previous-visit',
      status: 'saved',
    })]
  })
}

function createSourceScorecardRecord(activeScorecard?: PerfectStoreScorecard): ScorecardVersionRecord {
  const previousEntries = createFollowUpSeedEntries()
  const executionScore = 70
  const basePlanScore = 26.3
  const incrementalScore = +(previousSnapshot.score - executionScore - basePlanScore).toFixed(1)

  return {
    id: 'pss-v1-submitted',
    storeId: 'store-1907',
    storeName: store.name,
    quarter: activeScorecard?.quarter ?? 'Q1',
    fiscalYear: activeScorecard?.fiscalYear ?? 2026,
    season: activeScorecard?.season ?? 'Spring 2026',
    scorecardStatus: 'Submitted',
    versionNumber: 1,
    parentScorecardId: activeScorecard?.id,
    isRevisit: false,
    createdAt: '2026-03-12T09:30:00.000Z',
    submittedAt: '2026-03-12T15:30:00.000Z',
    submittedBy: previousSnapshot.submittedBy,
    previousScore: null,
    currentScore: previousSnapshot.score,
    scoreDelta: 0,
    executionScore,
    basePlanScore,
    incrementalScore,
    combinedScore: previousSnapshot.score,
    revisitNotes: '',
    revisitReason: '',
    changedFieldsSummary: [],
    items: previousEntries.map(entry => createVersionItemFromOffShelfEntry(entry, 'pss-v1-submitted')),
    chatterPostStatus: 'Not Posted',
  }
}

function createInitialDraftScorecard(sourceScorecard: ScorecardVersionRecord, activeScorecard?: PerfectStoreScorecard): ScorecardVersionRecord {
  return {
    ...sourceScorecard,
    id: 'pss-current-draft',
    scorecardStatus: 'Draft',
    versionNumber: sourceScorecard.versionNumber + 1,
    parentScorecardId: activeScorecard?.id,
    sourceScorecardId: undefined,
    isRevisit: false,
    createdAt: new Date().toISOString(),
    submittedAt: null,
    previousScore: sourceScorecard.combinedScore,
    currentScore: sourceScorecard.combinedScore,
    scoreDelta: 0,
    revisitNotes: '',
    revisitReason: '',
    changedFieldsSummary: [],
    items: [],
  }
}

function createVersionItemFromOffShelfEntry(entry: OffShelfEntry, scorecardId: string): ScorecardVersionItem {
  const currentQuantity = entry.status === 'removed' ? null : entry.quantity

  return {
    id: `version-item-${entry.id}`,
    scorecardId,
    skuId: entry.skuId,
    skuName: entry.product,
    category: 'Off-Shelf Display',
    previousValue: entry.origin === 'previous-visit' ? entry.quantity : null,
    currentValue: currentQuantity,
    changed: entry.status !== 'saved',
    changeType: 'No Change',
    quantityPrevious: entry.origin === 'previous-visit' ? entry.quantity : null,
    quantityCurrent: currentQuantity,
    offShelfPrevious: entry.origin === 'previous-visit',
    offShelfCurrent: entry.status !== 'removed',
    executionPrevious: entry.origin === 'previous-visit' ? 'Completed' : null,
    executionCurrent: entry.status === 'removed' ? 'Removed' : 'Completed',
    recommendationPrevious: entry.origin === 'previous-visit' ? entry.caption || entry.notes : '',
    recommendationCurrent: entry.caption || entry.notes,
    scorePrevious: entry.origin === 'previous-visit' ? entry.impactPoints : 0,
    scoreCurrent: entry.status === 'removed' ? 0 : entry.impactPoints,
  }
}

function createVersionItemsFromState(scorecardId: string, entries: OffShelfEntry[]) {
  return entries.map(entry => createVersionItemFromOffShelfEntry(entry, scorecardId))
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeScorecardResult] = useState(() => findActivePerfectScorecard(perfectStoreScorecards))
  const activePerfectScorecard = activeScorecardResult.scorecard ?? undefined
  const [sourceScorecard] = useState<ScorecardVersionRecord>(() => createSourceScorecardRecord(activePerfectScorecard))
  const [visitType, setVisitTypeState] = useState<VisitType>('initial')
  const [checklist, setChecklist] = useState<AppState['checklist']>({})
  const [questionNotes, setQuestionNotes] = useState<AppState['questionNotes']>({})
  const [offShelf, setOffShelf] = useState<OffShelfEntry[]>([])
  const [offShelfConfirmed, setOffShelfConfirmed] = useState(false)
  const [evidence, setEvidence] = useState<AppState['evidence']>(() => createInitialEvidenceState())
  const [secondaryDisplayImage, setSecondaryDisplayImageState] = useState<File | null>(null)
  const [audioNoteFile, setAudioNoteFileState] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [revisitReason, setRevisitReason] = useState('')
  const [revisitRequired, setRevisitRequiredState] = useState(false)
  const [shelfResetNeeded, setShelfResetNeededState] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [agentforceEnabled, setAgentforceEnabled] = useState(false)
  const [toast, setToast] = useState<AppState['toast']>(null)
  const [celebration, setCelebration] = useState<AppState['celebration']>(null)

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [storePlanMap, setStorePlanMap] = useState<UploadedFile | null>(null)
  const [chatterPostStatus, setChatterPostStatus] = useState<ChatterPostStatus>('Not Posted')
  const [csvSummary, setCsvSummary] = useState<AppState['csvSummary']>(null)

  const [scorecardVersion, setScorecardVersion] = useState<ScorecardVersionRecord>(() => createInitialDraftScorecard(sourceScorecard, activePerfectScorecard))
  const [versionHistory, setVersionHistory] = useState<ScorecardVersionRecord[]>(() => [sourceScorecard])
  const [revisitComparison, setRevisitComparison] = useState<AppState['revisitComparison']>(null)

  const appState: AppState = useMemo(() => ({
    visitType,
    checklist,
    questionNotes,
    offShelf,
    offShelfConfirmed,
    evidence,
    secondaryDisplayImage,
    audioNoteFile,
    notes,
    revisitReason,
    revisitRequired,
    shelfResetNeeded,
    lastSavedAt,
    submitted,
    agentforceEnabled,
    toast,
    celebration,
    scorecardVersion,
    sourceScorecard,
    versionHistory,
    revisitComparison,
    activeScorecardResult,
    storePlanMap,
    csvSummary,
  }), [
    visitType, checklist, questionNotes, offShelf, offShelfConfirmed, evidence,
    secondaryDisplayImage, audioNoteFile, notes, revisitReason, revisitRequired,
    shelfResetNeeded, lastSavedAt, submitted, agentforceEnabled, toast, celebration,
    scorecardVersion, sourceScorecard, versionHistory, revisitComparison,
    activeScorecardResult, storePlanMap, csvSummary
  ])

  const recalculated = useMemo(() => recalculateScorecard(appState), [appState])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!celebration) return
    const timer = window.setTimeout(() => setCelebration(null), 2400)
    return () => window.clearTimeout(timer)
  }, [celebration])

  function triggerToast(title: string, message: string) {
    setToast({
      id: Date.now(),
      title,
      message,
    })
  }

  function showToast(title: string, message: string) {
    triggerToast(title, message)
  }

  function setVisitType(nextVisitType: VisitType) {
    if (activeScorecardResult.state !== 'active') {
      triggerToast('Scorecard unavailable.', activeScorecardResult.message)
      return
    }

    if (nextVisitType === 'follow-up') {
      createRevisitFromSubmitted()
      return
    }

    const draft = createInitialDraftScorecard(sourceScorecard, activeScorecardResult.scorecard)
    setVisitTypeState(nextVisitType)
    setChecklist({})
    setQuestionNotes({})
    setOffShelf([])
    setOffShelfConfirmed(false)
    setEvidence(createInitialEvidenceState())
    setSecondaryDisplayImageState(null)
    setAudioNoteFileState(null)
    setNotes('')
    setRevisitReason('')
    setRevisitRequiredState(false)
    setShelfResetNeededState(false)
    setLastSavedAt(null)
    setSubmitted(false)
    setToast(null)
    setCelebration(null)
    setScorecardVersion(draft)
    setVersionHistory([sourceScorecard])
    setRevisitComparison(null)
  }

  function createRevisitFromSubmitted() {
    if (activeScorecardResult.state !== 'active') {
      triggerToast('Revisit unavailable.', activeScorecardResult.message)
      return
    }

    const draft = createRevisitFromScorecard(sourceScorecard, {
      id: `pss-v${sourceScorecard.versionNumber + 1}-revisit-draft`,
    })

    setVisitTypeState('follow-up')
    setChecklist(createPreviousChecklistState())
    setQuestionNotes({})
    setOffShelf(createFollowUpSeedEntries())
    setOffShelfConfirmed(false)
    setEvidence(createInitialEvidenceState())
    setSecondaryDisplayImageState(null)
    setAudioNoteFileState(null)
    setNotes('')
    setRevisitReason(draft.revisitReason)
    setRevisitRequiredState(false)
    setShelfResetNeededState(false)
    setLastSavedAt(null)
    setSubmitted(false)
    setToast(null)
    setCelebration(null)
    setScorecardVersion(draft)
    setVersionHistory([sourceScorecard, draft])
    setRevisitComparison(null)
    triggerToast(
      'Revisit draft created.',
      'Previous values are prefilled. Update only what changed.'
    )
  }

  function setChecklistAnswer(itemId: string, answer: ChecklistAnswer) {
    setChecklist(prev => ({ ...prev, [itemId]: answer }))
  }

  function setQuestionNote(itemId: string, note: string) {
    setQuestionNotes(prev => ({ ...prev, [itemId]: note }))
  }

  function addOffShelfEntry(entry: OffShelfEntry) {
    setOffShelfConfirmed(true)
    const withTags = createOffShelfEntryWithTags(entry)
    setOffShelf(prev => [...prev, withTags])
  }

  function updateOffShelfEntry(entry: OffShelfEntry) {
    setOffShelfConfirmed(true)
    const withTags = createOffShelfEntryWithTags(entry)
    setOffShelf(prev => prev.map(existing => existing.id === entry.id ? withTags : existing))
  }

  function postScorecardToChatter() {
    if (!submitted) return
    setChatterPostStatus('Posting')
    
    setTimeout(() => {
      console.log('Posting to Chatter:', {
        scorecardId: scorecardVersion.id,
        score: recalculated.combinedScore,
        store: store.name,
        rep: store.rep,
        recommendations: generateRecommendations(appState),
        files: uploadedFiles.map(f => f.fileName),
        map: storePlanMap?.fileName
      })
      setChatterPostStatus('Posted')
      triggerToast('Chatter post created successfully.', 'The scorecard snapshot has been shared.')
    }, 1500)
  }

  function uploadStorePlanMap(files: File[]) {
    const file = files[0]
    if (!file) return

    const newFile: UploadedFile = {
      id: crypto.randomUUID(),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      localPreviewUrl: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      source: 'Map',
      fileObject: file
    }
    setStorePlanMap(newFile)
    setCsvSummary(generateCsvSummary(file, activeScorecardResult.scorecard || undefined))
    triggerToast('Map uploaded.', `${file.name} attached to visit.`)
  }

  function removeStorePlanMap() {
    setStorePlanMap(null)
    setCsvSummary(null)
  }

  function uploadEvidencePhoto(itemId: string, files: File[]) {
    const file = files[0]
    if (!file) return

    const newFile: UploadedFile = {
      id: crypto.randomUUID(),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      localPreviewUrl: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      source: 'ChecklistPhoto',
      fileObject: file
    }
    setUploadedFiles(prev => [...prev, newFile])
    setEvidencePhoto(itemId, file)
    triggerToast('Evidence added.', `${file.name} attached.`)
  }

  function removeEvidencePhoto(itemId: string) {
    setEvidencePhoto(itemId, null)
  }

  function uploadOffShelfPhoto(entryId: string, files: File[]) {
    const file = files[0]
    if (!file) return

    const newFile: UploadedFile = {
      id: crypto.randomUUID(),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      localPreviewUrl: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      source: 'OffShelfPhoto',
      fileObject: file
    }
    setUploadedFiles(prev => [...prev, newFile])
    setOffShelf(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, photoCaptured: true, photoName: file.name, photoPreviewUrl: newFile.localPreviewUrl } 
        : entry
    ))
    triggerToast('Display evidence added.', `${file.name} attached.`)
  }

  function removeOffShelfPhoto(entryId: string) {
    setOffShelf(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, photoCaptured: false, photoName: '', photoPreviewUrl: '' } 
        : entry
    ))
  }

  function duplicateOffShelfEntry(id: string) {
    setOffShelfConfirmed(true)
    setOffShelf(prev => {
      const target = prev.find(entry => entry.id === id)
      if (!target) return prev

      return [
        ...prev,
        createOffShelfEntryWithTags({
          ...target,
          id: crypto.randomUUID(),
          origin: 'current-visit',
          status: visitType === 'follow-up' ? 'added' : 'saved',
        }),
      ]
    })
  }

  function removeOffShelfEntry(id: string) {
    setOffShelf(prev => prev.filter(entry => entry.id !== id))
  }

  function setEvidenceCaptured(itemId: string, captured: boolean) {
    setEvidence(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        captured,
        note: captured && !prev[itemId]?.note ? 'Captured during active visit.' : prev[itemId]?.note ?? '',
        photoName: captured ? prev[itemId]?.photoName ?? '' : '',
        photoPreviewUrl: captured ? prev[itemId]?.photoPreviewUrl ?? '' : '',
      },
    }))
  }

  function setEvidencePhoto(itemId: string, file: File | null) {
    if (!file) {
      setEvidence(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          captured: false,
          note: prev[itemId]?.note ?? '',
          photoName: '',
          photoPreviewUrl: '',
        },
      }))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setEvidence(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          captured: true,
          note: prev[itemId]?.note || `Captured during active visit: ${file.name}`,
          photoName: file.name,
          photoPreviewUrl: result,
        },
      }))
    }
    reader.readAsDataURL(file)
  }

  function setEvidenceNote(itemId: string, note: string) {
    setEvidence(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        note,
      },
    }))
  }

  function setSecondaryDisplayImage(file: File | null) {
    setSecondaryDisplayImageState(file)
  }

  function setAudioNoteFile(file: File | null) {
    setAudioNoteFileState(file)
  }

  function saveDraft() {
    setLastSavedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
  }

  function setRevisitRequired(nextValue: boolean) {
    setRevisitRequiredState(prev => {
      if (nextValue && !prev) {
        triggerToast(
          'Revisit flagged successfully.',
          'This store will be tracked for follow-up execution.'
        )
      }
      return nextValue
    })
  }

  function setShelfResetNeeded(nextValue: boolean) {
    setShelfResetNeededState(prev => {
      if (nextValue && !prev) {
        triggerToast(
          'Shelf reset flagged successfully.',
          'This store will be marked for layout correction before the next visit.'
        )
      }
      return nextValue
    })
  }

  function submitScorecard() {
    const hasCriticalBlockers = getMissingRequiredEvidence(evidence, offShelf).length > 0
    const hasIncrementalAddedThisRun = offShelf.some(entry => (
      visitType === 'follow-up'
        ? entry.status === 'added'
        : entry.origin === 'current-visit'
    ))
    const shouldCelebrate = !hasCriticalBlockers &&
      hasIncrementalAddedThisRun &&
      recalculated.incrementalScore > 0

    if (visitType === 'follow-up') {
      const draftWithCurrentState: ScorecardVersionRecord = {
        ...scorecardVersion,
        items: createVersionItemsFromState(scorecardVersion.id, recalculated.offShelfItemsWithScoreImpact),
        executionScore: recalculated.executionScore,
        basePlanScore: recalculated.basePlanScore,
        incrementalScore: recalculated.incrementalScore,
        combinedScore: recalculated.combinedScore,
        scoreExplanations: recalculated.calculationTrace,
      }
      const submittedVersion = submitRevisit(draftWithCurrentState, {
        submittedBy: store.rep,
        revisitNotes: notes,
        revisitReason,
        currentScores: {
          executionScore: recalculated.executionScore,
          basePlanScore: recalculated.basePlanScore,
          incrementalScore: recalculated.incrementalScore,
          combinedScore: recalculated.combinedScore,
        },
      })

      setScorecardVersion(submittedVersion)
      setVersionHistory([sourceScorecard, submittedVersion])
      setRevisitComparison(buildRevisitComparison(sourceScorecard, submittedVersion))
    } else {
      setScorecardVersion(prev => ({
        ...prev,
        scorecardStatus: 'Submitted',
        submittedAt: new Date().toISOString(),
        submittedBy: store.rep,
        mapUpload: storePlanMap,
        photos: uploadedFiles,
        chatterPostStatus: 'Not Posted',
        scoreExplanations: recalculated.calculationTrace,
        currentScore: recalculated.combinedScore,
        executionScore: recalculated.executionScore,
        basePlanScore: recalculated.basePlanScore,
        incrementalScore: recalculated.incrementalScore,
        combinedScore: recalculated.combinedScore,
        items: createVersionItemsFromState('pss-current-draft', recalculated.offShelfItemsWithScoreImpact)
      }))
    }

    setSubmitted(true)
    saveDraft()
    if (shouldCelebrate) {
      setCelebration({
        id: Date.now(),
        title: 'Nice execution!',
        message: 'You added incremental value to this store.',
      })
    }
  }

  const answeredChecksCount = getAnsweredChecks(checklist)
  const totalChecksCount = getTotalChecks()
  const totalSectionsCount = getTotalSections(visitType)
  const requiredPhotosCount = getRequiredPhotoCount()
  const capturedRequiredPhotosCount = getCapturedRequiredPhotos(evidence, offShelf)
  const completionPercent = getCompletionPercent(appState)
  const scorecardStatus = getScorecardStatus(appState)
  const finalLgorPct = +(26.3 + recalculated.offShelfItemsWithScoreImpact.filter((e: OffShelfEntry) => e.classification === 'incremental').reduce((t: number, e: OffShelfEntry) => t + (e.estimatedLgor || 0), 0)).toFixed(1)
  const riskDelta = recalculated.riskSummary === 'High' ? -42 : recalculated.riskSummary === 'Medium' ? -18 : -6

  return (
    <AppContext.Provider value={{
      ...appState,
      offShelf: recalculated.offShelfItemsWithScoreImpact,
      setVisitType,
      setChecklistAnswer,
      setQuestionNote,
      addOffShelfEntry,
      updateOffShelfEntry,
      duplicateOffShelfEntry,
      removeOffShelfEntry,
      setEvidenceCaptured,
      setEvidencePhoto,
      setEvidenceNote,
      setSecondaryDisplayImage,
      setAudioNoteFile,
      setNotes,
      setRevisitReason,
      setRevisitRequired,
      setShelfResetNeeded,
      createRevisitFromSubmitted,
      saveDraft,
      submitScorecard,
      postScorecardToChatter,
      uploadStorePlanMap,
      removeStorePlanMap,
      uploadEvidencePhoto,
      removeEvidencePhoto,
      uploadOffShelfPhoto,
      removeOffShelfPhoto,
      setAgentforceEnabled,
      showToast,
      answeredChecks: answeredChecksCount,
      totalChecks: totalChecksCount,
      totalSections: totalSectionsCount,
      requiredPhotos: requiredPhotosCount,
      capturedRequiredPhotos: capturedRequiredPhotosCount,
      completionPercent,
      scorecardStatus,
      executionScore: recalculated.executionScore,
      totalScore: recalculated.combinedScore,
      lgorPct: finalLgorPct,
      riskDelta,
      chatterPostStatus,
      uploadedFiles,
      csvSummary,
    }}>
      {children}
    </AppContext.Provider>
  )
}
