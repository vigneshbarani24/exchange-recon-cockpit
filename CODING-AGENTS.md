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
history, a clean `npm run build`, and a live agent run against SAP.

## How it was used (workflow)

Spec-driven, not vibe-coded. Each change traced to a plan, shipped as a small,
reviewable commit, and verified before the next. For the cockpit:
`npm run typecheck && npm run build`. For the agents: an actual run against the
live SAP system of record (`uv run uipath run agent -f input.json`) — the agent
read the installed SDK and MCP-adapter types rather than guessing API shapes, and
proved the connection by reporting PO values it could only have fetched from S/4.

## Verifiable contributions (this repository)

| Evidence | Commit / artifact | Verify by |
| --- | --- | --- |
| **Three coded agents over MCP → live S/4HANA** — matching, variance, and posting-prep agents (`uipath-langchain`), each wired to a SAP OData MCP server via `langchain-mcp-adapters` with XSUAA client-credentials, reading `A_PurchaseOrderItem` (material, order quantity, net price, currency). | `matching-agent/`, `variance-agent/`, `posting-prep-agent/` — each with `main.py`, `langgraph.json`, `.env.example` | `cd variance-agent && uv run uipath run agent -f input.json` — it returns the *real* PO line items |
| **Proof it's live, not mocked** — handed only the supplier's numbers, the agent still reports the PO side (e.g. item 10: 50 PC @ 25.00 GBP) because it pulled the PO from S/4 at runtime. | agent run output / trace | re-run against a known PO; the PO-side values match S/4, not the input |
| **Demo-resilience engineering** — a flag-gated cached fallback (`VITE_DEMO_FALLBACK`) so a live-tenant hiccup can't kill a recording. Real tenant tried first; cached instance only on failure/empty; the gate approval short-circuits. | `src/lib/demoData.ts`, `config.ts`, `exchange.ts` | `git show` the demo-safe-mode commit; `npm run build` on the branch |
| **Build-correctness fix** — diagnosed `tsc -b` emitting compiled `.js` twins into `src/`; added `noEmit`, cleaned the litter, gitignored `*.tsbuildinfo`. | `tsconfig.json` (`noEmit: true`), `.gitignore` | `npm run build` then `find src -name '*.js'` returns nothing |
| **Architecture framing** — the deterministic / agent / human "governed agency" split, the three-agent table, the Mermaid flow, and the demo run-of-show. | `README.md`, `DEMO.md` | read `README.md` "The split that matters" + `DEMO.md` |
| **Clean-IP + repo hygiene** — generic system references only; git baseline; MIT `LICENSE`; no secrets (`.env` gitignored, connection from env / UiPath assets). | `LICENSE`, `.gitignore`, `.env.example` files | `git log`; `git grep` finds no secrets or system identifiers |

Full history: `git log --all --stat`.

## The blend (agent type: Combination)

This solution combines a **coding agent** (Claude Code, which built and hardened
the three agents, the MCP→S/4 connection, the automation, and this cockpit) with
**UiPath low-code / native orchestration** (Maestro BPMN sequencing the
deterministic tolerance check, the three judgment agents, and the Action Center
human gate). UiPath is the execution and governance layer; the coding agent is how
it was built.

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
