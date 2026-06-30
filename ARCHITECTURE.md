# Architecture — Exchange Recon Cockpit

> Engineer-facing deep view of the Procure-to-Pay (supplier invoice ↔ purchase order) reconciliation
> built on UiPath. The **hero is UiPath Maestro governed agency**; the **proof is the live SAP read**.
> This page complements the demo video — it does not repeat it. Every capability claim cites a repo
> file path. Each component is labelled **LIVE**, **MOCKED**, or **ASPIRATIONAL**, and we never smooth
> over a limit.

The felt problem: an AP analyst is drowning in invoices that disagree with the purchase order of
record. Manual three-way matching is slow, error-prone, and the PO truth lives in SAP S/4HANA — not
in the analyst's spreadsheet. This system reads the *real* PO at runtime, classifies the variance,
and prepares the exact correction — then holds it behind a human gate. The agents never write.

---

## Diagrams

Five views live under [`docs/diagrams/`](docs/diagrams/). Open the `.drawio` files at
[diagrams.net](https://app.diagrams.net) and export per the
[diagrams README](docs/diagrams/README.md).

| Diagram | View |
|---|---|
| [`docs/diagrams/context.drawio`](docs/diagrams/context.drawio) | System context — actors, SAP system-of-record, the UiPath tenant boundary |
| [`docs/diagrams/components.drawio`](docs/diagrams/components.drawio) | Component wiring — cockpit, three agents, MCP→SAP, Maestro, Orchestrator, LLM Gateway |
| [`docs/diagrams/sequence.drawio`](docs/diagrams/sequence.drawio) | Demo-path data flow — supplier doc + PO → match → tolerance → variance → gate → posting-prep → held update |
| [`docs/diagrams/agents.drawio`](docs/diagrams/agents.drawio) | Agent internals — the single-node LangGraph graph + bounded MCP tool-calling loop |
| [`docs/diagrams/deployment.drawio`](docs/diagrams/deployment.drawio) | Deployment topology — what is deployed, what runs, what is capacity-blocked |

---

## 1. Components and how they wire

### 1.1 Three coded agents (LangGraph) — **LIVE**

Three independent UiPath Coded Agents, each a single-node LangGraph graph compiled to a deployed
Orchestrator process. They share an identical shape: typed Pydantic input/output, a bounded MCP
tool-calling loop (max 6 iterations), then a structured-output pass.

- **matching-agent** — retrieval and line alignment only, no judgement. Reads the real PO lines via
  MCP and aligns each supplier line to a PO item by material/description, carrying *both* sides'
  quantity and price verbatim. `matching-agent/main.py:69-105` (loop), system prompt
  `matching-agent/main.py:50-66` ("You never write to SAP").
- **variance-agent** — the WOW. In one pass it retrieves the PO, matches, classifies the variance
  per line, proposes a correction, and *prepares* the concrete S/4 update (`prepared_corrections`).
  `variance-agent/main.py:107-148`; the prepare-not-post contract is stated in the prompt at
  `variance-agent/main.py:96-104` and modelled by `PreparedCorrection.ready_to_post`
  (`variance-agent/main.py:52-64`).
- **posting-prep-agent** — runs *after* a human approves. Translates the approved action into a
  precise, well-formed `A_PurchaseOrderItem` update payload (`OrderQuantity` for quantity,
  `NetPriceAmount` for price), confirming current values via a read. It still never writes:
  `posting-prep-agent/main.py:50-70` (prompt), `posting-prep-agent/main.py:73-110` (loop).

All three use `UiPathAzureChatOpenAI(model="gpt-4o-2024-11-20", temperature=0.1)` via the UiPath LLM
Gateway — see §1.5 (`variance-agent/main.py:111`, `matching-agent/main.py:72`,
`posting-prep-agent/main.py:76`). Entry-point and I/O schema: `variance-agent/entry-points.json`.

### 1.2 MCP → SAP S/4HANA Cloud — **READ LIVE / WRITE MOCKED**

Each agent connects to a BTP-hosted **SAP OData→MCP server** and consumes its tools as LangChain
tools. The shared client is `*/mcp_client.py`:

- Transport `streamable_http`, server config assembled in `variance-agent/mcp_client.py:62-70`.
- Auth resolves in priority order — full header, bearer token, or **XSUAA client-credentials**
  (`SAP_MCP_CLIENT_ID` / `SAP_MCP_CLIENT_SECRET` / `SAP_MCP_TOKEN_URL`) at
  `variance-agent/mcp_client.py:35-59`.
- Config resolves from env first, then **UiPath Orchestrator assets** so a deployed agent (which has
  no local `.env`) reads the same values from the tenant: `variance-agent/mcp_client.py:20-32`.
- The tool used is `execute-entity-operation` against service `API_PURCHASEORDER_PROCESS_SRV`,
  entity `A_PurchaseOrderItemType` (the `A_PurchaseOrderItem` set), with `operation: "read"` and an
  OData `$filter`/`$select` — declared at `variance-agent/main.py:9-10` and driven by the prompt at
  `variance-agent/main.py:86-90`.

The READ path is **LIVE** — proven against PO `4500000021` (see §4). The WRITE path is a single,
separate, deterministic file `variance-agent/post_correction.py` and is **BLOCKED/STUB**: the
`operation: "update"` PATCH currently 404s because the MCP server returns empty `keyProperties` for
the entity. See `variance-agent/post_correction.py:11-13,30-42` and the
[write-back plan](.agent/submission/writeback-plan.md). Armed, not fired.

### 1.3 Maestro BPMN — the orchestration spine — **BUILT + VALIDATED + DEPLOYED**

`ExchangeReconSolution/ExchangeReconBpmn/ExchangeReconBpmn.bpmn` is the governed process. No longer
a stub, it is bound to the three deployed agents via real `uipath:bindings` and release keys, passes
`uip solution pack . --dry-run` (Status: Valid), and was packed, published, and deployed live to the
tenant. Spine elements:

- **Start event** `Event_start` ("Supplier invoice received"), inputs `purchaseOrder` +
  `supplierDocument` (`...bpmn:26-31`, variables `...bpmn:6-16`).
- **Three `Orchestrator.StartAgentJob` service tasks** — matching, variance, posting-prep — each
  bound to a deployed Agent process with a real `ReleaseKey`:
  matching `...bpmn:32-48` (release `e5df6f1a-…`), variance `...bpmn:110-126` (release `5f14f117-…`),
  posting-prep `...bpmn:151-167` (release `07bc5429-…`). Bindings block: `...bpmn:17-24`.
- **Deterministic tolerance check** — a JavaScript script task, 2% price / 1-unit qty, no LLM in the
  decision: `...bpmn:53-86` (thresholds at `...bpmn:66-67`).
- **Exclusive gateways** — `Gateway_Tolerance` (`...bpmn:87-91`) routes within-tolerance →
  auto-approve vs variance → variance-agent; `Gateway_Decision` (`...bpmn:146-150`) routes the human
  decision Approve → posting-prep vs Escalate → buyer.
- **Human gate** — `Task_HumanGate`, a `Maestro.ReceiveMessageEvent` (message name `ApproveGate`,
  referenced by PO) that blocks until a decision arrives: `...bpmn:131-145`.
- **Error / escalation boundary events** — every agent task has an `Error_AgentFailed` boundary
  event routing to `Task_RouteBuyer`: `...bpmn:49-52,127-130,168-171,191-208`.
- **The "Update PO item in S/4" node** is a script task returning a confirmation *string*
  (`...bpmn:172-187`) — the real PATCH is the blocked `post_correction.py`. So the S/4 write
  modelled here is **MOCKED/ASPIRATIONAL**.

### 1.4 UiPath Orchestrator / Serverless agent runtime — **LIVE (agents) / capacity-blocked (Maestro e2e)**

The three agents are deployed Orchestrator Agent processes with real release keys; all three
have each run as a separate real Serverless agent job against live SAP (§4). Maestro starts each via
`Orchestrator.StartAgentJob`. The full 3-agent Maestro instance launches but does not complete — see
§5 (capacity).

### 1.5 UiPath LLM Gateway (Azure OpenAI) — **LIVE**

Model calls do not go to OpenAI directly. `UiPathAzureChatOpenAI` routes
`gpt-4o-2024-11-20` through the UiPath LLM Gateway, governed by the tenant
(`variance-agent/main.py:3,111`). Low temperature (0.1) for determinism on a structured task.

### 1.6 Cockpit (Vite + React + TypeScript) — **TWO surfaces**

- **"Reconciliation" tab (default)** — a self-contained, **SEEDED** demo. No network, 100% reliable,
  the visual centrepiece: `src/lib/reconDemo.ts`. **MOCKED** by design (deterministic demo path).
  The "live S/4 · via MCP" badges on this tab are static labels over seeded data — they do **not**
  imply the cockpit itself calls SAP.
- **"Live tenant" tab** — real `@uipath/uipath-typescript` SDK for Maestro instances + Action Center
  task completion over OAuth PKCE: `src/lib/sdk.ts`, `src/lib/exchange.ts`, config `src/lib/config.ts`,
  auth under `src/auth/`. Real code, **ASPIRATIONAL at demo time**: needs operator login and
  uncommitted `VITE_*` config.

### 1.7 Human gate / Action Center — **message gate LIVE-capable / richer HITL modelled**

The runnable BPMN uses a Maestro **message-event** gate, cleared via the `uip` CLI or, by design, the
cockpit's `decideGate` (`src/lib/exchange.ts`). A richer **Action Center** HITL design (typed task,
approve/escalate) is modelled but is not the runnable path. Treat Action-Center HITL as
**ASPIRATIONAL**, the message gate as the live contract.

