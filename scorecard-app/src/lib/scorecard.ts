import { displayCapacity, skuData } from '../data/mock'
import type {
  BasePlanItem,
  ChecklistAnswer,
  OffShelfEntry,
  OpportunityItem,
  RecommendationItem,
  RevisitItem,
  ScorecardSnapshot,
} from '../types'
import { basePlanItems, demoBasePlanLgorPercent, displayCapacity, skuData } from '../data/mock'

// ─── Execution Score ────────────────────────────────────────────────────────

export function calculateExecutionScore(
  answers: Record<string, ChecklistAnswer>,
  items: BasePlanItem[],
  partialCreditPercent = 0.5,
): number {
  let earned = 0
  let denominator = 0

  for (const item of items) {
    const answer = answers[item.id]
    if (answer === 'na' || answer === null) continue
    denominator += item.pointsMax
    if (answer === 'yes') earned += item.pointsMax
    else if (answer === 'partial') earned += item.pointsMax * partialCreditPercent
  }

  return Math.round(earned * 10) / 10
}

// ─── Base Plan LGOR Points ──────────────────────────────────────────────────

// 1:1 direct conversion — demo value pending business confirmation
export function calculateBasePlanLgorPoints(basePlanLgorPercent: number): number {
  return Math.round(basePlanLgorPercent * 10) / 10
}

// ─── Quantity Conversion ────────────────────────────────────────────────────

export function convertQuantityToUnits(
  quantity: number,
  unit: 'eaches' | 'cases' | 'pallets' | 'estimated',
  skuId: string,
): number {
  const sku = skuData.find(s => s.id === skuId)
  if (!sku) return quantity

  switch (unit) {
    case 'eaches':
    case 'estimated':
      return quantity
    case 'cases':
      return quantity * sku.unitsPerCase
    case 'pallets':
      return quantity * sku.unitsPerPallet
    default:
      return quantity
  }
}

// ─── Peak Week Logic ────────────────────────────────────────────────────────

export function calculatePeakWeekRatio(calculatedUnits: number, peakWeekUnits: number): number {
  if (peakWeekUnits <= 0) return 0
  return Math.round((calculatedUnits / peakWeekUnits) * 100) / 100
}

// Draft multiplier — thresholds pending business confirmation
export function calculatePeakWeekMultiplier(ratio: number): number {
  if (ratio >= 3) return 3
  if (ratio >= 2) return 2
  if (ratio >= 1) return 1
  return 0
}

// ─── Incremental Score ──────────────────────────────────────────────────────

export function calculateIncrementalItemPoints(lgorPercent: number, multiplier: number): number {
  return Math.round(lgorPercent * multiplier * 10) / 10
}

export function calculateIncrementalOffShelfPoints(entries: OffShelfEntry[]): number {
  const active = entries.filter(e => e.status === 'active')
  const total = active.reduce((sum, e) => sum + e.itemPoints, 0)
  return Math.round(total * 10) / 10
}

// ─── Final PSS Score ────────────────────────────────────────────────────────

export function calculateFinalPssScore(
  executionScore: number,
  basePlanLgorPoints: number,
  incrementalOffShelfPoints: number,
): number {
  return Math.round((executionScore + basePlanLgorPoints + incrementalOffShelfPoints) * 10) / 10
}

// ─── LGOR Rep % ─────────────────────────────────────────────────────────────

export function calculateIncrementalRawLgorPercent(entries: OffShelfEntry[]): number {
  const active = entries.filter(e => e.status === 'active')
  const total = active.reduce((sum, e) => sum + e.lgorPercent, 0)
  return Math.round(total * 10) / 10
}

export function calculateLgorRepPercent(
  basePlanLgorPercent: number,
  entries: OffShelfEntry[],
): number {
  const incremental = calculateIncrementalRawLgorPercent(entries)
  return Math.round((basePlanLgorPercent + incremental) * 10) / 10
}

// ─── Opportunity Items ───────────────────────────────────────────────────────

