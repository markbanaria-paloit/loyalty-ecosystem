# HTML Architecture Reference

Complete boilerplate for generating self-contained HTML presentations. Copy this structure as the starting point for every presentation, then customise colours, fonts, and content per the selected template.

## Table of Contents

- [Full HTML Boilerplate](#full-html-boilerplate)
- [Key Architecture Notes](#key-architecture-notes)
- [Checklist for Every Generated Presentation](#checklist-for-every-generated-presentation)

---

## Full HTML Boilerplate

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presentation Title</title>
    <meta name="description" content="Presentation description">

    <!-- Google Fonts: Montserrat + Open Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Open+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <style>
        /* ═══════════════════════════════════════
           SECTION 1: CSS VARIABLES
           ═══════════════════════════════════════ */

        :root {
            /* ── Brand Palette (PALO IT default — replace per template) ── */
            --palo-green: #008F68;
            --palo-dark: #191919;
            --palo-white: #FFFFFF;
            --palo-mint: #EFFEF9;
            --accent-green: #00A378;
            --accent-bright-green: #46C864;
            --accent-blue: #37B2EF;
            --accent-purple: #5157DD;
            --accent-yellow: #FFD23C;
            --accent-orange: #FF9132;
            --accent-teal: #15C4CD;

            /* ── Semantic Colours ── */
            --bg-dark: var(--palo-dark);
            --bg-light: var(--palo-white);
            --bg-subtle: var(--palo-mint);
            --text-on-dark: var(--palo-white);
            --text-on-light: var(--palo-dark);
            --brand-accent: var(--palo-green);

            /* ── Typography ── */
            --font-heading: 'Montserrat', sans-serif;
            --font-body: 'Open Sans', sans-serif;

            /* ── Type Scale ── */
            --title-size: clamp(1.75rem, 5vw, 4rem);
            --main-heading-size: clamp(0.7rem, 1.2vw, 0.95rem);
            --sub-heading-size: clamp(1.25rem, 3.5vw, 2.5rem);
            --h3-size: clamp(1rem, 2.5vw, 1.5rem);
            --body-size: clamp(0.75rem, 1.5vw, 1.125rem);
            --small-size: clamp(0.65rem, 1vw, 0.875rem);
            --big-number-size: clamp(3rem, 10vw, 8rem);

            /* ── Spacing ── */
            --slide-padding: clamp(2rem, 5vw, 5rem);
            --content-gap: clamp(0.75rem, 2vw, 2rem);

            /* ── Logo safe zones (NEVER reduce these — they prevent brand overlap) ── */
            /* slide-brand / slide-logo footprint: ~1.5rem bottom offset + ~35px element = ~3.7rem */
            --logo-safe-bottom: 5rem;         /* content slides: clears slide-logo (PALO IT) and slide-brand (Gen-e2) */
            /* title-brand footprint: 3rem bottom offset + ~5rem element height = ~8rem */
            --title-brand-safe-bottom: 9rem;  /* title slide only: clears the larger title-brand lockup */
        }

        /* ═══════════════════════════════════════
           SECTION 2: VIEWPORT FITTING (MANDATORY)
           ═══════════════════════════════════════ */

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
            height: 100%;
            overflow-x: hidden;
        }

        html {
            scroll-snap-type: y mandatory;
            scroll-behavior: smooth;
        }

        body {
            font-family: var(--font-body);
            background: var(--bg-light);
            color: var(--text-on-light);
        }

        .slide {
            width: 100vw;
            height: 100vh;
            height: 100dvh;
            overflow: hidden;
            scroll-snap-align: start;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .slide-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            max-height: 100%;
            overflow: hidden;
            padding: var(--slide-padding);
            /* Override bottom padding to prevent brand lockup overlap.
               NEVER use padding: var(--slide-padding) alone — it is too small at narrow viewports. */
            padding-bottom: var(--logo-safe-bottom);
        }

        /* Title slide has a taller title-brand lockup — needs extra clearance */
        .slide-title .slide-content {
            padding-bottom: var(--title-brand-safe-bottom);
        }

        /* ═══════════════════════════════════════
           SECTION 3: SLIDE BACKGROUNDS
           ═══════════════════════════════════════ */

        .slide-dark {
            background: var(--bg-dark);
            color: var(--text-on-dark);
        }

        .slide-light {
            background: var(--bg-light);
            color: var(--text-on-light);
        }

        .slide-green {
            background: var(--brand-accent);
            color: var(--text-on-dark);
        }

        /* ═══════════════════════════════════════
           SECTION 4: DUAL HEADING SYSTEM
           ═══════════════════════════════════════ */

        .main-heading {
            font-family: var(--font-heading);
            font-weight: 600;
            font-size: var(--main-heading-size);
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: var(--brand-accent);
            margin-bottom: 0.5rem;
        }

        .slide-dark .main-heading { color: var(--accent-green); }
        .slide-green .main-heading { color: var(--accent-bright-green); }

        .sub-heading {
            font-family: var(--font-heading);
            font-weight: 700;
            font-size: var(--sub-heading-size);
            line-height: 1.2;
            margin-bottom: var(--content-gap);
        }

        /* ═══════════════════════════════════════
           SECTION 5: BODY & CARD STYLES
           ═══════════════════════════════════════ */

        .body-text {
            font-family: var(--font-body);
            font-size: var(--body-size);
            line-height: 1.6;
        }

        .body-content {
            margin-top: var(--content-gap);
            max-width: 700px;
        }

        .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--content-gap);
            margin-top: var(--content-gap);
        }

        .column {
            padding: clamp(1rem, 2vw, 1.5rem);
            background: var(--bg-subtle);
            border-radius: 12px;
            border-left: 3px solid var(--brand-accent);
        }

        .card-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--content-gap);
            margin-top: var(--content-gap);
        }

        .card {
            background: var(--bg-subtle);
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

        .big-number {
            font-family: var(--font-heading);
            font-weight: 800;
            font-size: var(--big-number-size);
            color: var(--brand-accent);
            line-height: 1;
            margin: var(--content-gap) 0;
        }

        /* ── Table of Contents ── */
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
            color: var(--brand-accent);
            min-width: 2.5rem;
        }

        .toc-label {
            font-family: var(--font-body);
            font-size: var(--body-size);
        }

        /* ── Bullet list (max 4 items) ── */
        .slide-list {
            list-style: none;
            margin-top: var(--content-gap);
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .slide-list li {
            font-family: var(--font-body);
            font-size: var(--body-size);
            line-height: 1.5;
            padding-left: 1.5rem;
            position: relative;
        }

        .slide-list li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0.6em;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--brand-accent);
        }

        /* ═══════════════════════════════════════
           SECTION 6: LOGO
           ═══════════════════════════════════════ */

        .slide-logo {
            position: absolute;
            bottom: 1.5rem;
            left: 1.5rem;
            width: 24px;
            height: auto;
            color: var(--brand-accent);
            opacity: 0.5;
            z-index: 10;
        }

        .slide-dark .slide-logo { color: var(--palo-white); opacity: 0.3; }
        .slide-green .slide-logo { color: var(--palo-white); opacity: 0.4; }
        .slide-title .slide-logo { width: 36px; opacity: 0.6; }

        /* ═══════════════════════════════════════
           SECTION 7: NAVIGATION
           ═══════════════════════════════════════ */

        .nav-controls {
            position: fixed;
            bottom: 1.5rem;
            right: 1.5rem;
            display: flex;
            gap: 0.5rem;
            z-index: 1000;
        }

        .nav-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 1px solid rgba(128, 128, 128, 0.3);
            background: rgba(128, 128, 128, 0.15);
            backdrop-filter: blur(8px);
            color: var(--text-on-light);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            transition: all 0.2s ease;
            font-family: var(--font-body);
        }

        .nav-btn:hover {
            background: rgba(128, 128, 128, 0.35);
            transform: scale(1.1);
        }

        .nav-btn:active { transform: scale(0.95); }
        .nav-btn:disabled { opacity: 0.3; cursor: default; transform: none; }

        /* Adapt button colour to slide background */
        .slide-dark ~ .nav-controls .nav-btn,
        .slide-green ~ .nav-controls .nav-btn {
            color: var(--text-on-dark);
        }

        /* ── Progress Indicator ── */
        .progress-bar {
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: var(--brand-accent);
            width: 0%;
            z-index: 1000;
            transition: width 0.3s;
        }

        .progress-info {
            position: fixed;
            top: 0.75rem;
            right: 5rem;
            font-size: var(--small-size);
            opacity: 0.5;
            z-index: 1000;
            font-family: var(--font-heading);
            font-weight: 500;
        }

        /* ── Speaker Notes Panel ── */
        .notes-panel {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.92);
            backdrop-filter: blur(12px);
            padding: 1.25rem 2rem;
            transform: translateY(100%);
            transition: transform 0.3s ease;
            z-index: 2000;
            max-height: 40vh;
            overflow-y: auto;
            border-top: 2px solid var(--brand-accent);
        }

        .notes-panel.open { transform: translateY(0); }

        .notes-panel h4 {
            color: var(--accent-green);
            margin: 0 0 0.5rem 0;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-family: var(--font-heading);
        }

        .notes-panel p {
            color: rgba(255, 255, 255, 0.85);
            margin: 0;
            line-height: 1.7;
            font-size: var(--body-size);
            font-family: var(--font-body);
        }

        .notes-panel .next-slide {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.5);
            font-size: var(--small-size);
        }

        /* ═══════════════════════════════════════
           SECTION 8: ANIMATIONS
           ═══════════════════════════════════════ */

        .reveal {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .visible .reveal { opacity: 1; transform: translateY(0); }
        .visible .reveal:nth-child(1) { transition-delay: 0.1s; }
        .visible .reveal:nth-child(2) { transition-delay: 0.2s; }
        .visible .reveal:nth-child(3) { transition-delay: 0.3s; }
        .visible .reveal:nth-child(4) { transition-delay: 0.4s; }
        .visible .reveal:nth-child(5) { transition-delay: 0.5s; }
        .visible .reveal:nth-child(6) { transition-delay: 0.6s; }

        .reveal[data-delay] {
            transition-delay: var(--reveal-delay);
        }

        /* ═══════════════════════════════════════
           SECTION 9: RESPONSIVE
           ═══════════════════════════════════════ */

        @media (max-height: 700px) {
            :root {
                --slide-padding: clamp(1rem, 3vw, 3rem);
                --sub-heading-size: clamp(1.1rem, 3vw, 2rem);
            }
        }

        @media (max-height: 600px) {
            :root {
                --sub-heading-size: clamp(1rem, 2.5vw, 1.75rem);
                --body-size: clamp(0.7rem, 1.2vw, 0.95rem);
            }
            .nav-controls, .progress-info { display: none; }
        }

        @media (max-height: 500px) {
            :root {
                --sub-heading-size: clamp(0.9rem, 2vw, 1.5rem);
                --slide-padding: clamp(0.5rem, 2vw, 1.5rem);
            }
        }

        @media (max-width: 768px) {
            .two-column { grid-template-columns: 1fr; }
            .card-grid { grid-template-columns: 1fr; }
        }

        @media (prefers-reduced-motion: reduce) {
            .reveal { opacity: 1; transform: none; transition: none; }
        }

        /* ═══════════════════════════════════════
           SECTION 10: PRINT / PDF EXPORT
           ═══════════════════════════════════════ */

        @media print {
            .slide { height: 100vh; page-break-after: always; }
            .nav-controls, .progress-bar, .progress-info,
            .notes-panel, .keyboard-hint { display: none !important; }
            .reveal { opacity: 1; transform: none; }
        }
    </style>
</head>
<body>

    <!-- ── Progress Bar ── -->
    <div class="progress-bar" id="progressBar"></div>
    <div class="progress-info" id="progressInfo">1 / 1</div>

    <!-- ═══════════════════════════════════════
         SLIDES GO HERE
         Each slide is a <section class="slide">
         ═══════════════════════════════════════ -->

    <!-- ── Slide 1: Title (dark) ── -->
    <section class="slide slide-dark slide-title" data-notes="Welcome." data-duration="1min">
        <div class="slide-content" style="text-align: center; justify-content: center; align-items: center;">
            <p class="main-heading reveal" style="color: var(--accent-green);">CATEGORY LABEL</p>
            <h1 class="sub-heading reveal" style="color: var(--palo-white); font-size: var(--title-size);">
                Presentation Title
            </h1>
            <p class="reveal body-text" style="color: rgba(255,255,255,0.6); margin-top: 1rem;">
                Presenter &middot; Date
            </p>
        </div>
        <svg class="slide-logo" viewBox="0 0 948 1354" xmlns="http://www.w3.org/2000/svg" fill="none">
            <path d="M474.143 0 101.721 0C45.6705 0 0.138396 45.5254 0.138396 101.567 0.138396 152.351 37.3668 194.417 86.082 201.889 91.2027 202.719 96.4617 202.996 101.859 202.996L474.281 202.996C623.887 202.996 745.121 324.351 745.121 473.796 745.121 623.241 623.887 744.596 474.281 744.596L101.721 744.596C96.3233 744.596 91.0643 745.011 85.9436 745.842 37.3668 753.452 0 795.38 0 846.164L0 1252.43C0 1308.47 45.5321 1354 101.582 1354 157.633 1354 203.165 1308.47 203.165 1252.43L203.165 947.731 474.005 947.731C735.849 947.731 948.009 735.602 948.009 473.796 948.009 211.991 735.987 0 474.143 0Z" fill="currentColor"/>
        </svg>
    </section>

    <!-- ── More slides... ── -->

    <!-- ── Navigation Controls ── -->
    <div class="nav-controls">
        <button class="nav-btn" id="prevBtn" onclick="prevSlide()" title="Previous (Left Arrow)">&#8592;</button>
        <button class="nav-btn" id="nextBtn" onclick="nextSlide()" title="Next (Right Arrow)">&#8594;</button>
    </div>

    <!-- ── Speaker Notes Panel ── -->
    <div class="notes-panel" id="notesPanel">
        <h4>Speaker Notes</h4>
        <p id="notesContent">Press N to toggle notes.</p>
        <div class="next-slide" id="nextSlidePreview">Next: ...</div>
    </div>

    <script>
        /* ═══════════════════════════════════════
           SLIDE ENGINE
           ═══════════════════════════════════════ */
        class SlideEngine {
            constructor() {
                this.slides = document.querySelectorAll('.slide');
                this.total = this.slides.length;
                this.current = 0;
                this.init();
            }

            init() {
                this.observeSlides();
                this.bindKeys();
                this.bindTouch();
                this.updateNavButtons();
                this.updateProgress();
                this.updateNotes();
            }

            /* ── IntersectionObserver: detect which slide is in view ── */
            observeSlides() {
                const io = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                            const idx = [...this.slides].indexOf(entry.target);
                            if (idx !== this.current) {
                                this.current = idx;
                                this.update();
                            }
                        }
                    });
                }, { threshold: 0.5 });
                this.slides.forEach(s => io.observe(s));
                // Make first slide visible immediately
                if (this.slides[0]) this.slides[0].classList.add('visible');
            }

            /* ── Keyboard ── */
            bindKeys() {
                document.addEventListener('keydown', e => {
                    switch (e.key) {
                        case 'ArrowDown': case ' ': case 'ArrowRight':
                            e.preventDefault(); this.next(); break;
                        case 'ArrowUp': case 'ArrowLeft':
                            e.preventDefault(); this.prev(); break;
                        case 'n': case 'N':
                            document.getElementById('notesPanel').classList.toggle('open'); break;
                        case 'f': case 'F':
                            if (!document.fullscreenElement) {
                                document.documentElement.requestFullscreen?.();
                            } else {
                                document.exitFullscreen?.();
                            }
                            break;
                        case 'Escape':
                            document.getElementById('notesPanel').classList.remove('open'); break;
                    }
                });
            }

            /* ── Touch / swipe ── */
            bindTouch() {
                let startY = 0;
                document.addEventListener('touchstart', e => {
                    startY = e.touches[0].clientY;
                }, { passive: true });
                document.addEventListener('touchend', e => {
                    const dy = startY - e.changedTouches[0].clientY;
                    if (Math.abs(dy) > 50) {
                        dy > 0 ? this.next() : this.prev();
                    }
                }, { passive: true });
            }

            /* ── Navigation ── */
            go(i) {
                const target = Math.max(0, Math.min(i, this.total - 1));
                this.slides[target].scrollIntoView({ behavior: 'smooth' });
            }
            next() { if (this.current < this.total - 1) this.go(this.current + 1); }
            prev() { if (this.current > 0) this.go(this.current - 1); }

            /* ── Update UI ── */
            update() {
                this.updateNavButtons();
                this.updateProgress();
                this.updateNotes();
                this.updateNavButtonColors();
            }

            updateNavButtons() {
                document.getElementById('prevBtn').disabled = this.current === 0;
                document.getElementById('nextBtn').disabled = this.current === this.total - 1;
            }

            updateProgress() {
                const pct = ((this.current + 1) / this.total * 100);
                document.getElementById('progressBar').style.width = pct + '%';
                document.getElementById('progressInfo').textContent =
                    `${this.current + 1} / ${this.total}`;
            }

            updateNotes() {
                const slide = this.slides[this.current];
                const notes = slide?.dataset?.notes || 'No notes for this slide.';
                document.getElementById('notesContent').textContent = notes;
                const nextSlide = this.slides[this.current + 1];
                document.getElementById('nextSlidePreview').textContent = nextSlide
                    ? 'Next: ' + (nextSlide.querySelector('.sub-heading, h1, h2')?.textContent?.trim() || 'Untitled')
                    : 'End of presentation';
            }

            updateNavButtonColors() {
                // Adapt nav button text colour based on current slide background
                const slide = this.slides[this.current];
                const isDark = slide.classList.contains('slide-dark') || slide.classList.contains('slide-green');
                const btns = document.querySelectorAll('.nav-btn');
                btns.forEach(btn => {
                    btn.style.color = isDark ? 'var(--text-on-dark)' : 'var(--text-on-light)';
                    btn.style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
                    btn.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
                });
            }
        }

        /* ── Global helpers ── */
        window.prevSlide = () => window.engine?.prev();
        window.nextSlide = () => window.engine?.next();

        document.addEventListener('DOMContentLoaded', () => {
            window.engine = new SlideEngine();
        });
    </script>
