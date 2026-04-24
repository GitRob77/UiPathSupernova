---
name: image-to-code
description: >
  Convert a screenshot or image into faithful code reproduction. Use when the user provides
  an image/screenshot and asks to "convert to code", "implement this design", "reproduce
  this UI", or wants pixel-accurate code from a visual reference.
---

# Image-to-Code Faithful Reproduction Skill

## Skill Name

**image-faithful-reproduction**

---

## Description

Faithfully reproduce UI designs from screenshots or mockup images into working code — pixel-perfect, no creative liberties. Use this skill whenever the user provides an image (screenshot, mockup, Figma export, design comp, wireframe, or photo of a UI) and asks to "build this", "code this", "recreate this", "turn this into code", "make this work", "implement this design", or any variation of converting a visual design into a functional frontend. Also trigger when the user says things like "match this exactly", "replicate this UI", "clone this page", or uploads an image alongside a request to create a component, page, or app. This skill is specifically about REPRODUCING an existing design — not inventing a new one. If the user provides an image and wants code, use this skill. Even if they don't explicitly say "match it exactly", the default behavior is faithful reproduction unless they say otherwise.

---

## Instructions

### Core Philosophy

You are a **design translator**, not a designer. Your job is to convert what you SEE into working code. You do not improve, modernize, reinterpret, or "clean up" the design. The image IS the spec. Every pixel-level decision has already been made by a human designer — your job is to honor those decisions.

### Step 1: Analyze the Image Thoroughly Before Writing Any Code

Before writing a single line of code, study the image and document what you observe. Go through this checklist mentally:

**Layout & Structure**
- What is the overall layout? (sidebar + content, single column, grid, split-screen, etc.)
- What are the major sections/regions?
- How are elements aligned? (left, center, right, justified, asymmetric)
- What is the spacing pattern? (tight, generous, mixed)
- What are the approximate proportions between sections?

**Typography**
- How many distinct font sizes do you see?
- What are the font weights? (thin, regular, medium, semibold, bold)
- What is the text color for each level of hierarchy? (headings, body, muted/secondary, links)
- Is text uppercase, lowercase, or sentence case?
- What is the approximate line-height and letter-spacing?

**Colors**
- What is the background color? (pure white, off-white, gray, dark, colored)
- What is the primary accent color?
- What are the secondary colors?
- Are there gradients? If so, describe direction and color stops.
- What are the border colors?

**Components**
- List every UI component visible: buttons, inputs, cards, dropdowns, tabs, modals, toggles, avatars, badges, tables, nav bars, etc.
- What is the exact style of each? (rounded vs square corners, filled vs outlined buttons, shadow depth on cards, border vs borderless inputs)

**Iconography & Assets**
- What icons are used? **Always use Lucide icons** (`lucide-react` for React, or Lucide SVGs for HTML). Do not use Heroicons, Font Awesome, Material Icons, or any other icon library.
- Are there images, avatars, logos, or illustrations?

**Visual Details**
- Shadows: none, subtle, medium, dramatic?
- Border radius: none, slight (4px), medium (8px), large (12-16px), full/pill?
- Borders: which elements have them? What color and thickness?
- Opacity or transparency effects?
- Hover states visible? Active states?

### Step 2: Preserve Design Direction — Never Invent

Follow these strict rules:

