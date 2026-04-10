# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What This Is

A **clickable React prototype** for a mobile-first **Perfect Store Scorecard** workflow built for **Scotts Miracle-Gro** field reps. The prototype validates UX flow and visual direction for a workflow that will eventually run inside **Salesforce mobile** (Lightning Web Components / Screen Flow).

This is **not** a production app — no backend, no real data, mock-only scoring.

The static HTML mockups in `stitch_active_visit_scorecard_entry/` are design references only. The actual prototype lives in `scorecard-app/`.

---

## Business Context

Scotts Miracle-Gro field reps visit Home Depot and Lowe's stores to verify execution: planogram compliance, endcap displays, off-shelf placements, product availability. The **Perfect Store Scorecard** is a guided mobile workflow for capturing that execution during an active visit and producing a score that drives accountability and coaching.

The user is already inside an **active visit** — no store search, no login, no account picker in this flow.

Key field concepts:
- **POG** — Planogram (required shelf set)
- **LGOR** — Lost Gross Opportunity Revenue
- **Off-shelf** — incremental placements beyond the main aisle (Endcap, Fenceline, Garden Doors, Racetrack)
- **Execution score** — Yes/No/N/A checklist × weights + Above & Beyond bonus

---

## 5-Screen Flow

1. **Entry** — Store context, Previous Snapshot, "Start Scorecard" CTA
2. **Execution Checklist** — POG/display items (Yes / No / N/A), progress bar, live score chip
3. **Off-Shelf Capture** — Location chips → Category grid → Product list → Quantity chips
4. **Photo & Notes** — Upload photo, caption, optional notes, revisit/reset toggles
5. **Score Summary** — Metric cards (Execution, LGOR %, Risk $), delta vs last, Submit / Email / Post to Chatter

---

## Tech Stack — `scorecard-app/`

| Tool | Notes |
|---|---|
| Vite 8 + React 19 | TypeScript strict |
| Tailwind CSS v4 | `@tailwindcss/vite` plugin, tokens in `src/index.css` `@theme {}` |
| React Router v7 | client-side routing between screens |
| lucide-react | icons |
| clsx | conditional classnames |

```bash
cd scorecard-app
npm install       # install deps
npm run dev       # start dev server (http://localhost:5173)
npm run build     # production build
```

---

## Design Tokens (in `src/index.css` `@theme {}`)

```
primary:           #005da9
primary-container: #0176d3
secondary:         #00857c   (Scotts green, used sparingly)
surface:           #f9f9f9
surface-low:       #f2f4f6
surface-lowest:    #ffffff
on-surface:        #1a1c1c
on-surface-variant:#414752
outline:           #e5e8ed
tertiary:          #964500   (warning/opportunity amber)
```

---

## Design Rules

- **No 1px divider lines** — separate sections with background color shifts only
- **CTA buttons** — gradient `primary → primary-container`, not flat fills
- **Cards** — `rounded-xl`, no borders, `shadow-[0_2px_8px_rgba(0,0,0,0.04)]`
- **Bottom bar** — sticky, `bg-white/80 backdrop-blur-md`
- **Touch targets** — min 48px tap height; chip-style selectors for location/category/quantity
- **Font** — Inter everywhere; tight letter-spacing on score display values
- **Phone shell** — wrap all screens in a max-w-sm centered container on desktop

---

## Mock Data

```
Store: Home Depot 1907  |  Banner: Home Depot  |  Visit: Active
Scorecard: Q1 2026 Store Scorecard

Locations:   Endcap | Fenceline | Garden Doors | Racetrack | Other
Categories:  Fertilizer | Soils | Seed | Weed & Feed | Controls
Quantities:  40 | 80 | 120 | 200 | 320+
Checklist:   Plant Food POG | Chemical POG | Grass Seed POG | Indoor Soil POG
             Endcap | Garden Doors | Fenceline | Racetrack

Previous:    Score 142, Mar 12 | Gap: Garden Doors | Opp: Weed & Feed Endcap
Delta:       Score +18 | LGOR +5.6% | Risk -14%
```

All state lives in React — no API calls, no localStorage required.

---

## Trellis Bot (Agentforce Panel)

Some screens include a compact **Trellis Bot** insight card — secondary, dismissible, 2–3 lines max. In a real Salesforce build this maps to Einstein Next Best Action or an Agentforce prompt template. Keep it subtle, never blocking.

---

## What Not to Build

- No barcode scanning, no real floor plans, no real historical data
- No backend, auth, database, or real file upload
- No patterns that can't reasonably translate to Salesforce LWC or Screen Flow
- No open-ended generative chat for Trellis Bot
- No complex state management library (Zustand/Redux) — React state is enough
