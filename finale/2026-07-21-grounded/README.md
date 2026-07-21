# finale/2026-07-21-grounded

The grounded finale package. Written 2026-07-21, two days out, against the repo as it
actually is after the composed Maestro instance ran green this morning.

**This folder supersedes the July 20 finale set.** The July 20 docs were written when the
three-agent Maestro composition was BUILT-NOT-RUN. That is no longer true. Any doc in the
parent `finale/` folder that says the composed instance cannot complete is stale and must
not be read as current.

## Read in this order

| File | What it is | Read it when |
|---|---|---|
| `TRUTH.md` | The honesty spine. What is proven live, what is held, what is aspirational, with instance and job IDs. Every other file defers to this. | First. Always. |
| `NARRATIVE.md` | The argument. AI is the new RPA; reasoning is real, authority is the problem; stateless reasoning, stateful process. The lines to say and the lines never to say. | Before writing any slide or script. |
| `VALUE.md` | The two anonymised proof cases with real numbers, and the modelled ROI they support. | Building the business-impact beat. |
| `GROUNDING.md` | External grounding: the five finale criteria verbatim, the coding-agent bonus, the two judges, the track definition, Ebru's method decomposed, the competitive field. | Checking a claim about the competition itself. |
| `DECK.md` | Slide-by-slide content for the official template, paste ready. | Building the deck. |
| `SCRIPT.md` | The 5 minute script and the demo beat sheet, timed, plus the failure protocol. | Rehearsing. |
| `QA.md` | The 3 minute jury Q&A, answer first, with the trap answers corrected for the green run. | Drilling. |
| `BUILD-BRIEF.md` | What Claude Code builds, triaged by risk, including the full Teams approval design. | Building. |

## Supersession map

| Older file | Status |
|---|---|
| `finale/VERIFIED-STATE.md` | Superseded by `TRUTH.md`. It records run 1 only and still calls the composition partly unproven. |
| `finale/DEMO-RUNBOOK.md` | Superseded by `SCRIPT.md`. Its line "Never: try the 3-agent Maestro run live (it can't complete)" is now false. |
| `finale/DECK-CONTENT.md` | Superseded by `DECK.md`. Slide 5 labels the Maestro spine BUILT; it is now LIVE. |
| `finale/QA-BANK.md` | Superseded by `QA.md`. Two trap answers assert the composed instance never ran, and one states the travel volume as monthly when it is weekly. |
| `finale/RUBRIC-MATCH.md` | Still broadly right on method; the Technical Execution and Platform Usage scores are now understated. Re-score from `TRUTH.md`. |
| `finale/maestro/README.md` | Accurate for run 1. Run 3 is the one to lead with. |
| `finale/receipts/` | Unchanged and still valid. |

## The one-line status

The single highest-leverage gap in every competitive read of this project, a composed
Maestro instance that does not finish, closed at 06:43 UTC today. Three coded agents ran as
real Orchestrator jobs inside one BPMN instance, against live SAP, through a deterministic
gate and a human gate, to a Corrected end event. The remaining work is not engineering. It
is telling it correctly in five minutes.

## Hard rules for everything written from here

1. Every claim carries a tier: LIVE, HELD, or ASPIRATIONAL. If it has no tier, do not say it.
2. No customer names. The refiner and the travel group are anonymised. The fictional demo
   tenant is Calder Refining. Mariner is a KaarTech product name and is allowed.
3. No em dashes and no double hyphens in prose.
4. If a statement here conflicts with the codebase, the codebase wins. Flag it, do not force it.
