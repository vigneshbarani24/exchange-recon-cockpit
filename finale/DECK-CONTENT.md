# DECK-CONTENT.md — paste-ready Cinder deck (8 slides)

Fill the official Cinder template with this. Every line obeys `VERIFIED-STATE.md`. Bullets are ≤15 words (say the rest aloud). Speaker notes are what you *say*, timed to the 5-minute slot. The measured **64s** number and the honest **~86%** are baked into slides 4 and 7.

---

## Slide 1 — Title
**Workforce to Workflow**
*A governed agent for the SAP back office.*
VB · KaarTech UK&I · UiPath AgentHack 2026 — Track 2 (Maestro BPMN)

> **Notes (10s):** "Companies are about to hire agents into the back office. The ones who win won't have the smartest agents — they'll have the ones that obey the rules. Here's one that does, running on live SAP."

## Slide 2 — Team
**VB — FDE & Enterprise AI, KaarTech UK&I**
Solo build: agents, Maestro BPMN, and cockpit — all built with Claude Code.
Project: **Exchange Recon Cockpit** — governed procure-to-pay reconciliation on live SAP S/4HANA.

> **Notes (10s):** "I built this end to end — the coded agents, the orchestration, the UI — solo, with Claude Code through UiPath for Coding Agents."

## Slide 3 — Problem + Solution *(the thesis — highest-leverage slide)*
**Problem**
- Enterprise AI pays off where labor **concentrates on repeatable work**.
- In finance, ~**75%** of back-office work is repeatable; ~25% is judgment.
- Invoice-to-PO reconciliation: high-volume, repeatable, real money, control-bound.
- But an agent that's valid in the ERP can still be **unauthorized in the business**.

**Solution**
- A **governed agent** takes the repeatable 75% — reads the live PO, reconciles, classifies, proposes.
- A **human keeps the 25% judgment** and all the authority.
- It reasons over the **real system of record**, not synthetic data — and is **forbidden to write**.

> **Notes (40s):** "The strongest case for enterprise AI isn't a cool demo — it's labor concentration. Map any finance function and roughly three-quarters of the work is repeatable: matching, checks, chasing. That's the target. Invoice-to-PO reconciliation is exactly that shape — high volume, real money, and bound by controls. The hard part isn't reading SAP. It's that an agent can be perfectly valid in the ERP and still do something the business never authorized. So I didn't build a smarter agent. I built a governed one."

## Slide 4 — Benefits + Technologies *(quantify here)*
**Benefits**
- **64 seconds** — measured agent verdict (the judgment that anchored a ~35-min manual task).
- **~86% faster end-to-end** (illustrative: 5-min assisted vs 35-min manual).
- ~**1.5 FTE / ~$187k a year** freed — illustrative model.

**Technologies (UiPath)**
Maestro BPMN · Coded LangGraph Agents · LLM Gateway (gpt-4o) · Orchestrator · Action Center · TypeScript SDK · **UiPath for Coding Agents (Claude Code)**
**Other:** SAP S/4HANA over MCP (XSUAA) · SAP BTP OData→MCP server

> **Notes (25s):** "The measured number: the agent produces a full reconciliation verdict in 64 seconds — the judgment step that used to anchor a 35-minute manual task. End to end, on our illustrative model, that's about 86% faster, roughly one-and-a-half people freed. And it uses the platform deliberately — Maestro is the spine, coded agents do the reasoning, and the whole thing was built with Claude Code."

## Slide 5 — Architecture *(show BEFORE the demo)*
One clean diagram (reuse `docs/diagrams/`). Left→right:
Supplier invoice → **matching · variance · posting-prep agents** (read S/4 over MCP · read-only — **all three proven live**) → **deterministic tolerance gate** → **human Approve/Escalate** (Action Center) → **prepared correction, held**.
Label each element **LIVE** (agent reads) · **LIVE** (Maestro spine — composed instance completed 2026-07-21, all three agents, both gate branches) · **HELD** (write-back).

> **Notes (20s):** "Here's the whole flow before I show it running. Agents read SAP and reconcile — read-only. A deterministic rule decides auto-clear versus escalate. A human approves. And only then a deterministic step writes. Three kinds of authority, kept separate on purpose."

## Slide 6 — The governance spine *(your differentiator)*
**Three Laws of the governed back office**
1. Every agent action is **authorized before it happens**.
2. Every exception reaches a **human, with evidence**.
3. Every decision is **reconstructable** afterward.

> **Notes (20s):** "The design is three rules, lifted from a real finance control. One: authority lives in the workflow, not the prompt. Two: exceptions go to a human with the evidence assembled. Three: every decision is reconstructable. What's new isn't the rules — it's an agent that obeys them."

## Slide 7 — Live demo → Impact *(peak-end)*
*(Cue the live demo here — see `DEMO-RUNBOOK.md`. Return to this slide to close.)*
**64 seconds to a verdict. Every decision governed, a human at the gate.**

> **Notes (close, 15s):** "Sixty-four seconds to a reconciliation verdict — governed, and a named human at the gate. Every company is about to put agents in the back office. The winners will be the ones whose agents obey the rules. Thank you."

## Slide 8 — Thank you
Repo: github.com/vigneshbarani24/exchange-recon-cockpit · Devpost link
*(Add the Devpost URL — this is your People's Choice vote driver.)*

---

## Fill order
1. Open the Cinder `.pptx`, delete placeholder text, paste headings + bullets above.
2. Reuse the *Workforce-to-Workflow* pyramid / 75-25 teardown / formula visuals on slides 3–4 (they carry the "why" better than words).
3. Put the architecture diagram (slide 5) in before rehearsing — you show it *before* the demo.
4. Keep it to these 8. Under 10 is the template rule.
