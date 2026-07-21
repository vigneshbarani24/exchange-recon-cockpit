# Model-as-tester validation — Claude verified the eval suite against live SAP

**Tester:** Claude (Anthropic Claude Fable 5), operating as an independent test engineer in
Claude Code. **Date:** 2026-07-21. **Method:** the tester did not trust the eval fixtures — it
opened its **own** connection to the same SAP MCP server the agents use (XSUAA
client-credentials → streamable_http MCP → `API_PURCHASEORDER_PROCESS_SRV`, via
`scripts/claude_sap_tester.py`) and read the purchase orders directly, then checked every eval
expectation's arithmetic against that live ground truth before and after the scored runs.

## Live ground truth (read by the tester itself, not by the agents)

`execute-entity-operation · read · A_PurchaseOrderItemType · $filter=PurchaseOrder eq '4500000021'`:

| Item | Material | Qty | Unit price | Currency |
|---|---|---|---|---|
| 10 | RM27 (RAW27, PackagingBox) | 50 PC | 25.00 | GBP |
| 20 | RM16 (RAW16) | 5 PC | 2.00 | GBP |

Matches the receipts (`finale/receipts/`) and the cockpit's captured case exactly; PO net value
50×25.00 + 5×2.00 = **£1,260.00**, matching the S/4 Fiori "Manage Purchase Orders" screen.
The tester also enumerated 25+ further live POs (used to build the multi-PO run campaign).

## Eval scores (LLM-judge semantic similarity, gpt-4o-2024-11-20, run 2026-07-21)

| Agent | Suite | Case | Score | Tester's arithmetic verdict vs live PO |
|---|---|---|---|---|
| variance | recon-suite | clean-match | 0.85 | invoice = PO exactly → within-tolerance is CORRECT |
| variance | recon-suite | price-variance-only | 0.85 | 27.50 vs 25.00 = +10.0% > 2% → variance is CORRECT |
| variance | recon-suite | over-delivery-only | 0.75 | qty 6 vs 5 → over-delivery flagged, CORRECT |
| variance | recon-suite | under-delivery | 0.65 | qty 4 vs 5 → under-delivery, CORRECT |
| variance | recon-suite | price-and-qty-variance | 0.75 | both breaches (the demo case), CORRECT |
| variance | recon-suite | within-tolerance-boundary | 0.75 | 25.40 = +1.6% < 2% → within-tolerance is CORRECT |
| matching | matching-suite | clean-two-lines | 0.85 | RM27+RM16 both on live PO → full alignment CORRECT |
| matching | matching-suite | extra-supplier-line | 0.85 | RM99 absent from live PO → unmatched-line CORRECT |
| matching | matching-suite | partial-reference | 0.90 | only RM27 referenced → item 20 unmatched CORRECT |
| posting-prep | posting-suite | qty-correction | 0.90 | live OrderQuantity is 5 → 5→6 payload CORRECT |
| posting-prep | posting-suite | price-correction | 0.90 | live NetPriceAmount is 25.00 → 25.00→27.50 CORRECT |
| posting-prep | posting-suite | ambiguous-action | 0.85 | "Sort it out" unresolvable → not-ready guardrail CORRECT |

**Averages:** variance 0.77 (CLI-reported 0.8) · matching 0.87 · posting-prep 0.88 ·
**12/12 cases scored, 12/12 expectations verified consistent with the live system of record.**
Raw results: `*/evaluations/*-results.json` (committed).

## Where these are recorded in UiPath

`uipath eval` reported each run to the **Agents runtime** (`agentsruntime_/api/execution/
agents/<agentId>/evalSetRun`) — the Agents experience, not Orchestrator's Testing tab (that
surface is RPA Test Manager territory) and not the deployed agent's **Feedback** tab (a
user-feedback signal, empty by design here).

## Honest boundary

The LLM-judge scores semantic similarity of the agent's summary to an expected phrasing — 0.65
on under-delivery means correct classification, differently worded summary, not a wrong answer.
The tester validated *expectations* against live data and *scores* for sanity; it did not
assert tool-call trajectories (roadmap: trajectory assertions + CI regression in Test Cloud).
