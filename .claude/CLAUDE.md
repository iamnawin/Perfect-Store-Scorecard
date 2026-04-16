# CLAUDE.md

This file gives Claude Code the current working context for this repository.

---

## What This Repo Is

This is a **clickable React prototype** for a **Scotts Miracle-Gro Perfect Store Scorecard** workflow. It is a **Salesforce Lightning-style mobile field execution prototype**, not a consumer audit app and not a production implementation.

The real app lives in `scorecard-app/`.
The stitched files under `stitch_active_visit_scorecard_entry/` are **reference material only**.

The user is already inside an **active visit** when the scorecard launches.

---

## Current Product Direction

The prototype should feel like something that could later be built with **Salesforce Flow + LWC**:

- visit context is a thin identity layer, not the hero content
- the scorecard is the primary workflow
- base plan validation happens before incremental off-shelf capture
- UI is compact, operational, and state-driven
- Trellis Assistant is contextual and optional
- score, progress, blockers, and evidence should behave as if derived from a scorecard model

Avoid glossy consumer patterns, oversized hero cards, floating dashboard treatment, and generic chatbot UI.

---

## Current Screen Flow

The current implemented flow is:

1. `EntryScreen` - active-visit launch dashboard
2. `ChecklistScreen` - base plan validation and display execution
3. `OffShelfScreen` - incremental opportunity capture and live score impact
4. `PhotoScreen` - required evidence, notes, and visit flags
5. `SummaryScreen` - review, blockers, submit, and post-submit share actions

### EntryScreen

- compact visit-context header
- readiness strip with sections, checks, and status
- centered launch / resume card
- previous snapshot KPI block
- today's focus
- trend block
- quick navigation chips
- scorecard flow state list
- submitted state shows completion instead of offering restart

### ChecklistScreen

Checklist is now the **base plan validation layer**, not a generic checklist.

It contains:

- `MAP Locations`
  - Fence Line
  - Drive Aisle
  - Endcap
  - Garden Doors
- `POG Compliance`
  - Chemicals
  - Grass Seed
  - Plant Food
  - Indoor Soil
- `Secondary Display Execution`
  - Endcap display execution
  - Garden Doors display execution
  - Fenceline feature compliance
  - Racetrack placement quality

Per question behavior:

- Yes / No / N/A
- impact points and live score feedback
- business context (`businessWhy`)
- note accordion with explicit `Save Note`
- expandable photo capture panel
- failure state for `No`
- direct `Add Off-Shelf Display` handoff for failed secondary display checks

The checklist header shows:

- checks answered
- section position
- completion percent
- Base Plan Score
- Incremental Score
- Projected Total

### OffShelfScreen

Off-Shelf is now a **live scoring decision engine**, not a static form.

Implemented behavior:

- display location selector
- product category selector
- searchable SKU selection with recommendation cues
- business-language quantity labels
  - Small Display
  - Medium Display
  - Large Display
  - Pallet
  - Bulk
- classification prompt
  - Yes = Base Plan
  - No = Incremental
  - Not Sure
- required photo evidence with preview and retake
- notes
- `Impact Preview` directly below quantity
- full `Live Impact Panel`
- dynamic score band
- `Incremental Summary`
- recommendations based on prior-year sales / reorder / load-in framing
- `Added in This Visit` saved-entry list
- edit / duplicate / delete
- `Save Entry`, `Add Another Display`, `Review Score`

Important UX rule:

- users do **not** enter manual display counts up front
- they add one display at a time and the app tracks total displays automatically

### PhotoScreen

Photo Evidence is the compliance evidence step, not a gallery.

Current behavior:

- required / optional evidence cards
- camera/file capture with preview
- retake / remove support
- linked checklist relevance text
- evidence note per requirement
- manager notes
- `Revisit Required`
- `Shelf Reset Needed`
- explicit submission-blocked state when required evidence is missing

### SummaryScreen

Summary supports both review and post-submit completion.

Pre-submit behavior:

- blocker cards route directly to the next unresolved action
- score breakdown
- required-before-submit section
- recommendations / next actions
- footer primary action either submits or routes to the first blocker

Submitted behavior:

- `Scorecard Completed`
- prominent overall score
- submitted status
- submission report
- outcome summary
- post-submit sharing actions
  - `Email Snapshot`
  - `Post to Chatter`
- bottom action is `Done`

---

## Shared Scoring and State Model

The prototype uses local React state only.

Key files:

- `src/data/mock.ts`
  - store context
  - previous snapshot
  - section config
  - checklist question config
  - evidence requirements
  - off-shelf products and recommendations
  - Trellis prompt content
- `src/lib/scorecard.ts`
  - progress and scorecard status
  - checklist scoring helpers
  - off-shelf scoring engine
  - quantity / multiplier logic
  - evidence completeness
  - blocker helpers
- `src/context/AppContext.tsx`
  - local app state and actions
  - checklist answers
  - question notes
  - off-shelf entry CRUD
  - evidence photos and notes
  - draft save timestamp
  - submit state
  - Trellis toggle

Current score logic includes:

- checklist yes/no impact
- off-shelf score contribution using SKU weight, location multiplier, quantity factor, and classification factor
- evidence blockers
- completion percent derived from answered checks, evidence, and off-shelf review

Important evidence behavior:

- off-shelf captured photos can satisfy linked display evidence such as `endcap-photo`

---

## Trellis Assistant

Use **Trellis Assistant**, powered by **Agentforce**, as a compact contextual surface.

Current intent by screen:

- Entry: launch guidance and prior-visit focus
- Checklist: explain requirements and failed checks
- Off-Shelf: recommend score-improving opportunities
- Photo: explain missing evidence
- Summary: explain score impact and next actions

Do not turn Trellis into an always-open chatbot.

---

## Motto

Current app motto:

`Proactive recommendations and iterative scoring informed by prior-year sales, reorders, and load-ins.`

---

## Tech Stack

- Vite 8
- React 19
- TypeScript
- Tailwind CSS v4
- React Router
- lucide-react
- clsx

Commands:

```bash
cd scorecard-app
npm run dev
npm run build
npm run lint
```

---

## Deployment Notes

Vercel config exists in both:

- `vercel.json` at repo root
- `scorecard-app/vercel.json`

The root config supports deploying the sub-app from the repository root.
The nested config supports deployments when the project root is set directly to `scorecard-app`.

---

## Guardrails

- Do not add backend, auth, database, or real Salesforce SDK integration
- Do not rebuild screens from scratch unless necessary
- Prefer refining the current prototype
- Keep Flow + LWC implementation realism in mind
- Keep UI compact, enterprise-like, and mobile-first
- Keep diffs pragmatic and reviewable
- Do not touch `stitch_active_visit_scorecard_entry/` except as reference material
