import type {
  BasePlanItem,
  ChecklistAnswer,
  ConversionData,
  OffShelfEntry,
  OffShelfStatus,
  OpportunityItem,
  QuantityUnit,
  RecommendationItem,
  RevisitItem,
  ScorecardSnapshot,
  SkuProduct,
} from '../types'
import { basePlanItems, demoBasePlanLgorPercent, displayCapacity, skuData } from '../data/mock'

// ── Execution Score ───────────────────────────────────────────────────────────
// Yes = full points, Partial = configurable credit (default 50%), No = 0, N/A = excluded from denominator

export function calculateExecutionScore(
  answers: Record<string, ChecklistAnswer>,
  partialCreditPercent = 0.5,
): number {
  const eligible = basePlanItems.filter(item => answers[item.id] !== 'na')
  if (eligible.length === 0) return 0

  const possiblePoints = eligible.reduce((sum, item) => sum + item.possiblePoints, 0)
  if (possiblePoints === 0) return 0

  const earnedPoints = eligible.reduce((sum, item) => {
    const answer = answers[item.id]
    if (answer === 'yes') return sum + item.possiblePoints
    if (answer === 'partial') return sum + item.possiblePoints * partialCreditPercent
    return sum
  }, 0)

  return +((earnedPoints / possiblePoints) * 100).toFixed(1)
}

export function getExecutionEarnedPoints(
  answers: Record<string, ChecklistAnswer>,
  partialCreditPercent = 0.5,
): number {
  return +basePlanItems.reduce((sum, item) => {
    const answer = answers[item.id]
    if (answer === 'yes') return sum + item.possiblePoints
    if (answer === 'partial') return sum + item.possiblePoints * partialCreditPercent
    return sum
  }, 0).toFixed(1)
}

export function getAnsweredCount(answers: Record<string, ChecklistAnswer>): number {
  return basePlanItems.filter(item => answers[item.id] !== null && answers[item.id] !== undefined).length
}

export function getTotalItemCount(): number {
  return basePlanItems.length
}

export function isExecutionComplete(answers: Record<string, ChecklistAnswer>): boolean {
  return getAnsweredCount(answers) === getTotalItemCount()
}

// ── Base Plan LGOR ────────────────────────────────────────────────────────────
// Base Plan LGOR Points = Base Plan LGOR % (direct 1:1 conversion)

export function calculateBasePlanLgorPoints(basePlanLgorPercent = demoBasePlanLgorPercent): number {
  return +basePlanLgorPercent.toFixed(1)
}

// ── Quantity Conversion ───────────────────────────────────────────────────────

export function convertQuantityToUnits(
  quantity: number,
  unit: QuantityUnit,
  conversion: ConversionData,
): number {
  switch (unit) {
    case 'cases':
      return Math.round(quantity * conversion.unitsPerCase)
    case 'pallets':
      return Math.round(quantity * conversion.unitsPerPallet)
    case 'eaches':
    case 'estimated':
    default:
      return Math.round(quantity)
  }
}

// ── Peak Week Logic ───────────────────────────────────────────────────────────
// Peak Week Multiplier rewards quantity depth relative to peak demand

export function calculatePeakWeekRatio(calculatedUnits: number, peakWeekUnits: number): number {
  if (peakWeekUnits <= 0) return 0
  return +(calculatedUnits / peakWeekUnits).toFixed(2)
}

export function calculatePeakWeekMultiplier(ratio: number): number {
  if (ratio >= 3) return 3
  if (ratio >= 2) return 2
  if (ratio >= 1) return 1
  return 0
}

// ── Incremental Score ─────────────────────────────────────────────────────────
// Incremental Item Points = SKU LGOR % × Peak Week Multiplier

export function calculateIncrementalItemPoints(lgorPercent: number, multiplier: number): number {
  return +(lgorPercent * multiplier).toFixed(1)
}

export function calculateIncrementalOffShelfPoints(entries: OffShelfEntry[]): number {
  return +entries
    .filter(e => e.isIncremental && e.status !== 'removed')
    .reduce((sum, e) => sum + e.points, 0)
    .toFixed(1)
}

