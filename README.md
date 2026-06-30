# Exchange Recon Cockpit

**Governed, multi-agent Procure-to-Pay reconciliation on UiPath Maestro — where the agents reason over the *real* SAP system of record.**

UiPath AgentHack · Track 2 (UiPath Maestro BPMN)

---

## The problem

An AP analyst gets a supplier invoice. To pay it, someone has to prove it matches the purchase
order — line by line, price by price, quantity by quantity. On a real PO of record that means
opening S/4, reading each item, and eyeballing the deltas: a £2.50 unit-price creep here, an extra
crate delivered there. Multiply by hundreds of invoices a week. The analyst is drowning in
mismatches, the payment is blocked, and the buyer is the last to know.

The fix isn't "an AI that pays invoices." Nobody sane lets a model write to the ledger. The fix is
**governed agency**: agents do the reading, matching and judgement; a deterministic rule draws the
tolerance line; a human holds the authority to approve; and the system of record stays sacred.

## What it does

Three coded agents reconcile a supplier invoice against the live purchase order and hand a human a
decision instead of a spreadsheet. Each capability below traces to a file.

- **Pulls the real PO from SAP S/4HANA Cloud over MCP** and aligns supplier lines to PO items by
  material — `matching-agent/main.py`, `matching-agent/mcp_client.py`.
- **Classifies each discrepancy** (price-variance, quantity-variance, over-delivery,
  material-mismatch, …), scores confidence, and **prepares — never posts —** the correction:
  `variance-agent/main.py`, output contract in `variance-agent/entry-points.json`.
- **Turns an approved correction into a precise `A_PurchaseOrderItem` update payload**, reading the
  current S/4 value for the audit trail — `posting-prep-agent/main.py`.
- **Orchestrates the three agents** behind a deterministic tolerance check (2% price / 1-unit qty),
  a human approval gate, exclusive gateways and error/escalation boundary events — the Maestro BPMN
  at `ExchangeReconSolution/ExchangeReconBpmn/ExchangeReconBpmn.bpmn`, bound to the three deployed
  agents in `ExchangeReconSolution/ExchangeReconBpmn/bindings_v2.json`.