---

## 2. Data flow — the demo path

Golden path for PO `4500000021` with supplier invoice `INV-88231`:

1. **Trigger** — supplier document + PO number enter at `Event_start` (`...bpmn:26-31`). Supplier
   numbers only: material `RM27` 50 PC @ 27.50, material `RM16` 6 PC @ 2.00.
2. **Matching agent** — reads the live PO lines over MCP and aligns supplier→PO lines, carrying both
   sides verbatim (`matching-agent/main.py:69-105`). It learns the PO side (unit price 25.00 GBP,
   qty 5) only by reading S/4 at runtime.
3. **Tolerance check (deterministic)** — JavaScript, 2% price / 1-unit qty
   (`...bpmn:65-85`). Item 10 breaches price (25.00→27.50 = +10%); Item 20 breaches qty (5→6).
   → routes to the variance branch (`Gateway_Tolerance`, `...bpmn:87-91`).
4. **Variance agent** — classifies each line and *prepares* the S/4 corrections
   (`variance-agent/main.py:107-148`): Item 10 price-variance, Item 20 over-delivery;
   `prepared_corrections` with `NetPriceAmount 25→27.50` and `OrderQuantity 5→6`,
   `ready_to_post=true` — **held, never posted**.
5. **Human gate** — `Task_HumanGate` blocks on the `ApproveGate` message keyed by PO
   (`...bpmn:131-145`). Approve → posting-prep; Escalate → `Task_RouteBuyer` (`...bpmn:146-150`).
