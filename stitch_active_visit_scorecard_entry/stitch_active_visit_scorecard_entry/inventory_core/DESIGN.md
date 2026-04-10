# Design System Strategy: The Precision Ledger

## 1. Overview & Creative North Star
This design system is built on the Creative North Star of **"Industrial Precision."** While retail audit tools are often relegated to basic utility, this system treats the auditor’s workflow as a high-stakes editorial task. We move away from the "cluttered app" aesthetic and toward a "Digital Ledger"—a sophisticated, high-contrast environment where information is architecturally structured.

The system breaks the "template" look by utilizing intentional asymmetry and **tonal layering** rather than rigid lines. By leveraging expansive typography scales and a sophisticated interplay of deep blues and industrial oranges, we create an interface that feels like a premium professional instrument—one that commands focus and reduces cognitive load in high-activity retail environments.

## 2. Colors: Tonal Architecture
The palette is rooted in high-contrast utility. We use deep blues for structural integrity and industrial oranges for kinetic actions.

*   **Primary (`#00327d`)**: Used for "Structural Actions"—navigation, final submissions, and core system states.
*   **Secondary (`#a04100`)**: The "Pulse." This industrial orange is reserved for high-priority field actions, such as flagging a violation or starting a new audit.
*   **Tertiary (`#00400c`)**: Used for "Safe States"—verification, completion, and positive status indicators.

### The "No-Line" Rule
To achieve a high-end feel, **1px solid borders are strictly prohibited** for sectioning content. Boundaries must be defined through:
1.  **Background Color Shifts**: Place a `surface_container_low` card atop a `surface` background.
2.  **Tonal Transitions**: Differentiate sections by moving from `surface_container_lowest` to `surface_container_high`.

### The Glass & Gradient Rule
To prevent a "flat" or "cheap" feel, use **Glassmorphism** for floating elements (like bottom navigation or sticky headers) using `surface` colors at 85% opacity with a 12px backdrop blur. For primary CTAs, apply a subtle linear gradient from `primary` to `primary_container` (top-to-bottom) to give the button a "machined" 3D soul.

## 3. Typography: The Editorial Scale
We use a dual-typeface system to balance authority with utility.

*   **Display & Headlines (Work Sans)**: Chosen for its geometric, industrial clarity. High-contrast sizing (e.g., `display-lg` at 3.5rem) should be used for summary data or "Big Numbers" on dashboard screens to provide an editorial punch.
*   **Body & Labels (Inter)**: The workhorse. Inter’s tall x-height ensures readability under harsh fluorescent retail lighting. 

**Hierarchy Strategy**: Use `headline-sm` (Work Sans) for section headers to create a sense of "The Ledger," while using `body-md` (Inter) for all data entry points to ensure maximum legibility.

## 4. Elevation & Depth: Tonal Layering
Traditional shadows and borders are replaced by the **Layering Principle**. 

*   **Stacking Tiers**: Create depth by nesting. An audit card (`surface_container_lowest`) should sit inside a section container (`surface_container_low`), which sits on the main background (`surface`). This creates a soft, natural lift.
*   **Ambient Shadows**: If a floating action button or "Critical Alert" requires a shadow, it must be extra-diffused (Blur: 24px) at 6% opacity, using a tint of `on_surface`. 
*   **The "Ghost Border" Fallback**: If structural separation is required for accessibility in low-light store corners, use a "Ghost Border": the `outline_variant` token at 15% opacity. Never use a 100% opaque border.

## 5. Components: The Audit Toolkit

### Buttons (The Kinetic Point)
*   **Primary**: Full-width, `primary` background, `on_primary` text. Use `lg` (0.5rem) roundedness. No border.
*   **Secondary (Action)**: Using `secondary_container` with `on_secondary_container` text. These are the "Workhorse" buttons for adding photos or notes.
*   **Stateful Transitions**: On press, shift from `primary` to `primary_fixed_dim` to provide tactile feedback.

### Audit Cards & Lists
*   **No Dividers**: Forbid the use of line dividers. Use `8px` of vertical white space or a shift from `surface_container_lowest` to `surface_container_low` to separate items.
*   **Status Badges**: Use high-contrast "Pills" with `full` roundedness. A "Passed" badge uses `tertiary_container` with `on_tertiary_container` text.

### Banners (The Command Center)
*   **Critical Banners**: Full-bleed `secondary` (Orange) with `on_secondary` text. Place these at the top of the viewport to indicate a "Failing Audit" or "Urgent Task."
*   **Glass Banners**: Use a semi-transparent `surface_tint` with backdrop-blur for non-critical system updates.

### Input Fields
*   **The "Field Focus"**: Inputs should not have a bottom line. Use a `surface_container_highest` background with `sm` roundedness. On focus, the `outline` token should be used at 40% opacity as a soft glow rather than a hard line.

## 6. Do’s and Don’ts

### Do:
*   **Do** use `display-lg` typography for key performance metrics (e.g., % of store compliance).
*   **Do** use `secondary` (Orange) sparingly—only for elements that require the auditor’s immediate physical attention.
*   **Do** utilize `surface_container_lowest` for cards to make them "pop" off the `surface` background.

### Don’t:
*   **Don’t** use 1px dividers between list items; the white space and subtle background shifts provide enough affordance.
*   **Don’t** use pure black for text; always use `on_surface` (`#1c1b1f`) to maintain a premium, ink-on-paper feel.
*   **Don’t** use "Default" roundedness for everything. Use `full` for status badges and `lg` for cards to create a varied, custom visual rhythm.