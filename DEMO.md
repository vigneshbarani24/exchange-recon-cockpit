# Demo Run-of-Show

A ~3-minute recorded walkthrough. The hero is the **variance agent** — the
judgment step that reads two mismatched statements and explains the gap. The
cockpit is the window; keep the camera on the agent's reasoning and the human
gate, not on UI chrome.

## One sentence

A crude-exchange settlement between a refiner and a counterparty doesn't
reconcile. A deterministic tolerance check flags it, an agent explains *why* the
two statements disagree and proposes a correction, and a human approves or
escalates — the agent never touches the ledger.

## Pre-flight (before you hit record)

- [ ] `.env` filled in and pointing at the live tenant; `npm run dev` is up on
      `http://localhost:5173`.
- [ ] One Maestro instance is **parked at the human gate** (paused / pending
      approval) with the variance agent's proposal already written to its
      variables. This is your money shot — stage it deliberately.
- [ ] A second instance visible in a different status (running / completed) so
      the queue doesn't look like a single hard-coded row.
- [ ] Browser zoom ~110%, window sized so the drawer and queue both fit.
- [ ] Action Center open in a second tab (optional) to show the task actually
      completing on the platform side.

## Beat sheet

| Time | On screen | Say (roughly) |
| --- | --- | --- |
| 0:00–0:20 | The two statements (refiner vs counterparty), side by side | "These two settlement statements disagree. Someone has to work out why, across two systems, before money moves. Today that's manual." |
| 0:20–0:40 | The cockpit — live instance queue, `N awaiting review` | "This is the operations cockpit. It reads live Maestro instances. One is paused, waiting on a human." |
| 0:40–1:25 | Open the **variance drawer** — variance, agent confidence, agent proposal | "Here's the agent's work. It read both statements, found the variance, scored its own confidence, and wrote a plain-English explanation plus a proposed correction. This is judgment — reading two messy documents — not math." |
| 1:25–2:00 | Expand **All variables** | "And it's real Maestro state, not a mock — these are the instance variables the agent wrote. The tolerance check and the posting are deterministic; the agent only explains." |
| 2:00–2:35 | Type a note, click **Approve correction** (or **Escalate to desk**) | "The human decides. Approve clears the Action Center gate; escalate routes it to the trading desk. Either way, a person — not the agent — authorizes the correction." |
| 2:35–3:00 | Queue refreshes on the next poll; (optional) the completed task in Action Center | "The gate clears, the instance resumes, the deterministic posting runs. One flow, end to end: deterministic math, agent judgment, human authority — kept separate on purpose." |

## The line that wins the room

> The agent does the one thing only judgment can do — read two mismatched
> statements and explain the variance. It never posts, never moves money. That
> separation is the design, not a limitation.

## Platform surface area (name these on camera or in the description)

- **UiPath Maestro** — the BPMN process and its live instances.
- **Action Center** — the human approval gate (Tasks API `complete`).
- **Data Fabric (Entities)** — positions and counterparty statements.
- **UiPath TypeScript SDK** — the cockpit talks to all of the above.
- **UiPath for Coding Agents** — the automation side was built with Claude Code
  using the official `uip skills` for the platform.

## Don't

- Don't show invoice/AP/claims anything. One flow.
- Don't imply the agent posts or moves money. It explains; the human authorizes;
  deterministic steps post.
- Don't read variable JSON aloud — point at the proposal, keep the pace.
