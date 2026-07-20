# DECK-STRATEGY.md — the finale deck (Cinder × Workforce-to-Workflow)

**Problem:** no live-presentation deck exists — only the Phase-1 read-along. **Opportunity:** you have two assets that combine into a stronger deck than either alone:
- The blank **Cinder** template = the *structure* the jury expects (Title / Team / Problem+Solution / Benefits+Tech / Architecture / Misc / Closing).
- The **Workforce-to-Workflow** thesis deck = the *why the world should care* — the enterprise story that elevates "we built an invoice agent" into "we're proving the shift from workforce to workflow, in the highest-stakes back office there is."

Rule: **thesis for the frame, the real build for the proof.** Use Workforce-to-Workflow's *argument*, swap its *example* to your actual domain (invoice-to-PO reconciliation, not the deck's generic "Credit Control / collections").

## The narrative arc (one sentence)
*Enterprise AI pays off where labor concentrates on repeatable work → the back office is that place → but in finance, an agent that's valid in the ERP can still be unauthorized in the business → so we built a **governed** agent that does the repeatable reconciliation reasoning live on real SAP, and leaves the judgment and the authority to a human.*

## Slide-by-slide (fill the Cinder template, ≤8 slides)

**1 — Title.** "Workforce to Workflow: a governed agent for the SAP back office." Your name, KaarTech, "UiPath AgentHack 2026 — Track 2 (Maestro BPMN)."

**2 — Team.** You (solo). Role + one credibility marker (FDE / Enterprise AI, KaarTech). Don't apologize for solo — frame as full-stack ownership.

**3 — Problem + Solution** (the fused thesis; this is the highest-leverage slide).
- *Problem:* Enterprise AI impact follows **labor concentration** — Headcount × Repeatability × Process Stability [Workforce-to-Workflow, slides 2 & 11]. The back office is the densest target: in a finance function, ~75% of the work is repeatable (checks, matching, reminders), ~25% is judgment (disputes, exceptions) [W2W slide 8, "Credit Control teardown"]. Reframe to **AP / invoice-to-PO reconciliation**: matching invoices to POs against SAP is high-volume, repeatable, real money, and control-bound.
- *Solution:* a **governed agent** takes the repeatable 75% — reads the live PO from S/4, reconciles, classifies, proposes — while a human keeps the 25% judgment and **all** the authority. Innovation angle: *it reasons over the real system of record, not synthetic data, and it is architecturally forbidden to write.*

**4 — Benefits + Technologies** (quantify here — this slide currently loses you the most points).
- *Benefits:* the **measured** number first — a full reconciliation verdict in **64 seconds vs a ~35-minute manual baseline ≈ 97% faster on an exception** (measured job runtime; baseline illustrative). Then one modeled figure, labeled: "~1.5 FTE / ~$187k/yr on our illustrative model."
- *End-user:* AP / finance ops. *Department:* Accounts Payable / Procurement. *Industry:* any SAP-run enterprise (demoed in a hydrocarbon P2P context).
- *UiPath products:* Maestro BPMN, Coded Agents (LangGraph), LLM Gateway, Orchestrator, Action Center, TypeScript SDK, **UiPath for Coding Agents (Claude Code)** — name the last one explicitly for the bonus.
- *Other:* SAP S/4HANA over MCP (XSUAA), SAP BTP-hosted OData→MCP server.

**5 — Architecture** (show this **before** the live demo — the winner method). The flow diagram: supplier invoice → matching/variance agents (read S/4 over MCP, read-only) → deterministic tolerance gate → **human Approve/Escalate** → prepared correction held. Label each element **LIVE** vs **built/held** honestly (reuse `docs/diagrams/`). One clean diagram, minimal text.

**6 — The governance spine ("Three Laws")** — your differentiator, one slide. (1) every agent action is authorized before it happens; (2) every exception reaches a human with evidence; (3) every decision is reconstructable. Ties directly to what Jaffri rewards.

**7 — Demo handoff / Impact.** One line to cue the live demo, then the close: the 97% number + "every decision governed, a human at the gate." This is your peak-end anchor — the last thing they read.

**8 — Closing / Thank you.** Contact + the Devpost/repo link (for People's Choice votes).

## Design rules (from the presentation research)
- ≤15–20 words per slide; titles 40–60pt, body ≥24pt (30 preferred); one idea per slide.
- Never put a full sentence on screen that you'll also say aloud.
- The Workforce-to-Workflow deck's visual language (the pyramid, the 75/25 teardown, the Headcount × Repeatability × Process Stability formula) is genuinely good — **reuse those three visuals** in slides 3–4; they do the "why" better than words.

## The one trap to avoid
Workforce-to-Workflow's worked example is **Credit Control / collections** (AR — reminders, dispute negotiation). You built **invoice-to-PO reconciliation** (AP). Use the deck's *framework and formula*, but state your example as **AP reconciliation** so the thesis and the demo are the same story. Do not demo collections — you didn't build it.