1. **If the design uses square corners, use square corners.** Do not add border-radius because "it looks better."
2. **If the design uses a specific shade of blue (#2563eb), use that shade.** Do not substitute your preferred blue.
3. **If the spacing is tight, keep it tight.** Do not add "breathing room" because you think it improves readability.
4. **If the design has no shadows, add no shadows.** Do not add box-shadow for "depth."
5. **If the font appears to be a serif, use a serif.** Do not default to sans-serif because it's "more modern."
6. **If a section looks visually heavy or dense, replicate that density.** Do not "lighten" the layout.
7. **If the design has a specific alignment (left-aligned labels, right-aligned numbers), match it exactly.**
8. **If the color scheme is muted/pastel, do not make it vibrant. If it's bold, do not tone it down.**

**When in doubt, match what you see. Never assume the designer "forgot" something or "would have wanted" something different.**

### Step 3: Make Interactive Components Functional

This is where you ADD value — not by changing the design, but by making it WORK. For every interactive component visible in the image, implement its full behavior:

**Dropdowns / Select Menus**
- Build the closed state exactly as shown in the image
- Create the open/expanded state with a dropdown panel styled consistently with the design's visual language (same border-radius, shadow depth, colors, fonts)
- Populate with realistic dummy data that fits the context (if it's a "Country" dropdown, use real country names; if it's a "Status" filter, use relevant statuses like "Active", "Pending", "Completed")
- Include hover states on options, matching the design's accent color
- Add smooth open/close transitions

**Buttons**
- Implement hover state (slightly darker/lighter shade of the button color)
- Implement active/pressed state (subtle scale or color shift)
- If there are multiple button styles (primary, secondary, ghost), differentiate their interactions accordingly

**Input Fields**
- Add focus state with a border color that matches the design's accent color
- Include placeholder text that fits the context
- If it's a search input, make it functional (filter visible content if applicable)

**Tabs / Navigation**
- Make tabs clickable and switch content
- Match the active tab indicator style exactly (underline, background fill, color change — whatever the image shows)
- Populate each tab with realistic placeholder content

**Tables**
- Add row hover highlighting (subtle, using colors from the design palette)
- If sortable columns are implied, add sort functionality
- Populate with 5-10 rows of realistic dummy data fitting the context

**Cards / List Items**
- Add hover elevation or highlight if the design suggests interactivity
- Make clickable elements look and feel clickable (cursor: pointer, hover feedback)

**Modals / Dialogs**
- If a modal trigger is visible (e.g., a "New Item" button), wire it up to open a modal
- Style the modal consistent with the design language
- Include backdrop overlay

**Toggles / Checkboxes / Radio Buttons**
- Make them functional with state changes
- Match the exact visual style (custom styled, not browser defaults, unless the image shows browser defaults)

**Sidebar / Navigation**
- Make nav items clickable with active state highlighting
- If collapsible, implement collapse behavior

### Step 4: Dummy Data Guidelines

When the image does not show enough content to fill the interface, generate dummy data that:

1. **Fits the domain context** — If it's a dashboard for an e-commerce platform, use product names, order IDs, customer names. If it's a project management tool, use task names, sprint labels, team member names.
2. **Looks realistic** — Use "Sarah Chen" not "User 1". Use "$1,249.99" not "$100". Use "Quarterly Revenue Report — Q3 2025" not "Document Title".
3. **Varies naturally** — Mix statuses (some complete, some pending, some failed). Vary string lengths. Include both recent and older dates.
4. **Matches the volume shown** — If the image shows 5 table rows, create ~8-10 (enough to show the pattern, including a few below the fold). Don't create 50 rows when the design shows 5.

### Step 5: Determine Output Location and Check Existing Components

Before writing code, decide where the output belongs:
- **Prototype page**: If reproducing a full page or screen, place it under `app/prototypes/<name>/home/page.tsx` or a new route within the prototype, wrapped in a layout from `components/layouts/`.
- **Prototype component**: If reproducing a component specific to one prototype, place it under `app/prototypes/<name>/components/`.
- **Shared component**: If reproducing a reusable component, place it under `components/custom/` and update the component table in CLAUDE.md.

**Check `components/custom/` first** — review the component table in CLAUDE.md to see if an existing custom component already covers what you're about to build. Extend or compose existing components rather than duplicating functionality.

### Step 6: Technology & Implementation

**Default stack (unless the user specifies otherwise):**
- React (JSX) for complex interactive UIs
- HTML + CSS + vanilla JS for simpler pages
- Tailwind CSS utility classes for styling when it speeds up matching the design; otherwise raw CSS is fine
- **Lucide icons only** — use `lucide-react` for React projects, or Lucide SVGs for plain HTML. Do not use Heroicons, Font Awesome, Material Icons, or any other icon library.

**Code quality requirements:**
- Fully self-contained in a single file (all styles inline or in a `<style>` block / Tailwind classes)
- All interactive states implemented and working
- Responsive only if the image implies responsiveness; otherwise match the exact fixed layout shown
- Use CSS custom properties for the design's color palette so the user can easily tweak later
- Clean, readable code with component breakdown that mirrors the visual hierarchy

### Step 7: Self-Review Checklist

Before delivering, mentally compare your output to the image:

- [ ] Does the overall layout match? (proportions, alignment, spacing)
- [ ] Do the colors match? (background, text, accent, borders)
- [ ] Does the typography match? (sizes, weights, casing, spacing)
- [ ] Do component shapes match? (border-radius, shadows, borders)
- [ ] Are interactive components functional with appropriate states?
- [ ] Does the dummy data feel realistic and contextually appropriate?
- [ ] Did I add anything that ISN'T in the image? (If yes, remove it — unless it's an interaction state for an existing component)
- [ ] Did I skip anything that IS in the image? (If yes, add it)