export function calculateIncrementalRawLgorPercent(entries: OffShelfEntry[]): number {
  return +entries
    .filter(e => e.isIncremental && e.status !== 'removed')
    .reduce((sum, e) => sum + e.lgorPercent, 0)
    .toFixed(1)
}

// ── Final Score ───────────────────────────────────────────────────────────────
// Final PSS Score = Execution Score + Base Plan LGOR Points + Incremental Off-Shelf Points

export function calculateFinalPssScore(
  executionScore: number,
  basePlanLgorPoints: number,
  incrementalOffShelfPoints: number,
): number {
  return +(executionScore + basePlanLgorPoints + incrementalOffShelfPoints).toFixed(1)
}

// ── LGOR Rep % ────────────────────────────────────────────────────────────────
// LGOR Rep % = Base Plan LGOR % + Incremental Raw LGOR %

export function calculateLgorRepPercent(
  basePlanLgorPercent: number,
  entries: OffShelfEntry[],
): number {
  const incrementalRaw = calculateIncrementalRawLgorPercent(entries)
  return +(basePlanLgorPercent + incrementalRaw).toFixed(1)
}

// ── Opportunity Layer ─────────────────────────────────────────────────────────
// Opportunity = Recommended SKU List minus Current Off-Shelf SKU List

export function generateOpportunityItems(entries: OffShelfEntry[]): OpportunityItem[] {
  const activeSkuIds = new Set(
    entries.filter(e => e.status !== 'removed').map(e => e.skuId),
  )

  return skuData
    .filter(sku => !activeSkuIds.has(sku.id) && sku.isRecommended)
    .map(sku => ({
      skuId: sku.id,
      productName: sku.productName,
      rank: sku.rank,
      lgorPercent: sku.lgorPercent,
      quarterlyUnits: sku.quarterlyUnits,
      quarterlyDollarValue: sku.quarterlyDollarValue,
      peakWeekUnits: sku.peakWeekUnits,
      recommendedAction: `Place ${sku.productName} off-shelf to capture ${sku.lgorPercent}% LGOR`,
    }))
}

// ── Recommendations (Rule-Based) ──────────────────────────────────────────────
// Categories: Missing | Not Enough | Empty Calories | Missing MAP | Peak Week Gap | Capacity Gap
// Recommendations are guidance only — they do NOT change the numeric score

