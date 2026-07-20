# RUBRIC-MATCH.md — how each finale point is won

Five **equally-weighted** criteria, scored on the **live presentation + Q&A** (Devpost), 1–5 each = 25, plus up to **+2** coding-agent bonus = **27**. This maps every criterion to the exact slide / demo beat / Q&A answer that earns it, the honest score, and the one remaining move. Grounded in `VERIFIED-STATE.md` (all three agents now proven live).

---

## 1. Business Impact & Adoption Potential
- **Judged (verbatim):** "real-world relevance and production viability … clarity of the business case and the scalability of the approach."
- **Earn it with:** the Workforce-to-Workflow thesis (labor concentration → the 75% repeatable AP work is the target, slide 3); the quantified close (slide 4/7) — **64s measured verdict**, **~86% end-to-end** (illustrative), ~1.5 FTE; adoption = mirrors a mandatory finance control, scales by suppliers not headcount.
- **Where:** slide 3 (problem), slide 4 (numbers), slide 7 (close).
- **Score:** 2.5 → **4** with the number said as the last line.
- **Move:** name the buyer (AP/finance) and the control it replaces; end on the hard number.

## 2. Platform Usage (+ up to 2 bonus)
- **Judged:** "depth and deliberateness of UiPath platform usage … Maestro, coded agents, API Workflows … coding agents → additional points."
- **Earn it with:** Maestro BPMN spine (3 StartAgentJob, tolerance gate, message-event HITL, boundary escalation) + **3 coded LangGraph agents, all proven live** on LLM Gateway + MCP→S/4 (XSUAA) + Action Center + TS SDK + built with Claude Code via `uip`.
- **Where:** slide 5 (architecture, shown *before* the demo), the demo opening on the Maestro canvas, the on-screen Claude Code beat.
- **Score:** **4.5** — your strongest card.
- **Bonus:** +1 → **+2** via the honest CODING-AGENTS.md (done) + the video showing Claude Code building. Show the coding agent on screen.

## 3. Technical Execution, Feasibility & Versatility
- **Judged:** "architectural soundness, code quality, and production-readiness … handling of exceptions, failures, and edge cases."
- **Earn it with:** **all three agents proven live on real SAP** (receipts, `finale/receipts/`, 2026-07-20); typed Pydantic I/O; bounded tool loops; read-only-by-design + a *separate* deterministic write; secrets from Orchestrator assets. Answer the failure question with the named edge-case list + honest eval story (`QA-BANK.md`).
- **Where:** the demo (agent reasoning + the live-SAP tell), the Q&A (eval/drift, testing/edge-cases).
- **Score:** 3–4 → **4** now — three live agents is a real jump. Capped below 5 by the unproven Maestro-*instance* composition + held write-back, both honestly disclosed.
- **Move:** lead with the receipts; own the two gaps before they're asked.

## 4. Creativity & Innovation
- **Judged:** "originality … novel design decisions, unexpected orchestration patterns, and creative problem framing."
- **Earn it with:** "reason over the **real** system of record, not synthetic data" + **governed agency** (agent forbidden to write; deterministic-only write; the Three Laws) + the Workforce→Workflow framing.
- **Where:** the cold open (authority framing), slide 6 (Three Laws), the live-SAP tell.
- **Score:** **4**.
- **Move:** land the line — "valid in the ERP, still unauthorized in the business." That's the original insight.

## 5. Presentation
- **Judged:** "clarity, structure, and delivery … logical flow from problem to solution to impact, the confidence and coherence of the demo, the accessibility of technical communication, and the quality of responses during Q&A."
- **Earn it with:** the built Cinder deck, the 5-min script, diagram-before-demo, the quantified peak-end close, the drilled Q&A bank, lead-live-with-fallback.
- **Where:** the whole 5 minutes + 3-min Q&A.
- **Score:** 3 → **4** with the deck built (done) + rehearsal + Q&A drilled.
- **Move:** rehearse to 4:45; memorize the first 35s and the close; answer-first in Q&A.

---

## Scoreboard (honest)
| Criterion | Today | After the moves |
|---|---|---|
| Business Impact & Adoption | 2.5 | 4 |
| Platform Usage | 4.5 | 4.5 |
| Technical Execution | 4 | 4 |
| Creativity & Innovation | 4 | 4–4.5 |
| Presentation | 3 | 4 |
| Coding-agent bonus | +1 | +2 |
| **Total / 27** | **~19** | **~23** |

## The 5-minute rubric map (nothing left unearned)
| Time | Beat | Criteria it scores |
|---|---|---|
| 0:00–0:30 | Cold open — the authority/fraud catch | Creativity + Presentation hook |
| 0:30–1:00 | Problem + Workforce→Workflow thesis | Business Impact |
| 1:00–1:30 | Architecture + Three Laws (before demo) | Platform Usage + Creativity |
| 1:30–4:20 | Live demo — 3 agents live, tolerance, HITL, audit, Claude Code on screen | Platform + Technical + Bonus |
| 4:20–5:00 | Quantified close | Business Impact + Presentation (peak-end) |
| Q&A | Answer-first, eval/drift + edge-cases | Technical + Presentation |

## The 3 highest-leverage remaining moves
1. **Rehearse the live demo + pre-flight** (refresh all 3 `.env`) — protects Platform, Technical, and Presentation at once.
2. **Record the backup video showing Claude Code building** — banks the +2 bonus and de-risks the demo.
3. **Land the quantified close every run** — the single biggest Business-Impact lift.
