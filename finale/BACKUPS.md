# BACKUPS.md — backups to backups (the demo cannot fail)

Every demo beat has a primary and at least two fallbacks. **Rule on stage: one calm pivot line, then drop to the next layer — never retry a live call twice on camera.**

## The layers (most-live → most-bulletproof)
| Layer | What it is | Fails only if |
|---|---|---|
| **L0 — self-contained cockpit** | `npm run dev`, the "Reconciliation" demo tab (`src/lib/reconDemo.ts`) — zero network, renders the agents' captured output | your laptop dies |
| **L1 — committed receipts** | `finale/receipts/*.json` (all 3 agents' real live output) open in a tab | git is gone |
| **L2 — recorded demo video** | full subtitled screen-capture of the whole demo, on a **2nd device** + a browser tab | both devices die |
| **L3 — per-beat screenshots** | PNGs of each agent output, the cockpit HITL, the audit — as static fallback slides | — |
| **L4 — deck as PDF** | the Cinder deck exported to PDF, on a 2nd device + emailed + USB | — |

## Per-beat fallback map
| Beat | Primary | Backup 1 | Backup 2 |
|---|---|---|---|
| Agent reads live SAP (the tell) | live `uv run` invoke | receipt tab (`finale/receipts/variance-agent-…json`) | screenshot slide |
| The reconciliation verdict | cockpit demo tab | receipt JSON | recorded video |
| Human gate (Approve/Escalate) | cockpit demo tab (local state — reliable) | recorded video | screenshot |
| "It's live, not a mock" | live invoke returning the PO side | receipt showing PO 25.00 / qty 5 from supplier-only input | recorded video |
| Claude Code building it | live `uip` / editor | recorded video clip | `CODING-AGENTS.md` on screen |
| The deck itself | .pptx in PowerPoint | .pptx on 2nd device | PDF export |

## Pre-flight capture checklist (produce every layer BEFORE the event)
- [ ] **L0:** `npm run dev` renders the demo tab offline (airplane-mode test).
- [ ] **L1:** all 3 receipts present in `finale/receipts/` and readable.
- [ ] **L2:** record the full demo (subtitled) → save to 2nd device + upload a copy (YouTube unlisted / Drive) + keep a local tab open.
- [ ] **L3:** screenshot each agent's Successful output, the HITL approve, the audit trail → drop into a hidden "backup" section of the deck.
- [ ] **L4:** export the deck to PDF; put deck + PDF on a 2nd device, email to yourself, copy to a USB.
- [ ] Second device fully able to present alone (deck + video + receipts).
- [ ] Test the whole flow **10 minutes before**, not an hour before.

## Pivot lines (rehearse until automatic)
- Live invoke stalls → *"The connection to SAP is slow right now — here's the exact run I captured."* → receipt / video.
- Cockpit hiccup → *"Let me show you this on the recorded run."* → video.
- Deck won't open → PDF on the 2nd device, keep talking.

## Already banked this session
- ✅ **L1 receipts** — all 3 agents' real live output committed (`finale/receipts/`).
- ✅ **L0** — the self-contained cockpit tab.
- ✅ The **deck** (.pptx) built + in `finale/` + Downloads.
- ⏳ **To capture before the event:** L2 (record the demo), L3 (screenshots), L4 (PDF + 2nd device).
