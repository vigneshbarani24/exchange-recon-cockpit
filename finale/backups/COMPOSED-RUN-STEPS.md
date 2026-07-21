# Composed-run playbook — start, gate, capture (backups to backups)

Everything needed to run, approve, and evidence the composed 3-agent flow, with every fallback.
The deployed truth: **`Shared/ExchangeReconCanvas`** (folder id `3252146`, key
`e3945ea1-de36-4504-bf98-dc6503edc87f`) — package `ExchangeReconSolutionCanvas` (v1.0.5,
two-gate), release `ExchangeReconBpmn`, plus the three agents and the four `SAP_MCP_*` assets,
all co-located. Source of the solution: `ExchangeReconSolutionCanvas/` in the repo.

## 1. Start a run

**Portal (demo-preferred):** Orchestrator → folder ExchangeReconCanvas → Processes →
ExchangeReconBpmn → Start, input:
```json
{"purchaseOrder":"4500000021","supplierDocument":"Supplier invoice INV-88231, ref PO 4500000021, GBP. Line 1: Material RM27 (Packaging Box) 50 PC at 27.50 per ea. Line 2: Material RM16 6 PC at 2.00 per ea."}
```

**CLI/scripted (what Claude drove):** `python scripts/run_invoice_campaign.py --only 1`
(starts, watches, gates, records — full campaign without `--only`). Requires `uip login`
against staging/hackathon26_751.

## 2. The human gate — approve or escalate (message name IS the decision)

The flow pauses at an event-based gateway with two armed message events. Send exactly one:

```bash
# APPROVE -> posting-prep agent -> Corrected & closed
uip maestro bpmn instance message send -f e3945ea1-de36-4504-bf98-dc6503edc87f \
  --inputs '{"name":"ApproveGate","reference":"<PO>","itemData":{"decision":"approve","note":"Accept the proposed correction."}}'

# ESCALATE -> route to buyer -> Escalated
uip maestro bpmn instance message send -f e3945ea1-de36-4504-bf98-dc6503edc87f \
  --inputs '{"name":"EscalateGate","reference":"<PO>","itemData":{"decision":"escalate","note":"Rejected by reviewer."}}'
```
`reference` must equal the run's purchase-order number (correlation key). No SAP write happens
on either path — the update step is the held stub by design.

## 3. Watch / capture

```bash
uip maestro bpmn instance element-executions <instanceId> -f e3945ea1-de36-4504-bf98-dc6503edc87f --output json
```
Good looks like: `Task_MatchAgent`/`Task_VarianceAgent`(/`Task_PostingPrepAgent`) as
`Orchestrator.StartAgentJob` with **JobKey populated** and 30–70s durations; ending at
`End_AutoApproved`, `End_Corrected`, or `End_Escalated`. Captured evidence lives in
`finale/maestro/` (proof runs) and `finale/runs/` (campaign) + `src/data/runsManifest.json`
(what the cockpit Runs board renders). Session logs: `finale/backups/logs/`.

## 4. UI surfaces

- **Operating surface (offline, demo-primary):** `npm run dev` → default tab. "Runs" nav (or
  "+ Run another invoice") opens the Runs board — real manifest data, zero network.
- **Live tab (optional):** `.env` at repo root already points at ExchangeReconCanvas; paste a
  Non-Confidential External App client id (redirect `http://localhost:5173`) into
  `VITE_UIPATH_CLIENT_ID` and the Live tab lists the same instances via PKCE.
- **Teams:** `python scripts/notify_teams.py --status good "title" "line"` (webhook in
  gitignored `scripts/.teams-webhook`).

## 5. Troubleshooting / the story behind the fix

- **170005 "folderId/releaseKey missing"** on an agent step = binding resolution absent. The CLI
  packer only accepts binding-backed `name`/`folderPath` and neither pack nor deploy resolves
  them for hand-authored BPMN. THE fix: open the solution in Studio Web, re-pick each agent in
  the canvas (writes releaseKey bindings + in-solution agent resources), publish, deploy. That
  canvas round-trip IS `ExchangeReconSolutionCanvas/`.
- **Message not clearing the gate:** check `reference` equals the PO exactly; the gate ignores
  payload contents (decision is carried by which message name you send).
- **Agents fail on SAP call in a new folder:** clone the four `SAP_MCP_*` assets into that
  folder (agents resolve env first, then same-folder Orchestrator assets — `mcp_client.py`).
- **Evals:** `cd <agent> && uv run uipath eval agent evaluations/eval-sets/<suite>.json
  --workers 3 --output-file evaluations/<suite>-results.json`; token = refresh each agent
  `.env` `UIPATH_ACCESS_TOKEN` (scripted from `uip login refresh`). Recorded to the Agents
  runtime (`evalSetRun`) — see `finale/evals/CLAUDE-TESTER-VALIDATION.md`.

## 6. Fallback ladder (unchanged)

Live composed run → individual agent jobs (`uv run uipath run agent -f input.json`) →
Runs board / receipts / cockpit captured case → recorded video → deck PDF.