### Apollo Foundation Design System Reference

When the design being reproduced uses the **Apollo Design System** (Xplor Technologies), follow these additional guidelines. Apollo Foundation is a design token system available as an NPM package (`@xplortech/apollo-foundation`) and documented in Figma.

**Figma Reference Pages (Apollo Foundation file `7hdk2gGDA4by0Lponqvts2`):**
- **Typeface & Typography Scale** (node `1181:12419`): https://www.figma.com/design/7hdk2gGDA4by0Lponqvts2/Apollo--Foundation-?node-id=1181-12419
- **Spacing** (node `7401:12`): https://www.figma.com/design/7hdk2gGDA4by0Lponqvts2/Apollo--Foundation-?node-id=7401-12
- **Radius** (node `7396:5`): https://www.figma.com/design/7hdk2gGDA4by0Lponqvts2/Apollo--Foundation-?node-id=7396-5
- **Breakpoints** (node `4646:1414`): https://www.figma.com/design/7hdk2gGDA4by0Lponqvts2/Apollo--Foundation-?node-id=4646-1414

**Figma Reference Pages (Apollo Foundation file `7hdk2gGDA4by0Lponqvts2`):**
- **Colors — Light Theme** (node `1153:15546`): https://www.figma.com/design/7hdk2gGDA4by0Lponqvts2/Apollo--Foundation-?node-id=1153-15546
- **Colors — Dark Theme** (node `1305:13082`): https://www.figma.com/design/7hdk2gGDA4by0Lponqvts2/Apollo--Foundation-?node-id=1305-13082
- **Typeface & Typography Scale** (node `1181:12419`): https://www.figma.com/design/7hdk2gGDA4by0Lponqvts2/Apollo--Foundation-?node-id=1181-12419
- **Spacing** (node `7401:12`): https://www.figma.com/design/7hdk2gGDA4by0Lponqvts2/Apollo--Foundation-?node-id=7401-12
- **Radius** (node `7396:5`): https://www.figma.com/design/7hdk2gGDA4by0Lponqvts2/Apollo--Foundation-?node-id=7396-5
- **Breakpoints** (node `4646:1414`): https://www.figma.com/design/7hdk2gGDA4by0Lponqvts2/Apollo--Foundation-?node-id=4646-1414

---

#### Color Tokens

Apollo uses semantic color tokens organized by category. Each token has a light and dark theme value. Always use the semantic token name — never hardcode hex values.

**Background Colors:**

| Token | Light | Dark |
|---|---|---|
| `colorBackground` | `#FFFFFF` | `#182027` |
| `colorBackgroundSecondary` | `#F4F5F7` | `#273139` |
| `colorBackgroundInverse` | `#182027` | `#F8F9FA` |
| `colorBackgroundDisabled` | `#ECEDEE` | `#273139` |
| `colorBackgroundHighlight` | `#FEE3DC` | `#3C383C` |
| `colorBackgroundRaised` | `#FFFFFF` | `#273139` |
| `colorBackgroundEdit` | `#FFFFFF` | `#000000` |
| `colorBackgroundGrayEmphasized` | `#A4B1B8` | `#8A97A0` |
| `colorBackgroundGray` | `#CFD8DD` | `#526069` |
| `colorBackgroundHover` | `#526069` | `#CFD8DD` |
| `colorBackgroundSelected` | `#E9F1FA` | `#374652` |

**Foreground / Text Colors:**

| Token | Light | Dark |
|---|---|---|
| `colorForegroundEmphasized` | `#182027` | `#F8F9FA` |
| `colorForeground` | `#273139` | `#F4F5F7` |
| `colorForegroundDemphasized` | `#526069` | `#CFD8DD` |
| `colorForegroundDisabled` | `#8A97A0` | `#A4B1B8` |
| `colorForegroundInverseDeemphasized` | `#CFD8DD` | `#526069` |
| `colorForegroundHighlight` | `#DA3B11` | `#FF8F70` |
| `colorForegroundLink` | `#0067DF` | `#66ADFF` |
| `colorForegroundLinkPressed` | `#00489D` | `#BADAFF` |
| `colorForegroundInverse` | `#F8F9FA` | `#182027` |
| `colorForegroundLight` | `#6B7882` | `#A4B1B8` |

**Button Colors:**

