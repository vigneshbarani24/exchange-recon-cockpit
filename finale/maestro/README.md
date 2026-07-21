# finale/maestro/ — the composed Maestro run, proven (all three agents)

The one gap in `VERIFIED-STATE.md` ("the 3-agent Maestro BPMN as a single composed instance —
BUILT-NOT-RUN") was closed on **2026-07-21** — and then completed outright: **run 3 put all
three coded agents through one Maestro instance to "Corrected & closed."**

## Run 3 — THE trophy (v1.0.5, event-based two-gate)

- **Instance** `2db6d4d8-b245-4531-9057-8172232524db`, package
  `ExchangeReconSolutionCanvas.Agentic.ExchangeReconBpmn:1.0.5`, Status **Completed → End_Corrected**
- matching `fdbb41a2…` → tolerance gate → variance `ebee41c4…` → **event-based gateway**
  (`Event_Approve` completed on the `ApproveGate` message; `Event_EscalateMsg` terminated) →
  posting-prep `c1ee53ae…` → held update stub → **Corrected & closed**
- Decision design: **the message name is the decision** (ApproveGate/EscalateGate correlated by
  PO) — no payload parsing, deterministic routing, both endings provable.
- Trace: `composed-run-3-corrected-element-executions.json`. Watcher log:
  `../backups/logs/run3-v105-corrected-watcher.log`.

A multi-PO campaign (6 live POs, all three endings — see `../runs/` and
`src/data/runsManifest.json`) reproduces the pattern at volume.

## Run 1 — composed instance completed (escalation path)

- **Instance:** `f823f696-aa32-466b-99fc-72a84cd74ea7` (`ExchangeReconBpmn-70810572`), Status **Completed**
- **Package:** `ExchangeReconSolutionCanvas.Agentic.ExchangeReconBpmn:1.0.2`, folder `Shared/ExchangeReconCanvas`
- **Started/finished:** 2026-07-21 05:59:29 → 06:07:23 UTC

| Step | Type | Proof | Duration |
|---|---|---|---|
| Supplier invoice received | StartEvent | — | <1s |
| Matching agent | `Orchestrator.StartAgentJob` | job `875fc4d3-c6e2-495d-baf3-381a294fd85b` | 53s |
| Tolerance check | ScriptTask (real matched-lines schema) | routed to Variance | <1s |
| Variance agent | `Orchestrator.StartAgentJob` | job `7631a1d9-39f9-4661-9959-b479304713b0` | 62s |
| Human gate | `Maestro.ReceiveMessageEvent` (`ApproveGate`, ref = PO) | **paused ~6 min**, cleared by a governed message | — |
| Decision → Route to buyer → Escalated | Gateway/Script/End | completed | <1s |

Evidence: `composed-run-1-element-executions.json` (CLI element executions, includes the two
agent job keys) and `composed-run-1-portal-trace.json` (full portal span trace, 35 spans).

Honest notes:
- The gate was cleared by the `ApproveGate` message sent via
  `uip maestro bpmn instance message send` (authenticated as VB). The gate correlates
  name+reference; it does not verify an approver *role* — Action Center user task is the
  productionization step for approver identity.
- Run 1 ended on the **Escalated** path: the decision expression didn't match the message
  envelope's actual shape, so the default (governed) escalation fired. v1.0.3 makes the
  decision/approved-action expressions shape-proof; run 2 targets the full Approve →
  posting-prep → Corrected path.

## What made it work (the two-day mystery, solved)

The hand-authored BPMN was *valid* but undeployable-as-working: the CLI packer requires
binding-backed `name`/`folderPath` on `StartAgentJob` and forbids literal `releaseKey`/`folderId`
— yet nothing in the CLI pack/deploy path ever resolved those bindings, so every deployed
version faulted at runtime with 170005 (`folderId`/`releaseKey` missing). Five CLI variants
proved it. The fix: **Studio Web's canvas** — re-picking each agent in the designer runs
discovery and emits what hand-authoring can't: `releaseKey` bindings (`propertyAttribute="Key"`),
StartAgentJob **v2** payloads with input schemas and typed outputs, and — decisively — the
agents materialized as **in-solution resources** (`resources/solution_folder/process/agent/*.json`)
so the deploy ships agents + BPMN together into one folder and resolves bindings locally.
The four `SAP_MCP_*` assets were cloned into the deployment folder (the agents read env →
Orchestrator asset fallback, `variance-agent/mcp_client.py`).

Solution source: `ExchangeReconSolutionCanvas/` (canvas round-trip + 14 surgical patches:
variable rewires to canvas-scoped outputs, tolerance script rewritten to the real
`matched_lines` schema, entry-point input schema, shape-proof `=js:` decision routing).
Everything is isolated — original `ExchangeReconSolution/`, the three agent projects, the
receipts, and the cockpit are untouched.

## Reproduce (portal or CLI)

1. Portal: folder **Shared/ExchangeReconCanvas** → process `ExchangeReconBpmn` → Start with
   `{"purchaseOrder":"4500000021","supplierDocument":"Supplier invoice INV-88231, ref PO
   4500000021, GBP. Line 1: Material RM27 (Packaging Box) 50 PC at 27.50 per ea. Line 2:
   Material RM16 6 PC at 2.00 per ea."}`
2. When the instance pauses at the human gate, approve it:
   ```
   uip maestro bpmn instance message send -f e3945ea1-de36-4504-bf98-dc6503edc87f \
     --inputs '{"name":"ApproveGate","reference":"4500000021","itemData":{"decision":"Approve","note":"Accept the over-delivery and supplier price; update the PO item accordingly."}}'
   ```
3. No SAP write occurs anywhere in the flow — `Task_UpdatePO` returns a prepared-and-held
   message by design.
