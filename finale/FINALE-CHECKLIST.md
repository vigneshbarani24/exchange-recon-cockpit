# FINALE-CHECKLIST - 2026-07-23

One page to run the day. Facts frozen 2026-07-22 evening. Anything marked `{{...}}` is an
unresolved smoke outcome: fill it in tonight, never guess it.

## Constants (do not re-derive under pressure)

| Thing | Value |
|---|---|
| Demo folder (canvas, FROZEN floor) | `Shared/ExchangeReconCanvas`, fid `3252146`, key `e3945ea1-de36-4504-bf98-dc6503edc87f` |
| Canvas package / release | pkg `ExchangeReconSolutionCanvas` 1.0.5 (frozen green), deployed release 1.0.6, process `ExchangeReconBpmn` |
| Twin folder (enriched) | `Shared/ExchangeReconTeams`, fid `3253138`, key `7ca50286-caae-4746-a228-c293e65bfd83` |
| Twin package / deployment | `ExchangeReconSolutionTeams` 1.0.7, deployment `ExchangeReconTeams`, ActivationStatus SuccessfulActivate |
| Demo PO | `4500000021` (price 25.00 to 27.50 on item 10, over-delivery 5 to 6 on item 20) |
| Spare PO for smoke | `4500001681` (escalate scenario, terminal at End_Escalated) |
| Trophy instance | `2db6d4d8` (2:56 end to end) |
| Test Manager project | "Exchange Recon - Agent Evals", prefix RECON, id `3dcc9b9e-8719-0100-48a7-0b49ea40aef1` |
| Evidence bucket | `recon-evidence`, 21 artifacts |
| uip CLI | core 1.197.1 works. HARD RULE: no CLI updates before the finale. Decline any update prompt. |

Fallback ladder (COMPOSED-RUN-STEPS section 6): live composed run > individual agent jobs >
Runs board / receipts / cockpit captured case > recorded video > deck PDF.

---

## 1. TONIGHT (2026-07-22, remaining, in this order)

### 1.1 P0: record the backup video (nothing else happens until this exists)

Portal start, exactly per `finale/backups/COMPOSED-RUN-STEPS.md` section 1, narrated with
`finale/2026-07-21-grounded/STORYCRAFT.md` Part B beats 1 to 5.

1. Orchestrator > folder ExchangeReconCanvas > Processes > ExchangeReconBpmn > Start, input:

```json
{"purchaseOrder":"4500000021","supplierDocument":"Supplier invoice INV-88231, ref PO 4500000021, GBP. Line 1: Material RM27 (Packaging Box) 50 PC at 27.50 per ea. Line 2: Material RM16 6 PC at 2.00 per ea."}
```

2. At the gate (suspends about 1:48 in), approve:

```bash
uip maestro bpmn instance message send -f e3945ea1-de36-4504-bf98-dc6503edc87f \
  --inputs '{"name":"ApproveGate","reference":"4500000021","itemData":{"decision":"approve","note":"Accept the proposed correction."}}'
```

3. Watch to End_Corrected:

```bash
uip maestro bpmn instance element-executions <instanceId> -f e3945ea1-de36-4504-bf98-dc6503edc87f --output json
```

- [ ] Recorded: three agent jobs with JobKey populated, 1-second tolerance gate, suspend,
      approve, held correction, End_Corrected. Write-back stays HELD by design on camera.
- [ ] Narration follows STORYCRAFT Part B (beat 3 slow-down at the PO-side reveal).
- [ ] Copy to the second device and PLAY IT THERE end to end. A backup that does not play
      on the second device is not a backup.
- [ ] Keep a local copy on the laptop too (offline, not cloud-only).

### 1.2 Twin (1.0.7) smoke decision block

Smokes are IN PROGRESS. Record literal outcomes here when they land, do not guess:

| Smoke | What green looks like | Outcome |
|---|---|---|
| Approve path on 1.0.7 | Same as canvas: gate clears on ApproveGate, End_Corrected | **GREEN** first attempt. Instance 3aed9118, three gate branches armed, approve won, losers terminated cleanly, End_Corrected. Trace in finale/maestro/. |
| Escalate path on 1.0.7 | EscalateGate clears, Gmail SendTask fires (owner inbox), Slack SendTask posts to #general, End_Escalated | **GREEN to End_Escalated** (4139bdeb). Connector legs terminated silently in ~1s, NO email/Slack sent; both boundaries caught and routed onward. Legs = DEGRADED-BY-DESIGN, degradation proof count now five. |
| PT10M timer on the gate | Event_GateTimeout fires after 10 min unattended, escalate path runs, boundary catch-alls swallow any connector failure | **FIRED** (e2b9e3d8). Ten minutes unattended, timer took the escalate path on its own, both message branches terminated, End_Escalated. Trace in finale/maestro/. |

