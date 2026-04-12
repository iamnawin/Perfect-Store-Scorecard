import {
  checklistQuestions,
  leaderboardSeed,
  previousSnapshot,
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
  TrellisOffShelfInsight,
  TrellisSummaryInsight,
  TrellisVisitBriefing,
} from '../types'
import {
  estimateOffShelfImpact,
  getCapturedRequiredPhotos,
  getMissingRequiredEvidence,
  getOffShelfIncrementalScore,
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
    supportingText: 'Endcap is a top-weighted display, so Trellis routes the rep directly into off-shelf capture.',
    route: '/off-shelf',
    actionLabel: 'Add Off-Shelf Display',
  },
  'garden-doors': {
    fix: 'Build a Garden Door stack with Potting Mix or EZ Seed to close the repeated outdoor gap.',
    estimatedGain: 6,
    supportingText: 'This store has missed Garden Door execution for consecutive visits, so Trellis keeps it prominent.',
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
    route: '/checklist',
    actionLabel: 'Return to Base Plan',
  },
  'map-drive-aisle': {
    fix: 'Confirm the Drive Aisle base set so later off-shelf gains are counted cleanly.',
    estimatedGain: 6,
    route: '/checklist',
    actionLabel: 'Return to Base Plan',
  },
  'map-endcap': {
    fix: 'Reset the core Endcap base plan first, then use off-shelf capture for true incremental displays.',
    estimatedGain: 8,
    route: '/checklist',
    actionLabel: 'Return to Base Plan',
  },
  'map-garden-doors': {
    fix: 'Set the Garden Door base location before trying to recover the repeated display gap.',
    estimatedGain: 7,
    route: '/checklist',
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

export function getChecklistHeaderInsight(state: AppState) {
  const failedHighImpact = getFailedQuestions(state, question => question.weight >= 15)[0]
  const unansweredHighImpact = checklistQuestions
    .filter(question => !state.checklist[question.id])
    .sort((left, right) => right.weight - left.weight)[0]

  if (failedHighImpact) {
    return {
      title: 'Trellis is watching the highest-value misses',
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
      title: 'Trellis focus for this section',
      summary: `Answer ${unansweredHighImpact.title} next. It is one of the highest-impact checks in the visit.`,
      tone: 'info' as const,
      items: [
        { label: 'Current objective', value: 'Protect base plan first, then recover score through secondary displays.' },
        { label: 'Manager lens', value: 'Trellis will call out repeated display misses in the final summary if they remain open.' },
      ],
    }
  }

  return {
    title: 'Checklist is in a strong place',
    summary: 'Continue capturing high-impact execution details so Trellis can explain the score change at submit.',
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
    route: config?.route ?? '/checklist',
    supportingText: config?.supportingText ?? 'Trellis only surfaces actions that can materially change the visit outcome.',
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
      supportingText: topRemaining?.rationale ?? 'Trellis ranks the next display based on store history and remaining point upside.',
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
      suggestedNextMove: `If you can add a second display at ${secondaryLocation}, Trellis can unlock about +${nextMoveImpact} pts.`,
      supportingText: 'Base plan entries protect execution credibility, but Trellis only credits incremental gain after the core set is covered.',
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
      ? `${location} is a Trellis-preferred location for ${product.name} in this banner.`
      : `${product.name} still adds value here, but Trellis likes ${product.recommendedLocations.join(' or ')} even more.`,
    tone: product.recommendedLocations.includes(location) ? 'success' : 'info',
  }
}

export function getPhotoInsight(state: AppState) {
  const missingEvidence = getMissingRequiredEvidence(state.evidence, state.offShelf)
  const requiredPhotoCount = getRequiredPhotoCount()
  const capturedPhotos = getCapturedRequiredPhotos(state.evidence, state.offShelf)

  if (missingEvidence.length > 0) {
    return {
      title: 'Trellis evidence watch',
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
    summary: 'Required photo proof is in place, so Trellis can attribute the score change with confidence.',
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
      : `Score is down ${Math.abs(scoreDelta)} points. ${capitalize(biggestMissedOpportunity)} is the main drag, so Trellis is pushing ${nextVisitFocus.toLowerCase()}.`,
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
    risks.push({ label: 'Execution risk', value: 'No material Trellis risk flags remain', tone: 'success' as const })
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

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
