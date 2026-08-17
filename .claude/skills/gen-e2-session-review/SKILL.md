---
name: gen-e2-session-review
description: 'Run end-of-session self-review for any Gen-e2 agent. Use at the end of every agent session to surface spec gaps, unfulfillable requests, threshold mismatches, and improvement opportunities before handing back to the human. Triggers on: end of session, session review, update spec, improve the agent, before handoff.'
argument-hint: 'Specify the local agent file to review (e.g. .github/agents/strategy-agent.agent.md)'
user-invocable: false
---

# Gen-e2® Session Review Skill

## When to Use
- At the end of every Gen-e2 agent session, before handing back to the human
- When the human asks to improve or update an agent spec
- When an agent encountered something it could not handle during the session

## Mandatory Timing

This skill **must be run** at the end of every agent session — before any final handoff message to the human. It is not optional. If no session anomalies are found, still confirm: *"End-of-session review complete — no spec gaps found."*

---

## Review Checklist

After completing any step, ask each of these five questions:

### 1. New input types?
Did the human provide an input type not listed under "Input types accepted" in the agent spec?
- Examples: a file format, data source, or content type not previously encountered
- If yes: note what the new type was and how it was handled

### 2. New artefact patterns?
Was there enough data to generate a provisional artefact, but the threshold rules didn't fit the situation? Or was an artefact requested that has no threshold rule yet?
- If yes: describe what artefact was needed and what evidence was available

### 3. Threshold mismatch?
Did an existing threshold rule produce an obviously wrong outcome — either preventing a useful draft or generating something too thin?
- If yes: state which rule, what outcome it produced, and what the better outcome would have been

### 4. Unfulfillable request?
Was there something the human asked for that the agent should be able to do but couldn't, due to a gap in its spec?
- If yes: describe what was requested and why it couldn't be completed

### 5. Confidence tagging edge case?
Was there a finding that didn't fit cleanly into the four confidence levels (`validated`, `strong-signal`, `assumption`, `hypothesis`)?
- If yes: describe the finding and what level it was tagged as

---

## If Any Check Returns Yes

1. **Surface it to the human explicitly:**
   > "During this session I encountered something not covered by my current spec: [describe what happened]. I'd suggest updating my spec as follows: [show the specific before/after change]. Shall I apply this update?"

2. **Show the exact proposed change** — not a vague description. Show the specific line(s) that would be added, removed, or modified.

3. **Wait for explicit human confirmation** before applying any change.

4. **If the human approves:**
   - Edit the agent spec file directly at `.github/agents/<local-agent-name>.agent.md` in the project workspace — this refers to the user's local copy of the agent, not the extension source
   - Log the change in `02-define/02-raid.gen-e2.raid` as a decision entry: what changed, why, and on what date

---

## If All Checks Return No

Report clearly: *"End-of-session review complete — no spec gaps found this session."*

---

## Constraints

- NEVER apply spec changes without explicit human approval
- NEVER run this review silently — always surface findings, even if they seem minor
- NEVER add new input types or threshold rules that contradict existing behaviour rules without flagging the conflict
- ALWAYS run this before the final handoff message, not after