export function generateRecommendations(
  answers: Record<string, ChecklistAnswer>,
  entries: OffShelfEntry[],
): RecommendationItem[] {
  const recommendations: RecommendationItem[] = []
  const activeEntries = entries.filter(e => e.status !== 'removed')
  const activeSkuIds = new Set(activeEntries.map(e => e.skuId))
  const recommendedSkus = skuData.filter(s => s.isRecommended)
  const recommendedSkuIds = new Set(recommendedSkus.map(s => s.id))
  const capacityMap = new Map(displayCapacity.map(c => [c.location, c]))

  // Missing: recommended SKU not off-shelf
  recommendedSkus.forEach(sku => {
    if (!activeSkuIds.has(sku.id)) {
      recommendations.push({
        id: `missing-${sku.id}`,
        type: 'missing',
        severity: sku.rank <= 2 ? 'high' : 'medium',
        skuId: sku.id,
        message: `${sku.productName} (rank #${sku.rank}, ${sku.lgorPercent}% LGOR) is not currently off-shelf`,
        status: 'active',
      })
    }
  })

  // Missing MAP: required base plan item is No or Partial
  basePlanItems.forEach(item => {
    const answer = answers[item.id]
    if (answer === 'no' || answer === 'partial') {
      recommendations.push({
        id: `missing-map-${item.id}`,
        type: 'missing-map',
        severity: answer === 'no' ? 'high' : 'medium',
        message: `${item.itemName} at ${item.requiredLocation}: ${answer === 'no' ? 'not set' : 'partially complete'}`,
        status: 'active',
      })
    }
  })

  activeEntries.filter(e => e.isIncremental).forEach(entry => {
    // Not Enough: quantity < peak week units
    if (entry.calculatedUnits < entry.peakWeekUnits) {
      recommendations.push({
        id: `not-enough-${entry.id}`,
        type: 'not-enough',
        severity: 'medium',
        skuId: entry.skuId,
        displayLocation: entry.displayLocation,
        message: `${entry.product} at ${entry.displayLocation}: ${entry.calculatedUnits} units placed vs ${entry.peakWeekUnits} peak week demand`,
        currentValue: entry.calculatedUnits,
        recommendedValue: entry.peakWeekUnits,
        status: 'active',
      })
      // Peak Week Demand Gap
      recommendations.push({
        id: `pwgap-${entry.id}`,
        type: 'peak-week-gap',
        severity: 'high',
        skuId: entry.skuId,
        displayLocation: entry.displayLocation,
        message: `Peak demand gap: need ${entry.peakWeekUnits - entry.calculatedUnits} more units of ${entry.product}`,
        currentValue: entry.calculatedUnits,
        recommendedValue: entry.peakWeekUnits,
        status: 'active',
      })
    }

    // Capacity Gap: peak week > location capacity
    const cap = capacityMap.get(entry.displayLocation)
    if (cap && entry.peakWeekUnits > cap.capacityUnits) {
      recommendations.push({
        id: `capacity-${entry.id}`,
        type: 'capacity-gap',
        severity: 'medium',
        skuId: entry.skuId,
        displayLocation: entry.displayLocation,
        message: `${entry.displayLocation} capacity (${cap.capacityUnits} units) cannot support peak demand (${entry.peakWeekUnits} units) for ${entry.product}`,
        currentValue: cap.capacityUnits,
        recommendedValue: entry.peakWeekUnits,
        status: 'active',
      })
    }
  })

  // Empty Calories: incremental SKU not in recommended list
  activeEntries
    .filter(e => e.isIncremental && !recommendedSkuIds.has(e.skuId))
    .forEach(entry => {
      recommendations.push({
        id: `empty-${entry.id}`,
        type: 'empty-calories',
        severity: 'low',
        skuId: entry.skuId,
        displayLocation: entry.displayLocation,
        message: `${entry.product} at ${entry.displayLocation} is not a priority SKU — this space could drive higher LGOR`,
        status: 'active',
      })
    })

  return recommendations
}

// ── Revisit Suggestions ───────────────────────────────────────────────────────

export function generateRevisitSuggestions(
  recommendations: RecommendationItem[],
  entries: OffShelfEntry[],
): Omit<RevisitItem, 'id' | 'status' | 'notes'>[] {
  return recommendations
    .filter(r => r.severity === 'high' || r.type === 'missing-map')
    .slice(0, 5)
    .map(rec => {
      const entry = rec.skuId
        ? entries.find(e => e.skuId === rec.skuId && e.status !== 'removed')
        : undefined
      const sku = rec.skuId ? skuData.find(s => s.id === rec.skuId) : undefined
      return {
        skuId: rec.skuId,
        displayLocation: rec.displayLocation,
        reason: rec.message,
        currentQuantity: entry?.calculatedUnits,
        recommendedQuantity: rec.recommendedValue,
        quantityGap:
          rec.recommendedValue !== undefined && rec.currentValue !== undefined
            ? rec.recommendedValue - rec.currentValue
            : undefined,
        peakWeekUnits: sku?.peakWeekUnits ?? entry?.peakWeekUnits,
      }
    })
}

// ── Scorecard Snapshot ────────────────────────────────────────────────────────

