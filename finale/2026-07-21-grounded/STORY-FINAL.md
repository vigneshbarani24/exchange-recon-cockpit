# STORY-FINAL: the new wave, deterministic exception-handling agents

The finale story, business only. This file supersedes STORYCRAFT Part B as the spoken
spine; STORYCRAFT Part A remains the technique reference. Choreography and timings are
DUMP section 10, unchanged. Q&A depth lives in QA-BANK, unchanged: on stage we speak
business; when a judge asks technical, we go as deep as they want.

House rules: no em dashes, never name the match by document count, no customer names
(only "a UK adventure travel group"), write-back is HELD, auto-clear is designed and
parked with the conservative default, "live S/4HANA cloud tenant" never "production ERP".

---

## The line

> **We build the new wave: deterministic exception-handling agents.**
> RPA automated the transactions. The exceptions stayed human: the checking, matching,
> chasing work people were hired to do and hated every minute of. These agents take the
> exceptions, you can audit every step, and a person keeps the only pen.

This is not a one-off use case. Reconciliation is agent number one of a family, and the
map on slide two shows the other cards. The industry itself turned this year: autonomy
without structure creates slop. This is what structure looks like.

## The Take (the close, land it word for word)

> Boring is a feature. Boring is what auditors sign.
> Deterministic AI is the new RPA, and this platform is giving it the same discipline it
> gave RPA the first time. Thank you.

---

## The five beats (business words only; timings from DUMP section 10)

### Beat 1: the cold open (0:00 to 0:20, ~50 words)
Screen: slide 1, then the invoice beside the SAP purchase order line.

> A supplier invoiced us, and the numbers do not match the purchase order. Someone has to
> work out why, against the real ledger, before money moves. Most demos would now agree
> two numbers they invented. This one is about to read a purchase order it has never seen.

Technique: misdirection-correction. Nothing changed from the proven open; do not touch it.

### Beat 2: the work everyone hates (0:20 to 1:40, ~200 words)
Screen: start the run at 0:20 and say so. Slide 2 (the map), then slide 3 or 4.

> I have just started the process. It takes about three minutes, so let me tell you what
> it is while it runs.
>
> This is a real back-office contract, taken apart task by task: paying suppliers,
> collecting from customers, keeping the records clean, closing the books. Two hundred and
> thirty-four tasks. One hundred and eighty-seven of them are the same shape. Checking.
> Matching. Chasing. Reconciling. The work people were hired to do and hated every minute
> of. And exactly nine are moments where only a person signs. When one invoice disagrees
> with one purchase order, it crosses five desks and takes four days, and nobody involved
> would call it a good use of their week.
>
> The first wave, RPA, automated the transactions and left the exceptions to people. The
> second wave promised autonomous agents and mostly delivered noise. We build the new
> wave: deterministic exception-handling agents, for exactly that leftover work and
> nothing else. They do not chat, they do not improvise, they do not touch money. Each one reads the real system, does the checking a person used to do, writes up
> its evidence, and stops. The rules that can be written down decide most cases in a
> second. The agents only reason where the rules run out. And one person, at the top,
> holds the only pen that can commit anything.
>
> Card number one is running behind me right now: the invoice that does not match. And in
> about a minute it is going to do the one thing demos never do. It is going to stop.

### Beat 3: the stop (2:10 to 3:00, ~120 words)
Screen: the instance, suspended at the gate. Then the variance verdict. Slow down.

> And there it is. It found the problem, wrote up the evidence, proposed the fix, and
> stopped. On purpose. It did four days of work in under three minutes, and now it will
> wait forever for one person. Both are the point.
>
> Now the moment that decides whether you believe any of this. The agent was given only
> the supplier's numbers. It is reporting the purchase order side: twenty-five pounds,
> quantity five. There is exactly one way it can know that. It read the real ledger,
> live, while you watched.

