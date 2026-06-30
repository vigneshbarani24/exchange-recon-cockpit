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

All three coded agents are **deployed on UiPath Orchestrator** and have each run
as a live cloud job against real SAP S/4HANA Cloud. Each job pulled PO
**4500000021** over MCP: the **matching-agent** (job 750a5c3e, 52s) matched
supplier lines to PO items by material at confidence 1.0; the **variance-agent**
(job c51ac7fa, 126s) classified item-10 price-variance +10% and item-20
over-delivery +20% and prepared the `A_PurchaseOrderItem` correction payloads
(NetPriceAmount 25.00 → 27.50, OrderQuantity 5 → 6); the **posting-prep-agent**
(job d7b8891e, 52s) read the live OrderQuantity (5) and prepared the precise
5 → 6 update — all **held for human approval**. SAP config is read from
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
| **Deployed and running live on UiPath Orchestrator — all three agents** — each of the three agents runs as a cloud job against real SAP S/4HANA Cloud, pulling PO 4500000021 over MCP: matching (job 750a5c3e), variance (job c51ac7fa) classifying the variances and preparing the `A_PurchaseOrderItem` corrections (NetPriceAmount 25.00 → 27.50, OrderQuantity 5 → 6), and posting-prep (job d7b8891e) preparing the OrderQuantity 5 → 6 update — all held for human approval. SAP config from **Orchestrator assets**, not code. | the three deployed Orchestrator jobs + their output / traces | trigger the jobs; each output reports the real PO side, not the input |
| **Maestro BPMN (3-agent procurement flow) — built, validated, and deployed** — the deterministic tolerance check, the three judgment agents, and the human gate, modelled as a BPMN; packed, published, and deployed live to the tenant, where an instance launches. Not run as a live multi-agent instance end-to-end for procurement (no allocated agent runtime); the live proof is the Orchestrator job above. | the `.bpmn` and Maestro project files | `uip solution pack --dry-run` is Valid; the deployed solution launches an instance |
| **Three coded agents over MCP → live S/4HANA, each proven live on Orchestrator** — matching, variance, and posting-prep agents (`uipath-langchain`), each wired to a SAP OData MCP server via XSUAA client-credentials, reading `A_PurchaseOrderItem` (material, order quantity, net price, currency). All three ran as real Orchestrator Serverless jobs against S/4 — matching-agent (job 750a5c3e, 52s), variance-agent (job c51ac7fa, 126s), posting-prep-agent (job d7b8891e, 52s) — each reading PO 4500000021; corrections held, nothing posted. | `matching-agent/`, `variance-agent/`, `posting-prep-agent/` — each with `main.py`, `langgraph.json`, `.env.example`; the three Orchestrator job traces | trigger each agent's Orchestrator job (or `cd <agent> && uv run uipath run agent -f input.json`) — each returns the *real* PO line items |
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
human gate is built, validated, and deployed live to the tenant. UiPath is the
execution and governance layer; the coding agent is how it was built.

One honest note: each of the three agents has run as its **own** live
Orchestrator job against real S/4 (matching, variance, posting-prep — job ids
above). The Maestro BPMN that composes them is built, validated, and deployed
live to the tenant, where an instance launches; running all three **within a
single Maestro instance** end-to-end for this procurement flow was not completed
(no allocated agent runtime). The gate has not cleared in a live procurement run.

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
