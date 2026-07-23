# DESIGN BRIEF: UiPath AgentHack 2026 finale deck (paste this whole file)

You are designing a presentation deck. Everything you need is in this file. Use the
copy VERBATIM: do not rewrite headlines, numbers, labels or the close. You may design
freely (layout, spacing, visual treatments) but the words and facts are locked.

## Format

- 14 slides, 16:9 widescreen. 10 main slides + 4 Q&A appendix slides.
- Brand: UiPath look. White backgrounds, ink #182126 text, UiPath orange #FA4616 as
  the only accent, one teal section-header slide (slide 1), one dark slide (slide 6),
  orange baseline bar at the foot of content slides. UiPath logo top right.
- Near-textless mains: titles 40pt+, body 24pt+ where possible, one idea per slide.
  Never put a paragraph on a slide.

## Hard rules (never violate, anywhere on any slide)

1. No em dashes. Use middots, commas or periods.
2. No customer names, ever. Only "a downstream refiner" and "a UK adventure travel
   group".
3. Never name the invoice check by document count. Say "invoice match" or
   "invoice-to-PO reconciliation".
4. Never a word against RPA. RPA is honored, not targeted. The only RPA mentions are
   the ones in this copy.
5. Never the words "financial close", "month-end" or "closing the books".
6. Write-back is always "prepared and HELD". Auto-clear is always "designed, parked,
   conservative by default". Never claim either ran.
7. Say "live S/4HANA cloud tenant", never "production ERP".
8. Do not invent numbers, features, logos or claims not in this file.

## Slide-by-slide copy (verbatim)

### Slide 1 · TITLE (teal section-header style)
Title: Deterministic exception-handling agents.
Sub line 1: Exchange Recon Cockpit · not one use case, the work RPA left behind
Sub line 2: UiPath AgentHack 2026 finale · Maestro BPMN track · VB (Vignesh Barani Sivakumar)
Foot chip line (small, muted): Maestro · coded agents · MCP to live SAP S/4HANA · DMN
policy · evals · Action Center · Test Manager · built with a coding agent

### Slide 2 · ME
Title: A first-time builder, on purpose.
Kicker: VB · Vignesh Barani Sivakumar
Body (4 short lines):
- Forward Deployed Engineer · Enterprise AI · SAP world
- Agentic engineering is the day job. UiPath is brand new: first build, ever.
- Solo and full stack, with a coding agent on the platform you are judging
- The whole build trail ships with the submission
Speaker note: "I build enterprise AI for SAP landscapes for a living. I had never
built on UiPath before this hackathon. Everything you are about to see was built solo,
with a coding agent, on the platform you are judging."

### Slide 3 · THE EXCEPTION TAIL (the pain slide)
Title: RPA automated the transaction. Not the exception.
Visual: full-width process map image (asset: exception-tail.png). A procure-to-pay
swim-lane flow with copper tags pinned to steps reading "10 · manual", "12 · manual",
"32 · manual · THE EXCEPTION TAIL", "19 · manual", "15 · manual", and a foot note
"88 pinned to this flow · 20 orbit it". Caption on image: discovery observations ·
de-identified.
Foot line (orange, bold): 108 recurring manual activities on one process · man-hours
bought back, not headcount out
Speaker note: "RPA automated the transaction, and it did exactly what it was built to
do. The exceptions were never its job. This is a real procure-to-pay flow from a
downstream refiner, de-identified. Every copper tag is work a person still does by
hand. Enterprises do not buy state of the art. They buy those hours back."

### Slide 4 · THE ICEBERG (the answer slide)
Title: Not state of the art. Simple. Clean. Auditable.
Visual: an iceberg (asset: iceberg.png). Above the waterline, a small tip with an
orange dot at the peak labeled "ONE PERSON SIGNS · holds the only pen · nothing
commits without them". At the waterline: "AGENTS REASON ONLY HERE · where the written
rules run out · read, check, write up evidence, stop". The huge mass below water:
"RULES DECIDE · rulebook thresholds · timers · safety nets · audit record". Small foot:
"the mass of the system is deterministic · that is the feature".

