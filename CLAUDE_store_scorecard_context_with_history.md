# CLAUDE.md — Store Scorecard Mobile Prototype Context

## Project Name
Store Scorecard Mobile Prototype

## Project Purpose
This project is a **clickable React prototype** for a **mobile-first Store Scorecard workflow** inspired by Salesforce mobile and Lightning-style enterprise UX.

This is **not** the final production application.

The purpose of this prototype is to help business stakeholders, product owners, and project teams review and react to:
- the user flow
- the mobile experience
- the practicality of the input steps
- the usefulness of the summary output
- the difference between a version **without Agentforce** and a version **with Agentforce**

The prototype should be used as a **workflow validation tool**, not a technical proof of final backend implementation.

---

# 1) Business Context

The project relates to a **Store Scorecard** concept for field execution.

The business wants a mobile scorecard that can be used during a store visit to:
- capture execution against required plan elements
- capture incremental off-shelf placements
- support a score outcome
- surface business recommendations
- help drive store execution behavior

This scorecard is intended to go beyond a simple “check the box” survey.

The broader business themes include:
- execution compliance
- off-shelf support
- incremental placements
- risk / opportunity thinking
- score visibility
- mobile field usability
- speed of capture
- accountability through photo proof
- summary outputs for review and communication

This prototype is based on the idea that the scorecard should feel:
- structured
- useful
- quick to complete
- mobile-friendly
- suitable for field users already inside a visit

---

# 2) Key Product Assumption

The user is already inside an **active visit**.

That means:
- no separate store search is needed
- no account search is needed
- no visit picker is needed
- no separate customer selection should interrupt the flow

The workflow should start in-context.

This is a **visit-driven scorecard**, not a floating generic survey.

---

# 3) Prototype Goal

The goal of the React app is to simulate a believable mobile experience where a field user can:

1. open a scorecard from an active visit
2. confirm required execution items
3. capture off-shelf placements
4. add products and estimated quantities
5. upload proof and notes
6. review a score summary

The prototype is intended to be:
- interactive
- scrollable
- click-through
- visually polished
- easy for business users to review

It should feel like a working app, even though it uses only mock logic and local state.

---

# 4) What This Prototype Is Not

Do **not** treat this as:
- the final production build
- a real Salesforce application
- a real backend implementation
- a real integration proof
- a true scoring engine
- a barcode scanning solution
- an exact floor-plan intelligence tool
- an exact store-history engine

Do **not** overbuild.

This project is meant to validate:
- the user journey
- the screen flow
- the practicality of the data entry pattern
- the usefulness of the outputs

---

# 5) Core UX Direction

The prototype should feel like a **Salesforce mobile / Lightning-inspired enterprise app**.

## The UX should feel:
- professional
- mobile-first
- clean
- structured
- enterprise-focused
- touch-friendly
- easy to scan visually
- calm, not flashy

## The UX should not feel:
- like a consumer shopping app
- like an ecommerce app
- like a chatbot-first interface
- like a gaming app
- like a static survey form
- like a generic admin dashboard

---

# 6) Visual Design Direction

## Overall style
Use a visual style inspired by:
- Salesforce mobile
- Lightning Design System patterns
- enterprise record-driven mobile flows
- compact business cards
- sticky bottom action bars
- segmented controls
- metric summary cards

## Visual traits
- realistic phone container
- rounded cards
- clean spacing
- compact but readable headers
- subtle shadows
- simple status chips
- strong CTA buttons
- clear progress indication
- easy-to-tap controls
- scrollable content inside phone shell

## Keep the design:
- practical
- believable
- demo-ready
- easy for stakeholders to understand

---

# 7) Known Design Constraints

There is **not enough validated store-level intelligence** yet to design this as a highly precise store-mapping application.

The prototype should **not assume**:
- exact per-store aisle coordinates
- exact floor plan layout for every Home Depot or Lowe’s location
- exact historical placement positions
- fully trusted historical placement data
- real AI recommendation logic backed by data

Instead, the prototype should use:
- banner context
- visit context
- standardized location types
- sample category/product lists
- estimated quantity inputs
- mock recommendations
- mock score outputs

