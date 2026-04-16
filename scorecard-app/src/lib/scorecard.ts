import { checklistQuestions, evidenceRequirements, offShelfProducts, offShelfRecommendations, scorecardSections } from '../data/mock'
import type {
  AppState,
  ChecklistAnswer,
  ChecklistQuestion,
  ChecklistState,
  EvidenceState,
  EvidenceStateItem,
  OffShelfClassification,
  OffShelfEntry,
  OffShelfProduct,
  ScorecardSection,
  ScorecardStatus,
  StepState,
  VisitType,
} from '../types'

export function createInitialEvidenceState() {
  return evidenceRequirements.reduce<Record<string, EvidenceStateItem>>((acc, item) => {
    acc[item.id] = { captured: false, note: '', photoName: '', photoPreviewUrl: '' }
    return acc
  }, {})
}

export function getTotalChecks() {
  return checklistQuestions.length
}

export function getVisitTypeLabel(visitType: VisitType) {
  return visitType === 'follow-up' ? 'Follow-up' : 'Initial'
}

export function getActiveScorecardSections(visitType: VisitType) {
  if (visitType === 'follow-up') {
    return scorecardSections.filter(section => (
      section.id === 'off-shelf-capture' ||
      section.id === 'photo-evidence' ||
      section.id === 'review-submit'
    ))
  }

  return scorecardSections
}

export function getTotalSections(visitType: VisitType = 'initial') {
  return getActiveScorecardSections(visitType).length
}

export function getAnsweredChecks(checklist: ChecklistState) {
  return Object.values(checklist).filter(Boolean).length
}

export function getYesCount(checklist: ChecklistState) {
  return Object.values(checklist).filter(answer => answer === 'yes').length
}

export function getRequiredPhotoCount() {
  return evidenceRequirements.filter(item => item.required).length
}

function isActiveOffShelfEntry(entry: OffShelfEntry) {
  return entry.status !== 'removed' && entry.status !== 'pending-review'
}

function hasStartedFollowUpReview(offShelf: OffShelfEntry[]) {
  return offShelf.some(entry => (
    entry.origin === 'current-visit' ||
    entry.status === 'retained' ||
    entry.status === 'updated' ||
    entry.status === 'removed' ||
    entry.status === 'added'
  ))
}

export function getPendingFollowUpEntries(offShelf: OffShelfEntry[]) {
  return offShelf.filter(entry => entry.origin === 'previous-visit' && entry.status === 'pending-review')
}

function hasOffShelfPhoto(offShelf: OffShelfEntry[]) {
  return offShelf.some(entry => isActiveOffShelfEntry(entry) && entry.photoCaptured)
}

function isEvidenceCaptured(itemId: string, evidence: EvidenceState, offShelf: OffShelfEntry[] = []) {
  if (itemId === 'endcap-photo') {
    return Boolean(evidence[itemId]?.captured || hasOffShelfPhoto(offShelf))
  }

  return Boolean(evidence[itemId]?.captured)
}

export function getCapturedRequiredPhotos(evidence: EvidenceState, offShelf: OffShelfEntry[] = []) {
  return evidenceRequirements.filter(item => item.required && isEvidenceCaptured(item.id, evidence, offShelf)).length
}

export function getMissingRequiredEvidence(evidence: EvidenceState, offShelf: OffShelfEntry[] = []) {
  return evidenceRequirements.filter(item => item.required && !isEvidenceCaptured(item.id, evidence, offShelf))
}

export function getChecklistQuestionsForSection(sectionId: string) {
  return checklistQuestions.filter(question => question.sectionId === sectionId)
}

export function getChecklistSectionValue(sectionId: string) {
  return getChecklistQuestionsForSection(sectionId).reduce((total, question) => total + question.weight, 0)
}

export function getChecklistSectionProgress(sectionId: string, checklist: ChecklistState) {
  const questions = getChecklistQuestionsForSection(sectionId)
  const answered = questions.filter(question => checklist[question.id]).length
  return {
    questions,
    answered,
    total: questions.length,
    started: answered > 0,
    complete: answered === questions.length,
  }
}