| Token | Light | Dark |
|---|---|---|
| `colorPrimary` | `#0067DF` | `#66ADFF` |
| `colorPrimaryLighter` | `#BADAFF` | `#00489D` |
| `colorPrimaryHover` | `#0056BA` | `#87BFFF` |
| `colorPrimaryFocus` | `#0056BA` | `#87BFFF` |
| `colorPrimaryPressed` | `#0056BA` | `#66ADFF` |
| `colorSecondaryFocused` | `#E9F1FA` | `#374652` |
| `colorSecondaryPressed` | `#B2D2F3` | `#11508D` |
| `colorPrimaryDarker` | `#11508D` | `#B2D2F3` |

**Icon Colors:**

| Token | Light | Dark |
|---|---|---|
| `colorIconDefault` | `#526069` | `#A4B1B8` |
| `colorIconInvertedDefault` | `#CFD8DD` | `#526069` |

**Alert / Status Colors:**

| Token | Light | Dark |
|---|---|---|
| `colorInfoBackground` | `#E9F1FA` | `#000000` |
| `colorInfoIcon` | `#1976D2` | `#42A1FF` |
| `colorInfoText` | `#1665B3` | `#8CC2F8` |
| `colorSuccessBackground` | `#EEFFE5` | `#000000` |
| `colorSuccessIcon` | `#038108` | `#74C94B` |
| `colorSuccessText` | `#038108` | `#74C94B` |
| `colorWarningBackground` | `#FFF3DB` | `#000000` |
| `colorWarningIcon` | `#FFB40E` | `#FFBB27` |
| `colorWarningText` | `#9E6100` | `#FFE19E` |
| `colorErrorBackground` | `#FFF0F1` | `#000000` |
| `colorErrorIcon` | `#CC3D45` | `#FF8484` |
| `colorErrorText` | `#A6040A` | `#FF8484` |

**Toggle & Switch Colors:**

| Token | Light | Dark |
|---|---|---|
| `colorToggleThumbOff` | `#526069` | `#CFD8DD` |
| `colorToggleTrackOff` | `#CFD8DD` | `#526069` |
| `colorToggleThumbOn` | `#0067DF` | `#66ADFF` |
| `colorToggleTrackOn` | `#BADAFF` | `#00489D` |

**Special / Border Colors:**

| Token | Light | Dark |
|---|---|---|
| `colorSelection` | `#DA3B11` | `#FF8F70` |
| `colorHover` | `#E9F1FA` | `#374652` |
| `colorCurtain` | `#000000` | `#000000` |
| `colorBorder` | `#A4B1B8` | `#8A97A0` |
| `colorBorderDisabled` | `#CFD8DD` | `#526069` |
| `colorBorderDeemphasized` | `#CFD8DD` | `#526069` |
| `colorBorderGrid` | `#F4F5F7` | `#273139` |
| `colorLogo` | `#FA4616` | `#FFFFFF` |
| `colorCalloutBackground` | `#00489D` | `#00489D` |
| `colorNotificationBadge` | `#000000` | `#FFFFFF` |
| `colorSelectionIndicator` | `#0067DF` | `#66ADFF` |
| `colorFocusIndicator` | `#0067DF` | `#66ADFF` |
| `colorSkeleton` | `#ECEDEE` | `#273139` |
| `colorSkeletonGlow` | `#FBFBFC` | `#525A61` |

**Chart Colors:**

| Token | Light | Dark |
|---|---|---|
| `colorChartPurple` | `#933692` | `#B748B6` |
| `colorChartPink` | `#ED145B` | `#F25A8C` |
| `colorChartLightBlue` | `#38C6F4` | `#44CFFC` |
| `colorChartGreen` | `#6EB84A` | `#74C94B` |
| `colorChartYellow` | `#FFB40E` | — |
| `colorChartBlueSecondary` | `#42A1FF` | `#42A1FF` |

**Canvas / Node Editor Colors:**

| Token | Light | Dark |
|---|---|---|
| `CanvasBackground` | `#F4F5F7` | `#10151A` |
| `Dot Grid` | `#DCE5EB` | — |

**Global Colors (shared across themes):**

| Token | Value |
|---|---|
| `Black` | `#000000` |
| `White` | `#FFFFFF` |
| `colorGray300` | `#D3D4D6` |
| `colorBlue500` | `#0067DF` |
| `colorBlueSecondary400` | `#42A1FF` |
| `colorPink600` | `#D91153` |

**Dark Theme Only — Code Syntax Colors:**

| Token | Value |
|---|---|
| `colorCodeFunction` | `#DC80DB` |
| `colorCodeOperator` | `#66ADFF` |
| `colorCodeNumeric` | `#6ECDB6` |
| `colorCodeText` | `#F25A8C` |

---