This is important.

The mockup should represent a **guided capture workflow**, not a fake “all-knowing” system.

---

# 8) Product Scope for Prototype

The prototype should focus on one manageable mobile scenario:
- one active visit
- one store example
- one scorecard example
- one simple guided flow
- one summary outcome

Use a sample banner such as:
- Home Depot

Use standardized retail placement/location types such as:
- Fenceline
- Endcap
- Garden Doors
- Racetrack / Drive Aisle
- Other

Use simple example product categories such as:
- Seed
- Weed & Feed
- Fertilizer
- Controls

---

# Follow-up Terminology

Follow-up is a NEW scorecard instance based on the previous completed scorecard.
It is used to validate what changed since the last completed execution.

Initial = full new scorecard
Follow-up = new scorecard based on prior completed scorecard
Resume Draft = continuation of an unfinished scorecard

Important:
Do not mix Follow-up with Resume.

Follow-up is not a resumed draft.
It is a change-tracking scorecard run created after a previous scorecard has already been completed.

This distinction is important for:
- user understanding
- data model clarity
- correct summary logic
- future reporting

---

# Revisit Flag Terminology

Replace Follow-up Required with Revisit Required.

Definition:
Revisit Required is a user-set flag indicating that the store should be tracked for a future execution visit.

Purpose:
- highlight unresolved gaps
- mark store for future operational review
- support follow-up planning

---

# Revisit Flag UX

When Revisit Required is enabled, the UI should show a non-blocking confirmation message.

Recommended message:
Revisit flagged successfully.
This store will be tracked for follow-up execution.

This is a front-end confirmation only unless backend workflow is implemented.

---

# Shelf Reset Flag UX

When Shelf Reset Needed is enabled, the UI should show a non-blocking confirmation message.

Recommended message:
Shelf reset flagged successfully.
This store will be marked for layout correction before the next visit.

---

# Submission Success Feedback

The system may show a subtle success celebration after successful scorecard submission.

Trigger conditions:
- scorecard submitted successfully
- at least one incremental display captured
- no critical blockers remaining

Recommended feedback:
- subtle confetti animation
- success message:
  Nice execution! You added incremental value to this store.

Purpose:
- reinforce positive execution behavior
- improve demo experience
- reward meaningful completion

Do not trigger celebration:
- for draft save
- for blocked submission
- when required evidence is missing

---

# Follow-up Entry Experience

Follow-up mode should present the previous completed scorecard as a reference baseline, not as an unfinished draft.

Expected content:
- previous completed scorecard loaded
- prior score
- prior display count
- last completed date
- explanation of follow-up purpose

Primary CTA:
Start Follow-up

Suggested flow steps:
- Review Prior Displays
- Update Evidence
- Review Changes & Submit

Avoid wording such as:
- Continue Follow-up
- Resume point
- In Progress

when referring to a new follow-up session.

---

# Scorecard Execution States

The product conceptually supports 3 execution states:

Initial
- full execution flow

Follow-up
- new execution session using previous completed scorecard as baseline

Resume Draft
- unfinished session continued later

Current MVP priority:
- Initial
- Follow-up

Resume Draft may remain future or separate if not implemented explicitly.
- Other

Use quantity bucket examples such as:
- 40
- 80
- 120
- 200
- 320+

---

# 9) Screen Structure

### Historical context guidance for the prototype

The prototype may show a lightweight **Previous Store Snapshot** or **Recent Store Activity** block.

This is recommended because the business process is iterative and repeated use over time matters.

However, the prototype should present this honestly.

The UI should **not** pretend there is perfect historical truth or exact comparable data if that has not been validated.

Safe labels to use:
- Previous Store Snapshot
- Recent Store Activity
- Last Scorecard Submission
- Compared to Last Submission
- Related Survey History

Prefer to show:
- last score
- last submission date
- last submitted by
- repeated missing area
- repeated opportunity area
- score up/down trend
- LGOR up/down trend
- Risk up/down trend

Avoid implying precision if the source history may not be fully comparable.

If historical data is from the exact same scorecard type and store, it can be shown as:
- Previous Scorecard
- Compared to Last Scorecard

