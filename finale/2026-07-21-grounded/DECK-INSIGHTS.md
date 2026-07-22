# Deck Insights: what this session proved (2026-07-21)

Source of truth for deck filling. Everything below is verified, on the tenant, and safe to say
on stage, EXCEPT rows carrying a {{PLACEHOLDER}}, which wait on the 1.0.7 smokes.
Companion to DUMP.md. No em dashes in anything copied to slides. Never name the match by
document count; always "invoice to PO reconciliation". No customer names anywhere: the travel
client is referred to only as "a UK adventure travel group".

## 1. The trophy run (slide 5: BUILT becomes LIVE)

- Instance `2db6d4d8`, Shared/ExchangeReconCanvas, package 1.0.5, deployed 1.0.6.
- End to end: **2 minutes 56 seconds**, human gate included.
- Step timings: matching agent 45-60s, tolerance check 1.1s, variance agent verdict **57s**,
  posting-prep 46s. Gate suspends the instance and waits indefinitely (observed 20s to 6 min).
- Agent job keys on the trace: fdbb41a2 (matching), ebee41c4 (variance), c1ee53ae (posting-prep).
- The line: "the flow does three minutes of work, then stops and waits for a human signature.
  It will wait forever. That is the point."

## 2. Volume proof, not a one-off

- **10 completed governed instances across 6 live purchase orders**, both gate branches
  exercised: corrected x3 (2db6d4d8, fe234790, 876cae63), escalated x6 in the canvas manifest
  (61c79659: GBP 3,000 + 10% price breach; 8e9faa84: EUR under-delivery), plus the twin
  approve proof (927adc24) in the Teams folder. Know the split: the shipped manifest holds
  nine; the tenth lives in the tenant's Teams folder, and tonight's twin runs sit on top.
- All reads against live SAP S/4HANA (my405139) over MCP with fresh XSUAA per run. No mocks.

## 3. Evals with an independent model tester

- 12/12 eval cases pass (uipath eval, LLM judge gpt-4o).
- **Claude acted as one of the testers**: validated ground truth directly against live SAP over
  the same MCP the agents use. Baseline PO 4500000021: item 10 RM27 50 @ 25.00, item 20 RM16
  5 @ 2.00 GBP, net GBP 1,260.
