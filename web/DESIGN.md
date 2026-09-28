---
name: Franccino
description: Showroom catalog for authorial Brazilian furniture — white plates of fact over a stone ground, no dark-slider luxury cliché.
colors:
  stone: "#f2f1ed"
  paper: "#ffffff"
  ink: "#171717"
  ink-muted: "#57564f"
  line: "#dcd9d1"
  line-strong: "#bdb9ae"
  wood: "#7b4b2a"
  garden: "#2e4a37"
  alert: "#9b2c1f"
typography:
  display:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2.5rem, 5.2vw, 4.9rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 118"
  headline:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2.1rem, 3.6vw, 3.4rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 118"
  title:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    fontVariation: "'wdth' 100"
  label:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  none: "0px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  gutter: "clamp(20px, 4vw, 56px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "#000000"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "50px"
  button-ghost-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-pressed:
    backgroundColor: "{colors.garden}"
    textColor: "{colors.paper}"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
  chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  tag:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.none}"
    padding: "3px 8px"
  quantity-badge:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    size: "22px"
---

# Design System: Franccino

> **Provisional-materials notice.** Typeface (Archivo is a stand-in), the wordmark/logo, and all product photography are placeholders until the client's brand manual arrives (see PRODUCT.md, Brand Commitments). Every color, type, spacing and radius value below is a CSS custom property in `assets/styles.css`, so the visual identity can be swapped without touching layout or component markup. Treat hex values, the font-family, and imagery direction as replaceable; treat the structural rules (grid behavior, spacing rhythm, corner language, elevation stance, named rules) as the durable system.

## Overview

**Creative North Star: "The Showroom Plate."**

Franccino reads as a precise, factual showroom rather than an editorial lifestyle magazine. Every product sits on a white "plate" — a plain rectangle of paper-white floating on a warm stone ground — carrying only what a buyer or a specifying architect needs at a glance: designer, category, dimensions, finish. The system explicitly rejects the furniture category's default identity — the dark, full-bleed slider paired with a luxury serif — in favor of daylight photography, a single expanded grotesque, and square corners throughout. Nothing is decorated for its own sake: no drop shadows as ornament, no rounded cards, no italic flourishes. The one indulgence is scale: display type runs wide and large, and full-bleed photography (hero, area diptychs, "línea" panels) does the emotional work, while every card, table and form stays flat and legible.

The pairing of "serious, category-grade craft" (PRODUCT.md, confirmed 2026-09-23) with a functional showroom grid is the core tension the system resolves: warmth comes from photography and material color-coding (wood tone for Casa, garden green for Giardini), not from surface texture or type flourish.

**Key Characteristics:**
- White plates on a stone ground; paper is the surface color, stone is the field.
- One expanded grotesque (Archivo) doing both display and body duty via its width axis, not a display/body font pairing.
- Square corners everywhere except two small functional exceptions (badge pill, status dot).
- Flat by default; a single soft ambient shadow appears only as hover feedback on interactive plates, never as a resting decoration.
- Two accent hues (wood, garden) are structural area-identifiers (Casa / Giardini), not decorative color.

## Colors

The palette is deliberately narrow: a warm neutral scale carries almost the entire interface, and two saturated hues are reserved to mark the two product lines.

### Primary
- **Ink** (`#171717`): the only "brand" color in the conventional sense. Body text, headlines, primary button fill, borders on focus, footer background (at full value). Used everywhere legibility or authority is needed.

### Secondary
- **Wood** (`#7b4b2a`): identifies **Franccino Casa** (indoor line) — the area-dot on product plates, category dividers. Never used as a general accent or CTA color.
- **Garden** (`#2e4a37`): identifies **Franccino Giardini** (outdoor line) and doubles as the system's single "success/confirmed" color (added-to-list button state, valid room-planner placement, quote-sent confirmation banner). This dual role is intentional: green reads as both "outdoor" and "good."

### Neutral
- **Stone** (`#f2f1ed`): the page field/background. Sections without an explicit `.section--paper` sit on stone.
- **Paper** (`#ffffff`): the surface color for every plate, card, table, form and panel — the thing that sits *on* stone.
- **Ink Muted** (`#57564f`): secondary text — meta lines, labels, captions, disabled/quiet copy.
- **Line** (`#dcd9d1`): default hairline — dividers, card borders, table borders.
- **Line Strong** (`#bdb9ae`): emphasized hairline — input borders, toggle borders, empty-state badge ring.
- **Alert** (`#9b2c1f`): form errors and planner placement conflicts only.

Note on incumbent tokens not canonized: `--ink-3` (`#8a887f`) is declared in `assets/styles.css` but has zero call sites in the build. It is not part of the working palette; do not treat it as a reserved tertiary tone until a real usage appears.

### Named Rules
**The Two-Hue Rule.** Wood and garden are area identifiers first. A new surface may use garden for a genuine positive/success state (it already does double duty), but never introduces a third saturated accent, and never uses wood for anything other than marking Casa.

