# Exchange Recon · Ops Cockpit

Live operations cockpit for the **Maestro Exchange Settlement Reconciliation** process.
It reads running Maestro instances, surfaces the ones where the variance agent has
flagged a mismatch, shows the agent's proposed correction, and lets an operator clear
the **human gate** (approve the correction or escalate to the trading desk) without
leaving the app.

This is the human-in-the-loop surface for the agentic process. The orchestration,
agents, and audit trail run on the UiPath Platform; this app is the window into them.

## What it does

- Lists live instances of the Exchange Recon process (polls every 8s).
- Flags instances needing a human: faulted, paused, or pending approval.
- Opens a variance drawer per instance: the agent's variance, confidence, and proposed
  RightAngle correction, pulled from instance variables, plus the full variable set.
- Completes the linked Action Center task with the operator's decision.

## UiPath components used

| Component | Used for |
| --- | --- |
| UiPath Maestro (Process Instances API) | live instance list, status, variables, execution history |
| UiPath Action Center (Tasks API) | the human approval gate (`complete` the task) |
| UiPath Data Fabric (Entities API) | open positions and counterparty statements (demo data) |
| UiPath TypeScript SDK `@uipath/uipath-typescript` | all of the above, via modular imports |

## Prerequisites

- Node.js 18+
- A UiPath Automation Cloud tenant with Maestro enabled
- An OAuth **External Application** (Admin -> External Applications -> Non Confidential)
  with redirect URI `http://localhost:5173` and scopes matching `.env`

## Setup

```bash
npm install
cp .env.example .env      # fill in client id, org, tenant, folder
npm run dev               # http://localhost:5173
```

Sign in with UiPath, and the cockpit connects to your tenant.

## Coding agents (UiPath for Coding Agents)

This project's UiPath automation side was built with **Claude Code** using the official
UiPath agent skills:

```bash
npm i -g @uipath/cli
uip skills install --agent claude   # installs UiPath skills into Claude Code
uip login                            # authenticate the CLI to your tenant
```

The skills give the coding agent the domain knowledge to build, run, test, and deploy
the Maestro process and the coded variance agent from the terminal.

## Preview-API seams

A few shapes vary by tenant/configuration on the preview APIs. They are marked in code:

- `src/lib/exchange.ts` `findOpenTaskForInstance` — confirm the field that links an
  Action Center task to a Maestro instance against a real task payload.
- `decideGate` — align the `data` keys with your User task's outcome form fields.
- `getInstanceVariables` — variable container shape is normalized defensively.

## License

MIT. See [LICENSE](./LICENSE).
