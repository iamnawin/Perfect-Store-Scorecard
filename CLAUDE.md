# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What This Is

A set of **standalone HTML mockup screens** for a mobile-first **Perfect Store Scorecard** workflow built for **Scotts Miracle-Gro** field reps. Each file in `stitch_active_visit_scorecard_entry/` is a self-contained screen variant — open any `code.html` directly in a browser.

This is a **stakeholder review prototype**, not a production app. It validates the UX flow and visual direction before any real Salesforce development begins.

---

## Business Context

**Scotts Miracle-Gro** field reps visit Home Depot and Lowe's stores — especially during spring/fall lawn and garden season — to verify execution: planogram compliance, endcap displays, off-shelf placements, and product availability.

The **Perfect Store Scorecard** is a guided mobile workflow for capturing that execution during an active store visit and producing a score that drives accountability and coaching.

Key concepts in the scorecard:
- **Execution Checklist** — did required POGs and displays get set? (Yes / No / N/A)
- **Off-Shelf Capture** — incremental placements beyond the main aisle (Endcap, Fenceline, Garden Doors, Racetrack)
- **Photo Proof** — photo + caption as evidence
- **Score Summary** — total score, LGOR %, Risk $, comparison to last submission

The user is already inside an **active visit** — no store search, no account picker, no login flow in the prototype.

---

## Screen Flow (5 Screens)

1. **Entry** — Store context card, Previous Store Snapshot, "Start Scorecard" CTA
2. **Execution Checklist** — POG/display items with Yes / No / N/A; progress bar; live score chip
3. **Off-Shelf Capture** — Location chips → Category grid → Product list → Quantity chips
4. **Photo & Notes** — Upload photo, caption, optional notes, revisit/reset toggles
5. **Score Summary** — Metric cards (Execution, Base Plan, Above & Beyond, LGOR %, Risk $), delta vs last submission, Submit / Email / Post to Chatter

---

## Tech Stack

Every screen is a **single self-contained HTML file**:
- Tailwind CSS via CDN (`cdn.tailwindcss.com`)
- Google Fonts: **Inter** (body/UI) + **Work Sans** (display headlines, some variants)
- **Material Symbols Outlined** (icons)
- No JavaScript framework, no build step, no backend

Color tokens are defined inline per file inside a `tailwind.config` script block. The canonical SLDS-aligned token set:
- `primary`: `#005da9` | `primary-container`: `#0176d3`
- `surface-container-lowest`: `#ffffff` | `surface`: `#f9f9f9` / `#fbf9f9`
- `on-surface`: `#1a1c1c` or `#1b1c1c` | `on-surface-variant`: `#414752`
- Scotts accent (some variants): `secondary`: `#00857c`

---

## Design Rules

- **No 1px divider lines** — separate sections with background color shifts only (`surface-container-low` → `surface-container-lowest`)
- **CTAs**: gradient `primary → primary-container`, not flat fills
- **Cards**: `rounded-xl`, no borders, `shadow-[0_2px_8px_rgba(0,0,0,0.04)]`
- **Bottom bar**: sticky, `bg-white/80 backdrop-blur-md`
- **Touch targets**: minimum 24px vertical padding; chip-style selectors for location/category/quantity
- **Typography**: Inter everywhere; tight letter-spacing on score display values

---

## Trellis Bot (AI Assistant)

Some variants include a **Trellis Bot** panel — a compact contextual insight card that appears per screen when Agentforce mode is toggled on. It is:
- Always secondary / dismissible — never blocks the main flow
- Positioned below the primary interaction zone
- 2–3 lines max, with a bot label and icon

In a real Salesforce build this would map to Einstein Next Best Action, Agentforce prompt templates, or a Copilot summary agent. Keep it subtle in the prototype.

---

## Folder Structure

```
stitch_active_visit_scorecard_entry/stitch_active_visit_scorecard_entry/
  <variant>/
    code.html    ← open directly in browser
    screen.png   ← rendered screenshot
    DESIGN.md    ← design system spec (some variants only)
```

Variants are grouped by screen type: `active_visit_entry_*`, `checklist_*`, `execution_checklist_*`, `off_shelf_capture_*`, `photo_capture_*`, `proof_comments_*`, `audit_summary_*`, and full-flow variants like `active_visit_slds`, `active_visit_salesforce_style`.

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

Scoring is mock-only: Execution = Yes count × weight, Above & Beyond = qty tier bonus, Total = sum.

---

## What Not to Build

- No barcode scanning, no real floor plans, no real historical data
- No backend, auth, database, or real file upload
- No patterns that can't reasonably translate to Salesforce LWC or Screen Flow
- No open-ended generative chat for Trellis Bot
