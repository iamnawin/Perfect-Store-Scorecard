# Store Scorecard Mockup Pack — Salesforce Mobile Style

This file contains:

1. A clean **Salesforce-style mockup direction**
2. **5-screen structure**
3. **Screen-by-screen image prompts**
4. **Without Agentforce** and **With Agentforce** variants
5. A **Claude-ready markdown brief** to build the React prototype

---

# 1) Design Intent

Build a **mobile-first Store Scorecard prototype** that feels like a workflow inside **Salesforce mobile**.

This should look and feel like:
- a Salesforce mobile field workflow
- a Lightning-inspired enterprise UI
- a visit-driven scorecard experience
- a realistic business prototype

This should **not** feel like:
- a consumer shopping app
- a generic survey tool
- a chatbot-first product
- a polished final production app with real backend intelligence

The prototype should reflect the fact that the user is already inside an **active visit** and does not need to search for the store again.

---

# 2) Mockup Strategy

## Best way to structure the mockup
Think in **5 screens only**.

1. Entry screen — inside Active Visit  
2. Execution checklist screen  
3. Off-shelf location and item capture  
4. Photo and notes screen  
5. Score summary screen  

This is enough to validate:
- visit-driven entry
- field-user speed
- baseline execution capture
- incremental off-shelf capture
- proof upload
- summary usefulness

---

# 3) Global UI Direction

Use these principles across all screens:

- Salesforce mobile style
- Lightning Design System inspired
- enterprise field workflow
- record-driven mobile UI
- clean card layout
- compact headers
- sticky bottom action bar
- large touch targets
- segmented controls where useful
- simple status chips
- subtle shadows
- modern rounded cards
- clear hierarchy
- scrollable screen content
- realistic phone proportions

Visual tone:
- calm
- professional
- mobile-first
- simple
- high clarity
- business-ready

---

# 4) Screen-by-Screen Brief

## Screen 1 — Entry screen — inside Active Visit

### Purpose
Zero friction.

### Show
- Store name
- Banner: Home Depot / Lowe’s
- Visit Status = Active
- Quarter / Scorecard Version
- Primary CTA: Start Scorecard
- compact Previous Store Snapshot card

### Important behavior
- No store search
- No account lookup
- No extra visit picker
- User is already in visit context

### Why this matters
This tells stakeholders:
“This is not a random survey floating in the void. It is launched from an active visit and tied directly to store execution.”

It can also optionally show lightweight prior store context so the user understands the last score, repeated gaps, or last opportunity area without making the screen heavy.

### UI direction
- Salesforce mobile page header
- record-summary style card
- status chip for Active
- compact historical snapshot card
- clean spacing
- sticky bottom CTA

### Prompt — Without Agentforce
Design a **Salesforce mobile-style entry screen** for a Store Scorecard launched from an active store visit. Use a clean Lightning-inspired UI with a compact page header, rounded record summary card, and sticky bottom action bar. Show Store Name, Banner, Visit Status as “Active,” and Scorecard Version such as “Q1 2026 Store Scorecard.” Add a compact **Previous Store Snapshot** card with sample fields like Last Score, Last Submitted Date, Top Repeated Issue, and Top Opportunity. Do not show any store search or selection controls. Add a primary button labeled “Start Scorecard.” The layout should feel like a Salesforce mobile business workflow, not a consumer app.

### Prompt — With Agentforce
Design a **Salesforce mobile-style entry screen** for a Store Scorecard launched from an active store visit. Use a clean Lightning-inspired UI with a compact page header, rounded record summary card, and sticky bottom action bar. Show Store Name, Banner, Visit Status as “Active,” and Scorecard Version such as “Q1 2026 Store Scorecard.” Add a compact **Previous Store Snapshot** card with sample fields like Last Score, Last Submitted Date, Top Repeated Issue, and Top Opportunity. Add a small Lightning-style assistant card labeled **Agentforce Insight** that summarizes the store’s recent trend or repeated opportunity. Keep the assistant compact and secondary to the page content. Do not show any store search or selection controls. Add a primary button labeled “Start Scorecard.”

