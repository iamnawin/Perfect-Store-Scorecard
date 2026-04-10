```markdown
# Design System Document: Tactical Precision

## 1. Overview & Creative North Star: "The Kinetic Industrialist"
This design system is built for the high-stakes, fast-moving environment of retail auditing. We are moving away from "generic enterprise software" toward **The Kinetic Industrialist**—a visual language that feels as sturdy and reliable as a handheld industrial scanner, but as fluid and premium as a high-end editorial magazine.

The Creative North Star focuses on **intentional density**. In a store environment, efficiency is king. We break the traditional "template" look by using a heavy-weight typography scale contrasted against "airy" tonal depth. By utilizing asymmetric layouts and overlapping surface containers, we guide the auditor’s eye toward the next action without the clutter of traditional UI borders.

---

## 2. Colors & Tonal Depth
Our palette is rooted in a deep, authoritative `primary` (#00478D) and a sophisticated range of `surface` tones. We do not use color for decoration; we use it for orientation.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined through background color shifts.
*   **Implementation:** A `surface-container-low` section should sit directly on a `surface` background. The shift in tone is the boundary.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
*   **The Base Layer:** `surface` (#fbf9f9).
*   **The Content Block:** Use `surface-container` (#efeded) for primary interaction zones.
*   **The "Active" Focus:** Use `surface-container-lowest` (#ffffff) for the active card or input field currently being touched, creating a "pop-out" effect against the dimmer background.

### Signature Textures & Glass
*   **The Glassmorphism Rule:** For floating action elements (like a persistent bottom bar), use `surface` with a 70% opacity and a `20px` backdrop-blur. This keeps the auditor aware of the content scrolling beneath while maintaining focus on the primary task.
*   **Tonal Gradients:** Apply a subtle linear gradient from `primary` (#00478D) to `primary-container` (#005eb8) on high-level progress indicators to give them a "machined" metallic finish.

---

### 3. Typography: Authoritative Clarity
We utilize **Inter** for its neutral, high-legibility "ink traps" and industrial feel. The hierarchy is designed for glancing, not reading.

*   **Display (lg/md/sm):** Reserved for high-level audit percentages (e.g., "88% Complete"). Use `on_surface` with tight letter spacing (-0.02em).
*   **Headline (sm):** Used for Category headers (e.g., "Dairy & Refrigeration"). Bold and immediate.
*   **Title (md):** The primary label for audit tasks. 
*   **Body (md):** Used for descriptions of non-compliance.
*   **Label (md):** All-caps, tracked out (+0.05em) for secondary metadata like "SKU: 44920."

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "soft" for an industrial tool. We use **Tonal Layering** to create hierarchy.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft lift. This mimics natural light hitting a raised physical surface.
*   **Ambient Shadows:** If a floating state is required (e.g., a dragged item), use a shadow color tinted with `primary` at 6% opacity: `box-shadow: 0 12px 32px rgba(0, 71, 141, 0.06);`.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility in high-glare environments, use `outline-variant` (#c2c6d4) at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components: Optimized for the Floor

### Large Tappable Cards (Tiles)
*   **Structure:** No dividers. Use `xl` (0.75rem) roundedness.
*   **Default State:** `surface-container-low`.
*   **Active/Pressed State:** Transition to `primary_container` with a `primary` thick left-accent bar (4px).
*   **Spacing:** Use `1.5rem` (24px) vertical padding to ensure "fat-finger" errors are minimized during fast one-handed use.

### Persistent Bottom Bar
*   **Style:** Semi-transparent `surface` with a backdrop blur. 
*   **Layout:** Asymmetric. Place the "Complete Audit" CTA on the right with a `primary` background; secondary navigation remains on the left in `secondary_container`.

### Progress Indicators
*   **The "Industrial Bar":** A full-width bar using `primary_fixed` as the track and a `primary` to `primary_container` gradient as the fill. No rounded end-caps; keep them square/blunt for a more technical, "metered" look.

### Input Fields
*   **Style:** Filled inputs using `surface-container-highest`. 
*   **Focus State:** Do not use a border glow. Instead, shift the background to `surface-container-lowest` and change the label color to `primary`.

---

## 6. Do's and Don'ts

### Do
*   **Do** use `surface_container_high` for "Done" states to visually recede the information.
*   **Do** use `headline-sm` for numbers; they are the most important data point in an audit.
*   **Do** prioritize the bottom 40% of the screen for all primary interactive elements to allow for one-handed thumb use.

### Don't
*   **Don't** use lines to separate list items. Use a `12px` vertical gap.
*   **Don't** use pure black for text. Always use `on_surface` (#1b1c1c) to maintain a premium tonal balance.
*   **Don't** use standard Material shadows. If it doesn't feel like it's "built" into the interface, the shadow is too heavy.
*   **Don't** use icons without labels. In high-utility environments, ambiguity is the enemy of speed.```