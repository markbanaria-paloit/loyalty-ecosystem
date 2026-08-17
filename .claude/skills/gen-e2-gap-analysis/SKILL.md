---
name: gen-e2-gap-analysis
description: 'Identify, classify, and prioritise knowledge gaps for Gen-e2 product discovery research planning. Use when identifying knowledge gaps, classifying gaps by type, prioritising research activities by risk and impact, or mapping gaps to research methods and artefacts. Triggers on: identify knowledge gaps, classify gaps, plan research, gap analysis, what do we not know, research prioritisation.'
argument-hint: 'Describe the project context or paste the current list of unknowns to classify'
user-invocable: false
---

# Gen-e2® Gap Analysis Skill

## When to Use
- When planning or prioritising research activities and knowledge gaps need to be classified
- Before commissioning any research activity — always classify the gap first
- When synthesised research has closed some gaps and new ones have surfaced
- When reviewing whether the research plan still matches the outstanding unknowns

---

## Step 1 — List Every Knowledge Gap

Pull gaps from:
- The RAID log (`02-define/02-raid.gen-e2.raid`) — open assumptions and hypotheses
- The context brief — any field marked as unvalidated or unknown
- The project overview — "What We Don't Know" column
- Stakeholder or user types where no direct research has been conducted

Write each gap as a single statement: *"We don't know [X]."*

---

## Step 2 — Classify Each Gap

Explicitly name the gap category before recommending a method. A single situation may produce gaps in multiple categories — log each separately.

State the classification clearly: *"This is a [Category] gap — we don't know [X]. The recommended method is [method], producing a [artefact]."*

| Category | Signature patterns | Recommended methods | Likely artefacts |
|---|---|---|---|
| **Systems & Service** | Multiple systems interact but flows are unclear; end-to-end service delivery is undocumented; existing UI needs expert review; accessibility compliance is unassessed; process logic is unknown | Service blueprint mapping; service blueprint workshop; heuristic evaluation; accessibility audit; process/flow mapping | `.gen-e2.bp`, `.gen-e2.flow` |
| **User & Behavioural** | Users are unknown or poorly defined; segments are vague or assumed; cross-touchpoint experience is unmapped; drop-off or struggle points are unclear; jobs-to-be-done are unknown | User interviews + synthesis; screener survey + interviews; journey mapping workshop; diary study; contextual inquiry + analytics review; JTBD interviews | `.gen-e2.persona`, `.gen-e2.jm`, `.gen-e2.research` |
| **Evidence & Insight** | Raw research exists but hasn't been synthesised; multiple data sources conflict; usage pattern analysis is missing | Affinity mapping / thematic analysis; research synthesis workshop; analytics deep-dive | `.gen-e2.research` |
| **Product & Scope** | Problem is known but solution space is undefined; feature ideas exist but are unstructured or unprioritised; a concept needs validation before design investment; interaction logic needs communicating to engineers | Design sprint / ideation workshop; user story mapping; prototype + usability testing; flow diagramming | `.gen-e2.flow`, `.gen-e2.storymap` |
| **Design & System** | No design language exists; a design system is inconsistent or undocumented; existing code components or patterns are unknown | Design system definition workshop; design system audit + documentation; component inventory | `.gen-e2.ds` |
| **Market & Strategic** | Competitor landscape is unknown; industry norms or best practices are unclear; regulatory or compliance landscape is unassessed | Competitor analysis / benchmarking; desk research / literature review; expert interviews + desk research | `.gen-e2.research` |

> A single discovery may surface gaps in multiple categories. Do not force a single answer — list all applicable types and their artefacts.