---

## Screen 2 — Execution checklist screen

### Purpose
Capture required base plan / setup compliance quickly.

### Show
Required execution items such as:
- Plant Food POG
- Chemical POG
- Indoor Soil POG
- Grass Seed POG
- Endcap
- Garden Doors
- Fenceline
- Racetrack

Each row should support:
- Yes
- No
- N/A

Also show:
- progress indicator
- small score preview chip

### Why this matters
This captures the baseline execution layer before incremental off-shelf opportunities are added.

### UI direction
- Lightning-style list or card rows
- segmented controls for Yes / No / N/A
- easy thumb-tap layout
- bottom CTA

### Prompt — Without Agentforce
Design a **Salesforce mobile checklist screen** for Store Scorecard execution capture. Use Lightning-style cards and segmented Yes / No / N/A controls for each required execution item. Include a compact progress bar at the top and a small score preview chip. Keep the layout simple, touch-friendly, and enterprise-oriented. Use a sticky bottom CTA labeled “Next.” The screen should look like a polished Salesforce mobile workflow for field users.

### Prompt — With Agentforce
Design a **Salesforce mobile checklist screen** for Store Scorecard execution capture. Use Lightning-style cards and segmented Yes / No / N/A controls for each required execution item. Include a compact progress bar at the top and a small score preview chip. Add a compact assistant card labeled **Agentforce Guidance** that explains what is usually expected for this store type or quarter and highlights one likely missing execution area. Keep the assistant subtle and integrated into the page. Use a sticky bottom CTA labeled “Next.”

---

## Screen 3 — Off-shelf location and item capture

### Purpose
Capture incremental store execution in a practical way.

### Show
- Location selector:
  - Endcap
  - Garden Doors
  - Fenceline
  - Racetrack / Drive Aisle
  - Other
- Category selector
- Pre-populated item list
- Estimated quantity choices
- Add another item / location
- Compact selection summary

### Why this matters
This is the real business differentiator:
not just “is the plan set,” but what extra execution is happening off-shelf.

### UI direction
- Salesforce mobile cards
- dropdown or pill selector feel
- quantity chips
- repeatable summary cards
- clean vertical rhythm

### Prompt — Without Agentforce
Design a **Salesforce mobile data-entry screen** for incremental off-shelf placement capture in a Store Scorecard flow. Use Lightning-style cards, dropdowns, and pill selectors. Show a location selector, category selector, pre-populated product list, and estimated quantity choices such as 40, 80, 120, 200, and 320+. Include actions for “Add Another SKU” and “Add Another Location.” Show a compact summary card of selected entries. The UI should feel like a realistic Salesforce mobile field workflow.

### Prompt — With Agentforce
Design a **Salesforce mobile data-entry screen** for incremental off-shelf placement capture in a Store Scorecard flow. Use Lightning-style cards, dropdowns, and pill selectors. Show a location selector, category selector, pre-populated product list, and estimated quantity choices such as 40, 80, 120, 200, and 320+. Include actions for “Add Another SKU” and “Add Another Location.” Add a compact assistant card labeled **Agentforce Recommendation** that suggests the most promising location, category, or product for this store and quarter. Keep the assistant compact and helpful, not dominant. Show a compact summary card of selected entries.

---

## Screen 4 — Photo and notes screen

### Purpose
Capture proof and lightweight context.

### Show
- Photo upload area
- Thumbnail preview
- Optional caption
- Optional notes
- Summary of selected items

### Why this matters
The business wants proof and accountability without making the workflow too heavy.

### UI direction
- Salesforce-style upload area
- file preview card
- simple text fields
- summary block
- sticky bottom CTA

### Prompt — Without Agentforce
Design a **Salesforce mobile proof-capture screen** for a Store Scorecard workflow. Show a Lightning-style photo upload component, image thumbnail preview, optional caption field, optional notes area, and a summary card showing the selected location, products, and quantities. Keep the layout clean, spacious, and mobile-friendly. Add a sticky bottom CTA labeled “Review Score.”

