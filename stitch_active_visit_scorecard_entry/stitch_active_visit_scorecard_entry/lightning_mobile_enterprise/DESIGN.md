# Design System Document: The Enterprise Kinetic

## 1. Overview & Creative North Star

**Creative North Star: The Utility Architect**
While most enterprise tools feel like rigid spreadsheets, this design system treats data as a high-end physical object. We are moving away from the "flat web" into a world of **Kinetic Utility**. Our goal is to provide store associates and field agents with a tool that feels authoritative yet effortless. 

By leveraging intentional asymmetry and a "physics-based" depth model, we break the traditional grid. We don't just "show" data; we curate it. The experience is defined by high-contrast legibility for high-glare environments (like retail floors) and a sophisticated layering system that eliminates the need for cluttered lines.

---

## 2. Colors: Tonal Architecture

Color in this system is not decorative; it is structural. We use the signature Salesforce Blue as an anchor of trust, surrounded by a sophisticated palette of greys and off-whites that define the field of play.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts or tonal transitions.
*   *Bad:* A white card with a grey border on a white background.
*   *Good:* A `surface_container_lowest` card sitting on a `surface_container_low` section.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, physical sheets. Depth is achieved through the `surface_container` tiers:
*   **Background (`#fbf9f9`):** The base canvas.
*   **Surface Container Low (`#f5f3f3`):** Large structural sections or groupings.
*   **Surface Container Lowest (`#ffffff`):** The "Hero" cards or primary interactive elements. This creates a soft, natural lift.

### The "Glass & Gradient" Rule
To elevate the experience from "utility" to "premium," floating elements (like Bottom Sheets or Navigation Bars) should utilize semi-transparent `surface` colors with a **16px Backdrop Blur**. 

**Signature Texture:** Main CTAs should not be flat. Apply a subtle linear gradient from `primary` (`#005da9`) to `primary_container` (`#0176d3`) at a 135-degree angle to provide a "jewel" effect that draws the eye instantly.

---

## 3. Typography: The Editorial Edge

We use **Inter** not just for its legibility, but for its geometric authority. In a mobile enterprise context, typography is the interface.

*   **Display (sm/md/lg):** Reserved for high-impact data points (e.g., Daily Sales Total). Use tight letter-spacing (-0.02em) to create a "Brutalist" editorial feel.
*   **Headline (sm/md/lg):** Used for view titles. These should be anchored to the left to create a strong vertical axis for the eye to follow.
*   **Title & Body:** `title-md` is your workhorse for card headers. `body-md` handles all standard data entry.
*   **Labels:** In this system, labels use `on_surface_variant` (`#414752`) to ensure they are distinct from the primary data, which must always be `on_surface` (`#1b1c1c`) for maximum contrast in high-light environments.

---

## 4. Elevation & Depth: Tonal Layering

We reject the "drop shadow" of 2014. Elevation is now an atmospheric effect.

*   **The Layering Principle:** Stack `surface_container` tiers. If an element needs to feel "closer" to the user, move it one tier toward `surface_container_lowest`.
*   **Ambient Shadows:** For floating action buttons or modal cards, use a shadow with a **24px blur**, **0px offset**, and **6% opacity** using a tinted version of `on_surface`. It should feel like a soft glow, not a dark stain.
*   **The "Ghost Border" Fallback:** If accessibility requirements demand a border, use the `outline_variant` (`#c0c7d4`) at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism:** Use `surface_bright` at 80% opacity with `backdrop-filter: blur(20px)` for persistent navigation elements to allow the content to breathe underneath.

---

## 5. Components

### Buttons
*   **Primary:** Gradient (`primary` to `primary_container`), `xl` (0.75rem) roundedness. Label is `on_primary`. 
*   **Secondary:** `surface_container_high` background with `on_primary_fixed_variant` text. No border.
*   **Tertiary:** Transparent background, `primary` text. Use only for low-emphasis actions like "Cancel."

### Cards & Lists
*   **Rule:** Forbid divider lines. 
*   **Execution:** Separate list items using 8px of vertical whitespace (`surface_container_low`) or by alternating subtly between `surface_container_lowest` and `surface_container_low`.
*   **Roundedness:** Use the `xl` (0.75rem) token for all primary data cards to soften the enterprise "edge."

### Input Fields
*   **Structure:** High-contrast `on_surface` text on a `surface_container_highest` background. 
*   **Focus State:** A 2px `primary_container` "glow" (ambient shadow) rather than a harsh stroke.

### The "Action Bar" (Custom Component)
A floating container at the bottom of the screen using the **Glassmorphism** rule. It houses primary page actions, keeping the thumb zone clear and the UI feeling modern.

---

## 6. Do's and Don'ts

### Do
*   **Do** use `primary_fixed_dim` for subtle accent backgrounds in dark-mode-like "Night Shifts."
*   **Do** lean into `display-lg` for single, "North Star" metrics. Make the data the hero.
*   **Do** use asymmetrical padding (e.g., more padding at the bottom of a card than the top) to create a sense of grounded weight.

### Don't
*   **Don't** use 100% black. Use `on_surface` (`#1b1c1c`) for all "black" text to maintain a premium, ink-like feel.
*   **Don't** use the `DEFAULT` (0.25rem) roundedness for large containers; it feels "cheap" and dated. Stick to `xl` for containers and `full` for chips.
*   **Don't** use standard "Success Green" for everything. Use the `tertiary` (Burnt Orange/Ochre) scale for high-end notifications that require attention without the "stoplight" cliché.

---