# RUN-LIVE.md — run the whole thing live, yourself

Validated **2026-07-20** — every command here produced a **Successful** run this session. Run from a terminal where `uv` and `npm` work.

```bash
MROOT="C:/KaarTech UK/Hackathons/UiPath AgentHack/exchange-recon-cockpit"
```

## 0. The golden rule (the trap that bit us)
The UiPath token is **per agent folder** (`<agent>/.env` → `UIPATH_ACCESS_TOKEN`, and `<agent>/.uipath/.auth.json`). Authing in ONE folder does **not** refresh the others. Refresh **all three** before any run, or the un-refreshed agents die with `Access token is expired`.

## 1. Pre-flight (T-60 min, do in this order)
```bash
# a) Make sure the SAP XSUAA secret in .env is valid (rotate it if needed — your step).
# b) Auth UiPath (opens a browser) in ONE folder:
cd "$MROOT/variance-agent"
uv run uipath auth               # complete the browser login

# c) Propagate the fresh token + SAP config to the other two agents:
cp "$MROOT/variance-agent/.env" "$MROOT/matching-agent/.env"
cp "$MROOT/variance-agent/.env" "$MROOT/posting-prep-agent/.env"
```
Token lives ~1 hr — do this **inside the hour** before you present.

## 2. Run each agent (the live proof)
Each writes its result to `out.json` and prints `Successful execution`. **The "tell" that it's live:** you feed only the *supplier's* numbers, and it returns the **PO side** (net price 25.00, qty 5) it could only have read from S/4.

### matching-agent
```bash
cd "$MROOT/matching-agent"
cat > input.json <<'JSON'
{"purchase_order":"4500000021","supplier_document":"Supplier invoice INV-88231, ref PO 4500000021, GBP. Line 1: Material RM27 (Packaging Box) 50 PC at 27.50 per ea. Line 2: Material RM16 6 PC at 2.00 per ea."}
JSON
uv run uipath run agent -f input.json --output-file out.json
```
Good result: `matched_lines` for item 10 (RM27) + item 20 (RM16), `match_confidence: 1.0`, PO prices/qty on each line.

### variance-agent (the hero)
```bash
cd "$MROOT/variance-agent"
cat > input.json <<'JSON'
{"purchase_order":"4500000021","supplier_document":"Supplier invoice INV-88231, ref PO 4500000021, GBP. Line 1: Material RM27 (Packaging Box) 50 PC at 27.50 per ea. Line 2: Material RM16 6 PC at 2.00 per ea.","tolerance_pct":2.0}
JSON
uv run uipath run agent -f input.json --output-file out.json
```
Good result: `overall_status: variance-found`, item 10 price-variance (25.00→27.50), item 20 over-delivery (5→6), `prepared_corrections` for both, confidence 0.95.

### posting-prep-agent
```bash
cd "$MROOT/posting-prep-agent"
cat > input.json <<'JSON'
{"purchase_order":"4500000021","po_item":"20","approved_action":"Accept the over-delivery; update the PO order quantity to 6"}
JSON
uv run uipath run agent -f input.json --output-file out.json
```
Good result: reads current `OrderQuantity` (5), prepares the **5→6** update, `ready_to_post: true`. Writes nothing to SAP.

## 3. The cockpit
```bash
cd "$MROOT"
npm install     # first time only
npm run dev     # http://localhost:5173
```
- Default **"Reconciliation" tab** = self-contained (no network, always renders) — your hero visual.
- **"Live tenant" tab** = real SDK/OAuth (opt-in). For the demo, drive the demo tab.
- **HITL:** open the variance drawer → type a note → **Approve** / **Escalate**.

## 4. Troubleshooting
- **`Access token is expired`** → that agent's `.env` is stale. Re-do step 1c (copy variance's `.env`) or `uv run uipath auth` in that folder.
- **MCP / SAP read stalls or errors** → external BTP MCP server or network. **Do not retry live on camera** — fall to `BACKUPS.md` (captured receipts / recording).
- **Empty output `{}`** → almost always the token (above) or `.env` missing `SAP_MCP_*`.
- **Never** attempt the write-back or the 3-agent Maestro instance live — see `VERIFIED-STATE.md`.

## 5. Capture a receipt every time it works
When a run is Successful, copy its `out.json` into `finale/receipts/`. That's your permanent, judge-verifiable proof even if the live path is down at showtime.
```bash
cp "$MROOT/variance-agent/out.json" "$MROOT/finale/receipts/variance-agent-PO4500000021.json"
```
