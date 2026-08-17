---
name: gen-e2-ux-best-practice
description: >
  UX/UI best practice reference for mobile apps, web apps, dashboards, and enterprise tools.
  Load this skill when reviewing a user flow or UI design, planning research activities,
  conducting a heuristic evaluation, or making design recommendations during discovery.
  Covers: navigation & IA, onboarding, forms, dashboards, empty states & errors, AI interfaces.
  Output format: principles + real-world examples of who does it well and why.
---

This skill provides UX/UI best practice across the patterns most common in mobile, web, and enterprise product work. Use it to evaluate existing interfaces, generate recommendations, identify gaps in a proposed flow, or brief a designer on what good looks like in a given area.

When applying this skill, always:
1. Identify which pattern area(s) are relevant to the current task
2. State the principle clearly
3. Explain why it matters (the user or business impact)
4. Reference a real-world example of it done well
5. Flag where the current design or flow does or does not meet the standard

---

## 1. Navigation & Information Architecture

### Principle: Match the navigation model to the task frequency
Structure navigation around what users do most, not how the business is organised internally. The most frequent tasks should require the fewest taps or clicks.

**Why it matters:** Cognitive load increases when users have to hunt. Navigation that mirrors org structure forces users to learn the company, not the product.

**Who does it well:**
- **Slack** — frequent actions (messaging, switching channels) are one tap; settings and admin are buried deliberately
- **Linear** — sidebar IA reflects workflow stages (backlog → active → done), not feature categories
- **Xero** — enterprise accounting tool that surfaces the 4–5 tasks 80% of users do daily in the top nav, with everything else in secondary menus

**Apply when:** Reviewing an IA proposal, auditing an existing nav, or planning IA research activities.

---

### Principle: Use progressive disclosure for complex information hierarchies
Show only what the user needs at each step. Reveal more detail on demand, not upfront.

**Why it matters:** Enterprise and internal tools especially suffer from "show everything" IA that overwhelms new users and slows down experienced ones.

**Who does it well:**
- **Notion** — a deeply complex tool with a near-empty default state; complexity reveals as you use it
- **Salesforce (Lightning)** — uses collapsible panels and drill-down patterns to manage genuinely vast data without paralysing the screen
- **Apple Settings** — a masterclass in hierarchical IA; top level is simple, depth is available but never forced

**Apply when:** The product has a large feature set, multiple user roles, or data-heavy views.

---

### Principle: Persistent navigation for apps; contextual navigation for flows
Apps users return to repeatedly need persistent, always-visible navigation (tab bar, sidebar). Flows users move through linearly (onboarding, checkout, forms) should hide or minimise global navigation to reduce distraction.

**Why it matters:** Persistent nav in a focused flow creates escape routes that increase drop-off. Missing nav in an app creates disorientation.

**Who does it well:**
- **Headspace** — bottom tab bar for the app, completely stripped-back nav during meditation sessions
- **Atlassian Jira** — persistent left sidebar for the product; focused task creation modal removes the sidebar entirely
- **Airbnb** — standard tab bar navigation for browsing; booking flow strips to a single back arrow and a progress indicator

**Apply when:** Designing or reviewing flows that switch between browsing and task-completion modes.

---

## 2. Onboarding & First-Time Use

### Principle: Defer registration until the user has experienced value
Don't ask users to create an account before they've understood why they should. Let them experience the core value first.

**Why it matters:** Registration is friction. Users who haven't yet seen the value have no reason to give you their data. Deferring sign-up reduces abandonment and increases activation.

**Who does it well:**
- **Duolingo** — completes a full first lesson before asking for an account
- **Robinhood** — shows the product UI and explains the value proposition before asking for sign-up
- **Canva** — lets guest users create a design; asks for account only when they try to save

**Apply when:** Designing consumer-facing onboarding or assessing where drop-off occurs in sign-up flows.

---