## Typography

**Display/Body Font:** Archivo (variable, `wdth 62.5–125`, `wght 100–900`), falling back to Helvetica Neue/Arial. Archivo is a stand-in per PRODUCT.md; the family and its variable axes are expected to change once the brand manual lands — every size/weight/width below is a token, not a hardcoded value.

**Character:** One grotesque carries the whole hierarchy by varying its width axis rather than switching families: headlines pull the width axis wide (`--wide: 118`, up to 125 for the wordmark) for a confident, poster-like presence; body copy stays at normal width (`--text: 100`) for density and legibility. This is a single-voice system, not a display/body pairing.

### Hierarchy
- **Display** (400, `clamp(2.5rem, 5.2vw, 4.9rem)`, line-height 1.02, `wdth 118`, letter-spacing -0.025em): hero plate headline and section-opening statements only.
- **Headline** (h1; 400, `clamp(2.1rem, 3.6vw, 3.4rem)`, line-height 1.05, `wdth 118`): page-level titles (product name, catalog title).
- **Title** (h2; 400, `clamp(1.55rem, 2.4vw, 2.35rem)`, line-height 1.1, `wdth 118`): section headings within a page.
- **Subtitle** (h3; 500, 1.125rem, line-height 1.3, `wdth 100`, letter-spacing -0.005em): card/plate-level titles, designer names.
- **Body** (400, 1rem, line-height 1.6, `wdth 100`, max-width 68ch): running copy.
- **Lead** (400, `clamp(1.05rem, 1.25vw, 1.2rem)`, line-height 1.55, ink-muted): section intros directly under a Title.
- **Label/Meta** (500, 0.8125rem, line-height 1.4, ink-muted): facts under a plate — designer, category, price-adjacent metadata. Never uppercase, never a kicker sitting above a headline.
- **Numerals**: dimension and price figures use `font-variant-numeric: tabular-nums lining-nums` (the `.num` utility) wherever numbers must align in a column (technical table, dimension list).

### Named Rules
**The One Face, Two Widths Rule.** Every text role is Archivo; hierarchy comes from the `wdth` variation axis and size, never from switching to a second family (no serif accent, no mono display face). If the brand manual specifies a genuinely second face, it replaces the whole system, it doesn't get layered in as an accent.

**The No-Kicker Rule.** Metadata (`.meta`) sits *below or beside* a heading as a supporting fact line — designer name, category, price cue — never as a small-caps label placed above a headline to announce it. The build never uses eyebrows/kickers; don't introduce them on new surfaces.

## Layout

The grid is a single fluid container (`--max: 1560px`) with a fluid gutter (`--gutter: clamp(20px, 4vw, 56px)`), sitting under a sticky 72px header (`--header`). Sections default to generous vertical rhythm (`clamp(64px, 7.5vw, 112px)` padding-block; `--section--tight` variant at `clamp(48px, 6vw, 88px)`).

Composition is need-driven, not a single reused grid: horizontal-scroll rails for product carousels (`grid-auto-flow: column`, snap), responsive card grids (`repeat(auto-fill, minmax(260px, 1fr))`) for catalog and store listings, and fixed asymmetric column splits for two-up editorial moments — 5fr/7fr (planner teaser), 7fr/5fr (factory, product detail, feature), 4fr/8fr (stores). All asymmetric splits collapse to a single column between 820px and 1200px depending on content density; the product detail gallery is sticky on desktop and static below 980px.

Two data-dense screens depart from the fluid container's comfort: the technical table (`min-width: 860px` inside a scroll wrapper) and the room planner (3-column `320px minmax(0,1fr) 300px`, collapsing to stacked single-column under 1200px with the canvas promoted above the side panels).

## Elevation & Depth

The system is flat by default: separation between surfaces comes from hairline borders (`--line`, `--line-strong`) and the stone/paper color break, not from shadow. The one exception is a soft, ambient shadow (`box-shadow: 0 18px 40px -28px rgba(23, 23, 23, 0.35)`) that appears solely on hover/focus of an interactive product plate — it is a state response signaling "this is clickable," not a resting decoration. This is a narrow, deliberate divergence from the direction contract's stated "no decorative shadows": it is used exactly once, as functional hover feedback, never at rest and never on non-interactive cards (tech table rows, store cards, factory facts use borders only). Do not generalize it into a resting card shadow elsewhere.

### Shadow Vocabulary
- **Plate hover** (`box-shadow: 0 18px 40px -28px rgba(23, 23, 23, 0.35)`): interactive product plate on `:hover`, signaling affordance only.

### Named Rules
**The Flat-at-Rest Rule.** No surface carries a shadow while idle. If a new component needs depth, reach for a border or a background-color break (stone vs. paper) before reaching for `box-shadow`.

## Shapes