export function isOffShelfSectionComplete(
  offShelf: OffShelfEntry[],
  offShelfConfirmed: boolean,
  visitType: VisitType = 'initial',
) {
  if (visitType === 'follow-up') {
    return getPendingFollowUpEntries(offShelf).length === 0 && (offShelfConfirmed || offShelf.length > 0)
  }

  return offShelfConfirmed || offShelf.length > 0
}

export function parseOffShelfQuantity(quantity: number | string) {
  if (quantity === '400+') return 400
  return typeof quantity === 'number' ? quantity : Number.parseInt(quantity, 10)
}

export function getOffShelfQuantityLabel(quantity: number | string) {
  const normalizedQuantity = parseOffShelfQuantity(quantity)

  if (normalizedQuantity >= 400) return 'Bulk'
  if (normalizedQuantity >= 320) return 'Bulk'
  if (normalizedQuantity >= 200) return 'Pallet'
  if (normalizedQuantity >= 120) return 'Large Display'
  if (normalizedQuantity >= 80) return 'Medium Display'
  return 'Small Display'
}

export function getOffShelfProductById(productId: string) {
  return offShelfProducts.find(product => product.id === productId)
}

function getLocationMultiplier(location: string) {
  return {
    Endcap: 1.2,
    'Fence Line': 1.12,
    'Garden Door': 1.08,
    'Drive Aisle': 1.04,
    Racetrack: 1,
    Other: 0.92,
  }[location] ?? 1
}

function getQuantityMultiplier(quantity: number) {
  if (quantity >= 400) return 1.75
  if (quantity >= 320) return 1.55
  if (quantity >= 200) return 1.3
  if (quantity >= 120) return 1.1
  if (quantity >= 80) return 0.95
  return 0.78
}

function getClassificationMultiplier(classification: OffShelfClassification) {
  return {
    'base-plan': 0,
    incremental: 1,
    'not-sure': 0.55,
  }[classification]
}

export function estimateOffShelfImpact({
  product,
  location,
  quantity,
  classification,
}: {
  product: OffShelfProduct
  location: string
  quantity: number | string
  classification: OffShelfClassification
}) {
  const normalizedQuantity = parseOffShelfQuantity(quantity)
  const locationMultiplier = getLocationMultiplier(location)
  const quantityMultiplier = getQuantityMultiplier(normalizedQuantity)
  const classificationMultiplier = getClassificationMultiplier(classification)
  const multiplier = +(locationMultiplier * quantityMultiplier * classificationMultiplier).toFixed(2)
  const impactPoints = +(product.basePoints * multiplier).toFixed(1)
  const estimatedLgor = +(product.baseLgor * multiplier).toFixed(1)

  const multiplierLabel = classification === 'base-plan'
    ? 'Base plan coverage only'
    : classification === 'not-sure'
      ? 'Pending classification review'
      : locationMultiplier > 1
        ? `${location} multiplier`
        : 'Standard placement'

  return {
    normalizedQuantity,
    multiplier,
    multiplierLabel,
    impactPoints,
    estimatedLgor,
  }
}

export function getOffShelfIncrementalScore(entries: OffShelfEntry[]) {
  return +entries
    .filter(isActiveOffShelfEntry)
    .reduce((total, entry) => total + entry.impactPoints, 0)
    .toFixed(1)
}

export function getOffShelfOpportunityScore(entries: OffShelfEntry[]) {
  return +(100 + getOffShelfIncrementalScore(entries)).toFixed(1)
}

export function getRemainingOffShelfRecommendations(entries: OffShelfEntry[]) {
  const capturedKeys = new Set(
    entries
      .filter(isActiveOffShelfEntry)
      .map(entry => `${entry.skuId}:${entry.location}`)
  )

  return offShelfRecommendations
    .filter(item => !capturedKeys.has(`${item.skuId}:${item.location}`))
    .map(item => ({
      ...item,
      product: getOffShelfProductById(item.skuId),
    }))
    .filter(item => item.product)
}

export function getPotentialAdditionalGain(entries: OffShelfEntry[]) {
  return +getRemainingOffShelfRecommendations(entries)
    .slice(0, 3)
    .reduce((total, item) => total + item.potentialPoints, 0)
    .toFixed(1)
}

export function isPhotoSectionComplete(evidence: EvidenceState, offShelf: OffShelfEntry[] = []) {
  return getMissingRequiredEvidence(evidence, offShelf).length === 0
}

