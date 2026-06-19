# Tasks — Procure-to-Pay PO Reconciliation (end-to-end, multi-agent, MCP→S/4)

Work top-to-bottom, one at a time, checkpoint commits. Phases are demoable in order; 1–3
alone are a strong submission if Phase 4 runs short.

## Phase 0 — Foundation (done)

- [x] T0.1 VB authenticated the SAP Cloud VB MCP.
- [x] T0.2 Enumerated tool surface + service catalog. Finding: no Finance/G/L; rich writable
      Purchase Order service. Pivoted domain to Procure-to-Pay. Confirmed real PO data +
      `A_PurchaseOrderItemType` schema (Material/OrderQuantity/NetPriceAmount/…).
- [x] T0.3 Re-pointed requirements/design/tasks to procurement.
- [ ] T0.4 Obtain the BTP MCP runtime auth for deployed agents (service key / client creds);
      decide UiPath-asset delivery. Keep out of git. *(needed at Phase 3, not Phase 1)*

## Phase 1 — MCP foundation (highest-value single step)

- [ ] T1.1 Add `langchain-mcp-adapters` to `variance-agent/pyproject.toml`.
- [ ] T1.2 Add an `mcp_client` helper that builds `MultiServerMCPClient` for the SAP Cloud VB
      MCP from env (`SAP_MCP_URL`, `SAP_MCP_TOKEN`) and returns loaded tools.
- [ ] T1.3 Restructure `variance-agent/main.py` to a tool-calling graph: input becomes a
      **PO number + supplier document**; the agent calls MCP tools to pull the real PO items
      and reconciles per line, emitting structured output (per-line variances + categories +
      proposed PO correction).
- [ ] T1.4 Run locally against real S/4 (PO `4500000000`): assert it calls the MCP tools and
      the variance is computed from real PO lines. Capture the tool-call trace.
- [ ] T1.5 Update the eval set with a real-PO case (synthetic supplier doc vs real PO).

## Phase 2 — Multi-agent

- [ ] T2.1 Scaffold `matching-agent`: pull + align supplier lines to PO items → matched /
      unmatched + candidate variances.
- [ ] T2.2 Scaffold `posting-prep-agent`: approved correction → PO-item update payload.
- [ ] T2.3 Eval each; deploy all three agents.

## Phase 3 — End-to-end BPMN + S/4 write-back on tenant

- [ ] T3.1 Extend the BPMN to the 7-step flow (intake → matching agent → tolerance →
      variance agent → human gate → posting-prep agent → deterministic PO update → close),
      reusing the proven gate mechanism.
- [ ] T3.2 Implement the deterministic S/4 write-back
      (`execute-entity-operation update A_PurchaseOrderItemType`) — only post path.
- [ ] T3.3 Allocate agent runtime; deploy + run a full instance on the tenant; verify the PO
      item update by reading it back from S/4.

## Phase 4 — Cockpit + demo + rebrand

- [ ] T4.1 Cockpit: show live PO lines, supplier doc, per-line variances, multi-agent steps,
      gate, posted PO update.
- [ ] T4.2 Rebrand "Exchange/settlement" → procurement so the narrative is coherent.
- [ ] T4.3 Re-record the ≤5-min video (Claude Code building it) + refresh README / deck /
      BUSINESS-CASE for the end-to-end multi-agent procurement + S/4 story.
