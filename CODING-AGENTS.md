# Built with UiPath for Coding Agents

**Tool:** Claude Code (Anthropic), installed into this project through **UiPath for
Coding Agents**:

```bash
uip skills install --agent claude   # UiPath platform skills for Claude Code
uip login                            # authenticate the CLI to the tenant
```

The UiPath coding-agent skills gave Claude Code first-class knowledge of Maestro,
Action Center, Data Fabric, and the UiPath TypeScript SDK, so it could build, run,
and harden both the automation side and this cockpit from the terminal.

This page documents the contribution with **verifiable evidence**, per the
hackathon's coding-agents bonus. Everything below is checkable from the git
history and a clean `npm run build`.

## How it was used (workflow)

Spec-driven, not vibe-coded. Each change traced to a plan, shipped as a small,
reviewable commit, and verified (`npm run typecheck && npm run build`) before the
next. The agent read the installed SDK `.d.ts` files rather than guessing API
shapes, and worked against the live tenant for the human-in-the-loop loop.

## Verifiable contributions (this repository)

| Evidence | Commit / artifact | Verify by |
| --- | --- | --- |
| **Demo-resilience engineering** — a flag-gated cached fallback (`VITE_DEMO_FALLBACK`) so a live-tenant hiccup can't kill a recording. Real tenant tried first; cached instance only on failure/empty; the gate approval short-circuits. | `feat(demo)` on branch `vb/demo/safe-mode` — `src/lib/demoData.ts`, `config.ts`, `exchange.ts` (+123/-25) | `git show eab0c4a`; `npm run build` on the branch |
| **Build-correctness fix** — diagnosed `tsc -b` emitting compiled `.js` twins into `src/`; added `noEmit`, cleaned the litter, gitignored `*.tsbuildinfo`. | `tsconfig.json` (`noEmit: true`), `.gitignore` | `npm run build` then `find src -name '*.js'` returns nothing |
| **Architecture framing** — the deterministic / agent / human "governed agency" split, the Mermaid flow diagram, and the demo run-of-show. | `f385ce8`, `a858938` — `README.md`, `DEMO.md` | read `README.md` "The split that matters" + `DEMO.md` |
| **Clean-IP + repo hygiene** — removed a commercial ETRM product name; git baseline; MIT `LICENSE`; no secrets (`.env` gitignored). | `a858938`, `304676c` | `git log`; `git grep -i rightangle` returns nothing |

Full history: `git log --all --stat`.

## The blend (agent type: Combination)

This solution combines a **coding agent** (Claude Code, which built and hardened
the automation and this cockpit) with **UiPath low-code / native orchestration**
(Maestro BPMN sequencing the deterministic rules, the judgment agent, and the
Action Center human gate). UiPath is the execution and governance layer; the
coding agent is how it was built. <!-- VB: confirm the exact agent composition
(coded vs Agent Builder low-code vs external framework) before flipping public. -->

## See it in the video

The submission video shows Claude Code building part of this solution from the
terminal (per the bonus requirement) — see `DEMO.md` for where that beat sits in
the run-of-show.

## Reproduce the verification

```bash
npm install
npm run typecheck   # clean
npm run build       # green; emits to dist/ only
find src -name '*.js'   # empty — tsc no longer litters source
git log --all --oneline # the commits referenced above
```