- **The agents only ever *read* SAP.** Their system prompts forbid writes; the one write path is a
  separate, human-gated deterministic step (`variance-agent/post_correction.py`) — **armed, not
  fired** (see [Known limits](#known-limits)).

## The wow — a real agent reading real SAP

This is not synthetic data. The **variance-agent ran as a live UiPath Orchestrator Serverless
agent job** (Job `dbedd8aa-2429-4854-a0bd-6dedaa62101b`, *Successful*, 64s) against **live SAP
S/4HANA Cloud over MCP**.

The proof it's real: it was fed **only the supplier's numbers** — invoice INV-88231, material RM27
50 PC @ 27.50, material RM16 6 PC @ 2.00 — and it reported back the **PO side it could only know by
reading S/4 at runtime**: PO unit price **25.00 GBP**, PO qty **5**. It returned
`overall_status: "variance-found"`, confidence 0.95 — Item 10 a +10% price variance (25.00 →
27.50), Item 20 a +20% over-delivery (qty 5 → 6) — and `prepared_corrections` (`NetPriceAmount`
25 → 27.50, `OrderQuantity` 5 → 6) with `ready_to_post: true`. It posted nothing. The correction is
**held at the gate** for a human.

The tool-calling loop and the read-only system prompt: `variance-agent/main.py:107-156`. The SAP
MCP connection (XSUAA client-credentials, OData `execute-entity-operation`):
`variance-agent/mcp_client.py:35-76`.

## How it's built

| Layer | Tech | Where |
| --- | --- | --- |
| Orchestration | **UiPath Maestro BPMN** (Track 2) — deterministic rule + 3 agents + human gate, exclusive gateways, escalation boundaries | `ExchangeReconSolution/ExchangeReconBpmn/ExchangeReconBpmn.bpmn` |
| Agents | **UiPath Coded Agents** — single-node LangGraph graphs (`uipath-langchain`), bounded MCP tool-calling loops + structured output | `*/main.py` |
| LLM | **UiPath LLM Gateway** → Azure OpenAI `gpt-4o-2024-11-20` (`UiPathAzureChatOpenAI`) | `variance-agent/main.py:111` |
| System of record | **SAP S/4HANA Cloud** via a **SAP BTP**-hosted OData→**MCP** server; service `API_PURCHASEORDER_PROCESS_SRV`, entity `A_PurchaseOrderItem`; **XSUAA** auth | `*/mcp_client.py` |
| Runtime | **UiPath Orchestrator** (Serverless agent runtime) — all three agents deployed as processes with real release keys | `*/entry-points.json`, `bindings_v2.json` |
| Human gate | **UiPath Action Center** / Maestro message-event gate | the BPMN + cockpit `decideGate` |
| Cockpit | **@uipath/uipath-typescript** SDK, Vite + React + TypeScript | `src/lib/sdk.ts`, `src/lib/exchange.ts` |
| Built with | **Claude Code via UiPath for Coding Agents** | [CODING-AGENTS.md](./CODING-AGENTS.md) |

## Quickstart

**The cockpit (offline, zero config):**

```bash
npm install
npm run dev          # opens the seeded "Reconciliation" tab — no network, always renders
```

The default tab is a self-contained demo (`src/lib/reconDemo.ts`) seeded with the agents' actual
S/4 outputs — reliable for a judge to click through. To wire the **Live tenant** tab to a real
Maestro instance + Action Center, copy `.env.example` → `.env` and fill the `VITE_UIPATH_*` values
(needs an operator login).

**An agent against live S/4:**

```bash
cd variance-agent
cp .env.example .env          # fill SAP_MCP_URL + XSUAA client-credentials
uipath auth                   # for the LLM Gateway
uv run uipath run agent '{"purchase_order":"4500000021","supplier_document":"INV-88231: RM27 50 PC @ 27.50; RM16 6 PC @ 2.00","tolerance_pct":2.0}'
```

Each agent ships its own `*/.env.example`. No secret is committed — `.env` is gitignored and the
deployed agent reads its SAP connection from Orchestrator assets (`mcp_client.py:20-32`).

## Demo path

What a judge can trigger today:

1. **WOW (real SAP):** start a live `variance-agent` Orchestrator job — it reads PO `4500000021`
   from S/4 over MCP and returns the held corrections. Reliable, real system of record.
2. **VISUAL (offline):** `npm run dev` → the seeded cockpit shows the case, the three-agent
   pipeline, the variance, and the human approve/escalate gate. 100% reliable, no network.
3. **ORCHESTRATION:** `uip solution pack . --dry-run` validates the 3-agent Maestro (Status:
   Valid); it is deployed on the tenant and an instance launches.

All three coded agents have run live as separate Orchestrator jobs against the same PO `4500000021`
on S/4 over MCP (matching `750a5c3e`, variance `c51ac7fa`, posting-prep `d7b8891e`) — each read real
SAP, held its corrections, posted nothing. Running all three *within one Maestro instance* end-to-end
is still capacity-blocked (see [Known limits](#known-limits)).

Full run-of-show in [DEMO.md](./DEMO.md).

## Live vs deployed vs held

| Capability | Status | Where |
| --- | --- | --- |
| variance-agent reads live PO from S/4 over MCP, returns held corrections | **LIVE — proven** (Job `dbedd8aa…`, 64s) | `variance-agent/main.py`, `mcp_client.py` |
| matching / variance / posting-prep coded agents | **LIVE — all three proven** — each ran as a real Orchestrator job reading live PO `4500000021` from S/4 over MCP (matching `750a5c3e`, variance `c51ac7fa`, posting-prep `d7b8891e`), corrections held | `*/main.py`, `bindings_v2.json` |
| 3-agent Maestro BPMN (rule + agents + human gate) | **BUILT + validated + DEPLOYED**; instance launches; full e2e capacity-blocked | `ExchangeReconBpmn.bpmn` |
| Deterministic tolerance check (2% price / 1-unit qty) | **BUILT** (BPMN script) | `ExchangeReconBpmn.bpmn` |
| Human approval gate (message event) | **BUILT** | `ExchangeReconBpmn.bpmn` |
| SAP write-back — PATCH `A_PurchaseOrderItem` | **HELD / blocked** (upstream MCP `keyProperties` 404) | `variance-agent/post_correction.py` |
| Cockpit "Reconciliation" tab (seeded) | **LIVE** offline demo | `src/lib/reconDemo.ts` |
| Cockpit "Live tenant" tab (SDK, OAuth PKCE) | **real code**; needs operator login + `VITE_*` config | `src/lib/sdk.ts`, `src/lib/exchange.ts` |

The honest one-liner: **the agents are live on real SAP; the 3-agent Maestro is built, validated and
deployed, and an instance launches; running it to completion needs allocated agent runtime.**

## Docs & diagrams

- [DEMO.md](./DEMO.md) — run-of-show.
- [CODING-AGENTS.md](./CODING-AGENTS.md) — built-with-Claude-Code evidence (the +2 Coding-Agents bonus).
- [BUSINESS-CASE.md](./BUSINESS-CASE.md) — the case (numbers are **illustrative**, not measured).
- [`docs/diagrams/`](./docs/diagrams/README.md) — the technical diagram set (context · sequence · components · agents · deployment) + the narrative pitch deck (`architecture-deck.drawio`).
- [`specs/exchange-settlement-e2e/`](./specs/exchange-settlement-e2e/) — requirements / design / tasks.

## Known limits

State them plainly:

- **Full 3-agent Maestro e2e is capacity-blocked.** The deployed instance launches and an earlier
  version reached the matching-agent task, but the staging tenant has no allocated
  ProcessOrchestration/Agent runtime, so the instance hangs *Pending*. **Do not** read this as "the
  Maestro ran end-to-end" or "the gate cleared in a real procurement run" — it didn't.
- **SAP write-back is held.** `post_correction.py` is the only write path and it 404s on an upstream
  MCP-server `keyProperties` bug. Armed, not fired.
- **Cockpit live tab needs operator config** (`VITE_*` + login). The "live S/4 · via MCP" badges on
  the default tab are static labels over seeded data — the cockpit itself does not call SAP.
- **BUSINESS-CASE.md numbers are illustrative**, not measured.

## License

MIT — see [LICENSE](./LICENSE). Track 2 (UiPath Maestro BPMN).
