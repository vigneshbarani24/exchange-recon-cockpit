# DEMO-RUNBOOK.md — finale live demo prep (July 23)

**Decision (VB):** lead **live**, recorded run cued as fallback. This runbook makes the live path as failure-proof as a live path can be, and makes the pivot to video invisible.

Everything here obeys `VERIFIED-STATE.md`. The demo shows the **one thing that genuinely runs live** — the reconciliation agent reading real SAP — and nothing that doesn't.

## The spine (what's on screen, in order)
1. **Cockpit "Reconciliation" tab** — the hero visual. Self-contained (`src/lib/reconDemo.ts`, zero network), so it **cannot fail on camera**. This is your stage floor. `npm run dev` → `localhost:5173`.
2. **The live beat (the proof):** in a second tab, a **fresh** live `variance-agent` invoke against real PO `4500000021` — handed only the supplier's numbers, it returns the **PO side** it read from S/4. This is the "it's live, not a mock" moment.
3. **The human gate:** the cockpit Approve / Escalate interaction (demo-tab, local state — reliable) — a person authorizes; the agent never posts.
4. **Claude Code building it** — a few seconds showing `uip` + the coding agent, for the bonus point.

> Fix before you present: the self-contained tab shows a green **"live S/4 · via MCP"** badge over seeded data (`ReconciliationView.tsx:49-51`). A judge who inspects sees static data labelled "live." Either relabel it "captured from live run" or be explicit on camera. Do not let it read as a live pull it isn't.

## Pre-flight (T-minus 60 min — do in this order)
1. **Rotate the SAP XSUAA secret** and confirm the MCP server answers (`SECURITY-CLOSEOUT.md` flags it as shared/needs-rotation). A rotated-but-unupdated secret = dead demo.
2. **Re-auth UiPath in EVERY agent folder** (`uv run uipath auth`). The token is **per-folder** — authing in one agent does NOT refresh the others. This bit us on 2026-07-20: matching + posting-prep failed on a stale token while variance worked. Fix: copy the fresh `.env` to all three agents (or `uipath auth` in each). Token lives ~1 hr — do it inside the hour before you present.
3. **Warm the MCP session:** run one `variance-agent` invoke against PO `4500000021` now. Confirm it returns the PO side. **Screenshot / save that job output** — it becomes the fallback for beat 2.
4. **Record the fallback video** (if not already): a clean screen-capture of the exact spine above, cued to the demo start, subtitled. Put it on a **second device or a separate browser tab**, already open.
5. Browser zoom ~110%, notifications off, one clean window, cursor visible, mic tested (wired if possible).
6. **T-minus 10 min, not T-minus 60:** run the full flow once more end-to-end. If beat 2's live invoke stalls, you present from the captured job with zero shame — it's the same real run.

## The beat sheet (≈2:45 of a 5:00 slot)
Adapted from `DEMO.md:50-59`, regrounded.

| Time | On screen | Say (roughly) |
|---|---|---|
| 0:00–0:20 | Supplier invoice vs the SAP PO line | "A supplier invoiced us. Quantity and price don't match the PO in SAP. Someone has to work out *why* — against the live system of record — before finance pays. Today that's manual." |
| 0:20–0:50 | Cockpit variance queue → open the drawer | "This is the cockpit. Here's the agent's work — produced by a job running **live on Orchestrator against real SAP S/4HANA**. It read the PO from S/4 over MCP, aligned the lines, found the variance, classified it, scored its own confidence, proposed a correction. That's judgment, not math." |
| 0:50–1:15 | The live invoke tab / captured job — point at the PO side | "And it's live, not a mock: the agent was handed **only the supplier's numbers**, yet it reports the *PO* side — net price 25.00, quantity 5. The only way it knows that is by reading S/4 at runtime." |
| 1:15–1:45 | Type a note → **Approve** (or Escalate) | "The human decides. Approve authorizes the prepared correction; escalate routes to the buyer. Either way a **person**, not the agent, authorizes the write-back." |
| 1:45–2:15 | The prepared `A_PurchaseOrderItem` correction | "The write-back is **prepared and held** — 25.00 → 27.50, qty 5 → 6 — and a deterministic step posts it only after a human approves. Nothing posts on camera; the agents are read-only by design. Deterministic check, agent judgment, human authority — kept separate on purpose." |
| 2:15–2:45 | Claude Code / `uip` on screen | "And the automation itself was built with Claude Code through UiPath for Coding Agents — the agents, the BPMN, the cockpit." |

## Failure protocol (rehearse this until it's muscle memory)
- **If the live invoke (beat 2) stalls > ~10s:** calm line — *"the connection to SAP is slow right now, let me show you this exact run"* — cut to the **captured job tab** (already open) and keep narrating as if live. It *is* the same real run. Do not apologize twice.
- **If anything else breaks:** cut to the **fallback video** on the second device, keep talking over it. The cockpit hero tab is self-contained and should never break; if even that dies, go to video.
- **Never:** try the 3-agent Maestro run live (it can't complete), try to show the write-back land (it 404s), or demo the fraud/duplicate/goods-receipt cases (no code). See `VERIFIED-STATE.md`.

## Honest framing to hold in Q&A (verbatim-safe)
- Agent reads live SAP over MCP — **real, read-only**.
- 3-agent Maestro BPMN — **built, validated (`--dry-run` Valid), deployed, bound**; the full composed instance is **not** run e2e (no allocated agent runtime). Never "the instance resumed."
- Write-back — **prepared and held** ("armed, not fired") pending the external MCP `keyProperties` fix.

## What the fallback video must contain
Same spine, subtitled, < 90s of actual demo, cued to start on the cockpit. This is also your Devpost demo video asset. Record it once, well.