export function isSectionComplete(section: ScorecardSection, state: AppState) {
  if (section.kind === 'checklist') {
    return getChecklistSectionProgress(section.id, state.checklist).complete
  }

  if (section.id === 'off-shelf-capture') {
    return isOffShelfSectionComplete(state.offShelf, state.offShelfConfirmed, state.visitType)
  }

  if (section.id === 'photo-evidence') {
    return isPhotoSectionComplete(state.evidence, state.offShelf)
  }

  return state.submitted
}

export function getCompletionPercent(state: AppState) {
  if (state.submitted) return 100

  const totalUnits = state.visitType === 'follow-up'
    ? getRequiredPhotoCount() + 1
    : getTotalChecks() + getRequiredPhotoCount() + 1
  const completedUnits = state.visitType === 'follow-up'
    ? getCapturedRequiredPhotos(state.evidence, state.offShelf) +
      (isOffShelfSectionComplete(state.offShelf, state.offShelfConfirmed, state.visitType) ? 1 : 0)
    : getAnsweredChecks(state.checklist) +
      getCapturedRequiredPhotos(state.evidence, state.offShelf) +
      (isOffShelfSectionComplete(state.offShelf, state.offShelfConfirmed, state.visitType) ? 1 : 0)

  return Math.round((completedUnits / totalUnits) * 100)
}

export function getScorecardStatus(state: AppState): ScorecardStatus {
  if (state.submitted) return 'completed'

  const touched = state.visitType === 'follow-up'
    ? hasStartedFollowUpReview(state.offShelf) ||
      state.offShelfConfirmed ||
      getCapturedRequiredPhotos(state.evidence, state.offShelf) > 0 ||
      state.notes.trim().length > 0 ||
      state.revisitRequired ||
      state.shelfResetNeeded
    : getAnsweredChecks(state.checklist) > 0 ||
      state.offShelf.length > 0 ||
      state.offShelfConfirmed ||
      getCapturedRequiredPhotos(state.evidence, state.offShelf) > 0 ||
      state.notes.trim().length > 0 ||
      state.revisitRequired ||
      state.shelfResetNeeded

  if (!touched) return 'not-started'

  const ready = state.visitType === 'follow-up'
    ? isOffShelfSectionComplete(state.offShelf, state.offShelfConfirmed, state.visitType) &&
      isPhotoSectionComplete(state.evidence, state.offShelf)
    : getAnsweredChecks(state.checklist) === getTotalChecks() &&
      isOffShelfSectionComplete(state.offShelf, state.offShelfConfirmed, state.visitType) &&
      isPhotoSectionComplete(state.evidence, state.offShelf)

  return ready ? 'ready-for-review' : 'in-progress'
}

export function getCurrentSection(state: AppState) {
  const activeSections = getActiveScorecardSections(state.visitType)
  const next = activeSections.find(section => !isSectionComplete(section, state))
  return next ?? activeSections[activeSections.length - 1]
}

export function getCurrentSectionNumber(state: AppState) {
  const current = getCurrentSection(state)
  return getActiveScorecardSections(state.visitType).findIndex(section => section.id === current.id) + 1
}

export function getStepState(sectionId: string, state: AppState): StepState {
  const activeSections = getActiveScorecardSections(state.visitType)
  const sectionIndex = activeSections.findIndex(section => section.id === sectionId)
  const currentIndex = getCurrentSectionNumber(state) - 1
  const status = getScorecardStatus(state)
  const section = activeSections[sectionIndex]

  if (section && isSectionComplete(section, state)) return 'completed'
  if (status === 'not-started') return sectionIndex === 0 ? 'pending' : 'locked'
  if (sectionIndex === currentIndex) return 'in-progress'
  if (sectionIndex === currentIndex + 1) return 'pending'
  if (sectionIndex > currentIndex + 1) return 'locked'
  return 'completed'
}

export function getExecutionScore(checklist: ChecklistState) {
  return Math.round((getYesCount(checklist) / getTotalChecks()) * 100)
}

export function getChecklistImpactValue(weight: number, answer: ChecklistAnswer) {
  if (answer === 'yes') return weight
  if (answer === 'no') return -weight
  return 0
}

