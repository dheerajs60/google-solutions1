# Design System Document: Precision Audit & Tonal Depth

## 1. Overview & Creative North Star: "The Clinical Architect"
To move beyond a generic dashboard, this design system adopts the Creative North Star of **"The Clinical Architect."** In the world of AI fairness auditing, trust is not built with flashy decorations, but through extreme precision, intentional whitespace, and a sophisticated "Editorial Fintech" aesthetic. 

We are moving away from the "boxed-in" look of standard SaaS. Instead of rigid grids separated by heavy lines, we use **Tonal Layering** and **Asymmetric Balance**. The interface should feel like a high-end physical document—crisp, authoritative, and meticulously organized. We prioritize data density without clutter by using "breathing room" as a functional separator.

## 2. Colors & Surface Philosophy
The palette is rooted in a deep indigo core, supported by a sophisticated range of functional tones.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or layout containment. Structural boundaries must be defined solely through background color shifts (e.g., a `surface-container-low` section sitting on a `surface` background). This creates a "seamless" high-end feel where the architecture is felt rather than seen.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the following tiers to define importance and "lift":
- **Base Layer:** `surface` (#f8f9fa) for the overall application backdrop.
- **Sectional Layer:** `surface-container-low` (#f3f4f5) for large sidebar or navigation areas.
- **Content Layer:** `surface-container-lowest` (#ffffff) for primary data cards and audit reports.
- **Active/Hover Layer:** `surface-container-high` (#e7e8e9) for subtle interaction feedback.

### Signature Textures & Glassmorphism
To add "soul" to the data:
- **Hero CTAs:** Use a subtle gradient transition from `primary` (#3525cd) to `primary-container` (#4f46e5) at a 135-degree angle.
- **Floating Overlays:** Use `surface-container-lowest` with an 80% opacity and a `24px` backdrop-blur to create a "frosted glass" effect for modals and tooltips.

## 3. Typography: Editorial Authority
We use **Inter** exclusively, but we treat it with editorial intent. The contrast between large `display` type and tight `label` type creates the "Fintech" hierarchy.

- **Display (Lg/Md/Sm):** Used for high-level audit scores. Letter spacing should be set to `-0.02em` to feel tighter and more premium.
- **Headlines & Titles:** Use `headline-sm` for card titles. These are the anchors of your layout.
- **Body (Lg/Md/Sm):** Use `body-md` (#464555) for general descriptions. Ensure line height is at least 1.5x for readability.
- **Labels:** `label-md` and `label-sm` are vital for data-dense tables. Use `on-surface-variant` to keep them secondary but legible.

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are largely banished in favor of **Tonal Layering**.

- **The Layering Principle:** Depth is achieved by "stacking." Place a white card (`surface-container-lowest`) on a light gray background (`surface-container-low`). This creates a soft, natural edge.
- **Ambient Shadows:** For high-level floating elements (like a "Run Audit" FAB), use an extra-diffused shadow: `box-shadow: 0 12px 32px rgba(53, 37, 205, 0.06)`. Note the tint—the shadow uses a hint of the `primary` color, not pure black.
- **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in a high-contrast mode), use `outline-variant` (#c7c4d8) at **20% opacity**. Never use a 100% opaque border.

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary-container`), white text, 8px radius.
- **Secondary:** `primary-fixed` background with `on-primary-fixed` text. No border.
- **Tertiary:** Transparent background, `primary` text. Use for low-emphasis actions.

### Cards & Audit Modules
**Instruction:** Forbid the use of divider lines.
- Separate content using the **Spacing Scale** (e.g., 24px vertical gaps).
- Use `surface-container-lowest` for the card body. 
- Use a `surface-container-high` header bar only if the data density is extremely high.

### Inputs & Fields
- **Default State:** `surface-container-highest` background, no border, 8px radius.
- **Focus State:** `outline` (#777587) ghost border (2px) and a subtle `surface-tint` glow.
- **Error State:** `error` text and a background shift to `error-container`.

### Data Visualization (Audit Specific)
- **Status Chips:** Use `secondary-container` for "Pass," `tertiary-container` for "Critical Bias," and a custom Amber for "Warning." Chips should be pill-shaped (`rounded-full`).
- **Bias Indicators:** Use thin, horizontal "bar gauges" rather than circles to maintain the clinical, data-dense aesthetic.

## 6. Do's and Don'ts

### Do:
- **Do** use asymmetric layouts. If a table is wide, let the summary card on the right be narrow and tall.
- **Do** prioritize typography scale over color for hierarchy. A larger font size is more "Premium" than a brighter color.
- **Do** ensure all interactive elements have a minimum 44px hit target, even if the visual element is smaller.

### Don't:
- **Don't** use 1px solid borders to separate your sidebar from your main content. Use a background color shift.
- **Don't** use pure black (#000000) for text. Use `on-surface` (#191c1d) to maintain a sophisticated tonal range.
- **Don't** use standard "drop shadows" with high opacity. If it looks like a shadow from 2015, it's too dark.