Corners are square everywhere: cards, buttons, inputs, tables, swatches, chips and the planner canvas all carry `border-radius: 0` (inputs set it explicitly, overriding any browser default). The only rounded forms in the build are functional indicators, not surfaces: the header's quote-count badge (a `999px`/pill shape) and the small area-identity dot (a true circle) next to category text. Borders are consistently 1px, using `--line` for quiet dividers and `--line-strong` for interactive boundaries (inputs, toggles).

### Named Rules
**The Square Corner Rule.** Every card, button, input, table and panel uses `border-radius: 0`. Rounding is reserved for two small non-rectangular indicators (count badge, area dot) and must never be extended to cards or buttons.

## Components

### Buttons
- **Shape:** square corners (`{rounded.none}`), 1px border in `ink`, 50px min-height, 0 24px padding.
- **Primary:** ink fill (`#171717`) with paper text; hover darkens to pure black (`#000`). Used for the one clear next action per screen (add to list, send quote, view catalog).
- **Ghost:** transparent fill, ink text and border; hover inverts to ink fill / paper text. Used for secondary actions beside a primary button.
- **Light:** paper fill/border for use over dark or photographic backgrounds (hero plate, line panels); hover softens to stone.
- **Pressed/active state:** any button (`aria-pressed="true"`, `.is-added`) switches to garden fill — this is the system's one shared "confirmed/added" signal, reused for quick-add and swatch/finish confirmation.
- **Disabled:** 45% opacity, no pointer.

### Chips & Tags
- **Chip** (filters): transparent background, 1px `--line` border; hover darkens border to ink; selected (`aria-pressed="true"`) fills ink/paper.
- **Tag** (plate badges — e.g. "new"): small paper-background label with a `--line-strong` border; the "new" variant switches to an ink border/text. Tags sit inside the plate corner, never as a kicker above a title.

### Cards / Plates
- **Corner style:** square (0 radius).
- **Background:** paper on a stone field.
- **Shadow strategy:** flat at rest; ambient hover shadow only on interactive plates (see Elevation & Depth).
- **Border:** a single `--stone` divider between media and body; no outer border on the plate itself.
- **Internal padding:** 16px 18px 20px body padding; 16px gap in card grids.
- **Area identity:** a small colored dot (wood/garden) precedes the category label to mark Casa vs. Giardini at a glance.

### Inputs / Fields
- **Style:** 1px `--line-strong` border, paper background, square corners, 11px 12px padding.
- **Focus:** 2px ink outline, inset by -1px (no glow, no color shift).
- **Error:** border switches to `--alert`; helper text in `--alert` beneath the field.

### Navigation
- **Header:** sticky, translucent stone (`color-mix` at 94% + blur), 1px bottom border, 72px tall. Wordmark uses the widest variation setting (`wdth 125`) with heavy letter-spacing (0.3em) as a logotype stand-in.
- **Nav links:** ink-muted by default, ink with an ink underline on hover/current. Collapses to a hidden drawer under 1180px, toggled by a menu icon button.
- **Tools:** quote-list count as a pill badge (ink fill; hollow ring when empty), language switch, all icon-first.

### Technical Table (signature component)
A dense, bordered data table (`min-width: 860px` in a horizontal scroll wrapper) for the architect/specifier audience: stone header row, hairline row dividers, tabular-numeral dimension columns, a fixed-width contained thumbnail, and inline file-download links per row. It is the one place density explicitly overrides the fluid container, because architects compare rows, not cards.

### Room Planner (signature component; scope addition, pending tech-lead approval per PRODUCT.md)
A three-pane tool: a scrollable piece library on the left, a to-scale SVG floor-plan canvas in the center, and a running summary on the right. Pieces render as bordered rectangles/ellipses at real scale (`vector-effect: non-scaling-stroke` so strokes stay crisp at any zoom); selection state tints the shape pale garden with a garden stroke, and a placement conflict tints it pale alert with an alert stroke — the same success/error hues used everywhere else, applied to geometry instead of UI chrome. 2D-to-scale only in this build; a 3D mode is future scope per PRODUCT.md.

## Do's and Don'ts

### Do:
- **Do** treat every color, font-family, spacing and radius value as a swappable custom property — the brand manual will replace some of them, not the structure.
- **Do** use the width axis (`wdth`) of Archivo, not a second font family, to build hierarchy.
- **Do** keep corners square (`border-radius: 0`); reserve rounding for the count badge and area dot only.
- **Do** reuse garden as the single success/confirmed signal and wood/garden as the only area identifiers.
- **Do** keep metadata (`.meta`) below or beside headings as supporting fact, never as an uppercase kicker above them.

### Don't:
- **Don't** add a resting shadow to a card, table row, or panel — shadow is reserved for interactive-plate hover only.
- **Don't** introduce a third saturated accent color; wood and garden are reserved for Casa/Giardini identity.
- **Don't** round a button, input, table, or card corner; square corners are the system's form language throughout.
- **Don't** reintroduce the dark-slider-plus-luxury-serif pattern the direction contract explicitly rejects — daylight photography and one grotesque are the world.
- **Don't** promote `--ink-3` into use without a real call site; it is declared but unused in the current build.
