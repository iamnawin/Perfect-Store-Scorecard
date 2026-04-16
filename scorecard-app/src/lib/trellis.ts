import {
  accountabilitySeed,
  checklistQuestions,
  leaderboardSeed,
  previousSnapshot,
  regionalPerformanceSeed,
  regionBenchmark,
  store,
} from '../data/mock'
import type {
  AppState,
  ChecklistAnswer,
  ChecklistQuestion,
  LeaderboardEntry,
  OffShelfProduct,
  TrellisChecklistSuggestion,
  TrellisManagerSummaryDraft,
  TrellisOffShelfInsight,
  TrellisRevisitIntelligence,
  TrellisSummaryInsight,
  TrellisTopRecommendation,
  TrellisVisitBriefing,
} from '../types'
import {
  estimateOffShelfImpact,
  getChecklistBasePlanScore,
  getCapturedRequiredPhotos,
  getCurrentRiskValue,
  getLgorPct,
  getMissingRequiredEvidence,
  getOffShelfIncrementalScore,
  getPendingFollowUpEntries,
  getRemainingOffShelfRecommendations,
  getRequiredPhotoCount,
  getTotalScore,
} from './scorecard'

type SuggestionConfig = {
  fix: string
  estimatedGain: number
  supportingText?: string
  route: string
  actionLabel: string
}

const suggestionConfig: Record<string, SuggestionConfig> = {
  endcap: {
    fix: 'Add Turf Builder display near the front entrance to recover premium feature visibility.',
    estimatedGain: 10,
    supportingText: 'Endcap is a top-weighted display, so Agentforce routes the rep directly into off-shelf capture.',
    route: '/off-shelf',
    actionLabel: 'Add Off-Shelf Display',
  },
  'garden-doors': {
    fix: 'Build a Garden Door stack with Potting Mix or EZ Seed to close the repeated outdoor gap.',
    estimatedGain: 6,
    supportingText: 'This store has missed Garden Door execution for consecutive visits, so Agentforce keeps it prominent.',
    route: '/off-shelf',
    actionLabel: 'Add Off-Shelf Display',
  },
  fenceline: {
    fix: 'Load a Weed and Feed fence-line display with visible signage before traffic peaks.',
    estimatedGain: 9,
    supportingText: 'Fence Line remains the strongest remaining recovery action in this banner.',
    route: '/off-shelf',
    actionLabel: 'Add Off-Shelf Display',
  },
  racetrack: {
    fix: 'Add a plant-food racetrack display to restore shoppability in the highest-traffic aisle.',
    estimatedGain: 6,
    supportingText: 'Racetrack misses reduce conversion on weekend trips when feature space is most productive.',
    route: '/off-shelf',
    actionLabel: 'Add Off-Shelf Display',
  },
  'plant-food-pog': {
    fix: 'Re-block plant food facings to approved POG and capture a clean shelf photo for manager review.',
    estimatedGain: 7,
    route: '/photo',
    actionLabel: 'Capture Evidence',
  },
  'chemical-pog': {
    fix: 'Correct chemical label placement and confirm safety signage before closing the visit.',
    estimatedGain: 5,
    route: '/photo',
    actionLabel: 'Capture Evidence',
  },
  'grass-seed-pog': {
    fix: 'Front key Scotts grass seed SKUs and document the shelf view once it is reset.',
    estimatedGain: 8,
    route: '/photo',
    actionLabel: 'Capture Evidence',
  },
  'indoor-soil-pog': {
    fix: 'Close indoor soil gaps and add a note if inventory or POG constraints remain unresolved.',
    estimatedGain: 6,
    route: '/photo',
    actionLabel: 'Capture Evidence',
  },
  'map-fence-line': {
    fix: 'Set the required Fence Line base location before logging incremental displays against it.',
    estimatedGain: 6,
    route: '/checklist/base-plan',
    actionLabel: 'Return to Base Plan',
  },
  'map-drive-aisle': {
    fix: 'Confirm the Drive Aisle base set so later off-shelf gains are counted cleanly.',
    estimatedGain: 6,
    route: '/checklist/base-plan',
    actionLabel: 'Return to Base Plan',
  },
  'map-endcap': {
    fix: 'Reset the core Endcap base plan first, then use off-shelf capture for true incremental displays.',
    estimatedGain: 8,
    route: '/checklist/base-plan',
    actionLabel: 'Return to Base Plan',
  },
  'map-garden-doors': {
    fix: 'Set the Garden Door base location before trying to recover the repeated display gap.',
    estimatedGain: 7,
    route: '/checklist/base-plan',
    actionLabel: 'Return to Base Plan',
  },
}

