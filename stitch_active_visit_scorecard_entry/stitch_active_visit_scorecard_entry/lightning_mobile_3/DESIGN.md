# Design System Strategy: The Enterprise Architect

## 1. Overview & Creative North Star
The design system transitions enterprise utility into an editorial, high-touch experience. Our Creative North Star is **"The Digital Architect."** We are moving away from the "standard dashboard" look by treating the mobile viewport not as a flat container, but as a structured, multi-dimensional environment. 

While the system is rooted in the reliability of Salesforce Blue, we avoid "template-fatigue" through intentional asymmetry, varying tonal densities, and an emphasis on tactile layering. This isn't just a tool; it's a premium workspace that balances the authority of a global CRM with the fluid elegance of a modern lifestyle app.

## 2. Colors & Surface Philosophy
The palette is anchored in the professional trust of Salesforce Blue but elevated through a sophisticated range of surface tiers.

### The "No-Line" Rule
To achieve a high-end feel, **1px solid borders for sectioning are strictly prohibited.** We define spatial boundaries through background color shifts rather than structural lines. Use `surface-container-low` for secondary sections and `surface-container-lowest` (#ffffff) for high-focus content areas.

### Surface Hierarchy & Nesting
Depth is achieved through "Tonal Stacking." Instead of a flat grid, treat the UI as a series of nested layers:
- **Base Level:** `surface` (#f9f9f8).
- **Secondary Content Sections:** `surface-container-low` (#f4f4f3).
- **Primary Interactive Cards:** `surface-container-lowest` (#ffffff).
- **Floating Global Actions:** Use `surface-bright` with a 20px backdrop blur (Glassmorphism).

### The "Glass & Gradient" Rule
To inject visual "soul," avoid flat blue blocks for hero elements. Use a subtle linear gradient (Top-Left to Bottom-Right) transitioning from `primary` (#005da9) to `primary_container` (#0176d3). For floating navigation bars, use `surface_container_low` at 80% opacity with a `backdrop-filter: blur(12px)` to create a frosted-glass effect that integrates the content beneath.

## 3. Typography: The Editorial Authority
We utilize **Inter** to bridge the gap between technical precision and human-centric design.

- **Display & Headlines:** Use `display-md` and `headline-lg` to create clear entry points. We use a "tight-tracked" approach (letter-spacing: -0.02em) for headlines to give them a modern, assertive feel.
- **The Power of Asymmetry:** Use `headline-sm` aligned to a 24px left margin while body copy remains on a 32px margin. This creates a vertical "axis" that guides the eye and breaks the monotony of standard mobile grids.
- **Hierarchy through Weight:** Use `label-md` in `primary` (#005da9) for category tags above headlines to provide a sophisticated breadcrumb trail.

## 4. Elevation & Depth
In this system, depth is felt, not seen. We abandon traditional "drop shadows" for organic tonal layering.

### The Layering Principle
Hierarchy is achieved by stacking. A `surface-container-lowest` card placed on a `surface-container-low` background provides sufficient contrast for the eye without requiring a heavy shadow.

### Ambient Shadows
Where floating elements are necessary (e.g., Modals or Floating Action Buttons), use an **Ambient Shadow**:
- **Color:** `on-surface` (#1a1c1c) at 6% opacity.
- **Blur:** 24px to 40px for a soft, diffused lift.
- **Y-Offset:** 8px.

### The "Ghost Border" Fallback
If a visual separator is required for accessibility, use a **Ghost Border**. Apply `outline_variant` (#c0c7d4) at **15% opacity**. The goal is a border that is "discovered" rather than "seen."

## 5. Components

### Tactile Cards
Cards are the heart of this system. Forbid the use of divider lines within cards.
- **Styling:** Use `surface-container-lowest` with a `lg` (0.5rem) corner radius.
- **Separation:** Use 16px of vertical white space (Spacing Scale) to distinguish data groups.
- **Interaction:** On press, transition the background to `surface-container-high` (#e8e8e7).

### Signature Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `md` (0.375rem) radius, white text.
- **Secondary:** Transparent background with a `primary` Ghost Border (20% opacity).
- **Tertiary:** Pure text in `primary` with `label-md` styling, reserved for low-priority actions.

### Input Fields
- **Container:** `surface-container-highest` (#e2e2e1) with a bottom-only Ghost Border. 
- **States:** On focus, the bottom border animates to 2px width using `primary` (#005da9). Labels use `body-sm` and float above the field to maintain context.

### Sophisticated Chips
- **Selection Chips:** Use `secondary_fixed` (#c7e7ff) with `on_secondary_fixed` text for a soft, professional look. Avoid high-contrast fills for chips to keep the focus on the primary action.

## 6. Do’s and Don’ts

### Do:
- **Do** use whitespace as a functional tool. If a screen feels cluttered, increase the padding between sections to 32px rather than adding a divider.
- **Do** use `primary` (#005da9) sparingly. It should be the "North Star" that guides the user’s thumb, not a paint bucket splashed across the screen.
- **Do** align icons to a strict 24x24px optical grid to maintain the "Architect" precision.

### Don't:
- **Don't** use 100% black text. Use `on_surface` (#1a1c1c) to maintain a soft, premium enterprise feel.
- **Don't** use "Standard" 1px gray borders (#D8DDE6). They look dated and "out-of-the-box."
- **Don't** use sharp corners. Use the `md` and `lg` roundedness scale to ensure the "Tactile" feel of the system.