### Principle: Onboarding should teach by doing, not by explaining
The best onboarding is interactive. Replace instruction screens with guided first actions inside the real product.

**Why it matters:** Users skip instruction carousels. Completing an action creates muscle memory and a sense of progress that passive reading cannot.

**Who does it well:**
- **Todoist** — prompts the user to create their first task immediately; the UI teaches itself through use
- **Slack** — the onboarding bot sends you messages to reply to, teaching you Slack by using Slack
- **Figma** — new user files come pre-populated with interactive tutorials inside the actual design tool

**Apply when:** Reviewing or designing onboarding flows, or identifying why new user activation is low.

---

### Principle: Use progressive onboarding for complex enterprise tools
Don't try to onboard all features at once. Surface features contextually, at the moment they become relevant.

**Why it matters:** Enterprise tools often have deep feature sets. Front-loading everything creates overwhelm. Contextual nudges at the right moment have significantly higher uptake.

**Who does it well:**
- **Intercom** — surfaces feature education in-product as users hit natural trigger points (first conversation, first segment, etc.)
- **HubSpot** — onboarding checklists that reveal tasks progressively as earlier ones are completed
- **Airtable** — tooltip-driven contextual tips that appear when you first use a feature, not before

**Apply when:** Designing for enterprise or power users, or when a product has a long learning curve.

---

## 3. Forms & Data Entry

### Principle: One thing per screen (on mobile); logical grouping on desktop
On mobile, ask one question or collect one piece of data per screen. On desktop, group related fields visually but keep each group focused.

**Why it matters:** Long forms feel like homework. Single-question flows feel like conversation. Completion rates are consistently higher when cognitive load per step is lower.

**Who does it well:**
- **Typeform** — popularised the one-question-at-a-time pattern; completion rates measurably higher than traditional forms
- **Monzo (sign-up)** — mobile onboarding form asks one piece of information per screen throughout the entire sign-up
- **Google Forms** — on desktop, uses section grouping with a progress indicator to make long forms feel manageable

**Apply when:** Designing sign-up flows, multi-step forms, or any data collection on mobile.

---

### Principle: Inline validation, not end-of-form errors
Validate input as the user completes each field, not after they hit submit. Tell users immediately when something is wrong and exactly how to fix it.

**Why it matters:** End-of-form errors break flow and frustrate users who have to hunt back through a completed form to find the problem. Inline validation reduces form abandonment significantly.

**Who does it well:**
- **Stripe (payment forms)** — validates card numbers in real time, formats input automatically, shows card type icon
- **GitHub (sign-up)** — checks username availability immediately on blur, before the user moves on
- **Gov.uk forms** — UK government design system sets the gold standard for accessible, clear inline error messages

**Apply when:** Any form with validation rules, especially sign-up, payment, or data entry screens.

---

### Principle: Smart defaults and autofill reduce effort
Pre-populate fields where you have the data. Use smart defaults that are right for most users. Support platform autofill.

**Why it matters:** Every keystroke is friction. Users expect modern products to remember them and reduce repetition.

**Who does it well:**
- **Apple Pay / Google Pay** — eliminates payment and address entry entirely for returning users
- **Notion (new page)** — pre-selects the most recently used template type
- **Uber** — remembers frequent destinations and surfaces them before the user starts typing

**Apply when:** Reviewing forms for enterprise tools where users enter repetitive data, or any returning-user flow.

---

## 4. Dashboards & Data Visualisation

### Principle: Answer the question the user actually has, don't display all available data
Every dashboard should be designed around specific user questions: "How is my team performing?" "What needs my attention today?" Design the data display to answer those questions directly.

**Why it matters:** Data-dump dashboards require users to do analytical work the product should be doing for them. The result is dashboards that are opened and immediately closed.

**Who does it well:**
- **Linear** — team dashboard answers "what is blocked, what is in progress, what shipped" — nothing else
- **Mixpanel** — surfaces the metric trend prominently, with supporting breakdowns available on demand
- **Stripe Dashboard** — revenue is front and centre; everything else is secondary or requires navigation