### Slide 5 · WHAT WE BUILT (platform slide)
Title: One governed flow. Every surface that mattered.
Chip grid, two rows (verbatim chips):
Row 1: UiPath Maestro | Coded agents · Claude Code + uip CLI | Orchestrator |
Action Center | Test Manager | Policy · DMN | Storage
Row 2: Evals · LLM-judged | MCP to SAP S/4HANA · LIVE (green) | Slack | Teams webhook |
Gmail | DETERMINISTIC (ink fill, white text) | AUDITABLE (ink fill, white text)
Visual below chips: our process map (asset: recon-bpmn.png): start "invoice arrives",
three tasks ("Match invoice to PO · agent · deterministic", "Check variance against
live SAP S/4HANA · agent · reads the real ledger", "Apply the finance rulebook ·
thresholds finance owns"), an orange diamond "HUMAN GATE · one person · the only pen"
with a 10 min timer, and three endings: "Correction prepared · nothing posted · HELD ·
tells the team · Teams + Slack" (THE HAPPY PATH), "To the buyer, with the evidence ·
tells the team · Teams + Gmail + Slack", "It escalates itself · proven unattended,
twice · then tells the team". Foot of image: "safety nets on every step: a failure can
never block the decision · every step recorded".
Foot line: the demo runs from here · live tenant · happy path plus three exception endings

### Slide 6 · THE STOP (dark slide, the peak)
Dark background. Three lines only:
Line 1 (title): It did four days of work in under three minutes.
Line 2 (white, big): Now it will wait forever for one person.
Line 3 (orange, big): Both are the point.

### Slide 7 · PROOF
Title: Built to be signed off, not just admired.
Kicker: exceptions, failures and edge cases · in the rubric's own words
Table, 7 rows x 3 columns (verbatim):
| Three agents, one governed run | 2 min 56 s against the live S/4HANA cloud tenant | LIVE |
| Exceptions, failures, edge cases | safety nets on every task · a failure can never block the decision | LIVE |
| Ten-minute SLA timer | escalated itself, unattended, twice | LIVE |
| The flow tells the team | Teams, Slack, Gmail · sent by the process, not a person | LIVE |
| Twelve graded tests | judged by an independent second model · loaded in Test Manager | PASSING |
| Auto-clear of tiny variances | designed · parked behind a filed platform defect · conservative by default | PARKED |
| Write-back to SAP | exact correction prepared and held · the pen stays human | HELD |
Status colors: LIVE and PASSING green, PARKED amber, HELD muted red.
Foot line (bold): Completeness of delivery: public GitHub repo · README and setup ·
demo video under five minutes · 21-artifact evidence bucket
Foot sub (small): every claim above sits on a committed run trace

### Slide 8 · OUTCOMES + TWO CUSTOMERS
Title: Billion-dollar landscapes buy hours back.
Left column, heading "A downstream refiner":
- de-identified discovery observations
- BEFORE · one exception crosses 5 desks in 4 days · about $40 a case
- AFTER · one gate · 2:56 measured on the live ledger · about $6 a case
- honest labels: before/after modeled, the 2:56 measured
- self-funding from the first group live
Right column, heading "A UK adventure travel group":
- funded pilot, proven live
- 200 supplier invoices a week through exactly this gate
- about 5.5 analyst hours returned weekly · a labeled model
- call it most of somebody's Friday, every week
Foot line (orange, bold): outcome metrics, not vibes: UiPath Process Insights reports
straight-through rate, hours returned, exception mix

### Slide 9 · ROADMAP
Title: Roadmap: distribution, scale, measurement.
Left column, three blocks:
1 · Distribution (orange) / Business hates another app. The gate moves into Teams. /
today: this card is already sent live from the flow · next: the buttons act on the gate
2 · Scale (orange) / A swarm of exception-handling agents: 186 more cards on the map. /
same gate, same rulebook · only the checking changes
3 · Measurement (orange) / Process Insights becomes the signals. /
lanes, rules, gates, signals: a self-driving company that still pulls over at the gate
Right: Teams approval card mock (asset: teams-approval-mock.png): a Teams message from
"Exchange Recon · Workflows" with card "Invoice gate · a decision is needed", facts
(Price variance +10% on line 1, Quantity variance +1 unit, Line value GBP 1,375,
Rulebook says outside tolerance · needs a person), buttons "Approve the correction"
and "Escalate to the buyer", caption "today: this card is sent live from the flow ·
next: the buttons act on the gate".

### Slide 10 · CLOSE (thank-you slide, last thing they read)
Big brand THANK YOU treatment, then:
Headline: Deterministic AI is the new RPA.
Three lines below:
- Distribution into the landscape you already have wins. People do not want agents
  doing new things.
- They want the boring part of their work taken away.
- A trustable AI workforce, measured in outcomes. (orange, bold)

### Appendix A1 · Q&A · Governance and audit
Kicker: who owns the decision: always a person
- No write tool is bound to any agent · the ability to spend does not exist
- Every decision reconstructable: who, what, why on the run record plus the evidence bucket
- The rulebook is DMN · finance changes thresholds without a release
- The line into SAP is read-only, client-credential scoped
- When anything is uncertain, the flow fails toward a person, never away from one

### Appendix A2 · Q&A · Testing, exceptions, edge cases
Kicker: tested like a product, not a demo
- Twelve graded tests, all passing, judged by an independent second model
- Safety nets on every task · degraded runs still reach the human gate, proven
- The one failure class nets cannot catch (pre-execution input faults): found, filed, documented
- Ten-minute self-escalation fired unattended, twice, on record
- 16 trace-backed platform findings filed with the product feedback pack

### Appendix A3 · Q&A · As deployed
Title: Q&A · As deployed
Visual: full architecture image (asset: arch-deployed.png): three zones (PEOPLE SIGN ·
UIPATH AUTOMATION CLOUD · SAP BTP + S/4HANA), solid lines = executed live, dashed red =
prepared and HELD by design.

### Appendix A4 · Q&A · The map
Title: Q&A · 234 tasks. 187 the same shape.
Visual: contract map image (asset: contract-map.png): stat strip (234 tasks mapped ·
187 agent-automatable · 9 human gates · 38 client-retained · 75 to 37 provider FTEs),
seven towers of cards, one card ringed orange: "Invoice reconciliation · Reconcile ·
Gate" with green badge "LIVE: agent #1, 20+ governed runs". Foot band: "Every card
reuses the same three pieces: exception-handling agents, a human gate, a finance
rulebook. The gate stays, the rulebook stays, only the checking changes."

## Ground truth (for any diagram or chip you draw; do not exceed these claims)

- UiPath Maestro BPMN runs the governed flow: event-based human gate correlated on the
  PO number, ten-minute SLA timer (fired unattended twice), boundary safety nets on
  every agent, rule and connector task.
- Three coded agents (matching, variance, posting-prep), built with Claude Code and
  the uip CLI. They read, check, write up evidence, and stop. No chat, no improvising,
  no touching money.
- MCP server on SAP BTP, read-only, client-credential secured, reads live purchase
  orders from a live S/4HANA cloud tenant. Full governed run measured at 2:56.
- Write-back prepared and HELD. No write tool bound. Auto-clear designed, parked,
  conservative by default.
- DMN policy: 2% price, 1 unit quantity thresholds finance owns.
- Notifications sent by the flow itself: Teams webhook card + Slack on approve;
  Teams + Gmail + Slack on escalate.
- Action Center enabled on the tenant, inbox live, task app next.
- Test Manager: 12 eval cases + test set loaded via API, all passing, judged by an
  independent second model. Insights enabled for outcome metrics.
- Evidence: 21-artifact storage bucket, per-step run records, 16 filed platform
  findings, public repo + README + sub-5-minute video at submission.

## Tone

Deterministic. Trust-first. Auditable. Human wins the framing: agents take over the
boring checking, matching and chasing; a person keeps the only pen. Confidence without
hype. Boring is a feature.
