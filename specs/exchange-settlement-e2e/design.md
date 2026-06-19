# Design — Exchange Settlement lifecycle (end-to-end, multi-agent, MCP→S/4)

## Overview

Extend the proven governed-agency reconciliation into the full **Exchange Settlement
lifecycle**: a Maestro BPMN process that orchestrates **three coded agents** over **live
S/4HANA** data reached through the **SAP Cloud VB MCP** server (BTP CF, EU10). Keeps the
proven spine (tolerance gateway → variance agent → human gate) and extends it with an
MCP-driven S/4 read at the front and a governed S/4 write-back at the back.

## Process flow (Maestro BPMN)

```
Trigger (counterparty statement / period close)
  → [Agent 1: Matching]    pull S/4 G/L line items (MCP) + align to counterparty lines
  → Tolerance check (deterministic script)  ──within──▶ auto-post & close
  → [Agent 2: Variance]    explain + categorize + propose correction (MCP for detail)
  → Human approval gate    (proven: Actions.HITL or message-gate)  ──escalate──▶ desk
  → [Agent 3: Posting-prep] build the journal-entry payload from the approved correction
  → Post to S/4 (deterministic, MCP/OData write)
  → Close & notify
```

## Components

### MCP layer
- Reuse the **SAP Cloud VB MCP** at the BTP CF endpoint. Agents are MCP **clients** via
  `langchain_mcp_adapters.MultiServerMCPClient` (HTTP transport + bearer/OAuth header).
- `shared mcp client helper`: builds the client from env (`SAP_MCP_URL`, `SAP_MCP_TOKEN`),
  loads tools, exposes them to the LangGraph agent. Tool names/IO mapped to the actual
  SAP Cloud VB surface once enumerated (Task 1).
- Tools expected: G/L line-item read (company code, fiscal year, contract/reference);
  optionally a journal-entry post (used by the deterministic write step, not the agent).

### Agents (each its own UiPath coded-agent project; Maestro orchestrates them)
- **Matching agent** — input: contract ref + counterparty statement. Pulls S/4 G/L lines
  via MCP, aligns to counterparty lines, outputs matched/unmatched + candidate variances.
- **Variance agent** (existing `variance-agent`, MCP-enhanced) — explains, classifies
  (temperature-basis, demurrage, missing-line-item, …), scores confidence, proposes a
  correction. May pull extra S/4 detail via MCP. Becomes a small tool-calling graph.
- **Posting-prep agent** — input: approved correction. Maps it to an S/4 journal-entry
  payload (accounts, amounts, currency, references) for the deterministic post step.
  May degrade to a deterministic mapping if time-constrained.

### Deterministic steps (BPMN script / service tasks)
- Tolerance check (existing Jint script).
- Auto-post (within tolerance) and final post-back: call the S/4 write (MCP/OData). The
  **only** write path; runs only after human approval. Agents never post.
- Close & notify.

### Cockpit (Vite/React)
- Surface the live S/4 lines the agent pulled (provenance), the multi-agent steps, the
  variance + proposal, the human gate, and the posted journal entry. Optimized for the
  recorded demo.

## Data
- "Our side" = S/4 **G/L journal-entry line items** for the contract. "Counterparty side"
  = the inbound statement (text/JSON). Variance = net of aligned lines, with category.

## Failure modes
- MCP/S4 read fails → route to human (R11), never post on partial data.
- Agent low confidence → lower score, human decides.
- Write fails → surface, do not retry blindly; leave case open for human.

## Auth / config
- Deployed agents reach the BTP MCP URL with their own credentials (BTP service key /
  client credentials), supplied via UiPath assets — never committed (R10).
- For local dev, `.env` with `SAP_MCP_URL` + token (gitignored).

## Why this is on-track for AgentHack
- Maestro orchestrating **multiple agents** (agentic), over the **real system of record**
  (S/4 via MCP), with a **governed human gate** before any posting. Business Impact +
  Platform Usage + Creativity all move; the coding-agents bonus stays (built with Claude).
