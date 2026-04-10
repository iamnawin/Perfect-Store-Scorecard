# Design System Strategy: The Enterprise Architect

## 1. Overview & Creative North Star
The objective of this design system is to evolve the foundational authority of enterprise software into a bespoke, editorial-grade mobile experience. We are moving away from the "data-entry form" aesthetic and toward **"The Enterprise Architect."** 

This Creative North Star views data not as a list to be managed, but as a structure to be inhabited. We achieve this through a signature visual identity that prioritizes **Tonal Layering** over structural lines. By utilizing intentional asymmetry in header placements and overlapping card elements, we break the rigid "box-on-box" grid. The result is a UI that feels high-end, intentional, and authoritative—functional enough for the C-suite, yet fluid enough for the modern power user.

---

## 2. Colors: Tonal Precision
Our palette is rooted in the signature Salesforce blue but expanded into a sophisticated range of functional tones. 

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to section off content. In this system, boundaries are defined strictly through background color shifts. To separate a section, transition from `surface` (#faf9f9) to `surface_container_low` (#f4f3f3). This creates a "soft edge" that feels premium and integrated rather than boxed-in.

### Color Tokens
- **Primary Brand:** `primary` (#0058a7) for high-level actions; `primary_container` (#0070d2) for hero brand moments.
- **Surface Hierarchy:** 
    - `surface_container_lowest` (#ffffff): Use for high-contrast interactive cards.
    - `surface` (#faf9f9): The standard canvas.
    - `surface_container` (#eeeeee): Use for nested layout blocks.
- **Signature Textures:** For primary CTAs and high-impact headers, do not use flat hex fills. Apply a subtle linear gradient from `primary` (#0058a7) to `primary_container` (#0070d2) at a 135-degree angle. This adds "soul" and depth to the brand's signature blue.

---

## 3. Typography: Editorial Authority
We utilize **Inter** across the board to maintain a professional, clean, and highly legible interface. The hierarchy is designed to mimic a high-end business journal.

- **Display & Headlines:** Use `headline-lg` (2rem) and `headline-md` (1.75rem) for dashboard totals and section starts. These should have generous leading to feel "airy."
- **Titles:** `title-lg` (1.375rem) should be used for card headers to establish immediate hierarchy.
- **The Functional Layer:** `label-md` (0.75rem) and `label-sm` (0.6875rem) are your most important tools for enterprise density. Use them for metadata and secondary descriptions, ensuring they are always in `on_surface_variant` (#414753) for proper contrast.

**Editorial Tip:** Use "intentional asymmetry" by pairing a `headline-sm` title aligned left with a `label-sm` timestamp or status tucked into the top-right of a container.

---

## 4. Elevation & Depth: The Layering Principle
We convey importance through **Tonal Layering** rather than traditional drop shadows.

- **Stacking Surfaces:** Instead of a shadow, place a `surface_container_lowest` card on top of a `surface_container_low` background. The subtle 2-bit shift in gray provides enough visual separation to denote "lift."
- **Ambient Shadows:** Shadows are reserved only for floating elements (like Bottom Sheets or FABs). Use a 16px to 24px blur with 6% opacity, using the `on_surface` (#1a1c1c) color as the shadow base. This mimics natural light rather than a digital "glow."
- **Glassmorphism:** For top navigation bars or floating action containers, use `surface_container_lowest` at 85% opacity with a 20px backdrop blur. This allows the high-contrast white cards to slide beneath the header, creating a sense of physical space.
- **The Ghost Border:** If a form field or UI element requires a boundary for accessibility, use a "Ghost Border": `outline_variant` (#c1c6d5) at 20% opacity.

---

## 5. Components

### Cards & Lists
- **Rule:** Forbid the use of divider lines. 
- **Implementation:** Separate list items by alternating between `surface` and `surface_container_low`, or simply use vertical white space (1.5rem) to let the content breathe.
- **Shape:** Apply `lg` (0.5rem) rounding to all cards to maintain the modern Salesforce aesthetic.

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), white text, `full` rounding (9999px) for a "pill" shape that feels approachable.
- **Secondary:** No fill. Use a Ghost Border (`outline_variant` at 40%) with `on_primary_fixed_variant` (#004788) text.
- **Tertiary:** Text-only, using `title-sm` (1rem) weight for clear tap targets.

### Input Fields
- **Container:** `surface_container_low` fill with a bottom-only "Ghost Border" (2px). 
- **States:** On focus, the bottom border transitions to `primary` (#0058a7).
- **Labels:** Always use `label-md` floating above the input to ensure the enterprise user never loses context.

### Chips & Badges
- **Selection Chips:** Use `secondary_container` (#bad3ff) with `on_secondary_container` (#425a81) text.
- **Rounding:** Always use `full` (9999px) for chips to contrast against the `lg` rounding of cards.

---

## 6. Do’s and Don’ts

### Do:
- **Do** use `surface_container_highest` for "pressed" states to create a feeling of physical depression into the screen.
- **Do** lean into the "Display" typography scale for empty states—make them look like editorial posters rather than errors.
- **Do** ensure 16pt or 24pt internal padding on all white cards to maintain a premium feel.

### Don’t:
- **Don’t** use pure black (#000000) for text. Use `on_surface` (#1a1c1c) to keep the look sophisticated and soft.
- **Don’t** use standard 1px gray dividers between list items. Use tonal shifts or white space.
- **Don’t** crowd the interface. If a screen feels busy, increase the vertical spacing using the `1.5rem` scale and move secondary data into a `surface_container` nested tier.

---

## 7. Director's Final Note
Junior designers often fear "empty" space. In this system, space is your most powerful asset. By removing borders and dividers, we are forcing the user's eye to follow the typography and the tonal depth. This is how we transform a standard enterprise tool into a signature, high-end digital experience. Focus on the layers. Focus on the type. Let the blue lead the way.