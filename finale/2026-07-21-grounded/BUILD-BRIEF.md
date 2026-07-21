# BUILD-BRIEF.md

What gets built before July 23, triaged by risk against score. Read `TRUTH.md` first.

**The governing rule: stability beats features.** The demo runs on a composed Maestro
instance that first went green at 06:43 UTC on 2026-07-21. Package
`ExchangeReconSolutionCanvas.Agentic.ExchangeReconBpmn:1.0.5` is now a frozen artifact.
Nothing in this brief may destabilise it. If any action here conflicts with the codebase,
the codebase wins; flag the conflict rather than forcing the brief.

---

## P0: do these first, today, before anything else is touched

### 1. Record the backup video from the green path
Nothing else happens until this exists. Screen capture of the composed instance running: the
three agent jobs, the deterministic gate, the suspend at the human gate, the approve, the
held correction, End_Corrected. Subtitled, under 90 seconds of actual demo. This is
simultaneously the finale fallback and the Devpost demo asset. It is also insurance against
every other item in this brief going wrong.

### 2. Freeze 1.0.5
Tag it, note the instance and job IDs alongside it, and do not deploy over it. Any further
BPMN work happens as a new version in a copied solution folder, never in place.

### 3. Correct the stale docs
These currently contradict reality and a judge reading the repo will find them.

| File | Fix |
|---|---|
| `finale/VERIFIED-STATE.md` | Add a banner pointing to `2026-07-21-grounded/TRUTH.md`. Its run-1 caveat and its "only claim three-agents-in-one-instance if a completed run shows `Task_PostingPrepAgent` with a job key" is now satisfied: job `c1ee53ae`. |
| `finale/DEMO-RUNBOOK.md:39` | "Never: try the 3-agent Maestro run live (it can't complete)" is false. Banner it as superseded by `SCRIPT.md`. |
| `finale/QA-BANK.md:64,76` | Both assert the composed instance never ran. Superseded by `QA.md`. |
| `finale/QA-BANK.md:54` | Says 200 invoices a month. It is a week. |
| `finale/DECK-CONTENT.md` slide 5 | Labels the Maestro spine BUILT. It is LIVE. |
| `finale/RUBRIC-MATCH.md` | Re-score Platform Usage to 5 and Technical Execution to 4.5 per `TRUTH.md`. |

### 4. README coding-agent section
The rubric grants the full 2 bonus points for a dedicated README section naming the tool,
describing its contribution, and evidencing substantive integration. Write it. Name Claude
Code through UiPath for Coding Agents, describe what it authored (coded agents, BPMN
bindings, MCP client, cockpit), and link the commit history. `CODING-AGENTS.md` already
exists and has two falsifiable rows to fix first: it cites `src/lib/demoData.ts` and a
`VITE_DEMO_FALLBACK` flag that do not exist in the code. Correct or delete those rows before
a judge opens the file.

**Highest-value single line for that section:** the coding agent's best work was not writing
code, it was diagnosing why every hand-authored BPMN faulted at runtime with unresolved
`releaseKey` and `folderId` bindings, which took five CLI variants to isolate and was
ultimately fixed by round-tripping through the Studio Web canvas. That is a real
engineering narrative, not a productivity claim.

---

## P1: the governance evidence sheet

One page in the repo that converts asserted governance into inspectable governance. This is
the direct answer to the two rivals who beat this project on provable controls, and it is
the artifact Taqi Jaffri is most likely to want.

Contents:
1. The exact read-only line from each agent's system prompt, quoted.
2. The code path proving the only write is the quarantined non-agent executor
   (`post_correction.py`), and that no agent binds a write tool.
3. The deterministic gate constants as they appear in `Task_Tolerance`:
   `priceTolerancePct = 2.0`, `qtyTolerance = 1.0`.
4. The three composed-instance job keys with timings, plus the two instance IDs.
5. **One documented negative test.** Prompt an agent to write the correction to SAP and
   capture that it has no write tool bound and refuses. A single reproducible negative test
   moves the claim from asserted safety to tested safety, which is the emerging bar in this
   field.

Cost: an hour. Score impact: Platform Usage and Technical Execution, and it pre-empts the
hardest Q&A question.

---

## P2: the Teams-native human gate. DESIGNED, DECISION HELD.

VB has not called this yet. It is specified here so it can start the moment he does, and so
the deck works either way.

### Why it is worth doing
Three separate wins from one change. It closes the one honest weakness in the governance
story, which is that the gate does not know who approved. It answers Adoption Potential
directly, because approval queues that live in a tool nobody has open are approval queues
that age. And it adds Integration Service or API Workflows to the platform surface, which the
Platform Usage criterion names explicitly.

### Why it is dangerous
It touches the only thing that just started working, forty-eight hours out, and it depends on
two systems outside this repo.

### The design

The gate itself does not change. `ExchangeReconBpmn.bpmn:192-226` already races two message
catch events off an `EventBasedGateway`: `ApproveGate` and `EscalateGate`, both correlated on
`Reference = purchaseOrder`. **That is already a two-button approval card.** Run 3 proved the
race works: `Event_Approve` completed and `Event_EscalateMsg` was Terminated by the gateway.

