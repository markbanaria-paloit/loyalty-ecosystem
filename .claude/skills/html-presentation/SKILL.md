---
name: html-presentation
description: Generate polished single-file HTML slide decks with built-in PALO IT, Gen-e2 Dark, and Gen-e2 Light themes. Use when users ask for browser presentations, HTML decks, web slides, or PowerPoint-to-HTML conversion.
---

# HTML Presentation Skill

Create zero-dependency, single-file HTML presentations that run entirely in the browser. Each slide fills the full viewport — no scrolling, ever. Output is a self-contained `.html` file with keyboard, button, and touch navigation.

**Built-in themes:** PALO IT (default), Gen-e2 Dark, Gen-e2 Light
**Fonts:** Montserrat (headings) + Open Sans (body) via Google Fonts CDN
**Reference root:** For Claude-compatible runtimes, use `${CLAUDE_PLUGIN_ROOT}/skills/html-presentation/reference/`. For other runtimes (for example GitHub Copilot), resolve `skills/html-presentation/reference/` from the runtime's plugin installation root.
**Full HTML boilerplate:** `HTML_ARCHITECTURE.md` in the reference root above

---

## Step 1 — Intake Interview

Before writing any HTML, gather information from the prompt or reference materials the user provided. If anything is missing or unclear, ask the user these questions. Do NOT skip this step.

### Required Questions (ask all at once, in a single message)

1. **Meeting length** — How long is the meeting? *(determines slide count)*
2. **Presentation topic** — What is the core subject being presented?
3. **The ask** — What decision or action do you need from the audience?
4. **Key messages** — What are the 2-4 most important points they must leave with?
5. **Audience** — Who is in the room? (e.g., CEO + CFO, full board, regional leadership, technical team)
6. **Tone** — Should this feel urgent/bold, measured/analytical, or inspiring/visionary?
7. **Template / Theme** — Which theme should we use? Offer: **1) PALO IT (default)**, **2) Gen-e2 Dark**, **3) Gen-e2 Light**, **4) Other (custom colours)**. *(If custom, ask for primary/secondary/accent brand colours.)*
8. **Any data / supporting content** — Do they have charts, numbers, images, or content to include?
9. **Speaker notes** — Does the presentation need speaker notes?
10. **Images** — Any images to include? (provide file paths)

Do not proceed until you have at least questions 1-4 answered.

### Built-in Templates

When clarifying theme selection, always offer all built-in options plus custom:
- **1) PALO IT** *(default)*
- **2) Gen-e2 Dark**
- **3) Gen-e2 Light**
- **4) Other (custom colours)**

If the user says "use a template" or does not specify, default to **PALO IT**.

For Claude-compatible runtimes, use:
- `${CLAUDE_PLUGIN_ROOT}/skills/html-presentation/reference/PALO_IT_TEMPLATE.md`
- `${CLAUDE_PLUGIN_ROOT}/skills/html-presentation/reference/GEN_E2_DARK_TEMPLATE.md`
- `${CLAUDE_PLUGIN_ROOT}/skills/html-presentation/reference/GEN_E2_LIGHT_TEMPLATE.md`

For other runtimes (for example GitHub Copilot), resolve the matching file from `skills/html-presentation/reference/` under the runtime's plugin installation root.

| Template | Style | Use Case | Assets Folder |
|----------|-------|----------|---------------|
| **PALO IT** *(default)* | Green brand palette, Montserrat + Open Sans, professional | Client-facing decks, strategy, internal | `reference/assets/Palo IT/` |
| **Gen-e2 Dark** | Pure black background, blue-purple-magenta gradient accents | Product launches, tech showcases, innovation | `reference/assets/Gen-e2 Dark/` |
| **Gen-e2 Light** | White background, same gradient accents as Dark | Light-mode partner of Gen-e2 Dark | `reference/assets/Gen-e2 Light/` |

> Future templates can be added by creating new `reference/<TEMPLATE_NAME>_TEMPLATE.md` files following the same structure.

---

## Step 2 — Determine Slide Count

Use meeting length to set a firm slide budget. State the count to the user before proceeding.

| Meeting Length | Slide Budget | Pacing Rule |
|----------------|--------------|-------------|
| 15 min         | 5-7 slides   | ~2 min/slide (leave time for Q&A) |
| 30 min         | 8-12 slides  | ~2 min/slide |
| 45 min         | 12-15 slides | ~2.5 min/slide |
| 60 min         | 15-18 slides | ~3 min/slide |
| 90 min (board) | 18-22 slides | Include backup appendix slides |

