# Design — Procure-to-Pay PO Reconciliation (end-to-end, multi-agent, MCP→S/4)

## Overview

Extend the proven governed-agency reconciliation into an end-to-end **Procure-to-Pay PO
reconciliation**: a Maestro BPMN process orchestrating **three coded agents** over **live
S/4HANA** purchase-order data reached through the **SAP Cloud VB MCP** (BTP CF, EU10 →
the connected S/4HANA Cloud system, service `API_PURCHASEORDER_PROCESS_SRV`). Keeps the proven spine
(tolerance gateway → variance agent → human gate) and extends it with an MCP-driven PO read
at the front and a governed PO write-back at the back.

## Process flow (Maestro BPMN)

```
Trigger (inbound supplier order-confirmation / invoice referencing a PO)
  → [Agent 1: Matching]    pull live PO header+items+pricing (MCP) + align supplier lines to PO items
  → Tolerance check (deterministic script)  ──all within──▶ auto-approve & close
  → [Agent 2: Variance]    explain + categorize + propose PO correction (MCP for detail)
  → Human approval gate    (proven: Actions.HITL or message-gate)  ──escalate──▶ buyer/desk
  → [Agent 3: Posting-prep] build the PO-item update payload from the approved correction
  → Update PO item in S/4 (deterministic, MCP write)
  → Close & notify
```

## MCP tool surface (SAP Cloud VB, enumerated)

Generic SAP OData explorer — four tools:
- `search-sap-services(query, category)` · `discover-service-entities(serviceId)` ·
  `get-entity-schema(serviceId, entityName)` · `execute-entity-operation(serviceId,
  entityName, operation, parameters, queryOptions)` (read / read-single / create / update /
  delete; user-token authorized).
- Service: `API_PURCHASEORDER_PROCESS_SRV`. Entities: `A_PurchaseOrderType`,
  **`A_PurchaseOrderItemType`** (read/update — the reconciliation + write-back unit),
  `A_PurOrdPricingElementType` (pricing conditions), `A_PurchaseOrderScheduleLineType`.

### PO item fields used
`PurchaseOrder`, `PurchaseOrderItem` (keys), `Material`, `PurchaseOrderItemText`,
`OrderQuantity` + `PurchaseOrderQuantityUnit`, `NetPriceAmount` + `NetPriceQuantity`,
`DocumentCurrency`, `Plant`, `TaxCode`, `OverdelivTolrtdLmtRatioInPct` /
`UnderdelivTolrtdLmtRatioInPct` (S/4's own delivery tolerances).

## Agents (each its own UiPath coded-agent project; Maestro orchestrates them)

- **Matching agent** — input: PO number + supplier document. Pulls PO items via MCP
  (`execute-entity-operation read A_PurchaseOrderItemType $filter=PurchaseOrder eq …`),
  aligns supplier lines to PO items (by Material / item text), outputs matched / unmatched +
  candidate variances.
- **Variance agent** (existing `variance-agent`, MCP-enhanced) — explains, classifies
  (price-variance, quantity-variance, material-mismatch, …), scores confidence, proposes a
  PO correction. A small tool-calling graph that may pull extra PO/pricing detail via MCP.
- **Posting-prep agent** — input: approved correction. Maps it to a PO-item update payload
  (PurchaseOrder, PurchaseOrderItem, field, new value) for the deterministic write. May
  degrade to a deterministic mapping if time-constrained.

## Deterministic steps (BPMN script / service tasks)
- Tolerance check (Jint script) over per-line price/qty variance.
- The **only write**: `execute-entity-operation update A_PurchaseOrderItemType` — runs only
  after human approval; agents never write.
- Close & notify.

## Cockpit (Vite/React)
Surface the live PO lines pulled from S/4 (provenance), the supplier doc, the per-line
variances, the multi-agent steps, the human gate, and the posted PO update. Optimized for
the recorded demo.

## Failure modes
MCP/S4 read fails → route to human (R11); agent low confidence → human decides; write fails
→ surface, leave case open, do not retry blindly.

## Auth / config
Deployed agents reach the BTP MCP URL with their own credentials (BTP service key / client
credentials) via UiPath assets — never committed (R10). Local dev: gitignored `.env`.

## Open items
- **Branding:** repo/agent/BPMN names say "Exchange"/"settlement"; retheme to procurement in
  Phase 4 (or rename) so the narrative is coherent.
- Inbound supplier document source: synthetic for the demo (crafted variances vs the real PO).
