# Repository Guidelines

## Project Structure & Module Organization
The deployable app lives in `scorecard-app/`. Main source files are under `scorecard-app/src/`:
- `components/` for shared UI
- `screens/` for route-level mobile views
- `context/` for app state
- `data/` for mock data
- `types/` for shared TypeScript types
- `assets/` and `public/` for static assets

Reference HTML mockups live in `stitch_active_visit_scorecard_entry/` and are design inputs, not the runtime app. Root-level `vercel.json` and `wrangler.jsonc` hold deployment configuration.

## Build, Test, and Development Commands
Run all app commands from `scorecard-app/`.

```bash
cd scorecard-app
npm install      # install dependencies
npm run dev      # start Vite dev server
npm run build    # TypeScript build + production bundle
npm run lint     # run ESLint
npm run preview  # preview production build locally
```

Before pushing, run at least `npm run build` and `npm run lint`.

## Coding Style & Naming Conventions
Use TypeScript + React function components. Follow the existing style:
- 2-space indentation
- `PascalCase` for components and screen files (`PhotoScreen.tsx`)
- `camelCase` for variables, hooks, and helpers
- keep screen logic inside `screens/`, reusable UI in `components/`

Formatting is enforced mainly through ESLint (`scorecard-app/eslint.config.js`). Keep changes small and reuse existing patterns before adding abstractions.

## Testing Guidelines
There is no formal test suite configured yet. Current verification is:
- `npm run lint`
- `npm run build`

If you add non-trivial logic, introduce focused tests alongside the change and document how to run them. For refactors, protect behavior first, then simplify.

## Commit & Pull Request Guidelines
Recent history uses short imperative subjects such as `feat: add React prototype` and `fix: add vercel.json...`. Prefer concise, why-focused commit titles. For larger changes, follow the repo’s Lore-style trailer format with notes like `Constraint:`, `Rejected:`, and `Tested:`.

Pull requests should include:
- a clear summary of the user-visible change
- deployment/config updates if relevant
- screenshots or short recordings for UI changes
- verification evidence (`npm run build`, `npm run lint`)

## Deployment Notes
Vercel should build from the repo root unless project settings explicitly use `scorecard-app/`. This app uses `BrowserRouter`, so keep SPA rewrites intact in `vercel.json`.
