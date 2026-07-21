# Deck Insights: what this session proved (2026-07-21)

Source of truth for deck filling. Everything below is verified, on the tenant, and safe to say on stage.
Companion to DUMP.md. No em dashes in anything copied to slides. Never say "three way match".
No customer names: Travelopia is "a UK adventure travel group".

## 1. The trophy run (slide 5: BUILT becomes LIVE)

- Instance `2db6d4d8`, Shared/ExchangeReconCanvas, package 1.0.5, deployed 1.0.6.
- End to end: **2 minutes 56 seconds**, human gate included.
- Step timings: matching agent 45-60s, tolerance check 1.1s, variance agent verdict **57s**,
  posting-prep 46s. Gate suspends the instance and waits indefinitely (observed 20s to 6 min).
- Agent job keys on the trace: fdbb41a2 (matching), ebee41c4 (variance), c1ee53ae (posting-prep).
- The line: "the flow does three minutes of work, then stops and waits for a human signature.
  It will wait forever. That is the point."

## 2. Volume proof, not a one-off

- **10 completed governed instances across 6 live purchase orders**, both gate branches exercised:
  corrected x3 (2db6d4d8, fe234790, 876cae63), escalated x7 as scripted
  (61c79659: GBP 3,000 + 10% price breach; 8e9faa84: EUR under-delivery).
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
- **ExchangeReconTeamsNotify** (Shared/ExchangeReconTeams, v1.0.6): the enriched twin.
  UiPath-native Teams card sent BY the flow (not a local script), approve path green,
  boundary error resilience proved x3 (a Teams outage can never block the gate),
  DMN policy InvoiceTolerancePolicy linked to the folder.
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