### Prompt — With Agentforce
Design a **Salesforce mobile proof-capture screen** for a Store Scorecard workflow. Show a Lightning-style photo upload component, image thumbnail preview, optional caption field, optional notes area, and a summary card showing the selected location, products, and quantities. Add a small assistant card labeled **Agentforce Draft** that offers a short suggested visit note or summary sentence based on the current entries. Keep the assistant secondary to the main proof-capture UI. Add a sticky bottom CTA labeled “Review Score.”

---

## Screen 5 — Score summary screen

### Purpose
Show outcome in a way that drives action.

### Show
- Total Score
- Execution
- Base Plan
- Above & Beyond
- LGOR %
- Risk $
- Missing MAP
- Missing Top Items
- Not Enough
- Empty Calories
- Compared to Last Submission block
- Actions:
  - Submit
  - Email Snapshot
  - Post to Chatter

### Why this matters
This is the business payoff screen.
It should feel like:
“I entered the data, and now I understand performance, risk, and next actions.”

### UI direction
- prominent total score card
- Lightning-style metric tiles
- recommendation sections below
- compact comparison section
- business action buttons at bottom

### Prompt — Without Agentforce
Design a **Salesforce mobile score summary screen** for a Store Scorecard prototype. Use Lightning-style metric cards and a polished enterprise mobile layout. Show a prominent Total Score card followed by smaller cards for Execution, Base Plan, Above & Beyond, LGOR %, and Risk $. Below that, show recommendation sections for Missing MAP, Missing Top Items, Not Enough, and Empty Calories. Add a compact **Compared to Last Submission** section showing score trend, LGOR trend, Risk trend, and one repeated gap. Add bottom actions for Submit, Email Snapshot, and Post to Chatter. The screen should feel like a modern Salesforce mobile workflow outcome screen.

### Prompt — With Agentforce
Design a **Salesforce mobile score summary screen** for a Store Scorecard prototype. Use Lightning-style metric cards and a polished enterprise mobile layout. Show a prominent Total Score card followed by smaller cards for Execution, Base Plan, Above & Beyond, LGOR %, and Risk $. Below that, show recommendation sections for Missing MAP, Missing Top Items, Not Enough, and Empty Calories. Add a compact **Compared to Last Submission** section showing score trend, LGOR trend, Risk trend, and one repeated gap. Add a Lightning-style assistant card labeled **Agentforce Summary** that explains why the score looks like this, summarizes recent trend versus the prior submission, highlights the top missed opportunity, and suggests the next best action. Add bottom actions for Submit, Email Snapshot, and Post to Chatter.

---

# 5) Agentforce Placement Guidance

If showing Agentforce, do not redesign the whole flow.

Only add small assistant cards on:
- Entry screen
- Execution checklist screen
- Off-shelf capture screen
- Photo and notes screen
- Score summary screen

Recommended labels:
- Agentforce Insight
- Agentforce Guidance
- Agentforce Recommendation
- Agentforce Draft
- Agentforce Summary

This keeps the Salesforce mobile feel intact and avoids turning the prototype into a chatbot-heavy concept.

---

# 6) Claude Build Brief — React Prototype

Use this markdown prompt in Claude to generate the React prototype.

