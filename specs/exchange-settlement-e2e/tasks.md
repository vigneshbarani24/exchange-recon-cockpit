# Tasks — Exchange Settlement lifecycle (end-to-end, multi-agent, MCP→S/4)

Work top-to-bottom, one at a time, checkpoint commits. Phases are demoable in order;
1–3 alone are a strong submission if Phase 4 runs short.

## Phase 0 — Foundation

- [ ] T0.1 VB authenticates the SAP Cloud VB MCP (`/mcp` → "claude.ai SAP Cloud VB").
- [ ] T0.2 Enumerate the MCP tool surface; record tool names + IO for G/L read (and any
      journal-entry write) in `design.md`.
- [ ] T0.3 Obtain the BTP MCP runtime auth for deployed agents (service key / client
      creds) and decide how it's supplied (UiPath asset). Keep out of git.
- [x] T0.4 Write requirements / design / tasks specs. *(this commit)*

## Phase 1 — MCP foundation (highest-value single step)

- [ ] T1.1 Add `langchain-mcp-adapters` to `variance-agent/pyproject.toml`.
- [ ] T1.2 Add `mcp_client` helper that builds `MultiServerMCPClient` for the SAP Cloud VB
      MCP from env and returns loaded tools.
- [ ] T1.3 Restructure `variance-agent/main.py` to a tool-calling graph: input becomes a
      contract reference + counterparty statement; the agent calls MCP tools to pull real
      S/4 G/L lines, then emits the structured `GraphOutput`.
- [ ] T1.4 Run locally against real S/4: assert the agent calls the MCP tools and the
      variance is computed from real G/L lines. Capture the tool-call trace.
- [ ] T1.5 Update the eval set with a real-contract-ref case.

## Phase 2 — Multi-agent

- [ ] T2.1 Scaffold `matching-agent` (UiPath coded agent): pull + align S/4 lines to
      counterparty lines → matched/unmatched + candidate variances.
- [ ] T2.2 Scaffold `posting-prep-agent`: approved correction → S/4 journal-entry payload.
- [ ] T2.3 Eval each; deploy all three agents.

## Phase 3 — End-to-end BPMN on the tenant

- [ ] T3.1 Extend `ExchangeReconBpmn.bpmn` to the 7-step flow (intake → matching agent →
      tolerance → variance agent → human gate → posting-prep agent → deterministic S/4
      post → close), reusing the proven gate mechanism.
- [ ] T3.2 Implement the deterministic S/4 write-back (MCP/OData) — only post path.
- [ ] T3.3 Allocate agent runtime to the run folder; deploy + run a full instance on the
      tenant: intake → post-back → close. Verify the journal entry exists in S/4.

## Phase 4 — Cockpit + demo

- [ ] T4.1 Cockpit: show live S/4 lines, multi-agent steps, variance+proposal, gate,
      posted entry.
- [ ] T4.2 Re-record the ≤5-min video (Claude Code building it) + refresh README / deck /
      BUSINESS-CASE for the end-to-end multi-agent + S/4 story.
