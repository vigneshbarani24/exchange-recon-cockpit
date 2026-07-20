# WIN-PROBABILITY.md — grounded, cited estimate

> These are **reasoned estimates** built from the public field math + the honest scorecard in `VERIFIED-STATE.md` + judge fit. They are not measured probabilities. Where a number is anchored to a source, the source is cited; the probability itself is judgement.

## 1. The field math (cited)
- **Scale of the field.** AgentHack 2025 drew *"400+ submissions from over 50 countries"* [UiPath community blog, 2025 recap]; the 2025 program *"generated 126 use cases"* [UiPath PRNewswire, May 15 2026]. 2026 competes for *"a $48,000 prize pool distributed across 16 awards, including an $8,000 Grand Prize"* [PRNewswire] (UiPath marketing and Devpost say $50,000).
- **Finalist cap.** *"Up to 10 of the highest-scoring submissions per track will participate in a live finale event on Zoom"* [Devpost rules, verbatim]. You are a finalist in **Track 2 — UiPath Maestro BPMN**.
- **Your track prize.** *"Best of UiPath Maestro BPMN — $5,000"* [Devpost rules]. So the **base rate to win your track** ≈ 1 in ≤10 → **~10–15%** before any quality adjustment.
- **Extra shots on goal.** A project can win **max two prizes** (one track/overall + one special) [Devpost rules]. Beyond the track prize you are eligible for: Grand Prize $8,000, Runner-up $3,000, Honorable Mention $2,000, **Best Demo / Presentation $3,000**, **Most Creative $3,000**, and **People's Choice $500 ×3** (community vote). So **P(win *something*) > P(win the track)**.

## 2. How the finale is scored (cited)
Five **equally weighted** criteria, judged on the **live presentation + Q&A** [Devpost rules]: Business Impact & Adoption · Platform Usage · Technical Execution/Feasibility/Versatility · Creativity & Innovation · Presentation. Plus **up to 2 bonus points** for evidenced coding-agent use (Claude Code) inside Platform Usage. Max base 25, max 27.

Mapping the honest scorecard (`VERIFIED-STATE.md`) onto 25:
- **Baseline (Phase-1 assets, before this session):** ≈ 3+4.5+3.5+4+3 = **18/25 (+1) = 19/27**. Dragged by an unquantified business case and no live-presentation deck.
- **Now (this session banked):** the Cinder deck is built, **all three agents are proven live with committed receipts** (Technical Execution → 4), and the quantified close is written — so realistic current standing is already near **~22–23/27**. Remaining lift is execution: rehearsal, the backup video, and landing the close live.
- **After the fixes:** ≈ 4+4.5+4+4.25+4 = **20.75/25 (+2) = 22.75/27**. That moves you from "solid finalist" into "podium-contention" range.

## 3. Judge fit (cited stances)
- **Taqi Jaffri** (VP PM) — agent governance, evaluations, orchestration. On record: *"agents are non-deterministic… that creativity becomes a liability when business processes have compliance requirements, financial consequences"*; *"even with humans… we constrain them inside these workflows"* [diginomica, Dec 2025]. Your governed-agency architecture (agent inside a Maestro workflow, read-only, human gate, deterministic-only write) is **unusually well-aligned** with his worldview. **This is your judge.**
- **Ingo Philipp** (VP PM) — testing, quality, Test Cloud. On record: *"certainty is the closing of the testing mind"*; agentic testing must *"strengthen the quality signal, not… increase the volume."* Your **weakest surface**: only `variance-agent` has an eval set (one LLM-judge case), no test story for matching/posting-prep, thin edge-case coverage (`VERIFIED-STATE.md`). This is where you lose points if unprepared.

## 4. The estimate
| Target | As-is | After the fixes | Why |
|---|---|---|---|
| **Win *some* prize** | ~15% | **~35–45%** | Above-median scorecard + multiple eligible awards + community vote |
| **Best of Maestro BPMN** ($5k, your track) | ~12% | **~25–30%** | Deep, deliberate Maestro usage is your strongest card; direct competition is other Track-2 finalists |
| **Best Demo / Presentation** ($3k) | ~8% | **~20%** | Only if the live demo lands and the deck is built — high variance |
| **Most Creative** ($3k) | ~10% | **~18%** | "Reason over the *real* system of record" + governed agency is genuinely novel |
| **People's Choice** ($500 ×3) | low | **~20–30%** | Pure function of the social push + your KaarTech/SAP network; not judge-dependent |
| **Grand Prize** ($8k) | ~3% | **~5–10%** | Stretch: teams that show a *fully composed* run and hard measured ROI out-gun the unproven Maestro-instance e2e |

**Bottom line:** as-is you are a **credible finalist with roughly a 1-in-7 shot at a prize**; execute the five levers below and you are a **1-in-3-to-1-in-2 shot at a prize**, with *Best of Maestro BPMN*, *People's Choice*, and *Best Demo* as the most winnable targets. The Grand Prize is not the realistic play; **winning your track + a special award (the max two prizes allowed) is.**

## 5. The five levers that move the number (ranked by point-impact)
1. **Quantified close.** Replace the un-numbered ending with the *measured* **64-second agent verdict** [`ARCHITECTURE.md:191`] — the judgment step that anchored a ~35-minute manual task — and the end-to-end **~86% faster** figure (5-min assisted vs 35-min, `BUSINESS-CASE.md:37`, illustrative). Do **not** headline "97%": that's compute-only (64s vs the full 35 min) and invites the Q&A "isn't the human still ~5 minutes?" Pair with one labeled modeled figure (~1.5 FTE / ~$187k/yr). Lifts **Business Impact 2.5 → 4**. Highest ROI single change.
2. **Build the Cinder deck, fused with *Workforce-to-Workflow*.** No finale deck exists. Frame the problem as the *thesis* (labor concentration → the 75% repeatable back-office work is the target), and your live-SAP agent as the proof. Lifts **Presentation 3 → 4** and reinforces Business + Creativity. See `DECK-STRATEGY.md`.
3. **Land the live demo.** Self-contained cockpit hero + a captured live-SAP job as proof, led live with a recorded fallback (`DEMO-RUNBOOK.md`). Directly targets **Best Demo / Presentation**.
4. **Close the two Q&A gaps.** An evaluation + drift answer for Jaffri; a testing + named-edge-case answer for Philipp. Protects **Technical Execution** and **Presentation (Q&A)** — the criteria explicitly include *"quality of responses during Q&A."*
5. **Honesty-harden the repo (+2 bonus).** Commit a job-output receipt, delete the stale `out.json`, fix the non-existent `demoData.ts` evidence row, reconcile the job IDs (`VERIFIED-STATE.md`). Earns the **second coding-agent bonus point** and removes the one thing that could make a diligent judge discount everything.

## 6. What could sink it (guard these)
- Claiming the 3-agent Maestro ran end-to-end, or showing the write-back "land" — both are provably false and either invites a fatal Q&A contradiction (`VERIFIED-STATE.md`).
- A live demo that dies with no fallback cued.
- Freezing on Philipp's testing/edge-case questions.
- Presenting the fictional six-case/fraud script — only over-delivery is real.
