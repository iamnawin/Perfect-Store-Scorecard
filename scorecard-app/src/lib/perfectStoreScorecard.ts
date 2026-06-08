import type {
  ActivePerfectStoreScorecardResult,
  PerfectStoreScorecard,
  ScorecardVersionRecord,
  UserContext,
} from '../types'

export function findActivePerfectScorecard(
  scorecards: PerfectStoreScorecard[],
): ActivePerfectStoreScorecardResult {
  const activeScorecards = scorecards.filter(scorecard => (
    scorecard.status === 'Active' && scorecard.activeFlag
  ))

  if (activeScorecards.length === 0) {
    return {
      state: 'no-active-scorecard',
      scorecard: null,
      message: 'No active Perfect Store Scorecard is currently available. Please contact Ops.',
    }
  }

  if (activeScorecards.length > 1) {
    return {
      state: 'data-integrity-error',
      scorecard: null,
      message: 'Multiple active Perfect Store Scorecards were found. Please contact Ops before continuing.',
    }
  }

  return {
    state: 'active',
    scorecard: activeScorecards[0],
    message: `${activeScorecards[0].name} is active for field execution.`,
  }
}

export function createPerfectScorecard(
  user: UserContext,
  draft: PerfectStoreScorecard,
): PerfectStoreScorecard {
  assertOpsOrAdmin(user)

  return {
    ...draft,
    status: draft.status === 'Active' ? 'Draft' : draft.status,
    activeFlag: false,
    createdByOps: true,
    lockedForFieldUsers: true,
  }
}

export function activatePerfectScorecard(
  scorecards: PerfectStoreScorecard[],
  scorecardId: string,
  user: UserContext,
  now = new Date().toISOString(),
): PerfectStoreScorecard[] {
  assertOpsOrAdmin(user)

  const selected = scorecards.find(scorecard => scorecard.id === scorecardId)
  if (!selected) throw new Error('Perfect Store Scorecard was not found.')

  const activeScorecard = scorecards.find(scorecard => (
    scorecard.id !== scorecardId &&
    scorecard.status === 'Active' &&
    scorecard.activeFlag
  ))

  if (activeScorecard) {
    throw new Error('Close or expire the current active scorecard before activating a new one.')
  }

  return scorecards.map(scorecard => {
    if (scorecard.id !== scorecardId) return scorecard

    return {
      ...scorecard,
      status: 'Active',
      activeFlag: true,
      publishedBy: user.name,
      publishedDate: now,
      createdByOps: true,
      lockedForFieldUsers: true,
    }
  })
}

export function closePerfectScorecard(
  scorecards: PerfectStoreScorecard[],
  scorecardId: string,
  user: UserContext,
): PerfectStoreScorecard[] {
  assertOpsOrAdmin(user)

  return scorecards.map(scorecard => (
    scorecard.id === scorecardId
      ? { ...scorecard, status: 'Closed', activeFlag: false }
      : scorecard
  ))
}

export function createOriginalSubmission(
  activeScorecard: PerfectStoreScorecard,
  user: UserContext,
  store: { name: string },
): Pick<ScorecardVersionRecord, 'parentScorecardId' | 'submittedBy' | 'storeName' | 'quarter' | 'season' | 'versionNumber' | 'isRevisit'> {
  assertActiveForFieldExecution(activeScorecard)

  return {
    parentScorecardId: activeScorecard.id,
    submittedBy: user.name,
    storeName: store.name,
    quarter: activeScorecard.quarter,
    season: activeScorecard.season,
    versionNumber: 1,
    isRevisit: false,
  }
}

export function createRevisitFromLatestSubmission(
  activeScorecard: PerfectStoreScorecard,
  latestSubmission: ScorecardVersionRecord | string,
): ScorecardVersionRecord | { parentScorecardId: string; sourceScorecardId: string } {
  assertActiveForFieldExecution(activeScorecard)

  if (typeof latestSubmission === 'string') {
    return {
      parentScorecardId: activeScorecard.id,
      sourceScorecardId: latestSubmission,
    }
  }

  const nextId = createClientId('pss')

  return {
    ...structuredClone(latestSubmission),
    id: nextId,
    parentScorecardId: activeScorecard.id,
    sourceScorecardId: latestSubmission.id,
    scorecardStatus: 'Revisit Draft',
    versionNumber: latestSubmission.versionNumber + 1,
    isRevisit: true,
    createdAt: new Date().toISOString(),
    submittedAt: null,
    previousScore: latestSubmission.combinedScore,
    currentScore: latestSubmission.combinedScore,
    scoreDelta: 0,
    revisitNotes: '',
    revisitReason: 'Same quarter / same season check-in',
    changedFieldsSummary: [],
    items: latestSubmission.items.map(item => ({
      ...structuredClone(item),
      id: createClientId('item'),
      scorecardId: nextId,
      previousValue: item.currentValue ?? item.quantityCurrent ?? item.executionCurrent ?? null,
      currentValue: item.currentValue ?? item.quantityCurrent ?? item.executionCurrent ?? null,
      changed: false,
      changeType: 'No Change',
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
    })),
  }
}

function assertOpsOrAdmin(user: UserContext) {
  if (user.role !== 'ops' && user.role !== 'admin') {
    throw new Error('Only Ops/Admin users can manage Perfect Store Scorecard parent records.')
  }
}

function assertActiveForFieldExecution(scorecard: PerfectStoreScorecard) {
  if (scorecard.status !== 'Active' || !scorecard.activeFlag) {
    throw new Error('Revisit/Retake is only allowed while the parent scorecard is Active.')
  }
}

function createClientId(prefix: string) {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`
}