export function generateOpportunityItems(entries: OffShelfEntry[]): OpportunityItem[] {
  const activeSkuIds = new Set(
    entries.filter(e => e.status === 'active').map(e => e.skuId),
  )
  return skuData
    .filter(sku => sku.isRecommended && !activeSkuIds.has(sku.id))
    .map(sku => ({
      skuId: sku.id,
      productName: sku.name,
      rank: sku.rank,
      lgorPercent: sku.lgorPercent,
      quarterlyUnits: sku.quarterlyUnits,
      quarterlyDollarValue: sku.quarterlyDollarValue,
      peakWeekUnits: sku.peakWeekUnits,
      reason: 'Recommended SKU not currently off-shelf',
    }))
    .sort((a, b) => a.rank - b.rank)
}

// ─── Recommendations ────────────────────────────────────────────────────────

export function generateRecommendations(
  answers: Record<string, ChecklistAnswer>,
  entries: OffShelfEntry[],
): RecommendationItem[] {
  const recs: RecommendationItem[] = []
  const active = entries.filter(e => e.status === 'active')
  const activeSkuIds = new Set(active.map(e => e.skuId))

  // Missing: recommended SKU not off-shelf
  for (const sku of skuData.filter(s => s.isRecommended && !activeSkuIds.has(s.id))) {
    recs.push({
      id: `missing-${sku.id}`,
      type: 'missing',
      severity: sku.rank <= 2 ? 'high' : 'medium',
      sku: sku.name,
      message: `${sku.name} is a top-${sku.rank} LGOR SKU and is not currently off-shelf.`,
      currentValue: 'Not placed',
      recommendedValue: `Add ${sku.peakWeekUnits} units minimum`,
    })
  }

  // Not enough: placed but below peak week
  for (const entry of active) {
    if (entry.calculatedUnits < entry.peakWeekUnits) {
      const gap = entry.peakWeekUnits - entry.calculatedUnits
      recs.push({
        id: `not-enough-${entry.id}`,
        type: 'not-enough',
        severity: gap > 50 ? 'high' : 'medium',
        sku: entry.productName,
        displayLocation: entry.location,
        message: `${entry.productName} at ${entry.location} is below peak week demand.`,
        currentValue: `${entry.calculatedUnits} units`,
        recommendedValue: `${entry.peakWeekUnits} units (gap: ${gap})`,
      })
    }
  }

  // Empty calories: non-recommended SKU taking display space
  for (const entry of active) {
    const sku = skuData.find(s => s.id === entry.skuId)
    if (sku && !sku.isRecommended) {
      recs.push({
        id: `empty-calories-${entry.id}`,
        type: 'empty-calories',
        severity: 'low',
        sku: entry.productName,
        displayLocation: entry.location,
        message: `${entry.productName} at ${entry.location} is not a recommended priority SKU.`,
        currentValue: 'Non-priority SKU placed',
        recommendedValue: 'Replace with recommended priority SKU',
      })
    }
  }

  // Missing MAP: required base plan item marked No or Partial
  for (const [itemId, answer] of Object.entries(answers)) {
    if (answer === 'no' || answer === 'partial') {
      recs.push({
        id: `missing-map-${itemId}`,
        type: 'missing-map',
        severity: answer === 'no' ? 'high' : 'medium',
        message: `Base plan item is ${answer === 'no' ? 'missing' : 'partially executed'}.`,
        currentValue: answer === 'no' ? 'Not executed' : 'Partial execution',
        recommendedValue: 'Full execution required',
      })
    }
  }

  // Capacity gap: peak week demand exceeds display location capacity
  for (const entry of active) {
    const cap = displayCapacity.find(d => d.location === entry.location)
    if (cap && entry.peakWeekUnits > cap.capacityUnits) {
      const gap = entry.peakWeekUnits - cap.capacityUnits
      recs.push({
        id: `capacity-gap-${entry.id}`,
        type: 'capacity-gap',
        severity: 'medium',
        sku: entry.productName,
        displayLocation: entry.location,
        message: `${entry.location} capacity (${cap.capacityUnits} units) is below ${entry.productName} peak week demand.`,
        currentValue: `${cap.capacityUnits} unit capacity`,
        recommendedValue: `Need ${entry.peakWeekUnits} units (gap: ${gap})`,
      })
    }
  }

  return recs
}