export function getEntryVisitBriefing(state: AppState): TrellisVisitBriefing {
  const failedDisplays = getFailedQuestions(state, question => question.group === 'display')
  const topRecommendation = getRemainingOffShelfRecommendations(state.offShelf)[0]
  const repeatedGap = failedDisplays.find(question => question.id === 'garden-doors')
    ? 'Garden Door still unresolved after two prior visits.'
    : 'Garden Door missing for 2 visits.'
  const suggestedFocus = failedDisplays.length > 0
    ? 'Secondary Displays'
    : state.offShelf.length === 0
      ? 'Incremental Displays'
      : 'Base Plan Recovery'
  const topOpportunity = topRecommendation?.product
    ? `${topRecommendation.product.name} at ${topRecommendation.location} (+${Math.round(topRecommendation.potentialPoints)} pts potential)`
    : 'Weed & Feed Endcap (+12 pts potential)'

  return {
    lastVisitScore: previousSnapshot.score,
    regionAverage: regionBenchmark.averageScore,
    repeatedGap,
    topOpportunity,
    suggestedFocus,
    focusReason: failedDisplays.length > 0
      ? 'Repeated display misses are the fastest way to recover score in this store.'
      : 'This visit is clear to push incremental displays once base plan is confirmed.',
  }
}

export function getTopRecommendation(state: AppState): TrellisTopRecommendation {
  const missingEvidence = getMissingRequiredEvidence(state.evidence, state.offShelf)
  if (missingEvidence.length > 0) {
    return {
      title: 'Close the evidence gap before anything else',
      summary: `${missingEvidence[0].title} is still missing, so the visit cannot close cleanly yet.`,
      impactLabel: 'Removes submit blocker',
      reason: 'Evidence is the only blocker that can invalidate otherwise strong execution.',
      actionLabel: 'Open Photo Evidence',
      route: '/photo',
      tone: 'warning',
    }
  }

  if (state.visitType === 'follow-up') {
    const pendingEntries = getPendingFollowUpEntries(state.offShelf)
    if (pendingEntries.length > 0) {
      const targetEntry = pendingEntries[0]
      return {
        title: 'Finish the next revisit decision',
        summary: `Review ${targetEntry.location} | ${targetEntry.product} and mark it as kept, updated, or removed.`,
        impactLabel: `${pendingEntries.length} revisit decision${pendingEntries.length > 1 ? 's' : ''} open`,
        reason: 'Agentforce clears pending previous-visit displays first so the change log is trustworthy.',
        actionLabel: 'Open Revisit Review',
        route: '/off-shelf',
        tone: 'info',
      }
    }
  }

  const failedQuestions = getFailedQuestions(state)
    .sort((left, right) => right.weight - left.weight)
  if (failedQuestions.length > 0) {
    const topMiss = failedQuestions[0]
    const config = suggestionConfig[topMiss.id]
    return {
      title: 'Fix the highest-value miss first',
      summary: config?.fix ?? `${topMiss.title} is the best score recovery move still open in this visit.`,
      impactLabel: formatSigned(config?.estimatedGain ?? Math.max(4, topMiss.weight - 2)),
      reason: `${topMiss.title} carries ${topMiss.weight} weighted checklist points and influences manager review.`,
      actionLabel: config?.actionLabel ?? 'Resolve Issue',
      route: config?.route ?? '/checklist/base-plan',
      tone: topMiss.group === 'display' ? 'warning' : 'info',
    }
  }

  const topRemaining = getRemainingOffShelfRecommendations(state.offShelf)[0]
  if (topRemaining?.product) {
    return {
      title: 'Capture the best remaining incremental win',
      summary: `Add ${topRemaining.product.name} at ${topRemaining.location} to convert the strongest open upside in the store.`,
      impactLabel: formatSigned(topRemaining.potentialPoints),
      reason: topRemaining.rationale,
      actionLabel: 'Open Off-Shelf',
      route: '/off-shelf',
      tone: 'success',
    }
  }

  return {
    title: 'Keep the visit on a clean close path',
    summary: 'Core execution looks covered. Use the summary to confirm the score story and next action.',
    impactLabel: 'Ready for review',
    reason: 'No major checklist, revisit, or evidence blockers remain open.',
    actionLabel: 'Open Summary',
    route: '/summary',
    tone: 'success',
  }
}

