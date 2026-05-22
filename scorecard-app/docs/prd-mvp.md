# Perfect Store Scorecard — MVP PRD (Pilot)

## Context
We will run two workstreams in parallel:
1) Define and implement an MVP, pilotable in a small area (1 district).
2) Continue discovery toward an “ideal” vision state (AI image validation + action recommendations).

This PRD scopes only the **MVP**.

## Goal
Enable field users to capture a store’s base-plan execution and incremental/off-shelf execution, score it, and share/compare results—starting with a district pilot.

## Users
- **Field Rep (Primary):** completes scorecard during/after a store walk.
- **DM / Territory Lead (Secondary):** compares stores within district/territory; monitors improvement.

## Key Problems
- Teams need a consistent way to compare “what should be” (MAP/POG/base plan) vs “what is” in-store.
- Off-shelf/incremental execution needs lightweight capture (incl. SKU add + estimated qty) and must influence scoring.
- Results must be understandable (breakdowns, impacts, at-risk items) and shareable.

## MVP Scope (Must Have)
### 1) MAP Import (Base Plan Reference)
- Import a “MAP/Base Plan” reference dataset via **CSV upload**.
- Imported MAP data is used as the expected baseline for scoring/comparison.

**Acceptance criteria**
- User can upload a CSV (from local disk) and see a success/failure state.
- Imported rows are stored locally (MVP) and can be used in later capture screens.
- CSV parsing errors show actionable messages (missing headers, invalid types, empty file).

### 2) MAP/POG Capture (Base Plan Execution)
- A checklist-based capture experience that records compliance against expected MAP/POG.
- Checklist contributes the **Execution Score** baseline, scored out of 100.
- Partial execution rules remain configurable until business confirms whether partial items should receive half credit, prorated SKU credit, or zero.

**Open decision (MVP)**
- SKU capture at MAP/POG locations:
  - Option A: allow capturing SKU at the location during MAP/POG capture
  - Option B: only capture SKUs when adding incremental/off-shelf fixtures

### 3) Incremental / Off-Shelf Capture
- User selects a **Display Location** and **Product Category**.
- Add products via **SKU search** or **UPC scan** (scan may be simulated in web pilot).
- Capture quantity:
  - Option A: qty unit options derived from product (EA/Case/Pallet)
  - Option B: a single predetermined estimate qty

**Acceptance criteria**
- User can add at least one product to an incremental fixture and remove it.
- Qty is captured per product line item and included in the submission summary.

### 4) Submission Cadence & Editability
- System supports quarterly submissions:
  - “Base Plan” resets each quarter.
  - User can choose to **carry over Off-Shelf** items into the new quarter or start fresh.
- Mid-quarter edits:
  - Provide an **Edit Scorecard** action that allows adjustments and re-scoring.

**Acceptance criteria**
- A submission has a quarter tag and can be re-opened for edits prior to final submit.
- “Carry over Off-Shelf” is a user choice at the start of a new quarter.

### 5) Score Summary & Actions
- Summary shows:
  - Total score + breakdown (Execution Score, Base Plan LGOR Points, Incremental Off-Shelf Points)
  - LGOR Rep % shown separately from numeric score
  - Top SKUs that impacted the score; top recommendation/risk signals as guidance
  - Quarter-over-quarter comparison for the same store
- Actions:
  - Export/share results (MVP supports **email**; Chatter/leaderboard can be stubbed)

**Acceptance criteria**
- Summary is readable on mobile-sized viewport and includes the breakdowns.
- User can trigger at least one sharing/export path (email or download).

## MVP Non-Goals (Explicitly Out of Scope)
- Automated image-based validation of products/fixtures.
- Voice-to-text capture as a primary workflow.
- Full enterprise permissions, SSO, or complex role management.
- Real-time sync, offline-first guarantees, or multi-device conflict resolution.

## Vision State (Discovery Track, Not MVP)
- Image validation: capture multiple images per fixture to infer product presence (MAP/POG + off-shelf) and verify MAP is set.
- Voice-to-text: capture product via speech instead of images.

## Metrics (Pilot Success)
- % of visits that complete a submission end-to-end
- Median time-to-submit
- Number of edits per submission (indicator of workflow friction)
- QoQ delta: average score improvement per store
- DM adoption: leaderboard / comparison view usage

## Risks & Dependencies
- CSV format stability (headers, product identifiers) and product master data availability.
- UPC scan behavior in web pilot (may require manual input fallback).
- Scoring model calibration: LGOR source, peak-week units, quantity conversion, and partial execution rules need business/Data Engineering confirmation.
- Location, risk, recommendations, and photos remain guidance/reporting signals unless business approves direct score impacts.

## Open Questions
- Required CSV headers and identifiers (SKU vs UPC vs internal product id).
- Final LGOR source and denominator: dollars, units, POS EA, forecast, prior-year POS, or blended metric.
- Peak Week Units grain and rule: Store + SKU + Quarter; exact, floored, capped, or bucketed multiplier.
- Quantity conversion source: eaches, units per case, cases per pallet, units per pallet.
- SKU rollup mapping source for old/new/replacement SKU history.
- Should leaderboard be MVP or “phase 1.5” after pilot proof?