**Never exceed the budget.** If the user has more content than the budget allows, help them prioritise — ask "which 3 points absolutely must land?" and cut the rest to an appendix.

---

## Step 3 — Build the Narrative Arc

Use standard executive-storytelling practice to choose an arc that fits the audience and ask; the only mandatory structure here is a title slide outside the budget, a conclusion-first headline on every content slide, and a final slide that states the ask.

---

## Step 4 — Slide Design Principles

Apply normal high-quality presentation design judgment for layout, hierarchy, and visual variety; the non-negotiable presentation-specific delta in this skill is the dual-heading system below.

### Dual-Heading System (applies to ALL slide types)

Every slide uses two headings:

1. **Main Heading** — smaller font, uppercase or label-style, acts as the section/category label (e.g., "MARKET ANALYSIS", "OUR RECOMMENDATION"). Uses `--main-heading-size`.
2. **Sub-Heading** — larger font, sentence-case, the actual insight or "so what" statement (e.g., "Addressable market has doubled; we hold just 6%"). Uses `--sub-heading-size`.

```html
<div class="slide-content">
    <p class="main-heading reveal">MARKET ANALYSIS</p>
    <h2 class="sub-heading reveal">Addressable market has doubled; we hold just 6%</h2>
    <!-- body content here -->
</div>
```

---

## Step 5 — Colour & Typography

### If Using the PALO IT Template (default)

For Claude-compatible runtimes, read `${CLAUDE_PLUGIN_ROOT}/skills/html-presentation/reference/PALO_IT_TEMPLATE.md` for the full colour and typography specification.
For other runtimes (for example GitHub Copilot), resolve `skills/html-presentation/reference/PALO_IT_TEMPLATE.md` from the runtime's plugin installation root.

Key values:

- Primary: `#008F68` (PALO IT green)
- Dark background: `#191919`
- Light background: `#FFFFFF`
- Accent green: `#00A378`
- Headings: **Montserrat** (700 weight for sub-heading, 600 for main-heading)
- Body: **Open Sans** (400 weight)

### If Using Custom Colours

Ask the user for primary, secondary, and accent colours. Apply the "sandwich" structure: dark slides for title + conclusion, light for content slides.

### Typography Sizing

```css
:root {
    --main-heading-size: clamp(0.75rem, 1.5vw, 1rem);      /* smaller, label-style */
    --sub-heading-size: clamp(1.25rem, 3.5vw, 2.5rem);      /* larger, insight text */
    --body-size: clamp(0.75rem, 1.5vw, 1.125rem);
    --small-size: clamp(0.65rem, 1vw, 0.875rem);
    --big-number-size: clamp(3rem, 10vw, 8rem);
}
```

---

## Step 6 — Slide-by-Slide Writing Rules

### Every Slide Must Have:
1. **Main heading** — the section/category label (uppercase, small, e.g., "THE ASK")
2. **Sub-heading** — the "so what" insight (large, declarative, max 12 words)
3. **Visual element** — chart, icon, image, shape, large number, or diagram
4. **Minimal supporting text** — max 40 words of body copy per slide

### Sub-Heading Formula
Write sub-headings as conclusions, not topics:

| Bad (Topic Label) | Good (Insight Sub-Heading) |
|-------------------|---------------------------|
| Market Overview | Addressable market has doubled; we hold just 6% |
| Financial Performance | Q3 margin compression driven entirely by input costs |
| Strategic Options | Option B delivers 3x return at half the risk |
| Next Steps | We need board approval by Friday to hit Q1 launch |

### The Ask Slide (always last)
Must contain exactly:
- Main heading: "THE ASK"
- Sub-heading: A single sentence stating what you need
- Body: From whom, by when (if applicable), what happens if they say yes

---

## Step 7 — Build the HTML Presentation

For Claude-compatible runtimes, read `${CLAUDE_PLUGIN_ROOT}/skills/html-presentation/reference/HTML_ARCHITECTURE.md` for the complete HTML/CSS/JS boilerplate to use.
For other runtimes (for example GitHub Copilot), resolve `skills/html-presentation/reference/HTML_ARCHITECTURE.md` from the runtime's plugin installation root.

Key requirements when generating the HTML file:

1. **Single self-contained `.html` file** — all CSS and JS inline, no external dependencies except Google Fonts CDN
2. **Viewport fitting is mandatory** — every slide is exactly `100vh` / `100dvh`, `overflow: hidden`, `scroll-snap-align: start`
3. **Navigation buttons** — visible "Previous" and "Next" buttons always present on screen
4. **Keyboard navigation** — Arrow keys, Space, and Escape
5. **Touch navigation** — Swipe up/down to navigate
6. **Progress indicator** — slide counter (e.g., "3 / 12")
7. **Scroll-snap** — `scroll-snap-type: y mandatory` on `html`
8. **Dual headings** — every slide has a `.main-heading` (small) + `.sub-heading` (large)
9. **Reveal animations** — staggered fade-in via IntersectionObserver
10. **No scrolling within slides** — if content overflows, split into multiple slides
11. **Every slide must include the template brand/logo element** — this is mandatory for all templates, not just PALO IT. See the Per-Template Logo Requirements below.
12. **No logo overlap** — the brand lockup sits in the bottom-left corner. Always set `padding-bottom: var(--logo-safe-bottom)` on `.slide-content` (content slides) and `padding-bottom: var(--title-brand-safe-bottom)` on `.slide-title .slide-content`. **Never use uniform `padding: var(--slide-padding)` alone** — it is too small at narrow viewports and will cause the logo to cover content.

### Per-Template Logo Requirements

The brand lockup differs by template. Apply the correct one on **every slide** — content slides AND the title slide.

#### PALO IT (default)
- **All slides**: inline SVG `<svg class="slide-logo">` P icon in the bottom-left corner (see the PALO IT template reference path above for the full SVG code)
- **Title slide only**: optionally replace with `<img src="reference/assets/Palo IT/palo-it-logo.png" alt="PALO IT" class="title-wordmark">` for the full colour wordmark

#### Gen-e2 Dark
- **All content slides**: `<div class="slide-brand">` showing **only the Gen-e2 gradient logo** ("Gen-" white + "e2" in gradient) in the bottom-left. No PALO IT text.
- **Title slide**: `<div class="title-brand">` with a larger gradient "Gen-e2" text, magenta underline, and tagline "Crafting tech as a force for good." No PALO IT text.
- See the Gen-e2 Dark template reference path above, then use the `Logo & Branding` section for the full HTML and CSS.

#### Gen-e2 Light
- **All content slides**: `<div class="slide-brand">` showing **only the Gen-e2 gradient logo** ("Gen-" dark + "e2" in gradient) in the bottom-left. No PALO IT text.
- **Title slide**: `<div class="title-brand">` with a larger gradient "Gen-e2" text, magenta underline, and tagline. No PALO IT text.
- See the Gen-e2 Light template reference path above, then use the `Logo & Branding` section for the full HTML and CSS.

> **Rule: one logo per template, never mixed.** PALO IT theme → PALO IT logo only. Gen-e2 themes → Gen-e2 logo only. Never show both on the same slide.
>
> **Common mistakes:** (1) Forgetting the brand element entirely. (2) Using `slide-brand` on the title slide instead of `title-brand`. (3) Adding a PALO IT line to a Gen-e2 slide — this is wrong.

### Slide HTML Structure

```html
<!-- Content slide (all templates) -->
<section class="slide" data-notes="Speaker notes here" data-duration="2min">
    <div class="slide-content">
        <p class="main-heading reveal">SECTION LABEL</p>
        <h2 class="sub-heading reveal">The actual insight headline goes here</h2>
        <!-- Body content: cards, stats, text, charts, etc. -->
    </div>
    <!-- MANDATORY: one brand/logo element in bottom-left — one logo per template, never mixed -->
    <!-- PALO IT theme:        <svg class="slide-logo">...</svg>  (PALO IT P-icon — no Gen-e2) -->
    <!-- Gen-e2 Dark/Light content slides: <div class="slide-brand">...</div>  (Gen-e2 only — no PALO IT) -->
    <!-- Gen-e2 Dark/Light title slide:    <div class="title-brand">...</div>  (Gen-e2 only — no PALO IT) -->
</section>
```

### Image Handling
If the user provided images, use direct file paths in HTML (e.g., `src="assets/logo.png"`). Never use base64 encoding for large images.

### Template Asset Folder Rule
Each built-in template ships with its own set of logo images sized and coloured for that background. **Always use images from the folder that matches the selected template:**

| Template | Logo image folder |
|----------|-------------------|
| PALO IT | `reference/assets/Palo IT/` |
| Gen-e2 Dark | `reference/assets/Gen-e2 Dark/` |
| Gen-e2 Light | `reference/assets/Gen-e2 Light/` |