> **Outcome-based framing for User & Behavioural gaps:** When planning research for this category, frame interview questions around desired *outcomes* — what users are trying to achieve — not solutions or features they want. See the [Outcome-Based Interview Guidance](#outcome-based-interview-guidance) section below before finalising any discussion guide.

---

## Step 3 — Assess Each Gap

For each classified gap, record:

| Field | Options |
|---|---|
| **Risk** — what happens if this gap remains? | `high` / `medium` / `low` |
| **Impact** — how much will this affect product direction? | `high` / `medium` / `low` |
| **Priority** | `high` (both high) / `medium` / `low` |

**Rule:** Gaps that are both high risk AND high impact must be closed before design decisions are made. These go to the top of the research plan.

---

## Step 4 — Select a Research Method

For each gap, confirm the most appropriate method from this list:

| Method | Best for |
|---|---|
| Stakeholder interview | Understanding organisational goals, constraints, politics |
| User interview / JTBD interview | Understanding motivations, behaviours, jobs-to-be-done — frame questions around desired outcomes, not features (see Outcome-Based Interview Guidance below) |
| Contextual inquiry | Observing users in their real environment |
| Journey mapping workshop | Mapping cross-touchpoint experience collaboratively |
| Service blueprint workshop | Mapping frontstage/backstage service layers |
| Heuristic evaluation | Expert review of existing UI against usability principles |
| Accessibility audit | Assessing existing UI against WCAG criteria |
| Affinity mapping / thematic analysis | Clustering raw research findings into themes |
| Research synthesis workshop | Team-led synthesis of multiple data sources |
| User story mapping | Structuring features against user activities |
| Design sprint / ideation workshop | Rapid solution ideation against a defined problem |
| Prototype + usability testing | Validating a concept with target users |
| Competitor analysis / benchmarking | Understanding market context and norms |
| Analytics deep-dive | Understanding usage patterns, drop-offs, funnels |
| Desk research / literature review | Understanding regulatory, market, or domain context |
| Expert interviews | Domain specialist insight not available from users |
| Screener survey | Qualifying and recruiting research participants |

---

## Step 5 — Output to Research Plan and RAID

For each gap:
1. Add a **Planned** activity to `01-discover/01-research/02-research-plan.md` (use `gen-e2-knowledge-base` skill)
2. Add a **hypothesis** or **issue** entry to `02-define/02-raid.gen-e2.raid` (use `gen-e2-raid` skill) — gaps that are not logged cannot be closed
3. Note the recommended artefact type alongside the activity

---

## Outcome-Based Interview Guidance
**Source:** Anthony Ulwick — Jobs To Be Done research methodology

Standard user interviews frequently collect solution requests rather than outcome needs. When a user says "I want a dashboard" or "I need a bulk export button," they are describing a solution, not the outcome they are trying to achieve. Building to solution requests produces features that satisfy the requester but may miss the underlying need — and crowd out better solutions that research should reveal.

### The reframing rule
Before finalising any interview guide, check every question for solution-language. If a question asks users *what features or products they want*, reframe it to ask *what result they are trying to achieve*.

| Solution-framed (avoid) | Outcome-framed (use instead) |
|---|---|
| "What features would you like to see in the app?" | "What are you trying to accomplish when you use this tool?" |
| "Would you use a bulk export feature?" | "How often do you need to move data out of the system, and what slows that down?" |
| "What should the dashboard show?" | "When you check on your progress, what do you need to know straight away?" |
| "What would make this process easier?" | "Where in this process do things go wrong or take longer than they should?" |

### Outcome statement formatting
A well-formed outcome statement contains two elements:
1. **Direction of improvement** — what the user wants to minimise, increase, or avoid
2. **Unit of measure** — time, frequency, number, or likelihood

**Examples:**
- "Minimise the time it takes to find the right patient record"
- "Increase the number of check-ins completed without prompting"
- "Reduce the likelihood of selecting the wrong treatment option"
- "Minimise the number of steps required to submit a claim"

Use this format when documenting user outcomes in research synthesis and when structuring discussion guides for JTBD-style interviews.

### When survey data is available
When research has produced rated outcome statements (importance and satisfaction scores), apply the **Opportunity Algorithm** from `gen-e2-strategy-frameworks` rather than relying solely on interview impressions for prioritisation. Importance signals from qualitative interviews are directionally useful but not sufficient alone for a defensible prioritisation decision.

---

## Constraints

- NEVER recommend a method without first classifying the gap type
- NEVER classify a gap as a single type if multiple categories clearly apply — list all
- NEVER begin research execution without the human approving the classified gap list
- ALWAYS log every gap in RAID — if it is not logged, it cannot be tracked to closure