6. **Posting-prep agent** — on approval, builds the final, well-formed `A_PurchaseOrderItem` update
   payload, re-confirming current values via a read (`posting-prep-agent/main.py:73-110`).
7. **Held update** — the BPMN "Update PO item in S/4" node returns a confirmation string
   (`...bpmn:172-187`); the actual PATCH (`post_correction.py`) stays blocked. The corrected value is
   **prepared and approved, not written.**

---

## 3. LIVE vs MOCKED vs ASPIRATIONAL — per component

| Component | Status | Evidence |
|---|---|---|
| Three coded LangGraph agents (matching/variance/posting-prep) | **LIVE** | `variance-agent/main.py:107-156`, `matching-agent/main.py:69-113`, `posting-prep-agent/main.py:73-118` |
| LLM via UiPath LLM Gateway (Azure OpenAI gpt-4o-2024-11-20) | **LIVE** | `variance-agent/main.py:3,111` |
| SAP read over MCP (`execute-entity-operation`, XSUAA) | **LIVE** | `variance-agent/mcp_client.py:35-76`, `variance-agent/main.py:86-90` |
| All three agents as separate real Serverless Orchestrator jobs vs live PO | **LIVE (proven)** | matching job `750a5c3e-…` (52s), variance job `c51ac7fa-…` (126s; also `dbedd8aa-…`, §4), posting-prep job `d7b8891e-…` (52s) — all Successful, co-located in Shared/ExchangeReconDemo (folder 3093256); `variance-agent/entry-points.json` |
| Maestro BPMN spine (3 StartAgentJob, tolerance, gateways, gate, errors) | **BUILT + VALIDATED + DEPLOYED** | `ExchangeReconSolution/ExchangeReconBpmn/ExchangeReconBpmn.bpmn`; `--dry-run` Valid |
| Maestro bound to the 3 deployed agents (release keys) | **DEPLOYED** | `...bpmn:17-24,39,117,158` |
| Deterministic tolerance check (2% / 1-unit) | **LIVE (in BPMN)** | `...bpmn:65-85` |
| Human message gate (`ApproveGate`) | **LIVE-capable** | `...bpmn:131-145`; `src/lib/exchange.ts` |
| Full 3-agent Maestro run end-to-end | **capacity-blocked** | §5 — instance launches, hangs Pending |
| SAP write-back (PATCH PO item) | **MOCKED/STUB** | `variance-agent/post_correction.py:11-13`; [writeback-plan](.agent/submission/writeback-plan.md) |
| BPMN "Update PO item in S/4" node | **MOCKED** | `...bpmn:183-186` (returns a string) |
| Cockpit "Reconciliation" tab (seeded) | **MOCKED (by design)** | `src/lib/reconDemo.ts` |
| Cockpit "live S/4 · via MCP" badges on seeded tab | **static labels** | `src/lib/reconDemo.ts` (no network) |
| Cockpit "Live tenant" tab (SDK + PKCE) | **ASPIRATIONAL at demo** | `src/lib/sdk.ts`, `src/lib/exchange.ts`, `src/lib/config.ts` |
| Action Center rich HITL | **ASPIRATIONAL (modelled)** | message gate is the runnable path |