export function getChecklistHeaderInsight(state: AppState) {
  const failedHighImpact = getFailedQuestions(state, question => question.weight >= 15)[0]
  const unansweredHighImpact = checklistQuestions
    .filter(question => !state.checklist[question.id])
    .sort((left, right) => right.weight - left.weight)[0]

  if (failedHighImpact) {
    return {
      title: 'Highest-value misses need attention first',
      summary: `${failedHighImpact.title} is dragging score and should be corrected before the rep leaves the aisle.`,
      tone: 'warning' as const,
      items: [
        { label: 'Repeated gap', value: 'Garden Door / display execution is the current accountability risk.', tone: 'warning' as const },
        { label: 'Best recovery move', value: 'Use off-shelf capture to convert misses into guided recovery actions.', tone: 'success' as const },
      ],
    }
  }

  if (unansweredHighImpact) {
    return {
      title: 'Best focus for this section',
      summary: `Answer ${unansweredHighImpact.title} next. It is one of the highest-impact checks in the visit.`,
      tone: 'info' as const,
      items: [
        { label: 'Current objective', value: 'Protect base plan first, then recover score through secondary displays.' },
        { label: 'Manager lens', value: 'Repeated display misses will stand out in the final summary if they remain open.' },
      ],
    }
  }

  return {
    title: 'Checklist is in a strong place',
    summary: 'Continue capturing high-impact execution details so the visit summary reflects the strongest wins and remaining gaps.',
    tone: 'success' as const,
    items: [
      { label: 'What is working', value: 'Completed checks are already feeding score impact and accountability logic.', tone: 'success' as const },
      { label: 'Next step', value: 'Push the strongest off-shelf opportunity before final evidence review.' },
    ],
  }
}

export function getChecklistSuggestion(question: ChecklistQuestion, answer: ChecklistAnswer): TrellisChecklistSuggestion | null {
  if (answer !== 'no') return null

  const config = suggestionConfig[question.id]

  return {
    issue: `${question.title} missed`,
    impactLabel: `${formatSigned(-question.weight)} pts`,
    suggestedFix: config?.fix ?? 'Resolve the execution miss now so score impact is recovered before submit.',
    estimatedGainLabel: formatSigned(config?.estimatedGain ?? Math.max(4, question.weight - 2)),
    action: {
      label: config?.actionLabel ?? 'Resolve Issue',
      intent: question.group === 'display' ? 'primary' : 'secondary',
    },
    route: config?.route ?? '/checklist/base-plan',
    supportingText: config?.supportingText ?? 'This action can materially change the visit outcome before submission.',
  }
}

export function getOffShelfInsight({
  state,
  location,
  quantity,
  classification,
  product,
}: {
  state: AppState
  location: string
  quantity: number | string | ''
  classification: 'base-plan' | 'incremental' | 'not-sure'
  product?: OffShelfProduct
}): TrellisOffShelfInsight {
  const topRemaining = getRemainingOffShelfRecommendations(state.offShelf)[0]

  if (!product || !location || quantity === '') {
    return {
      title: 'Best remaining action',
      impactLabel: topRemaining?.product ? formatSigned(topRemaining.potentialPoints) : '+9 pts',
      lgorLabel: topRemaining?.product ? `+${topRemaining.product.baseLgor.toFixed(1)}% LGOR` : '+2.0% LGOR',
      suggestedNextMove: topRemaining?.product
        ? `Start with ${topRemaining.product.name} at ${topRemaining.location}.`
        : 'Start with a Weed and Feed Fence Line display.',
      supportingText: topRemaining?.rationale ?? 'Agentforce ranks the next display based on store history and remaining point upside.',
      tone: 'info',
    }
  }

  const impact = estimateOffShelfImpact({
    product,
    location,
    quantity,
    classification,
  })
  const secondaryLocation = product.recommendedLocations.find(candidate => candidate !== location) ?? 'Garden Door'
  const nextMoveImpact = Math.round(estimateOffShelfImpact({
    product,
    location: secondaryLocation,
    quantity: 80,
    classification: 'incremental',
  }).impactPoints)

  if (classification === 'base-plan') {
    return {
      title: 'This looks like base plan coverage',
      impactLabel: '+0 pts incremental',
      lgorLabel: `+${impact.estimatedLgor.toFixed(1)}% LGOR`,
      suggestedNextMove: `If you can add a second display at ${secondaryLocation}, Agentforce projects about +${nextMoveImpact} pts.`,
      supportingText: 'Base plan entries protect execution credibility, but incremental gain only starts after the core set is covered.',
      tone: 'warning',
    }
  }

  return {
    title: product.basePoints >= 9 || product.recommendedLocations.includes(location)
      ? 'This SKU is high-impact for this store'
      : 'This display will add measurable lift',
    impactLabel: formatSigned(impact.impactPoints),
    lgorLabel: `+${impact.estimatedLgor.toFixed(1)}% LGOR`,
    suggestedNextMove: `Add one more display near ${secondaryLocation} for about +${nextMoveImpact} pts.`,
    supportingText: product.recommendedLocations.includes(location)
      ? `${location} is an Agentforce-preferred location for ${product.name} in this banner.`
      : `${product.name} still adds value here, but Agentforce likes ${product.recommendedLocations.join(' or ')} even more.`,
    tone: product.recommendedLocations.includes(location) ? 'success' : 'info',
  }
}

