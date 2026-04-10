# Design System Strategy: The Enterprise Architect

## 1. Overview & Creative North Star
The "Enterprise Architect" is our creative vision for this design system. We are moving beyond the "utility-only" mindset of enterprise software to create an environment that feels like a high-end, bespoke digital workspace. 

Our North Star is **"Structural Sophistication."** While we respect the DNA of the Salesforce Lightning Design System (SLDS), we elevate it through intentional depth, tonal layering, and an editorial approach to information density. We don't just display data; we curate an authoritative experience. By utilizing asymmetrical breathing room and a hierarchy built on light rather than lines, we transform a "native mobile app" into a premium professional tool that inspires trust through precision.

---

## 2. Colors: Tonal Depth vs. Flat Grids
In this design system, color is not a decoration; it is the infrastructure. We use the Material Design-inspired palette to create a "Living Surface."

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Traditional lines create visual "noise" that exhausts the user. Instead, boundaries must be defined solely through background color shifts. 
*   **Implementation:** Place a `surface_container_low` section directly onto a `background` surface. The shift in hex value provides all the separation the eye needs.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine, heavy-stock paper.
*   **Foundation:** `background` (#f9f9f8).
*   **The Work Space:** `surface_container_lowest` (#ffffff) for primary content cards to provide maximum "pop."
*   **Sub-Navigation/Grouping:** Use `surface_container` (#eeeeed) to group related secondary actions.

### The "Glass & Gradient" Rule
To escape the "commodity app" feel, use Glassmorphism for floating action buttons or sticky headers. 
*   **Action:** Apply `primary_container` at 85% opacity with a `20px` backdrop-blur. 
*   **Signature Textures:** For high-impact CTAs, use a subtle linear gradient (45°) from `primary` (#005da9) to `primary_container` (#0176d3). This "Blue Pulse" adds a sense of energy and premium finish that flat blue cannot replicate.

---

## 3. Typography: The Editorial Authority
We use **Inter** as our typographic engine. It provides the Swiss-style precision necessary for an enterprise-grade experience.

*   **Display & Headline (The Statement):** `display-sm` and `headline-lg` are used sparingly for dashboard headers or key metrics. These should feel like titles in a premium financial journal.
*   **Title (The Navigation):** `title-lg` and `title-md` act as your primary anchors for card titles. 
*   **Body (The Utility):** `body-md` is our workhorse. We prioritize legibility by ensuring `on_surface_variant` is used for secondary body text to create a clear "read-order" against the primary `on_surface` headlines.
*   **Label (The Detail):** `label-md` in all-caps with a `0.05rem` letter spacing should be used for data labels (e.g., "OPPORTUNITY VALUE") to create a professional, "metadata" aesthetic.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often a crutch for poor layout. In this system, we use light and stacking to convey importance.

### The Layering Principle
Depth is achieved by "stacking" surface tiers. 
*   **Example:** A `surface_container_lowest` (#ffffff) card sitting on a `surface_container_low` (#f4f4f3) background creates a soft, natural lift.

### Ambient Shadows
When a "floating" effect is required (e.g., a primary action card), use an "Ambient Shadow":
*   **Blur:** 24px to 32px.
*   **Opacity:** 4% - 6%.
*   **Color:** Use a tinted shadow based on `primary` (e.g., `#001c39` at 5% opacity). This mimics natural light passing through a blue-tinted lens, feeling much more "integrated" than a generic grey shadow.

### The "Ghost Border" Fallback
If accessibility requirements demand a border, use the **Ghost Border**:
*   **Token:** `outline_variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Precision Elements

### Cards & Lists
*   **Constraint:** Zero divider lines. 
*   **Execution:** Separate list items using `8px` of vertical white space (Spacing Scale). 
*   **Style:** Use the `lg` (1rem) roundedness for large clickable cards to make them feel approachable yet substantial.

### Buttons
*   **Primary:** `primary` background with `on_primary` text. No border. `DEFAULT` (0.5rem) roundedness.
*   **Secondary:** `surface_container_high` background. No border. This creates a "button" feel through shape and depth rather than a stroke.
*   **Tertiary:** Text-only using `primary` color, strictly for low-priority actions.

### Input Fields
*   **State:** Use `surface_container_lowest` as the fill. 
*   **Focus:** Transition the "Ghost Border" from 15% to 100% opacity using the `primary` token. Avoid "thickening" the border on focus; color shift is enough.

### Navigation (Standard Salesforce Pattern)
*   **Bottom Bar:** Use `surface_container_lowest` with a `16px` blur glassmorphism effect. Active icons should use `primary` with a subtle `secondary_container` circular glow behind them.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetry:** Place a large `display-sm` metric on the left, balanced by a small `label-md` status on the right to create a dynamic, modern layout.
*   **Embrace White Space:** Enterprise data is dense; your layout shouldn't be. Use the `xl` spacing scale between major sections.
*   **Prioritize Tonal Shifts:** Use the difference between `surface_dim` and `surface_bright` to guide the user's eye without drawing "boxes."

### Don’t:
*   **Don't Use Pure Black:** Never use `#000000` for text. Use `on_surface` (#1a1c1c) to maintain the "premium paper" feel.
*   **Don't Use 1px Dividers:** If you feel the urge to draw a line, try increasing the background contrast between the two sections instead.
*   **Don't Crowd the Corners:** Keep a minimum of `1.5rem` (xl) padding inside cards. Information needs room to breathe to feel "trustworthy."