export function buildSnapshot(
  executionScore: number,
  basePlanLgorPercent: number,
  entries: OffShelfEntry[],
): ScorecardSnapshot {
  const basePlanLgorPoints = calculateBasePlanLgorPoints(basePlanLgorPercent)
  const incrementalRawLgorPercent = calculateIncrementalRawLgorPercent(entries)
  const incrementalOffShelfPoints = calculateIncrementalOffShelfPoints(entries)
  const finalScore = calculateFinalPssScore(executionScore, basePlanLgorPoints, incrementalOffShelfPoints)
  const lgorRepPercent = calculateLgorRepPercent(basePlanLgorPercent, entries)

  return {
    snapshotId: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    executionScore,
    basePlanLgorPercent,
    basePlanLgorPoints,
    incrementalRawLgorPercent,
    incrementalOffShelfPoints,
    finalScore,
    lgorRepPercent,
  }
}

// ── SKU helpers ───────────────────────────────────────────────────────────────

export function getSkuById(skuId: string): SkuProduct | undefined {
  return skuData.find(s => s.id === skuId)
}

// ── Build off-shelf entry from user inputs ────────────────────────────────────

export function buildOffShelfEntry(params: {
  skuId: string
  displayLocation: string
  quantity: number
  quantityUnit: QuantityUnit
  notes?: string
}): OffShelfEntry {
  const sku = getSkuById(params.skuId)
  const conversion: ConversionData = {
    skuId: params.skuId,
    unitsPerCase: sku?.unitsPerCase ?? 1,
    casesPerPallet: sku?.casesPerPallet ?? 1,
    unitsPerPallet: sku?.unitsPerPallet ?? 1,
  }
  const calculatedUnits = convertQuantityToUnits(params.quantity, params.quantityUnit, conversion)
  const peakWeekUnits = sku?.peakWeekUnits ?? 0
  const ratio = calculatePeakWeekRatio(calculatedUnits, peakWeekUnits)
  const multiplier = calculatePeakWeekMultiplier(ratio)
  const lgorPercent = sku?.lgorPercent ?? 0
  const points = calculateIncrementalItemPoints(lgorPercent, multiplier)

  return {
    id: crypto.randomUUID(),
    displayLocation: params.displayLocation,
    productCategory: sku?.category ?? 'Other',
    skuId: params.skuId,
    product: sku?.productName ?? params.skuId,
    quantity: params.quantity,
    quantityUnit: params.quantityUnit,
    calculatedUnits,
    lgorPercent,
    peakWeekUnits,
    peakWeekRatio: ratio,
    peakWeekMultiplier: multiplier,
    points,
    isIncremental: true,
    notes: params.notes ?? '',
    photoIds: [],
    status: 'saved' as OffShelfStatus,
  }
}

// ── Legacy backward-compat shims (used by retained components) ────────────────

export function getOffShelfProductById(productId: string) {
  return skuData.find(s => s.id === productId)
}

export function getPeakWeekRatio(quantity: number, peakWeekUnits: number) {
  return calculatePeakWeekRatio(quantity, peakWeekUnits)
}

export function getPeakWeekMultiplier(quantity: number, peakWeekUnits: number) {
  return calculatePeakWeekMultiplier(calculatePeakWeekRatio(quantity, peakWeekUnits))
}

export function getOffShelfIncrementalScore(entries: OffShelfEntry[]) {
  return calculateIncrementalOffShelfPoints(entries)
}

export function getTotalScore(state: { offShelfItems: OffShelfEntry[]; executionScore?: number }) {
  const exec = state.executionScore ?? 0
  const base = calculateBasePlanLgorPoints()
  const incremental = calculateIncrementalOffShelfPoints(state.offShelfItems)
  return calculateFinalPssScore(exec, base, incremental)
}

export function getLgorPct(state: { offShelfItems: OffShelfEntry[] }) {
  return calculateLgorRepPercent(demoBasePlanLgorPercent, state.offShelfItems)
}