export function getPhotoInsight(state: AppState) {
  const missingEvidence = getMissingRequiredEvidence(state.evidence, state.offShelf)
  const requiredPhotoCount = getRequiredPhotoCount()
  const capturedPhotos = getCapturedRequiredPhotos(state.evidence, state.offShelf)

  if (missingEvidence.length > 0) {
    return {
      title: 'Evidence watch',
      summary: `${missingEvidence[0]?.title} is still missing. Submission stays blocked until required proof is captured.`,
      tone: 'warning' as const,
      metrics: [
        { label: 'Captured', value: `${capturedPhotos}/${requiredPhotoCount}` },
        { label: 'Missing', value: String(missingEvidence.length) },
      ],
    }
  }

  return {
    title: 'Evidence is ready for manager review',
    summary: 'Required photo proof is in place, so the visit outcome can be reviewed with confidence.',
    tone: 'success' as const,
    metrics: [
      { label: 'Captured', value: `${capturedPhotos}/${requiredPhotoCount}` },
      { label: 'Submission', value: 'Clear' },
    ],
  }
}

export function getSummaryInsight(state: AppState): TrellisSummaryInsight {
  const scoreDelta = getTotalScore(state) - previousSnapshot.score
  const failedQuestions = getFailedQuestions(state)
  const remainingOpportunity = getRemainingOffShelfRecommendations(state.offShelf)[0]
  const mainPositiveDriver = state.offShelf.length > 0
    ? `${state.offShelf.length} incremental display${state.offShelf.length > 1 ? 's' : ''} added`
    : getTopResolvedDriver(state)
  const biggestMissedOpportunity = failedQuestions.find(question => question.id === 'garden-doors')
    ? 'Garden Door execution remained unresolved'
    : remainingOpportunity?.product
      ? `${remainingOpportunity.product.name} at ${remainingOpportunity.location}`
      : 'Secondary display recovery'
  const nextVisitFocus = failedQuestions.length > 0
    ? 'Stabilize base plan, close repeated display gaps, and add 2 incremental displays.'
    : 'Repeat the winning display mix and lock photo evidence earlier in the visit.'

  return {
    scoreDelta,
    mainPositiveDriver,
    biggestMissedOpportunity,
    nextVisitFocus,
    narrative: scoreDelta >= 0
      ? `You improved score by ${formatSigned(scoreDelta)}. ${capitalize(mainPositiveDriver)} created the biggest lift. The next unlock is ${biggestMissedOpportunity.toLowerCase()}.`
      : `Score is down ${Math.abs(scoreDelta)} points. ${capitalize(biggestMissedOpportunity)} is the main drag, so the next visit should focus on ${nextVisitFocus.toLowerCase()}.`,
  }
}