If historical data may come from broader store surveys or related submissions, use softer labels like:
- Related Survey History
- Recent Store Activity

Recommended placement in the prototype:
- small **Previous Store Snapshot** card on the Entry screen
- optional **Compared to Last Submission** block on the Score Summary screen

Example mock content:
- Last score: 142
- Last submitted: Mar 12
- Last issue: Garden Doors missing
- Last opportunity: Weed & Feed Endcap
- Score vs last submission: +18
- LGOR vs last submission: +5.6%
- Risk vs last submission: down 14%

This historical context should make the prototype feel more useful and realistic, while still being clearly mock/sample data.

## Screen 1 — Entry screen — inside Active Visit
Purpose:
- start in-context
- confirm store + banner + visit status
- launch scorecard with zero friction

Show:
- store name: Home Depot 1907
- banner: Home Depot
- visit status chip: Active
- scorecard version: Q1 2026 Store Scorecard
- helper text
- primary CTA: Start Scorecard
- compact Previous Store Snapshot card

Example Previous Store Snapshot:
- Last score: 142
- Last submitted: Mar 12
- Last issue: Garden Doors missing
- Last opportunity: Weed & Feed Endcap

## Screen 2 — Execution checklist
Purpose:
- capture required execution / baseline setup

Show:
- execution items
- Yes / No / N/A controls
- score preview chip
- progress indicator

Example items:
- Plant Food POG
- Chemical POG
- Indoor Soil POG
- Grass Seed POG
- Endcap
- Garden Doors
- Fenceline
- Racetrack

## Screen 3 — Off-shelf location and item capture
Purpose:
- capture incremental off-shelf execution

Show:
- location selector
- category selector
- product list
- estimated quantity chips
- add another SKU
- add another location
- compact summary of chosen items

## Screen 4 — Photo and notes
Purpose:
- capture proof and simple context

Show:
- image upload area
- placeholder image or image selection
- caption
- optional notes
- summary of chosen items

## Screen 5 — Score summary
Purpose:
- show outcome in a way that feels useful

Show:
- large Total Score card
- metric cards for:
  - Execution
  - Base Plan
  - Above & Beyond
  - LGOR %
  - Risk $
- sections:
  - Missing MAP
  - Missing Top Items
  - Not Enough
  - Empty Calories
- compared to last submission block
- business-output layer:
  - store vs region comparison
  - score rank
  - LGOR rank
  - risk rank
  - risk minimized
  - current risk
  - incremental table
  - opportunity table
  - risk table
  - leaderboard preview
  - accountability section
  - feedback loop section
- bottom actions:
  - Submit
  - Email Snapshot
  - Post to Chatter

Example comparison block:
- Score vs last: +18
- LGOR vs last: +5.6%
- Risk vs last: down 14%
- Repeated gap: Garden Doors

## Outcome layer expectations
The summary should not stop at visit completion.
It should answer the business question:
What do we get out of this?

Expected summary framing:
- visit outcome
- region comparison
- accountability context
- incremental value captured
- remaining opportunity
- open risk
- business feedback loop

Recommended section titles:
- Visit Outcome & Next Actions
- Home Depot #1907 vs Region
- Incremental, Opportunity & Risk
- Leaderboard & Accountability
- Feedback Loop

The summary should communicate:
- how this store ranks
- what value was captured
- what opportunity remains
- what risk remains
- who owns the next move
- how the scorecard supports future planning and ROI discussion

## Feedback loop expectations
The prototype should include a lightweight business feedback loop section.

Recommended framing:
- FST vs Base Plan
- FST = POS
- FST vs Risk
- FST = ROI

This remains mock/sample logic, but it should tell a clearer business story than a simple score recap.

---

# 10) Agentforce Usage in Prototype

The prototype should support **two display modes**:

1. Without Agentforce
2. With Agentforce

The difference should be visible but not disruptive.

## Without Agentforce
The app is a clean guided scorecard flow with no assistant cards.

## With Agentforce
Add small assistant cards into the same flow.

Do **not** redesign the entire app around chat.