---

## 4. Proof — the live SAP agent run (Tier 1)

The variance-agent ran as a **real UiPath Orchestrator Serverless agent job**:

- Job `dbedd8aa-2429-4854-a0bd-6dedaa62101b`, State **Successful**, 64s, 2026-06-29 08:35 UTC.
- Fed **only** the supplier's numbers (`INV-88231`: `RM27` 50 PC @ 27.50, `RM16` 6 PC @ 2.00).
- Returned the **PO side it could only know by reading S/4 at runtime**: PO unit price 25.00 GBP,
  PO qty 5.
- Output `overall_status: "variance-found"`, confidence `0.95`; Item 10 price-variance +10%
  (25.00→27.50), Item 20 over-delivery +20% (qty 5→6).
- `prepared_corrections` (`NetPriceAmount 25→27.50`, `OrderQuantity 5→6`) `ready_to_post=true` but
  **HELD, never posted**.

Code path: `variance-agent/main.py:107-156` (graph), `variance-agent/mcp_client.py:35-76` (SAP MCP),
`variance-agent/entry-points.json` (I/O contract). This is the money slide — agent on real SAP.

---

## 5. What runs today vs what is capacity-blocked

**Tier 1 — PROVEN (the WOW).** All three agents run as separate real Serverless jobs and each reads
live PO `4500000021` over MCP — matching aligns supplier lines to PO items, variance returns the held
corrections, posting-prep prepares the precise `OrderQuantity 5→6` update. Reliable, repeatable, real
SAP. (§4)

