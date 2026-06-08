import type {
  RevisitChangeType,
  RevisitComparisonSummary,
  ScorecardVersionItem,
  ScorecardVersionRecord,
} from '../types'

interface CreateRevisitOptions {
  id?: string
  now?: string
}

interface SubmitRevisitOptions {
  now?: string
  submittedBy?: string
  revisitNotes?: string
  revisitReason?: string
  currentScores?: Partial<Pick<
    ScorecardVersionRecord,
    'executionScore' | 'basePlanScore' | 'incrementalScore' | 'combinedScore' | 'currentScore'
  >>
}

type RevisitEditableField =
  | 'quantityCurrent'
  | 'offShelfCurrent'
  | 'executionCurrent'
  | 'recommendationCurrent'
  | 'currentValue'
  | 'scoreCurrent'

export function createRevisitFromScorecard(
  sourceScorecard: ScorecardVersionRecord,
  options: CreateRevisitOptions = {},
): ScorecardVersionRecord {
  const nextId = options.id ?? createClientId('pss')
  const sourceId = sourceScorecard.parentScorecardId ?? sourceScorecard.id

  const items = sourceScorecard.items.map(item => {
    const previousValue = item.currentValue ?? item.quantityCurrent ?? item.executionCurrent ?? null

    return {
      ...structuredClone(item),
      id: createClientId('item'),
      scorecardId: nextId,
      previousValue,
      currentValue: previousValue,
      changed: false,
      changeType: 'No Change' as RevisitChangeType,
      quantityPrevious: item.quantityCurrent ?? item.quantityPrevious,
      quantityCurrent: item.quantityCurrent ?? item.quantityPrevious,
      offShelfPrevious: item.offShelfCurrent ?? item.offShelfPrevious,
      offShelfCurrent: item.offShelfCurrent ?? item.offShelfPrevious,
      executionPrevious: item.executionCurrent ?? item.executionPrevious,
      executionCurrent: item.executionCurrent ?? item.executionPrevious,
      recommendationPrevious: item.recommendationCurrent ?? item.recommendationPrevious,
      recommendationCurrent: item.recommendationCurrent ?? item.recommendationPrevious,
      scorePrevious: item.scoreCurrent ?? item.scorePrevious,
      scoreCurrent: item.scoreCurrent ?? item.scorePrevious,
    }
  })

  return {
    ...structuredClone(sourceScorecard),
    id: nextId,
    scorecardStatus: 'Revisit Draft',
    versionNumber: sourceScorecard.versionNumber + 1,
    parentScorecardId: sourceId,
    sourceScorecardId: sourceScorecard.id,
    isRevisit: true,
    createdAt: options.now ?? new Date().toISOString(),
    submittedAt: null,
    previousScore: sourceScorecard.combinedScore,
    currentScore: sourceScorecard.combinedScore,
    scoreDelta: 0,
    executionScore: sourceScorecard.executionScore,
    basePlanScore: sourceScorecard.basePlanScore,
    incrementalScore: sourceScorecard.incrementalScore,
    combinedScore: sourceScorecard.combinedScore,
    revisitNotes: '',
    revisitReason: 'Same quarter / same season check-in',
    changedFieldsSummary: [],
    items,
  }
}

export function updateRevisitField(
  scorecard: ScorecardVersionRecord,
  itemId: string,
  field: RevisitEditableField,
  newValue: ScorecardVersionItem[RevisitEditableField],
): ScorecardVersionRecord {
  const nextItems = scorecard.items.map(item => {
    if (item.id !== itemId) return item

    const nextItem = {
      ...item,
      [field]: newValue,
    }

    if (field === 'quantityCurrent') {
      nextItem.currentValue = newValue
      nextItem.scoreCurrent = scoreQuantityChange(item.scorePrevious, item.quantityPrevious, newValue)
    }

    if (field === 'offShelfCurrent') nextItem.currentValue = newValue
    if (field === 'executionCurrent') nextItem.currentValue = newValue
    if (field === 'recommendationCurrent') nextItem.currentValue = newValue
    if (field === 'scoreCurrent') nextItem.scoreCurrent = Number(newValue)

    return classifyItemChange(nextItem)
  })

  return recalculateVersion({
    ...scorecard,
    items: nextItems,
  })
}

export function submitRevisit(
  scorecard: ScorecardVersionRecord,
  options: SubmitRevisitOptions = {},
): ScorecardVersionRecord {
  const withScores = recalculateVersion({
    ...scorecard,
    ...options.currentScores,
    scorecardStatus: 'Revisit Submitted',
    submittedAt: options.now ?? new Date().toISOString(),
    submittedBy: options.submittedBy ?? scorecard.submittedBy,
    revisitNotes: options.revisitNotes?.trim() ?? scorecard.revisitNotes,
    revisitReason: options.revisitReason?.trim() ?? scorecard.revisitReason,
  })

  return {
    ...withScores,
    currentScore: withScores.combinedScore,
    scoreDelta: +((withScores.combinedScore) - (withScores.previousScore ?? 0)).toFixed(1),
  }
}