// ─── Revisit Suggestions ────────────────────────────────────────────────────

export function generateRevisitSuggestions(
  recommendations: RecommendationItem[],
  _entries: OffShelfEntry[],
): Omit<RevisitItem, 'id' | 'status' | 'notes'>[] {
  return recommendations
    .filter(r => r.severity === 'high')
    .map(r => ({
      reason: r.message,
      sku: r.sku,
      displayLocation: r.displayLocation,
      assignedOwner: '',
      dueDate: '',
    }))
}

// ─── Snapshot Builder ────────────────────────────────────────────────────────

export function buildSnapshot(
  executionScore: number,
  basePlanLgorPercent: number,
  entries: OffShelfEntry[],
): ScorecardSnapshot {
  const basePlanLgorPoints = calculateBasePlanLgorPoints(basePlanLgorPercent)
  const incrementalOffShelfPoints = calculateIncrementalOffShelfPoints(entries)
  const finalScore = calculateFinalPssScore(executionScore, basePlanLgorPoints, incrementalOffShelfPoints)
  const incrementalRawLgorPercent = calculateIncrementalRawLgorPercent(entries)
  const lgorRepPercent = calculateLgorRepPercent(basePlanLgorPercent, entries)
  return {
    id: crypto.randomUUID(),
    takenAt: new Date().toISOString(),
    submittedBy: 'Sarah M.',
    executionScore,
    basePlanLgorPercent,
    basePlanLgorPoints,
    incrementalRawLgorPercent,
    incrementalOffShelfPoints,
    finalScore,
    lgorRepPercent,
    offShelfItemCount: entries.filter(e => e.status === 'active').length,
  }
}

// ─── Off-Shelf Entry Builder ─────────────────────────────────────────────────

export function buildOffShelfEntry(params: {
  skuId: string
  location: string
  quantity: number
  unit: 'eaches' | 'cases' | 'pallets' | 'estimated'
  notes?: string
}): OffShelfEntry {
  const sku = skuData.find(s => s.id === params.skuId)
  const calculatedUnits = convertQuantityToUnits(params.quantity, params.unit, params.skuId)
  const lgorPercent = sku?.lgorPercent ?? 0
  const peakWeekUnits = sku?.peakWeekUnits ?? 0
  const peakWeekRatio = calculatePeakWeekRatio(calculatedUnits, peakWeekUnits)
  const peakWeekMultiplier = calculatePeakWeekMultiplier(peakWeekRatio)
  const itemPoints = calculateIncrementalItemPoints(lgorPercent, peakWeekMultiplier)

  return {
    id: crypto.randomUUID(),
    skuId: params.skuId,
    productName: sku?.name ?? params.skuId,
    location: params.location,
    quantity: params.quantity,
    unit: params.unit,
    calculatedUnits,
    lgorPercent,
    peakWeekUnits,
    peakWeekRatio,
    peakWeekMultiplier,
    itemPoints,
    notes: params.notes ?? '',
    status: 'active',
  }
}

// ─── Legacy backward-compat shims ────────────────────────────────────────────
// These stubs keep old imports from crashing. They return neutral/zero values.

export function getRiskDelta() { return 0 }
export function getCurrentRiskValue() { return 0 }
export function estimateOffShelfImpact() { return { points: 0, lgorPct: 0 } }
export function createInitialEvidenceState() { return {} }
export function getTotalChecks() { return 0 }
export function getTotalSections() { return 0 }
export function getAnsweredChecks() { return 0 }
export function getRequiredPhotoCount() { return 0 }
export function getCapturedRequiredPhotos() { return 0 }
export function getMissingRequiredEvidence() { return [] }
export function getCompletionPercent() { return 0 }
export function getScorecardStatus() { return 'not-started' as const }
export function getChecklistBasePlanScore() { return 0 }
export function getOffShelfIncrementalScore() { return 0 }
export function getTotalScore() { return 0 }
export function getLgorPct() { return 0 }
export function getOffShelfProductById() { return null }
export function getPendingFollowUpEntries() { return [] }
export function getVisitTypeLabel() { return '' }
export function getActiveScorecardSections() { return [] }
export function getYesCount() { return 0 }