**Tier 2 — DEPLOYED.** The committed 3-agent Maestro BPMN is genuinely bound to the three deployed
agents (process bindings + release keys), passes `uip solution pack . --dry-run` (Valid), and was
packed, published, and **deployed live** to the tenant. All three agents are deployed Orchestrator
processes with real release keys.
(`ExchangeReconSolution/ExchangeReconBpmn/ExchangeReconBpmn.bpmn`)

**Tier 3 — capacity-blocked (honest ceiling).** The deployed 3-agent Maestro instance **launches** on
the tenant and an earlier version executed the start event and reached the matching-agent task. It
does **not** complete green: the instance hangs **Pending** because the staging tenant has no
allocated ProcessOrchestration/Agent runtime (license matrix all-zeros — the same reason an earlier
"proven" Maestro run used a script-task stand-in instead of a real agent).

> The only honest end-to-end line: **"The agents are live on real SAP; the 3-agent Maestro is built,
> validated, and deployed, and an instance launches; running it to completion needs allocated agent
> runtime."** We never claim the full 3-agent Maestro ran end-to-end, nor that the gate "cleared" in a
> real procurement run.

---

## 6. Key design decisions

- **Read-only agents.** Every agent's system prompt hard-codes "you never write to SAP"
  (`variance-agent/main.py:102-104`, `matching-agent/main.py:65`, `posting-prep-agent/main.py:68-70`).
  The system of record stays sacred; agents read, reconcile, explain, and *prepare*.
- **Deterministic + human-approved write.** The tolerance decision is plain JavaScript, not an LLM
  (`...bpmn:65-85`); the only write path is a single deterministic file
  (`post_correction.py`) that runs **after** a human clears the gate. No agent can post.
- **"Armed, not fired."** The corrections are fully prepared (`ready_to_post=true`) and the write code
  exists and is wired — but the live PATCH is held (upstream MCP `keyProperties` bug,
  `post_correction.py:11-13`). The system is one server fix away from closing the loop, with no
  unreviewed write risk in the meantime.
- **Governed agency over autonomy.** Maestro is the spine: agents are *tasks* inside a BPMN with
  gateways, a human gate, and error boundaries (`...bpmn`), not a free-running swarm. The orchestrator
  owns control flow; the agents own judgement within bounded loops (max 6 tool iterations).
- **Live system-of-record vs synthetic data.** Proof reads the *real* PO from S/4 over MCP (§4); the
  cockpit's default tab uses **seeded** data (`src/lib/reconDemo.ts`) purely for a 100%-reliable
  visual. The two are deliberately separated so a flaky network never breaks the demo, and so we never
  overclaim that the cockpit itself touches SAP.

---

## 7. Required / sponsor technology

UiPath Maestro BPMN (Track 2) · UiPath Coded Agents (LangGraph / `uipath-langchain`) · MCP · UiPath
Orchestrator (Serverless agent runtime) · UiPath Action Center / Maestro message human-gate ·
`@uipath/uipath-typescript` SDK · UiPath LLM Gateway (Azure OpenAI `gpt-4o-2024-11-20`) · SAP S/4HANA
Cloud + SAP BTP + OData + XSUAA. Built with **Claude Code via UiPath for Coding Agents**.

## 8. Known limits (stated plainly)

- Full 3-agent Maestro e2e is **capacity-blocked** (no allocated agent runtime on the staging
  tenant).
- SAP **write-back is held** — upstream MCP server `keyProperties` bug
  ([writeback-plan](.agent/submission/writeback-plan.md)).
- Cockpit **live tab needs operator config** (`VITE_*`, OAuth PKCE login).
- `BUSINESS-CASE.md` numbers are **ILLUSTRATIVE**, not measured.