Available files in each folder: `palo-it-logo.png` (standard wordmark), `palo-it-logo-large.png` (high-res wordmark), `palo-it-p-icon.png` (P icon raster), `palo-it-p-icon.svg` (P icon vector). Never mix assets across template folders — each set is colour-matched to its theme background.

---

## Step 8 — QA Checklist

Before delivering, verify:

- [ ] Slide count matches the meeting-length budget
- [ ] Every slide has both a main-heading and sub-heading
- [ ] Every sub-heading is an insight (not a topic label)
- [ ] No slide has more than 4 bullet points
- [ ] No two consecutive slides have identical layouts
- [ ] No AI-tell design elements (accent lines, header bars, beige backgrounds)
- [ ] Title slide and final Ask slide use dark background
- [ ] The Ask is specific: what, from whom, by when
- [ ] No content overflow — every slide fits within viewport
- [ ] **Visual overlap check (content slides)**: the bottom `--logo-safe-bottom` (5rem) zone is visually clear — no cards, bullet lists, charts, or body text extend into it
- [ ] **Visual overlap check (title slide)**: the `title-brand` lockup is fully visible and no slide content enters the bottom `--title-brand-safe-bottom` (9rem) zone
- [ ] Navigation buttons (Previous / Next) are visible and functional
- [ ] Keyboard shortcuts work (arrows, Space, Escape)
- [ ] **Every content slide** has the correct brand element: `slide-logo` SVG (PALO IT only) OR `slide-brand` div (Gen-e2 only) — never both on the same slide
- [ ] **Title slide** has the larger brand lockup: `title-wordmark` image (PALO IT only) OR `title-brand` div with gradient Gen-e2 text + tagline (Gen-e2 only) — not the small content-slide version
- [ ] **No logo mixing**: PALO IT slides contain no Gen-e2 text; Gen-e2 slides contain no PALO IT text or P-icon
- [ ] Logo images (if used) are sourced from the correct template asset folder (`reference/assets/Palo IT/` for PALO IT; `reference/assets/Gen-e2 Dark/` or `reference/assets/Gen-e2 Light/` for Gen-e2 — note: Gen-e2 brand lockup is CSS-based and does not use image files)
- [ ] Google Fonts load correctly (Montserrat + Open Sans)
- [ ] File opens correctly in a browser with no console errors

---

## Step 9 — Delivery

1. Save the `.html` file to the user's specified location
2. Tell the user the output file path
3. Provide the navigation reference:
   - `<` / `>` buttons or `Left` / `Right` arrow keys to navigate
   - `Space` for next slide
   - `N` for speaker notes (if enabled)
   - `F` for fullscreen
   - `Esc` to close panels
4. Ask if any adjustments are needed

---

## Appendix Slides (for 60+ min / board decks)

Offer to build backup slides covering:
- Detailed financials / model assumptions
- Methodology or data sources
- Competitive landscape deep-dive
- Risk register
- Org / resource requirements

Label these clearly as "Appendix" and place after the main deck. They are not presented but available if questions arise.

---

## Sample Slide Sequence (30-min, 10-slide deck)

| # | Slide Type | Purpose |
|---|-----------|---------|
| 1 | Title (dark) | Topic + presenter + date |
| 2 | Situation | Where we are — 1 key stat |
| 3 | Complication | The problem / burning platform |
| 4 | Impact | Cost of inaction (big number slide) |
| 5 | Options | 2x2 or 3-column options considered |
| 6 | Recommendation | Our chosen path + rationale |
| 7 | Roadmap | Phased timeline (3-4 phases) |
| 8 | Investment / Resources | What it takes |
| 9 | Risk & Mitigation | Top 3 risks + mitigations |
| 10 | The Ask (dark) | Decision required + deadline |

---

## Content Density Limits Per Slide (Non-Negotiable)

| Slide Type | Maximum Content |
|------------|-----------------|
| Title slide | 1 main-heading + 1 sub-heading + optional tagline |
| Content slide | 1 main-heading + 1 sub-heading + 4-6 bullet points OR 2 short paragraphs |
| Feature grid | 1 main-heading + 1 sub-heading + 6 cards max (2x3 or 3x2) |
| Quote slide | 1 main-heading + 1 quote (max 3 lines) + attribution |
| Big number slide | 1 main-heading + 1 large number + 1 supporting sentence |
| Chart slide | 1 main-heading + 1 sub-heading + 1 chart (full width) |

**Content exceeds limits? Split into multiple slides. Never scroll.**