```md
Build a mobile-first React prototype for a Store Scorecard workflow.

This is a clickable prototype, not a production app.

# Goal
Create a polished mobile business app simulation that allows stakeholders to click through a 5-screen Store Scorecard flow inside a realistic phone-style UI.

The prototype should:
- be scrollable
- be interactive
- allow state changes
- feel like a Salesforce mobile business workflow
- use sample/mock data only
- require no backend
- require no login
- require no real Salesforce integration

# Tech Stack
Use:
- React or Next.js
- Tailwind CSS
- local component state only
- no backend
- no database
- no authentication

Optional:
- framer-motion for transitions
- lucide-react for icons

# Important Constraints
Do not build this as a production app.
Do not connect to APIs.
Do not build barcode scanning.
Do not build real upload logic.
Do not over-engineer.

Use mock data and placeholder images only.

# Product Context
This prototype simulates a field user who is already inside an active store visit and wants to complete a Store Scorecard for a Home Depot location.

The prototype should not assume exact floor-plan intelligence or store-specific placement history.
Use standardized retail location types and simple guided inputs.

Location types:
- Fenceline
- Endcap
- Garden Doors
- Racetrack / Drive Aisle
- Other

Categories:
- Seed
- Weed & Feed
- Fertilizer
- Controls
- Other

Quantity buckets:
- 40
- 80
- 120
- 200
- 320+

# UX Style
The app should feel:
- mobile-first
- clean
- modern
- professional
- Lightning-inspired
- card-based
- touch-friendly
- demo-ready

Add a realistic phone container centered on the page.

Use:
- sticky bottom CTA buttons
- compact page header
- progress indicator
- clear step labels
- rounded cards
- simple status chips
- subtle shadows
- scrollable content inside the phone shell

# Structure
Build a single-page prototype with internal step state.

The prototype should have exactly 5 screens:

## Screen 1 — Entry screen — inside Active Visit
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

### Agentforce variant
Include a compact card labeled “Agentforce Insight”.

## Screen 2 — Execution checklist
Show:
- execution items:
  - Plant Food POG
  - Chemical POG
  - Indoor Soil POG
  - Grass Seed POG
  - Fenceline
  - Endcap
  - Garden Doors
  - Racetrack
- Yes / No / N/A segmented controls
- small score preview chip
- next CTA

### Agentforce variant
Include a compact card labeled “Agentforce Guidance”.

## Screen 3 — Off-shelf location and item capture
Show:
- location selector
- category selector
- product list
- quantity bucket chips
- add another SKU
- add another location
- summary of chosen items

### Agentforce variant
Include a compact card labeled “Agentforce Recommendation”.

## Screen 4 — Photo and notes
Show:
- mock photo upload area
- one or more placeholder image options
- caption input
- optional notes
- summary block

### Agentforce variant
Include a compact card labeled “Agentforce Draft”.

## Screen 5 — Score summary
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
- bottom actions:
  - Submit
  - Email Snapshot
  - Post to Chatter

Example comparison block:
- Score vs last: +18
- LGOR vs last: +5.6%
- Risk vs last: down 14%
- Repeated gap: Garden Doors

### Agentforce variant
Include a compact but noticeable card labeled “Agentforce Summary”.

# Core Behavior
Implement local mock state so the prototype feels interactive.

Requirements:
- next/back navigation works
- selections persist while navigating
- yes/no/n-a states visibly update
- selected location updates the summary
- product and quantity selections persist
- placeholder image selection shows preview
- final screen reflects earlier choices using lightweight mock logic

# Demo Scoring Logic
Use simple local mock logic only.
Example:
- Execution Score based on number of Yes selections
- Base Plan score fixed demo number
- Above & Beyond increases with more products or higher quantity
- Total score is the sum
- LGOR and Risk can be simple computed mock values

This does not need to match final enterprise math.
It only needs to feel believable for workflow testing.

# Variants
Support two display modes:
1. Without Agentforce
2. With Agentforce

Add a top toggle outside the phone shell:
- Without Agentforce
- With Agentforce

When toggled:
- assistant cards appear or disappear
- core workflow remains the same

# Deliverable Expectations
Return polished prototype code in a single self-contained React file if possible.
If too large, split into logical components but keep it easy to run.

Use Tailwind only.
Do not add unnecessary dependencies.

# Final Goal
The result should feel like a realistic Salesforce mobile scorecard prototype that stakeholders can click through, compare with and without Agentforce, and use for workflow feedback.
```

---

# 7) Recommended Prompt Keywords

Use these in any UI generation prompt:

- Salesforce mobile style
- Lightning Design System inspired
- enterprise field workflow
- record-driven mobile UI
- sticky bottom action bar
- segmented controls
- metric cards
- compact Salesforce-like page layout
- visit-driven workflow
- not consumer ecommerce
- not chatbot heavy

---

# 8) Final Direction Statement

Design a **Salesforce mobile, visit-driven Store Scorecard workflow** that feels native to Lightning-style field execution rather than a generic survey tool.