export function getRevisitIntelligence(state: AppState): TrellisRevisitIntelligence {
  const retainedCount = state.offShelf.filter(entry => entry.status === 'retained').length
  const updatedCount = state.offShelf.filter(entry => entry.status === 'updated').length
  const removedCount = state.offShelf.filter(entry => entry.status === 'removed').length
  const addedCount = state.offShelf.filter(entry => entry.status === 'added').length
  const pendingCount = getPendingFollowUpEntries(state.offShelf).length
  const totalReviewed = retainedCount + updatedCount + removedCount + addedCount
  const scoreDelta = getTotalScore(state) - previousSnapshot.score
  const items = [
    { label: 'Retained / Updated', value: `${retainedCount} / ${updatedCount}`, tone: updatedCount > 0 ? 'success' as const : 'info' as const },
    { label: 'Removed / Added', value: `${removedCount} / ${addedCount}`, tone: addedCount > 0 ? 'success' as const : removedCount > 0 ? 'warning' as const : 'info' as const },
    { label: 'Pending review', value: `${pendingCount}`, tone: pendingCount > 0 ? 'warning' as const : 'success' as const },
    { label: 'Score impact vs last', value: `${scoreDelta >= 0 ? '+' : ''}${scoreDelta.toFixed(1)} pts`, tone: scoreDelta >= 0 ? 'success' as const : 'warning' as const },
  ]

  if (pendingCount > 0) {
    return {
      title: 'Revisit intelligence still needs more decisions',
      summary: `${totalReviewed} prior display change${totalReviewed === 1 ? '' : 's'} reviewed so far. Agentforce still needs the remaining display decisions to finalize the delta story.`,
      statusLabel: `${pendingCount} pending`,
      tone: 'warning',
      items,
      footer: 'Finish the pending revisit decisions before relying on the change-tracking summary.',
    }
  }

  return {
    title: 'Revisit intelligence has a clean delta story',
    summary: `This revisit now shows what held, what changed, what dropped, and what was added since the previous completed scorecard.`,
    statusLabel: 'Delta ready',
    tone: scoreDelta >= 0 ? 'success' : 'info',
    items,
    footer: 'Agentforce can now explain the revisit as a change-tracking run instead of a resumed draft.',
  }
}

export function getManagerSummaryDraft(state: AppState): TrellisManagerSummaryDraft {
  const score = getTotalScore(state)
  const scoreDelta = score - previousSnapshot.score
  const incrementalScore = getOffShelfIncrementalScore(state.offShelf)
  const pendingRevisit = state.visitType === 'follow-up' ? getPendingFollowUpEntries(state.offShelf).length : 0
  const missingEvidence = getMissingRequiredEvidence(state.evidence, state.offShelf).length
  const topRecommendation = getTopRecommendation(state)
  const riskValue = getCurrentRiskValue(state)
  const lgorPct = getLgorPct(state)
  const retainedCount = state.offShelf.filter(entry => entry.status === 'retained').length
  const updatedCount = state.offShelf.filter(entry => entry.status === 'updated').length
  const removedCount = state.offShelf.filter(entry => entry.status === 'removed').length
  const addedCount = state.offShelf.filter(entry => entry.status === 'added').length
  const executionPhrase = state.visitType === 'follow-up'
    ? `Revisit run is at ${score.toFixed(1)} total score (${scoreDelta >= 0 ? '+' : ''}${scoreDelta.toFixed(1)} vs last completed visit).`
    : `Current run is at ${score.toFixed(1)} total score with ${incrementalScore.toFixed(1)} points of incremental value captured.`
  const changePhrase = state.visitType === 'follow-up'
    ? `Display changes: ${retainedCount} retained, ${updatedCount} updated, ${removedCount} removed, ${addedCount} added.`
    : `Base plan score is ${getChecklistBasePlanScore(state.checklist).toFixed(1)} and LGOR support is ${lgorPct.toFixed(1)}%.`
  const blockerPhrase = missingEvidence > 0
    ? `${missingEvidence} required photo${missingEvidence > 1 ? 's are' : ' is'} still missing, so submission should stay open until proof is captured.`
    : pendingRevisit > 0
      ? `${pendingRevisit} revisit decision${pendingRevisit > 1 ? 's are' : ' is'} still pending before closeout.`
      : `No critical blockers remain; current risk sits at ${formatCurrency(riskValue)}.`
  const narrative = `${executionPhrase} ${changePhrase} ${blockerPhrase} Recommended next action: ${topRecommendation.summary}`

  return {
    title: 'Manager Summary Draft',
    summary: 'Agentforce-generated business summary for manager review.',
    narrative,
    highlights: [
      { label: 'Store', value: store.name },
      { label: 'Score / LGOR', value: `${score.toFixed(1)} | ${lgorPct.toFixed(1)}%`, tone: scoreDelta >= 0 ? 'success' : 'warning' },
      { label: 'Risk', value: formatCurrency(riskValue), tone: missingEvidence === 0 ? 'success' : 'warning' },
      { label: 'Top recommendation', value: topRecommendation.summary, tone: topRecommendation.tone },
    ],
  }
}

