---
name: content-design
description: 'Audit and rewrite interface copy — labels, errors, empty states, tooltips, buttons, confirmations, loading states — so it is clear, appropriately toned, and consistent. Use when reviewing or writing UI copy, microcopy, or content design for any screen or flow. Triggers on: content design, UX writing, copy review, microcopy, interface copy, button label, CTA, error message, empty state, tooltip, form label, helper text, confirmation dialog, destructive action, loading copy, capitalisation, sentence case, internationalisation, i18n, plain English, tone of voice, content audit, rewrite copy, improve copy, copy, labels, content.'
---

# Content Design

Principles and procedures for writing interface copy that is clear, appropriately toned, and consistent — regardless of platform, brand, or technology stack.

**Relationship to design system skills**: When a project-scoped design system skill is also active, defer to it for brand-specific vocabulary, approved terminology lists, and product-specific tone of voice rules. Apply the principles below on top of whatever guidance that system provides. This skill does not define brand voice — it defines how to write good interface copy by default, and how to apply client voice when it is provided.

---

## Tone of Voice Default

Unless a client brand tone of voice document or style guide is provided, apply this baseline:

- **Clear**: Say what you mean. One idea per sentence.
- **Direct**: Lead with the action or outcome. Don't bury it.
- **Friendly**: Warm without being performative. Never sycophantic.
- **Human**: Write like a competent person talking to another person.
- **Plain English**: Use the simplest word that is accurate. Prefer "use" over "utilise", "start" over "commence".
- **Domain-appropriate**: Technical language is acceptable when the audience expects it and it is precise. Avoid jargon when plain terms exist.

When a client provides a brand tone of voice document, read it and adjust voice accordingly. Principles of clarity and accuracy are never overridden — only register and personality adapt.

---

## How Users Read

Users scan — they do not read linearly. Eyetracking research identifies four main scanning patterns: **F-pattern** (left- and top-weighted; the most common), **spotted pattern** (fixating on visually distinct words), **layer-cake pattern** (scanning headings and subheadings, then diving in selectively), and **commitment pattern** (reading most of the content).

The **layer-cake pattern** is the most effective for users trying to find what they need. Write all interface copy to support it: descriptive headings and subheadings are the primary navigation mechanism — make every one scannable enough to stand alone.

These patterns have direct implications for copy structure at every level of the interface.

### Front-load everything

In the F-pattern, users typically see about 2 words on the left side of a list before moving on. The first word — and ideally the first 11 characters — must communicate enough meaning to stand alone.

- Lead with the meaningful word: "Download report", not "Click here to download the report"
- Never start labels, links, or headings with articles or filler words: not "The latest report", not "You can find your settings here"
- Apply to buttons, navigation labels, list items, headings, and link text throughout

### Satisficing

Users take the first reasonable option they encounter — they do not evaluate everything before deciding. This is satisficing, and it is rational behaviour. Write copy that supports it rather than assuming users will read to the end:

- Use the inverted pyramid: most important information first, supporting detail after
- Do not bury the key message or the available action at the end of a paragraph or sentence
- Assume users stop reading after the first sentence or two — make those words count
- Succinct summaries and direct calls to action outperform thorough explanations

### Plain language

Even highly educated or specialist audiences prefer simpler language. The ability to read complex content does not mean preference for it. Always look for opportunities to simplify:

- Use the simpler word: "use" not "utilise", "start" not "commence", "show" not "display"
- Cut unnecessary words — shorter sentences reduce cognitive load
- Technical terminology is acceptable when the audience requires it; everything around it should still follow plain language principles

### Mobile

Reading comprehension on mobile is broadly comparable to desktop, but difficult content takes longer to process. The constraint is screen real estate, not attention:

- Prioritise brevity — every word must earn its place
- Shorter sentences and simpler language matter more on mobile, not less
- Apply the front-loading principle more aggressively: less space means less tolerance for preamble
- Do not assume mobile users are disengaged — assume they have less room

---

## 1. Button & CTA Copy

Buttons tell users what will happen when they act. Vague or passive labels create hesitation.

