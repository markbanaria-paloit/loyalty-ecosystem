# Gen-e2 Light Theme Template Reference

This document defines the complete visual specification for the **Gen-e2 Light Theme** HTML presentation template, derived from the official "Master Slides_Gen-e2_Light Theme.pptx" brand deck.

## Table of Contents

- [Overview](#overview)
- [Brand Colour Palette](#brand-colour-palette)
- [Typography](#typography)
- [Logo & Branding](#logo--branding)
- [Decorative Gradient Shapes](#decorative-gradient-shapes)
- [Card Styling (Light Theme Specific)](#card-styling-light-theme-specific)
- [Chart / Data Visualisation Colours](#chart--data-visualisation-colours)
- [Slide Layout Examples](#slide-layout-examples)
- [Layout CSS Reference (Gen-e2 Light Theme overrides)](#layout-css-reference-gen-e2-light-theme-overrides)
- [Do's and Don'ts](#dos-and-donts)
- [Confidentiality Footer (Optional)](#confidentiality-footer-optional)

---

## Overview

The Gen-e2 Light Theme is the light-mode counterpart to the Gen-e2 Dark Theme. It shares the same blue-to-purple-to-magenta gradient accent system but uses a clean white background with dark text. The result is a bright, professional, and modern look that still carries the Gen-e2 brand identity.

**Relationship to Dark Theme:** Both Gen-e2 themes share the same gradient palette, decorative shape catalogue, typography, and branding lockup. The only differences are background colour, text colour, and card styling.

---

## Brand Colour Palette

### Core Colours

| Name | Hex | Usage |
|------|-----|-------|
| White (Background) | `#FFFFFF` | All slide backgrounds — pure white |
| Dark (Text) | `#1A1A1A` | Primary text colour on all slides |
| Muted Dark | `rgba(26,26,26,0.5)` | Footer text, captions, secondary info |
| Light Grey | `#F5F5F5` | Subtle background tint for special elements (e.g., circle on closing alternate) |

### Gradient Colours (the signature accent — identical to Dark Theme)

The Gen-e2 gradient flows from blue through purple to magenta/pink. It is used in all decorative shapes, accent elements, and the "e2" logotype.

| Stop | Hex | Position |
|------|-----|----------|
| Sky Blue | `#60A5FA` | 0% (start) |
| Indigo | `#818CF8` | 25% |
| Purple | `#A855F7` | 50% (midpoint) |
| Fuchsia | `#D946EF` | 75% |
| Magenta/Pink | `#EC4899` | 100% (end) |

### Accent Colours (for data, cards, UI elements)

| Name | Hex | Usage |
|------|-----|-------|
| Gradient Purple (primary accent) | `#A855F7` | Main heading labels, accent text |
| Gradient Blue | `#60A5FA` | Data visualisation, card border variant 1 |
| Gradient Magenta | `#D946EF` | Card border variant 3, emphasis |
| Soft Purple | `rgba(168,85,247,0.08)` | Subtle card fills |
| Card Border Blue | `#60A5FA` | First card in a 3-card row |
| Card Border Purple | `#A855F7` | Second card / default card border |
| Card Border Magenta | `#EC4899` | Third card in a 3-card row |

### CSS Variables

```css
:root {
    /* ── Core palette ── */
    --gene2-white: #FFFFFF;
    --gene2-dark: #1A1A1A;
    --gene2-muted: rgba(26,26,26,0.5);
    --gene2-light-grey: #F5F5F5;

    /* ── Gradient stops ── */
    --grad-blue: #60A5FA;
    --grad-indigo: #818CF8;
    --grad-purple: #A855F7;
    --grad-fuchsia: #D946EF;
    --grad-magenta: #EC4899;

    /* ── The signature gradient (reusable) ── */
    --gene2-gradient: linear-gradient(135deg, var(--grad-blue), var(--grad-indigo), var(--grad-purple), var(--grad-fuchsia), var(--grad-magenta));
    --gene2-gradient-horizontal: linear-gradient(90deg, var(--grad-blue), var(--grad-indigo), var(--grad-purple), var(--grad-fuchsia), var(--grad-magenta));
    --gene2-gradient-vertical: linear-gradient(180deg, var(--grad-blue), var(--grad-indigo), var(--grad-purple), var(--grad-fuchsia), var(--grad-magenta));

    /* ── Semantic ── */
    --bg-dark: var(--gene2-white);    /* ALL slides are light in this theme */
    --bg-light: var(--gene2-white);
    --bg-subtle: rgba(168,85,247,0.05);
    --text-on-dark: var(--gene2-dark);
    --text-on-light: var(--gene2-dark);
    --brand-accent: var(--grad-purple);

    /* ── Card / surface colours ── */
    --card-bg: var(--gene2-white);
    --card-border-default: var(--grad-purple);
    --card-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
```

### Colour Application Rules

- **ALL slides use white background** (`#FFFFFF`) — there are no dark slides in the light theme
- **Text is always dark** (`#1A1A1A`) — full dark for headings and body, 50% opacity for footers/captions
- **Gradient shapes are decorative only** — they sit behind content and vary by slide type (same shapes as Dark Theme)
- **Main heading labels**: use `--grad-purple` (#A855F7) or a gradient text effect
- **Cards**: white background with coloured borders — use blue/purple/magenta borders from the gradient palette to differentiate cards in a row
- **Never use**: PALO IT green, the original green palette, or any colours outside the gradient palette

---

## Typography

### Font Stack

```css
/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Open+Sans:wght@300;400;500;600;700&display=swap');

:root {
    --font-heading: 'Montserrat', sans-serif;
    --font-body: 'Open Sans', sans-serif;
}
```

### Type Scale

| Element | Font | Weight | Size (CSS clamp) | Colour |
|---------|------|--------|-------------------|--------|
| Main heading (label) | Montserrat | 600 | `clamp(0.7rem, 1.2vw, 0.95rem)` | `--grad-purple` or gradient text |
| Sub-heading (insight) | Montserrat | 700 | `clamp(1.25rem, 3.5vw, 2.5rem)` | `--gene2-dark` |
| Body text | Open Sans | 400 | `clamp(0.75rem, 1.5vw, 1.125rem)` | `--gene2-dark` |
| Small / caption | Open Sans | 400 | `clamp(0.65rem, 1vw, 0.875rem)` | `--gene2-muted` |
| Big number | Montserrat | 800 | `clamp(3rem, 10vw, 8rem)` | Gradient text effect |
| Card title | Montserrat | 600 | `clamp(0.85rem, 1.5vw, 1.1rem)` | `--gene2-dark` |
| Card body | Open Sans | 400 | `clamp(0.7rem, 1.2vw, 0.95rem)` | `rgba(26,26,26,0.7)` |
| Navigation / UI | Open Sans | 500 | `0.8rem` | `rgba(26,26,26,0.5)` |
| Footer | Open Sans | 400 | `clamp(0.5rem, 0.8vw, 0.7rem)` | `--gene2-muted` |

### Gradient Text Effect

Same as Dark Theme — for main headings, big numbers, and the "e2" in "Gen-e2":

```css
.gradient-text {
    background: var(--gene2-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

### Main Heading Style

```css
.main-heading {
    font-family: var(--font-heading);
    font-weight: 600;
    font-size: var(--main-heading-size);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--grad-purple);
    margin-bottom: 0.5rem;
}
```

### Sub-Heading Style

```css
.sub-heading {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: var(--sub-heading-size);
    line-height: 1.2;
    color: var(--gene2-dark);
    margin-bottom: var(--content-gap);
}
```

---

## Logo & Branding

> **MANDATORY:** The brand lockup must appear on every slide — content slides AND the title slide. Never omit it. Use `slide-brand` on content slides and `title-brand` on the title slide.
>
> **Overlap prevention:** Always set `padding-bottom: var(--logo-safe-bottom)` (5rem) on `.slide-content` for content slides, and `padding-bottom: var(--title-brand-safe-bottom)` (9rem) on `.slide-title .slide-content`. The `slide-brand` element is ~3.7rem tall from the bottom; `title-brand` is ~8rem tall. Never rely on the default `--slide-padding` alone for bottom clearance.

### Content Slides — Gen-e2 Lockup (bottom-left)

Same as the Dark Theme lockup but on a white background. Shows only the **Gen-e2 logo**: "Gen-" in dark/black with "e2" in the blue-purple-magenta gradient. **Do not add a PALO IT line — one logo per slide.**

```html
<div class="slide-brand">
    <div class="brand-gene2">Gen-<span class="gradient-text">e2</span><sup class="brand-tm">&trade;</sup></div>
</div>
```

```css
.slide-brand {
    position: absolute;
    bottom: 1.5rem;
    left: 1.5rem;
    z-index: 10;
    line-height: 1.2;
}

.brand-gene2 {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--gene2-dark);
}

.brand-tm {
    font-size: 0.5em;
    opacity: 0.5;
}
```

### Title Slide — Full Branding

The title slide uses a larger **Gen-e2 logo** at bottom-left with the tagline "Crafting tech as a force for good." and a magenta underline. **Do not use a PALO IT text or wordmark here.** The gradient is identical to the Dark Theme — it renders well on both white and black backgrounds.

```html
<div class="title-brand">
    <div class="title-gene2">Gen-<span class="gradient-text">e2</span><sup style="font-size:0.4em; opacity:0.6;">&trade;</sup></div>
    <div class="title-underline"></div>
    <div class="title-tagline">Crafting tech as<br>a force for good.</div>
</div>
```

```css
.title-brand {
    position: absolute;
    bottom: 3rem;
    left: var(--slide-padding);
    z-index: 10;
}

.title-gene2 {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: 2.5rem;
    background: var(--gene2-gradient-horizontal);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.02em;
}

.title-underline {
    width: 60px;
    height: 3px;
    background: var(--grad-magenta);
    margin: 0.5rem 0;
}

.title-tagline {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--gene2-dark);
    line-height: 1.4;
}
```

### Closing Slide (slide 12 variant) — PALO IT Colourful Logo

One closing variant uses the colourful PALO IT logo (green P, orange A, green L, orange O) with the tagline and country list at the bottom-left, a light grey circle as a subtle background element on the left, and the gradient panel on the right.

### Closing Slide (slide 15) — Centred Large Branding

Same as Dark Theme but with dark text on white: a large gradient "P" shape centred, with "PALO IT" in black and "Gen-e2" below it.

### Available Image Assets

All logo images for the Gen-e2 Light template are located in `reference/assets/Gen-e2 Light/`. These images are colour-matched to the white background of this theme.

| File | Description | Use |
|------|-------------|-----|
| `palo-it-logo.png` | Standard PALO IT wordmark (dark/black version) | Title slide, closing slide, slide 12 colourful variant |
| `palo-it-logo-large.png` | High-resolution wordmark (dark/black version) | Large-format or retina displays |
| `palo-it-p-icon.png` | Raster "P" icon (dark/black version) | When inline SVG is not suitable |
| `palo-it-p-icon.svg` | Vector "P" icon (dark/black version) | Preferred over inline SVG for maintainability |

When using image files instead of the CSS text-based lockup, reference them like this:

```html
<!-- Title slide — full wordmark -->
<img src="reference/assets/Gen-e2 Light/palo-it-logo.png" alt="PALO IT" class="title-wordmark">

<!-- Content slides — P icon -->
<img src="reference/assets/Gen-e2 Light/palo-it-p-icon.svg" alt="" class="slide-logo-img">
```

> **Important:** Always use images from `reference/assets/Gen-e2 Light/` for this template. Do not use images from the Palo IT or Gen-e2 Dark asset folders — those images have different background colours that do not match this white-background theme.

---

## Decorative Gradient Shapes

The Gen-e2 Light Theme uses the **same shape catalogue** as the Dark Theme. The gradient shapes are identical — the only difference is that they sit on a white background instead of black.

### Shape Catalogue

Each content slide should use ONE of these shapes. **Vary them** — never use the same shape on consecutive slides.

#### Shape 1: Large "P" Curve (Title Slide)

Same gradient-filled PALO IT "P" letterform, positioned in the top-right extending to bottom-right.

```html
<svg class="deco-shape deco-p-curve" viewBox="0 0 948 1354" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="pGrad" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#60A5FA"/>
            <stop offset="25%" stop-color="#818CF8"/>
            <stop offset="50%" stop-color="#A855F7"/>
            <stop offset="75%" stop-color="#D946EF"/>
            <stop offset="100%" stop-color="#EC4899"/>
        </linearGradient>
    </defs>
    <path d="M474.143 0 101.721 0C45.6705 0 0.138396 45.5254 0.138396 101.567 0.138396 152.351 37.3668 194.417 86.082 201.889 91.2027 202.719 96.4617 202.996 101.859 202.996L474.281 202.996C623.887 202.996 745.121 324.351 745.121 473.796 745.121 623.241 623.887 744.596 474.281 744.596L101.721 744.596C96.3233 744.596 91.0643 745.011 85.9436 745.842 37.3668 753.452 0 795.38 0 846.164L0 1252.43C0 1308.47 45.5321 1354 101.582 1354 157.633 1354 203.165 1308.47 203.165 1252.43L203.165 947.731 474.005 947.731C735.849 947.731 948.009 735.602 948.009 473.796 948.009 211.991 735.987 0 474.143 0Z" fill="url(#pGrad)"/>
</svg>
```

```css
.deco-shape {
    position: absolute;
    z-index: 0;
    pointer-events: none;
}

.deco-p-curve {
    top: -5%;
    right: -8%;
    width: 55%;
    height: 110%;
}
```

#### Shape 2: Gradient Circle/Arc (Top-Right)

Large filled circle positioned so only the bottom-left quadrant is visible in the top-right corner.

```css
.deco-circle-tr {
    top: -30%;
    right: -15%;
    width: 50vw;
    height: 50vw;
    border-radius: 50%;
    background: var(--gene2-gradient);
}
```

#### Shape 3: Gradient Ring/Arc (Top-Right)

Thick arc (ring segment) in the top-right — circle with a white inner cutout.

```css
.deco-ring-tr {
    top: -25%;
    right: -15%;
    width: 45vw;
    height: 45vw;
    border-radius: 50%;
    background: var(--gene2-gradient);
}

.deco-ring-tr::after {
    content: '';
    position: absolute;
    top: 15%;
    left: 15%;
    width: 70%;
    height: 70%;
    border-radius: 50%;
    background: var(--gene2-white);  /* White cutout instead of black */
}
```

#### Shape 4: Gradient Chevron (Bottom-Right)

V-shaped gradient element in the bottom-right corner. Identical to Dark Theme.

```css
.deco-chevron-br {
    bottom: -5%;
    right: -5%;
    width: 35%;
    height: 50%;
}
```

#### Shape 5: Vertical Gradient Line (Centre Divider)

Thin vertical line with gradient, for two-column layouts.

```css
.deco-vline {
    top: 15%;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 70%;
    background: var(--gene2-gradient-vertical);
    border-radius: 2px;
}
```

#### Shape 6: L-Shaped Gradient Border

Horizontal + vertical lines forming an L/frame shape. Identical to Dark Theme but uses a solid purple instead of gradient (as seen in the PowerPoint).

```css
.deco-l-border {
    top: 20%;
    left: 0;
    right: 10%;
    bottom: 15%;
    border-top: 4px solid var(--grad-purple);
    border-right: 4px solid var(--grad-purple);
    border-bottom: 4px solid var(--grad-purple);
    background: transparent;
}
```

#### Shape 7: Gradient Panel (Right Side)

Full-height gradient panel covering ~35% of the right side.

```css
.deco-panel-right {
    top: 0;
    right: 0;
    width: 35%;
    height: 100%;
    background: var(--gene2-gradient);
}
```

#### Shape 8: Gradient Band (Bottom)

Gradient band across the bottom ~25% of the slide.

```css
.deco-band-bottom {
    bottom: 0;
    left: 0;
    right: 0;
    height: 25%;
    background: var(--gene2-gradient-horizontal);
}
```

#### Shape 9: Image + Gradient Overlay (Right Side)

A photo covering the right ~50% of the slide with gradient shapes overlaid on top. Used for section dividers with imagery.

```css
.deco-image-right {
    top: 0;
    right: 0;
    width: 50%;
    height: 100%;
    overflow: hidden;
}

.deco-image-right img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Gradient shapes overlaid on the image */
.deco-image-right .overlay-shape {
    position: absolute;
    z-index: 1;
}
```

#### Shape 10: No Shape (Clean White)

Some slides use no decorative shape — just pure white with content. Good for text-heavy slides or card layouts.

### Shape Selection Guide

| Slide Type | Recommended Shape(s) |
|-----------|----------------------|
| Title slide | Shape 1 (P Curve) |
| Section header | Shape 2 (Circle) or Shape 3 (Ring) |
| Content — single column | Shape 4 (Chevron) or Shape 10 (None) |
| Content — two column | Shape 5 (Vertical Line) |
| Content — framed | Shape 6 (L-Border) |
| Image + text split | Shape 7 (Panel) or Shape 9 (Image + Overlay) |
| Cards / feature grid | Shape 10 (None) — let the card borders carry the visual |
| Chart / data slide | Shape 10 (None) |
| Big number / Impact | Shape 3 (Ring) or Shape 10 (None) |
| The Ask / Conclusion | Shape 8 (Band) or Shape 1 (P Curve) |
| Closing | Shape 1 (P Curve — large, centred) |

---

## Card Styling (Light Theme Specific)

The Light Theme features distinctive card designs with **individually-coloured borders** from the gradient palette. Cards have a white background and thin coloured border.

### Three Cards with Gradient-Sequenced Borders

```html
<div class="card-grid reveal">
    <div class="card card-blue">
        <div class="card-icon"><!-- icon --></div>
        <h3 class="card-title">Card heading goes here</h3>
        <p class="card-body">Card copy goes here.</p>
    </div>
    <div class="card card-purple">
        <div class="card-icon"><!-- icon --></div>
        <h3 class="card-title">Card heading goes here</h3>
        <p class="card-body">Card copy goes here.</p>
    </div>
    <div class="card card-magenta">
        <div class="card-icon"><!-- icon --></div>
        <h3 class="card-title">Card heading goes here</h3>
        <p class="card-body">Card copy goes here.</p>
    </div>
</div>
```

```css
/* ── Base card ── */
.card {
    background: var(--gene2-white);
    border: 2px solid var(--grad-purple);
    border-radius: 8px;
    padding: clamp(1.5rem, 3vw, 2.5rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
}

/* ── Colour variants ── */
.card-blue { border-color: var(--grad-blue); }
.card-purple { border-color: var(--grad-purple); }
.card-magenta { border-color: var(--grad-magenta); }

/* ── All-purple variant (alternate card style) ── */
.card-uniform {
    border-color: rgba(168, 85, 247, 0.3);
}
```

### Card Icons

The Light Theme uses outlined/line-style icons (not filled). Icons are dark (`#1A1A1A`) to match the text.

```css
.card-icon {
    width: 48px;
    height: 48px;
    color: var(--gene2-dark);
    margin-bottom: 0.5rem;
}

.card-icon svg {
    width: 100%;
    height: 100%;
    stroke: currentColor;
    fill: none;
    stroke-width: 1.5;
}
```

---

## Chart / Data Visualisation Colours

When creating charts or data visualisations, use the gradient palette colours:

| Series | Colour | Hex |
|--------|--------|-----|
| Series 1 | Blue | `#60A5FA` |
| Series 2 | Purple | `#A855F7` |
| Series 3 | Magenta | `#EC4899` |
| Series 4 (if needed) | Indigo | `#818CF8` |
| Series 5 (if needed) | Fuchsia | `#D946EF` |

Grid lines should be `rgba(26,26,26,0.1)`, axis text `rgba(26,26,26,0.7)`.

---

## Slide Layout Examples

### 1. Title Slide

```html
<section class="slide slide-light slide-title" data-notes="Welcome." data-duration="1min">
    <!-- Decorative P curve -->
    <svg class="deco-shape deco-p-curve" viewBox="0 0 948 1354" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="pGrad" x1="0%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#60A5FA"/>
                <stop offset="25%" stop-color="#818CF8"/>
                <stop offset="50%" stop-color="#A855F7"/>
                <stop offset="75%" stop-color="#D946EF"/>
                <stop offset="100%" stop-color="#EC4899"/>
            </linearGradient>
        </defs>
        <path d="M474.143 0 101.721 0C45.6705 0 0.138396 45.5254 0.138396 101.567 0.138396 152.351 37.3668 194.417 86.082 201.889 91.2027 202.719 96.4617 202.996 101.859 202.996L474.281 202.996C623.887 202.996 745.121 324.351 745.121 473.796 745.121 623.241 623.887 744.596 474.281 744.596L101.721 744.596C96.3233 744.596 91.0643 745.011 85.9436 745.842 37.3668 753.452 0 795.38 0 846.164L0 1252.43C0 1308.47 45.5321 1354 101.582 1354 157.633 1354 203.165 1308.47 203.165 1252.43L203.165 947.731 474.005 947.731C735.849 947.731 948.009 735.602 948.009 473.796 948.009 211.991 735.987 0 474.143 0Z" fill="url(#pGrad)"/>
    </svg>

    <div class="slide-content" style="z-index: 1; position: relative;">
        <h1 class="title-main reveal">Gen-<span class="gradient-text">e2</span><sup style="font-size:0.4em; opacity:0.6;">&trade;</sup></h1>
        <div class="title-line reveal"></div>
        <p class="reveal body-text" style="color: rgba(26,26,26,0.6); margin-top: 1.5rem; max-width: 500px;">
            Presentation subtitle goes here
        </p>
    </div>

    <div class="title-brand">
        <div class="title-palo-logo">PALO<span class="brand-it">IT</span></div>
        <div class="title-underline"></div>
        <div class="title-tagline">Crafting tech as<br>a force for good.</div>
    </div>
</section>
```

**Title-specific CSS:**

```css
.title-main {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: clamp(3rem, 8vw, 6rem);
    color: var(--gene2-dark);
    margin: 0;
}

.title-line {
    width: min(500px, 40vw);
    height: 4px;
    background: var(--grad-magenta);
    margin-top: 0.5rem;
}
```

### 2. Content Slide — Single Column

```html
<section class="slide slide-light" data-notes="Key content." data-duration="2min">
    <div class="deco-shape deco-circle-tr"></div>

    <div class="slide-content" style="z-index: 1; position: relative;">
        <p class="main-heading reveal">MARKET ANALYSIS</p>
        <h2 class="sub-heading reveal">Addressable market has doubled; we hold just 6%</h2>
        <div class="body-content reveal">
            <p class="body-text">Supporting explanation goes here. Keep it concise.</p>
        </div>
    </div>

    <div class="slide-brand">
        <div class="brand-palo">PALO<span class="brand-it">IT</span></div>
        <div class="brand-gene2">Gen-<span class="gradient-text">e2</span><sup class="brand-tm">&trade;</sup></div>
    </div>
</section>
```

### 3. Content Slide — Three Cards with Coloured Borders

```html
<section class="slide slide-light" data-notes="Three pillars." data-duration="2min">
    <div class="slide-content" style="z-index: 1; position: relative;">
        <p class="main-heading reveal">STRATEGIC PILLARS</p>
        <h2 class="sub-heading reveal">Three focus areas to drive growth</h2>
        <div class="card-grid reveal">
            <div class="card card-blue">
                <div class="card-icon"><!-- SVG icon --></div>
                <h3 class="card-title">Pillar One</h3>
                <p class="card-body">Brief description of this strategic pillar.</p>
            </div>
            <div class="card card-purple">
                <div class="card-icon"><!-- SVG icon --></div>
                <h3 class="card-title">Pillar Two</h3>
                <p class="card-body">Brief description of this strategic pillar.</p>
            </div>
            <div class="card card-magenta">
                <div class="card-icon"><!-- SVG icon --></div>
                <h3 class="card-title">Pillar Three</h3>
                <p class="card-body">Brief description of this strategic pillar.</p>
            </div>
        </div>
    </div>

    <div class="slide-brand">
        <div class="brand-palo">PALO<span class="brand-it">IT</span></div>
        <div class="brand-gene2">Gen-<span class="gradient-text">e2</span><sup class="brand-tm">&trade;</sup></div>
    </div>
</section>
```

### 4. Content Slide — Two Columns (with vertical divider)

```html
<section class="slide slide-light" data-notes="Comparison." data-duration="2min">
    <div class="deco-shape deco-vline"></div>

    <div class="slide-content" style="z-index: 1; position: relative;">
        <p class="main-heading reveal">COMPARISON</p>
        <h2 class="sub-heading reveal">Option A costs less but Option B scales further</h2>
        <div class="two-column reveal">
            <div class="column">
                <h3 class="card-title">Option A</h3>
                <p class="body-text">Description of first option.</p>
            </div>
            <div class="column">
                <h3 class="card-title">Option B</h3>
                <p class="body-text">Description of second option.</p>
            </div>
        </div>
    </div>

    <div class="slide-brand">
        <div class="brand-palo">PALO<span class="brand-it">IT</span></div>
        <div class="brand-gene2">Gen-<span class="gradient-text">e2</span><sup class="brand-tm">&trade;</sup></div>
    </div>
</section>
```

### 5. Big Number Slide

```html
<section class="slide slide-light" data-notes="Impact stat." data-duration="1.5min">
    <div class="deco-shape deco-ring-tr"></div>

    <div class="slide-content" style="z-index: 1; position: relative; text-align: center; align-items: center;">
        <p class="main-heading reveal">IMPACT</p>
        <div class="big-number gradient-text reveal">$40M</div>
        <h2 class="sub-heading reveal" style="font-size: var(--h3-size);">
            Revenue at risk if we don't act by Q2
        </h2>
    </div>

    <div class="slide-brand">
        <div class="brand-palo">PALO<span class="brand-it">IT</span></div>
        <div class="brand-gene2">Gen-<span class="gradient-text">e2</span><sup class="brand-tm">&trade;</sup></div>
    </div>
</section>
```

### 6. The Ask Slide (always last content slide)

```html
<section class="slide slide-light" data-notes="The decision we need." data-duration="2min">
    <div class="deco-shape deco-band-bottom"></div>

    <div class="slide-content" style="z-index: 1; position: relative; justify-content: center; text-align: center; align-items: center;">
        <p class="main-heading reveal gradient-text">THE ASK</p>
        <h2 class="sub-heading reveal" style="max-width: 700px;">
            We need board approval for $2M investment by end of month
        </h2>
        <p class="reveal body-text" style="color: rgba(26,26,26,0.5); max-width: 500px; margin-top: 1rem;">
            This enables us to launch Phase 1 in Q1 and capture the market window.
        </p>
    </div>

    <div class="slide-brand">
        <div class="brand-palo">PALO<span class="brand-it">IT</span></div>
        <div class="brand-gene2">Gen-<span class="gradient-text">e2</span><sup class="brand-tm">&trade;</sup></div>
    </div>
</section>
```

### 7. Closing Slide

```html
<section class="slide slide-light slide-closing" data-notes="Thank you." data-duration="0min">
    <svg class="deco-p-closing" viewBox="0 0 948 1354" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="pGradClose" x1="0%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#60A5FA"/>
                <stop offset="25%" stop-color="#818CF8"/>
                <stop offset="50%" stop-color="#A855F7"/>
                <stop offset="75%" stop-color="#D946EF"/>
                <stop offset="100%" stop-color="#EC4899"/>
            </linearGradient>
        </defs>
        <path d="M474.143 0 101.721 0C45.6705 0 0.138396 45.5254 0.138396 101.567 0.138396 152.351 37.3668 194.417 86.082 201.889 91.2027 202.719 96.4617 202.996 101.859 202.996L474.281 202.996C623.887 202.996 745.121 324.351 745.121 473.796 745.121 623.241 623.887 744.596 474.281 744.596L101.721 744.596C96.3233 744.596 91.0643 745.011 85.9436 745.842 37.3668 753.452 0 795.38 0 846.164L0 1252.43C0 1308.47 45.5321 1354 101.582 1354 157.633 1354 203.165 1308.47 203.165 1252.43L203.165 947.731 474.005 947.731C735.849 947.731 948.009 735.602 948.009 473.796 948.009 211.991 735.987 0 474.143 0Z" fill="url(#pGradClose)"/>
    </svg>

    <div class="slide-content" style="z-index: 1; position: relative; justify-content: center; align-items: center; text-align: center;">
        <div style="font-family: var(--font-heading); font-weight: 700; font-size: clamp(2rem, 5vw, 4rem); color: var(--gene2-dark);">
            PALO<span style="font-weight: 400; vertical-align: super; font-size: 0.6em;">IT</span>
        </div>
        <div style="font-family: var(--font-heading); font-weight: 700; font-size: clamp(1.5rem, 4vw, 3rem); margin-top: 0.5rem;">
            Gen-<span class="gradient-text">e2</span><sup style="font-size:0.4em; opacity:0.6;">&trade;</sup>
        </div>
    </div>
</section>
```

```css
.deco-p-closing {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70vmin;
    height: auto;
    z-index: 0;
    pointer-events: none;
}
```

---

## Layout CSS Reference (Gen-e2 Light Theme overrides)

```css
/* ── ALL SLIDES ARE LIGHT ─────────── */
.slide-light {
    background: var(--gene2-white);
    color: var(--gene2-dark);
}

/* ── CARDS (light theme — coloured borders) ── */
.card {
    background: var(--gene2-white);
    border: 2px solid var(--grad-purple);
    border-radius: 8px;
    padding: clamp(1.5rem, 3vw, 2.5rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
}

.card-blue { border-color: var(--grad-blue); }
.card-purple { border-color: var(--grad-purple); }
.card-magenta { border-color: var(--grad-magenta); }

/* ── TWO COLUMN (light theme) ─────── */
.column {
    padding: clamp(1rem, 2vw, 1.5rem);
    background: var(--gene2-white);
    border-radius: 12px;
    border-left: 3px solid var(--grad-purple);
    box-shadow: var(--card-shadow);
}

/* ── TOC ITEMS (light theme) ──────── */
.toc-item {
    border-bottom: 1px solid rgba(168, 85, 247, 0.15);
}

.toc-number {
    color: var(--grad-purple);
}

/* ── BULLET LISTS (light theme) ───── */
.slide-list li::before {
    background: var(--grad-purple);
}

/* ── FOOTER ──────────────────────── */
.slide-footer {
    position: absolute;
    bottom: 0.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--font-body);
    font-size: clamp(0.45rem, 0.7vw, 0.6rem);
    color: var(--gene2-muted);
    z-index: 10;
    white-space: nowrap;
}

/* ── NAV BUTTONS (dark on light) ─── */
.nav-btn {
    color: var(--gene2-dark);
    border-color: rgba(0,0,0,0.15);
    background: rgba(0,0,0,0.05);
}

.nav-btn:hover {
    background: rgba(0,0,0,0.1);
}

/* ── PROGRESS BAR (gradient) ─────── */
.progress-bar {
    background: var(--gene2-gradient-horizontal);
}
```

---

## Do's and Don'ts

### Do:
- Use pure white (`#FFFFFF`) for ALL slide backgrounds
- Use dark text (`#1A1A1A`) for all headings and body copy
- Use the blue-purple-magenta gradient for decorative shapes and accent elements (same as Dark Theme)
- Vary the decorative shape on each slide — never repeat the same shape consecutively
- Use gradient text effect for main headings, big numbers, and "e2" branding
- Use the PALO IT + Gen-e2 lockup in the bottom-left of every content slide (in dark colours)
- Use **individually-coloured card borders** (blue → purple → magenta) for 3-card layouts
- Use outlined/line-style icons in cards (not filled)
- Keep decorative shapes as background elements (`z-index: 0`)

### Don't:
- Don't use any dark/black slide backgrounds — this is an all-light theme
- Don't use PALO IT green (`#008F68`) — this theme uses the purple gradient palette
- Don't use solid-fill icons — the Light Theme favours outlined icon style
- Don't place decorative shapes over content areas
- Don't use more than one decorative shape per slide
- Don't skip the PALO IT / Gen-e2 branding lockup on content slides
- Don't use grey text for primary content — keep body text at full `#1A1A1A` darkness

---

## Confidentiality Footer (Optional)

Same as Dark Theme:

```
CONFIDENTIAL - This document contains sensitive business information. Copyright © 2025 PALO IT and/or its affiliates. All rights reserved
```

Can be included as a `.slide-footer` element. Omit by default for cleaner slides.
