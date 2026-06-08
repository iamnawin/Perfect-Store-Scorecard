# Perfect Store Scorecard

## Project Overview
The **Perfect Store Scorecard** is a specialized React-based mobile-first application designed for field sales representatives and territory leads (specifically for **Scotts Miracle-Gro**). Its primary purpose is to capture, score, and analyze store execution against a base plan (MAP/POG) and incremental off-shelf displays.

The application allows users to:
- Perform store audits using a checklist-based interface.
- Capture incremental/off-shelf product placements with quantity estimates.
- Generate real-time scoring (Execution Score, Base Plan LGOR, Incremental Points).
- Manage visits and revisits with versioning and delta tracking.
- Utilize AI-assisted analysis (Agentforce) for secondary display recognition.
- View performance benchmarks and recommendations.

### Architecture & Technologies
- **Frontend:** React 19 (TypeScript), Vite, Tailwind CSS 4.
- **State Management:** React Context API (`AppContext`).
- **Styling & Animation:** Vanilla CSS, Tailwind, Framer Motion, Lucide React icons.
- **Routing:** React Router 7.
- **Logic & Calculations:** Modularized in `src/lib` (scoring, versioning, Trellis recommendation engine).
- **Deployment:** Vercel.

---

## Building and Running

### Development
To start the development server:
```powershell
cd scorecard-app
npm install
npm run dev
```

### Building for Production
To build the application for production:
```powershell
cd scorecard-app
npm run build
```
The output will be in the `scorecard-app/dist` directory.

### Linting
To run ESLint:
```powershell
cd scorecard-app
npm run lint
```

### Testing
The project uses Vitest (inferred) for testing. Run tests with:
```powershell
cd scorecard-app
# TODO: Verify exact test command if 'npm test' is not present in package.json
# Based on file structure, tests are in 'tests/' directory.
```

---

## Development Conventions

### Project Structure
- `scorecard-app/src/components`: Reusable UI components.
- `scorecard-app/src/context`: Application state and business logic wiring.
- `scorecard-app/src/data`: Mock data, product catalogs, and checklist definitions.
- `scorecard-app/src/lib`: Core business logic (scoring engine, recommendation logic, Agentforce clients).
- `scorecard-app/src/screens`: Top-level page components (Entry, Checklist, Off-Shelf, Summary).
- `scorecard-app/src/types`: TypeScript interfaces and type definitions.

### Coding Standards
- **TypeScript:** Strict typing is preferred. Definitions are centralized in `src/types/index.ts`.
- **Styling:** Use Tailwind CSS 4 utility classes for most styling. Follow the "Salesforce/SLDS" look and feel for enterprise consistency.
- **Immutability:** State updates should be immutable, utilizing `structuredClone` for deep copies where necessary (see `scorecardVersioning.ts`).
- **Naming:** Follow standard React/TypeScript naming conventions (PascalCase for components, camelCase for variables/functions).

### Scoring Logic
The scoring engine is a critical part of the application:
- **Execution Score:** Based on the 100-point checklist.
- **Base Plan LGOR (Load-in Gross Order Recovery):** Fixed percentage baseline adjusted by checklist completion.
- **Incremental Points:** Derived from off-shelf display quantity, product multipliers, and category impacts.

---

## Key Documentation
- `scorecard-app/docs/prd-mvp.md`: Product Requirements Document for the MVP.
- `scorecard-app/docs/pss-corrected-logic-alignment.md`: Detailed alignment of the PSS scoring logic.
- `scorecard-app/docs/build-checklist.md`: Checklist for build and deployment tasks.
