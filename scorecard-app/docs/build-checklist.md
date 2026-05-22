# Scorecard App — Build & Release Checklist

Run from `scorecard-app/`.

## Local setup
- Install: `npm.cmd install`
- Start dev server: `npm.cmd run dev`

## Pre-merge verification (required)
- Lint: `npm.cmd run lint`
- Build: `npm.cmd run build`

## Manual smoke test (recommended)
- Load app in browser and verify main navigation renders.
- Create a new scorecard submission and reach the summary screen.
- Try an edit flow (if available): modify one value and confirm the summary updates.

## Pilot readiness checks (recommended)
- Confirm a sample MAP CSV imports successfully (happy path).
- Confirm CSV error handling is understandable (missing header, empty file).
- Confirm incremental/off-shelf flow supports:
  - add/remove SKU
  - qty entry

