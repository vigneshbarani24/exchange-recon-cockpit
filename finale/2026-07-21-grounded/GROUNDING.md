# GROUNDING.md

External grounding for the July 23, 2026 finale. Claims are tagged **[VERBATIM]** (quoted
from the source), **[PARAPHRASE]** (source says this, wording is mine) or **[INFERRED]**
(my reading, not stated). Where sources conflict, both are shown and the conflict is named.

---

## 1. The format

- **Finalist presentation: July 23, 2026.** Winners announced on or around August 4.
  [VERBATIM Devpost rules]
- **The official budget: 5 minutes presentation including demo, then 3 minutes jury Q&A**,
  on UiPath's template. [PARAPHRASE finalist brief]
- Ebru's community best-practices deck says 7 minutes to demo, split 3 minutes presentation
  plus 4 minutes demo, then 3 minutes Q&A. [VERBATIM her slide 11]
- **CONFLICT, resolved:** use the official 5 plus 3 as the hard budget. Take her *intent*,
  which is that the demo gets the majority of the time, not the slides.
- "Up to 10 of the highest-scoring submissions per track will participate in a live finale
  event on Zoom. Finalists will present their solution to a judging panel and take
  questions." [VERBATIM Devpost rules]
- **A live demo is required. Keep a backup video handy.** [VERBATIM her slide 12]

---

## 2. The five criteria, verbatim, equal weight

Judged **on the live presentation and Q&A**, not on the submission. [VERBATIM Devpost rules]

1. **Business Impact and Adoption Potential.** "the real-world relevance and production
   viability of the solution as presented, including the clarity of the business case and
   the scalability of the approach."
2. **Platform Usage.** "the depth and deliberateness of UiPath platform usage as
   demonstrated in the live presentation, including the use of Agent Builder, Maestro, API
   Workflows, coded agents, and external frameworks where applicable. Solutions that
   demonstrate the use of coding agents through UiPath for Coding Agents (Claude Code,
   Codex, Cursor, Gemini CLI) will receive additional points within this criterion."
3. **Technical Execution, Feasibility and Versatility.** "architectural soundness, code
   quality, and production-readiness as demonstrated through the live demo, including the
   solution's handling of exceptions, failures, and edge cases."
4. **Creativity and Innovation.** "novel design decisions, unexpected orchestration
   patterns, and creative problem framing."
5. **Presentation.** "the logical flow from problem to solution to impact, the confidence
   and coherence of the demo, the accessibility of technical communication, and the quality
   of responses during Q&A."

Platform Usage explicitly "rewards deliberate, deep usage over superficial breadth."
[VERBATIM Devpost] Do not list products. Show the spine.

### The coding-agent bonus, up to 2 points inside Platform Usage
Full 2 points require documenting **which** tool was used, **evidence of how** it
contributed, and that the output is "meaningfully and substantively integrated". Evidence
must include at least one of: a prompt log or session export, screenshots of the
interaction, **a dedicated section in the README describing the coding agent's role**, or
equivalent. [VERBATIM Devpost rules] The README section is the cheapest path to the full 2.

---

## 3. The track, and UiPath's own example

"**Track 2: UiPath Maestro BPMN.** Build a solution that models and runs an end-to-end
business process using BPMN 2.0 in UiPath Maestro. Your process should orchestrate humans,
robots, agents, and APIs through a defined flow with clear tasks, decisions, and handoffs."
[VERBATIM Devpost]

UiPath's own worked example for this track is procure to pay: "an invoice agent reconciles
discrepancies between PO, receipt, and invoice, escalating exceptions to humans."
[VERBATIM Devpost] **This project is the example UiPath wrote.** Say that out loud once.

The operative verb is **orchestrate**, and the four actors are humans, robots, agents and
APIs. Honest self-assessment against those four:

| Actor | Status |
|---|---|
| Agents | Three coded LangGraph agents as real `StartAgentJob` service tasks. Proven. |
| Humans | Event-based gateway plus message catch events. Suspended and resumed a live instance. Proven. |
| APIs | Live SAP S/4HANA over OData to MCP. Proven. |
| Robots | **Thin.** Ingestion is system to system, so there is no attended or unattended robot in the flow. |

Do not fake the robot. Say the flow is agent-and-API heavy **by design**, because the
ingestion is already system to system, and that adding an RPA ingestion leg is the obvious
extension. Claiming three of four honestly beats claiming four of four and being caught.

Also know the boundary, because a judge may ask why BPMN and not Case: "BPMN is for flow
complexity. Agentic case management is for context complexity." [VERBATIM UiPath blog]
Invoice-to-PO reconciliation has a known shape and a predictable path, so BPMN is correct. A
supplier dispute would open as a Case.

---

## 4. The judges

