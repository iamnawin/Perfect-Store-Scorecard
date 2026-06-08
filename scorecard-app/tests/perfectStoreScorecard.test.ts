import test from 'node:test'
import assert from 'node:assert/strict'
import {
  activatePerfectScorecard,
  createPerfectScorecard,
  createRevisitFromLatestSubmission,
  findActivePerfectScorecard,
} from '../src/lib/perfectStoreScorecard.ts'
import type { PerfectStoreScorecard, UserContext } from '../src/types/index.ts'

const opsUser: UserContext = {
  id: 'ops-1',
  name: 'Ops Admin',
  role: 'ops',
}

const salesUser: UserContext = {
  id: 'sales-1',
  name: 'Sarah M.',
  role: 'sales-manager',
}

function createCycle(overrides: Partial<PerfectStoreScorecard> = {}): PerfectStoreScorecard {
  return {
    id: 'pss-parent-q1-2026',
    name: 'Q1 2026 Store Scorecard',
    quarter: 'Q1',
    fiscalYear: 2026,
    season: 'Spring 2026',
    status: 'Active',
    activeFlag: true,
    publishedBy: 'Ops Admin',
    publishedDate: '2026-01-01T00:00:00.000Z',
    effectiveStartDate: '2026-01-01',
    effectiveEndDate: '2026-03-31',
    storePlanMapId: 'store-plan-q1-2026',
    planVersion: '2026-Q1-v1',
    createdByOps: true,
    lockedForFieldUsers: true,
    ...overrides,
  }
}

test('finds exactly one active Perfect Store Scorecard cycle', () => {
  const result = findActivePerfectScorecard([
    createCycle({ id: 'draft-q2', status: 'Draft', activeFlag: false }),
    createCycle(),
  ])

  assert.equal(result.state, 'active')
  assert.equal(result.scorecard?.id, 'pss-parent-q1-2026')
})

test('stops field flow when no active scorecard exists', () => {
  const result = findActivePerfectScorecard([
    createCycle({ status: 'Closed', activeFlag: false }),
  ])

  assert.equal(result.state, 'no-active-scorecard')
  assert.equal(result.message, 'No active Perfect Store Scorecard is currently available. Please contact Ops.')
})

test('flags data integrity when multiple scorecards are active', () => {
  const result = findActivePerfectScorecard([
    createCycle({ id: 'active-q1' }),
    createCycle({ id: 'active-q2', quarter: 'Q2' }),
  ])

  assert.equal(result.state, 'data-integrity-error')
})

test('allows only Ops/Admin users to create and activate parent scorecards', () => {
  assert.throws(() => createPerfectScorecard(salesUser, createCycle({ status: 'Draft', activeFlag: false })), /Ops\/Admin/)
  assert.throws(() => activatePerfectScorecard([createCycle()], 'pss-parent-q1-2026', salesUser), /Ops\/Admin/)

  const draft = createPerfectScorecard(opsUser, createCycle({
    id: 'draft-q2',
    quarter: 'Q2',
    status: 'Draft',
    activeFlag: false,
  }))

  assert.equal(draft.createdByOps, true)
  assert.equal(draft.lockedForFieldUsers, true)
})

test('blocks activation when another active scorecard exists', () => {
  assert.throws(
    () => activatePerfectScorecard([
      createCycle({ id: 'active-q1' }),
      createCycle({ id: 'draft-q2', status: 'Draft', activeFlag: false }),
    ], 'draft-q2', opsUser),
    /Close or expire the current active scorecard/,
  )
})

test('blocks revisit creation after the parent scorecard is closed', () => {
  assert.throws(
    () => createRevisitFromLatestSubmission(createCycle({ status: 'Closed', activeFlag: false }), 'submitted-v1'),
    /only allowed while the parent scorecard is Active/,
  )
})
