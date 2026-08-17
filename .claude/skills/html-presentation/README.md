# HTML Presentation Skill

A GitHub Copilot agent skill that creates polished, zero-dependency, single-file HTML presentations — directly in the browser, no PowerPoint required.

---

## What It Does

This skill generates a self-contained `.html` file that:

- Runs entirely in any modern browser — no installs, no plugins
- Fills each slide to the **full viewport** — no scrolling, ever
- Includes **keyboard, button, and touch navigation**
- Produces **executive-quality slide design** following professional storytelling frameworks
- Outputs a single file with all CSS and JS inline (only Google Fonts are loaded externally)

Trigger this skill whenever you want to:
- Create a presentation, deck, or slideshow as an HTML file
- Convert a PowerPoint outline to an HTML presentation
- Build a pitch deck or strategy deck that runs in a browser
- Create a "self-contained presentation" without needing Office

---

## How to Use

### 1. Invoke the Skill

Simply ask GitHub Copilot to create a presentation. The skill activates automatically when your request mentions:

> "Create a presentation", "build a slide deck", "make an HTML presentation", "convert my outline to slides", "create a pitch deck", etc.

### 2. Answer the Intake Questions

Before writing any slides, the skill will ask you up to 10 questions in a single message:

| # | Question | Why It Matters |
|---|----------|---------------|
| 1 | **Meeting length** | Determines slide count budget |
| 2 | **Presentation topic** | The core subject |
| 3 | **The ask** | What decision or action you need from the audience |
| 4 | **Key messages** | The 2–4 points the audience must leave with |
| 5 | **Audience** | Who is in the room (e.g., CEO + CFO, technical team) |
| 6 | **Tone** | Urgent/bold, measured/analytical, or inspiring/visionary |
| 7 | **Template / Theme** | Choose one: PALO IT, Gen-e2 Dark, Gen-e2 Light, or Other (custom colours) |
| 8 | **Supporting content** | Charts, numbers, or data to include |
| 9 | **Speaker notes** | Whether to include speaker notes |
| 10 | **Images** | File paths of any images to embed |

> **Minimum required:** Questions 1–4. The skill will not proceed without at least the meeting length, topic, ask, and key messages.

### 3. Review the Slide Plan

The skill proposes a slide count based on meeting length, then maps a narrative arc (see Narrative Frameworks below) before writing any HTML. You can adjust the plan at this point.

### 4. Receive the HTML File

The skill delivers a single `.html` file. Open it in any browser and navigate using:

| Control | Action |
|---------|--------|
| `←` / `→` arrow keys | Previous / Next slide |
| `Space` | Next slide |
| `N` | Toggle speaker notes |
| `F` | Fullscreen |
| `Esc` | Close panels |
| On-screen `‹` / `›` buttons | Previous / Next slide |
| Swipe up / down | Navigate on touch devices |

---

## Slide Budget by Meeting Length

| Meeting Length | Slide Budget | Pacing |
|----------------|--------------|--------|
| 15 min | 5–7 slides | ~2 min/slide |
| 30 min | 8–12 slides | ~2 min/slide |
| 45 min | 12–15 slides | ~2.5 min/slide |
| 60 min | 15–18 slides | ~3 min/slide |
| 90 min (board) | 18–22 slides | Includes appendix slides |

---

## Narrative Frameworks

The skill picks the best structure for your content:

| Framework | Best For |
|-----------|----------|
| **Situation / Complication / Resolution** | Strategy, recommendations |
| **Problem / Options / Recommendation** | Decision decks |
| **Vision / Gap / Bridge** | Transformation or change decks |

Every deck always includes a **Title slide** and a final **"The Ask" slide**.

---

## Built-in Themes

The skill includes three built-in themes. When asking for theme preference, offer these three plus `Other (custom colours)`.

