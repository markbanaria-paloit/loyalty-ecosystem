---
name: visual-quality
description: 'Apply high-level visual design principles to assess and improve UI features and flows — making interfaces look intentional, balanced, and polished. Use when auditing an existing UI, improving a screen or flow, reviewing mockups or wireframes, or applying design polish. Triggers on: visual quality, design review, improve UI, polish, hierarchy, spacing, alignment, contrast, density, layout critique, visual audit, design principles, responsive, responsive design, mobile layout, breakpoint, reflow, adapt to mobile, make this look better, improve this design.'
---

# Visual Quality

Principles that make any interface look intentional, balanced, and polished — regardless of brand, product type, or technology stack.

**Relationship to design system skills**: When a project-scoped design system skill is also present, defer to it for specific token values (colours, type sizes, spacing steps, radii, shadows). Apply the principles below on top of whatever tokens that system provides. This skill does not define tokens — it defines how to use them well.

---

## 1. Visual Hierarchy

The eye needs a clear pecking order. If everything is the same weight, nothing communicates priority.

**Principles**
- Define the content hierarchy first — before applying visual treatments. Know what is most important before deciding how to emphasise it.
- No two text levels should compete for attention at the same visual weight.
- Use size, weight, and contrast together — not independently — to signal importance.
- A clear H1 → H2 → body → caption progression is the minimum viable hierarchy.
- Reduce, don't inflate: when elements fight, remove weight rather than add more.
- Limit dominant (largest/heaviest) elements to a maximum of 2 per view. If more than 2 elements are competing for dominance, the hierarchy collapses.
- Typography within a single font family can carry significant hierarchy — weight, style (italic, small caps), and subtle colour shifts differentiate levels without introducing a second typeface. Limit to 1–2 fonts per interface. Always apply the same type variant (bold, italic, small caps) for the same purpose, consistently across screens.
- Mixed type treatments within a single headline should be limited to 2 treatments maximum. Beyond that, the treatments compete rather than direct.
- Hierarchy lives in the template AND in the content. Real content — especially strong photographic colour or high-contrast imagery — can override structural hierarchy. Check hierarchy with representative content in place, not just with placeholder copy.

**Checks**
- Is the content hierarchy defined before visual treatments are applied?
- Is the body text clearly subordinate to headings without disappearing entirely?
- Does bold/colour/size feel earnt, or is it used for decoration?
- Are there more than 2 dominant elements? If so, which should recede?
- Does real content (photos, data, long text) disrupt the intended hierarchy?

---

## 2. Spacing & Rhythm

Inconsistent spacing reads as careless. Consistent spacing reads as structured — even when users can't articulate why.

**Principles**
- All spacing decisions should resolve to a base unit (4px or 8px grid is standard). Never use arbitrary values.
- Spacing signals relationship: elements closer together belong together; more space = more separation.
- Grouping can be implicit (proximity and whitespace alone) or explicit (a border, background fill, or container). Prefer implicit grouping where it is sufficient — explicit containers add visual weight and should be used sparingly.
- Use less space between a heading and its content, and more space between groups. The spatial relationship should communicate the hierarchy without labels.
- An element with significant space around it commands attention — isolation is emphasis. Use this intentionally.
- Vertical rhythm matters as much as horizontal. Line-height, paragraph spacing, and section gaps should feel part of the same system. For body text, a line-height slightly above the default creates an airy, readable block; collapsing it produces dense, fatiguing text.
- Tight spacing between unrelated elements creates confusion. Generous spacing between related elements weakens grouping.

**Checks**
- Do all spacing values reduce to multiples of the base unit?
- Does the whitespace tell the correct grouping story without labels?
- Where explicit containers (borders, backgrounds) are used, could whitespace alone have done the job?
- Is there a consistent internal padding pattern within components (cards, modals, lists)?
- Does any element read as isolated when it shouldn't — or grouped when it should stand apart?

---

## 3. Scale & Proportion

Arbitrary sizing breaks the visual logic of a design. Everything should be sized relative to something.

