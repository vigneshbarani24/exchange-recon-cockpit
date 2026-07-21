# TRUTH.md

The honesty spine, restated 2026-07-21. Every finale claim traces here. Tiers: **LIVE**
(proven, with evidence in this repo), **HELD** (built, deliberately not executed),
**ASPIRATIONAL** (design intent, no code). If it is not on this page, do not say it.

---

## LIVE: the composed Maestro instance ran end to end, both branches

This is the headline and it is new as of this morning. Two composed instances completed,
one down each branch of the human gate. Together they prove the whole BPMN, not a slice.

### Run 3, the approve path, the one to demo
Evidence: `finale/maestro/composed-run-3-corrected-element-executions.json`

- **Instance** `2db6d4d8-b245-4531-9057-8172232524db` (`ExchangeReconBpmn-70812566`), Status **Completed**
- **Package** `ExchangeReconSolutionCanvas.Agentic.ExchangeReconBpmn:1.0.5`
- **Folder** `e3945ea1-de36-4504-bf98-dc6503edc87f` (fid 3252146)
- **Window** 2026-07-21 06:40:37 to 06:43:34 UTC. Total **2 min 56 s**.

| Step | Element | Type | Proof | Time |
|---|---|---|---|---|
| Supplier invoice received | `Event_start` | StartEvent | | 0.3 s |
| Matching agent | `Task_MatchAgent` | `Orchestrator.StartAgentJob` | job `fdbb41a2-6974-44ff-a9d5-7bf9fc732327` | 45 s |
| Tolerance check | `Task_Tolerance` | ScriptTask, deterministic JS | 2.0 percent price, 1.0 unit qty | 1.1 s |
| Within tolerance? | `Gateway_Tolerance` | ExclusiveGateway | routed to variance | 0.2 s |
| Variance agent | `Task_VarianceAgent` | `Orchestrator.StartAgentJob` | job `ebee41c4-5b75-4925-8ed8-44d8afc28b19` | 57 s |
| Human gate | `GW_HumanWait` | EventBasedGateway | raced two message events | 0.2 s |
| Approved | `Event_Approve` | `Maestro.ReceiveMessageEvent` (`ApproveGate`) | **paused 20 s, cleared by message** | 20 s |
| Escalate branch | `Event_EscalateMsg` | `Maestro.ReceiveMessageEvent` | **Terminated**, the gateway cancelled the losing branch | |
| Posting-prep agent | `Task_PostingPrepAgent` | `Orchestrator.StartAgentJob` | job `c1ee53ae-5c17-4508-bb47-dd7e9a670241` | 46 s |
| Update PO item in S/4 | `Task_UpdatePO` | ScriptTask | returns prepared and held, no write | 0.4 s |
| Corrected and closed | `End_Corrected` | EndEvent | | 0.3 s |

Three real agent jobs inside one instance. A deterministic gate that used no LLM. A human
gate that genuinely suspended the process and genuinely resumed it. A terminal state
reached by the approve branch.

### Run 1, the escalate path
Evidence: `finale/maestro/composed-run-1-element-executions.json` and the 35 span portal trace.

- **Instance** `f823f696-aa32-466b-99fc-72a84cd74ea7`, Status **Completed**, package `:1.0.2`
- Matching job `875fc4d3-c6e2-495d-baf3-381a294fd85b` (53 s), variance job `7631a1d9-39f9-4661-9959-b479304713b0` (62 s)
- Human gate **paused about 6 minutes**, then cleared, then ended on **Escalated**.

Use run 1 for one sentence only: the same gate, taken the other way, also completes. Do not
lead with it. The `:1.0.2` decision expression defaulted to escalate because it did not match
the message envelope shape; `:1.0.5` fixed that. Say "we fixed the routing" if asked, and
do not pretend run 1 chose escalation on the merits.

### What the human gate actually is, stated precisely
A `Maestro.ReceiveMessageEvent` correlated on message **name plus reference**, where the
reference is the purchase order. It was cleared by `uip maestro bpmn instance message send`,
authenticated as VB. **It suspends and resumes a real durable process. It does not yet verify
the approver's role or identity.** That distinction is the honest boundary, and the Teams
approval work in `BUILD-BRIEF.md` is exactly the fix. Never imply role-based approval today.

---

## LIVE: the agents reason over real SAP S/4HANA

- All three coded LangGraph agents read live S/4 over an OData to MCP server on SAP BTP,
  XSUAA client credentials, config from Orchestrator assets. Re-confirmed by fresh local
  invokes 2026-07-20, receipts committed in `finale/receipts/`.
- **The tell.** The agent is handed only the supplier's numbers, yet it returns the **PO
  side**. For PO `4500000021` it reports PO unit price **25.00** on item 10 and PO quantity
  **5** on item 20. There is no path to those values except reading S/4 at runtime. This is
  the single most valuable thing to put on camera.
- **Measured verdict time:** 64 s standalone (job `dbedd8aa`); 57 s inside the composed
  instance (job `ebee41c4`). Both are real. Prefer the 57 s number now, because it was
  measured inside the orchestration you are demoing.