export function getSummaryKpis(state: AppState) {
  const mapQuestions = checklistQuestions.filter(question => question.group === 'map')
  const pogQuestions = checklistQuestions.filter(question => question.group === 'pog')
  const displayQuestions = checklistQuestions.filter(question => question.group === 'display')
  const evidencePct = Math.round((getCapturedRequiredPhotos(state.evidence, state.offShelf) / Math.max(1, getRequiredPhotoCount())) * 100)
  const mapPct = getYesPercent(state, mapQuestions)
  const pogPct = getYesPercent(state, pogQuestions)
  const displayPct = getYesPercent(state, displayQuestions)
  const merchandisingPct = clamp(Math.round(displayPct * 0.7 + Math.min(30, getOffShelfIncrementalScore(state.offShelf) * 1.8)), 0, 100)
  const pricingPct = clamp(Math.round(displayPct * 0.4 + evidencePct * 0.35 + state.offShelf.length * 10), 0, 100)

  return [
    { label: 'Base Plan %', value: `${Math.round(mapPct * 0.4 + pogPct * 0.6)}%` },
    { label: 'Merchandising %', value: `${merchandisingPct}%` },
    { label: 'Inventory %', value: `${Math.round(pogPct)}%` },
    { label: 'Pricing %', value: `${pricingPct}%` },
  ]
}

export function getSummaryRisks(state: AppState) {
  const failedQuestions = getFailedQuestions(state)
  const missingEvidence = getMissingRequiredEvidence(state.evidence, state.offShelf)
  const pogMisses = failedQuestions.filter(question => question.group === 'pog')
  const risks = []

  if (failedQuestions.some(question => question.id === 'garden-doors')) {
    risks.push({ label: 'Missing Garden Door', value: 'Repeated gap still open', tone: 'warning' as const })
  }

  if (pogMisses.length > 0) {
    risks.push({ label: 'POG non-compliance', value: `${pogMisses.length} shelf standard${pogMisses.length > 1 ? 's' : ''} unresolved`, tone: 'warning' as const })
  }

  if (missingEvidence.length > 0) {
    risks.push({ label: 'Missing photo evidence', value: `${missingEvidence.length} required image${missingEvidence.length > 1 ? 's' : ''} still missing`, tone: 'warning' as const })
  }

  if (risks.length === 0) {
    risks.push({ label: 'Execution risk', value: 'No material risk flags remain', tone: 'success' as const })
  }

  return risks
}

export function getSummaryOpportunities(state: AppState) {
  return getRemainingOffShelfRecommendations(state.offShelf)
    .slice(0, 2)
    .map(item => ({
      label: `Add ${item.location} display`,
      value: `+${Math.round(item.potentialPoints)} pts with ${item.product?.name ?? 'recommended SKU'}`,
      tone: 'success' as const,
    }))
}

export function getLeaderboardPreview(score: number): LeaderboardEntry[] {
  const entries = [...leaderboardSeed]
  entries.push({ store: store.name, rep: store.rep, score: Math.round(score), delta: Math.round(score - previousSnapshot.score) })

  return entries
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))
}

export function getRegionalOutcomeSummary(state: AppState) {
  const score = getTotalScore(state)
  const lgorPct = getLgorPct(state)
  const riskValue = getCurrentRiskValue(state)
  const comparisonRows = [
    ...regionalPerformanceSeed,
    {
      store: store.name,
      score: Math.round(score),
      lgorPct,
      riskValue,
      incrementalValue: getOffShelfIncrementalScore(state.offShelf),
    },
  ]
  const scoreRank = getMetricRank(comparisonRows, 'score', 'desc', store.name)
  const lgorRank = getMetricRank(comparisonRows, 'lgorPct', 'desc', store.name)
  const riskRank = getMetricRank(comparisonRows, 'riskValue', 'asc', store.name)
  const riskMinimizedValue = Math.max(0, regionBenchmark.currentRiskValue - riskValue)

  return {
    scoreGap: +(score - regionBenchmark.averageScore).toFixed(1),
    lgorGap: +(lgorPct - regionBenchmark.averageLgor).toFixed(1),
    scoreRankLabel: `${scoreRank}/${comparisonRows.length}`,
    lgorRankLabel: `${lgorRank}/${comparisonRows.length}`,
    riskRankLabel: `${riskRank}/${comparisonRows.length}`,
    currentRiskValue: riskValue,
    riskMinimizedValue,
    regionAverageScore: regionBenchmark.averageScore,
    regionAverageLgor: regionBenchmark.averageLgor,
  }
}