| Theme | Look | Best For | Spec File |
|-------|------|----------|-----------|
| **PALO IT** *(default)* | Green brand palette, professional corporate styling | Client-facing decks, strategy, internal comms | [`reference/PALO_IT_TEMPLATE.md`](reference/PALO_IT_TEMPLATE.md) |
| **Gen-e2 Dark** | Black background with blue-purple-magenta gradient accents | Product launches, innovation, tech showcases | [`reference/GEN_E2_DARK_TEMPLATE.md`](reference/GEN_E2_DARK_TEMPLATE.md) |
| **Gen-e2 Light** | White background with the same Gen-e2 gradient language | Light-mode partner of Gen-e2 Dark, exec and workshop decks | [`reference/GEN_E2_LIGHT_TEMPLATE.md`](reference/GEN_E2_LIGHT_TEMPLATE.md) |

### PALO IT Theme Snapshot

| Property | Value |
|----------|-------|
| Primary colour | `#008F68` (PALO IT Green) |
| Dark background | `#191919` |
| Light background | `#FFFFFF` |
| Accent | `#00A378` |
| Heading font | **Montserrat** (700 weight) |
| Body font | **Open Sans** (400 weight) |
| Logo | PALO IT "P" icon on every slide |
| Style | Professional, client-facing |

### Custom Colours

If you do not want the PALO IT template, provide your brand's primary, secondary, and accent colours when answering the intake questions. The skill will apply your palette using the same layout system.

> **Adding new templates:** Create a new `reference/<TEMPLATE_NAME>_TEMPLATE.md` file following the same structure as the existing template files. The skill can then offer it as an additional option.

## Slide Type Showcase Reference

Use [`reference/gen-e2-light-slide-types-showcase.html`](reference/gen-e2-light-slide-types-showcase.html) as a visual guide for layout selection before generating a deck.

What this file gives users:
- A concrete example of each supported slide type in one deck
- Guidance on when to use each layout (big number, 2x2 matrix, timeline, quote pull, etc.)
- A ready reference users can cite in their prompt to steer slide composition

How users should reference it in prompts:
- "Use the slide patterns from `reference/gen-e2-light-slide-types-showcase.html`."
- "For slide 4, use the 2x2 matrix style from the showcase file."
- "Build this deck in Gen-e2 Light and follow the showcase layout types."

---

## Repository Structure

```
html-presentation-palo/
├── SKILL.md                          # Copilot skill definition and instructions
├── README.md                         # This file
└── reference/
    ├── HTML_ARCHITECTURE.md          # Full HTML/CSS/JS boilerplate
    ├── PALO_IT_TEMPLATE.md           # PALO IT brand & colour spec
    ├── GEN_E2_DARK_TEMPLATE.md       # Gen-e2 Dark theme spec
    ├── GEN_E2_LIGHT_TEMPLATE.md      # Gen-e2 Light theme spec
    ├── gen-e2-light-slide-types-showcase.html  # Slide type showcase example
    └── assets/
        ├── Gen-e2 Dark/
        ├── Gen-e2 Light/
        └── Palo IT/
```

---

## Design Principles

The skill enforces professional slide design and deliberately avoids common AI-generated presentation anti-patterns:

**Never generated:**
- Accent lines under titles
- Full-width coloured header/footer bars
- Bullet-point dumps (> 4 bullets)
- Beige/cream default backgrounds
- Symmetrical 3-column icon grids for everything

**Always produced:**
- Asymmetric layouts with purpose
- Insight-driven sub-headings ("Revenue at risk exceeds $40M", not "Revenue Analysis")
- Visual variety — no two consecutive slides share the same layout
- Dark slides for title, key tension moment, and final ask
- Generous white space

---

## Example Output (30-min deck)

| Slide | Type | Purpose |
|-------|------|---------|
| 1 | Title (dark) | Topic + presenter + date |
| 2 | Situation | Where we are — 1 key stat |
| 3 | Complication | The problem / burning platform |
| 4 | Impact | Cost of inaction (big number) |
| 5 | Options | 3-column options considered |
| 6 | Recommendation | Chosen path + rationale |
| 7 | Roadmap | Phased timeline |
| 8 | Investment | What it takes |
| 9 | Risk & Mitigation | Top 3 risks |
| 10 | The Ask (dark) | Decision required + deadline |
