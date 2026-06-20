# Built with UiPath for Coding Agents

**Tool:** Claude Code (Anthropic), installed into this project through **UiPath for
Coding Agents**:

```bash
uip skills install --agent claude   # UiPath platform skills for Claude Code
uip login                            # authenticate the CLI to the tenant
```

The UiPath coding-agent skills gave Claude Code first-class knowledge of Maestro,
Coded Agents (LangGraph / `uipath-langchain`), Action Center, and the UiPath
TypeScript SDK, so it could build, run, and harden the three agents, the
MCP→S/4HANA connection, the automation, and this cockpit from the terminal.

This page documents the contribution with **verifiable evidence**, per the
hackathon's coding-agents bonus. Everything below is checkable from the git
history, a clean `npm run build`, and the agent running live on UiPath
Orchestrator against SAP.

## The headline: deployed and running on Orchestrator

The agent is **deployed on UiPath Orchestrator** and runs as a live cloud job
against real SAP S/4HANA Cloud. A real Orchestrator job pulled PO **4500000021**
over MCP, classified the variances (price-variance, over-delivery), and prepared
the `A_PurchaseOrderItem` correction payloads (NetPriceAmount 25.00 → 27.50,
OrderQuantity 5 → 6), then **held for human approval**. SAP config is read from
**Orchestrator assets** — no secrets in code. The agents are read-only; the
write-back is prepared and held, never posted.

Proof it's live, not mocked: the job is given only the *supplier's* numbers, yet
reports the *PO* side correctly. The only way it has the PO is to have fetched it
from S/4 at runtime.

## How it was used (workflow)

Spec-driven, not vibe-coded. Each change traced to a plan, shipped as a small,
reviewable commit, and verified before the next. For the cockpit:
`npm run typecheck && npm run build`. For the agents: an actual run against the
live SAP system of record — locally via `uv run uipath run agent -f input.json`
and deployed as an Orchestrator cloud job — the agent read the installed SDK and
MCP-adapter types rather than guessing API shapes, and proved the connection by
reporting PO values it could only have fetched from S/4.

## Verifiable contributions (this repository)

| Evidence | Commit / artifact | Verify by |
| --- | --- | --- |
| **Deployed and running live on UiPath Orchestrator** — the agent runs as a cloud job against real SAP S/4HANA Cloud, pulling PO 4500000021 over MCP, classifying variances, and preparing the `A_PurchaseOrderItem` corrections (NetPriceAmount 25.00 → 27.50, OrderQuantity 5 → 6), held for human approval. SAP config from **Orchestrator assets**, not code. | the deployed Orchestrator job + its output / trace | trigger the job; its output reports the real PO side, not the input |
| **Maestro BPMN (3-agent procurement flow) — authored and validates** — the deterministic tolerance check, the three judgment agents, and the human gate, modelled as a BPMN. Not run as a live multi-agent instance end-to-end for procurement; the live proof is the Orchestrator job above. | the `.bpmn` and Maestro project files | `uip maestro bpmn validate` passes |
| **Three coded agents over MCP → live S/4HANA** — matching, variance, and posting-prep agents (`uipath-langchain`), each wired to a SAP OData MCP server via XSUAA client-credentials, reading `A_PurchaseOrderItem` (material, order quantity, net price, currency). | `matching-agent/`, `variance-agent/`, `posting-prep-agent/` — each with `main.py`, `langgraph.json`, `.env.example` | `cd variance-agent && uv run uipath run agent -f input.json` — it returns the *real* PO line items |
| **Proof it's live, not mocked** — handed only the supplier's numbers, the agent still reports the PO side (PO 4500000021: net price 25.00 GBP, order quantity 5) because it pulled the PO from S/4 at runtime. | agent run output / trace | re-run against a known PO; the PO-side values match S/4, not the input |
| **Demo-resilience engineering** — a flag-gated cached fallback (`VITE_DEMO_FALLBACK`) so a live-tenant hiccup can't kill a recording. Real tenant tried first; cached instance only on failure/empty; the gate approval short-circuits. | `src/lib/demoData.ts`, `config.ts`, `exchange.ts` | `git show` the demo-safe-mode commit; `npm run build` on the branch |
| **Build-correctness fix** — diagnosed `tsc -b` emitting compiled `.js` twins into `src/`; added `noEmit`, cleaned the litter, gitignored `*.tsbuildinfo`. | `tsconfig.json` (`noEmit: true`), `.gitignore` | `npm run build` then `find src -name '*.js'` returns nothing |
| **Architecture framing** — the deterministic / agent / human "governed agency" split, the three-agent table, the Mermaid flow, and the demo run-of-show. | `README.md`, `DEMO.md` | read `README.md` "The split that matters" + `DEMO.md` |
| **Clean-IP + repo hygiene** — generic system references only; git baseline; MIT `LICENSE`; no secrets (`.env` gitignored, connection from env / UiPath assets). | `LICENSE`, `.gitignore`, `.env.example` files | `git log`; `git grep` finds no secrets or system identifiers |

Full history: `git log --all --stat`.

## The blend (agent type: Combination)

This solution combines a **coding agent** (Claude Code, which built and hardened
the three agents, the MCP→S/4 connection, the automation, and this cockpit) with
**UiPath native orchestration and governance**: the agent is deployed and runs
live on **Orchestrator** against real S/4HANA, and the **Maestro BPMN** that
composes the deterministic tolerance check, the three judgment agents, and the
human gate is authored and passes `uip maestro bpmn validate`. UiPath is the
execution and governance layer; the coding agent is how it was built.

One honest note: under the workspace's single-process license, the live
Orchestrator deployment runs the full pipeline in **one** agent. The three agents
are separately deployable and are composed in the validated BPMN; the BPMN was not
run as a live multi-agent instance end-to-end for this procurement flow.

## See it in the video

The submission video shows Claude Code building part of this solution from the
terminal (per the bonus requirement) — see `DEMO.md` for where that beat sits in
the run-of-show.

## Reproduce the verification

```bash
# cockpit
npm install
npm run typecheck      # clean
npm run build          # green; emits to dist/ only
find src -name '*.js'  # empty — tsc no longer litters source

# an agent against live S/4 (with .env filled — SAP MCP + XSUAA, plus uipath auth)
cd variance-agent
uv run uipath run agent -f input.json   # pulls the real PO over MCP and reconciles

git log --all --oneline                 # the commits referenced above
```