#### Typeface & Typography Scale

All Apollo products use **Noto Sans** as the primary typeface. In certain circumstances, variants can be used for legibility and brand, determined case by case.

**Complete typography tokens with exact values (from Figma):**

| Token | Size | Weight | Line Height | Role |
|---|---|---|---|---|
| `$fontSizeHeroBold` | 60px | 400 (Regular) | 72px / 4.5rem | Hero text, emphasized |
| `$fontSizeHero` | 60px | 300 (Light) | 72px / 4.5rem | Hero text, light |
| `$fontSizeH1Bold` | 36px | 400 (Regular) | 44px / 2.75rem | Heading 1, emphasized |
| `$fontSizeH1` | 36px | 300 (Light) | 44px / 2.75rem | Heading 1, light |
| `$fontSizeH2Bold` | 32px | 400 (Regular) | 40px / 2.5rem | Heading 2, emphasized |
| `$fontSizeH2` | 32px | 300 (Light) | 40px / 2.5rem | Heading 2, light |
| `$fontSizeH3Bold` | 24px | 700 (Bold) | 32px / 2rem | Heading 3, bold |
| `$fontSizeH3` | 24px | 300 (Light) | 32px / 2rem | Heading 3, light |
| `$fontSizeH4Bold` | 20px | 600 (SemiBold) | 24px / 1.5rem | Heading 4, semibold — **default page title size** |
| `$fontSizeH4` | 20px | 300 (Light) | 24px / 1.5rem | Heading 4, light |
| `$fontSizeLBold` | 16px | 600 (SemiBold) | 24px / 1.5rem | Body 1, semibold (large body) |
| `$fontSizeL` | 16px | 400 (Regular) | 24px / 1.5rem | Body 1, regular (large body) |
| `$fontSizeMBold` | 14px | 600 (SemiBold) | 20px / 1.25rem | Body 2, semibold (medium body) |
| `$fontSizeM` | 14px | 400 (Regular) | 20px / 1.25rem | Body 2, regular (medium body) |
| `$fontSizeLink` | 14px | 600 (SemiBold) | 20px / 1.25rem | Link text (uses `colorForegroundLink` color) |
| `$fontSizeSBold` | 12px | 600 (SemiBold) | 16px / 1rem | Body 3, semibold (small body / labels) |
| `$fontSizeS` | 12px | 400 (Regular) | 16px / 1rem | Body 3, regular (small body) |
| `$fontSizeXSBold` | 10px | 600 (SemiBold) | 16px / 1rem | Caption, semibold |
| `$fontSizeXS` | 10px | 400 (Regular) | 16px / 1rem | Caption, regular |

**Important notes about "Bold" naming vs actual weights:**
- Token names like `HeroBold` and `H1Bold` do NOT always mean `font-weight: 700`. Check the weight column above.
- `HeroBold` and `H1Bold`/`H2Bold` use weight 400 (Regular) — "Bold" refers to their visual hierarchy role, not CSS weight.
- `H3Bold` is the only heading that uses actual weight 700 (Bold).
- `H4Bold`, `LBold`, `MBold`, `SBold`, `XSBold` all use weight 600 (SemiBold).
- The "Light" variants (`Hero`, `H1`, `H2`, `H3`, `H4`) use weight 300 (Light).

**Canvas-specific typography** (used inside canvas/node editor):

| Token | Size | Weight | Line Height | Role |
|---|---|---|---|---|
| `$fontSizeMBold` | 14px | 600 (SemiBold) | 20px / 1.25rem | Node primary title |
| `$fontSizeM-canvas` | 14px | 500 (Medium) | 16px / 1rem | Node primary title — Sequence node ONLY |
| `$fontSizeSBold` | 12px | 600 (SemiBold) | 16px / 1rem | Labels |
| `$fontSizeS` | 12px | 400 (Regular) | 16px / 1rem | Node secondary title |

---

#### Spacing Scale

Space tokens establish the core spacing values for layout, padding, and margins.

| Token | Pixels |
|---|---|
| `spacing-0` | 0 |
| `spacing-2` | 2 |
| `spacing-4` | 4 |
| `spacing-8` | 8 |
| `spacing-12` | 12 |
| `spacing-16` | 16 |
| `spacing-24` | 24 |
| `spacing-32` | 32 |
| `spacing-40` | 40 |
| `spacing-48` | 48 |
| `spacing-64` | 64 |
| `spacing-80` | 80 |
| `spacing-96` | 96 |
| `spacing-160` | 160 |

---

#### Radius Scale