export function getChecklistBasePlanScore(checklist: ChecklistState) {
  const delta = checklistQuestions.reduce((total, question) => (
    total + getChecklistImpactValue(question.weight, checklist[question.id] ?? null)
  ), 0)

  return Math.max(0, +(100 + delta).toFixed(1))
}

export function getChecklistDecisionScore(checklist: ChecklistState, offShelf: OffShelfEntry[]) {
  return +(getChecklistBasePlanScore(checklist) + getOffShelfIncrementalScore(offShelf)).toFixed(1)
}

export function getTotalScore(state: AppState) {
  const noCount = Object.values(state.checklist).filter(answer => answer === 'no').length
  const offShelfBonus = Math.min(getOffShelfIncrementalScore(state.offShelf), 24)
  const evidencePenalty = getMissingRequiredEvidence(state.evidence, state.offShelf).length * 6
  const executionScore = getExecutionScore(state.checklist)

  return Math.max(0, +(136 + Math.round(executionScore * 0.48) + offShelfBonus - noCount * 4 - evidencePenalty).toFixed(1))
}

export function getLgorPct(state: AppState) {
  return +(6.8 + getYesCount(state.checklist) * 0.55 + getOffShelfIncrementalScore(state.offShelf) * 0.12).toFixed(1)
}

export function getRiskDelta(state: AppState) {
  const noCount = Object.values(state.checklist).filter(answer => answer === 'no').length
  const missingEvidence = getMissingRequiredEvidence(state.evidence, state.offShelf).length
  const reducedRisk = getYesCount(state.checklist) * 1.4
  return Math.round(-1 * Math.max(6, 18 + noCount * 4 + missingEvidence * 5 - reducedRisk))
}

export function getCurrentRiskValue(state: AppState) {
  const mapMisses = checklistQuestions.filter(question => question.group === 'map' && state.checklist[question.id] !== 'yes').length
  const missingTopItems = checklistQuestions.filter(question => question.group === 'pog' && state.checklist[question.id] !== 'yes').length
  const displayMisses = checklistQuestions.filter(question => question.group === 'display' && state.checklist[question.id] === 'no').length
  const lightDisplays = state.offShelf.filter(entry => parseOffShelfQuantity(entry.quantity) < 80).length
  const emptyCalories = state.offShelf.filter(entry => entry.classification !== 'incremental').length
  const missingEvidenceCount = getMissingRequiredEvidence(state.evidence, state.offShelf).length

  return (
    mapMisses * 180 +
    missingTopItems * 140 +
    (displayMisses + lightDisplays) * 120 +
    emptyCalories * 90 +
    missingEvidenceCount * 160
  )
}

export function getQuestionStatus(answer: ChecklistAnswer) {
  if (answer === 'no') {
    return {
      label: 'Action Required',
      stripClass: 'bg-[#ba0517]',
      statusClass: 'text-[#8e030f] bg-[#fef1ee] border-[#f9d6d0]',
    }
  }

  if (answer === 'yes' || answer === 'na') {
    return {
      label: 'Complete',
      stripClass: 'bg-[#2e844a]',
      statusClass: 'text-[#1f5f33] bg-[#edf7ee] border-[#cde8d3]',
    }
  }

  return {
    label: 'Not Answered',
    stripClass: 'bg-[#c9cfd6]',
    statusClass: 'text-[#52606d] bg-[#f4f6f9] border-[#dde3ea]',
  }
}

export function getQuestionEvidenceLabel(question: ChecklistQuestion, evidence: EvidenceState, offShelf: OffShelfEntry[] = []) {
  const relatedEvidence = evidenceRequirements.filter(item => item.linkedQuestionIds.includes(question.id))
  const requiredEvidence = relatedEvidence.filter(item => item.required)

  if (requiredEvidence.length === 0) {
    return 'No photo required'
  }

  const missing = requiredEvidence.some(item => !isEvidenceCaptured(item.id, evidence, offShelf))
  return missing ? 'Photo required before submit' : 'Required photo captured'
}

export function getLinkedQuestionTitles(questionIds: string[]) {
  return checklistQuestions
    .filter(question => questionIds.includes(question.id))
    .map(question => question.title)
}