### Taqi Jaffri, VP Product Management. Agent building, evaluations, orchestration, governance.
Owns the agent-building stack: Agent Builder, context grounding and the AI Trust Layer,
agent evaluations, and he is a recurring product voice for Maestro. Formerly co-founder at
Docugami, before that principal PM at Microsoft.

His published position, and it is the single most useful thing on this page [VERBATIM
diginomica, December 2025]:
- "Agents are non-deterministic by nature. This is actually a characteristic of LLMs.
  They're statistical in nature. They have creativity." That creativity "becomes a liability
  when business processes have compliance requirements, financial consequences, or safety
  implications."
- "Even with humans, we don't let a human just kind of do whatever. If you think about it,
  even with human workforces, we constrain them inside these workflows."
- "Sometimes determinism is good, meaning it works the same way every time. And if it fails,
  it fails the same way every time."

UiPath's own copy for his sessions: "Enterprise AI agents aren't defined by demos; they're
defined by evaluations." [VERBATIM UiPath marketing copy, not a transcribed quote]

**What he will probe:** evaluation and repeatability, why the agent sits inside a workflow
rather than orchestrating itself, drift, blast radius, and how governance generalises.
**What impresses him:** an evaluation story, explicit governance rationale, honesty about
the prototype-to-production gap. **Red flags for him:** demo-only reliability claims, full
autonomy in a financial process, hand-waved reliability.

### Ingo Philipp, VP Product Management. Testing, quality, Test Cloud.
Former theoretical astrophysicist, long testing career at Tricentis, a recognised voice in
exploratory testing.

His themes [VERBATIM his LinkedIn and UiPath posts]:
- "Certainty is the closing of the testing mind."
- Agentic testing must "strengthen the quality signal, not simply increase the volume of
  testing activity"; the danger is "confidence without evidence."

**What he will probe:** how you tested it, named edge cases, where it breaks and the blast
radius, whether a passing demo means anything. **What impresses him:** intellectual honesty
and articulated failure modes. **Red flag:** overconfidence.

**[INFERRED but high confidence]** The two remits are complementary and both reward the same
behaviour: precision about what is proven versus what is not. This project's honesty tiering
is not a defensive posture with these two. It is the winning move.

---

## 5. Ebru Sarikaya Yildirim's method, decomposed

Source: her deck "UiPath AgentHack Winner Overview and Best Practices 2026", 13 slides, plus
her 2020, 2023 and 2025 submissions. She has won or placed in 2020, 2021, 2023 and 2025, and
took 1st in Enterprise Agents at AgentHack 2025 with AIdMe.

### What she optimises for [VERBATIM her slides 5 to 7]
"Real-life Use Case with a Solid Background / Creativity and Innovation / Working MVP / Use
of UiPath ecosystem / Business impact and adoption potential / Completeness of delivery /
Technical feasibility and versatility / Implementation realism and Adaptability / Agentic
automation advantage and innovation."

Her criteria slide appears twice, the second time titled "My focus" with the identical
layout. **[INFERRED]** She deliberately covers the whole rubric rather than optimising one
axis. That is the lesson, not any single tactic.

### Her submission checklist [VERBATIM her slides 8 and 9]
1. Project page on Devpost
2. Demo video, **subtitled or voice-over, short and clean**
3. Public GitHub repository, with **clear workflow diagrams** and a **Process, Problem and
   Solution** narrative
4. Solution built on UiPath Automation Cloud
5. Completed presentation deck
6. Feedback form, optional

### The pattern across her wins [PARAPHRASE, from her three submissions]
- **She picks vivid, high-stakes, human problems where failure is costly.** Remote education
  access in 2020, fatal medication errors in 2023, worker safety in a crisis in 2025. Every
  one has an obvious "why this matters" hook in a single sentence.
- **She builds across multiple UiPath products, always.** 2023: Studio, Apps, Assistant,
  Orchestrator plus Integration Service. 2025: Action Center, Agent Builder, Integration
  Service, Maestro plus Twilio and Gemini. The habit traces to the 2020 HyperHack rule that
  required at least three UiPath products.
- **She ships an AS-IS and TO-BE workflow diagram** as a standing artifact, from 2023 onward.
- **Her winning one-pager has a fixed shape**: Challenge, Solution, How It Works as three
  numbered steps, Impact, plus an architecture strip. That shape is worth copying directly.

### What this project should take from her, concretely
1. The problem framing must be high stakes and specific in one sentence. `VALUE.md` Card A
   gives it: the migration automated the transaction, not the exception.
2. Working MVP, shown running. Already true, and now true for the whole composed instance.
3. Cover all five criteria on purpose. See the map in `DECK.md`.
4. Complete every artifact on the checklist. The public repo with clear diagrams is the one
   most likely to be skipped under time pressure. Do not skip it.
5. Live demo, backup video ready.

---

## 6. The competitive field, and where this sits