```
Task_VarianceAgent
   |
   +--> Task_NotifyTeams          [NEW, the only BPMN addition]
   |      posts an Adaptive Card carrying:
   |        PO, supplier vs PO values read live from S/4,
   |        variance category, confidence, proposed correction,
   |        a note input, and two buttons
   |
   +--> GW_HumanWait               [UNCHANGED]
          |-- Event_Approve     (ApproveGate)   <-- "Approve" button
          '-- Event_EscalateMsg (EscalateGate)  <-- "Escalate" button

Return leg:  card submit -> Power Automate -> Maestro instance message API -> instance resumes
```

The message payload the return leg must send, matching what run 3 already accepted:
`{"name":"ApproveGate","reference":"<PO>","itemData":{"decision":"Approve","note":"<text>","approver":"<UPN from Teams>"}}`

**The `approver` field is the entire governance upgrade.** It is what lets you stop saying
"the gate does not verify who approved".

### What must be verified before writing any code, not guessed

1. **The outbound activity type.** Maestro script tasks are sandboxed JavaScript and almost
   certainly cannot make outbound HTTP calls, so `Task_NotifyTeams` needs a real activity.
   The candidates are an Integration Service Microsoft Teams connector activity, an API
   Workflow invoked as a service task, or a generic HTTP activity if one is registered.
   **Consult the `uipath:uipath-maestro-bpmn` skill registry for what is actually
   available.** Do not invent an activity type; that is how the last two days were lost.
2. **The Maestro instance-message REST route and its auth scope.** The CLI does it, so the
   API exists. Confirm the exact route and the external-app scope before wiring Power
   Automate to it.
3. **Whether the Power Automate HTTP action needs a premium connector** in this tenant.

`scripts/notify_teams.py` already posts Adaptive Cards through a Power Automate incoming
webhook, so the outbound half is proven mechanically. The card body and the return leg are
the new work.

### Rules if it goes ahead
- Build as `1.0.6` in a **copy** of `ExchangeReconSolutionCanvas`. Never in place.
- The notify task is feature-flagged and wrapped so a Teams failure cannot block the flow. A
  card that fails to post must not stop a governed process.
- **Hard cutoff: end of July 22.** If 1.0.6 is not green by then, ship 1.0.5 and the Teams
  gate becomes a roadmap slide with working code behind it. That is a perfectly good
  outcome and it is not a defeat.
- The live demo stays on whichever version is green. A recording of the Teams round-trip is
  a fine substitute for doing it live.

---

## P3: worth doing if the time exists

**Open-source UiPath skills for Claude Code.** Package what was learned into two or three
skills in a separate public repo: `uipath-maestro-bpmn`, `uipath-langgraph-agent`,
`sap-odata-mcp`. A `SKILL.md` each, a README crediting UiPath for Coding Agents. This is
coding-agent bonus evidence, community-vote material and product-feedback substance in one
artifact. **It must not touch this repo's demo path.**

**Submit the product feedback form.** The binding-resolution failure documented in
`finale/maestro/README.md` is genuinely useful, specific product feedback: the CLI packer
requires binding-backed `name` and `folderPath` on `StartAgentJob` and forbids literal
`releaseKey` and `folderId`, yet nothing in the CLI pack and deploy path resolves those
bindings, so every deployed version faults at runtime with 170005. Five CLI variants proved
it; the Studio Web canvas round-trip fixed it. That is worth a prize and costs thirty minutes.

---

## DO NOT. Push back if asked again.

1. **Do not attempt the SAP write-back.** It depends on an upstream MCP JSDOM fix outside
   this project's control. Armed and not fired stands, and it is the better story anyway.
2. **Do not build supplier-invoice attachment.** The connector exposes no supplier invoice
   service. It would be a mock wearing a live badge, and the honesty tiering is this
   project's actual moat.
3. **Do not add mail notification.** Second new external surface in forty-eight hours for
   marginal points. The Teams card covers the notification story.
4. **Do not build the four uncoded scenarios.** Invoice-before-goods-receipt, duplicate
   block and vendor bank-change fraud have no implementation. They are roadmap and they are
   fine as roadmap.
5. **Do not refactor anything.** Not the cockpit, not the agents, not the BPMN beyond the
   single notify task if P2 goes ahead.
6. **Do not deploy over 1.0.5.**

---

## Ordered checklist

- [ ] Record the backup video from the green composed run
- [ ] Freeze and tag 1.0.5 with its instance and job IDs
- [ ] Banner the six stale docs listed in P0.3
- [ ] Fix the two falsifiable rows in `CODING-AGENTS.md`
- [ ] Write the README coding-agent section
- [ ] Write the governance evidence sheet including the negative test
- [ ] Rebuild the deck from `DECK.md`, fixing slide 5 from BUILT to LIVE
- [ ] Rehearse `SCRIPT.md` to 4:50, five times, timed
- [ ] Drill the three changed answers in `QA.md`
- [ ] Rotate the SAP XSUAA secret
- [ ] DECISION: Teams gate, yes or no, by end of July 21
- [ ] Submit the product feedback form
