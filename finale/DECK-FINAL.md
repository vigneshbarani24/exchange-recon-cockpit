# DECK-FINAL: the built finale deck, slide by slide

This file is the source of truth for the deck that is already BUILT and sitting at
Downloads/AgentHack 2026 Finale - Exchange Recon (VB).pptx (official template, 14
slides: 10 mains + 4 Q&A appendix). Rebuilt on finale morning to VB's spec: iceberg
restored, exception framing front and center, the close verbatim. Builder script:
.agent/tmp/build_finale_deck.py. Images live in finale/assets/ (all scrubbed, the
refiner named only as "a downstream refiner", the match never named by document count).

Shape: Duarte sparkline. What-is pain, what-could-be hope, peak at the stop, resolve on
the close. Mains are near-textless on purpose (Mayer redundancy rule: never put on
screen what gets said out loud). The SAY track below is the spoken spine; STORY-FINAL
carries the full beats and timings.

House rules: no em dashes anywhere, no customer names, write-back is HELD, auto-clear
is designed and parked, "live S/4HANA cloud tenant" never "production ERP".

---

## The mains

### 1 · TITLE [Presentation, Creativity]
SHOW: "Deterministic exception-handling agents." Sub: Exchange Recon Cockpit, not one
use case, the work RPA left behind. Chip line of platform names at the foot.
SAY: nothing. This is on screen while beat 1 opens on the invoice vs the PO.

### 2 · ME [Presentation, the +2 setup]
SHOW: "A first-time builder, on purpose." VB, FDE and Enterprise AI, SAP world, agentic
engineering, first build on UiPath ever, solo full stack with a coding agent.
SAY (15s): "I build enterprise AI for SAP landscapes for a living. I had never built on
UiPath before this hackathon. Everything you are about to see was built solo, with a
coding agent, on the platform you are judging."

### 3 · WHAT IS: THE EXCEPTION TAIL [Business Impact]
SHOW: the de-identified P2P swim-lane map with the manual-load tags (10, 12, 32, 19, 15
manual; THE EXCEPTION TAIL; 88 pinned plus 20 orbiting = 108). Orange foot line:
108 recurring manual activities, man-hours bought back, not headcount out.
SAY (30s): "RPA automated the transaction, and it did exactly what it was built to do.
The exceptions were never its job. This is a real procure-to-pay flow from a downstream
refiner, de-identified. Every copper tag is work a person still does by hand: one
hundred and eight recurring activities on one process. Enterprises do not buy state of
the art. They buy those hours back."

### 4 · WHAT COULD BE: THE ICEBERG [Creativity]
SHOW: the iceberg. Rules decide below the waterline, agents reason only at it, one
person signs at the peak. Title: "Not state of the art. Simple. Clean. Auditable."
SAY (20s): "Our answer is deliberately boring. The mass of the system is deterministic:
rulebook, timers, safety nets, audit record. The agents reason only where the written
rules run out. And one person, at the peak, holds the only pen."

### 5 · WHAT WE BUILT [Platform Usage]
SHOW: chip grid (Maestro, coded agents via Claude Code + uip CLI, Orchestrator, Action
Center, Test Manager, Policy DMN, Storage, Evals, MCP to SAP S/4HANA LIVE, Slack, Teams
webhook, Gmail, DETERMINISTIC, AUDITABLE) + our process map with the human gate and
three endings. Foot: the demo runs from here.
SAY (15s): "One governed Maestro flow, and every platform surface that mattered. The
demo you are watching started two minutes ago on the live tenant." (The run was started
at 0:20; this slide is the launchpad and the platform-usage anchor.)

### 6 · THE STOP [Technical Execution, Presentation: the peak]
SHOW: dark slide. "It did four days of work in under three minutes." / "Now it will
wait forever for one person." / "Both are the point."
SAY: the beat-3 words from STORY-FINAL, slowly, over the suspended instance. Then the
proof-of-live moment: the PO-side numbers it could only know by reading the real ledger.

### 7 · PROOF [Technical Execution, Completeness]
SHOW: seven-row status table (governed run 2:56 LIVE; exceptions, failures, edge cases
LIVE; SLA timer fired unattended twice LIVE; the flow tells the team LIVE; twelve graded
tests PASSING; auto-clear PARKED behind a filed defect, conservative by default;
write-back HELD, the pen stays human) + the completeness strip (public repo, README,
sub-five-minute video, 21-artifact evidence bucket).
SAY (25s): "Everything here is built to be signed off, not admired. The rubric asks how
we handle exceptions, failures and edge cases: safety nets on every task, and when
nobody comes within ten minutes it escalates itself. It did that twice last night,
unattended, on the record."

