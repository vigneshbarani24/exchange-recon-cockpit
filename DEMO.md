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

## Pre-flight (before you hit record)

- [ ] `.env` filled in and pointing at the live tenant + the SAP MCP server;
      `npm run dev` is up on `http://localhost:5173`.
- [ ] One Maestro instance is **parked at the human gate** (paused / pending
      approval) with the variance agent's proposal already written to its
      variables. This is your money shot — stage it deliberately.
- [ ] A second instance visible in a different status (running / completed) so
      the queue doesn't look like a single hard-coded row.
- [ ] Browser zoom ~110%, window sized so the drawer and queue both fit.
- [ ] Action Center open in a second tab (optional) to show the task actually
      completing on the platform side.
- [ ] If you want proof it's live: have the real PO (e.g. item 10: 50 PC @ 25.00
      GBP) ready to point at. The agent was handed only the supplier's numbers and
      still reported the PO side right — because it fetched it from S/4 at runtime.

## Beat sheet

| Time | On screen | Say (roughly) |
| --- | --- | --- |
| 0:00–0:20 | The supplier invoice next to the SAP PO line items | "A supplier just invoiced us. The quantity and price don't match the purchase order in SAP. Someone has to work out why — against the live system of record — before AP pays. Today that's manual." |
| 0:20–0:40 | The cockpit — live instance queue, `N awaiting review` | "This is the operations cockpit. It reads live Maestro instances. One is paused, waiting on a human." |
| 0:40–1:25 | Open the **variance drawer** — the discrepancy, agent confidence, agent proposal | "Here's the agent's work. It pulled the real PO from S/4HANA over MCP, aligned the supplier's lines to the PO items by material, found the variance, classified it — price-variance, over-delivery, material-mismatch — scored its own confidence, and proposed a correction. That's judgment, not math." |
| 1:25–2:00 | Expand **All variables** | "And it's real Maestro state, not a mock — these are the instance variables the agent wrote, and they include the *PO* side it fetched from SAP at runtime. The tolerance check and the write-back are deterministic; the agent only reads and explains." |
| 2:00–2:35 | Type a note, click **Approve correction** (or **Escalate to buyer**) | "The human decides. Approve clears the Action Center gate; escalate routes it to the buyer. Either way, a person — not the agent — authorizes the correction." |
| 2:35–3:00 | Queue refreshes on the next poll; (optional) the completed task in Action Center | "The gate clears, the instance resumes, the posting-prep agent builds the precise PO-item update payload, and the deterministic write-back runs — only after approval. One flow, end to end: deterministic check, agent judgment, human authority — kept separate on purpose." |

## The line that wins the room

> The agent does the one thing only judgment can do — read a supplier invoice
> against the live SAP PO and explain the variance. It never posts, never pays.
> That separation is the design, not a limitation.

## Platform surface area (name these on camera or in the description)

- **UiPath Maestro** — the BPMN process and its live instances.
- **UiPath Coded Agents (LangGraph)** — the three judgment/retrieval agents.
- **Model Context Protocol (MCP)** — the agents' live, read-only link to SAP
  S/4HANA OData (a SAP BTP-hosted MCP server).
- **Action Center** — the human approval gate (Tasks API `complete`).
- **UiPath TypeScript SDK** — the cockpit talks to all of the above.
- **UiPath for Coding Agents** — the automation side was built with Claude Code
  using the official `uip skills` for the platform.

## Don't

- Don't show settlement/trading/claims anything. One flow: invoice vs PO.
- Don't imply the agent writes to SAP or pays the invoice. It reads and explains;
  the human authorizes; the deterministic write-back updates the PO item.
- Don't read variable JSON aloud — point at the proposal, keep the pace.