(Twin variant, if the twin demos: "and if nobody comes within ten minutes, it does not
sit quietly. It escalates itself, and tells the team in Teams, Slack, and email that it
did.")

### Beat 4: why finance signs it (3:00 to 4:15, ~180 words)
Screen: approve; the prepared correction, held; then the status slide.

> A person decides. I approve, and it finishes the paperwork: the exact correction,
> written up, ready, and held. Nothing is posted. The system that found the problem is
> physically unable to spend the money that fixes it. Not a policy it follows. Not a
> promise we typed. The ability does not exist.
>
> Everything here is built to be signed off, not just admired. Twelve graded tests, all
> passing, checked against the live ledger by a second, independent model. Every decision
> reconstructable afterwards, down to who approved what and why. When anything is
> uncertain, the system fails toward a person, never away from one. And as of last night
> the process reports its own outcomes: when it finishes, it tells the team in Teams and
> Slack itself, and when it escalates, email too. No spreadsheets announcing themselves.
> The process speaks.
>
> One more sentence, because it is the part a jury should weigh: I had never built on this
> platform before this hackathon. A first-time builder, working with a coding agent on the
> same platform you are judging, took this from nothing to a funded-pilot-grade proof, and
> when the hardest problem hit, it was the coding agent that found the cause. That is not
> just my story. That is your product working. The whole trail ships with the submission.

### Beat 5: the value, then The Take (4:15 to 4:50, ~90 words)
Screen: slide 7, the value cards.

> Two businesses, one pattern. A refiner whose manual back office runs to millions a
> year, where one exception costs five desks and four days. And a UK adventure travel
> group with two hundred supplier invoices a week that would flow through exactly this
> gate; that pilot is funded and proven live. On those volumes this returns roughly five
> and a half analyst hours a week. That number is a model, and the slide says so. Call it
> most of somebody's Friday, handed back every week, with a person still holding the pen.
> Reconciliation is card number one. There are one hundred and eighty-six more on the map,
> and not one of them needs a second project: the gate stays, the rulebook stays, only the
> checking changes. Every single one of them is boring.
>
> And boring is a feature. Boring is what auditors sign. Deterministic AI is the new RPA,
> and this platform is giving it the same discipline it gave RPA the first time. Thank you.

Hold 4:50 to 5:00. Do not fill it.

---

## The jargon translation table (spoken track only; Q&A may go technical freely)

| Never say on stage | Say instead |
|---|---|
| MCP, OData, XSUAA | a live line into SAP / it reads the real ledger |
| BPMN, Maestro process | the process map / the process |
| Boundary error events | safety nets: a failure can never block the decision |
| Evals, LLM judge | twelve graded tests, checked by an independent second model |
| DMN, business rule task | the finance rulebook: thresholds finance changes without a release |
| Message correlation, gate events | the decision travels with the purchase order number |
| StartAgentJob, coded agents, LangGraph | the agents (three of them, each does one job) |
| Instance, element executions | the run / the record of every step |
| SLA timer PT10M | if nobody comes in ten minutes, it escalates itself |
| Auto-clear parked, defect | when anything is uncertain, it goes to a person by default |

Platform names live in exactly three places, deliberately: the chip line on slide 1, the
status table on slide 6, and Q&A. That is where the Platform Usage score is earned; the
narrative earns everything else.

## Technique checklist (AI-Daily-Brief discipline, per beat)

- Thesis-first: the line lands inside the first 90 seconds (beat 2). Done.
- Coined compound: "the boring agents", said three times (beats 2, 5, The Take). Done.
- Misdirection-correction: beat 1 (invented numbers vs the real ledger). Done.
- Quantified transformation: four days and five desks to three minutes and one
  signature; 234 and 187; 200 a week; five and a half hours; 186 more cards. Done.
- The absence pivot, held for Q&A or the close if room allows: "the industry spent this
  month arguing who owns the model. The back office asks a smaller, older question: who
  owns the decision. Here it is always a person."
- The Take: a stance, not a summary. Done.

## Fact anchors (every claim above, screenshot-able)

- 234 / 187 / 9 gates / 75 to 37: the public contract-map artifact (slide 2 screenshot).
- Four days, five desks, millions a year: DUMP slide-3 canon (refiner discovery).
- Three minutes: trophy run 2:56 (instance 2db6d4d8); "found, wrote up, proposed": the
  variance verdict and prepared corrections on the trace.
- Reads the real ledger live: PO-side values in the variance output (25.00, qty 5);
  any-PO lookup exists for Q&A challenges.
- Physically unable to spend: no write tool bound (tool contract); write-back HELD.
- Twelve graded tests + independent second model: finale/evals/, CLAUDE-TESTER-VALIDATION.
- Reconstructable: per-element record with job keys; 21-artifact evidence bucket.
- Fails toward a person: conservative-by-default routing (auto-clear designed, parked).
- The process speaks: twin 1.0.16 traces (6b2ecc38 approve: Teams + Slack; 1021b02a
  escalate: Teams + Gmail + Slack). Ten-minute self-escalation: e2b9e3d8, ccb30345.
- Coding agent + trail: CODING-AGENTS.md, commit history ("ships with the submission"
  until the repo flip is confirmed).
- 200 a week, funded pilot, proven live: QA-BANK adoption answer wording.
- Five and a half hours: labeled model, arithmetic on deck slide 8.

---

## Slide map for the rebuilt deck (finale morning, 2026-07-23)

The beats above are unchanged. The deck was rebuilt to 10 mains + 4 Q&A appendix
(Downloads: AgentHack 2026 Finale - Exchange Recon (VB).pptx; per-slide SHOW/SAY in
DECK-FINAL.md). Where a beat says "slide N", read it against this map:

| Beat | Slides on screen |
|---|---|
| Beat 1, cold open | S1 title, then the invoice beside the PO |
| Beat 2, the work everyone hates | S2 me, S3 exception tail, S4 iceberg, S5 what we built (start the run at 0:20) |
| Beat 3, the stop | the suspended instance, S6 behind it |
| Beat 4, why finance signs | approve on screen, then S7 proof |
| Beat 5, the value | S8 outcomes and customers, S9 roadmap |
| The Take | S10 close, hold to 5:00 |

Old references translate as: "slide 2 (the map)" is now Q&A appendix A4; "slide 3 or 4"
is now S3; "the status slide" is S7; "slide 7, the value cards" is S8. The Q&A appendix
(A1 governance, A2 testing, A3 architecture, A4 map) exists only for the 3-minute jury
Q&A; never present it in the 5 minutes.