### 8 · OUTCOMES + TWO CUSTOMERS [Business Impact and Adoption]
SHOW: two columns. Refiner: BEFORE 5 desks, 4 days, about $40 a case; AFTER one gate,
2:56 measured, about $6 a case; honest labels; self-funding. Travel group: funded
pilot, 200 invoices a week, about 5.5 analyst hours back weekly, labeled model. Orange
foot: outcome metrics via Process Insights (straight-through rate, hours returned,
exception mix).
SAY (35s): beat 5 first half from STORY-FINAL. Two businesses, one pattern. Numbers
with their labels spoken out loud: the before and after are modeled from discovery, the
two fifty-six is measured.

### 9 · ROADMAP [Creativity, Business]
SHOW: three moves + the Teams approval card mock (with the honest caption: today the
card is sent live from the flow, next the buttons act on the gate).
1 Distribution: business hates another app, the gate moves into Teams.
2 Scale: a swarm of exception-handling agents, 186 more cards, same gate, same
rulebook, only the checking changes.
3 Measurement: Process Insights becomes the signals.
SAY (25s): "Roadmap is three words. Distribution: nobody wants another app, so the gate
moves into Teams, and the card already sends itself today. Scale: a swarm of these
agents, one per card on the map, nothing new to build but the checking. Measurement:
lanes, rules, gates, signals. A self-driving company that still pulls over at the gate."

### 10 · CLOSE [Presentation: the end they remember]
SHOW: THANK YOU + "Deterministic AI is the new RPA." + the three lines.
SAY (the take, word for word): "Deterministic AI is the new RPA. Distribution into the
landscape you already have wins. People do not want agents doing new things. They want
the boring part of their work taken away. A trustable AI workforce, measured in
outcomes. Thank you." Hold. Do not fill the silence.

## The Q&A appendix (never shown unless asked)

### A1 · Governance and audit (the Jaffri lens)
No write tool bound, the ability to spend does not exist. Every decision
reconstructable. DMN rulebook owned by finance. Read-only, client-credential scoped
line into SAP. Fails toward a person.

### A2 · Testing, exceptions, edge cases (the Philipp lens)
Twelve graded tests judged by an independent second model. Boundary nets proven on
degraded runs. The one class nets cannot catch, found and filed. Timer twice,
unattended. 16 trace-backed findings filed.

### A3 · As deployed
The full architecture render: people sign, UiPath Automation Cloud, SAP BTP and
S/4HANA, solid means executed live, dashed red means prepared and held.

### A4 · The map
The contract map: 234 tasks, 187 the same shape, 9 human gates, one card ringed live.

## Timing skeleton (aligns DUMP section 10; beats unchanged)

0:00-0:20 cold open over S1, then the invoice beside the PO. Start the run at 0:20 and
say so. 0:20-1:40 S2 to S5 while it runs (me 15s, tail 30s, iceberg 20s, built 15s,
transitions the rest). 1:40-3:00 the run on screen, S6 behind the suspended instance at
the stop. 3:00-4:15 approve, held correction, S7 proof. 4:15-4:50 S8 outcomes then S9
roadmap fast. 4:50 S10, the take, hold to 5:00. If any rehearsal runs long, cut framing
narration, never the demo, never the stop.

## Jury layer (carry in the head, not on slides)

- Jaffri must hear: orchestration as the governance mechanism, in our words: the gate,
  the rulebook and the record are the product, the agents are replaceable parts.
- Philipp must hear: the rubric's own words back: exceptions, failures, edge cases,
  each with a live proof and one honest PARKED with the defect filed.
- Danger words, never say: autonomous end-to-end, replaces people, production ERP,
  the match by document count, customer names. Never a word against RPA (the room built
  it; the close honors it, nothing else touches it). Never speak "financial close",
  "month-end" or "the books": a rival pitches financial close, and we hand them nothing.
  If a judge points at the close cards on the maps: "that lane is downstream
  bookkeeping, not our target; our card is the invoice gate."
- The safe home base under pressure: a real ledger, a person with the only pen, a
  record for everything.