Radius tokens define corner rounding values for visual harmony across components.

| Token | Pixels | Usage Examples |
|---|---|---|
| `radius-none` | 0 | Waffle menu, Drawers |
| `radius-2` | 2 | — |
| `radius-4` | 4 | Notifications, Modals |
| `radius-8` | 8 | Headers |
| `radius-16` | 16 | Nodes |

---

#### Breakpoints & Responsive Layout

Apollo uses 5 responsive breakpoints with a grid system defining columns, padding, and margins per breakpoint.

**System grid table:**

| Size | Columns | Padding | Margin |
|---|---|---|---|
| `responsive-xxl` — 1920+ | 16 | 16 | 24 |
| `responsive-xl` — 1440+ | 16 | 16 | 16 |
| `responsive-l` — 1024+ | 16 | 16 | 16 |
| `responsive-m` — 768+ | 8 | 16 | 16 |
| `responsive-s` — 320+ | 1 | 16 | 0 |

**Layout behavior per breakpoint:**
- **responsive-xxl (1920+):** Header + left sidebar + content area with left/right sub-panels + right sidebar + info bar
- **responsive-xl (1440+):** Header + left sidebar + content area + right sidebar + info bar
- **responsive-l (1024+):** Header + left sidebar + content area only (no right sidebar, no info bar)
- **responsive-m (768+):** Header + collapsed/narrow left sidebar + content area only
- **responsive-s (320+):** Header + full-width content only (no sidebars, no info bar)

---

**How to detect Apollo Design System usage:**
- The image comes from a Xplor Technologies product or the user mentions Apollo/Xplor
- The user references any of the Figma links above
- The design uses Apollo's characteristic token-based color and spacing patterns
- The user provides an Apollo component screenshot or mentions Apollo components

**Token Integration Rules:**
1. **Use Apollo CSS variables** — All colors, spacing, typography, and radius should use the `--xpl-` prefixed CSS custom properties (e.g., `--xpl-color-background-primary`, `--xpl-size-spacing-16`). Variable naming follows the pattern `--xpl-{category}-{class}-{modifier}-{value}`.
2. **Import the token stylesheet** — Reference `@xplortech/apollo-foundation/build/apollo/css/variables.css` at the top of the file, or inline the relevant token values as CSS custom properties if the import isn't available in the environment.
3. **Respect light/dark mode tokens** — Apollo supports light and dark mode. If the design shows a light theme, use the default tokens. If dark, use the `.dark` class variant. Do not mix modes. CSS files come in two flavors: `variables.css` (class-based with `.dark`) and `variables-media.css` (system preference-based via `prefers-color-scheme`).
4. **Typography: always use Noto Sans** — Use Apollo's font tokens for font family, size, weight, and line-height. The primary typeface is Noto Sans. Do not substitute with Inter, Roboto, or any other font unless the design explicitly uses a different face.
5. **Spacing tokens** — Use Apollo's spacing scale for padding, margin, and gap values. Map what you see in the design to the nearest token value (e.g., 16px gap → `spacing-16`, 24px padding → `spacing-24`). Do not use arbitrary pixel values when an Apollo token exists.
6. **Radius tokens** — Use the defined radius scale. If a component has 4px rounded corners, use `radius-4`. Do not invent radius values outside the scale (0, 2, 4, 8, 16).
7. **Breakpoints** — When building responsive layouts, use the Apollo breakpoint tokens and grid system. Match column counts, padding, and margins to the breakpoint table above.
8. **Color semantic tokens** — Prefer semantic color tokens (e.g., `--xpl-color-background-primary`, `--xpl-color-text-secondary`) over raw palette tokens (e.g., `--xpl-color-red-700`) when the design uses standard background, text, or surface colors. Use palette tokens only for decorative or brand-specific accent colors.
9. **Brand awareness** — Apollo supports multiple brands (Apollo and Field Edge). Default to the `apollo` brand path unless the user specifies Field Edge. Import paths differ by brand: `apollo/css/variables.css` vs `field-edge/css/variables.css`.
10. **Do not override tokens** — If the design matches an Apollo token value, use the token. Do not hardcode the hex/rgb value. This ensures the output integrates cleanly with existing Apollo-powered codebases.

