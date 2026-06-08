import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildRevisitComparison,
  createRevisitFromScorecard,
  submitRevisit,
  updateRevisitField,
} from '../src/lib/scorecardVersioning.ts'

const sourceScorecard = {
  id: 'pss-001',
  storeId: 'store-1907',
  storeName: 'Home Depot #1907',
  quarter: 'Q1',
  season: 'Spring 2026',
  scorecardStatus: 'Submitted',
  versionNumber: 1,
  isRevisit: false,
  createdAt: '2026-03-12T10:00:00.000Z',
  submittedAt: '2026-03-12T11:00:00.000Z',
  submittedBy: 'Sarah M.',
  previousScore: null,
  currentScore: 142,
  scoreDelta: 0,
  executionScore: 70,
  basePlanScore: 26.3,
  incrementalScore: 45.7,
  combinedScore: 142,
  revisitNotes: '',
  revisitReason: '',
  changedFieldsSummary: [],
  items: [
    {
      id: 'item-1',
      scorecardId: 'pss-001',
      skuId: 'tb-weed-feed-15m',
      skuName: 'Turf Builder Weed & Feed',
      category: 'Off-Shelf Display',
      previousValue: 80,
      currentValue: 80,
      changed: false,
      changeType: 'No Change',
      quantityPrevious: 80,
      quantityCurrent: 80,
      offShelfPrevious: true,
      offShelfCurrent: true,
      executionPrevious: 'Completed',
      executionCurrent: 'Completed',
      recommendationPrevious: 'Fence line placement',
      recommendationCurrent: 'Fence line placement',
      scorePrevious: 12,
      scoreCurrent: 12,
    },
  ],
}

test('creates a linked revisit draft without mutating the submitted scorecard', () => {
  const draft = createRevisitFromScorecard(sourceScorecard, {
    id: 'pss-002',
    now: '2026-04-01T09:00:00.000Z',
  })

  assert.equal(draft.id, 'pss-002')
  assert.equal(draft.scorecardStatus, 'Revisit Draft')
  assert.equal(draft.versionNumber, 2)
  assert.equal(draft.parentScorecardId, 'pss-001')
  assert.equal(draft.sourceScorecardId, 'pss-001')
  assert.equal(draft.previousScore, 142)
  assert.equal(draft.currentScore, 142)
  assert.equal(draft.items[0].scorecardId, 'pss-002')
  assert.equal(draft.items[0].quantityPrevious, 80)
  assert.equal(draft.items[0].quantityCurrent, 80)
  assert.equal(draft.items[0].changed, false)
  assert.equal(sourceScorecard.items[0].scorecardId, 'pss-001')
})

test('updates a revisit field and classifies improved changes', () => {
  const draft = createRevisitFromScorecard(sourceScorecard, {
    id: 'pss-002',
    now: '2026-04-01T09:00:00.000Z',
  })
  const updated = updateRevisitField(draft, draft.items[0].id, 'quantityCurrent', 120)

  assert.equal(updated.items[0].quantityPrevious, 80)
  assert.equal(updated.items[0].quantityCurrent, 120)
  assert.equal(updated.items[0].changed, true)
  assert.equal(updated.items[0].changeType, 'Improved')
  assert.deepEqual(updated.changedFieldsSummary, ['Turf Builder Weed & Feed quantity changed from 80 to 120'])
  assert.equal(draft.items[0].quantityCurrent, 80)
})

test('submits a revisit and builds mobile comparison cards', () => {
  const draft = createRevisitFromScorecard(sourceScorecard, {
    id: 'pss-002',
    now: '2026-04-01T09:00:00.000Z',
  })
  const updated = updateRevisitField(draft, draft.items[0].id, 'quantityCurrent', 120)
  const submitted = submitRevisit(updated, {
    now: '2026-04-01T10:15:00.000Z',
    submittedBy: 'Sarah M.',
    revisitNotes: 'Fence line display was expanded.',
  })
  const comparison = buildRevisitComparison(sourceScorecard, submitted)

  assert.equal(submitted.scorecardStatus, 'Revisit Submitted')
  assert.equal(submitted.submittedAt, '2026-04-01T10:15:00.000Z')
  assert.equal(submitted.revisitNotes, 'Fence line display was expanded.')
  assert.equal(comparison.previousCombinedScore, 142)
  assert.equal(comparison.currentCombinedScore, submitted.combinedScore)
  assert.equal(comparison.improvedItems.length, 1)
  assert.equal(comparison.cards[0].label, 'Turf Builder Weed & Feed Quantity')
  assert.equal(comparison.cards[0].previous, '80')
  assert.equal(comparison.cards[0].current, '120')
  assert.equal(comparison.cards[0].change, 'Improved')
})