**Principles**
- Use a type scale with a consistent ratio (e.g. 1.25 or 1.333 Major Third / Perfect Fourth). Avoid one-off font sizes.
- A practical rule: use no more than 3 type sizes to establish hierarchy — small (body/caption), medium (subheading), large (heading). Three levels provide sufficient variety while keeping hierarchical relationships clear.
- Limit big or dominant elements to a maximum of 2 per view. When more than 2 elements are large, they stop standing out — size signals hierarchy only when it contrasts with the surrounding context.
- Component sizes should be proportional to their container and content — not fixed to a convenient pixel value.
- Icon, illustration, and image sizes should align to the grid and feel intentional relative to surrounding text.
- Avoid the "just make it bigger" instinct — scale within the system.

**Checks**
- Does every font size belong to the defined scale?
- Are there more than 3 distinct text sizes in use? If so, can any be consolidated?
- Are there more than 2 dominant (large/heavy) elements competing for attention?
- Are interactive targets (buttons, form fields) proportionally consistent across the same context?
- Do element sizes feel deliberate, or arbitrary?

---

## 4. Contrast & Emphasis

Every view needs one dominant element. Multiple elements competing for primacy create visual noise.

**Principles**
- Identify the single most important action or piece of information per view. Give it the strongest visual treatment; everything else recedes.
- Create a reading path: entry point → supporting detail → action. The eye should move through the screen in a logical sequence.
- Use contrast (size, weight, colour, space) to guide attention — not decoration.
- Avoid high-contrast styling for low-priority elements.

**Checks**
- Where does the eye land first on this screen? Is that the right place?
- Is there more than one "primary" call to action? (If yes, one should become secondary.)
- Can you rank every element on the screen from most to least important? Does the visual treatment reflect that ranking?

---

## 5. Alignment

Unaligned elements feel accidental. Alignment creates implicit structure that users feel even when invisible.

**Principles**
- Every element should belong to a grid column, a defined margin, or a deliberate relationship with another element.
- Left-aligned body text is the default for reading. Centre-align sparingly (short headings, empty states, marketing moments). Right-align only for numerics in tables.
- When breaking alignment deliberately, the break should be obvious enough to read as intentional — not accidental.
- Mixed alignments within a single section read as inconsistency, not variety.

**Checks**
- Do all elements resolve to a shared baseline or grid?
- Are there any elements that appear "floated" — unanchored to a visible or implied structure?
- Does text alignment match the reading context?

---

## 6. Density Calibration

The right information density depends entirely on the user's context and task. There is no universally correct density.

**Principles**
- Data-heavy tools (analytics dashboards, admin panels, dev tools) can carry higher density — users are on desktop, in context, actively scanning.
- Consumer apps and onboarding flows should breathe — high density implies complexity and raises cognitive load.
- Whitespace is a design element, not an absence of one. It communicates calm, priority, and focus.
- Never fill space for the sake of filling it. Empty space that serves no purpose can often be removed — but whitespace that creates focus should be protected.

**Checks**
- Does the density of this screen match the context and task type?
- Is whitespace being used to direct focus, or is it just leftover?
- Would a user in this context feel overwhelmed, or appropriately informed?

---

## 7. Colour Use

Colour is powerful precisely because it is rare. Overuse neutralises its effect.

**Principles**
- Use colour to carry meaning (status, action, category, severity) — not decoration.
- Colour should never be the only differentiator between states or information types. Always pair it with a secondary signal: icon, label, pattern, or position.
- Saturation signals importance: bright, saturated colours advance and draw attention; muted, desaturated colours recede. Reserve warm bright colours (especially red-family) for warnings, errors, or destructive actions.
- Limit the active palette: in most UI contexts, 2 primary and 2 secondary colours is sufficient. More colours of similar saturation reduce the perceived hierarchy among elements.
- Apply no more than 3 contrast variations across a design (e.g. strong contrast for headings, medium for body, low for secondary text). If everything is high contrast, nothing stands out.
- A neutral palette with one intentional accent outperforms a multi-colour palette used inconsistently.
- Establish a clear semantic map: which colour signals action? Which signals warning? Which signals success? Never break that map.
- Accessibility minimum: 4.5:1 contrast ratio for normal text; 3:1 for large text and UI components. Reducing text contrast to de-emphasise content reduces legibility and may create accessibility failures — use opacity or weight changes instead.