**Principles**
- Every button label is a verb-led phrase that describes the specific outcome: "Save changes", "Send message", "Delete account".
- Labels are specific to context — not generic: "Continue" is weaker than "Continue to payment"; "Submit" tells the user nothing about what they are submitting.
- Destructive or irreversible actions must name the thing being acted on: "Delete project", not "Confirm".
- Never use "Click here", "Learn more", or "Read more" without qualifying context. These are accessibility failures as well as copy failures.
- Pair primary and secondary actions so they contrast clearly: "Save changes" / "Discard" — not "Save changes" / "Cancel" when cancel is ambiguous.
- Keep labels short: 1–4 words is the target. Five is acceptable. More than five suggests the action is poorly defined.
- Front-load the meaningful word. The first 11 characters of a label should communicate enough meaning to stand alone.

**Never**
- "Submit" (submit what?)
- "OK" for consequential actions
- "Yes" / "No" without restating the question
- "Click here" or "Tap here"
- "Learn more" as a standalone label

**Rewrites**
| Before | After |
|--------|-------|
| Submit | Save changes |
| Confirm | Delete project |
| Click here to continue | Continue to payment |
| Learn more | How billing works |
| Yes | Yes, delete my account |

**Checks**
- Does the label start with a verb?
- Could this label appear on any other button in the product and still make sense? (If yes, it is too generic.)
- Does it name the thing being acted on for destructive actions?
- Do the first 11 characters communicate enough meaning to stand alone?

---

## 2. Error Messages

Error messages are the most frequently ignored and most consequential copy in any product.

**Principles**
- Every error message answers three questions: what went wrong, why, and what to do next. Keep these answers short — assume the user will read the first sentence and act on it.
- Apply the inverted pyramid: lead with what the user can do, then the explanation if needed. "Check your connection and try again — we couldn't reach the server" is more useful than the reverse.
- Do not blame the user. Rephrase from "You entered an invalid email" to "That email address doesn't look right — check it and try again."
- No technical jargon, error codes, or system messages visible to end users. Translate stack traces and validation codes into human language.
- For form validation: be specific about which field failed and why, rather than showing a generic "There was a problem" at the top.
- Errors that can be retried should say so. Errors that require a different action should say what action.
- If an error is temporary (network failure, server timeout), say it is temporary and what to do ("We couldn't connect — check your connection and try again").

**Rewrites**
| Before | After |
|--------|-------|
| Invalid input | That doesn't look right — phone numbers should be in the format 07700 900000 |
| You entered an invalid email address | That email address doesn't look right — check it and try again |
| Error 422: Unprocessable entity | Something went wrong with your submission — try again or contact support |
| This field is required | Enter your date of birth to continue |
| Network error | We couldn't connect. Check your internet connection and try again |

**Checks**
- Does the message explain what went wrong?
- Does it say what to do next?
- Is it blame-free?
- Is it free of technical jargon and error codes?
- Is it specific to the field or action that failed?

---

## 3. Empty States

Empty states are UX writing moments that are frequently wasted. "No results found" tells the user nothing useful.

**Principles**
- Every empty state explains why it is empty and what the user can do about it.
- Distinguish between types of empty state and write copy accordingly:
  - **No data yet** (first use): Encourage and guide — "You haven't created any projects yet. Start your first one below."
  - **Search / filter returned nothing**: Acknowledge what was searched and suggest an action — "No results for 'invoice template'. Try a different search or browse all templates."
  - **Completed / cleared**: Affirm the empty state positively — "You're all caught up. New notifications will appear here."
  - **Error or access issue**: Explain the cause and what to do — "We couldn't load your files. Refresh the page or try again later."
- Empty states are not the place to be clever. Be clear first. Warmth is acceptable; humour is optional and should be used sparingly.

**Rewrites**
| Before | After |
|--------|-------|
| No results found | No results for "[query]". Try a different search or clear your filters. |
| Nothing here yet | You haven't added any team members yet. Invite someone to get started. |
| No notifications | You're all caught up — no new notifications. |
| No data available | We couldn't load your data. Refresh the page or try again in a moment. |

**Checks**
- Does the copy explain why the state is empty?
- Does it tell the user what they can do next?
- Is it appropriate for the type of empty state (first-use vs. no-match vs. cleared)?

---

## 4. Form Labels & Helper Text

Forms are where copy failures most directly cause task abandonment.

