---
name: gen-e2-blueprint
description: 'Create or update Gen-e2 service blueprint files (.gen-e2.bp). Use when mapping service blueprints, frontstage/backstage interactions, support processes, customer journey phases, or system touchpoints during product discovery.'
argument-hint: 'Describe the service or product being blueprinted and any known phases or lanes (e.g. Customer Actions, Frontstage, Backstage, Support Systems)'
---

# Gen-e2™ Blueprint Skill

## When to Use
- Creating a new service blueprint during the Discover phase
- Mapping the full service delivery across frontstage and backstage
- Identifying operational processes and support systems behind customer experiences
- Updating an existing blueprint after new journey or flow insights
- Aligning stakeholder understanding of service complexity

## Prerequisites (if available)
Check for existing discovery artefacts and use them as primary context:
- **Journey maps** (`01-discover/03-journeys/`) — use stages as the basis for blueprint phases; phases can combine or split journey stages, they don't need to be 1:1
- **User flows** (`01-discover/05-flows/`) — use to validate frontstage interactions
- **Research notes** (`01-discover/01-research/`) — use to ground assumptions in evidence

If none exist, work with what the user provides and flag assumptions accordingly.

## Procedure

### 1. Gather Context
Before creating a blueprint, collect:
- **Service**: What product or service is being blueprinted?
- **Phases**: What are the key journey stages? (e.g. Discovery, Booking, Delivery, Post-Service)
- **Lanes**: Which service layers are relevant? (standard: Customer Actions, Frontstage, Backstage, Support Systems)
- **Research source**: Journey maps, stakeholder interviews, process documentation, assumption

Ask the user for any missing critical information rather than assuming.

### 2. Interview Prompts
If working from scratch, ask the team these questions:
1. What phases does the customer journey move through?
2. What does the customer do at each stage?
3. What do staff or systems do that the customer can see (frontstage)?
4. What happens behind the scenes at each stage (backstage)?
5. What infrastructure, data, or third-party systems support each step?
6. Where are the key moments of truth or pain points?
7. Where are the biggest gaps or failure points in the current service?

### 3. Define Lanes
Use the standard 4-lane structure with these exact IDs:

| Lane | ID | Content |
|------|----|---------|
| **Customer Actions** | `customer` | What the user does (from journey map actions) |
| **Frontstage** | `frontstage` | Visible UI/interface elements |
| **Backstage** | `backstage` | Services, APIs, processing the user doesn't see |
| **Support** | `support` | Infrastructure, databases, external integrations |

You can add or remove lanes to suit the service. A digital-only service may not need a physical touchpoints lane.

### 4. Create the File
Use the local template and field guide as the authoritative references:
1. Read [./references/blueprint-guide.md](./references/blueprint-guide.md) for field guidance, lane rules, and tagging conventions
2. Read [./templates/blueprint.json](./templates/blueprint.json) for the canonical JSON schema
3. Create the file at the path below, populated with the gathered context — replacing all `{{placeholder}}` values

**File path**: `01-discover/04-blueprints/{NN}-{kebab-name}.gen-e2.bp`

### 5. Evidence Tagging
Use card tags to classify each card's semantic meaning. Prefer this opinionated palette:

| Colour | Hex | Use When |
|--------|-----|----------|
| Purple | `#7C3AED` | Core user actions |
| Indigo | `#4F46E5` | Data processing or system logic |
| Amber | `#f4a261` | Consent, security, or compliance |
| Green | `#10B981` | Success states or positive outcomes |
| Rose | `#EF4444` | Errors, risks, or failure points |

For richer tagging needs, refer to the full tag set in [./references/blueprint-guide.md](./references/blueprint-guide.md).

### 6. Cross-Updates
After creating/updating a blueprint:
- **Backstage cards** with new services → update architecture (new service identified)
- **Support cards** with new infrastructure → update architecture (tech stack decisions)
- **New customer actions** not in existing flows → check if flows need updating
- **Assumed backstage services** without validation → log as assumption in RAID

## Reference
See [./references/blueprint-guide.md](./references/blueprint-guide.md) for the blueprint field guide and tagging conventions.