</body>
</html>
```

---

## Key Architecture Notes

### Viewport Fitting (Non-Negotiable)

Every slide MUST fit exactly within the viewport. No scrolling within slides, ever.

The critical CSS is:
- `html { scroll-snap-type: y mandatory; }` — snaps to each slide
- `.slide { height: 100vh; height: 100dvh; overflow: hidden; scroll-snap-align: start; }`
- `.slide-content { max-height: 100%; overflow: hidden; }`

If content does not fit, **split into multiple slides**. Never add `overflow: auto` or `overflow-y: scroll`.

### Navigation Buttons

The "Previous" (`&#8592;`) and "Next" (`&#8594;`) buttons are always visible at bottom-right. They are:
- Fixed position, always on screen
- Semi-transparent with backdrop blur
- Disabled at start/end of deck
- Colour adapts to current slide background (dark vs light)

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Left` / `Up` | Previous slide |
| `Right` / `Down` / `Space` | Next slide |
| `N` | Toggle speaker notes |
| `F` | Toggle fullscreen |
| `Esc` | Close panels |

### Reveal Animations

Add `class="reveal"` to any element that should animate in when the slide becomes visible. Elements are staggered automatically by `nth-child` order (0.1s increment). For custom delays, use `data-delay`:

```html
<h2 class="reveal" data-delay="0.5s">Delayed heading</h2>
```

Then in CSS, the `data-delay` attribute is read via `var(--reveal-delay)`. The JS in the boilerplate sets `--reveal-delay` from `data-delay` on each `.reveal[data-delay]` element.

### Speaker Notes

Add `data-notes="..."` and optionally `data-duration="2min"` to each `<section class="slide">`. Notes are shown in a bottom panel toggled with `N`.

### Adding Custom data-delay Support

If you use `data-delay` attributes, add this to the `DOMContentLoaded` handler:

```javascript
document.querySelectorAll('.reveal[data-delay]').forEach(el => {
    el.style.setProperty('--reveal-delay', el.dataset.delay);
    el.style.transitionDelay = el.dataset.delay;
});
```

---

## Checklist for Every Generated Presentation

1. `<!DOCTYPE html>` present
2. `<meta name="viewport">` present
3. Google Fonts link for Montserrat + Open Sans
4. All CSS variables defined in `:root`
5. Viewport fitting CSS (scroll-snap, slide height, overflow hidden)
6. Every `<section>` has `class="slide"` + a background class (`slide-dark`, `slide-light`, `slide-green`)
7. Every slide has the template logo — use images from the folder matching the selected template: `reference/assets/Palo IT/` for PALO IT, `reference/assets/Gen-e2 Dark/` for Gen-e2 Dark, `reference/assets/Gen-e2 Light/` for Gen-e2 Light. Never mix asset folders across templates.
8. Navigation buttons present (`#prevBtn`, `#nextBtn`)
9. Progress bar and progress info elements present
10. SlideEngine class instantiated on `DOMContentLoaded`
11. No external CSS or JS files — everything inline
12. No scrollbars visible on any slide
