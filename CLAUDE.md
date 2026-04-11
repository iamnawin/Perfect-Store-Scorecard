# CLAUDE.md

This file gives Claude Code the current working context for this repository.

---

## What This Repo Is

This is a **clickable React prototype** for a **Scotts Miracle-Gro Perfect Store Scorecard** workflow. It is designed as a **Salesforce mobile-style field execution experience**, not a consumer audit app and not a production build.

The actual app lives in `scorecard-app/`.
The stitched HTML/image files in `stitch_active_visit_scorecard_entry/` are **reference material only**.

The user is already inside an **active visit** when this flow starts.

---

## Current Product Direction

The prototype should feel like a realistic future **Salesforce Flow + LWC** implementation:

- visit context is a thin identity layer, not the main content
- scorecard execution is the main workflow
- UI is compact, structured, and data-first
- Trellis Assistant is contextual and optional
- all progress, counts, and status states should behave as if derived from a scorecard model

Avoid glossy consumer patterns, oversized cards, decorative dashboards, and chatbot-first UX.

---

## Implemented Screen Set

The working flow is:

1. `Entry` - scorecard entry point inside an active visit
2. `Checklist` - structured execution checks with Yes / No / N/A
3. `Off-Shelf Capture` - incremental opportunity capture with live score impact
4. `Photo & Notes` - evidence capture and submission blockers
5. `Summary` - operational review and submit screen

Current off-shelf behavior includes:

- location, category, SKU, quantity, and classification selection
- live impact calculation
- recommendations informed by prior-year sales / reorder / load-in framing
- captured display rows with edit, duplicate, and delete actions
- photo state, caption, and notes at the entry level

---

## Business Language

Prefer:

- checks
- sections
- required photos
- off-shelf displays
- incremental placement
- score impact
- action required
- submission blocked

Do not frame this as a generic survey or consumer checklist.

---

## Trellis Assistant

Use **Trellis Assistant**, powered by **Agentforce**, as a compact contextual surface.

Trellis should:

- guide on entry
- explain checklist questions
- recommend off-shelf opportunities
- validate photo evidence
- summarize score impact

It should never become a giant always-open chatbot.

---

## Mock Data and State

The prototype uses local React state only.

Key sources:

- `src/data/mock.ts` - store context, scorecard sections, questions, evidence requirements, off-shelf products, recommendations, Trellis prompts
- `src/lib/scorecard.ts` - derived metrics, progress, score status, off-shelf scoring logic
- `src/context/AppContext.tsx` - app state and actions

The app motto currently used in the prototype is:

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

The root config is intended to support deploying the sub-app correctly from the repository root. The nested config supports deployments when the project root is set directly to `scorecard-app`.

---

## Guardrails

- Do not add backend, auth, database, or real Salesforce SDK integration
- Do not introduce patterns that would be hard to map to Flow + LWC
- Keep the UI compact, operational, and enterprise-like
- Keep diffs pragmatic and reviewable
- Prefer updating the current prototype over rebuilding screens from scratch