1.0.8 (adds the policy task) smoke result, filled: Task_PolicyRule terminated in ~1s
(defect #5 reproduced same-folder) and Boundary_RuleErr CAUGHT it; gate cleared clean on
approve. Then posting-prep failed post-gate WITHOUT its boundary firing; instance faulted
and was cancelled. Twin corrected-ending proof remains 1.0.7 (3aed9118). Net: the twin is
the roadmap exhibit; do not demo it.

**DEMO INSTANCE FOR TOMORROW: RECOMMENDED = CANVAS 1.0.6** (battle-tested ten times, DUMP
choreography unchanged, gate waits indefinitely). The twin 1.0.8 is the roadmap-live
exhibit: show the timer-fired trace and the three-branch gate as a 20-second beat or in
Q&A. VB may override to twin at rehearsal ONLY if both rehearsal runs on the twin go green;
if the twin demos, the gate self-escalates at 10 minutes, so the approve beat must land
within ~7 minutes of the gate arming, and the STORYCRAFT beat-3 twin variant line applies.

Twin gate messages (only difference from canvas is the folder key):

```bash
uip maestro bpmn instance message send -f 7ca50286-caae-4746-a228-c293e65bfd83 \
  --inputs '{"name":"ApproveGate","reference":"<PO>","itemData":{"decision":"approve","note":"Accept the proposed correction."}}'

uip maestro bpmn instance message send -f 7ca50286-caae-4746-a228-c293e65bfd83 \
  --inputs '{"name":"EscalateGate","reference":"<PO>","itemData":{"decision":"escalate","note":"Rejected by reviewer."}}'
```

### 1.3 Deck paste-up

- [ ] Take `finale/DECK-FINAL.md` (drafted by the deck agent) and paste it onto the official
      finale template slide by slide. No re-writing during paste-up: wording is locked in the md.
- [ ] Export a PDF copy to the second device (bottom rung of the fallback ladder).

### 1.4 Test Manager: click in the 12 eval cases (about 10 minutes)

The v2 API rejects test-case creation (all routes 404), so this is a UI task. Project:
**Exchange Recon - Agent Evals** (prefix RECON, id `3dcc9b9e-8719-0100-48a7-0b49ea40aef1`).
Create 12 test cases with these exact names, ready to paste:

Matching (3):
1. `Two supplier lines, both match` (PASS 1.00)
2. `Supplier has an extra line not on the PO` (PASS 0.85)
3. `Supplier references only one of the two PO items` (PASS 0.85)

Variance (6):
4. `Clean match - supplier equals the PO` (PASS)
5. `Price variance only - item 10 priced 10% high` (PASS)
6. `Over-delivery only - item 20 quantity 5 to 6` (PASS)
7. `Under-delivery - item 20 quantity 5 to 4` (PASS)
8. `Both variances - price + over-delivery (the demo case)` (PASS)
9. `Tolerance boundary - item 10 priced 1.6% high (inside 2%)` (PASS)

Posting-prep (3):
10. `Approved over-delivery: update OrderQuantity 5 to 6` (PASS)
11. `Approved price: update NetPriceAmount 25.00 to 27.50` (PASS 0.90)
12. `Ambiguous instruction: must return not-ready-to-post` (PASS)

- [ ] All 12 created and marked passed, matching the project description (12/12).

### 1.5 Rehearsals

- [ ] Rehearsal 1: full 5-minute run against the clock, out loud, screens live.
- [ ] Break (at least 30 minutes, do something else).
- [ ] Rehearsal 2: full run again. First 35 seconds and last 35 seconds word for word.
- [ ] Failure drill (once): mid-run, kill the browser window and cut to the backup video on
      the second device INSIDE 10 SECONDS, narrating over it without apologising. Time it.

### 1.6 Sleep

- [ ] Actually sleep. The checklist runs tomorrow; you only run the talking.

---

## 2. T-MINUS-60 (one hour before slot)

### 2.1 Auth: refresh login AND rewrite every agent .env token (per-folder token gotcha)

```powershell
uip login refresh
```

Then paste the fresh access token into all three agent .env files (tokens are folder-scoped
and stale ones fail exactly at showtime):

```powershell
$token = "<PASTE_FRESH_TOKEN>"
foreach ($a in "matching-agent","variance-agent","posting-prep-agent") {
  $f = "C:\KaarTech UK\Hackathons\UiPath AgentHack\exchange-recon-cockpit\$a\.env"
  (Get-Content $f) -replace '^UIPATH_ACCESS_TOKEN=.*', "UIPATH_ACCESS_TOKEN=$token" | Set-Content $f -Encoding utf8
}
```

- [ ] `uip login refresh` clean against staging/hackathon26_751
- [ ] All three `.env` files carry the fresh token

### 2.2 Platform state checks (portal)

- [ ] Folder ExchangeReconCanvas (fid 3252146): release `ExchangeReconBpmn` still 1.0.6,
      Processes page shows only the expected curated rows (confirm the exact count at rehearsal tonight and write it here: ___). If anything NEW appeared since rehearsal,
      note it, do not "fix" it now.
- [ ] Assets in ExchangeReconCanvas: all four `SAP_MCP_*` assets present
      (`SAP_MCP_URL`, `SAP_MCP_TOKEN_URL`, `SAP_MCP_CLIENT_ID`, `SAP_MCP_CLIENT_SECRET`).
- [ ] Maestro instances view: cancel anything parked at a gate or running. Completed
      trophies refuse cancel; leave them, they are the evidence.
- [ ] NO uip CLI update, no matter what the tool suggests. 1.197.1 is the finale version.

### 2.3 Prove the SAP path with one live read

```powershell
cd "C:\KaarTech UK\Hackathons\UiPath AgentHack\exchange-recon-cockpit\variance-agent"
uv run python ../scripts/po_lookup.py 4500000021
```

Exit 0 with the item table (item 10 at 25.00, item 20 quantity 5) = the live S/4HANA cloud
tenant path is proven for today. Fallback probe if that errors:

```powershell
uv run python ../scripts/claude_sap_tester.py
```

- [ ] Live read green. If red: do NOT debug at T-60 beyond the .env token rewrite above;
      move the demo posture one rung down the ladder now.

### 2.4 Stage and hygiene

- [ ] Browser: notifications off (Windows Do Not Disturb ON), zoom preset checked on the
      Orchestrator instance view, ONE window, only the tabs the run needs, clean desktop,
      cursor size up (Settings > Accessibility > Mouse pointer and touch).
- [ ] Wired mic plugged in and selected as input.
- [ ] Second device: backup video cued at 0:00, volume tested, plugged into power.
- [ ] Notepad staged with, in order: demo input JSON (section 1.1), ApproveGate message,
      EscalateGate message, spare-PO input JSON (section 3), spare-PO escalate message.
- [ ] Printed: DUMP section 10 choreography table
      (`finale/2026-07-21-grounded/DUMP.md`) and `finale/backups/COMPOSED-RUN-STEPS.md`.

---

## 3. T-MINUS-10 (smoke, then commit to a posture)

Start a smoke run on the spare PO and drive it to a terminal state. Escalate to close.
NEVER leave an instance parked at the gate this close to the slot.

1. Portal start (same as demo, spare payload):

```json
{"purchaseOrder":"4500001681","supplierDocument":"Supplier invoice INV-90402, ref PO 4500001681, GBP. Line 1: Material 1891 1 PC at 3300.00 per ea."}
```

2. When it suspends at the gate, close it out via escalate (terminal at End_Escalated):

```bash
uip maestro bpmn instance message send -f e3945ea1-de36-4504-bf98-dc6503edc87f \
  --inputs '{"name":"EscalateGate","reference":"4500001681","itemData":{"decision":"escalate","note":"Pre-slot smoke, closing out."}}'
```

(If {{DEMO-INSTANCE-DECISION}} chose the twin, run this smoke in the twin folder key
`7ca50286-caae-4746-a228-c293e65bfd83` instead.)

- [ ] Smoke reached a terminal end state, nothing left parked.
- [ ] GREEN: demo is live-primary. RED: switch to recorded-primary per the fallback ladder
      and decide NOW, out loud, before walking in. No live-vs-recorded decision happens on
      stage.

---

## 4. SHOWTIME anchors (the five things that keep 5:00)

1. **0:20 - start the instance and say you are doing it.** "It takes about three minutes,
   so let me tell you why it is built this way while it runs." The gate waits for you: on
   canvas it suspends indefinitely. If the twin was chosen instead, it waits ten minutes
   and then escalates on its own (say it as a feature: governed even in absence), so the
   approve beat must land within ~7 minutes of the gate arming; do not pre-start a twin
   instance and park it.
2. **2:35 - the PO-side reveal. SLOW DOWN.** The agent was handed only the supplier's
   numbers; it is reporting net price twenty-five pounds, order quantity five. There is
   exactly one way it knows that: it read S/4HANA at runtime. This is the beat the room
   decides on. Do not rush past it.
3. **3:00 - the approve beat, honest line (DUMP branch note, updated).** Send the gate
   message and say: "In production this gate is an Action Center task so the approver's
   identity is attached. Action Center is not provisioned on this tenant, so today the
   decision is a correlated message on the purchase order; it does not check my role, and
   I will not pretend otherwise." Volunteering the exact boundary of your own governance
   is worth more than the feature.
4. **15-second stall rule.** Any screen stalls past about 15 seconds: "the tenant is slow
   right now, let me show you this exact run", cut to the recording, narrate as if live,
   do not apologise twice. Auth failure at start: no debugging on camera, straight to the
   recording ("the token is per folder and mine has expired, here is the run from this
   morning").
5. **Hold 4:50 to 5:00.** Land the close at 4:50 and stand in the buffer. Do not fill it.

Standing prohibitions on stage: never attempt the write-back (it is HELD by design and that
is the point), never demo fraud, duplicate or goods-receipt cases, never use the banned
matching phrase (see vocabulary lock).

---

## 5. Q&A CARD

**Form:** answer first, 20 to 40 seconds, then stop. If a question smuggles a false premise,
correct the premise in one sentence before answering; never build on a wrong premise.

**Vocabulary lock (applies to every spoken and written word):**
- Never the classic three-word invoice-matching phrase. Say "reconciling the invoice
  against the purchase order and receipt" or "invoice-to-PO reconciliation".
- "Live S/4HANA cloud tenant", never "production ERP".
- "Six-PO campaign, both gate branches", never "at volume".
- Write-back is HELD by design (a capability with the pen lifted, not a gap).
- The reference customer is only ever "a UK adventure travel group".
- No rival or finalist project or team names, ever, even when praising.

**Prepared answers:**

- **"What would you build next?" / dunning on the spine:** Dunning rides the same spine.
  The governed spine (deterministic checks below, agents reasoning only where determinism
  runs out, a person holding the only pen) does not care which exception class flows over
  it. Supplier invoice variance is the proof; dunning and payment-run exceptions are the
  next classes on the same BPMN spine. Deployment is a configuration delta, not a rebuild.

- **"Why no Action Center task at the gate?"** By entitlement, not by design: the Actions
  service is not provisioned on this tenant (the Task API returns 404, service not found
  in the organization). So the gate is a message-correlated suspension on the Maestro
  instance, and I say so on stage rather than simulate an approval surface. The BPMN is
  Action Center-ready the day the entitlement exists. (Other teams in this hackathon reported the
  same tenant limit publicly; do not name them.)

- **"Where is the audit trail?" / Data Service:** Data Service is also not provisioned
  (404), so the queryable-ledger idea was cut. The audit story is the `recon-evidence`
  storage bucket: 21 artifacts, every run reconstructable after the fact, plus the Maestro
  instance history itself.

- **"How do you know the agents are right?" / Test Manager:** Twelve of twelve eval cases
  pass across the three agents (matching 3, variance 6, posting-prep 3), ground truth
  model-validated against the live S/4HANA cloud tenant, documented as the Test Manager
  project "Exchange Recon - Agent Evals".

- **"What did you add to the BPMN last?" / next elements:** On the twin solution (1.0.7):
  a PT10M timer branch on the human gate (Event_GateTimeout routes to the escalate path,
  so an unattended gate escalates instead of hanging forever), plus Gmail and Slack send
  tasks on that escalate path, each wrapped in catch-all boundary error events so a
  connector failure can never block the flow. The connection bindings were hand-authored
  and resolved with `uip solution deploy config link`, which is a positive product
  finding: the binding class that would not resolve for agent release keys does resolve
  for connections via deploy config.

- **"Why did the borderline case go to the human?" / auto-clear:** The auto-clear ending
  is designed and parked behind a filed platform defect; the default is conservative on
  purpose: borderline goes to the human. (Never claim the auto-clear branch ran. It did
  not.)

- **"Can it write to SAP?"** The agents have no write tool at all; that is the tool
  contract, not a prompt promise. The only write path is a separate deterministic step a
  human authorizes, and it is HELD by design in this build.

---

## 6. POST-FINALE (explicitly NOT tomorrow)

- [ ] Rotate the XSUAA client secret (BTP cockpit: regenerate the service key, update the
      agent `.env` files and the folder `SAP_MCP_CLIENT_SECRET` asset; nothing committed).
- [ ] Flip the repo public at submission time:
      `github.com/vigneshbarani24/exchange-recon-cockpit`.
- [ ] People's Choice forum nudge: post the write-up once, then spend no more time on it.
- [ ] BEFORE the repo public flip: scrub the customer name from every committed file
      (rule-mentions in strategy docs count; run: git grep -il the three client names and
      rewrite each hit to "a UK adventure travel group"). The flip does not happen until
      that grep comes back empty.