export function estimateOffShelfImpact(params: {
  product: { peakWeekUnits: number; baseLgor: number }
  location: string
  quantity: number | string
  classification: string
}) {
  const qty = typeof params.quantity === 'string' ? Number.parseInt(params.quantity, 10) : params.quantity
  const ratio = calculatePeakWeekRatio(qty, params.product.peakWeekUnits)
  const multiplier = calculatePeakWeekMultiplier(ratio)
  const isIncremental = params.classification === 'incremental'
  const impactPoints = isIncremental ? calculateIncrementalItemPoints(params.product.baseLgor, multiplier) : 0
  return {
    normalizedQuantity: qty,
    peakWeekUnits: params.product.peakWeekUnits,
    peakWeekRatio: ratio,
    multiplier: isIncremental ? multiplier : 0,
    multiplierLabel: isIncremental ? `${multiplier}x peak week depth` : 'Base plan only',
    impactPoints,
    estimatedLgor: isIncremental ? params.product.baseLgor : 0,
  }
}

export function createInitialEvidenceState() { return {} }
export function getTotalChecks() { return basePlanItems.length }
export function getTotalSections() { return 7 }
export function getAnsweredChecks(checklist: Record<string, ChecklistAnswer>) { return getAnsweredCount(checklist) }
export function getRequiredPhotoCount() { return 0 }
export function getCapturedRequiredPhotos() { return 0 }
export function getMissingRequiredEvidence() { return [] }
export function isPhotoSectionComplete() { return true }
export function getCompletionPercent() { return 0 }
export function getScorecardStatus() { return 'not-started' as const }
export function getChecklistBasePlanScore(checklist: Record<string, ChecklistAnswer>) {
  return calculateExecutionScore(checklist)
}
export function getRiskDelta() { return 0 }
export function getCurrentRiskValue() { return 0 }
export function getChecklistImpactValue() { return 0 }
export function getChecklistDecisionScore(checklist: Record<string, ChecklistAnswer>, entries: OffShelfEntry[]) {
  return calculateFinalPssScore(calculateExecutionScore(checklist), calculateBasePlanLgorPoints(), calculateIncrementalOffShelfPoints(entries))
}
export function getBasePlanLgorPoints() { return calculateBasePlanLgorPoints() }
export function getIncrementalRawLgorPct(entries: OffShelfEntry[]) { return calculateIncrementalRawLgorPercent(entries) }
export function getActiveScorecardSections() { return [] }
export function getChecklistSectionProgress() { return { questions: [], answered: 0, total: 0, started: false, complete: false } }
export function isSectionComplete() { return false }
export function getCurrentSection() { return null }
export function getCurrentSectionNumber() { return 1 }
export function getStepState() { return 'pending' as const }
export function getPendingFollowUpEntries() { return [] }
export function isOffShelfSectionComplete() { return false }
export function parseOffShelfQuantity(q: number | string) { return typeof q === 'number' ? q : Number.parseInt(q, 10) }
export function getOffShelfQuantityLabel(q: number | string) {
  const n = typeof q === 'number' ? q : Number.parseInt(q, 10)
  if (n >= 200) return 'Bulk'
  if (n >= 120) return 'Large'
  if (n >= 80) return 'Medium'
  return 'Small'
}
export function getRemainingOffShelfRecommendations() { return [] }
export function getPotentialAdditionalGain() { return 0 }
export function getOffShelfOpportunityScore(entries: OffShelfEntry[]) {
  return 100 + calculateIncrementalOffShelfPoints(entries)
}
export function getChecklistQuestionsForSection() { return [] }
export function getChecklistSectionValue() { return 0 }
export function getVisitTypeLabel() { return 'New' }
export function getExecutionScore(checklist: Record<string, ChecklistAnswer>) { return calculateExecutionScore(checklist) }
export function getQuestionStatus(answer: ChecklistAnswer) {
  if (answer === 'no') return { label: 'Action Required', stripClass: 'bg-red-500', statusClass: 'text-red-700 bg-red-50 border-red-200' }
  if (answer === 'yes' || answer === 'na' || answer === 'partial') return { label: 'Complete', stripClass: 'bg-green-500', statusClass: 'text-green-700 bg-green-50 border-green-200' }
  return { label: 'Not Answered', stripClass: 'bg-gray-300', statusClass: 'text-gray-600 bg-gray-50 border-gray-200' }
}
export function getQuestionEvidenceLabel() { return 'No photo required' }
export function getLinkedQuestionTitles() { return [] }
duplicate void 0
