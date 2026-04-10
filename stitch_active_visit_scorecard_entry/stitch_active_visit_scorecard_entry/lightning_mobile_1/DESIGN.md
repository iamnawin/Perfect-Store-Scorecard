# Design System Document: The Enterprise Architect

## 1. Overview & Creative North Star
This design system evolves the traditional enterprise framework into a **"High-Trust Editorial"** experience. While it leverages the core DNA of the Salesforce Lightning Design System (SLDS), it moves beyond the "standard SaaS portal" look by embracing a philosophy of **Architectural Tonalism.**

The North Star for this system is **"The Digital Ledger."** We treat the mobile interface as a high-end, physical workspace—think premium stationery meets a precision-engineered instrument. We replace rigid lines and cramped data tables with breathing room, sophisticated layering, and a focus on high-contrast editorial typography that guides the user through complex CRM workflows with ease and authority.

---

## 2. Colors & Surface Philosophy
The palette is rooted in `primary` (#005DA9) and `primary_container` (#0176D3), but the secret to its premium feel lies in the orchestration of neutrals.

### The "No-Line" Rule
Traditional enterprise apps use borders to separate data. In this system, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined solely through:
- **Background Shifts:** Placing a `surface_container_lowest` (pure white) card onto a `surface_container_low` background.
- **Negative Space:** Using the spacing scale to create mental groupings without visual clutter.

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of fine paper. Depth is communicative, not decorative:
1.  **Base Layer:** `surface` (#f9f9f9) — The desk.
2.  **Section Layer:** `surface_container` (#eeeeee) — The folder.
3.  **Action Layer:** `surface_container_lowest` (#ffffff) — The active document.

### The "Glass & Gradient" Rule
To elevate the experience, use **Glassmorphism** for persistent elements like Navigation Bars or floating Action Buttons. Apply `surface_bright` at 80% opacity with a 12px backdrop blur. 
*Signature Polish:* Main CTAs should not be flat. Use a subtle linear gradient from `primary` to `primary_container` (top-to-bottom) to give buttons a "tactile" presence.

---

## 3. Typography: The Editorial Voice
We use **Inter** as our typographic engine. By utilizing a wide scale, we create an "Editorial" feel where information hierarchy is immediate.

*   **Display & Headline (The Statement):** Use `headline-lg` for dashboard summaries. This conveys the "Big Picture" of the enterprise data.
*   **Title (The Navigator):** `title-md` is the workhorse for card headers. It should feel authoritative but approachable.
*   **Body (The Content):** `body-md` (0.875rem) is optimized for high-density CRM data. It balances readability with the need to show multiple fields on a mobile screen.
*   **Label (The Metadata):** `label-sm` should always use `on_surface_variant` (#414752) to create a clear visual distinction between data labels and the data itself.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than heavy shadows.

*   **The Layering Principle:** Instead of a shadow, place a `surface_container_lowest` card on a `surface_container_low` background. The subtle shift in hex code creates a "soft lift" that feels more native to high-end mobile OSs.
*   **Ambient Shadows:** For floating modals or primary menus, use "Ambient Shadows." These must be extra-diffused. 
    *   *Spec:* `Y: 8px, Blur: 24px, Color: primary (opacity 6%)`. This mimics natural light reflecting the brand color.
*   **The "Ghost Border" Fallback:** If a container sits on a background of the same color, use a "Ghost Border": `outline_variant` at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** Gradient from `primary` to `primary_container`. `md` (0.375rem) corner radius. High contrast text (`on_primary`).
*   **Secondary:** `surface_container_low` fill with `primary` text. No border.
*   **Tertiary:** Ghost style. No fill, `primary` text.

### Cards & Lists
*   **Constraint:** Zero dividers. 
*   **Implementation:** Use a `surface_container_low` background for the list container, and `surface_container_lowest` for the individual list items. Separate items with a 2px margin to let the background "peek" through as a divider, or simply use 16px of vertical whitespace.

### Input Fields
*   **Visual State:** Soft-fill inputs using `surface_container_high`. 
*   **Focus State:** Transition the background to `surface_container_lowest` and apply a 2px `primary_container` "Ghost Border."
*   **Feedback:** Error states use `error` (#ba1a1a) for text and `error_container` as a 5% opacity background wash.

### Floating Action Button (FAB)
*   The "Power Action." Use `primary_container` with the `xl` (0.75rem) roundedness scale. This breaks the grid and draws the thumb naturally.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Align text to the left but allow imagery or status chips to float with generous right-side padding.
*   **Use Tonal Transitions:** Use `surface_dim` for "inactive" background states to create a sense of the UI receding.
*   **Prioritize Breathing Room:** When in doubt, add 4px of extra padding. Enterprise data is dense; the UI shouldn't be.

### Don’t:
*   **Don’t use #000000:** Always use `on_surface` (#1a1c1c) for text to maintain a premium, softer look.
*   **Don’t use 100% Opaque Dividers:** They break the "editorial" flow. Use whitespace or tonal shifts.
*   **Don’t use "Hard" Shadows:** Avoid any shadow with an opacity higher than 10%. It looks "cheap" and dated.
*   **Don’t over-round:** Stick to the `md` (0.375rem) or `lg` (0.5rem) scales for containers. Rounding everything into pills (full) devalues the enterprise-grade "seriousness" of the tool.

---

## Director's Final Note
This system is designed to make the user feel **in control.** By removing the visual noise of borders and harsh shadows, we allow the Salesforce Blue to act as a beacon for action, while the sophisticated typography and tonal layering provide the "high-trust" foundation required for enterprise-grade mobile work. Stay disciplined with the neutrals; the "quiet" parts of the UI are what make the "loud" parts work.