**When Apollo tokens are NOT available in the environment:**
If you cannot import the NPM package (e.g., building a standalone HTML file), inline the token values as CSS custom properties at the top of your `<style>` block:
```css
:root {
  /* Typography */
  --xpl-font-family-primary: 'Noto Sans', sans-serif;

  /* Spacing */
  --xpl-size-spacing-0: 0px;
  --xpl-size-spacing-2: 2px;
  --xpl-size-spacing-4: 4px;
  --xpl-size-spacing-8: 8px;
  --xpl-size-spacing-12: 12px;
  --xpl-size-spacing-16: 16px;
  --xpl-size-spacing-24: 24px;
  --xpl-size-spacing-32: 32px;
  --xpl-size-spacing-40: 40px;
  --xpl-size-spacing-48: 48px;
  --xpl-size-spacing-64: 64px;
  --xpl-size-spacing-80: 80px;
  --xpl-size-spacing-96: 96px;
  --xpl-size-spacing-160: 160px;

  /* Radius */
  --xpl-radius-none: 0px;
  --xpl-radius-2: 2px;
  --xpl-radius-4: 4px;
  --xpl-radius-8: 8px;
  --xpl-radius-16: 16px;

  /* Colors — Light Theme (default) */
  /* Backgrounds */
  --xpl-color-background: #FFFFFF;
  --xpl-color-background-secondary: #F4F5F7;
  --xpl-color-background-inverse: #182027;
  --xpl-color-background-disabled: #ECEDEE;
  --xpl-color-background-highlight: #FEE3DC;
  --xpl-color-background-raised: #FFFFFF;
  --xpl-color-background-edit: #FFFFFF;
  --xpl-color-background-gray-emphasized: #A4B1B8;
  --xpl-color-background-gray: #CFD8DD;
  --xpl-color-background-hover: #526069;
  --xpl-color-background-selected: #E9F1FA;

  /* Foregrounds / Text */
  --xpl-color-foreground-emphasized: #182027;
  --xpl-color-foreground: #273139;
  --xpl-color-foreground-deemphasized: #526069;
  --xpl-color-foreground-disabled: #8A97A0;
  --xpl-color-foreground-inverse-deemphasized: #CFD8DD;
  --xpl-color-foreground-highlight: #DA3B11;
  --xpl-color-foreground-link: #0067DF;
  --xpl-color-foreground-link-pressed: #00489D;
  --xpl-color-foreground-inverse: #F8F9FA;
  --xpl-color-foreground-light: #6B7882;

  /* Buttons */
  --xpl-color-primary: #0067DF;
  --xpl-color-primary-lighter: #BADAFF;
  --xpl-color-primary-hover: #0056BA;
  --xpl-color-primary-focus: #0056BA;
  --xpl-color-primary-pressed: #0056BA;
  --xpl-color-secondary-focused: #E9F1FA;
  --xpl-color-secondary-pressed: #B2D2F3;
  --xpl-color-primary-darker: #11508D;

  /* Icons */
  --xpl-color-icon-default: #526069;
  --xpl-color-icon-inverted-default: #CFD8DD;

  /* Alerts */
  --xpl-color-info-background: #E9F1FA;
  --xpl-color-info-icon: #1976D2;
  --xpl-color-info-text: #1665B3;
  --xpl-color-success-background: #EEFFE5;
  --xpl-color-success-icon: #038108;
  --xpl-color-success-text: #038108;
  --xpl-color-warning-background: #FFF3DB;
  --xpl-color-warning-icon: #FFB40E;
  --xpl-color-warning-text: #9E6100;
  --xpl-color-error-background: #FFF0F1;
  --xpl-color-error-icon: #CC3D45;
  --xpl-color-error-text: #A6040A;

  /* Toggles */
  --xpl-color-toggle-thumb-off: #526069;
  --xpl-color-toggle-track-off: #CFD8DD;
  --xpl-color-toggle-thumb-on: #0067DF;
  --xpl-color-toggle-track-on: #BADAFF;

  /* Borders & Special */
  --xpl-color-border: #A4B1B8;
  --xpl-color-border-disabled: #CFD8DD;
  --xpl-color-border-deemphasized: #CFD8DD;
  --xpl-color-border-grid: #F4F5F7;
  --xpl-color-selection: #DA3B11;
  --xpl-color-hover: #E9F1FA;
  --xpl-color-curtain: #000000;
  --xpl-color-logo: #FA4616;
  --xpl-color-callout-background: #00489D;
  --xpl-color-notification-badge: #000000;
  --xpl-color-selection-indicator: #0067DF;
  --xpl-color-focus-indicator: #0067DF;
  --xpl-color-skeleton: #ECEDEE;
  --xpl-color-skeleton-glow: #FBFBFC;

  /* Charts */
  --xpl-color-chart-purple: #933692;
  --xpl-color-chart-pink: #ED145B;
  --xpl-color-chart-light-blue: #38C6F4;
  --xpl-color-chart-green: #6EB84A;
  --xpl-color-chart-yellow: #FFB40E;
  --xpl-color-chart-blue-secondary: #42A1FF;
}

/* Dark Theme — apply via .dark class on a parent element */
.dark {
  --xpl-color-background: #182027;
  --xpl-color-background-secondary: #273139;
  --xpl-color-background-inverse: #F8F9FA;
  --xpl-color-background-disabled: #273139;
  --xpl-color-background-highlight: #3C383C;
  --xpl-color-background-raised: #273139;
  --xpl-color-background-edit: #000000;
  --xpl-color-background-gray-emphasized: #8A97A0;
  --xpl-color-background-gray: #526069;
  --xpl-color-background-hover: #CFD8DD;
  --xpl-color-background-selected: #374652;

  --xpl-color-foreground-emphasized: #F8F9FA;
  --xpl-color-foreground: #F4F5F7;
  --xpl-color-foreground-deemphasized: #CFD8DD;
  --xpl-color-foreground-disabled: #A4B1B8;
  --xpl-color-foreground-inverse-deemphasized: #526069;
  --xpl-color-foreground-highlight: #FF8F70;
  --xpl-color-foreground-link: #66ADFF;
  --xpl-color-foreground-link-pressed: #BADAFF;
  --xpl-color-foreground-inverse: #182027;
  --xpl-color-foreground-light: #A4B1B8;

  --xpl-color-primary: #66ADFF;
  --xpl-color-primary-lighter: #00489D;
  --xpl-color-primary-hover: #87BFFF;
  --xpl-color-primary-focus: #87BFFF;
  --xpl-color-primary-pressed: #66ADFF;
  --xpl-color-secondary-focused: #374652;
  --xpl-color-secondary-pressed: #11508D;
  --xpl-color-primary-darker: #B2D2F3;

  --xpl-color-icon-default: #A4B1B8;
  --xpl-color-icon-inverted-default: #526069;

  --xpl-color-info-background: #000000;
  --xpl-color-info-icon: #42A1FF;
  --xpl-color-info-text: #8CC2F8;
  --xpl-color-success-background: #000000;
  --xpl-color-success-icon: #74C94B;
  --xpl-color-success-text: #74C94B;
  --xpl-color-warning-background: #000000;
  --xpl-color-warning-icon: #FFBB27;
  --xpl-color-warning-text: #FFE19E;
  --xpl-color-error-background: #000000;
  --xpl-color-error-icon: #FF8484;
  --xpl-color-error-text: #FF8484;

  --xpl-color-toggle-thumb-off: #CFD8DD;
  --xpl-color-toggle-track-off: #526069;
  --xpl-color-toggle-thumb-on: #66ADFF;
  --xpl-color-toggle-track-on: #00489D;

  --xpl-color-border: #8A97A0;
  --xpl-color-border-disabled: #526069;
  --xpl-color-border-deemphasized: #526069;
  --xpl-color-border-grid: #273139;
  --xpl-color-selection: #FF8F70;
  --xpl-color-hover: #374652;
  --xpl-color-curtain: #000000;
  --xpl-color-logo: #FFFFFF;
  --xpl-color-callout-background: #00489D;
  --xpl-color-notification-badge: #FFFFFF;
  --xpl-color-selection-indicator: #66ADFF;
  --xpl-color-focus-indicator: #66ADFF;
  --xpl-color-skeleton: #273139;
  --xpl-color-skeleton-glow: #525A61;

  --xpl-color-chart-purple: #B748B6;
  --xpl-color-chart-pink: #F25A8C;
  --xpl-color-chart-light-blue: #44CFFC;
  --xpl-color-chart-green: #74C94B;
  --xpl-color-chart-blue-secondary: #42A1FF;
}
```
Then reference these variables throughout your CSS so the code is token-ready even without the full package.

---

### What NOT To Do

- **Do NOT** add a dark mode toggle unless one is visible in the image
- **Do NOT** add animations or transitions beyond subtle hover/focus states unless the image implies them
- **Do NOT** change the layout to be "more responsive" or "more accessible" unless asked
- **Do NOT** replace the color scheme with one you think looks better
- **Do NOT** add components that aren't in the image (no extra footers, no floating action buttons, no toast notifications)
- **Do NOT** use a component library's default theme (like default Material UI or shadcn) if it doesn't match the image's visual style
- **Do NOT** simplify or reduce visual complexity — if the design is dense and detailed, the code should be dense and detailed