**Checks**
- Can a colour-blind user interpret every piece of information on this screen?
- Are bright/saturated colours reserved for the most important elements?
- Is the palette using more than 3 distinct contrast levels? If so, does each level serve a clear purpose?
- Is colour being used for decoration or for meaning?
- Does the colour usage follow a consistent semantic map, or has colour accrued over time without a system?

---

## 8. Balance

A design can have clear hierarchy and still feel visually unstable if one area dominates the layout disproportionately.

**Principles**
- Balance is the satisfying distribution of visual weight across the composition. It is not the same as symmetry — asymmetric layouts can be balanced.
- Visual weight is determined by size, contrast, colour saturation, and density. A small high-contrast element can balance a large low-contrast one.
- Symmetrical balance feels stable and structured. Asymmetrical balance feels dynamic and engaging. Choose based on the tone the product needs to convey.
- In a balanced layout, no single area draws the eye so completely that other areas become invisible — even if some elements carry more weight and serve as focal points.
- Balance works in both axes. Evaluate horizontal balance (left vs right) and vertical balance (top vs bottom) separately.

**Checks**
- If you draw a vertical axis through the centre of the screen, is visual weight roughly distributed across both sides? (Not necessarily equally, but not entirely one-sided.)
- Does the layout feel stable, or does one area pull the eye completely away from the rest?
- Is any content area invisible or overlooked because another area dominates too strongly?
- Does the type of balance (symmetrical vs asymmetrical) match the tone of the product?

---

## 9. Consistency Signals

Users build a mental model of your product through repeated patterns. Deviation from those patterns demands cognitive effort.

**Principles**
- Repeated visual patterns create trust. If a card looks one way in one part of the product, it should look the same everywhere.
- Deviation from a pattern should be deliberate and meaningful — signalling something genuinely different, not just a different designer's preference.
- Inconsistency in spacing, alignment, or type treatment reads as unfinished, even when the individual screens are well-designed.
- Audit drift regularly: the longer a product lives, the more one-off exceptions accumulate. Periodic consolidation is healthy.

**Checks**
- Do the same component types look and behave consistently across the product?
- If something looks different, is there a good reason?
- Is any inconsistency invisible to users (implementation detail) or visible (breaks the mental model)?
- Is inter-element spacing consistent across equivalent screens and states? (Spacing inconsistency is one of the most common markers of an unfinished design.)

---

## 10. Responsive Structure

A layout that only scales is not responsive. Below a breakpoint, the **structure** must change — not just the dimensions of the same structure.

**Principles**
- Reflow, don't shrink. A three-column grid does not become a three-column grid with narrower columns — it becomes one column. Shrinking preserves a layout that was designed for a different amount of space.
- Design mobile-first. Start from the narrowest supported width and add structure as space becomes available. Retrofitting media queries onto a desktop layout produces a compromised version of both.
- Hierarchy is re-derived at each breakpoint, not inherited. What sits in a desktop sidebar is peripheral because of where it is; stacked on mobile it lands in the primary reading path. Decide deliberately whether it belongs above the fold, below the content, or behind a disclosure.
- Breakpoints belong where the layout breaks, not at device names. Widen the viewport until the composition stops working — that is the breakpoint. Device-named breakpoints date instantly.
- Adapt the navigation pattern, not just its size. Horizontal top nav, persistent sidebars, and hover menus have no viable narrow-width equivalent — they become bottom navigation, a drawer, or a disclosure.
- Tables and dense data need a different representation on narrow widths — stacked key/value cards, a prioritised subset of columns, or a detail view. Horizontal scroll inside a table is a last resort, never the default.
- Multi-column forms become single-column. Side-by-side fields at narrow width halve the target size of both.
- Content order is a design decision. Source order drives both the stacked visual order and the screen reader order — do not rely on visual reordering to fix a wrong source order.
- Touch is the primary input at narrow widths. Anything that only exists on hover is unreachable; primary actions belong within thumb reach, not pinned to the top corner.
- Density recalibrates per breakpoint. The same padding that reads as comfortable on desktop reads as wasteful on a phone; the same tap target that is generous on a phone reads as clumsy on desktop.

