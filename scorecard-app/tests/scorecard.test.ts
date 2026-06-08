import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createInitialEvidenceState,
  getScorecardStatus,
} from '../src/lib/scorecard.ts'
import type { AppState } from '../src/types/index.ts'

function createState(overrides: Partial<AppState> = {}): AppState {
  const state: AppState = {
    visitType: 'initial',
    checklist: {},
    questionNotes: {},
    offShelf: [],
    offShelfConfirmed: true,
    evidence: createInitialEvidenceState(),
    secondaryDisplayImage: null,
    audioNoteFile: null,
    notes: '',
    revisitReason: '',
    revisitRequired: false,
    shelfResetNeeded: false,
    lastSavedAt: null,
    submitted: false,
    agentforceEnabled: false,
    toast: null,
    celebration: null,
    scorecardVersion: {} as AppState['scorecardVersion'],
    sourceScorecard: {} as AppState['sourceScorecard'],
    versionHistory: [],
    revisitComparison: null,
    activeScorecardResult: {
      state: 'active',
      scorecard: {} as AppState['activeScorecardResult']['scorecard'],
      message: 'Active scorecard available.',
    },
    ...overrides,
  }

  state.evidence = {
    ...state.evidence,
    'shelf-view': { captured: true, note: '', photoName: 'shelf.jpg', photoPreviewUrl: '' },
    'endcap-photo': { captured: true, note: '', photoName: 'endcap.jpg', photoPreviewUrl: '' },
  }

  return state
}

test('initial scorecard can be ready even when checklist answers are left optional', () => {
  const status = getScorecardStatus(createState())

  assert.equal(status, 'ready-for-review')
})