- Honest boundary stated in CLAUDE-TESTER-VALIDATION.md: portal eval reporting blocked for
  CLI-published agents (defect #4), results live in repo + evidence bucket instead.

## 4. Evidence is a bucket, not a slide

- Storage bucket `recon-evidence` (Shared/ExchangeReconCanvas): **21 artifacts** in
  evals/ maestro/ policy/ receipts/ runs/ test-sets/.
- The line: "every decision is reconstructable afterwards. Law 3 is a bucket, not a slide."

## 5. Five platform defects filed (Best Product Feedback play)

1. Binding resolution: CLI pack/deploy never resolves agent release bindings for hand-authored
   BPMN, runtime 170005; packer simultaneously forbids literal releaseKey/folderId.
2. Script-task output path: auto-approve gateway condition unreachable in every legal shape.
3. Intsvc.UnifiedHttpRequest: "'Method' is required" in all three documented input shapes.
4. Eval portal reporting requires UIPATH_PROJECT_ID; impossible for CLI-published coded agents.
5. Orchestrator.BusinessRules task terminates sub-second with no incident, cross- and same-folder.

## 6. The war story (built with a coding agent, the +2)

- Two days blocked on what looked like capacity. Root cause found by the coding agent:
  **binding resolution, not capacity**. Fix: Studio Web canvas round-trip, which emits
  releaseKey bindings and registers agents as in-solution resources.
- Frame: Claude Code + UiPath CLI authored the BPMN, diagnosed the platform defect, ran the
  campaign, and validated the evals. The agent was a teammate on the platform, not a code typist.

## 7. Two artifacts, one narrative

- **ExchangeReconCanvas** (v1.0.6, frozen): the proven core. Demo runs here.
- **ExchangeReconTeamsNotify** (Shared/ExchangeReconTeams, now v1.0.12, see section 14): the
  enriched twin. Proven on v1.0.6: approve path green and boundary error resilience proved
  x3 on the notify leg (a notification outage can never block the gate); DMN policy
  InvoiceTolerancePolicy linked to the folder. Correction on the Teams card: the flow has
  never successfully delivered one (the notify task fails on the undocumented runtime
  carrier, findings 3 and 12); the card that demos is sent by the ops script and is
  labeled as such. v1.0.7 through v1.0.12 add the timer, both-ending notification fan-out,
  and policy task rows tracked in section 14.
- The line: "the roadmap is not a slide either. It is already deployed, in its own folder."

## 8. The thesis (Card A)

- "Reasoning is real. Authority is the problem."
- Three layers: **humans sign, agents advise, determinism decides.**
- SAP write-back is HELD by design; agents have no write tools bound. Never demo write-back.
- Closer: "AI is the new RPA, and it needs the same discipline RPA got."

## 9. Policy as a finance-owned artifact (Card B)

- DMN InvoiceTolerancePolicy: price tolerance 2%, quantity tolerance 1 unit,
  four-eyes threshold GBP 25,000, hit policy FIRST, else auto-clear.
- The line: "finance changes the thresholds without a deployment."
- Execution note: the policy is a linked, finance-owned ARTIFACT today; the in-flow policy
  task is wired in the twin 1.0.8 and pending its smoke, and the auto-clear ending the
  table describes is parked behind the filed script-output defect. Present it as the
  policy artifact plus the conservative default, never as a running auto-clear.

## 10. Value cards (anonymized)

- Refiner case: $5.7M class of loss this pattern addresses.
- A UK adventure travel group: ~200 invoices a week through exactly this gate.

## 11. Platform depth chips (12 surfaces, deliberate)

Maestro BPMN, coded agents (LangGraph), Orchestrator assets, storage buckets, business rules,
message events / HITL gate, boundary error events, script tasks, eval framework, Integration
Service registry, REST API operations, solution lifecycle via uip CLI.

## 12. Demo choreography anchors (DUMP section 10)

- Start instance at 0:20 of the 5-minute slot; it finishes agent work while you talk.
- Gate wait is the dramatic beat, not dead air.
- Fallback ladder exists (COMPOSED-RUN-STEPS.md); demo path is 100% reliable or it is not shown.

## 13. Field positioning (finalist field announced, 31 across 3 tracks; 11 in this track)

- The opening sentence no other finalist can say: "No other finalist has shown agents
  reasoning over a live third-party system of record at runtime: real SAP S/4HANA, read over
  MCP, by agents that are structurally incapable of writing back on their own." (Claim what
  was shown, not what exists; that version survives any probe.)
- Three beats that flip the submission-time weaknesses into offense:
  1. The submission said plainly that the composed run did not complete green, and that we
     would not dress it up. Since then it completed ten times across six live purchase
     orders, both endings. Close that loop on stage: honesty first, then the finish. It is
     the strongest single credibility beat available.
  2. Most of the field treats evaluation as a roadmap slide. Here it is done: twelve of
     twelve eval cases passing, with ground truth independently validated against the live
     tenant by a second model acting as a tester.
  3. Governance across the field is mostly a prompt promise ("the agent never decides").
     Here it is structural: no write tools bound, a deterministic tolerance gate, a human
     message gate, a finance-owned DMN policy artifact, and a 21-artifact evidence bucket.
- Field patterns worth matching: every strong finalist opens with a named quantified pain
  and one dramatic time-compression number. Ours exist: 2 minutes 56 seconds governed
  end-to-end, 57 second agent verdict, and the value cards in section 10.
- Field pattern to respect: the strongest rivals carry one crisp ROI one-liner. Ours must be
  stated in analyst-hours on the judgment step and labeled as modeled; a labeled model reads
  as credible, an unlabeled number reads as inflated.
- Write-back stance is a differentiator, not a gap: rivals claim autonomy; this project
  proves restraint. "Armed, not fired" is the line judges on governance and quality reward.
- Rules fact verified 2026-07-21, load-bearing for the deck: the coding-agent bonus is
  applied "within the Platform Usage criterion in both Phase 1 and Phase 2 judging", and in
  Phase 2 "the judging panel will apply the same bonus on the same scale". The +2 is
  RE-EARNED in the finale, not banked from submission. The build story (binding-resolution
  diagnosis, CODING-AGENTS.md, commit trail) must get an explicit on-screen beat in the live
  presentation. Scale: 2 = documented + evidence + meaningfully integrated.
- Rules fact verified 2026-07-21: community votes "do not influence the judges' scores";
  People's Choice is a standalone award. Forum push is worth one time-boxed nudge, nothing
  more. Max two prizes per project: one track or overall prize plus one special award.
  Realistic special-award targets: Best Demo / Presentation, and Best Product Feedback
  (the five filed defects).