export function getIncrementalOutputRows(state: AppState) {
  const activeEntries = state.offShelf
    .filter(entry => entry.status !== 'removed' && entry.status !== 'pending-review')
    .sort((left, right) => right.impactPoints - left.impactPoints)
    .slice(0, 3)

  if (activeEntries.length === 0) {
    return [{
      label: 'No incremental displays captured yet',
      detail: 'Above-and-beyond value starts when at least one active display is added and confirmed.',
      value: 'Open',
      tone: 'warning' as const,
    }]
  }

  return activeEntries.map(entry => ({
    label: `${entry.location} | ${entry.product}`,
    detail: `${getQuantitySummary(entry.quantity)} display contributing ${entry.estimatedLgor.toFixed(1)}% LGOR lift.`,
    value: formatSigned(entry.impactPoints),
    tone: entry.classification === 'incremental' ? 'success' as const : 'warning' as const,
  }))
}

export function getOpportunityTable(state: AppState) {
  const recommendations = getRemainingOffShelfRecommendations(state.offShelf).slice(0, 3)

  if (recommendations.length === 0) {
    return [{
      label: 'Top opportunity list is clear',
      detail: 'Recommended placements are already captured in the current scorecard.',
      value: 'Captured',
      tone: 'success' as const,
    }]
  }

  return recommendations.map(item => ({
    label: `${item.location} | ${item.product?.name ?? 'Recommended SKU'}`,
    detail: item.rationale,
    value: formatSigned(item.potentialPoints),
    tone: 'success' as const,
  }))
}

export function getRiskTable(state: AppState) {
  const failedQuestions = getFailedQuestions(state)
  const missingEvidence = getMissingRequiredEvidence(state.evidence, state.offShelf)
  const rows = []

  if (failedQuestions.some(question => question.id === 'garden-doors')) {
    rows.push({
      label: 'Repeated gap | Garden Door',
      detail: 'This location is still missing from the feature mix and continues to suppress seasonal conversion.',
      value: 'Open',
      tone: 'warning' as const,
    })
  }

  failedQuestions
    .filter(question => question.group === 'pog')
    .slice(0, 2)
    .forEach(question => {
      rows.push({
        label: `POG risk | ${question.title}`,
        detail: question.businessWhy,
        value: `-${question.weight}`,
        tone: 'warning' as const,
      })
    })

  if (missingEvidence.length > 0) {
    rows.push({
      label: 'Evidence risk',
      detail: `${missingEvidence.length} required photo${missingEvidence.length > 1 ? 's are' : ' is'} still missing from the visit proof set.`,
      value: 'Blocked',
      tone: 'warning' as const,
    })
  }

  if (rows.length === 0) {
    rows.push({
      label: 'Current risk is controlled',
      detail: 'No material execution or evidence risks remain open in this scorecard.',
      value: 'Clear',
      tone: 'success' as const,
    })
  }

  return rows.slice(0, 3)
}

export function getAccountabilityRows(state: AppState) {
  const missingEvidence = getMissingRequiredEvidence(state.evidence, state.offShelf).length
  const repeatedGapOpen = getFailedQuestions(state).some(question => question.id === 'garden-doors')
  const basePlanPct = Math.round(getYesPercent(state, checklistQuestions.filter(question => question.group !== 'display')))
  const incrementalScore = getOffShelfIncrementalScore(state.offShelf)

  return accountabilitySeed.map(item => {
    if (item.area === 'FST Accountability') {
      return {
        ...item,
        status: missingEvidence === 0 ? 'On track' : 'Needs evidence closeout',
        detail: missingEvidence === 0
          ? `Visit proof is in place and score is ${formatSigned(getTotalScore(state) - previousSnapshot.score)} vs last completed run.`
          : `${missingEvidence} required image${missingEvidence > 1 ? 's' : ''} still block clean closeout.`,
        tone: missingEvidence === 0 ? 'success' as const : 'warning' as const,
      }
    }

    if (item.area === 'BDT Accountability') {
      return {
        ...item,
        status: repeatedGapOpen ? 'Repeated gap open' : 'Recovery path defined',
        detail: repeatedGapOpen
          ? 'Garden Door execution still requires follow-through in the next field cycle.'
          : 'The highest-risk repeated gap is closed or explicitly tracked in this visit.',
        tone: repeatedGapOpen ? 'warning' as const : 'success' as const,
      }
    }

    if (item.area === 'Base Plan Accountability') {
      return {
        ...item,
        status: basePlanPct >= 80 ? 'Protected' : 'At risk',
        detail: `${basePlanPct}% of base-plan checks are currently supported by visible execution.`,
        tone: basePlanPct >= 80 ? 'success' as const : 'warning' as const,
      }
    }

    return {
      ...item,
      status: incrementalScore > 0 ? 'Value captured' : 'Upside still open',
      detail: incrementalScore > 0
        ? `${incrementalScore.toFixed(1)} points of above-and-beyond value are now tied to feature space.`
        : 'Premium space still needs an incremental display to show clear return on brand presence.',
      tone: incrementalScore > 0 ? 'success' as const : 'warning' as const,
    }
  })
}

