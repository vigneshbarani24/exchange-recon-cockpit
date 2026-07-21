# VERIFIED-STATE.md — what is actually true (July 2026)

The honesty spine. Every finale claim must trace here. Sourced from four read-only audits + primary git history + job records in the repo. Tier labels: **LIVE-PROVEN** / **BUILT-NOT-RUN** / **HELD** / **ASPIRATIONAL**.

## LIVE-PROVEN (say these freely)
- **The reconciliation agent runs end-to-end, live, against real SAP S/4HANA over MCP.** Full pipeline pull PO → match → classify variance → prepare correction, in one live Orchestrator job. Evidence: commit `840459c` (job `dbf8bfa2`, full pipeline in one agent); later split into three separate **Successful** Serverless jobs on real SAP — matching `750a5c3e` (52s), variance `c51ac7fa` (126s; also `dbedd8aa`, 64s, 2026-06-29), posting-prep `d7b8891e` (52s), folder `Shared/ExchangeReconDemo` (3093256). Ref: `DEMO.md:17-33`, `ARCHITECTURE.md:172,191`, `README.md:131-132`.
- **The "it's live" tell:** the agent is handed *only* the supplier's numbers, yet returns the **PO side** (net price 25.00, order qty 5) — obtainable only by reading S/4 at runtime. Ref: `DEMO.md:31-33`, `variance-agent/main.py:86-90`, `mcp_client.py:35-76`.
- **Governed agency in code:** every agent's system prompt is read-only ("NEVER write to SAP"); structured Pydantic output; bounded 6-turn tool loop; the only write path is a *separate* deterministic CLI the agents cannot call. Ref: `variance-agent/main.py:102-148`, `post_correction.py`.
- **Deliberate platform surface:** Maestro BPMN spine (3 `StartAgentJob` service tasks, JS tolerance gate, message-event HITL, boundary-error escalation) + coded LangGraph agents (uipath-langchain, LLM Gateway gpt-4o) + MCP→S/4 (XSUAA client-credentials, config from Orchestrator assets) + Action Center + TS SDK v1.4.1 (`package.json:15`) + built with `uip` coding-agents (Claude Code). Ref: `ExchangeReconBpmn.bpmn`, `bindings_v2.json`, `src/lib/sdk.ts`, `CODING-AGENTS.md`.
- **One measured performance number:** variance verdict in **64 seconds** (job `dbedd8aa`). Ref: `ARCHITECTURE.md:191`.
- **All three agents re-confirmed live 2026-07-20:** fresh local `uv run uipath run` invokes against live S/4 — **matching** (both lines matched by material, confidence 1.0), **variance** (price-variance + over-delivery classified, corrections prepared, confidence 0.95), **posting-prep** (read current qty 5, prepared the 5→6 update, `ready_to_post`). Each returned the PO side it could only read from S/4. Receipts in `finale/receipts/`. This upgrades the earlier "only variance had local run evidence" — the full 3-agent pipeline now runs as three live jobs. (Token note: each agent authenticates from its own `.env`; only variance's was fresh, so matching/posting-prep failed until their `.env` was refreshed — a per-folder token, not a code problem.)

## LIVE-PROVEN (new, 2026-07-21): the composed Maestro instance ran end-to-end
- **A composed Maestro instance completed with real agents inside it.** Instance
  `f823f696-aa32-466b-99fc-72a84cd74ea7` (package `ExchangeReconSolutionCanvas.Agentic.ExchangeReconBpmn:1.0.2`,
  folder `Shared/ExchangeReconCanvas`) ran start → **matching-agent as a real StartAgentJob**
  (job `875fc4d3…`, 53s) → deterministic tolerance gate → **variance-agent as a real StartAgentJob**
  (job `7631a1d9…`, 62s) → **message-based human gate paused ~6 min and was cleared by a governed
  `ApproveGate` message** → completed (escalation path on run 1). Evidence: `finale/maestro/`.
- **Precision for Q&A:** run 1's decision routing defaulted to the governed *escalate* ending
  (message-envelope shape); the Approve → posting-prep → Corrected path is wired in v1.0.3 —
  only claim the three-agents-in-one-instance version if a completed run shows `Task_PostingPrepAgent`
  with a job key. The gate correlates message name+reference; it does not verify approver *role*
  (Action Center task = roadmap). The old hard rule ("never say the gate cleared") is retired —
  superseded by this run.
- Historical refs (pre-2026-07-21 state): `DEMO.md:84-101`, `CODING-AGENTS.md:74-79`, `ARCHITECTURE.md:110`.
- **Portal process 2206307 (`sol.Agentic.ExchangeReconBpmn@1.0.2`) is the LEGACY STUB BPMN — do NOT demo it as the real 3-agent flow.** Confirmed from a live trace of instance `255785a6-1b72-4059-b079-5613f2eb7c55` (2026-07-20, trace + instance JSON): the "Variance agent: explain variance" step is `elementType: ScriptTask` (elementId `Task_Agent`, a single stub — not `StartAgentJob`), `orchestratorJobLink` is empty on every step, all five steps completed in ~3 s total, and the start event is the legacy "Settlement pair ready." So **zero real agent jobs launched**; this instance proves only that the Maestro shell + tolerance gate + message-based human gate run e2e as personal automation. It does **not** prove the composed 3-agent run. The real P2P StartAgentJob BPMN is a later package version and remains BUILT-NOT-RUN. Ref: `trace-1784543789525.json`, `Instance_255785a6…json`.

## HELD (never show landing on camera)
- **SAP write-back.** `post_correction.py` is the only write path and currently **404s** — the external MCP server (`lemaiwo/btp-sap-odata-to-mcp-server`) returns empty `keyProperties` (a JSDOM bug), so no keyed PATCH can be built. Inside the BPMN, `Task_UpdatePO` is a JS **string stub**, not a real write. Ref: `post_correction.py:11-13`, `writeback-plan.md`. Framing: "prepared and held — armed, not fired."

## ASPIRATIONAL (do NOT demo as real)
- **Of the six invoice scenarios, two are built and demoed — price-variance (item 10, 25.00→27.50) and over-delivery (item 20, qty 5→6)** (`src/lib/reconDemo.ts:54-85`). Clean-match / in-tolerance exists in code but is **unseeded** in the demo. **Invoice-before-goods-receipt, duplicate-block, and vendor-bank-change fraud have no code** — no goods-receipt entity, no dedup logic, no bank/vendor-master read. `duplicate-line` is only a classifier *label*. Ref: audit sweep of `*/main.py`, `src/lib/reconDemo.ts`.
- **The build is two-way (invoice ↔ PO), not three-way** — there is no goods-receipt read. Frame as "invoice-to-PO reconciliation," not "three-way match," unless narrating the design intent.

## CREDENTIALS / STAGE RISK
- Committed UiPath tokens are **expired staging JWTs**; the SAP XSUAA secret was shared in chat and **needs rotation** (`SECURITY-CLOSEOUT.md`). Any live read needs re-auth first; the token lives ~1 hour.

## FALSIFIABLE ARTIFACTS TO FIX BEFORE A JUDGE OPENS THE REPO
1. `variance-agent/out.json` — **regenerated 2026-07-20** by a fresh live run; now the real P2P reconciliation for PO 4500000021 (no longer the stale oil-settlement output). A copy is committed at `finale/receipts/`.
2. `CODING-AGENTS.md` cites `src/lib/demoData.ts` and a `VITE_DEMO_FALLBACK` flag that **do not exist** in the code. Correct or delete that evidence row.
3. The variance job ID is inconsistent across docs (`dbedd8aa` in `README.md:53` vs `c51ac7fa` in `CODING-AGENTS.md:28`). Pick one and reconcile.
4. **Job receipt — captured 2026-07-20.** A fresh live-run output (local `uv run` invoke against live SAP) is committed at `finale/receipts/variance-agent-PO4500000021.json`, so the read path is self-verifying in the repo. For *cloud-job* proof, a screenshot of an Orchestrator job in folder 3093256 is still a nice-to-have.

## SCORECARD (honest, today → after fixes)
| Criterion (equal weight, 1-5) | Today | After the fixes |
|---|---|---|
| Platform Usage | 4.5 | 4.5 |
| Creativity & Innovation | 4 | 4–4.5 |
| Technical Execution | 4 | 4 |
| Business Impact & Adoption | 2.5 | 4 |
| Presentation | 3 | 4 |
| Coding-agent bonus (0–2) | +1 | +2 |