**Apply when:** Designing or evaluating any analytics, reporting, or monitoring dashboard.

---

### Principle: Use the right chart for the question
Chart type must match the analytical question being answered. Using the wrong chart type obscures insight even when the data is correct.

| Question | Right chart |
|---|---|
| How does a value change over time? | Line chart |
| How do categories compare at a point in time? | Bar chart |
| What is the composition of a whole? | Stacked bar or treemap (not pie charts for >3 segments) |
| How do two variables correlate? | Scatter plot |
| How does a metric funnel or drop off? | Funnel chart |
| What is the geographic distribution? | Map / choropleth |

**Why it matters:** Pie charts with 8 segments, 3D bar charts, and dual-axis charts consistently mislead users. The chart choice is a design decision with real analytical consequences.

**Who does it well:**
- **Amplitude** — funnel and retention charts are purpose-built for their specific analytical question
- **Tableau** — strong default chart recommendations based on data type
- **Observable** — data journalism standard for chart-to-question matching

**Apply when:** Designing data visualisation, reviewing dashboard wireframes, or conducting a heuristic evaluation of an analytics screen.

---

### Principle: Surface anomalies and insights, don't just display metrics
Great dashboards do analytical work for the user — they highlight what's unusual, what's changed, and what needs attention, rather than presenting raw numbers and leaving interpretation to the user.

**Why it matters:** Users check dashboards to make decisions. A number without context (is 42% good? Is it up or down?) forces the user to do work the product should do.

**Who does it well:**
- **Notion Analytics** — surfaces "this page is getting more views than usual" rather than just showing a number
- **Google Search Console** — flags drops and spikes with contextual callouts
- **Datadog** — anomaly detection surfaces deviations from baseline automatically

**Apply when:** Designing enterprise dashboards, reporting tools, or any screen where users need to act on data.

---

## 5. Empty States, Errors & Edge Cases

### Principle: Empty states are onboarding opportunities, not blank screens
The first time a user encounters an empty state (no data, no content, no activity), it should explain what belongs here and offer a clear first action to fill it.

**Why it matters:** A blank screen with no guidance creates confusion and abandonment. A well-designed empty state converts a moment of friction into activation.

**Who does it well:**
- **Dropbox** — empty folder state shows a drag-and-drop illustration and a clear "Upload files" CTA
- **Asana (new project)** — empty task list prompts you to add your first task with a subtle inline affordance
- **Spotify (empty playlist)** — tells you what the space is for and offers a search to fill it immediately

**Apply when:** Designing any screen that can appear empty — lists, feeds, dashboards, search results.

---

### Principle: Error messages must explain what happened and what to do next
Errors should never be technical, vague, or blame the user. Every error needs three things: what went wrong (in plain language), why it happened (briefly, if helpful), and what the user should do now.

**Why it matters:** "Something went wrong" tells the user nothing. "Error 403" tells the user less than nothing. Poor error messages destroy trust and generate support tickets.

**Who does it well:**
- **Mailchimp** — error messages are written in a warm, human tone and always include a resolution path
- **Gov.uk** — the clearest error message standard in existence: specific, plain English, always actionable
- **Stripe** — payment error messages distinguish between card declined, network error, and input error — each with a different resolution

**Apply when:** Auditing existing error states, writing error message copy, or reviewing form validation.

---

### Principle: Design for the failure states before designing the happy path
Identify what can go wrong — network failure, empty results, permission denied, timeout, partial data — and design those states explicitly before finalising the happy path.

**Why it matters:** Most products are designed for the happy path and bolt on error handling later. This results in confusing, inconsistent, or missing states that undermine trust at the worst moments.

**Who does it well:**
- **Airbnb** — "no results" state for search includes map zoom adjustment, filter reset, and nearby date suggestions
- **iOS offline states** — apps like Maps and Apple Music have clearly designed offline modes rather than silent failures
- **Figma** — connection lost banner is non-intrusive but clear; recovery is automatic and communicated