export function getFeedbackLoopRows(state: AppState) {
  const score = getTotalScore(state)
  const lgorPct = getLgorPct(state)
  const riskValue = getCurrentRiskValue(state)
  const basePlanScore = Math.round(getYesPercent(state, checklistQuestions.filter(question => question.group !== 'display')))
  const incrementalScore = getOffShelfIncrementalScore(state.offShelf)
  const opportunityScore = getRemainingOffShelfRecommendations(state.offShelf)
    .slice(0, 2)
    .reduce((total, item) => total + item.potentialPoints, 0)

  return [
    {
      label: 'FST vs Base Plan',
      value: `${basePlanScore}%`,
      detail: basePlanScore >= 80
        ? 'The field visit is protecting the core plan well enough to measure true incremental lift.'
        : 'Base plan support is still soft, so incremental gains are less defensible.',
      tone: basePlanScore >= 80 ? 'success' as const : 'warning' as const,
    },
    {
      label: 'FST = POS',
      value: `${lgorPct.toFixed(1)}%`,
      detail: incrementalScore > 0
        ? 'LGOR lift is supported by active off-shelf placements captured in this run.'
        : 'No incremental support is yet reinforcing the point-of-sale story.',
      tone: incrementalScore > 0 ? 'success' as const : 'warning' as const,
    },
    {
      label: 'FST vs Risk',
      value: formatCurrency(riskValue),
      detail: riskValue <= regionBenchmark.riskMinimizedValue
        ? 'Risk is now at or below the regional minimized-risk benchmark.'
        : 'Open execution gaps still keep this store above the minimized-risk target.',
      tone: riskValue <= regionBenchmark.riskMinimizedValue ? 'success' as const : 'warning' as const,
    },
    {
      label: 'FST = ROI',
      value: opportunityScore > 0 ? formatCurrency(Math.round((score + opportunityScore) * 18)) : formatCurrency(Math.round(score * 14)),
      detail: opportunityScore > 0
        ? 'The remaining opportunity stack shows clear upside still available after this visit.'
        : 'Current execution is already converting most visible opportunity into score and value.',
      tone: opportunityScore > 0 ? 'warning' as const : 'success' as const,
    },
  ]
}

function getFailedQuestions(state: AppState, predicate?: (question: ChecklistQuestion) => boolean) {
  return checklistQuestions.filter(question => state.checklist[question.id] === 'no' && (!predicate || predicate(question)))
}

function getTopResolvedDriver(state: AppState) {
  const yesQuestions = checklistQuestions
    .filter(question => state.checklist[question.id] === 'yes')
    .sort((left, right) => right.weight - left.weight)

  return yesQuestions[0]?.title ?? 'Base plan execution'
}

function getYesPercent(state: AppState, questions: ChecklistQuestion[]) {
  const yesCount = questions.filter(question => state.checklist[question.id] === 'yes').length
  return (yesCount / Math.max(1, questions.length)) * 100
}

function formatSigned(value: number) {
  const rounded = Math.round(value)
  return `${rounded >= 0 ? '+' : ''}${rounded}`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getMetricRank<T extends Record<string, string | number>>(
  rows: T[],
  key: keyof T,
  direction: 'asc' | 'desc',
  currentStore: string,
) {
  const sorted = [...rows].sort((left, right) => {
    const leftValue = Number(left[key])
    const rightValue = Number(right[key])
    return direction === 'asc' ? leftValue - rightValue : rightValue - leftValue
  })

  return sorted.findIndex(row => row.store === currentStore) + 1
}

function getQuantitySummary(quantity: number | string) {
  return typeof quantity === 'string' ? quantity : `${quantity}`
}
