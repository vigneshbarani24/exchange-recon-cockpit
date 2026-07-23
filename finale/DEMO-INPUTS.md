# Demo input pack: paste-ready variations you run yourself

Portal start, either folder: Orchestrator > Processes > ExchangeReconBpmn (canvas) or
ExchangeReconTeamsNotify (twin) > Start > paste one JSON. The iron rule from the smoke
wars: the supplier document MUST describe the same PO it references. Never leave an
instance parked at a gate (twin self-escalates at 10 minutes; canvas waits forever, so
always finish what you start there).

Verified PO contents these are built on:
- 4500000021: item 10 = RM27 (Packaging Box) 50 PC at 25.00 GBP; item 20 = RM16 5 PC at 2.00 GBP
- 4500001668: items 10-50 = Laptop Computer, 1 PAC at 2000.00 GBP each

## V1. The demo classic: price +10% AND over-delivery (approve -> corrected)

```json
{"purchaseOrder":"4500000021","supplierDocument":"Supplier invoice INV-88231, ref PO 4500000021, GBP. Line 1: Material RM27 (Packaging Box) 50 PC at 27.50 per ea. Line 2: Material RM16 6 PC at 2.00 per ea."}
```

## V2. Price breach only (clean single-variance story)

```json
{"purchaseOrder":"4500000021","supplierDocument":"Supplier invoice INV-90501, ref PO 4500000021, GBP. Line 1: Material RM27 (Packaging Box) 50 PC at 27.50 per ea. Line 2: Material RM16 5 PC at 2.00 per ea."}
```

## V3. Over-delivery only: 2 units above order (escalate feels natural)

```json
{"purchaseOrder":"4500000021","supplierDocument":"Supplier invoice INV-90502, ref PO 4500000021, GBP. Line 1: Material RM27 (Packaging Box) 50 PC at 25.00 per ea. Line 2: Material RM16 7 PC at 2.00 per ea."}
```

## V4. Under-delivery: invoiced 45 of 50 (buyer conversation)

```json
{"purchaseOrder":"4500000021","supplierDocument":"Supplier invoice INV-90503, ref PO 4500000021, GBP. Line 1: Material RM27 (Packaging Box) 45 PC at 25.00 per ea. Line 2: Material RM16 5 PC at 2.00 per ea."}
```

## V5. Inside tolerance: price +1% (the conservative-by-default story)

```json
{"purchaseOrder":"4500000021","supplierDocument":"Supplier invoice INV-90504, ref PO 4500000021, GBP. Line 1: Material RM27 (Packaging Box) 50 PC at 25.25 per ea. Line 2: Material RM16 5 PC at 2.00 per ea."}
```

Narration for V5: the variance is inside the 2 percent policy; auto-clear is designed and
parked behind a filed platform defect, so the case routes conservatively to the human.
Say it as a feature: when a platform primitive is unreliable, the flow fails toward
human authority, never away from it.

## V6. Stretch: identical line items (the hard matching case, PO 4500001668)

```json
{"purchaseOrder":"4500001668","supplierDocument":"Supplier invoice INV-90510, ref PO 4500001668, GBP. Line 1: Laptop Computer 1 PAC at 2150.00 per ea. Line 2: Laptop Computer 1 PAC at 2000.00 per ea."}
```

Five identical PO lines, two invoice lines: this is where match_basis and
match_confidence earn their keep. Q&A ammunition, not the main demo.

## Room-pick candidates (live-swept from the tenant on finale morning)

Verified over MCP, read-only. Clean single-line GBP POs, safe for "any PO you name":
- 4500001666: RM023 Temperature Sensor · 10 PC @ 48.50 GBP
- 4500001665: 1740 Electric Motor 620W · 1 PC @ 50.00 GBP
- 4500001664: 1891 Laptop Computer · 20 PAC @ 2000.00 GBP (10% variance = 4,000 GBP exposure)
- 4500001663: 1978 Perfume · 2 L @ 10.00 GBP
AVOID on stage: 4500001680 / 4500001679 (EUR docs, currency mismatch untested), any
decimal-quantity AU-unit rows.

Recipe for an unseen PO: run the lookup, then compose the invoice as "Supplier invoice
INV-9xxxx, ref PO <n>, GBP. Line 1: Material <code> (<text>) <qty> <unit> at
<price x 1.1> per ea." Price +10 percent is always a clean out-of-tolerance story.

```json
{"purchaseOrder":"4500001666","supplierDocument":"Supplier invoice INV-90520, ref PO 4500001666, GBP. Line 1: Material RM023 (Temperature Sensor) 10 PC at 53.35 per ea."}
```

```json
{"purchaseOrder":"4500001664","supplierDocument":"Supplier invoice INV-90522, ref PO 4500001664, GBP. Line 1: Material 1891 (Laptop Computer) 20 PAC at 2200.00 per ea."}
```

## Gate decisions (after the instance suspends)

Canvas folder:

```bash
uip maestro bpmn instance message send -f e3945ea1-de36-4504-bf98-dc6503edc87f --inputs '{"name":"ApproveGate","reference":"<PO>","itemData":{"decision":"approve","note":"Accept the proposed correction."}}'
uip maestro bpmn instance message send -f e3945ea1-de36-4504-bf98-dc6503edc87f --inputs '{"name":"EscalateGate","reference":"<PO>","itemData":{"decision":"escalate","note":"Rejected by reviewer - route to buyer."}}'
```

Twin folder (notifications fire here): same commands with `-f 7ca50286-caae-4746-a228-c293e65bfd83`.

SHELL RULE (learned the hard way on finale morning): the single-quote form above works
ONLY in Git Bash. In cmd.exe, single quotes are literal and the JSON arrives stripped
("Failed to parse inputs as JSON"). cmd-safe form, escaped double quotes:

```
uip maestro bpmn instance message send -f 7ca50286-caae-4746-a228-c293e65bfd83 --inputs "{\"name\":\"ApproveGate\",\"reference\":\"4500000021\",\"itemData\":{\"decision\":\"approve\",\"note\":\"Accept the proposed correction.\"}}"
```

Never fire a gate message unless the instance is suspended at the gate for that PO.
CLI auto-update check is disabled for the day (uip config set autoVersionSync false);
if the update banner ever reappears, ignore it: a failed update changes nothing.

Or the cockpit Live tab: Human gate panel, PO field, Approve / Escalate buttons
(browser PKCE click still untested; verify once before trusting it on stage).

Watch any run:

```bash
uip maestro bpmn instance element-executions <instanceId> -f <folder-key> --output json
```

Reminders: `reference` must equal the exact PO of that run. One instance at a gate per PO
at a time (correlation is per PO). On the twin, expect the Teams card, Slack post in
#invoice-po-exceptions, and (on escalate) the Gmail email within seconds of the ending.