**Principles**
- Labels must always be visible — never rely solely on placeholder text as a label. Placeholders disappear on input and are inaccessible.
- Labels are concise nouns or noun phrases: "Date of birth", "Company name", "Email address". Not full sentences.
- Helper text is for format expectations and context that is not obvious from the label alone: "e.g. 01/01/1990", "As it appears on your passport", "We'll only use this for account recovery".
- Helper text is not a pre-emptive error message. Do not use it to list validation rules — that is what error messages are for.
- Placeholders (when used alongside labels) can show an example but should not repeat the label: label "Phone number", placeholder "e.g. 07700 900000".
- Required vs optional: mark the minority. If most fields are required, mark optionals "(optional)". If most are optional, mark required.
- Avoid "*  Required" footnotes at the bottom of long forms — mark at the field level.

**Rewrites**
| Before | After | Note |
|--------|-------|------|
| Enter your email | Email address | Placeholder used as label — replace with visible label |
| DOB | Date of birth | Expand abbreviations |
| Password must be 8+ chars with a number | [Helper text] e.g. 8 characters, including at least one number | Move to helper text, not into label |
| Name * (see below) | Full name (required) | Mark requirement at field level |

**Checks**
- Is every field labelled with visible text (not just placeholder)?
- Are abbreviations expanded?
- Does helper text provide format guidance, not validation rules?
- Is required/optional status marked clearly at field level?

---

## 5. Confirmation & Destructive Actions

Confirmations must make the outcome clear. Vague confirmations ("Are you sure?") create anxiety without reducing errors.

**Principles**
- Destructive action dialogs name the thing being destroyed in both the title and the confirm button: "Delete project?" / "Delete project" — not "Are you sure?" / "Yes".
- Confirm button copy matches the title action — never "OK" or "Confirm" for destructive outcomes.
- The title is a question only when a genuine choice is being made. For irreversible actions, the title can be a statement of consequence: "This will permanently delete all files in this folder."
- Non-destructive confirmations state the outcome, not just the action: "Your changes have been saved" or "Subscription cancelled — you'll have access until 31 December."
- Include undo or recovery paths where they exist. If something is irreversible, say so explicitly.

**Rewrites**
| Before | After |
|--------|-------|
| Are you sure? [Yes] [No] | Delete "Q4 Report"? This can't be undone. [Delete file] [Keep file] |
| Confirm action [Confirm] [Cancel] | Remove team member? They'll lose access immediately. [Remove] [Keep access] |
| Success! [OK] | Changes saved. You can edit these at any time from Settings. |

**Checks**
- Does the title name what is being destroyed or changed?
- Does the confirm button label match the action (not "OK" or "Confirm")?
- Is the outcome stated, not just the action?
- Are irreversible actions labelled as such?

---

## 6. Tooltips & Microcopy

Tooltips and microcopy should add context that isn't obvious — not restate what is already visible.

**Principles**
- A tooltip that restates the label it is attached to adds no value and wastes the user's time.
- Use tooltips to explain: what an unfamiliar term means, what happens when an action is taken, why information is being collected, or what format is expected.
- Keep tooltips to one or two short sentences. If it requires more, the interface may need structural changes, not more tooltip text.
- Microcopy (small inline context) near form fields or actions should answer the "why" question the user is likely asking at that moment.
- Microcopy for privacy-sensitive fields should be brief and reassuring: "We'll never share your number" rather than a legal statement.
- Avoid passive voice in tooltips. "This syncs your data" is clearer than "Data is synced by this setting."

**Rewrites**
| Before | After |
|--------|-------|
| Export [tooltip: Export] | Export [tooltip: Download your data as a CSV file] |
| Notifications [tooltip: Notifications settings] | Notifications [tooltip: Choose how and when we contact you] |
| [privacy note] Your data is protected by our privacy policy | We use this to verify your identity. We'll never share it. |

**Checks**
- Does the tooltip add information not visible in the label?
- Is it under two sentences?
- Does it answer a question the user is likely asking at this moment?

---

## 7. Loading & Progress Copy

Generic loading copy is a missed opportunity to reduce anxiety and set expectations.

