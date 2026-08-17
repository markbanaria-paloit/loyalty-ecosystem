# Blueprint Field Guide

## Blueprint Structure

A service blueprint maps what happens at every phase of the customer journey across four service layers (lanes):

| Lane | Purpose |
|------|---------|
| **Customer Actions** | What the customer does at each phase |
| **Frontstage (Visible)** | Systems and staff interactions the customer can see |
| **Backstage (Invisible)** | Processes that support the service but are hidden from the customer |
| **Support Systems** | Infrastructure, data stores, and third-party systems that enable everything |

You can add or remove lanes to suit the service. For example, a digital-only service may not need a physical touchpoints lane.

## Phases

Phases map to the key stages of the customer journey. Use 4-8 phases for most services:

| Example | When to Use |
|---------|------------|
| Discovery → Selection → Purchase | E-commerce |
| Awareness → Onboarding → Use → Support | SaaS |
| Booking → Pre-Session → Session → Post-Session | In-person service |
| Research → Application → Approval → Delivery | Financial product |

Keep phase names short (1-3 words). They appear as column headers.

## Cards

Each cell in the grid (one lane × one phase) contains a list of **cards**. Each card has:
- `text` — a brief description of the action, system, or process (keep under 10 words)
- `tag` (optional) — a coloured label classifying the card type

### Card Count Guidelines
- 1-4 cards per cell is ideal
- More than 6 cards in one cell suggests the phase or lane is too broad — consider splitting

## Tag Conventions

Tags add semantic classification and visual differentiation. Use consistently across the blueprint:

| Tag Label | Colour | Use When |
|-----------|--------|----------|
| Customer-facing | `#007a6d` | Direct touchpoint the customer interacts with |
| Moment of Truth | `#f4a261` | Critical point that significantly shapes perception |
| Research | `#3498db` | Customer is gathering information |
| Comparison | `#9b59b6` | Customer is evaluating options |
| Critical Decision | `#e74c3c` | Customer commits to a choice |
| Payment | `#27ae60` | Financial transaction |
| Compliance | `#8e44ad` | Legal, regulatory, or safety requirement |
| Security | `#c0392b` | Data protection or fraud prevention |
| API Integration | `#3498db` | External system connection |
| System Integration | `#2980b9` | Internal system-to-system data flow |
| Human Service | `#e67e22` | Staff-delivered touchpoint |
| Automation | `#27ae60` | System-delivered without human intervention |
| Internal | `#00b39f` | Backstage process not visible to customer |
| Operations | `#34495e` | Day-to-day operational activity |
| Infrastructure | `#7f8c8d` | Technical platform or hosting |
| Personalisation | `#e74c3c` | Customised experience based on user data |

## Evidence Standards

| Confidence | Label | When to Use |
|-----------|-------|-------------|
| `validated` | From direct observation, research, or confirmed process documentation |
| `strong-signal` | From stakeholder interviews or existing process maps |
| `assumption` | Team assumption without research backing — log in RAID |
| `hypothesis` | Proposed process pending validation |

Flag assumption cards in RAID as a new assumption with `impact: medium` and plan for validation in the Define phase.

## Exemplar

## Exemplar
A well-formed blueprint has 4–6 phases, at least 4 lanes covering the full front-to-back stack, and annotated interactions at each phase crossing a lane boundary. Look for an existing `.gen-e2.bp` file in the current project's `01-discover/04-blueprints/` folder to use as a reference.
