# PALO IT Template Reference

This document defines the complete visual specification for the PALO IT HTML presentation template, derived from the official "Master Slides (English).pptx" brand deck.

## Table of Contents

- [Brand Colour Palette](#brand-colour-palette)
- [Typography](#typography)
- [PALO IT Logo](#palo-it-logo)
- [Slide Layout Examples](#slide-layout-examples)
- [Layout CSS Reference](#layout-css-reference)
- [Slide Background Classes](#slide-background-classes)
- [Do's and Don'ts](#dos-and-donts)

---

## Brand Colour Palette

### Primary Colours

| Name | Hex | Usage |
|------|-----|-------|
| PALO Green (Primary) | `#008F68` | Primary brand colour, section headers, logo, dark slide backgrounds |
| Dark | `#191919` | Title slide background, text on light slides, dark emphasis slides |
| White | `#FFFFFF` | Light slide backgrounds, text on dark slides |
| Light Mint | `#EFFEF9` | Subtle background tint, card backgrounds on white slides |

### Accent Colours

| Name | Hex | Usage |
|------|-----|-------|
| Green | `#00A378` | Accent highlights, active states, links |
| Bright Green | `#46C864` | Secondary accent, progress indicators |
| Blue | `#37B2EF` | Data visualisation, info callouts |
| Purple | `#5157DD` | Links, highlights, tertiary accent |
| Yellow | `#FFD23C` | Warnings, attention markers |
| Orange | `#FF9132` | Call-to-action, emphasis |
| Teal | `#15C4CD` | Supporting accent |

### CSS Variables

```css
:root {
    /* Core palette */
    --palo-green: #008F68;
    --palo-dark: #191919;
    --palo-white: #FFFFFF;
    --palo-mint: #EFFEF9;

    /* Accents */
    --accent-green: #00A378;
    --accent-bright-green: #46C864;
    --accent-blue: #37B2EF;
    --accent-purple: #5157DD;
    --accent-yellow: #FFD23C;
    --accent-orange: #FF9132;
    --accent-teal: #15C4CD;

    /* Semantic */
    --bg-dark: var(--palo-dark);
    --bg-light: var(--palo-white);
    --bg-subtle: var(--palo-mint);
    --text-on-dark: var(--palo-white);
    --text-on-light: var(--palo-dark);
    --brand-accent: var(--palo-green);
}
```

### Colour Application Rules

- **Title slide**: Dark background (`--palo-dark`) with white text and green accent
- **Content slides**: White background (`--palo-white`) with dark text
- **Section header slides**: PALO Green background (`--palo-green`) with white text
- **Ask / conclusion slide**: Dark background (`--palo-dark`) with white text and green accent
- **Cards on white slides**: Use `--palo-mint` as card background
- **Accent elements** (borders, underlines, icons): Use `--palo-green` or `--accent-green`
- **Never use**: beige, cream, or generic blue as primary colours

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
| Main heading (label) | Montserrat | 600 | `clamp(0.7rem, 1.2vw, 0.95rem)` | `--palo-green` on light, `--accent-green` on dark |
| Sub-heading (insight) | Montserrat | 700 | `clamp(1.25rem, 3.5vw, 2.5rem)` | `--text-on-light` or `--text-on-dark` |
| Body text | Open Sans | 400 | `clamp(0.75rem, 1.5vw, 1.125rem)` | Inherits from slide |
| Small / caption | Open Sans | 400 | `clamp(0.65rem, 1vw, 0.875rem)` | 60% opacity |
| Big number | Montserrat | 800 | `clamp(3rem, 10vw, 8rem)` | `--palo-green` |
| Card title | Montserrat | 600 | `clamp(0.85rem, 1.5vw, 1.1rem)` | Inherits from slide |
| Card body | Open Sans | 400 | `clamp(0.7rem, 1.2vw, 0.95rem)` | 80% opacity |
| Navigation / UI | Open Sans | 500 | `0.8rem` | 60% opacity |

### Main Heading Style

The main heading is the small label at the top of each slide. It identifies the section or category.

```css
.main-heading {
    font-family: var(--font-heading);
    font-weight: 600;
    font-size: var(--main-heading-size);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--palo-green);
    margin-bottom: 0.5rem;
}

/* On dark/green slides */
.slide-dark .main-heading,
.slide-green .main-heading {
    color: var(--accent-bright-green);
}
```

### Sub-Heading Style

The sub-heading is the large, prominent insight text. This is what the audience reads first.

```css
.sub-heading {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: var(--sub-heading-size);
    line-height: 1.2;
    margin-bottom: var(--content-gap);
}
```

---

## PALO IT Logo

### SVG Logo Mark (Green "P" Icon)

Use this inline SVG on every slide. Place it in the bottom-left corner.

```svg
<svg class="slide-logo" viewBox="0 0 948 1354" xmlns="http://www.w3.org/2000/svg" fill="none">
    <path d="M474.143 0 101.721 0C45.6705 0 0.138396 45.5254 0.138396 101.567 0.138396 152.351 37.3668 194.417 86.082 201.889 91.2027 202.719 96.4617 202.996 101.859 202.996L474.281 202.996C623.887 202.996 745.121 324.351 745.121 473.796 745.121 623.241 623.887 744.596 474.281 744.596L101.721 744.596C96.3233 744.596 91.0643 745.011 85.9436 745.842 37.3668 753.452 0 795.38 0 846.164L0 1252.43C0 1308.47 45.5321 1354 101.582 1354 157.633 1354 203.165 1308.47 203.165 1252.43L203.165 947.731 474.005 947.731C735.849 947.731 948.009 735.602 948.009 473.796 948.009 211.991 735.987 0 474.143 0Z" fill="currentColor"/>
</svg>
```

### Logo Placement CSS

> **Overlap prevention:** The logo occupies ~3.7rem of vertical space from the bottom. Always set `padding-bottom: var(--logo-safe-bottom)` (5rem) on `.slide-content` for content slides, and `padding-bottom: var(--title-brand-safe-bottom)` (9rem) on `.slide-title .slide-content`. These variables are defined in the HTML boilerplate (see `reference/HTML_ARCHITECTURE.md`).

```css
.slide-logo {
    position: absolute;
    bottom: 1.5rem;
    left: 1.5rem;
    width: 24px;
    height: auto;
    color: var(--palo-green);
    opacity: 0.5;
    z-index: 10;
}

/* On dark slides, logo is white */
.slide-dark .slide-logo {
    color: var(--palo-white);
    opacity: 0.3;
}

/* On green slides, logo is white */
.slide-green .slide-logo {
    color: var(--palo-white);
    opacity: 0.4;
}

/* Title slide — larger logo */
.slide-title .slide-logo {
    width: 36px;
    opacity: 0.6;
}
```

### Full Wordmark (for title slide only, optional)

If the user wants the full "PALO IT" wordmark on the title slide, reference the image file at `reference/assets/Palo IT/palo-it-logo.png`. Use it as an `<img>` element, not inline SVG, to preserve the gradient colours.

```html
<img src="reference/assets/Palo IT/palo-it-logo.png" alt="PALO IT" class="title-wordmark">
```

```css
.title-wordmark {
    height: 40px;
    width: auto;
    position: absolute;
    bottom: 2rem;
    left: 2rem;
}
```

### Available Image Assets

All logo images for the PALO IT template are located in `reference/assets/Palo IT/`. These images are colour-matched to the PALO IT palette (white/transparent backgrounds suitable for both dark and light slides).

| File | Description | Use |
|------|-------------|-----|
| `palo-it-logo.png` | Standard PALO IT wordmark | Title slide wordmark, closing slide |
| `palo-it-logo-large.png` | High-resolution wordmark | Large-format or retina displays |
| `palo-it-p-icon.png` | Raster "P" icon | When inline SVG is not suitable |
| `palo-it-p-icon.svg` | Vector "P" icon | Preferred over inline SVG for maintainability |

> **Important:** Always use images from `reference/assets/Palo IT/` for this template. Do not use images from the Gen-e2 Dark or Gen-e2 Light asset folders — those images have different background colours that do not match this theme.

---

## Slide Layout Examples

### 1. Title Slide (Dark Background)

```html
<section class="slide slide-dark slide-title" data-notes="Welcome. Introduce yourself." data-duration="1min">
    <div class="slide-content" style="text-align: center; justify-content: center; align-items: center;">
        <p class="main-heading reveal" style="color: var(--accent-green);">STRATEGY PRESENTATION</p>
        <h1 class="sub-heading reveal" style="color: var(--palo-white); font-size: var(--title-size);">
            Presentation Title Goes Here
        </h1>
        <p class="reveal body-text" style="color: rgba(255,255,255,0.6); margin-top: 1rem;">
            Presenter Name &middot; Date &middot; Location
        </p>
    </div>
    <!-- Logo (P icon) -->
    <svg class="slide-logo" viewBox="0 0 948 1354" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path d="M474.143 0 101.721 0C45.6705 0 ..." fill="currentColor"/>
    </svg>
</section>
```

**Key rules:**
- Background: `var(--palo-dark)` (#191919)
- Main heading: uppercase label in `--accent-green`
- Sub-heading: white, uses `--title-size` (larger than normal sub-heading)
- Subtitle line: white at 60% opacity
- Logo: white, bottom-left, larger size

### 2. Table of Contents Slide

```html
<section class="slide slide-light" data-notes="Overview of what we'll cover." data-duration="1min">
    <div class="slide-content">
        <p class="main-heading reveal">AGENDA</p>
        <h2 class="sub-heading reveal">Contents</h2>
        <div class="toc-list reveal">
            <div class="toc-item">
                <span class="toc-number">01</span>
                <span class="toc-label">Section title goes here</span>
            </div>
            <div class="toc-item">
                <span class="toc-number">02</span>
                <span class="toc-label">Section title goes here</span>
            </div>
            <div class="toc-item">
                <span class="toc-number">03</span>
                <span class="toc-label">Section title goes here</span>
            </div>
            <div class="toc-item">
                <span class="toc-number">04</span>
                <span class="toc-label">Section title goes here</span>
            </div>
        </div>
    </div>
    <svg class="slide-logo" viewBox="0 0 948 1354" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path d="M474.143 0 101.721 0C45.6705 0 ..." fill="currentColor"/>
    </svg>
</section>
```

**Table of Contents CSS:**

```css
.toc-list {
    display: flex;
    flex-direction: column;
    gap: clamp(0.5rem, 1.5vw, 1rem);
    margin-top: var(--content-gap);
    max-width: 600px;
}

.toc-item {
    display: flex;
    align-items: baseline;
    gap: 1.5rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(0, 143, 104, 0.15);
}

.toc-number {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: clamp(1.5rem, 3vw, 2rem);
    color: var(--palo-green);
    min-width: 2.5rem;
}

.toc-label {
    font-family: var(--font-body);
    font-size: var(--body-size);
    color: var(--palo-dark);
}
```

### 3. Section Header Slide (Green Background)

```html
<section class="slide slide-green" data-notes="Transition to new section." data-duration="0.5min">
    <div class="slide-content" style="justify-content: center;">
        <p class="main-heading reveal">SECTION 01</p>
        <h2 class="sub-heading reveal" style="color: var(--palo-white);">
            Section title goes here
        </h2>
        <p class="reveal body-text" style="color: rgba(255,255,255,0.7); max-width: 600px;">
            Section sub-heading or additional details go here
        </p>
    </div>
    <svg class="slide-logo" viewBox="0 0 948 1354" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path d="M474.143 0 101.721 0C45.6705 0 ..." fill="currentColor"/>
    </svg>
</section>
```

**Key rules:**
- Background: `var(--palo-green)` (#008F68)
- Main heading: bright green `--accent-bright-green`
- Sub-heading: white
- Body text: white at 70% opacity
- Logo: white

### 4. Content Slide — One Column with Subtitle

```html
<section class="slide slide-light" data-notes="Key content." data-duration="2min">
    <div class="slide-content">
        <p class="main-heading reveal">MARKET ANALYSIS</p>
        <h2 class="sub-heading reveal">Addressable market has doubled; we hold just 6%</h2>
        <div class="body-content reveal">
            <p class="body-text">Supporting explanation goes here. Keep it to 2-3 sentences maximum.
            Each slide should make one clear point.</p>
        </div>
    </div>
    <svg class="slide-logo" viewBox="0 0 948 1354" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path d="M474.143 0 101.721 0C45.6705 0 ..." fill="currentColor"/>
    </svg>
</section>
```

### 5. Content Slide — Two Columns

```html
<section class="slide slide-light" data-notes="Comparison." data-duration="2min">
    <div class="slide-content">
        <p class="main-heading reveal">COMPARISON</p>
        <h2 class="sub-heading reveal">Option A costs less but Option B scales further</h2>
        <div class="two-column reveal">
            <div class="column">
                <h3 class="card-title">Option A</h3>
                <p class="body-text">Description of first option with key trade-offs.</p>
            </div>
            <div class="column">
                <h3 class="card-title">Option B</h3>
                <p class="body-text">Description of second option with key trade-offs.</p>
            </div>
        </div>
    </div>
    <svg class="slide-logo" viewBox="0 0 948 1354" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path d="M474.143 0 101.721 0C45.6705 0 ..." fill="currentColor"/>
    </svg>
</section>
```

### 6. Content Slide — Three Cards / Pillars

```html
<section class="slide slide-light" data-notes="Three strategic pillars." data-duration="2min">
    <div class="slide-content">
        <p class="main-heading reveal">STRATEGIC PILLARS</p>
        <h2 class="sub-heading reveal">Three focus areas to drive growth</h2>
        <div class="card-grid reveal">
            <div class="card">
                <div class="card-icon" style="color: var(--palo-green);">01</div>
                <h3 class="card-title">Pillar One</h3>
                <p class="card-body">Brief description of this strategic pillar.</p>
            </div>
            <div class="card">
                <div class="card-icon" style="color: var(--accent-blue);">02</div>
                <h3 class="card-title">Pillar Two</h3>
                <p class="card-body">Brief description of this strategic pillar.</p>
            </div>
            <div class="card">
                <div class="card-icon" style="color: var(--accent-orange);">03</div>
                <h3 class="card-title">Pillar Three</h3>
                <p class="card-body">Brief description of this strategic pillar.</p>
            </div>
        </div>
    </div>
    <svg class="slide-logo" viewBox="0 0 948 1354" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path d="M474.143 0 101.721 0C45.6705 0 ..." fill="currentColor"/>
    </svg>
</section>
```

### 7. Big Number Slide

```html
<section class="slide slide-light" data-notes="Impact stat." data-duration="1.5min">
    <div class="slide-content" style="text-align: center; align-items: center;">
        <p class="main-heading reveal">IMPACT</p>
        <div class="big-number reveal">$40M</div>
        <h2 class="sub-heading reveal" style="font-size: var(--h3-size);">
            Revenue at risk if we don't act by Q2
        </h2>
    </div>
    <svg class="slide-logo" viewBox="0 0 948 1354" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path d="M474.143 0 101.721 0C45.6705 0 ..." fill="currentColor"/>
    </svg>
</section>
```

### 8. The Ask Slide (Dark Background — always last)

```html
<section class="slide slide-dark" data-notes="The decision we need." data-duration="2min">
    <div class="slide-content" style="justify-content: center; text-align: center; align-items: center;">
        <p class="main-heading reveal" style="color: var(--accent-green);">THE ASK</p>
        <h2 class="sub-heading reveal" style="color: var(--palo-white); max-width: 700px;">
            We need board approval for $2M investment by end of month
        </h2>
        <p class="reveal body-text" style="color: rgba(255,255,255,0.6); max-width: 500px; margin-top: 1rem;">
            This enables us to launch Phase 1 in Q1 and capture the market window before competitors respond.
        </p>
    </div>
    <svg class="slide-logo" viewBox="0 0 948 1354" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path d="M474.143 0 101.721 0C45.6705 0 ..." fill="currentColor"/>
    </svg>
</section>
```

---

## Layout CSS Reference

```css
/* ─── TWO COLUMN ─────────────────── */
.two-column {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--content-gap);
    margin-top: var(--content-gap);
}

.column {
    padding: clamp(1rem, 2vw, 1.5rem);
    background: var(--palo-mint);
    border-radius: 12px;
    border-left: 3px solid var(--palo-green);
}

/* ─── THREE CARD GRID ────────────── */
.card-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--content-gap);
    margin-top: var(--content-gap);
}

.card {
    background: var(--palo-mint);
    border-radius: 12px;
    padding: clamp(1rem, 2vw, 1.5rem);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.card-icon {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: clamp(1.5rem, 3vw, 2rem);
}

.card-title {
    font-family: var(--font-heading);
    font-weight: 600;
    font-size: clamp(0.85rem, 1.5vw, 1.1rem);
}

.card-body {
    font-family: var(--font-body);
    font-size: clamp(0.7rem, 1.2vw, 0.95rem);
    opacity: 0.8;
    line-height: 1.5;
}

/* ─── BIG NUMBER ─────────────────── */
.big-number {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: var(--big-number-size);
    color: var(--palo-green);
    line-height: 1;
    margin: var(--content-gap) 0;
}

/* ─── BODY CONTENT ───────────────── */
.body-content {
    margin-top: var(--content-gap);
    max-width: 700px;
}

.body-text {
    font-family: var(--font-body);
    font-size: var(--body-size);
    line-height: 1.6;
}

/* ─── RESPONSIVE ─────────────────── */
@media (max-width: 768px) {
    .two-column { grid-template-columns: 1fr; }
    .card-grid { grid-template-columns: 1fr; }
    .toc-list { max-width: 100%; }
}

@media (max-width: 600px) {
    .card-grid { grid-template-columns: 1fr; }
}
```

---

## Slide Background Classes

```css
.slide-dark {
    background: var(--palo-dark);
    color: var(--text-on-dark);
}

.slide-light {
    background: var(--palo-white);
    color: var(--text-on-light);
}

.slide-green {
    background: var(--palo-green);
    color: var(--text-on-dark);
}
```

---

## Do's and Don'ts

### Do:
- Use the green P logo on every slide (bottom-left, subtle)
- Vary slide backgrounds: dark for title/ask, green for section headers, white for content
- Use Montserrat for all headings, Open Sans for body
- Use the dual-heading system on every slide
- Make the sub-heading the dominant text element
- Use brand accent colours for visual variety (blue for data, orange for CTAs, green for success)

### Don't:
- Don't use colours outside the PALO IT palette
- Don't use fonts other than Montserrat and Open Sans
- Don't put the logo in the top-right or center
- Don't make all slides the same background colour
- Don't use more than 2 accent colours per slide
- Don't make the main-heading larger than the sub-heading
