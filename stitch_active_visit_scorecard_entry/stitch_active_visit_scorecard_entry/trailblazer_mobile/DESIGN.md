# Design System Specification: The Architectural Intelligence

## 1. Overview & Creative North Star
**Creative North Star: "The Fluid Enterprise"**

While the foundation of this design system is rooted in the reliability of Salesforce, its execution must transcend the "enterprise template" look. We are not building a static database; we are crafting an authoritative digital environment that feels responsive, layered, and intelligent. 

The "Fluid Enterprise" aesthetic moves away from rigid, boxy structures in favor of **intentional asymmetry** and **tonal depth**. By utilizing a high-contrast typography scale and removing harsh structural lines, we create a mobile experience that feels editorial—where data is not just displayed, but curated. We achieve this through "The Breathing Layout," ensuring that vertical white space and subtle surface shifts do the heavy lifting that borders used to do.

---

## 2. Colors & Surface Philosophy
The palette utilizes the trusted Salesforce blues but applies them through a sophisticated layering system.

### Color Tokens
*   **Primary (Action):** `#00658e` (The anchor for critical interactions)
*   **Primary Container (Vibrancy):** `#00a1e0` (Used for energy and brand presence)
*   **Secondary (Trust):** `#005fac` (For secondary actions and navigational cues)
*   **Surface:** `#f9f9f8` (Our clean, off-white canvas)
*   **Surface Container Lowest:** `#ffffff` (Pure white for the highest level of prominence)

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning. Structural definition must be achieved through:
1.  **Background Shifts:** Placing a `surface-container-lowest` card against a `surface-container-low` background.
2.  **Tonal Transitions:** Using the `surface-container` tiers (Lowest to Highest) to create "nested" depth.
3.  **Signature Textures:** For high-impact CTAs, use a subtle linear gradient from `primary` (#00658e) to `primary-container` (#00a1e0) at a 135-degree angle. This adds "soul" and depth that flat color cannot provide.

---

## 3. Typography: The Editorial Edge
We utilize **Inter** to bring a clean, modern, and highly legible feel to complex data.

*   **Display (sm/md/lg):** 2.25rem – 3.5rem. Reserved for high-level dashboard summaries or welcome states. Use `display-md` with `tracking-tighter` to create an authoritative, editorial look.
*   **Headline (sm/md/lg):** 1.5rem – 2rem. Used for section headers. Ensure `headline-sm` has generous top-margin to signal a clear break in content.
*   **Title (sm/md/lg):** 1rem – 1.375rem. The workhorse for card titles and list headers.
*   **Body (sm/md/lg):** 0.75rem – 1rem. All body text should use `on-surface-variant` (#3e4850) to reduce visual vibration and improve long-form reading comfort.
*   **Label (sm/md):** 0.68rem – 0.75rem. All-caps for labels is encouraged only if tracking is increased by 5-10% to maintain readability.

---

## 4. Elevation & Depth
Depth in this system is organic, not artificial. We mimic natural lighting through tonal layering.

*   **The Layering Principle:** To create a card, do not draw a box with a shadow. Instead, place a `surface-container-lowest` (#ffffff) element onto a `surface` (#f9f9f8) background. The 0.5rem (ROUND_EIGHT) corner radius provides the "object" feel.
*   **Ambient Shadows:** If an element must float (e.g., a Floating Action Button), use a highly diffused shadow: `y: 8px, blur: 24px, color: rgba(0, 101, 142, 0.08)`. Notice the shadow is tinted with the Primary color—never use pure black for shadows.
*   **Glassmorphism:** For top navigation bars or persistent bottom sheets, use `surface` at 80% opacity with a `20px backdrop-blur`. This allows the content to "bleed" through, making the UI feel integrated and premium.
*   **The "Ghost Border" Fallback:** Only if accessibility requires it, use `outline-variant` (#bdc8d1) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** Gradient of `primary` to `primary-container`. `ROUND_EIGHT` (0.5rem) corners. White text.
*   **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
*   **Tertiary:** Ghost style. No background, `primary` color text, bold weight.

### Input Fields
*   **Style:** `surface-container-low` background with a bottom-only "active" stroke in `primary`.
*   **Interaction:** On focus, the label should shrink and shift to `primary` color, and the background should transition to `surface-container-lowest`.

### Cards & Lists
*   **Constraint:** Zero dividers. 
*   **Execution:** Use 24px of vertical padding to separate list items. For high-density data, use a subtle background toggle (zebra striping) using `surface` and `surface-container-low` rather than lines.

### Signature Component: The "Insight Float"
A custom card type for this system. A `surface-container-lowest` card that uses a `secondary-fixed` (#d4e3ff) accent bar (4px wide) on the left edge to denote "Suggested Actions" or "AI Insights."

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical spacing. A 24px left margin and a 16px right margin can make a dashboard feel more dynamic and less like a spreadsheet.
*   **Do** use `tertiary` (#885200) for "Warm Alerts" or "Pending" states to break the sea of blue and provide visual interest.
*   **Do** leverage `surface-bright` for active states in navigation.

### Don't
*   **Don't** use 100% black text. Always use `on-surface` (#1a1c1c).
*   **Don't** use a shadow on every card. If everything is elevated, nothing is. Reserve elevation for true "Floating" objects.
*   **Don't** use the `ROUND_EIGHT` radius on small components like checkboxes; scale down to `sm` (0.25rem) to maintain visual balance.