**Principles**
- Loading copy should be contextual — describe what is actually happening: "Uploading your file…", "Connecting to your account…", "Generating your report…".
- Avoid "Loading…" or "Please wait…" alone — they communicate nothing about duration or what is happening.
- For multi-step processes, show progress: "Step 2 of 4: Verifying your details" is better than an indeterminate spinner.
- If a process takes longer than expected, acknowledge it: "This is taking longer than usual — almost there."
- Error states following a load failure must use the same principles as error messages (see Section 2).

**Rewrites**
| Before | After |
|--------|-------|
| Loading… | Loading your dashboard… |
| Please wait | Uploading your file — this may take a moment |
| Processing | Saving your changes… |
| [no copy, just spinner] | Connecting to your account… |

**Checks**
- Does the copy describe what is happening, not just that something is happening?
- For long processes, is there any estimate or progress indication?
- Is the copy specific to this action, not reused generically?

---

## 8. Capitalisation

Inconsistent capitalisation signals a lack of craft and breaks users' mental models.

**Principles**
- **Sentence case** is the default for all UI copy: labels, buttons, headings, helper text, error messages, tooltips. Only the first word and proper nouns are capitalised.
  - Correct: "Save changes", "Date of birth", "Add team member"
  - Incorrect: "Save Changes", "Date Of Birth", "Add Team Member"
- **Title Case** is reserved for proper nouns (product names, company names, named features if they are branded).
- Navigation labels follow sentence case: "Account settings", not "Account Settings".
- Error messages, tooltips, and helper text follow sentence case.
- Consistency within a screen matters more than any individual capitalisation choice. A mix of sentence case and title case on one screen reads as unfinished.

**Exceptions**
- Acronyms and initialisms retain their conventional casing: "API", "CSV", "VAT", "ID".
- Branded feature names may use Title Case if that is the established brand convention (defer to the design system skill if active).

**Checks**
- Is sentence case applied consistently across all labels, buttons, and headings?
- Are there any instances of Title Case that are not proper nouns or branded feature names?
- Are there mixed capitalisation patterns within the same screen or component?

---

## 9. Internationalisation (i18n) Framework

Copy written only for one language or locale creates structural debt when the product expands globally.

**Principles**
- **Write for translation from the start.** Avoid idioms, puns, colloquialisms, and culturally specific references in core UI copy. These rarely translate and create inconsistency at scale.
- **Avoid concatenated strings.** "Your [plan] has been activated" becomes a grammatical nightmare in languages with gendered nouns or different word order. Write complete sentences.
- **Leave room for text expansion.** German, Finnish, and many other languages expand English copy by 30–50%. UI elements must accommodate this — flag any layouts where copy length is load-bearing.
- **Date, time, and number formats** must be locale-sensitive: `DD/MM/YYYY` (UK) vs `MM/DD/YYYY` (US) vs `YYYY-MM-DD` (ISO). Never hardcode format patterns into copy.
- **Currency, units, and address formats** must be treated as locale variables, not hardcoded strings.
- **RTL readiness**: designs intended for Arabic, Hebrew, or Persian markets must account for right-to-left text direction. Flag any directional language in copy ("swipe left", "see the panel on the right") for revision.
- **Placeholders and variables** in translatable strings must be clearly marked and documented: `{{user_name}}`, `{{file_count}}`. Avoid positional variables when word order may change.
- **Pluralisation**: handle plural forms via i18n library plural rules, not `item(s)` or `1 item / 2 items` hardcoded in English logic. Many languages have more than two plural forms.

**Flags for engineering handoff**
- Identify all hardcoded strings that should be externalised.
- Flag date, time, number, and currency values for locale formatting.
- Flag any text that changes meaning under RTL.
- Document variable names and types for all dynamic string insertions.

**Checks**
- Does any copy rely on idioms or culturally specific references?
- Are there concatenated strings that will fail in non-English languages?
- Are date/time/number formats hardcoded?
- Does the layout accommodate 30–50% text expansion?
- Are variable placeholders documented and named consistently?

---

## Audit & Rewrite Procedure

This skill operates in two phases: **audit first, then rewrite**. Flag issues, then fix them. Do not rewrite without completing the audit — the audit determines scope and priority.

### Phase 1: Audit

Review each category below. Flag every issue against the principle it violates.

