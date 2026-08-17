# Gen-e2 Dark Theme Template Reference

This document defines the complete visual specification for the **Gen-e2 Dark Theme** HTML presentation template, derived from the official "Master Slides_Gen-e2_Dark Theme.pptx" brand deck.

## Table of Contents

- [Overview](#overview)
- [Brand Colour Palette](#brand-colour-palette)
- [Typography](#typography)
- [Logo & Branding](#logo--branding)
- [Decorative Gradient Shapes](#decorative-gradient-shapes)
- [Slide Layout Examples](#slide-layout-examples)
- [Layout CSS Reference (Gen-e2 Dark Theme overrides)](#layout-css-reference-gen-e2-dark-theme-overrides)
- [Do's and Don'ts](#dos-and-donts)
- [Confidentiality Footer (Optional)](#confidentiality-footer-optional)

---

## Overview

The Gen-e2 Dark Theme is a premium, dark-mode presentation style built around PALO IT's Gen-e2 product branding. It features a pure black background with bold blue-to-purple-to-magenta gradient accent shapes that vary across slide types. The look is modern, tech-forward, and high-contrast.

---

## Brand Colour Palette

### Core Colours

| Name | Hex | Usage |
|------|-----|-------|
| Black (Background) | `#000000` | All slide backgrounds — pure black, no dark grey |
| White (Text) | `#FFFFFF` | Primary text colour on all slides |
| Muted White | `rgba(255,255,255,0.5)` | Footer text, captions, secondary info |

### Gradient Colours (the signature accent)

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
| Gradient Purple (primary accent) | `#A855F7` | Main heading labels, accent text, card borders |
| Gradient Blue | `#60A5FA` | Data visualisation, info callouts |
| Gradient Magenta | `#D946EF` | Highlights, CTAs, emphasis |
| Soft Purple | `rgba(168,85,247,0.15)` | Card backgrounds, subtle fills |
| Soft Blue | `rgba(96,165,250,0.1)` | Alternate card backgrounds |

### CSS Variables

```css
:root {
    /* ── Core palette ── */
    --gene2-black: #000000;
    --gene2-white: #FFFFFF;
    --gene2-muted: rgba(255,255,255,0.5);

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
    --bg-dark: var(--gene2-black);
    --bg-light: var(--gene2-black);  /* ALL slides are dark in this theme */
    --bg-subtle: rgba(168,85,247,0.08);
    --text-on-dark: var(--gene2-white);
    --text-on-light: var(--gene2-white);
    --brand-accent: var(--grad-purple);

    /* ── Card / surface colours ── */
    --card-bg: rgba(255,255,255,0.05);
    --card-border: rgba(168,85,247,0.3);
    --card-bg-hover: rgba(168,85,247,0.1);
}
```

### Colour Application Rules

- **ALL slides use black background** (`#000000`) — there are no "light" slides in this theme
- **Text is always white** — full white for headings and body, 50% opacity for footers/captions
- **Gradient shapes are decorative only** — they sit behind content and vary by slide type
- **Main heading labels**: use `--grad-purple` (#A855F7) or a gradient text effect
- **Cards**: use `--card-bg` (subtle white) with `--card-border` (purple glow)
- **Never use**: green, the PALO IT green palette, or any non-gradient accent colours from the standard template

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
| Sub-heading (insight) | Montserrat | 700 | `clamp(1.25rem, 3.5vw, 2.5rem)` | `--gene2-white` |
| Body text | Open Sans | 400 | `clamp(0.75rem, 1.5vw, 1.125rem)` | `--gene2-white` |
| Small / caption | Open Sans | 400 | `clamp(0.65rem, 1vw, 0.875rem)` | `--gene2-muted` |
| Big number | Montserrat | 800 | `clamp(3rem, 10vw, 8rem)` | Gradient text effect |
| Card title | Montserrat | 600 | `clamp(0.85rem, 1.5vw, 1.1rem)` | `--gene2-white` |
| Card body | Open Sans | 400 | `clamp(0.7rem, 1.2vw, 0.95rem)` | `rgba(255,255,255,0.7)` |
| Navigation / UI | Open Sans | 500 | `0.8rem` | `rgba(255,255,255,0.5)` |
| Footer | Open Sans | 400 | `clamp(0.5rem, 0.8vw, 0.7rem)` | `--gene2-muted` |

### Gradient Text Effect

For main headings, big numbers, and the "e2" in "Gen-e2", apply the gradient as text colour:

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
    color: var(--gene2-white);
    margin-bottom: var(--content-gap);
}
```

---

## Logo & Branding

> **MANDATORY:** The brand lockup must appear on every slide — content slides AND the title slide. Never omit it. Use `slide-brand` on content slides and `title-brand` on the title slide.
>
> **Overlap prevention:** Always set `padding-bottom: var(--logo-safe-bottom)` (5rem) on `.slide-content` for content slides, and `padding-bottom: var(--title-brand-safe-bottom)` (9rem) on `.slide-title .slide-content`. The `slide-brand` element is ~3.7rem tall from the bottom; `title-brand` is ~8rem tall. Never rely on the default `--slide-padding` alone for bottom clearance.

### Content Slides — Gen-e2 Lockup (bottom-left)

On content slides, the bottom-left corner shows only the **Gen-e2 logo**: "Gen-" in white with "e2" rendered in the blue-purple-magenta gradient, with a "TM" superscript. **Do not add a PALO IT line — one logo per slide.**

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
    color: var(--gene2-white);
}

.brand-tm {
    font-size: 0.5em;
    opacity: 0.5;
}
```

### Title Slide — Full Branding

The title slide uses a larger **Gen-e2 logo** at bottom-left with the tagline "Crafting tech as a force for good." and a magenta underline. **Do not use a PALO IT text or wordmark here.** The "Gen-e2" text uses the signature gradient.

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
    color: var(--gene2-white);
    line-height: 1.4;
}
```

### Closing Slide — Centred Large Branding

The final slide features a large PALO IT "P" shape filled with the gradient, with "PALO IT" and "Gen-e2" centred inside it. This is purely decorative and used as a closing slide.

### Available Image Assets

All logo images for the Gen-e2 Dark template are located in `reference/assets/Gen-e2 Dark/`. These images are colour-matched to the pure black background of this theme.

| File | Description | Use |
|------|-------------|-----|
| `palo-it-logo.png` | Standard PALO IT wordmark (light/white version) | Title slide, closing slide |
| `palo-it-logo-large.png` | High-resolution wordmark (light/white version) | Large-format or retina displays |
| `palo-it-p-icon.png` | Raster "P" icon (light/white version) | When inline SVG is not suitable |
| `palo-it-p-icon.svg` | Vector "P" icon (light/white version) | Preferred over inline SVG for maintainability |

When using image files instead of the CSS text-based lockup, reference them like this:

```html
<!-- Title slide — full wordmark -->
<img src="reference/assets/Gen-e2 Dark/palo-it-logo.png" alt="PALO IT" class="title-wordmark">

<!-- Content slides — P icon -->
<img src="reference/assets/Gen-e2 Dark/palo-it-p-icon.svg" alt="" class="slide-logo-img">
```

> **Important:** Always use images from `reference/assets/Gen-e2 Dark/` for this template. Do not use images from the Palo IT or Gen-e2 Light asset folders — those images have different background colours that do not match this pure black theme.

---

## Decorative Gradient Shapes

The Gen-e2 Dark Theme uses **varied gradient shapes** on different slides. These are purely decorative background elements positioned with `position: absolute` and `z-index: 0`. Content sits on top at `z-index: 1`.

### Shape Catalogue

Each content slide should use ONE of these shapes. **Vary them** — never use the same shape on consecutive slides.

#### Shape 1: Large "P" Curve (Title Slide)

A large PALO IT "P" letterform with gradient fill, positioned in the top-right extending to bottom-right. Used on the title and closing slides.

```css
.shape-p-curve {
    position: absolute;
    top: -5%;
    right: -5%;
    width: 55%;
    height: 110%;
    z-index: 0;
    overflow: hidden;
}

.shape-p-curve::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: var(--gene2-gradient);
    mask-image: url("data:image/svg+xml,..."); /* P shape SVG as mask */
    -webkit-mask-image: url("data:image/svg+xml,...");
    mask-size: contain;
    -webkit-mask-size: contain;
    mask-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
}
```

**Implementation note:** Because CSS masks with complex SVG paths are unreliable across browsers, use an inline SVG with gradient fill instead:

```html
<svg class="deco-shape deco-p-curve" viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="gene2grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#60A5FA"/>
            <stop offset="25%" stop-color="#818CF8"/>
            <stop offset="50%" stop-color="#A855F7"/>
            <stop offset="75%" stop-color="#D946EF"/>
            <stop offset="100%" stop-color="#EC4899"/>
        </linearGradient>
    </defs>
    <path d="M300 0H60C27 0 0 27 0 60v0c0 30 22 55 51 60h250c89 0 161 72 161 161s-72 161-161 161H60c-3 0-6 0-9 1-28 5-51 30-51 60v242c0 33 27 60 60 60s60-27 60-60V562h181c156 0 282-126 282-282S456 0 300 0Z" fill="url(#gene2grad)"/>
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

A large filled circle positioned so only the bottom-left quadrant is visible in the top-right corner.

```html
<div class="deco-shape deco-circle-tr"></div>
```

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

A thick arc (ring segment) in the top-right corner — circle with a black inner cutout.

```html
<div class="deco-shape deco-ring-tr"></div>
```

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
    background: var(--gene2-black);
}
```

#### Shape 4: Gradient Chevron (Bottom-Right)

A V-shaped or chevron/arrow gradient element in the bottom-right corner.

```html
<svg class="deco-shape deco-chevron-br" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="chevronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#A855F7"/>
            <stop offset="50%" stop-color="#D946EF"/>
            <stop offset="100%" stop-color="#EC4899"/>
        </linearGradient>
    </defs>
    <path d="M400 100 L200 300 L400 300 L400 100 Z M300 0 L100 200 L100 0 Z" fill="url(#chevronGrad)" opacity="0.9"/>
</svg>
```

```css
.deco-chevron-br {
    bottom: -5%;
    right: -5%;
    width: 35%;
    height: 50%;
}
```

#### Shape 5: Vertical Gradient Line (Centre Divider)

A thin vertical line with the gradient, used to visually divide two-column layouts.

```html
<div class="deco-shape deco-vline"></div>
```

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

Horizontal line from left + vertical line down, forming an L or frame shape.

```html
<div class="deco-shape deco-l-border"></div>
```

```css
.deco-l-border {
    top: 20%;
    left: 0;
    right: 10%;
    bottom: 15%;
    border-top: 4px solid;
    border-right: 4px solid;
    border-image: var(--gene2-gradient-horizontal) 1;
    background: transparent;
}
```

#### Shape 7: Gradient Panel (Right Side)

A full-height gradient panel covering ~35% of the right side. Used for image/content split layouts.

```html
<div class="deco-shape deco-panel-right"></div>
```

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

A gradient band across the bottom ~30% of the slide.

```html
<div class="deco-shape deco-band-bottom"></div>
```

```css
.deco-band-bottom {
    bottom: 0;
    left: 0;
    right: 0;
    height: 30%;
    background: var(--gene2-gradient-horizontal);
}
```

#### Shape 9: No Shape (Clean Black)

Some slides use no decorative shape at all — just pure black with content. Use this for text-heavy slides or when the content itself is the visual.

### Shape Selection Guide

| Slide Type | Recommended Shape(s) |
|-----------|----------------------|
| Title slide | Shape 1 (P Curve) |
| Section header | Shape 2 (Circle) or Shape 3 (Ring) |
| Content — single column | Shape 4 (Chevron) or Shape 9 (None) |
| Content — two column | Shape 5 (Vertical Line) |
| Content — framed | Shape 6 (L-Border) |
| Image + text split | Shape 7 (Panel) |
| Big number / Impact | Shape 3 (Ring) or Shape 9 (None) |
| The Ask / Conclusion | Shape 8 (Band) or Shape 1 (P Curve) |
| Closing | Shape 1 (P Curve — large, centred) |

---

## Slide Layout Examples

### 1. Title Slide

```html
<section class="slide slide-dark slide-title" data-notes="Welcome." data-duration="1min">
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
        <!-- Subtitle / presentation title goes below the line -->
        <p class="reveal body-text" style="color: rgba(255,255,255,0.7); margin-top: 1.5rem; max-width: 500px;">
            Presentation subtitle goes here
        </p>
    </div>

    <!-- Gen-e2 branding bottom-left (Gen-e2 logo only — no PALO IT text) -->
    <div class="title-brand">
        <div class="title-gene2">Gen-<span class="gradient-text">e2</span><sup style="font-size:0.4em; opacity:0.6;">&trade;</sup></div>
        <div class="title-underline"></div>
        <div class="title-tagline">Crafting tech as<br>a force for good.</div>
    </div>
</section>
```

**Key rules:**
- Background: pure black `#000000`
- "Gen-e2" title with "e2" in gradient text, very large
- Horizontal magenta/pink accent line below the title
- Large "P" curve gradient shape on the right side
- Gen-e2 gradient logo + tagline at bottom-left (no PALO IT text)

**Title-specific CSS:**

```css
.title-main {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: clamp(3rem, 8vw, 6rem);
    color: var(--gene2-white);
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
<section class="slide slide-dark" data-notes="Key content." data-duration="2min">
    <div class="deco-shape deco-circle-tr"></div>

    <div class="slide-content" style="z-index: 1; position: relative;">
        <p class="main-heading reveal">MARKET ANALYSIS</p>
        <h2 class="sub-heading reveal">Addressable market has doubled; we hold just 6%</h2>
        <div class="body-content reveal">
            <p class="body-text" style="color: rgba(255,255,255,0.8);">
                Supporting explanation goes here. Keep it concise.
            </p>
        </div>
    </div>

    <div class="slide-brand">
        <div class="brand-palo">PALO<span class="brand-it">IT</span></div>
        <div class="brand-gene2">Gen-<span class="gradient-text">e2</span><sup class="brand-tm">&trade;</sup></div>
    </div>
</section>
```

### 3. Content Slide — Two Columns (with vertical divider)

```html
<section class="slide slide-dark" data-notes="Comparison." data-duration="2min">
    <div class="deco-shape deco-vline"></div>

    <div class="slide-content" style="z-index: 1; position: relative;">
        <p class="main-heading reveal">COMPARISON</p>
        <h2 class="sub-heading reveal">Option A costs less but Option B scales further</h2>
        <div class="two-column reveal">
            <div class="column">
                <h3 class="card-title">Option A</h3>
                <p class="body-text" style="color: rgba(255,255,255,0.7);">Description of first option.</p>
            </div>
            <div class="column">
                <h3 class="card-title">Option B</h3>
                <p class="body-text" style="color: rgba(255,255,255,0.7);">Description of second option.</p>
            </div>
        </div>
    </div>

    <div class="slide-brand">
        <div class="brand-palo">PALO<span class="brand-it">IT</span></div>
        <div class="brand-gene2">Gen-<span class="gradient-text">e2</span><sup class="brand-tm">&trade;</sup></div>
    </div>
</section>
```

### 4. Three Cards / Pillars

```html
<section class="slide slide-dark" data-notes="Three pillars." data-duration="2min">
    <div class="slide-content" style="z-index: 1; position: relative;">
        <p class="main-heading reveal">STRATEGIC PILLARS</p>
        <h2 class="sub-heading reveal">Three focus areas to drive growth</h2>
        <div class="card-grid reveal">
            <div class="card">
                <div class="card-icon gradient-text">01</div>
                <h3 class="card-title">Pillar One</h3>
                <p class="card-body">Brief description of this strategic pillar.</p>
            </div>
            <div class="card">
                <div class="card-icon gradient-text">02</div>
                <h3 class="card-title">Pillar Two</h3>
                <p class="card-body">Brief description of this strategic pillar.</p>
            </div>
            <div class="card">
                <div class="card-icon gradient-text">03</div>
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

### 5. Big Number Slide

```html
<section class="slide slide-dark" data-notes="Impact stat." data-duration="1.5min">
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

### 6. Section Header Slide

```html
<section class="slide slide-dark" data-notes="New section." data-duration="0.5min">
    <div class="deco-shape deco-circle-tr"></div>

    <div class="slide-content" style="z-index: 1; position: relative; justify-content: center;">
        <p class="main-heading reveal" style="color: var(--grad-fuchsia);">SECTION 01</p>
        <h2 class="sub-heading reveal" style="font-size: var(--title-size);">
            Section title goes here
        </h2>
        <p class="reveal body-text" style="color: rgba(255,255,255,0.5); max-width: 600px;">
            Brief section description
        </p>
    </div>

    <div class="slide-brand">
        <div class="brand-palo">PALO<span class="brand-it">IT</span></div>
        <div class="brand-gene2">Gen-<span class="gradient-text">e2</span><sup class="brand-tm">&trade;</sup></div>
    </div>
</section>
```

### 7. The Ask Slide (always last content slide)

```html
<section class="slide slide-dark" data-notes="The decision we need." data-duration="2min">
    <div class="deco-shape deco-band-bottom"></div>

    <div class="slide-content" style="z-index: 1; position: relative; justify-content: center; text-align: center; align-items: center;">
        <p class="main-heading reveal gradient-text">THE ASK</p>
        <h2 class="sub-heading reveal" style="max-width: 700px;">
            We need board approval for $2M investment by end of month
        </h2>
        <p class="reveal body-text" style="color: rgba(255,255,255,0.5); max-width: 500px; margin-top: 1rem;">
            This enables us to launch Phase 1 in Q1 and capture the market window.
        </p>
    </div>

    <div class="slide-brand">
        <div class="brand-palo">PALO<span class="brand-it">IT</span></div>
        <div class="brand-gene2">Gen-<span class="gradient-text">e2</span><sup class="brand-tm">&trade;</sup></div>
    </div>
</section>
```

### 8. Closing Slide

```html
<section class="slide slide-dark slide-closing" data-notes="Thank you." data-duration="0min">
    <!-- Large centred P with gradient -->
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
        <div style="font-family: var(--font-heading); font-weight: 700; font-size: clamp(2rem, 5vw, 4rem); color: var(--gene2-white);">
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

## Layout CSS Reference (Gen-e2 Dark Theme overrides)

```css
/* ── ALL SLIDES ARE DARK ──────────── */
.slide-dark {
    background: var(--gene2-black);
    color: var(--gene2-white);
}

/* No slide-light or slide-green classes in this theme.
   Use slide-dark for everything. */

/* ── CARDS (dark theme) ─────────────── */
.card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: clamp(1rem, 2vw, 1.5rem);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

/* ── TWO COLUMN (dark theme) ────────── */
.column {
    padding: clamp(1rem, 2vw, 1.5rem);
    background: var(--card-bg);
    border-radius: 12px;
    border-left: 3px solid var(--grad-purple);
}

/* ── TOC ITEMS (dark theme) ─────────── */
.toc-item {
    border-bottom: 1px solid rgba(168, 85, 247, 0.2);
}

.toc-number {
    color: var(--grad-purple);
}

/* ── BULLET LISTS (dark theme) ──────── */
.slide-list li::before {
    background: var(--grad-purple);
}

/* ── FOOTER ─────────────────────────── */
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

/* ── NAV BUTTONS (always light on dark) ── */
.nav-btn {
    color: var(--gene2-white);
    border-color: rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.08);
}

.nav-btn:hover {
    background: rgba(255,255,255,0.15);
}

/* ── PROGRESS BAR (gradient) ────────── */
.progress-bar {
    background: var(--gene2-gradient-horizontal);
}
```

---

## Do's and Don'ts

### Do:
- Use pure black (`#000000`) for ALL slide backgrounds
- Use the blue-purple-magenta gradient for decorative shapes and accent elements
- Vary the decorative shape on each slide — never repeat the same shape consecutively
- Use gradient text effect for main headings, big numbers, and "e2" branding
- Use the PALO IT + Gen-e2 lockup in the bottom-left of every content slide
- Use `rgba(255,255,255,...)` at various opacities for text hierarchy
- Keep decorative shapes as background elements (`z-index: 0`)
- Use subtle card backgrounds (`rgba(255,255,255,0.05)`) with purple-tinted borders

### Don't:
- Don't use any light/white slide backgrounds — this is an all-dark theme
- Don't use PALO IT green (`#008F68`) — this theme replaces green with the purple gradient
- Don't use solid purple as the only accent — always use the full gradient range
- Don't place decorative shapes over content areas
- Don't use more than one decorative shape per slide
- Don't skip the PALO IT / Gen-e2 branding lockup on content slides
- Don't use low-contrast text — ensure all text is legible against pure black

---

## Confidentiality Footer (Optional)

The original deck includes a footer on most slides:

```
CONFIDENTIAL - This document contains sensitive business information. Copyright © 2025 PALO IT and/or its affiliates. All rights reserved
```

This can be included as a `.slide-footer` element if the user requests it. Omit by default for cleaner slides.