**Apply when:** Beginning any flow design, or conducting a heuristic evaluation of an existing product.

---

## 6. AI & Chat Interfaces

### Principle: Set expectations about what the AI can and can't do upfront
Users need to understand the AI's scope, limitations, and confidence level before they start relying on it. Ambiguity about capability leads to misplaced trust or unnecessary avoidance.

**Why it matters:** Users who don't understand what an AI can do will either over-trust it (acting on bad outputs) or under-trust it (not using it when it would help). Neither is a good outcome.

**Who does it well:**
- **Claude** — capability framing on first use; clear communication when uncertain or outside scope
- **Perplexity** — shows sources alongside answers so users can calibrate trust themselves
- **GitHub Copilot** — onboarding explicitly frames it as a suggestion tool, not an autonomous agent

**Apply when:** Designing AI-powered features, writing system prompts, or defining how an agent communicates its outputs to users.

---

### Principle: Make AI outputs legible and auditable
Users should always be able to understand where an AI output came from, how confident the system is, and how to verify or override it.

**Why it matters:** Black-box AI outputs erode trust over time. Users who can't audit an output can't improve it or catch errors. Transparency is especially critical in enterprise and regulated contexts.

**Who does it well:**
- **Perplexity** — every claim is cited with a source; users can drill into the evidence
- **Notion AI** — shows a clear diff between original and AI-edited content; user explicitly accepts or rejects
- **Microsoft Copilot in Word** — AI-generated text is visually distinguished until accepted; easy to undo

**Apply when:** Designing any AI feature that generates content, makes recommendations, or takes actions on behalf of the user.

---

### Principle: Provide input scaffolding — don't leave users staring at a blank prompt
Empty chat interfaces or open text fields create blank-page paralysis. Give users example prompts, suggested actions, or input templates to reduce the cognitive load of getting started.

**Why it matters:** Users often don't know what to ask or how to phrase it. Scaffolding reduces time-to-first-value and teaches users what the AI is capable of through examples.

**Who does it well:**
- **Claude** — suggested prompt starters on a new conversation calibrate user expectations and reduce paralysis
- **ChatGPT** — capability examples surface on the home screen before the user has typed anything
- **Intercom Fin** — pre-built suggested questions surface in the chat widget before the user types

**Apply when:** Designing any AI chat interface, command input, or open-ended text interaction.

---

### Principle: Human escalation paths must always be visible in AI interfaces
Any AI-assisted flow must have a clear, accessible route to a human or a manual alternative. The escalation path should never feel like a failure.

**Why it matters:** AI systems fail, misunderstand, or hit edge cases. Users who can't find a way out of an AI loop lose trust in the whole product. This is especially critical in enterprise, support, and regulated contexts.

**Who does it well:**
- **Intercom** — "Talk to a person" is always one tap away, regardless of how deep you are in the bot flow
- **Apple Support** — AI triage always surfaces a human escalation option before the session ends
- **Zendesk AI** — explicit handoff state when routing to a human agent, with conversation context preserved

**Apply when:** Designing any AI-assisted support, triage, or task completion flow.

---

## How to apply this skill

When reviewing a user flow or UI design, work through each relevant section and for each principle ask:
1. **Does the current design follow this principle?** (Yes / Partially / No / Not applicable)
2. **If not — what is the specific gap?** Describe it in terms of user impact, not just design convention
3. **What is the recommended change?** Be specific — reference the principle and a real-world example
4. **What is the priority?** High (blocks core task), Medium (degrades experience), Low (polish)

Output recommendations in this format:

> **[Principle name]** — [Yes / Partially / No]
> Gap: [What the current design does or fails to do]
> Recommendation: [Specific change]
> Example: [Who does it well and how]
> Priority: [High / Medium / Low]