1. **Scanning pass** — Is copy front-loaded? Do headings, labels, and list items lead with the meaningful word? Would the first 11 characters of each label or heading stand alone? Are there filler words or articles at the start of labels?
2. **Button & CTA scan** — Are labels verb-led and specific? Any "Submit", "OK", or "Click here"?
3. **Error message check** — Do errors lead with what the user can do? Do they explain what went wrong and what to do next? Any blame or jargon?
4. **Empty state review** — Does each empty state explain the state and offer a path forward? Is the most useful content first?
5. **Form label & helper text check** — Are labels always visible? Is helper text format-focused, not validation-focused?
6. **Confirmation & destructive action review** — Do dialogs name what is being destroyed? Do buttons match the action?
7. **Tooltip & microcopy scan** — Do tooltips add context beyond the label? Are they concise?
8. **Loading & progress copy check** — Is copy contextual and specific?
9. **Plain language pass** — Are there unnecessary words, long sentences, or complex vocabulary where simpler alternatives exist?
10. **Capitalisation pass** — Is sentence case applied consistently?
11. **i18n flag** — Are there idioms, concatenations, or hardcoded locale values?

Flag issues with: **category | severity (High / Medium / Low) | observation | suggested rewrite**.

### Phase 2: Rewrite

Once the audit is complete, apply rewrites in priority order:

- **High**: Copy that misleads, blames, confuses, or prevents task completion. Fix immediately.
- **Medium**: Copy that is vague, generic, or inconsistent. Reduces quality but does not block tasks.
- **Low**: Capitalisation inconsistencies, minor tone improvements, or copy that works but could be sharper.

For every rewrite:
- Show the original and the revised copy side by side.
- Reference the principle or section the rewrite addresses.
- If a client tone of voice document is active, check the rewrite against it before finalising.
- If a design system skill is active and defines approved terminology, ensure rewrites use approved terms.

---

## Output Format

Structure output as audit followed by rewrites:

```
## Content Design Assessment

### What's Working
- [Category]: [Observation — why it works]

### Issues Found
| Priority | Category | Original copy | Issue | Rewrite |
|----------|----------|---------------|-------|---------|
| High | Error messages | "Invalid input" | No explanation of what is wrong or what to do | "That phone number doesn't look right — use the format 07700 900000" |
| Medium | Button labels | "Submit" | Not specific to the action | "Submit application" |
| Low | Capitalisation | "Save Changes" | Title Case applied to a UI action | "Save changes" |

## Rewrites Applied
[All revised copy, grouped by category. Each rewrite references the issue it resolves.]

### Tone of Voice Notes
[If a client tone of voice document was referenced, note how it influenced the rewrites. If no brand guidance was provided, note that the baseline tone was applied.]

### Design System Notes
[Any terminology conflicts or gaps with the active design system skill, if applicable.]

### i18n Flags
[Any strings flagged for translation risk, locale formatting, or RTL consideration.]
```

Every rewrite must reference the principle or category it addresses. Do not rewrite copy that cannot be improved — note what is working and why.

---

## Self-Audit Quick Check

Run this during implementation self-audit (Design Agent Step 9). It is a lightweight gate — not a replacement for Phase 1 Audit, which remains the standard for full standalone content reviews.

Scan every visible piece of copy in the implementation:

- [ ] **Buttons & CTAs**: every label starts with a verb and names the specific outcome — no "Submit", "OK", "Confirm", or "Click here"
- [ ] **Front-loading**: the first 11 characters of every label, heading, and list item communicate enough meaning to stand alone
- [ ] **Error messages**: lead with what the user can do next; blame-free; free of technical jargon and error codes
- [ ] **Empty states**: explain why the state is empty and offer a clear path forward — not just "No results found"
- [ ] **Form labels**: every field has a visible, always-present label — placeholder text alone is not a substitute
- [ ] **Destructive actions**: dialog title and confirm button both name what is being destroyed — not "Are you sure?" / "Confirm"
- [ ] **Tooltips**: add information not already visible in the label — no restating the label verbatim
- [ ] **Loading copy**: describes what is specifically happening — not just "Loading…" or "Please wait"
- [ ] **Capitalisation**: sentence case applied consistently throughout — no Title Case on UI actions, labels, or headings unless a proper noun or branded feature name
- [ ] **i18n**: no hardcoded date, time, number, or currency formats; no idioms or culturally specific references in core UI copy