Agentforce should appear as **light contextual assistance** only.

## Recommended Agentforce cards by screen

### Screen 1
**Agentforce Insight**
- brief context
- top opportunity area
- quarter focus
- short summary of recent store trend

### Screen 2
**Agentforce Guidance**
- hints about expected execution
- likely missing required area

### Screen 3
**Agentforce Recommendation**
- suggested location, category, or product
- small helpful recommendation text

### Screen 4
**Agentforce Draft**
- suggested note or caption based on selected inputs

### Screen 5
**Agentforce Summary**
- why the score looks this way
- top missed opportunity
- next best action
- short comparison versus recent submission

Agentforce should remain:
- compact
- helpful
- secondary
- integrated into page layout

It should **not** dominate the UI.

---

# 11) Technical Build Expectations

## Tech Stack
Use:
- React or Next.js
- Tailwind CSS
- local component state only

Optional:
- lucide-react for icons
- framer-motion for smooth transitions

## Do not use:
- backend
- database
- authentication
- real API integration
- real Salesforce SDK integration
- barcode scanning implementation
- production file upload logic

## Code style
The code should be:
- easy to run
- easy to edit
- easy to demo
- organized but not over-engineered
- suitable for quick iteration after stakeholder feedback

---

# 12) Behavioral Expectations for the App

The prototype should feel interactive.

## Required behavior
- next/back navigation works
- selections persist across screens
- selected values visibly update
- quantity chips can be selected
- image placeholder selection shows preview
- summary screen reflects earlier selections using simple mock logic
- toggle between with/without Agentforce mode works

## Helpful but optional behavior
- score preview updates visually
- small animations between screens
- subtle transitions
- progress indicator updates

---

# 13) Scoring Expectations

The prototype does **not** need to implement final business scoring logic.

Use **mock scoring logic only**.

## Example mock approach
- Execution Score = based on number of “Yes” responses
- Base Plan = simple fixed demo number
- Above & Beyond = increases based on selected products and quantity levels
- Total Score = sum of those values
- LGOR % and Risk $ = lightweight mock derived values

The goal is not formula accuracy.

The goal is:
- make the output feel believable
- make the summary useful for a mockup review
- avoid pretending the backend score engine is already finalized

---

# 14) Data Assumptions for Prototype

Use sample/mock data only.

## Example store data
- Store name: Home Depot 1907
- Banner: Home Depot
- Visit status: Active
- Scorecard version: Q1 2026 Store Scorecard

## Example categories
- Seed
- Weed & Feed
- Fertilizer
- Controls

## Example product ideas
Use 5–8 realistic sample SKUs or product names per category.
They do not need to be exact production records.

## Example quantity buckets
- 40
- 80
- 120
- 200
- 320+

## Example assistant text
- Top opportunity this quarter: Weed & Feed on Endcap
- Biggest missed area: Garden Doors execution
- Consider a higher quantity tier for this SKU
- Score improved because execution is strong and incremental support was added
- This store improved from the last submission but still shows repeated Garden Doors gaps

---

# 15) What the Prototype Should Communicate to Stakeholders

The prototype should communicate the following ideas clearly:

1. The scorecard is **visit-driven**
2. The workflow is **mobile-first**
3. The app is **fast and guided**
4. Baseline execution and incremental off-shelf capture are separated clearly
5. The output is useful and actionable
6. Agentforce can be added as a contextual assistant without breaking the core flow
7. Historical store context can be shown in a believable way without pretending all data is perfect
8. The concept can be reviewed before committing to final calculation or backend design

---

# 16) Delivery Mindset

When building this prototype, optimize for:
- clarity over perfection
- believability over fake precision
- usability over completeness
- iteration speed over technical depth

This is a **review artifact** for discussion and alignment.

It is not the final application.

---

# 17) Final Instruction to Claude

Build a polished, mobile-first, Lightning-inspired React prototype for a Store Scorecard workflow that starts from an active visit, uses five clear screens, supports with/without Agentforce modes, optionally shows prior store history in a lightweight and honest way, and feels like a realistic Salesforce field-execution experience without pretending to be backed by real enterprise data.