Field context: AgentHack 2025 drew 400 plus submissions from over 50 countries. 2026 drew
over 500 submissions from 1,400 plus started projects, with 203 solutions making the cut and
about 31 finalists across three tracks. **[PARAPHRASE, UiPath community posts]**

### The threats in Track 2, ranked
1. **Aegis CaseOps.** Security alert triage on Maestro BPMN. The most rigorous governance in
   the track: a blind-grader CLI that recomputes the verdict from the raw alert and exits
   non-zero on tampering, a corroboration cap that makes single-signal auto-escalation
   structurally impossible, 38 pytest invariants, a custom evaluator. Solo, Claude Code
   built. **Beats this project on provable, independently verifiable governance.**
2. **FDE Agent.** Scores every workflow node for AI-delegation risk against AIID, OWASP LLM
   Top 10, MITRE ATLAS, NIST AI RMF and the EU AI Act, with a human-in-the-loop gateway.
   Highest novelty and strongest regulatory grounding. Solo, Claude Code built.
3. **FinClose AI.** Multi-agent financial close on Maestro BPMN with Action Center approval.
   The closest domain twin, and it loses on exactly one axis: **no live ERP.** Its own page
   lists direct SAP and Oracle integration as future work.
4. SpectreAI, Municipality AI Assistant, LegalMitra, Agent Factory, MotoMind AI, ADRO ACORD.

### Cross-track Grand Prize threats
- **Nexus Maestro.** Five agents, real outbound SIP phone calls, a polished War Room demo.
  Strongest presentation rival in the field.
- **SONIC.** Agentic NOC and SOC operator, claims a live Cisco Meraki client, strong MTTR
  numbers, highest community traction seen.
- **CascadeCare Network Command.** Three-level nested Maestro Case, 12 agents, 13 product
  surfaces, the most aggressive coding-agent evidence in the hackathon. Explicitly fictional
  data, no customer, no ROI metrics.
- **PostAuto with BE-terna.** Was rumoured to be a real customer deployment. **It is not.**
  Its own page states the business data was customer provided and that "integration with
  live systems remains the key next milestone to turn the prototype into an operational
  solution." [VERBATIM its Devpost page] This materially lowers the Business Impact bar in
  the field and raises the value of a genuine live-system read.

### What is actually rare here
Against the whole retrieved field, this project uniquely holds all three of:
1. **A live external enterprise system-of-record read at runtime.** Every rival either uses
   synthetic or mocked data, or reads UiPath's own tenant surfaces. Nobody else reasons over
   an untouched third-party ERP.
2. **An uncommon, high-stakes hydrocarbon procure-to-pay domain** that no other finalist occupies.
3. **A three-way deterministic, agent, human separation with the write path physically
   quarantined** in a non-agent executor. Rivals mostly assert "the agent does not decide" at
   the prompt level. This is structural.

### Where rivals are stronger, and the counter
| Gap | Counter |
|---|---|
| Aegis and FDE have independently verifiable governance | Show the structural proof: no write tool bound, the quarantined executor, the deterministic gate constants. See `BUILD-BRIEF.md` for the negative test that closes this properly. |
| LegalMitra and Municipality have crisp ROI numbers | `VALUE.md`. State method, then number, then caveat. |
| Nexus has a more polished demo | A completed Maestro instance with three real agent jobs and a genuine suspend and resume is a better BPMN artifact than a prettier dashboard. Do not compete on polish. |
| The e2e run used to be the weak spot | It is closed. See `TRUTH.md`. |

---

## 7. Prizes and the secondary plays

Grand Prize $8,000. **Best of UiPath Maestro BPMN $5,000.** Runner-up $3,000. Honorable
Mention $2,000. Special awards include **Best Demo and Presentation $3,000** and **Most
Creative Solution $3,000**. A project can win a maximum of two prizes, one track or overall
plus one special award. [VERBATIM Devpost rules]

**Prize pool conflict:** UiPath's May 15, 2026 press release says "$48,000 across 16
awards"; Devpost and UiPath marketing say $50,000. Both are UiPath-linked. Immaterial to
strategy.

**Community votes conflict:** the Devpost rules state People's Choice is standalone and
"votes do not influence the judges' scores". A UiPath community events page states votes
contribute 10 percent of the finalist showcase score. Unresolved. **Therefore:** post the
community forum write-up, share the link once, and spend no further prep time on it.

**Deliberate secondary targets:** Best of Maestro BPMN is the realistic primary. Best Demo
and Presentation is winnable with the script in `SCRIPT.md`. Most Creative is winnable on
the live-ERP and governed-agency framing. Best Product Feedback is cheap and the product-VP
judges personally value it, so submit the feedback form with specific notes on Maestro BPMN
authoring and the coding-agent CLI. The binding-resolution failure documented in
`finale/maestro/README.md` is genuinely useful product feedback and costs nothing to submit.