**Checks**
- At the narrowest supported width, does any content overflow horizontally or force a page-level sideways scroll?
- Does the layout genuinely restructure at each breakpoint — columns collapsing, navigation changing pattern, disclosure appearing — or is it the same arrangement at a smaller scale?
- Is the stacked order at narrow width the correct priority order, or an accident of the desktop layout?
- Does the navigation pattern change to something operable by touch, or is it a compressed version of the desktop nav?
- Are all interactive targets at or above the platform minimum at the narrow width, with adequate spacing between adjacent targets?
- Is any action, state, or content reachable only via hover?
- Do tables, charts, and dense data have a deliberate narrow-width representation?
- Does the layout still hold at 200% browser zoom and at the platform's largest text setting, without clipping or overlap?
- Are images, media, and long unbroken strings (URLs, IDs, emails) constrained so they cannot force overflow?

---

## Assess & Improve Procedure

This skill operates in two phases: **audit first, then improve**. Do not jump to improvements without completing the audit — the audit determines where effort has most impact.

### Phase 1: Audit

Work through each check in order. Note issues against the principle they violate.

1. **Squint test** — Blur your vision or mentally blur the screen. What are the 2–3 things that remain visually prominent when detail disappears? Are those the right elements? This technique surfaces unintended hierarchy: a strong-colour image or oversized element may dominate even if it is structurally secondary. Run the squint test on the template and again with real content in place.
2. **Hierarchy check** — Define the intended content hierarchy (most → least important). Does the visual weight of each element match its position in that hierarchy? Are there more than 2 dominant elements?
3. **Balance check** — Is visual weight roughly distributed across the layout? Does one area pull the eye so strongly that the rest becomes invisible?
4. **Spacing pass** — Do all spacing values follow the base unit? Does spacing tell the correct grouping story? Is the relationship between heading spacing and content spacing communicating hierarchy?
5. **Alignment pass** — Is every element anchored to a grid or a deliberate relationship?
6. **Density read** — Is the information density appropriate for the user context and device?
7. **Responsive pass** — View the layout at the narrowest supported width. Does it restructure, or merely shrink? Check for horizontal overflow, stacked order, navigation pattern change, touch target sizes, hover-only affordances, and dense-data handling. Then step through each breakpoint upward and confirm each transition is deliberate.
8. **Colour audit** — Is colour used for meaning? Are saturated colours reserved for important elements? Is there a non-colour alternative for every colour signal?
9. **Consistency check** — Do component patterns, spacing, and typographic treatments match elsewhere in the product or flow?
10. **Emphasis test** — Is there one clear entry point? One primary action?

Tie every issue to one of the ten principles. Flag by principle, not by personal preference.

### Phase 2: Improve

Once the audit is complete, apply improvements in priority order:

- **High priority**: Issues that break the reading path, create ambiguity, or actively mislead the user. Fix these first.
- **Medium priority**: Issues that reduce polish or create inconsistency. Address after high-priority items.
- **Low priority**: Refinements that add quality but don't affect comprehension. Apply if time and scope allow.

When making improvements:
- Justify each change by referencing the principle it addresses.
- Prefer the minimum effective change — do not redesign what is working.
- If a design system skill is active, ensure improvements use the tokens it defines rather than introducing new values.
- If a specific token or value is not available in the design system, note the gap rather than improvising.

---

## Output Format

Structure output as audit followed by improvements:

```
## Visual Quality Assessment

### What's Working
- [Principle]: [Observation — why it works]

### Issues Found
| Priority | Principle | Observation | Improvement |
|----------|-----------|-------------|-------------|
| High | Visual Hierarchy | ... | ... |
| Medium | Spacing & Rhythm | ... | ... |
| Low | Alignment | ... | ... |

## Improvements Applied
[Description of changes made, grouped by principle. Each change references the issue it resolves.]

### Design System Notes
[Any token gaps or conflicts with the active design system skill, if applicable.]
```

Every improvement must reference the principle it addresses. Do not make changes that cannot be justified by one of the ten principles.