## 14. T-1 build results (2026-07-22 evening)

### The enriched twin shipped as 1.0.7

- ExchangeReconSolutionTeams deployed as **1.0.7** to Shared/ExchangeReconTeams
  (deployment ExchangeReconTeams, ActivationStatus SuccessfulActivate).
- What it adds on top of the proven core:
  1. **SLA timer on the human gate**: a PT10M timer branch (Event_GateTimeout), designed to
     take the escalate path on its own if no human answers within ten minutes. The gate now
     has a service level, not just patience. Proven so far: the timer branch armed and was
     cancelled cleanly when approve won the race (approve smoke below); its self-fire is
     {{SMOKE-TIMER}}.
  2. **Gmail escalation leg**: Integration Service SendTask (activity SendEmail, connection
     linked) emails the owner on escalate.
  3. **Slack escalation leg**: Integration Service SendTask (activity SendMessage) posts to
     #general on escalate.
  4. Both connector legs sit behind **catch-all boundary error events**: a Gmail or Slack
     outage can never block the flow. Same resilience pattern already proved x3 on the
     Teams leg.
- Smoke results (filled as verified):
  - Approve branch: **GREEN** on first attempt. Instance 3aed9118, all three gate branches
    armed at once, approve won, both losers terminated cleanly, End_Corrected. Trace
    committed at finale/maestro/twin-107-smoke-approve-element-executions.json.
  - Escalate branch: **GREEN to End_Escalated**. Instance 4139bdeb. Both connector legs
    terminated silently in about one second (no incident raised, itself a feedback data
    point) and both boundary events caught and routed onward. The Gmail and Slack legs are
    therefore DEGRADED-BY-DESIGN rows, and the graceful-degradation proof count rises to
    five. Trace committed alongside the approve trace.
  - Timer self-fire: **FIRED** (e2b9e3d8). Ten minutes unattended, the timer took the
    escalate path on its own, both message branches terminated, End_Escalated. Trace at
    finale/maestro/twin-107-smoke-timer-fired-element-executions.json. The line is earned:
    "the gate has a service level, not just patience."
  - Policy task (1.0.8 smoke, instance e387d1ec): Task_PolicyRule **terminated in one
    second, and Boundary_RuleErr caught it**; the flow continued through a clean
    three-branch gate. Defect #5 now has a same-folder reproduction AND a proven
    mitigation on the same trace. Present the policy task as: wired, terminates per the
    filed defect, degrades cleanly, policy remains the finance-owned linked artifact.
  - The earlier 1.0.8 posting-prep fault: RESOLVED, and it was never the flow. The smoke
    harness fed one purchase order a supplier document written for a different one; the
    matching agent correctly matched nothing, and a downstream input indexing the first
    matched line failed on the empty list (error 400300). Rerun with correctly paired
    data: **1.0.8 GREEN end to end** (870263b2), policy task terminating and caught by
    its boundary, three-branch gate, approve, posting-prep completed, held update,
    End_Corrected. The lesson worth telling: the flow refused to make sense of nonsense.
    Side finding: an input-evaluation failure does not trigger the task's boundary error
    event (it fails before the task runs) — filed as feedback finding #11.
  - Demo instance choice: **CANVAS 1.0.6** stays the recommendation (ten proven runs, DUMP
    choreography unchanged, gate waits indefinitely). The twin is the roadmap exhibit
    with its own green: timer fired, policy absorbed, 1.0.8 corrected ending proven.

### Entitlement map (verified tonight, load-bearing for honesty)

- **Action Center / Actions: NOT PROVISIONED.** Task API returns 404, "Service: actions not
  found in Organization". Native HITL tasks and the external bridge are impossible here by
  entitlement, not by skill. The gate reviewer surface stays the Maestro instance plus the
  scripted honest line. Independently corroborated by other teams' public reports (no names
  in committed docs).
- **Data Service: NOT PROVISIONED** (404). The queryable-ledger idea is cut; the
  recon-evidence bucket (21 artifacts) remains the audit story.
- **Test Manager: AVAILABLE.** Project created: "Exchange Recon - Agent Evals", prefix
  RECON, id 3dcc9b9e-8719-0100-48a7-0b49ea40aef1. The v2 API rejects test-case creation
  (all routes 404), so the 12 eval cases go in via the UI (about 10 minutes of clicking).

### New positive product finding: bindings, part two

