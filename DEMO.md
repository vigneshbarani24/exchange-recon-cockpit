# Demo Run-of-Show

A ~3-minute recorded walkthrough. The hero is the **variance agent** — the
judgment step that reads a supplier invoice against the live PO and explains the
gap. The cockpit is the window; keep the camera on the agent's reasoning and the
human gate, not on UI chrome.

## One sentence

A supplier invoice doesn't match the purchase order in SAP. A deterministic
tolerance check flags it, an agent explains *why* the invoice and the PO disagree
and proposes a correction, and a human approves or escalates — the agent reads
S/4HANA but never writes to it.

## The headline proof (lead with this)

All three coded agents are **deployed and ran live on UiPath Orchestrator** as
**three separate cloud jobs**, each wired to real SAP S/4HANA Cloud and each
reading PO **4500000021** over MCP. The **matching agent** (job 750a5c3e) aligned
the supplier lines to the PO items by material off the live PO prices and
quantities at confidence 1.0. The **variance agent** (job c51ac7fa) classified
the variances (price-variance +10%, over-delivery +20%) and prepared the
`A_PurchaseOrderItem` correction payloads — NetPriceAmount 25.00 → 27.50,
OrderQuantity 5 → 6. The **posting-prep agent** (job d7b8891e) read the current
S/4 OrderQuantity (5) and staged the precise OrderQuantity 5 → 6 update,
ready_to_post — then all **held for human approval**. They read SAP config from
Orchestrator assets; no secrets in code. Not mocks, not local scripts — three
cloud jobs that reached into the system of record. They ran as three separate
jobs, not composed within a single Maestro instance end-to-end.

The tell that it's live: the agent is handed **only the supplier's numbers**, yet
reports the **PO** side correctly. The only way it knows the PO is to fetch it
from S/4 at runtime.

## Pre-flight (before you hit record)

- [ ] `.env` filled in and pointing at the live tenant + the SAP MCP server;
      `npm run dev` is up on `http://localhost:5173`.
- [ ] The variance proposal staged in the cockpit drawer — the agent's output
      (discrepancy, classification, confidence, proposed `A_PurchaseOrderItem`
      correction) ready to open. This is your money shot — stage it deliberately.
- [ ] The Orchestrator job's output (or its trace) reachable in a second tab, so
      you can show the cloud job that produced the proposal against live S/4.
- [ ] Browser zoom ~110%, window sized so the drawer and queue both fit.
- [ ] If you want proof it's live: have the real PO (PO 4500000021 — e.g. unit
      price 25.00 GBP, order quantity 5) ready to point at. The agent was handed
      only the supplier's numbers and still reported the PO side right — because it
      fetched it from S/4 at runtime.

## Beat sheet

| Time | On screen | Say (roughly) |
| --- | --- | --- |
| 0:00–0:20 | The supplier invoice next to the SAP PO line items | "A supplier just invoiced us. The quantity and price don't match the purchase order in SAP. Someone has to work out why — against the live system of record — before AP pays. Today that's manual." |
| 0:20–0:40 | The cockpit — the variance queue, `N awaiting review` | "This is the operations cockpit. It surfaces the agent's work waiting on a human decision." |
| 0:40–1:25 | Open the **variance drawer** — the discrepancy, agent confidence, agent proposal | "Here's the agent's work — produced by a job running live on UiPath Orchestrator against real SAP S/4HANA. It pulled the real PO from S/4 over MCP, aligned the supplier's lines to the PO items by material, found the variance, classified it — price-variance, over-delivery, material-mismatch — scored its own confidence, and proposed a correction. That's judgment, not math." |
| 1:25–2:00 | Expand **All variables** / point at the Orchestrator job output | "And it's live, not a mock — the agent was given only the supplier's numbers, yet it reports the *PO* side: net price 25.00, order quantity 5. It could only have those by fetching the PO from S/4 at runtime. The tolerance check and the write-back are deterministic; the agent only reads and explains." |
| 2:00–2:35 | Type a note, click **Approve correction** (or **Escalate to buyer**) | "The human decides. Approve authorizes the prepared correction; escalate routes it to the buyer. Either way, a person — not the agent — authorizes the write-back." |
| 2:35–3:00 | The prepared `A_PurchaseOrderItem` correction payload | "The write-back is prepared and held — NetPriceAmount 25.00 → 27.50, OrderQuantity 5 → 6 — and a deterministic step posts it only after a human approves. Nothing is posted on camera; the agents are read-only by design. One pipeline: deterministic check, agent judgment, human authority — kept separate on purpose." |

## The line that wins the room

> The agent does the one thing only judgment can do — read a supplier invoice
> against the live SAP PO and explain the variance. It never posts, never pays.
> That separation is the design, not a limitation.

## Platform surface area (name these on camera or in the description)

- **UiPath Orchestrator** — all three agents are deployed here and each ran as a
  **separate** live cloud job against real SAP S/4HANA; SAP config comes from
  Orchestrator assets, not code.
- **UiPath Maestro** — the 3-agent procurement BPMN: built, validated, and
  deployed live to the tenant, where an instance launches. The full 3-agent run
  does not complete (no allocated agent runtime). Each agent is separately
  deployable and composed in the BPMN.
- **UiPath Coded Agents (LangGraph)** — the three judgment/retrieval agents.
- **Model Context Protocol (MCP)** — the agents' live, read-only link to SAP
  S/4HANA OData (a SAP BTP-hosted MCP server).
- **Action Center** — the human approval gate.
- **UiPath TypeScript SDK** — the cockpit talks to the platform.
- **UiPath for Coding Agents** — the automation side was built with Claude Code
  using the official `uip skills` for the platform.

> Honest framing for Q&A: all three agents ran live on Orchestrator as **three
> separate jobs**, each reading real SAP S/4HANA — matching (750a5c3e), variance
> (c51ac7fa), posting-prep (d7b8891e). What did **not** run end-to-end is the
> three composed **within a single Maestro instance**: the BPMN is built,
> validated, and deployed live to the tenant, where an instance launches, but the
> full 3-agent run never completed for this procurement flow (no allocated agent
> runtime). The agents prepare corrections and hold; nothing posts.

## Don't

- Don't show settlement/trading/claims anything. One flow: invoice vs PO.
- Don't imply the agent writes to SAP or pays the invoice. It reads and explains;
  the write-back is **prepared and held**; a human authorizes; only then would a
  deterministic step post the PO-item correction.
- Don't claim the Maestro instance ran end-to-end or "resumed" — the live proof
  is the Orchestrator job against S/4; the BPMN is built, validated, and deployed,
  and an instance launches, but the full 3-agent run never completed for
  procurement.
- Don't read variable JSON aloud — point at the proposal, keep the pace.