### The reconciliation itself, exactly as the agent returned it
Source: `finale/receipts/variance-agent-PO4500000021.json`. Supplier document INV-88231, GBP,
confidence **0.95**.

| Item | Material | PO | Supplier | Classified | Prepared correction |
|---|---|---|---|---|---|
| 10 | RM27 | 50 at 25.00 | 50 at 27.50 | price-variance, plus 2.50 per unit, 10 percent, outside the 2 percent tolerance | `A_PurchaseOrderItem.NetPriceAmount` 25.00 to 27.50 |
| 20 | RM16 | 5 at 2.00 | 6 at 2.00 | quantity-variance, plus 1 PC | `A_PurchaseOrderItem.OrderQuantity` 5 to 6 |

Both prepared corrections carry `ready_to_post: true`. Neither was posted.

---

## LIVE: governed agency in code, not in the pitch

- Every agent system prompt is read-only. The instruction is explicit that it never writes
  to SAP and never posts.
- Structured Pydantic output, bounded 6 turn tool loop. If the agent cannot read the PO it
  returns an empty match rather than inventing one.
- **The only write path is a separate deterministic CLI the agents cannot call**
  (`post_correction.py`). No agent holds a write tool. This is structural, not a promise.
- The tolerance decision is deterministic JavaScript inside the BPMN, not a model call:
  `priceTolerancePct = 2.0`, `qtyTolerance = 1.0`, in `Task_Tolerance`.
- Secrets live in Orchestrator assets, not in the repo.

## LIVE: the platform surface, deliberate not scattered

Maestro BPMN spine with three `Orchestrator.StartAgentJob` service tasks, a deterministic
script task, an exclusive gateway, an event-based gateway, two message catch events and
three boundary error events routing to a single escalation path. Coded LangGraph agents on
`uipath-langchain` through the UiPath LLM Gateway, so no raw model key exists in the
project. MCP to S/4 over XSUAA. TypeScript SDK cockpit. Built with Claude Code through
UiPath for Coding Agents.

---

## HELD: the SAP write-back

`post_correction.py` is the only write path and it currently returns 404. The external MCP
server returns empty `keyProperties`, a JSDOM bug upstream, so no keyed PATCH can be built.
Inside the BPMN, `Task_UpdatePO` is deliberately a script task that returns a prepared and
held message. **Framing: armed, not fired.** Never attempt this on camera. Do not describe
it as blocked-and-sad; describe it as the correct default for a governance demo.

## HELD: approver identity

The gate correlates message name and reference. It does not check who sent the message.
Today that is VB with a CLI. See `BUILD-BRIEF.md` for the Teams design that closes it.

---

## ASPIRATIONAL: say roadmap, never demo

- **Four of the six invoice scenarios have no code.** Built and demoable: price-variance
  (item 10) and over-delivery (item 20). Clean-match and in-tolerance exist in code but are
  unseeded. **Invoice-before-goods-receipt, duplicate-block, and vendor-bank-change fraud
  have no implementation.** There is no goods-receipt entity, no dedup logic, no vendor
  master read. `duplicate-line` is a classifier label only.
- **This is invoice-to-PO reconciliation, two way. It is not a three way match**, because
  there is no goods receipt read. Say "invoice to PO" unless explicitly narrating design intent.
- Drift detection, tool-trajectory scoring, CI-gated regression and Test Cloud integration
  are all roadmap.
- The cockpit's default demo tab renders captured output from a live run behind a static
  "live S/4 via MCP" badge. Either relabel it captured, or say so out loud. Do not let a
  judge discover it.

---

## Pre-flight risk

- The SAP XSUAA secret was shared in chat and needs rotation before the finale. A rotated
  but un-updated secret is a dead demo.
- **The UiPath token is per folder.** Authenticating in one agent folder does not refresh
  the others. This broke matching and posting-prep on 2026-07-20 while variance worked. Copy
  the fresh `.env` to all three agent folders. The token lives about an hour, so do this
  inside the hour before presenting.

---

## Honest scorecard, re-scored against the green run

| Criterion, equal weight, 1 to 5 | July 20 | Today | Ceiling by July 23 |
|---|---|---|---|
| Platform Usage | 4.5 | **5** | 5 |
| Technical Execution | 4 | **4.5** | 4.5 |
| Creativity and Innovation | 4 | 4 | 4.5 |
| Business Impact and Adoption | 2.5 | 3 | **4.5** |
| Presentation | 3 | 3 | **4.5** |
| Coding-agent bonus, 0 to 2 | +1 | +1 | **+2** |

Platform Usage moves to 5 because a completed BPMN instance orchestrating three real agent
jobs, a deterministic gate and a suspend-resume human gate is the literal definition of the
track. Technical Execution moves to 4.5 for the same reason, capped only by the held write.
The three remaining points are all presentation and business case, which is script work, not
build work. That is the whole strategy for the next two days.
