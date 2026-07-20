# VERIFIED-STATE.md — what is actually true (July 2026)

The honesty spine. Every finale claim must trace here. Sourced from four read-only audits + primary git history + job records in the repo. Tier labels: **LIVE-PROVEN** / **BUILT-NOT-RUN** / **HELD** / **ASPIRATIONAL**.

## LIVE-PROVEN (say these freely)
- **The reconciliation agent runs end-to-end, live, against real SAP S/4HANA over MCP.** Full pipeline pull PO → match → classify variance → prepare correction, in one live Orchestrator job. Evidence: commit `840459c` (job `dbf8bfa2`, full pipeline in one agent); later split into three separate **Successful** Serverless jobs on real SAP — matching `750a5c3e` (52s), variance `c51ac7fa` (126s; also `dbedd8aa`, 64s, 2026-06-29), posting-prep `d7b8891e` (52s), folder `Shared/ExchangeReconDemo` (3093256). Ref: `DEMO.md:17-33`, `ARCHITECTURE.md:172,191`, `README.md:131-132`.
- **The "it's live" tell:** the agent is handed *only* the supplier's numbers, yet returns the **PO side** (net price 25.00, order qty 5) — obtainable only by reading S/4 at runtime. Ref: `DEMO.md:31-33`, `variance-agent/main.py:86-90`, `mcp_client.py:35-76`.
- **Governed agency in code:** every agent's system prompt is read-only ("NEVER write to SAP"); structured Pydantic output; bounded 6-turn tool loop; the only write path is a *separate* deterministic CLI the agents cannot call. Ref: `variance-agent/main.py:102-148`, `post_correction.py`.
- **Deliberate platform surface:** Maestro BPMN spine (3 `StartAgentJob` service tasks, JS tolerance gate, message-event HITL, boundary-error escalation) + coded LangGraph agents (uipath-langchain, LLM Gateway gpt-4o) + MCP→S/4 (XSUAA client-credentials, config from Orchestrator assets) + Action Center + TS SDK v1.4.1 + built with `uip` coding-agents (Claude Code). Ref: `ExchangeReconBpmn.bpmn`, `bindings_v2.json`, `src/lib/sdk.ts`, `CODING-AGENTS.md`.
- **One measured performance number:** variance verdict in **64 seconds** (job `dbedd8aa`). Ref: `ARCHITECTURE.md:191`.

## BUILT-NOT-RUN (say "built, validated, deployed" — never "ran end-to-end")
- **The 3-agent Maestro BPMN as a single composed instance.** It is built, passes `uip solution pack --dry-run` (Valid), is deployed and bound to the three agents by release key, and an instance launches — but it **never completes** as one instance (no allocated agent runtime / capacity). Ref: `DEMO.md:84-101`, `SUBMISSION.md:49-52`, `ARCHITECTURE.md:110`.
- **Hard rule:** never say "the Maestro instance resumed," "the gate cleared," or "all three ran end-to-end inside Maestro." They ran as **three separate jobs**, not one composed instance.

## HELD (never show landing on camera)
- **SAP write-back.** `post_correction.py` is the only write path and currently **404s** — the external MCP server (`lemaiwo/btp-sap-odata-to-mcp-server`) returns empty `keyProperties` (a JSDOM bug), so no keyed PATCH can be built. Inside the BPMN, `Task_UpdatePO` is a JS **string stub**, not a real write. Ref: `post_correction.py:11-13`, `writeback-plan.md`. Framing: "prepared and held — armed, not fired."

## ASPIRATIONAL (do NOT demo as real)
- **Of the six invoice scenarios, only over-delivery is built and demoed.** Clean-match / in-tolerance exists in code but is **unseeded** in the demo. **Invoice-before-goods-receipt, duplicate-block, and vendor-bank-change fraud have no code** — no goods-receipt entity, no dedup logic, no bank/vendor-master read. `duplicate-line` is only a classifier *label*. Ref: audit sweep of `*/main.py`, `src/lib/reconDemo.ts`.
- **The build is two-way (invoice ↔ PO), not three-way** — there is no goods-receipt read. Frame as "invoice-to-PO reconciliation," not "three-way match," unless narrating the design intent.

## CREDENTIALS / STAGE RISK
- Committed UiPath tokens are **expired staging JWTs**; the SAP XSUAA secret was shared in chat and **needs rotation** (`SECURITY-CLOSEOUT.md`). Any live read needs re-auth first; the token lives ~1 hour.

## FALSIFIABLE ARTIFACTS TO FIX BEFORE A JUDGE OPENS THE REPO
1. `variance-agent/out.json` is **stale legacy oil-settlement output** ("60,000 bbl", "terminal A") — inconsistent with the P2P story. Remove or regenerate.
2. `CODING-AGENTS.md` cites `src/lib/demoData.ts` and a `VITE_DEMO_FALLBACK` flag that **do not exist** in the code. Correct or delete that evidence row.
3. The variance job ID is inconsistent across docs (`dbedd8aa` in `README.md:53` vs `c51ac7fa` in `CODING-AGENTS.md:28`). Pick one and reconcile.
4. **No job-output receipts are committed** — the four job IDs live only in prose. Commit one job's output JSON / screenshot so the "it ran live" claim is self-verifying in the repo.

## SCORECARD (honest, today → after fixes)
| Criterion (equal weight, 1-5) | Today | After the fixes |
|---|---|---|
| Platform Usage | 4.5 | 4.5 |
| Creativity & Innovation | 4 | 4–4.5 |
| Technical Execution | 3–4 | 4 |
| Business Impact & Adoption | 2.5 | 4 |
| Presentation | 3 | 4 |
| Coding-agent bonus (0–2) | +1 | +2 |