export function buildRevisitComparison(
  previous: ScorecardVersionRecord,
  current: ScorecardVersionRecord,
): RevisitComparisonSummary {
  const items = current.items.map(classifyItemChange)

  return {
    previousCombinedScore: previous.combinedScore,
    currentCombinedScore: current.combinedScore,
    scoreDelta: +(current.combinedScore - previous.combinedScore).toFixed(1),
    executionScoreDelta: +(current.executionScore - previous.executionScore).toFixed(1),
    basePlanScoreDelta: +(current.basePlanScore - previous.basePlanScore).toFixed(1),
    incrementalScoreDelta: +(current.incrementalScore - previous.incrementalScore).toFixed(1),
    improvedItems: items.filter(item => item.changeType === 'Improved'),
    declinedItems: items.filter(item => item.changeType === 'Declined'),
    noChangeItems: items.filter(item => item.changeType === 'No Change'),
    newItems: items.filter(item => item.changeType === 'New'),
    removedItems: items.filter(item => item.changeType === 'Removed'),
    notes: current.revisitNotes,
    submittedAt: current.submittedAt,
    cards: items.map(item => ({
      id: item.id,
      label: `${item.skuName} ${item.category.includes('Quantity') ? '' : 'Quantity'}`.trim(),
      previous: formatComparableValue(item.quantityPrevious ?? item.previousValue),
      current: formatComparableValue(item.quantityCurrent ?? item.currentValue),
      change: item.changeType,
    })),
  }
}

export function recalculateVersion(scorecard: ScorecardVersionRecord): ScorecardVersionRecord {
  const items = scorecard.items.map(classifyItemChange)
  const combinedScore = +(scorecard.executionScore + scorecard.basePlanScore + scorecard.incrementalScore).toFixed(1)

  return {
    ...scorecard,
    items,
    combinedScore,
    currentScore: combinedScore,
    scoreDelta: +(combinedScore - (scorecard.previousScore ?? combinedScore)).toFixed(1),
    changedFieldsSummary: items
      .filter(item => item.changed)
      .map(item => buildChangedFieldSummary(item)),
  }
}

function classifyItemChange(item: ScorecardVersionItem): ScorecardVersionItem {
  if (!item.offShelfPrevious && item.offShelfCurrent) {
    return { ...item, changed: true, changeType: 'New' }
  }

  if (item.offShelfPrevious && !item.offShelfCurrent) {
    return { ...item, changed: true, changeType: 'Removed' }
  }

  const previousValue = item.quantityPrevious ?? item.previousValue
  const currentValue = item.quantityCurrent ?? item.currentValue
  const changed = !valuesEqual(previousValue, currentValue) ||
    !valuesEqual(item.executionPrevious, item.executionCurrent) ||
    !valuesEqual(item.recommendationPrevious, item.recommendationCurrent)

  if (!changed) {
    return { ...item, changed: false, changeType: 'No Change' }
  }

  return {
    ...item,
    changed: true,
    changeType: classifyDirectionalChange(item),
  }
}

function classifyDirectionalChange(item: ScorecardVersionItem): RevisitChangeType {
  if (item.scoreCurrent > item.scorePrevious) return 'Improved'
  if (item.scoreCurrent < item.scorePrevious) return 'Declined'

  const previousQuantity = normalizeQuantity(item.quantityPrevious)
  const currentQuantity = normalizeQuantity(item.quantityCurrent)

  if (currentQuantity > previousQuantity) return 'Improved'
  if (currentQuantity < previousQuantity) return 'Declined'
  return 'No Change'
}

function scoreQuantityChange(
  previousScore: number,
  previousQuantity: number | string | null,
  currentQuantity: string | number | boolean | null,
) {
  const delta = normalizeQuantity(currentQuantity) - normalizeQuantity(previousQuantity)
  return +(previousScore + delta / 10).toFixed(1)
}

function normalizeQuantity(value: string | number | boolean | null) {
  if (value === '400+') return 400
  if (typeof value === 'number') return value
  if (typeof value === 'boolean' || value === null) return 0
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function valuesEqual(
  left: string | number | boolean | null,
  right: string | number | boolean | null,
) {
  return String(left ?? '') === String(right ?? '')
}

function buildChangedFieldSummary(item: ScorecardVersionItem) {
  const previous = formatComparableValue(item.quantityPrevious ?? item.previousValue)
  const current = formatComparableValue(item.quantityCurrent ?? item.currentValue)
  return `${item.skuName} quantity changed from ${previous} to ${current}`
}

function formatComparableValue(value: string | number | boolean | null) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (value === null || value === '') return 'None'
  return String(value)
}

function createClientId(prefix: string) {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`
}