- Connection bindings for the Gmail and Slack legs were hand-authored and resolved via
  **uip solution deploy config link**. The same binding class that never resolves for agent
  releaseKeys (defect 1) DOES work for Integration Service connections through deploy
  config. A positive finding, and it sharpens defect 1: the mechanism exists and works for
  connections, so agent releases are the specific gap.

### Late-evening round two: fan-out on both endings, and the carrier discovery

- The twin advanced to **1.0.12**: notification fan-out now sits on BOTH endings
  (approve: Teams card, Gmail, Slack after the held update; escalate: the same trio after
  route-to-buyer), every leg behind its own boundary. Two more green completions
  (26194c64 on 1.0.10, 21230b01 on 1.0.12) with every dead leg degrading cleanly. The
  graceful-degradation count is now in double digits across the night.
- The policy task now receives REAL computed numbers (price variance 10, quantity 1,
  line value 1375, visible in the instance variables view) via inline expressions that
  route around the dead script outputs, and the wrapper still rejects them with a 400.
  The variables view showing correct arguments beside the rejection is the strongest
  product-feedback screenshot in the kit (instance 21230b01). Feedback file now carries
  15 findings.
- Honest status for the deck's notification rows: designed, deployed, boundary-shielded,
  blocked by an undocumented runtime carrier (context fields do not reach the runtime;
  the working carrier shape for connections is undocumented). The one notification that
  works today remains the webhook card sent by the ops script, clearly labeled as such.
- Do not claim on stage that the flow sends Teams/Gmail/Slack today. The claim that is
  true and strong: the flow closes both endings with notification hooks armed and a
  proven property that no notification failure can ever block governance.

### Deck consequences

- The status table gains rows for the twin elements: SLA timer, Gmail leg, Slack leg,
  policy task, each marked deployed with smoke outcome pending the placeholders above.
- The honest line for the gate stays exactly as scripted: Actions is absent by entitlement,
  the Maestro instance is the reviewer surface, and saying so plainly is the credibility
  beat.
- The Test Manager row becomes claimable once the 12 cases are entered via the UI
  (pending, about 10 minutes of clicking; API entry impossible, all v2 routes 404).
- The feedback story grows from five findings to **eight**: the five filed defects, plus
  the Test Manager v2 API gap, the CLI auto-updater failure (core 1.197.1 works, updater
  cannot reach 1.198), and one positive: connection bindings resolve via deploy config link
  while agent releases still cannot.
- Hard rule for tomorrow: no CLI updates before the finale. Canvas (1.0.5, deployed 1.0.6)
  stays frozen as the guaranteed demo floor.


## 15. The final night result (2026-07-22, late): the flow speaks

- Twin at 1.0.16, canvas-wired via Studio Web round-trip (the same cure as June, now
  proven a second time as the platform law: executable config for connector, HTTP, and
  rule tasks is canvas-generated; no hand-authored XML can supply it).
- Instance 6b2ecc38 (approve): Teams card and Slack message SENT BY THE FLOW, End_Corrected.
  First flow-sent notifications in the project's history.
- Instance 1021b02a (escalate): Teams card, Gmail email, and Slack message ALL SENT BY THE
  FLOW, End_Escalated. Full notification sweep on one ending.
- Status rows for the deck: Teams card from the flow LIVE both endings; Slack LIVE both
  endings; Gmail LIVE on escalate (approve-path task one field off, boundary covers it);
  SLA timer LIVE (fired twice unattended); policy task CLOSED as platform defect with the
  double-wrap capture (tolerance verdict visible in the trace, rule receiving nulls from
  broken mappings, and real values rejected when smuggled in).
- Script-task law learned twice tonight: bare variable references fault after a canvas
  republish; the throw-proof pattern (typeof guards plus key normalization) is now in the
  tolerance and held-update scripts.
- Action Center: service ENABLED by VB at the Admin level (was never entitlement-blocked,
  only unprovisioned). Inbox live; task creation gated behind an Action App, now a named
  one-artifact next step. Reword the entitlement answer accordingly.
- Business-value tie: Insights is provisioned; the night's 40+ agent jobs feed its
  out-of-box dashboards by morning. Measured outcome metrics for the value slide:
  2:56 governed end-to-end, 57s agent verdict, ~2s flow-sent notification latency,
  gate SLA 10 minutes, ~5.5 modeled analyst-hours/week reclaimed on pilot volumes.
- Demo decision: canvas remains the recommended floor. The twin now holds two consecutive
  1.0.16 greens WITH live notifications; per the checklist rule, VB may promote it at
  rehearsal only after two more greens, accepting the 7-minute approve window.
