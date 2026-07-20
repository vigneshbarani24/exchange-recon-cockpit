# finale/receipts/ — live-run proof (all three agents)

Evidence that all three coded agents read the real SAP system of record and run end-to-end as separate live jobs. Captured **2026-07-20** via `uv run uipath run agent -f input.json` against **live SAP S/4HANA over MCP** (XSUAA), PO `4500000021`.

**The un-fakeable tell:** each agent is handed only the *supplier's* numbers, yet reports the **PO side** (net price 25.00, qty 5) — obtainable only by reading the live PO from S/4 at runtime.

## The pipeline (three separate live jobs)
1. **`matching-agent-PO4500000021.json`** — aligned both supplier lines to PO items by material at **confidence 1.0** (item 10 RM27, item 20 RM16), carrying both PO and supplier sides. Read the live PO side.
2. **`variance-agent-PO4500000021.json`** — classified item 10 as a **price-variance** (25.00 → 27.50, +10%) and item 20 as an **over-delivery** (qty 5 → 6); prepared both corrections. `overall_status: variance-found`, confidence 0.95.
3. **`posting-prep-agent-PO4500000021.json`** — given the **human-approved** action, read the current S/4 OrderQuantity (5) and prepared the precise **5 → 6** update. `ready_to_post: true`. Writes nothing.

All three are **local runs** (proving the read path is live) and none writes to SAP. What is **not** proven is the three composed inside one **Maestro instance** (capacity-blocked). For a cloud-job receipt, screenshot a Successful Orchestrator job in folder `3093256`.

**Token note (pre-flight):** each agent authenticates from its **own** `.env`. Refresh all three before a live run — a stale token in one agent's folder blocks that agent even when another works. This is exactly what happened on 2026-07-20: only `variance-agent/.env` was fresh; matching/posting-prep failed until their `.env` was refreshed.
